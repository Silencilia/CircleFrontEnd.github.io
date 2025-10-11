"""
Commands for searching and listing information.
Uses managers layer following project architecture.
"""

from typing import Optional
from rich.console import Console
from rich.table import Table

from managers.search_manager import SearchManager

console = Console()


def search_interactions(
    query: str, 
    person: Optional[str] = None, 
    limit: int = 5,
    show_aliases: bool = False
):
    """
    Search across all interactions using semantic search.
    
    Uses search manager for consistent functionality with webapp.
    """
    try:
        manager = SearchManager()
        result = manager.search_interactions(query, person, limit)
        
        if result.get("error"):
            console.print(f"[red]Error: {result['error']}[/red]")
            return
        
        console.print(f"\n[bold cyan]Searching for: '{query}'[/bold cyan]")
        if person:
            canonical = result.get("canonical_filter", person)
            console.print(f"[dim]Filtered to: {canonical}[/dim]")
            if result.get("searched_aliases"):
                console.print(f"[dim]Searched aliases: {', '.join(result['searched_aliases'])}[/dim]")
        
        if not result["results"]:
            console.print("[yellow]No results found.[/yellow]")
            return
        
        console.print(f"\n[green]Found {result['count']} relevant interactions:[/green]\n")
        
        for i, res in enumerate(result["results"], 1):
            similarity = res.get('similarity', 0)
            
            # Color coding based on relevance
            if similarity > 0.7:
                color, label = "green", "Very High"
            elif similarity > 0.5:
                color, label = "yellow", "High"
            else:
                color, label = "dim", "Low"
            
            metadata = res.get('metadata', {})
            person_name = res.get('canonical_name', metadata.get('person_name', 'Unknown'))
            matched_as = res.get('matched_as', '')
            timestamp = metadata.get('timestamp', 'Unknown time')
            
            # Display result
            console.print(f"[bold]{i}. {person_name}[/bold]", end="")
            if show_aliases and matched_as and matched_as != person_name:
                console.print(f" [dim](as {matched_as})[/dim]", end="")
            console.print(f" [{color}]Relevance: {label} ({similarity:.2f})[/{color}]")
            console.print(f"   [dim]{timestamp}[/dim]")
            console.print(f"   {res['document'][:150]}...\n")
    
    except Exception as e:
        console.print(f"[red]Search error: {e}[/red]")


def list_recent_interactions(limit: int = 10, show_aliases: bool = False):
    """
    List recent interactions with proper person grouping.
    
    Uses search manager for consistent results.
    """
    try:
        manager = SearchManager()
        result = manager.list_recent_interactions(limit)
        
        if result.get("error"):
            console.print(f"[red]Error: {result['error']}[/red]")
            return
        
        if not result["events"]:
            console.print("[yellow]No interactions recorded yet.[/yellow]")
            return
        
        console.print(f"\n[bold]Recent Interactions ({result['unique_people']} unique people):[/bold]\n")
        
        for event in result["events"]:
            canonical = event['canonical_name']
            display_name = event['person_name']
            
            # Display person name
            console.print(f"[cyan]{canonical}[/cyan]", end="")
            
            # Show aliases if requested
            if show_aliases and event.get('has_aliases'):
                aliases_str = ', '.join(event['aliases'][:2])
                if len(event['aliases']) > 2:
                    aliases_str += f", +{len(event['aliases'])-2} more"
                console.print(f" [dim]({aliases_str})[/dim]", end="")
            
            # Show timestamp and content
            date = event['timestamp'].split(' ')[0] if ' ' in event['timestamp'] else event['timestamp']
            console.print(f" - {date}")
            console.print(f"  {event['raw_input']}\n")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def show_person_timeline(name: str, include_aliases: bool = False):
    """
    Show complete timeline for a person including all aliases.
    
    Uses search manager for data retrieval.
    """
    try:
        manager = SearchManager()
        result = manager.get_person_timeline(name)
        
        if result.get("error"):
            console.print(f"[red]Error: {result['error']}[/red]")
            return
        
        if not result.get("exists"):
            console.print(f"[red]No records found for {name}[/red]")
            
            # Try to suggest similar names
            from managers.name_learning_manager import NameLearningManager
            name_manager = NameLearningManager()
            suggestions = name_manager.suggest_names_for_input(name, limit=3)
            if suggestions:
                console.print("\n[yellow]Did you mean:[/yellow]")
                for s in suggestions:
                    console.print(f"  • {s}")
            return
        
        # Display header and aliases
        console.print(f"\n[bold cyan]Timeline for {result['canonical_name']}:[/bold cyan]")
        
        if include_aliases and result.get("aliases"):
            console.print(f"[dim]Also known as: {', '.join(result['aliases'])}[/dim]")
        
        console.print(f"Total interactions: {result['total']}\n")
        
        # Display events in chronological order (oldest first)
        for event in reversed(result["events"]):
            console.print(f"[dim]{event['timestamp']}[/dim] [{event['event_type']}]")
            console.print(f"  {event['raw_input']}")
            
            # Show extracted information if available
            if event.get('keywords'):
                console.print(f"  [green]Keywords:[/green] {', '.join(event['keywords'])}")
            if event.get('people_mentioned'):
                console.print(f"  [cyan]Mentioned:[/cyan] {', '.join(event['people_mentioned'])}")
            console.print()
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def find_connections(person: str, limit: int = 5):
    """
    Find connections between people based on interactions.
    
    Uses semantic search to find mentions of the person in other people's interactions.
    """
    try:
        manager = SearchManager()
        
        # Search for mentions of this person in all interactions
        search_result = manager.search_interactions(person, person=None, limit=20)
        
        if search_result.get("error"):
            console.print(f"[red]Error: {search_result['error']}[/red]")
            return
        
        # Filter out interactions by the person themselves and find mentions
        connections = []
        for result in search_result.get("results", []):
            metadata = result.get('metadata', {})
            document = result.get('document', '')
            result_person = result.get('canonical_name', metadata.get('person_name', ''))
            
            # Skip if it's the person's own interaction
            if result_person.lower() == person.lower():
                continue
            
            # Check if the person is mentioned in the text
            if person.lower() in document.lower():
                connections.append({
                    'connected_person': result_person,
                    'context': document,
                    'similarity': result.get('similarity', 0),
                    'timestamp': metadata.get('timestamp', 'Unknown')
                })
        
        # Sort by similarity and limit
        connections.sort(key=lambda x: x['similarity'], reverse=True)
        connections = connections[:limit]
        
        if not connections:
            console.print(f"[yellow]No connections found for {person}[/yellow]")
            console.print(f"[dim]Try adding more interactions where {person} is mentioned by others[/dim]")
            return
        
        console.print(f"\n[bold cyan]Connections for {person}:[/bold cyan]\n")
        
        for conn in connections:
            console.print(f"[bold]{conn['connected_person']}[/bold] ", end="")
            console.print(f"[green](Relevance: {conn['similarity']:.2f})[/green]")
            console.print(f"  [dim]{conn['timestamp']}[/dim]")
            console.print(f"  {conn['context'][:150]}...")
            console.print()
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def get_people_statistics():
    """
    Show statistics about people and aliases in the system.
    
    Uses search manager for statistical data.
    """
    try:
        manager = SearchManager()
        result = manager.get_people_statistics()
        
        if result.get("error"):
            console.print(f"[red]Error getting statistics: {result['error']}[/red]")
            return
        
        # Create statistics table
        table = Table(title="People Statistics")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="yellow")
        
        table.add_row("Total People", str(result.get('total_people', 0)))
        table.add_row("Total Aliases", str(result.get('total_aliases', 0)))
        table.add_row("Avg Aliases/Person", f"{result.get('avg_aliases_per_person', 0):.1f}")
        table.add_row("Multi-alias People", str(result.get('people_with_multiple_aliases', 0)))
        
        console.print(table)
        
        # Show most active people
        if result.get('most_active'):
            console.print("\n[bold]Most Active People:[/bold]")
            for person in result['most_active'][:5]:
                interactions = person.get('interactions', 0)
                aliases = person.get('aliases', 0)
                console.print(f"  • {person['name']}: {interactions} interactions")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")