import tempfile
import os
from pathlib import Path
import time
import core.storage as storage

# Create temp database
temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
temp_db.close()
storage.DB_PATH = Path(temp_db.name)
storage.init_db()

# Insert two events with small delay
id1 = storage.insert_event("Test", "First event")
time.sleep(0.1)  # Small delay to ensure different timestamps
id2 = storage.insert_event("Test", "Second event")

# Get events
events = storage.get_events_for_person("Test")

print(f"Number of events: {len(events)}")
print(f"First returned: {events[0]['raw_input']}")
print(f"Second returned: {events[1]['raw_input']}")
print(f"Order: {'CORRECT (newest first)' if events[0]['raw_input'] == 'Second event' else 'WRONG'}")

# Cleanup
os.unlink(temp_db.name)