"""
Commands for system management and health checking.
Uses managers layer following project architecture.
"""

from rich.console import Console
from rich.table import Table
from rich.panel import Panel

from managers.system_manager import SystemManager

console = Console()


def health_check():
    """
    Perform a comprehensive system health check.
    
    Uses system manager for consistent health checking.
    """
    try:
        manager = SystemManager()
        result = manager.check_health()
        
        # Determine overall status
        status = "healthy" if (
            result.get("database_ok") and 
            result.get("tables_ok") and 
            result.get("integrity") == "ok"
        ) else "degraded"
        
        # Create status panel
        status_color = "green" if status == "healthy" else "red"
        status_panel = Panel(
            f"[{status_color}]{status.upper()}[/{status_color}]",
            title="System Status",
            border_style=status_color
        )
        console.print(status_panel)
        
        # Create detailed health table
        table = Table(title="Health Check Details")
        table.add_column("Component", style="cyan")
        table.add_column("Status", style="yellow")
        table.add_column("Details", style="white")
        
        # Database check
        db_status = "✓ OK" if result.get("database_ok") else "✗ ERROR"
        db_color = "green" if result.get("database_ok") else "red"
        table.add_row(
            "Database Connection",
            f"[{db_color}]{db_status}[/{db_color}]",
            result.get("database_path", "Unknown")
        )
        
        # Tables check
        tables_status = "✓ OK" if result.get("tables_ok") else "✗ ERROR"
        tables_color = "green" if result.get("tables_ok") else "red"
        table.add_row(
            "Database Tables",
            f"[{tables_color}]{tables_status}[/{tables_color}]",
            f"{result.get('table_count', 0)} tables found"
        )
        
        # Integrity check
        integrity_status = "✓ OK" if result.get("integrity") == "ok" else "✗ ERROR"
        integrity_color = "green" if result.get("integrity") == "ok" else "red"
        table.add_row(
            "Data Integrity",
            f"[{integrity_color}]{integrity_status}[/{integrity_color}]",
            result.get("integrity_details", "")
        )
        
        # Vector database check (if available)
        if "vector_db_ok" in result:
            vector_status = "✓ OK" if result.get("vector_db_ok") else "✗ ERROR"
            vector_color = "green" if result.get("vector_db_ok") else "red"
            table.add_row(
                "Vector Database",
                f"[{vector_color}]{vector_status}[/{vector_color}]",
                f"{result.get('vector_count', 0)} vectors indexed"
            )
        
        console.print(table)
        
        # Show any warnings or recommendations
        if result.get("warnings"):
            console.print("\n[bold yellow]Warnings:[/bold yellow]")
            for warning in result["warnings"]:
                console.print(f"  ⚠️  {warning}")
        
        if result.get("recommendations"):
            console.print("\n[bold blue]Recommendations:[/bold blue]")
            for rec in result["recommendations"]:
                console.print(f"  💡 {rec}")
    
    except Exception as e:
        console.print(f"[red]Error performing health check: {e}[/red]")


def system_info():
    """
    Display system information and statistics.
    
    Shows database stats, system configuration, etc.
    """
    try:
        console.print("[bold cyan]Social Assistant System Information[/bold cyan]\n")
        
        # Get system health for basic info
        manager = SystemManager()
        health = manager.check_health()
        
        # System info table
        info_table = Table(title="System Configuration")
        info_table.add_column("Setting", style="cyan")
        info_table.add_column("Value", style="yellow")
        
        info_table.add_row("Database Path", health.get("database_path", "Unknown"))
        info_table.add_row("Database Size", health.get("database_size", "Unknown"))
        info_table.add_row("Total Tables", str(health.get("table_count", 0)))
        
        if health.get("vector_count") is not None:
            info_table.add_row("Vector Embeddings", str(health.get("vector_count", 0)))
        
        console.print(info_table)
        
        # Get additional statistics from other managers
        try:
            from managers.search_manager import SearchManager
            search_manager = SearchManager()
            stats_result = search_manager.get_people_statistics()
            
            if stats_result.get("success"):
                stats = stats_result["statistics"]
                
                console.print("\n[bold]Data Statistics:[/bold]")
                console.print(f"  • Total People: {stats.get('total_people', 0)}")
                console.print(f"  • Total Interactions: {stats.get('total_interactions', 'Unknown')}")
                console.print(f"  • Total Aliases: {stats.get('total_aliases', 0)}")
                console.print(f"  • Average Aliases per Person: {stats.get('avg_aliases_per_person', 0):.1f}")
        except Exception:
            console.print("\n[dim]Could not load statistics[/dim]")
        
        # Show learning system stats
        try:
            from managers.name_learning_manager import NameLearningManager
            name_manager = NameLearningManager()
            learning_stats = name_manager.get_stats()
            
            if learning_stats.get("success", True):
                stats = learning_stats.get("learning_stats", {})
                console.print("\n[bold]Learning System:[/bold]")
                console.print(f"  • Confirmed Matches: {stats.get('confirmed_matches', 0)}")
                console.print(f"  • Learned Patterns: {stats.get('patterns_learned', 0)}")
        except Exception:
            console.print("\n[dim]Could not load learning statistics[/dim]")
    
    except Exception as e:
        console.print(f"[red]Error getting system info: {e}[/red]")


def initialize_system():
    """
    Initialize the system (database, tables, etc.).
    
    Useful for first-time setup or after system corruption.
    """
    try:
        console.print("[bold yellow]Initializing Social Assistant system...[/bold yellow]\n")
        
        # Initialize database and tables
        from core.storage import init_db, init_v2_tables
        from core.retrieval import init_retrieval_system
        
        console.print("1. Initializing database...")
        init_db()
        console.print("   [green]✓ Database initialized[/green]")
        
        console.print("2. Creating tables...")
        init_v2_tables()
        console.print("   [green]✓ Tables created[/green]")
        
        console.print("3. Initializing vector system...")
        init_retrieval_system()
        console.print("   [green]✓ Vector system initialized[/green]")
        
        console.print("\n[bold green]✓ System initialization complete![/bold green]")
        
        # Run a quick health check to verify
        console.print("\nRunning health check...")
        health_check()
    
    except Exception as e:
        console.print(f"[red]Error during initialization: {e}[/red]")


def backup_data(backup_path: str = None):
    """
    Create a backup of the system data.
    
    This is a CLI-specific feature for data safety.
    """
    try:
        import shutil
        import sqlite3
        from datetime import datetime
        from pathlib import Path
        
        if not backup_path:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = f"backup_social_assistant_{timestamp}.db"
        
        # Get database path
        from core.storage import DB_PATH
        
        console.print(f"[bold yellow]Creating backup...[/bold yellow]")
        console.print(f"Source: {DB_PATH}")
        console.print(f"Destination: {backup_path}")
        
        # Copy the database file
        shutil.copy2(DB_PATH, backup_path)
        
        # Verify the backup
        try:
            with sqlite3.connect(backup_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
                table_count = cursor.fetchone()[0]
            
            console.print(f"[green]✓ Backup created successfully![/green]")
            console.print(f"  Backup contains {table_count} tables")
            console.print(f"  File size: {Path(backup_path).stat().st_size / 1024:.1f} KB")
        except Exception as e:
            console.print(f"[red]Backup verification failed: {e}[/red]")
    
    except Exception as e:
        console.print(f"[red]Backup failed: {e}[/red]")


def cleanup_system():
    """
    Clean up system data (remove orphaned records, etc.).
    
    This is a CLI-specific maintenance feature.
    """
    try:
        console.print("[bold yellow]System cleanup is coming soon![/bold yellow]")
        console.print("\nThis will:")
        console.print("  • Remove orphaned shadow entities")
        console.print("  • Clean up duplicate aliases")
        console.print("  • Optimize database indexes")
        console.print("  • Rebuild vector embeddings if needed")
        console.print("\n[dim]Use with caution - backup your data first![/dim]")
    
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
