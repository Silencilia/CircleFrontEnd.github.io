"""
Commands for alias and person management.
Uses managers layer following project architecture.
"""

import typer
from rich.console import Console
from rich.table import Table

from managers.name_learning_manager import NameLearningManager

console = Console()


def show_aliases(name: str):
    """
    Show all aliases for a person.
    
    Uses name learning manager for alias data.
    """
    try:
        manager = NameLearningManager()
        result = manager.get_person_aliases_display(name)
        
        if not result.get("success"):
            console.print(f"[red]Person '{name}' not found[/red]")
            return
        
        # Create aliases table
        primary_name = result.get('primary', name)
        table = Table(title=f"Aliases for {primary_name}")
        table.add_column("Alias", style="cyan")
        table.add_column("Source", style="yellow")
        table.add_column("Confidence", style="green")
        table.add_column("Type", style="magenta")
        
        # Add primary name
        table.add_row(
            f"⭐ {primary_name}",
            "primary",
            "1.00",
            "Primary"
        )
        
        # Add confirmed aliases
        for alias_info in result.get("confirmed", []):
            table.add_row(
                alias_info['name'],
                "user_confirmed",
                f"{alias_info['confidence']:.2f}",
                "Confirmed"
            )
        
        # Add learned aliases
        for alias_info in result.get("learned", []):
            table.add_row(
                alias_info['name'],
                "pattern_matched",
                f"{alias_info['confidence']:.2f}",
                "Learned"
            )
        
        # Add manual aliases
        for alias_info in result.get("manual", []):
            table.add_row(
                alias_info['name'],
                "manual",
                f"{alias_info['confidence']:.2f}",
                "Manual"
            )
        
        console.print(table)
        
        # Calculate total aliases
        total_aliases = (len(result.get("confirmed", [])) + 
                        len(result.get("learned", [])) + 
                        len(result.get("manual", [])) + 1)  # +1 for primary
        console.print(f"\n[dim]Total aliases: {total_aliases}[/dim]")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def add_alias(person: str, alias: str, confidence: float = 0.9):
    """
    Add an alias for a person.
    
    Uses name learning manager for consistent handling.
    """
    try:
        manager = NameLearningManager()
        result = manager.add_alias(person, alias, confidence=confidence, source="manual_cli")
        
        if result.get("success"):
            canonical_name = result.get('canonical_name', person)
            console.print(f"[green]✓ Added '{alias}' as alias for {canonical_name}[/green]")
        else:
            console.print(f"[red]Error: {result.get('error')}[/red]")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def remove_alias(alias: str):
    """
    Remove an alias.
    
    Uses name learning manager for consistent handling.
    """
    try:
        if not typer.confirm(f"Remove alias '{alias}'?"):
            return
        
        manager = NameLearningManager()
        result = manager.remove_alias(alias)
        
        if result["success"]:
            console.print(f"[green]✓ Removed alias '{alias}'[/green]")
        else:
            console.print(f"[red]Error: {result.get('error')}[/red]")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def merge_persons(source: str, target: str):
    """
    Merge all data from source person to target person.
    
    Uses name learning manager for safe merging.
    """
    try:
        manager = NameLearningManager()
        
        # Get person info for preview
        source_check = manager.check_name_matches(source)
        target_check = manager.check_name_matches(target)
        
        if source_check["type"] != "existing":
            console.print(f"[red]Source person '{source}' not found[/red]")
            return
        
        if target_check["type"] != "existing":
            console.print(f"[red]Target person '{target}' not found[/red]")
            return
        
        source_data = source_check["data"]
        target_data = target_check["data"]
        
        console.print(f"\n[yellow]This will merge:[/yellow]")
        console.print(f"  FROM: {source_data['canonical_name']} (ID: {source_data.get('person_id', 'Unknown')})")
        console.print(f"  INTO: {target_data['canonical_name']} (ID: {target_data.get('person_id', 'Unknown')})")
        console.print("\n[yellow]All aliases and events will be moved. This cannot be undone![/yellow]")
        
        if not typer.confirm("\nProceed with merge?"):
            return
        
        result = manager.merge_persons(source, target)
        
        if result["success"]:
            console.print(f"\n[green]✓ Successfully merged![/green]")
            console.print(f"  Aliases moved: {result.get('aliases_moved', 0)}")
            console.print(f"  Events updated: {result.get('events_updated', 0)}")
        else:
            console.print(f"[red]Error: {result.get('error')}[/red]")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def check_name(name: str):
    """
    Check a name for matches and get suggestions.
    
    Uses name learning manager for intelligent name checking.
    """
    try:
        manager = NameLearningManager()
        result = manager.check_name_matches(name)
        
        console.print(f"\n[bold cyan]Name Check: '{name}'[/bold cyan]\n")
        
        if result["type"] == "existing":
            data = result["data"]
            console.print(f"[green]✓ Existing person: {data['canonical_name']}[/green]")
            if data.get("aliases"):
                console.print(f"  Aliases: {', '.join(data['aliases'][:5])}")
        
        elif result["type"] == "smart_match":
            console.print("[yellow]Potential matches found:[/yellow]")
            for suggestion in result.get("suggestions", [])[:5]:
                console.print(f"  • {suggestion['canonical_name']} ", end="")
                console.print(f"[dim]({suggestion['match_type']}: {suggestion['similarity']:.2f})[/dim]")
        
        elif result["type"] == "shadow":
            shadows = result.get("data", {}).get("shadows", [])
            console.print("[yellow]Previously mentioned:[/yellow]")
            for shadow in shadows[:3]:
                console.print(f"  • By {shadow['mentioned_by']}: {shadow['context'] or 'no context'}")
        
        else:
            console.print("[cyan]New name - no matches found[/cyan]")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def suggest_names(query: str, limit: int = 10):
    """
    Get name suggestions for partial input.
    
    Uses name learning manager for autocomplete functionality.
    """
    try:
        if len(query) < 2:
            console.print("[yellow]Query too short - need at least 2 characters[/yellow]")
            return
        
        manager = NameLearningManager()
        suggestions = manager.suggest_names_for_input(query, limit)
        
        if not suggestions:
            console.print(f"[yellow]No suggestions found for '{query}'[/yellow]")
            return
        
        console.print(f"\n[bold cyan]Suggestions for '{query}':[/bold cyan]\n")
        for i, suggestion in enumerate(suggestions, 1):
            console.print(f"  {i}. {suggestion}")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def find_potential_duplicates():
    """
    Find potential duplicate people based on similar names.
    
    Uses name learning manager for duplicate detection.
    """
    try:
        # This would need to be implemented in the manager
        # For now, we'll use a simple approach
        console.print("[bold]Checking for potential duplicates...[/bold]\n")
        
        manager = NameLearningManager()
        
        # Get all people and check for similarities
        # This is a simplified implementation
        console.print("[yellow]Feature coming soon - please use the web interface for now[/yellow]")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def get_learning_stats():
    """
    Show learning system statistics.
    
    Uses name learning manager for statistics.
    """
    try:
        manager = NameLearningManager()
        result = manager.get_stats()
        
        if not result.get("success", True):
            console.print("[red]Error getting learning statistics[/red]")
            return
        
        stats = result.get("learning_stats", {})
        
        # Create statistics table
        table = Table(title="Learning System Statistics")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="yellow")
        
        table.add_row("Confirmed Matches", str(stats.get('confirmed_matches', 0)))
        table.add_row("Learned Patterns", str(stats.get('patterns_learned', 0)))
        table.add_row("Auto-resolved Names", str(stats.get('auto_resolved', 0)))
        table.add_row("Manual Confirmations", str(stats.get('manual_confirmations', 0)))
        
        console.print(table)
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
