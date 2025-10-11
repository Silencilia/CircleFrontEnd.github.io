#!/usr/bin/env python3
"""
Social Assistant - Personal CRM CLI
Redesigned to use manager layer architecture following webapp patterns.
"""
import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import typer
from rich.console import Console
from typing import Optional

# Import command modules
from commands import interactions, intelligence, system
from commands import search as search_commands
from commands import aliases as alias_commands

app = typer.Typer(help="Social Assistant - Personal CRM with smart alias support")
console = Console()

# ========== Interaction Commands ==========

@app.command()
def add(
    name: str, 
    quick: bool = typer.Option(False, "--quick", "-q", help="Quick mode without prompts")
):
    """Add a new interaction with a person (with smart name matching)"""
    interactions.add_interaction(name, quick)


@app.command()
def update(name: str):
    """Add additional information to an existing person"""
    interactions.update_person_info(name)


@app.command()
def delete(
    name: str,
    event_id: Optional[int] = typer.Option(None, "--event-id", help="Delete specific event"),
    all_events: bool = typer.Option(False, "--all", help="Delete all events for person")
):
    """Delete interactions for a person"""
    interactions.delete_interaction(name, event_id, all_events)


# ========== Search Commands ==========

@app.command()
def search(
    query: str,
    person: Optional[str] = typer.Option(None, "--person", "-p", help="Filter by person"),
    limit: int = typer.Option(5, "--limit", "-l", help="Number of results"),
    show_aliases: bool = typer.Option(False, "--show-aliases", "-a", help="Show aliases")
):
    """Search across all interactions using semantic search"""
    search_commands.search_interactions(query, person, limit, show_aliases)


@app.command()
def list(
    limit: int = typer.Option(10, "--limit", "-l", help="Number of recent interactions"),
    show_aliases: bool = typer.Option(False, "--aliases", "-a", help="Show aliases")
):
    """List recent interactions"""
    search_commands.list_recent_interactions(limit, show_aliases)


@app.command()
def who(
    name: str, 
    aliases: bool = typer.Option(False, "--aliases", "-a", help="Show all aliases")
):
    """Show complete timeline for a person"""
    search_commands.show_person_timeline(name, aliases)


@app.command()
def connections(
    person: str,
    limit: int = typer.Option(5, "--limit", "-l", help="Number of connections")
):
    """Find connections between people"""
    search_commands.find_connections(person, limit)


# ========== Alias Management Commands ==========

@app.command()
def aliases(name: str):
    """Show all aliases for a person"""
    alias_commands.show_aliases(name)


@app.command()
def add_alias(
    person: str, 
    alias: str, 
    confidence: float = typer.Option(0.9, help="Confidence score (0.0-1.0)")
):
    """Add an alias for a person"""
    alias_commands.add_alias(person, alias, confidence)


@app.command()
def remove_alias(alias: str):
    """Remove an alias"""
    alias_commands.remove_alias(alias)


@app.command()
def merge(source: str, target: str):
    """Merge all data from source person to target person"""
    alias_commands.merge_persons(source, target)


@app.command()
def check_name(name: str):
    """Check a name for matches and get suggestions"""
    alias_commands.check_name(name)


@app.command()
def suggest_names(
    query: str, 
    limit: int = typer.Option(10, help="Number of suggestions")
):
    """Get name suggestions for partial input"""
    alias_commands.suggest_names(query, limit)


@app.command()
def find_duplicates():
    """Find potential duplicate people"""
    alias_commands.find_potential_duplicates()


# ========== Intelligence Commands ==========

@app.command()
def prep(name: str):
    """Prepare for a meeting with someone"""
    intelligence.prepare_meeting(name)


@app.command()
def reminders():
    """Get AI-powered reminders"""
    intelligence.get_reminders()


@app.command()
def analyze_relationships():
    """Analyze relationship patterns (CLI-specific feature)"""
    intelligence.analyze_relationships()


@app.command()
def suggest_reconnections():
    """Suggest people to reconnect with (CLI-specific feature)"""
    intelligence.suggest_reconnections()


@app.command()
def summary(
    name: str,
    period: str = typer.Option("month", help="Time period (week/month/year)")
):
    """Generate summary of interactions with a person"""
    intelligence.generate_summary(name, period)


# ========== System Commands ==========

@app.command()
def health():
    """Check system health"""
    system.health_check()


@app.command()
def info():
    """Show system information and statistics"""
    system.system_info()


@app.command()
def stats():
    """Show detailed statistics"""
    search_commands.get_people_statistics()
    alias_commands.get_learning_stats()


@app.command()
def init():
    """Initialize the system (first-time setup)"""
    system.initialize_system()


@app.command()
def backup(
    path: Optional[str] = typer.Option(None, help="Backup file path")
):
    """Create a backup of system data"""
    system.backup_data(path)


@app.command()
def cleanup():
    """Clean up system data (maintenance)"""
    system.cleanup_system()


# ========== Utility Commands ==========

@app.command()
def reindex():
    """Rebuild search indexes"""
    try:
        from core.retrieval import reindex_all_events
        console.print("[yellow]Rebuilding search indexes...[/yellow]")
        reindex_all_events()
        console.print("[green]✓ Search indexes rebuilt[/green]")
    except Exception as e:
        console.print(f"[red]Error rebuilding indexes: {e}[/red]")


# ========== Main Entry Point ==========

if __name__ == "__main__":
    # Initialize system on startup
    try:
        from core.storage import init_db
        from core.retrieval import init_retrieval_system
        
        init_db()
        init_retrieval_system()
        
        console.print("[dim]Social Assistant CLI v2.0 - Manager Architecture[/dim]")
        console.print("[dim]Type 'python social.py --help' for available commands[/dim]\n")
        
    except Exception as e:
        console.print(f"[red]Initialization error: {e}[/red]")
        console.print("[yellow]Try running: python social.py init[/yellow]\n")
    
    app()