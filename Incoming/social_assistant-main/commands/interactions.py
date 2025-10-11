"""
Commands for recording interactions.
Uses managers layer following project architecture.
"""

import typer
from rich.console import Console
from typing import Optional

from managers.interaction_manager import InteractionManager
from managers.name_learning_manager import NameLearningManager

console = Console()


def add_interaction(name: str, quick: bool = False):
    """
    Add a new interaction with a person.
    
    Uses intelligent name matching and shadow entity resolution.
    Follows the manager layer architecture.
    """
    try:
        # 1. 智能名称检查
        name_manager = NameLearningManager()
        name_check = name_manager.check_name_matches(name)
        
        # 2. 处理名称匹配结果
        if name_check["type"] == "existing":
            data = name_check["data"]
            console.print(f"[green]✓ Known person: {data['canonical_name']}[/green]")
            if data.get("aliases") and len(data["aliases"]) > 1:
                console.print(f"  Also known as: {', '.join(data['aliases'][:3])}")
        
        elif name_check["type"] == "smart_match" and name_check.get("suggestions"):
            console.print(f"\n[yellow]'{name}' might be:[/yellow]")
            suggestions = name_check["suggestions"][:3]
            
            for i, suggestion in enumerate(suggestions, 1):
                console.print(f"  {i}. {suggestion['canonical_name']} ", end="")
                console.print(f"[dim](matched as '{suggestion['alias']}', ", end="")
                console.print(f"{suggestion['match_type']}: {suggestion['similarity']:.2f})[/dim]")
            
            console.print(f"  {len(suggestions)+1}. [cyan]New person named '{name}'[/cyan]")
            
            if not quick:
                choice = typer.prompt("\nSelect option (or Enter for new person)", default="new")
                
                if choice.isdigit() and 1 <= int(choice) <= len(suggestions):
                    selected = suggestions[int(choice)-1]
                    
                    # 创建决策对象并处理确认
                    decision = {
                        "action": "use_existing",
                        "canonical_name": selected["canonical_name"],
                        "alias": name
                    }
                    
                    result = name_manager.process_confirmation(name, decision)
                    if result.get("success"):
                        console.print(f"[green]✓ Added '{name}' as alias for {selected['canonical_name']}[/green]")
                        name = selected["canonical_name"]
        
        elif name_check["type"] == "shadow" and name_check.get("data", {}).get("shadows"):
            shadows = name_check["data"]["shadows"]
            console.print(f"\n[yellow]'{name}' was previously mentioned by:[/yellow]")
            for shadow in shadows[:3]:
                console.print(f"  • {shadow['mentioned_by']}: {shadow['context'] or 'no context'}")
            
            if not quick and typer.confirm(f"\nIs this the same {name}?", default=True):
                # 处理shadow决策
                decision = {
                    "action": "resolve_shadows",
                    "shadow_ids": [s['id'] for s in shadows]
                }
                
                result = name_manager.process_confirmation(name, decision)
                if result.get("success"):
                    console.print("[green]✓ Connected to previous mentions[/green]\n")
        
        # 3. 获取交互内容
        console.print(f"[bold]Recording interaction with {name}[/bold]")
        
        if quick:
            console.print("[dim]Enter text (Ctrl+D when done):[/dim]")
            lines = []
            while True:
                try:
                    line = input()
                    lines.append(line)
                except EOFError:
                    break
            text = "\n".join(lines).strip()
        else:
            text = typer.prompt("What happened?").strip()
        
        if not text:
            console.print("[yellow]No input provided[/yellow]")
            return
        
        # 4. 使用manager保存交互
        manager = InteractionManager()
        manager.person_name = name
        result = manager.add_interaction(text)
        
        # 5. 显示结果
        if result.get("error"):
            console.print(f"[red]Error: {result['error']}[/red]")
        else:
            console.print(f"[green]✓ Saved interaction with {name}[/green]")
            if result.get("new_shadows"):
                for person in result["new_shadows"]:
                    console.print(f"[dim]🔍 Noted: {person} (new person mentioned)[/dim]")
    
    except KeyboardInterrupt:
        console.print("\n[yellow]Cancelled[/yellow]")
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def update_person_info(name: str):
    """
    Add additional information to an existing person.
    
    Uses interaction manager for consistent handling.
    """
    try:
        console.print(f"[bold]Adding info for {name}[/bold]")
        
        additional_info = typer.prompt("Additional info").strip()
        
        if not additional_info:
            console.print("[yellow]No input provided[/yellow]")
            return
        
        # 使用manager更新信息
        manager = InteractionManager()
        result = manager.update_person_info(name, additional_info)
        
        if result.get("error"):
            console.print(f"[red]Error: {result['error']}[/red]")
        else:
            console.print(f"[green]✓ Added info for {name}[/green]")
            if result.get("new_shadows"):
                for person in result["new_shadows"]:
                    console.print(f"[dim]🔍 Noted: {person} (new person mentioned)[/dim]")
    
    except KeyboardInterrupt:
        console.print("\n[yellow]Cancelled[/yellow]")
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def delete_interaction(name: str, event_id: Optional[int] = None, all_events: bool = False):
    """
    Delete interactions for a person.
    
    Can delete specific event or all events for a person.
    """
    try:
        manager = InteractionManager()
        
        if all_events:
            if not typer.confirm(f"Delete ALL interactions for {name}?"):
                console.print("[yellow]Cancelled[/yellow]")
                return
            
            count = manager.delete_person_events(name)
            if count == 0:
                console.print(f"[yellow]No records found for {name}[/yellow]")
            else:
                console.print(f"[green]✓ Deleted {count} interactions for {name}[/green]")
        
        elif event_id:
            success = manager.delete_event(event_id)
            if success:
                console.print(f"[green]✓ Deleted event {event_id}[/green]")
            else:
                console.print(f"[red]Event {event_id} not found[/red]")
        
        else:
            console.print("[red]Must specify either --event-id or --all[/red]")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")