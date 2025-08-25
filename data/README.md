# Sample Data Structure

This directory contains the mock/sample data for the Circle app. The data is organized into separate files to make it modular and easier to replace with database data later.

## Files

- `sampleData.ts` - Contains all sample data including contacts, subjects, relationships, and notes

## Data Structure

### Contacts
Each contact has:
- Basic info: id, name, occupation, birthDate, lastInteraction
- Subjects: Array of subject objects (hobbies, interests, activities)
- Relationships: Array of relationship objects (personal, professional, etc.)
- Notes: Array of note IDs

### Subjects
Categories for interests and activities:
- **hobby**: music, art, reading, cooking, gaming, gardening, painting, writing, photography
- **activity**: coffee, sports, yoga, dancing, hiking, swimming, cycling, running, volunteering, meditation
- **interest**: tech, travel, food, languages, science, history, politics, fashion, cars, pets
- **organization**: family

### Relationships
Types of connections:
- **personal**: friend, close friend, acquaintance
- **professional**: colleague, mentor, supervisor
- **romantic**: partner, date

### Notes
Interaction records with:
- Text description
- Person, time, location, event
- Sentiment (positive, neutral, negative)
- Associated contact IDs

## Usage

```typescript
import { getSampleData, sampleContacts, sampleSubjects } from '../data/sampleData';

// Get all sample data
const data = getSampleData();

// Access specific data
const contacts = sampleContacts;
const subjects = sampleSubjects;
```

## Future Database Integration

When you're ready to replace this with database data:

1. **Create database models** that match the TypeScript interfaces
2. **Replace the import** in `ContactContext.tsx` with your database service
3. **Update the data loading logic** to fetch from your database instead of using `getSampleData()`
4. **Keep the same data structure** to maintain compatibility with existing components

## Benefits of This Structure

- **Separation of concerns**: Data is separate from business logic
- **Easy testing**: Can easily swap sample data for test data
- **Database ready**: Structure matches what you'll need for database models
- **Maintainable**: Easy to update sample data without touching the main context
- **Type safety**: Full TypeScript support with proper interfaces
