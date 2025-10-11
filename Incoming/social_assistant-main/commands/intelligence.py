"""
Commands for AI-powered intelligence features.
Uses managers layer following project architecture.
"""

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from managers.intelligence_manager import IntelligenceManager

console = Console()


def prepare_meeting(name: str):
    """
    Prepare for a meeting with someone by analyzing past interactions.
    
    Uses intelligence manager for AI-powered analysis.
    """
    try:
        manager = IntelligenceManager()
        result = manager.prepare_meeting(name)
        
        if result.get("error"):
            console.print(f"[red]Error: {result['error']}[/red]")
            return
        
        console.print(f"\n[bold cyan]Meeting Preparation for {name}[/bold cyan]\n")
        
        # Show summary
        if result.get("summary"):
            summary_panel = Panel(
                result["summary"], 
                title="Quick Summary", 
                border_style="blue"
            )
            console.print(summary_panel)
        
        # Show key topics
        if result.get("key_topics"):
            console.print("\n[bold]Key Topics:[/bold]")
            for topic in result["key_topics"][:5]:
                console.print(f"  • {topic}")
        
        # Show recent interactions
        if result.get("recent_interactions"):
            console.print("\n[bold]Recent Interactions:[/bold]")
            for interaction in result["recent_interactions"][:3]:
                date = interaction.get("timestamp", "Unknown date")
                content = interaction.get("content", "")[:100] + "..."
                console.print(f"  • {date}: {content}")
        
        # Show suggested talking points
        if result.get("talking_points"):
            console.print("\n[bold]Suggested Talking Points:[/bold]")
            for point in result["talking_points"][:5]:
                console.print(f"  • {point}")
        
        # Show action items or commitments
        if result.get("action_items"):
            console.print("\n[bold]Previous Commitments/Action Items:[/bold]")
            for item in result["action_items"][:3]:
                console.print(f"  • {item}")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def get_reminders():
    """
    Get AI-powered reminders based on past interactions.
    
    Uses intelligence manager for reminder generation.
    """
    try:
        manager = IntelligenceManager()
        result = manager.get_reminders()
        
        if result.get("error"):
            console.print(f"[red]Error: {result['error']}[/red]")
            return
        
        # 检查是否有任何提醒
        has_commitments = result.get("commitments") and len(result["commitments"]) > 0
        has_reconnect = result.get("reconnect") and len(result["reconnect"]) > 0
        
        if not has_commitments and not has_reconnect:
            console.print("[yellow]No reminders at this time[/yellow]")
            return
        
        console.print("\n[bold cyan]🔔 Reminders[/bold cyan]\n")
        
        # 显示承诺提醒
        if has_commitments:
            console.print("[bold red]📋 My Commitments:[/bold red]")
            for commitment in result["commitments"]:
                console.print(f"  • To [cyan]{commitment['to']}[/cyan]: {commitment['commitment']}")
                if commitment.get('deadline'):
                    console.print(f"    [dim]Deadline: {commitment['deadline']}[/dim]")
            console.print()
        
        # 显示重新联系提醒
        if has_reconnect:
            console.print("[bold yellow]🤝 People to Reconnect:[/bold yellow]")
            for person in result["reconnect"]:
                urgency_color = "red" if person.get("urgency") == "urgent" else "yellow" if person.get("urgency") == "soon" else "cyan"
                console.print(f"  • [{urgency_color}]{person['person']}[/{urgency_color}] ({person['days_ago']} days ago)")
                
                # 显示主题
                if person.get("topics"):
                    topics_text = ", ".join(person["topics"])
                    console.print(f"    [dim italic]Topics: {topics_text}[/dim italic]")
                
                console.print(f"    [dim]{person['interaction_count']} interactions • {person.get('urgency', 'normal')} urgency[/dim]")
            console.print()

    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def analyze_relationships():
    """
    Analyze relationship patterns and provide insights.
    
    This is a CLI-specific feature for relationship analysis.
    """
    try:
        # This would be a new feature not in the webapp
        # For now, provide a placeholder
        console.print("[bold cyan]Relationship Analysis[/bold cyan]\n")
        console.print("[yellow]This feature is coming soon![/yellow]")
        console.print("\nThis will analyze:")
        console.print("  • Communication frequency patterns")
        console.print("  • Relationship strength indicators")
        console.print("  • Interaction trends over time")
        console.print("  • Mutual connections between people")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def suggest_reconnections():
    """
    Suggest people you haven't interacted with recently.
    
    This is a CLI-specific feature for maintaining relationships.
    """
    try:
        # This would be a new feature not in the webapp
        # For now, provide a placeholder
        console.print("[bold cyan]Reconnection Suggestions[/bold cyan]\n")
        console.print("[yellow]This feature is coming soon![/yellow]")
        console.print("\nThis will suggest:")
        console.print("  • People you haven't contacted in a while")
        console.print("  • Important relationships that need attention")
        console.print("  • Seasonal or event-based reconnection opportunities")
        console.print("  • People with shared interests or connections")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")


def generate_summary(name: str, period: str = "month"):
    """
    Generate a summary of interactions with a person over a time period.
    
    Uses intelligence manager for AI-powered summarization.
    """
    try:
        # This would need to be implemented in the intelligence manager
        # For now, provide a simplified version
        console.print(f"[bold cyan]Summary for {name} ({period})[/bold cyan]\n")
        console.print("[yellow]This feature is coming soon![/yellow]")
        console.print(f"\nThis will provide:")
        console.print(f"  • Summary of interactions in the last {period}")
        console.print("  • Key developments in the relationship")
        console.print("  • Important topics discussed")
        console.print("  • Action items and follow-ups")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")