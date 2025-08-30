# Circle App Data Layer

This document describes the data architecture and state management system for the Circle contact management application.

## Overview

The app uses a hybrid state management approach combining React Context API with useReducer, enhanced with normalization, selective updates, and optimistic updates for optimal performance and user experience.

## State Management Architecture

### 1. **Normalized State Structure**

The state is now normalized using lookup tables for O(1) access to entities:

```typescript
interface NormalizedState {
  entities: {
    contacts: Record<number, Contact>;
    subjects: Record<number, Subject>;
    organizations: Record<number, Organization>;
    occupations: Record<number, Occupation>;
    relationships: Record<number, Relationship>;
    sentiments: Record<number, Sentiment>;
    notes: Record<number, Note>;
  };
  // Arrays for backward compatibility and easy iteration
  contacts: Contact[];
  subjects: Subject[];
  // ... other arrays
  // UI state
  isLoading: boolean;
  error: string | null;
  // Optimistic updates tracking
  optimisticUpdates: {
    contacts: Set<number>;
    subjects: Set<number>;
    // ... other entity types
  };
}
```

**Benefits:**
- **O(1) Lookups**: Direct access to entities by ID without array iteration
- **Reduced Re-renders**: Components only re-render when specific entities change
- **Memory Efficiency**: No duplicate data storage
- **Scalability**: Performance remains constant as data grows

### 2. **Selective Updates**

Instead of reloading all data after mutations, the app now performs selective updates:

```typescript
// Before: Reloaded entire dataset
const data = await dataService.getAllData();
dispatch({ type: 'SET_ALL_DATA', payload: data });

// After: Selective update with optimistic UI
dispatch({ type: 'OPTIMISTIC_UPDATE_CONTACT', payload: { id, updates } });
await dataService.updateContact(id, updates);
dispatch({ type: 'ROLLBACK_OPTIMISTIC_UPDATE', payload: { entityType: 'contacts', id } });
```

**Benefits:**
- **Faster Updates**: No need to wait for full data reload
- **Better UX**: Immediate UI feedback
- **Reduced Network Calls**: Only update what changed
- **Efficient Rendering**: Components update incrementally

### 3. **Optimistic Updates**

The app now provides immediate UI feedback while operations are in progress:

```typescript
const updateContactAsync = async (id: number, updates: Partial<Contact>) => {
  try {
    // 1. Optimistic update - immediate UI change
    dispatch({ type: 'OPTIMISTIC_UPDATE_CONTACT', payload: { id, updates } });
    
    // 2. Perform actual operation
    await dataService.updateContact(id, updates);
    
    // 3. Confirm update (remove from optimistic tracking)
    dispatch({ type: 'ROLLBACK_OPTIMISTIC_UPDATE', payload: { entityType: 'contacts', id } });
  } catch (error) {
    // 4. Rollback on error
    dispatch({ type: 'ROLLBACK_OPTIMISTIC_UPDATE', payload: { entityType: 'contacts', id } });
    throw error;
  }
};
```

**Benefits:**
- **Instant Feedback**: Users see changes immediately
- **Better Perceived Performance**: App feels faster and more responsive
- **Error Handling**: Automatic rollback on failures
- **Consistent State**: Optimistic updates are tracked and managed

## Key Features

### **Entity Lookup Functions**
```typescript
// Fast O(1) entity access
const contact = getContactById(123);
const subject = getSubjectById(456);

// Relationship queries
const contactsWithSubject = getContactsBySubject(789);
const notesForContact = getNotesByContact(123);
```

### **Optimistic Update Tracking**
```typescript
// Check if an entity has pending optimistic updates
const isPending = isOptimisticallyUpdated('contacts', 123);

// Visual indicators can show pending state
if (isPending) {
  // Show loading spinner or "saving..." indicator
}
```

### **Selective State Updates**
```typescript
// Update only specific fields
dispatch({ 
  type: 'UPDATE_CONTACT_SELECTIVE', 
  payload: { id: 123, updates: { name: 'New Name' } } 
});

// Only the contact with ID 123 will trigger re-renders
```

## Performance Improvements

### **Before (Array-based)**
- **Contact Lookup**: O(n) - iterate through contacts array
- **Update Operations**: O(n) - find and update in array
- **Memory Usage**: Higher due to array overhead
- **Re-renders**: All components re-render on any change

### **After (Normalized)**
- **Contact Lookup**: O(1) - direct object property access
- **Update Operations**: O(1) - direct object property update
- **Memory Usage**: Lower due to efficient data structure
- **Re-renders**: Only affected components re-render

## Migration Guide

### **For Components**

**Before:**
```typescript
const { state } = useContacts();
const contact = state.contacts.find(c => c.id === id);
```

**After:**
```typescript
const { getContactById } = useContacts();
const contact = getContactById(id);
```

### **For Data Operations**

**Before:**
```typescript
const { updateContactAsync } = useContacts();
await updateContactAsync(id, updates); // Reloads all data
```

**After:**
```typescript
const { updateContactAsync } = useContacts();
await updateContactAsync(id, updates); // Selective update with optimistic UI
```

## Data Persistence

The app maintains localStorage persistence with automatic synchronization:

```typescript
// Automatic sync on state changes
useEffect(() => {
  if (!state.isLoading) {
    localStorage.setItem('circle-data', JSON.stringify({
      contacts: state.contacts,
      subjects: state.subjects,
      // ... other entities
    }));
  }
}, [state.contacts, state.subjects, /* ... */]);
```

## Error Handling

Comprehensive error handling with automatic rollbacks:

```typescript
try {
  // Optimistic update
  dispatch({ type: 'OPTIMISTIC_UPDATE_CONTACT', payload: { id, updates } });
  
  // API call
  await dataService.updateContact(id, updates);
  
  // Success - confirm update
  dispatch({ type: 'ROLLBACK_OPTIMISTIC_UPDATE', payload: { entityType: 'contacts', id } });
} catch (error) {
  // Error - rollback optimistic update
  dispatch({ type: 'ROLLBACK_OPTIMISTIC_UPDATE', payload: { entityType: 'contacts', id } });
  dispatch({ type: 'SET_ERROR', payload: error.message });
}
```

## Future Enhancements

- **State Partitioning**: Split large state into focused contexts
- **Selective Persistence**: Only save changed entities
- **Offline Support**: Queue operations when offline
- **Real-time Sync**: WebSocket integration for live updates
- **State Compression**: Efficient serialization for large datasets

## Best Practices

1. **Use Entity Lookups**: Prefer `getContactById()` over array searches
2. **Leverage Optimistic Updates**: Provide immediate feedback for better UX
3. **Handle Loading States**: Use `isOptimisticallyUpdated()` for pending indicators
4. **Error Boundaries**: Implement proper error handling with rollbacks
5. **Performance Monitoring**: Track render performance and optimize as needed

This enhanced state management system provides a solid foundation for scaling the Circle app while maintaining excellent performance and user experience.
