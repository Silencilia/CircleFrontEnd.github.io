#!/usr/bin/env python3
"""
Generate project documentation using OpenAI API
Can be run from any directory - will auto-detect project root
"""
import os
from pathlib import Path
from openai import OpenAI
from typing import List, Dict, Optional
from dotenv import load_dotenv
import sys

class DocGenerator:
    def __init__(self, root_path: Optional[str] = None):
        """Initialize with automatic project root detection"""
        if root_path:
            self.root = Path(root_path).resolve()
        else:
            self.root = self._find_project_root()
        
        print(f"Project root detected: {self.root}")
        
        # Load .env from project root
        env_path = self.root / '.env'
        if env_path.exists():
            load_dotenv(env_path)
        else:
            load_dotenv()
        
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables or .env file")
        
        self.client = OpenAI(api_key=api_key)
        self.skip_dirs = ['__pycache__', '.git', 'venv', 'env', '.venv', 'node_modules', 
                         'build', 'dist', '.tox', '.pytest_cache', '.next', '.cache', 
                         'chroma_db', '__pycache__']
        self.code_extensions = ['.py', '.jsx', '.js', '.tsx', '.ts']
        
    def _find_project_root(self) -> Path:
        """Find project root by looking for marker files"""
        current = Path.cwd().resolve()
        
        # Marker files that indicate project root
        markers = ['app.py', 'package.json', 'requirements.txt', '.git', 'social.py']
        
        # Search up to 5 levels up
        for _ in range(5):
            for marker in markers:
                if (current / marker).exists():
                    return current
            
            parent = current.parent
            if parent == current:  # Reached filesystem root
                break
            current = parent
        
        # If no marker found, use current directory
        print("Warning: Could not find project root markers, using current directory")
        return Path.cwd().resolve()
    
    def scan_project(self) -> Dict:
        """Scan project structure and code files"""
        structure = {
            'name': self.root.name or 'project',
            'dirs': {},
            'files': []
        }
        
        # Build directory tree - 包含所有文件类型
        all_files = []
        for ext in self.code_extensions:
            for path in self.root.rglob(f"*{ext}"):
                if not any(skip in str(path) for skip in self.skip_dirs):
                    all_files.append(path)
        
        # 也包含重要的配置文件
        for config_file in ['package.json', 'requirements.txt', '.env.example', 'README.md']:
            for path in self.root.rglob(config_file):
                if not any(skip in str(path) for skip in self.skip_dirs):
                    all_files.append(path)
        
        # 构建目录树
        for path in sorted(all_files):
            rel_path = path.relative_to(self.root)
            parts = rel_path.parts
            
            # Add to structure
            current = structure
            for part in parts[:-1]:  # directories
                if part not in current['dirs']:
                    current['dirs'][part] = {'dirs': {}, 'files': []}
                current = current['dirs'][part]
            
            # Add file
            if parts[-1] not in current['files']:
                current['files'].append(parts[-1])
        
        # 收集需要分析的代码文件
        code_files = []
        for ext in self.code_extensions:
            for path in self.root.rglob(f"*{ext}"):
                if not any(skip in str(path) for skip in self.skip_dirs):
                    code_files.append(path)
                   
        return {'structure': structure, 'files': sorted(code_files)}
    
    def generate_tree_string(self, node: Dict, prefix: str = "", is_last: bool = True) -> List[str]:
        """Convert structure dict to tree visualization"""
        lines = []
        
        if prefix == "":  # root
            lines.append(f"{node['name']}/")
        
        # Process directories
        dirs = list(node['dirs'].items())
        for i, (name, subnode) in enumerate(dirs):
            is_last_dir = (i == len(dirs) - 1) and len(node.get('files', [])) == 0
            connector = "└── " if is_last_dir else "├── "
            lines.append(f"{prefix}{connector}{name}/")
            
            extension = "    " if is_last_dir else "│   "
            sub_lines = self.generate_tree_string(subnode, prefix + extension, is_last_dir)
            lines.extend(sub_lines)
        
        # Process files
        files = sorted(node.get('files', []))
        for i, name in enumerate(files):
            is_last_file = (i == len(files) - 1)
            connector = "└── " if is_last_file else "├── "
            lines.append(f"{prefix}{connector}{name}")
            
        return lines
    
    def analyze_file_with_ai(self, filepath: Path) -> str:
        """Use OpenAI to analyze a code file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                code = f.read()
        except Exception as e:
            return f"Error reading file: {e}"
        
        # Truncate if too long
        if len(code) > 8000:
            code = code[:8000] + "\n... [truncated]"
        
        # 根据文件类型调整提示词
        file_ext = filepath.suffix
        file_type = {
            '.py': 'Python',
            '.jsx': 'React JSX',
            '.js': 'JavaScript',
            '.tsx': 'TypeScript React',
            '.ts': 'TypeScript'
        }.get(file_ext, 'code')
        
        prompt = f"""Analyze this {file_type} file and provide a concise summary.

File: {filepath.name}

Rules:
1. Start with one sentence describing the file's purpose
2. List key functions/classes/components with brief descriptions (one line each)
3. Be concise - maximum 10 lines total
4. For React components: "ComponentName: what it renders/does"
5. For functions: "function_name(): what it does"
6. Note any important dependencies or integrations

Code:
{code}
"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a concise code documentation expert for both backend and frontend code."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Error analyzing file: {e}"
    
    def generate_continuation_prompt(self) -> str:
        """Generate a prompt for continuing development in a new conversation"""
        prompt = []
        prompt.append("## Development Continuation Prompt")
        prompt.append("")
        prompt.append("*Copy the following prompt to continue development in a new conversation:*")
        prompt.append("")
        prompt.append("---")
        prompt.append("")
        prompt.append("I'm working on a Personal CRM system called \"Social Assistant\" or \"Cirkel\" built with FastAPI backend and React frontend. The system tracks interactions with people, uses AI to extract structured information (facts, commitments, people mentioned), and provides semantic search and relationship tracking.")
        prompt.append("")
        prompt.append("**Current Features:**")
        prompt.append("1. **Shadow Entity System** - tracks mentions of people before they're added to the system")
        prompt.append("2. **Name Learning System** - smart name matching with aliases support (persons/person_aliases tables)")
        prompt.append("3. **Multi-person name confirmation** with smart detection (existing/shadow/new)")
        prompt.append("4. **AI keyword extraction** displayed on sticky notes")
        prompt.append("5. **Timeline and Reminders views** with bottom navigation")
        prompt.append("6. **Meeting prep** with AI suggestions")
        prompt.append("7. **Semantic search** using ChromaDB vector database")
        prompt.append("")
        prompt.append("**Tech Stack:**")
        prompt.append("- Backend: FastAPI, SQLite, ChromaDB for vector search, OpenAI API")
        prompt.append("- Frontend: React with inline styles, no UI libraries")
        prompt.append("- AI: OpenAI GPT for extraction, sentence-transformers for embeddings")
        prompt.append("")
        prompt.append("**Key Files Structure:**")
        prompt.append("- `app.py`: FastAPI endpoints")
        prompt.append("- `managers/`: Business logic (InteractionManager, SearchManager, IntelligenceManager, NameLearningManager)")
        prompt.append("- `core/`: Core functions (storage.py, extraction.py, retrieval.py, suggestions.py, name_learning.py)")
        prompt.append("- `frontend/src/components/`: React components")
        prompt.append("- `models/schemas.py`: Pydantic models with ExtractedInfo schema")
        prompt.append("")
        prompt.append("**Database Schema:**")
        prompt.append("- `events`: Main interaction records (includes person_id for v2)")
        prompt.append("- `shadow_entities`: Tracks mentioned but not-yet-added people")
        prompt.append("- `persons`: Person entities with canonical names")
        prompt.append("- `person_aliases`: Maps aliases to person_ids")
        prompt.append("")
        prompt.append("**Recent Development:**")
        prompt.append("- Implemented database v2 with person_id and alias support")
        prompt.append("- Added backward compatibility for existing data")
        prompt.append("- Created NameLearningSystem for intelligent name matching")
        prompt.append("- Frontend has NameConfirm component for smart name resolution")
        prompt.append("")
        prompt.append("**Next Steps to Consider:**")
        prompt.append("1. Enhance real-time name suggestions during input")
        prompt.append("2. Add UI for managing person aliases")
        prompt.append("3. Implement fuzzy matching algorithms")
        prompt.append("4. Add pattern learning from user confirmations")
        prompt.append("5. Create bulk import/export functionality")
        prompt.append("")
        prompt.append("**Note:** All code files are already uploaded to project knowledge. You can reference them directly. 在对话中，除非用户明确指令，否则不要直接写项目代码")
        prompt.append("")
        prompt.append("---")
        
        return '\n'.join(prompt)
    
    def generate_documentation(self) -> str:
        """Generate complete project documentation"""
        print("Scanning project...")
        project_data = self.scan_project()
        
        doc_lines = []
        doc_lines.append("# Project Documentation")
        doc_lines.append(f"*Auto-generated documentation for Social Assistant*")
        doc_lines.append("")
        
        # Project structure
        doc_lines.append("## Project Structure")
        doc_lines.append("```")
        tree_lines = self.generate_tree_string(project_data['structure'])
        doc_lines.extend(tree_lines)
        doc_lines.append("```")
        doc_lines.append("")
        
        # Separate backend and frontend files
        backend_files = [f for f in project_data['files'] if not 'frontend' in str(f)]
        frontend_files = [f for f in project_data['files'] if 'frontend' in str(f)]
        
        # Backend documentation
        if backend_files:
            doc_lines.append("## Backend Documentation (Python/FastAPI)")
            doc_lines.append("")
            
            total_backend = len(backend_files)
            for i, filepath in enumerate(backend_files, 1):
                rel_path = filepath.relative_to(self.root)
                print(f"Analyzing backend file {i}/{total_backend}: {rel_path}")
                
                doc_lines.append(f"### `{rel_path}`")
                doc_lines.append("")
                
                analysis = self.analyze_file_with_ai(filepath)
                doc_lines.append(analysis)
                doc_lines.append("")
        
        # Frontend documentation
        if frontend_files:
            doc_lines.append("## Frontend Documentation (React)")
            doc_lines.append("")
            
            total_frontend = len(frontend_files)
            for i, filepath in enumerate(frontend_files, 1):
                rel_path = filepath.relative_to(self.root)
                print(f"Analyzing frontend file {i}/{total_frontend}: {rel_path}")
                
                doc_lines.append(f"### `{rel_path}`")
                doc_lines.append("")
                
                analysis = self.analyze_file_with_ai(filepath)
                doc_lines.append(analysis)
                doc_lines.append("")
        
        # Add continuation prompt section
        continuation_prompt = self.generate_continuation_prompt()
        doc_lines.append(continuation_prompt)
        
        return '\n'.join(doc_lines)
    
    def save_documentation(self, content: str):
        """Save documentation to project root"""
        output_path = self.root / "PROJECT_DOCS.md"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\nDocumentation saved to: {output_path}")
        print(f"Relative to current dir: {output_path.relative_to(Path.cwd())}")

def main():
    """Main entry point"""
    # Support passing root path as argument
    root_path = None
    if len(sys.argv) > 1:
        root_path = sys.argv[1]
    
    try:
        generator = DocGenerator(root_path)
        doc_content = generator.generate_documentation()
        generator.save_documentation(doc_content)
        print("\n✅ Documentation generation completed successfully!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()