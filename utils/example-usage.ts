// utils/example-usage.ts
// Example script showing how to use the entity cleanup functions

import { 
  destroyUnusedOccupations, 
  destroyUnusedOrganizations, 
  destroyUnusedSentiments,
  destroyAllUnusedEntities,
  destroyEmptyContacts,
  destroyAllUnusedEntitiesAndEmptyContacts,
  destroyUnusedNotes,
  destroyEmptyNotes,
  destroyAllUnusedEntitiesAndEmptyContactsAndNotes,
  destroyAllUnusedAndEmptyEntities,
  destroyAllEmptyEntities,
  getEntityUsageStats 
} from './entityCleanup';

/**
 * Example: Clean up unused occupations only
 */
export async function cleanupOccupationsExample() {
  console.log('=== Cleaning up unused occupations ===');
  
  try {
    const result = await destroyUnusedOccupations();
    
    console.log(`Deleted ${result.deletedCount} unused occupations`);
    console.log('Deleted IDs:', result.deletedIds);
    
    if (result.errors.length > 0) {
      console.error('Errors occurred:', result.errors);
    }
  } catch (error) {
    console.error('Failed to cleanup occupations:', error);
  }
}

/**
 * Example: Clean up unused organizations only
 */
export async function cleanupOrganizationsExample() {
  console.log('=== Cleaning up unused organizations ===');
  
  try {
    const result = await destroyUnusedOrganizations();
    
    console.log(`Deleted ${result.deletedCount} unused organizations`);
    console.log('Deleted IDs:', result.deletedIds);
    
    if (result.errors.length > 0) {
      console.error('Errors occurred:', result.errors);
    }
  } catch (error) {
    console.error('Failed to cleanup organizations:', error);
  }
}

/**
 * Example: Clean up unused sentiments only
 */
export async function cleanupSentimentsExample() {
  console.log('=== Cleaning up unused sentiments ===');
  
  try {
    const result = await destroyUnusedSentiments();
    
    console.log(`Deleted ${result.deletedCount} unused sentiments`);
    console.log('Deleted IDs:', result.deletedIds);
    
    if (result.errors.length > 0) {
      console.error('Errors occurred:', result.errors);
    }
  } catch (error) {
    console.error('Failed to cleanup sentiments:', error);
  }
}

/**
 * Example: Clean up both occupations and organizations
 */
export async function cleanupAllExample() {
  console.log('=== Cleaning up all unused entities ===');
  
  try {
    const results = await destroyAllUnusedEntities();
    
    console.log(`Deleted ${results.occupations.deletedCount} unused occupations`);
    console.log(`Deleted ${results.organizations.deletedCount} unused organizations`);
    
    const totalErrors = results.occupations.errors.length + results.organizations.errors.length;
    if (totalErrors > 0) {
      console.error('Errors occurred:', {
        occupationErrors: results.occupations.errors,
        organizationErrors: results.organizations.errors
      });
    }
  } catch (error) {
    console.error('Failed to cleanup entities:', error);
  }
}

/**
 * Example: Clean up empty contacts only
 */
export async function cleanupEmptyContactsExample() {
  console.log('=== Cleaning up empty contacts ===');
  
  try {
    const result = await destroyEmptyContacts();
    
    console.log(`Deleted ${result.deletedCount} empty contacts`);
    console.log('Deleted IDs:', result.deletedIds);
    
    if (result.errors.length > 0) {
      console.error('Errors occurred:', result.errors);
    }
  } catch (error) {
    console.error('Failed to cleanup empty contacts:', error);
  }
}

/**
 * Example: Clean up all unused entities and empty contacts
 */
export async function cleanupEverythingExample() {
  console.log('=== Cleaning up everything ===');
  
  try {
    const results = await destroyAllUnusedEntitiesAndEmptyContacts();
    
    console.log(`Deleted ${results.occupations.deletedCount} unused occupations`);
    console.log(`Deleted ${results.organizations.deletedCount} unused organizations`);
    console.log(`Deleted ${results.contacts.deletedCount} empty contacts`);
    
    const totalErrors = results.occupations.errors.length + results.organizations.errors.length + results.contacts.errors.length;
    if (totalErrors > 0) {
      console.error('Errors occurred:', {
        occupationErrors: results.occupations.errors,
        organizationErrors: results.organizations.errors,
        contactErrors: results.contacts.errors
      });
    }
  } catch (error) {
    console.error('Failed to cleanup everything:', error);
  }
}

/**
 * Example: Clean up unused notes only
 */
export async function cleanupUnusedNotesExample() {
  console.log('=== Cleaning up unused notes ===');
  
  try {
    const result = await destroyUnusedNotes();
    
    console.log(`Deleted ${result.deletedCount} unused notes`);
    console.log('Deleted IDs:', result.deletedIds);
    
    if (result.errors.length > 0) {
      console.error('Errors occurred:', result.errors);
    }
  } catch (error) {
    console.error('Failed to cleanup unused notes:', error);
  }
}

/**
 * Example: Clean up empty notes only
 */
export async function cleanupEmptyNotesExample() {
  console.log('=== Cleaning up empty notes ===');
  
  try {
    const result = await destroyEmptyNotes();
    
    console.log(`Deleted ${result.deletedCount} empty notes`);
    console.log('Deleted IDs:', result.deletedIds);
    
    if (result.errors.length > 0) {
      console.error('Errors occurred:', result.errors);
    }
  } catch (error) {
    console.error('Failed to cleanup empty notes:', error);
  }
}

/**
 * Example: Clean up all empty entities (contacts and notes)
 */
export async function cleanupEmptyEntitiesExample() {
  console.log('=== Cleaning up all empty entities ===');
  
  try {
    const results = await destroyAllEmptyEntities();
    
    console.log(`Deleted ${results.contacts.deletedCount} empty contacts`);
    console.log(`Deleted ${results.notes.deletedCount} empty notes`);
    
    const totalErrors = results.contacts.errors.length + results.notes.errors.length;
    if (totalErrors > 0) {
      console.error('Errors occurred:', {
        contactErrors: results.contacts.errors,
        noteErrors: results.notes.errors
      });
    }
  } catch (error) {
    console.error('Failed to cleanup empty entities:', error);
  }
}

/**
 * Example: Clean up everything including notes
 */
export async function cleanupEverythingWithNotesExample() {
  console.log('=== Cleaning up everything including notes ===');
  
  try {
    const results = await destroyAllUnusedEntitiesAndEmptyContactsAndNotes();
    
    console.log(`Deleted ${results.occupations.deletedCount} unused occupations`);
    console.log(`Deleted ${results.organizations.deletedCount} unused organizations`);
    console.log(`Deleted ${results.contacts.deletedCount} empty contacts`);
    console.log(`Deleted ${results.notes.deletedCount} unused notes`);
    
    const totalErrors = results.occupations.errors.length + results.organizations.errors.length + results.contacts.errors.length + results.notes.errors.length;
    if (totalErrors > 0) {
      console.error('Errors occurred:', {
        occupationErrors: results.occupations.errors,
        organizationErrors: results.organizations.errors,
        contactErrors: results.contacts.errors,
        noteErrors: results.notes.errors
      });
    }
  } catch (error) {
    console.error('Failed to cleanup everything with notes:', error);
  }
}

/**
 * Example: Get usage statistics before cleanup
 */
export async function getStatsExample() {
  console.log('=== Getting entity usage statistics ===');
  
  try {
    const stats = await getEntityUsageStats();
    
    console.log('Occupation stats:', {
      total: stats.occupations.total,
      used: stats.occupations.used,
      unused: stats.occupations.unused
    });
    
    console.log('Organization stats:', {
      total: stats.organizations.total,
      used: stats.organizations.used,
      unused: stats.organizations.unused
    });
    
    console.log('Sentiment stats:', {
      total: stats.sentiments.total,
      used: stats.sentiments.used,
      unused: stats.sentiments.unused
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
  }
}

/**
 * Example: Complete workflow - get stats, then cleanup
 */
export async function completeCleanupWorkflow() {
  console.log('=== Complete cleanup workflow ===');
  
  // First, get current stats
  await getStatsExample();
  
  // Then perform cleanup
  await cleanupAllExample();
  
  // Finally, get stats again to see the results
  console.log('\n=== Stats after cleanup ===');
  await getStatsExample();
}

/**
 * Example: Complete workflow including empty contacts
 */
export async function completeCleanupWorkflowWithContacts() {
  console.log('=== Complete cleanup workflow with contacts ===');
  
  // First, get current stats
  await getStatsExample();
  
  // Then perform complete cleanup including empty contacts
  await cleanupEverythingExample();
  
  // Finally, get stats again to see the results
  console.log('\n=== Stats after complete cleanup ===');
  await getStatsExample();
}

/**
 * Example: Complete workflow including notes
 */
export async function completeCleanupWorkflowWithNotes() {
  console.log('=== Complete cleanup workflow with notes ===');
  
  // First, get current stats
  await getStatsExample();
  
  // Then perform complete cleanup including notes
  await cleanupEverythingWithNotesExample();
  
  // Finally, get stats again to see the results
  console.log('\n=== Stats after complete cleanup with notes ===');
  await getStatsExample();
}

/**
 * Example: Clean up everything including sentiments
 */
export async function cleanupEverythingWithSentimentsExample() {
  console.log('=== Cleaning up everything including sentiments ===');
  
  try {
    const results = await destroyAllUnusedAndEmptyEntities();
    
    console.log(`Deleted ${results.occupations.deletedCount} unused occupations`);
    console.log(`Deleted ${results.organizations.deletedCount} unused organizations`);
    console.log(`Deleted ${results.sentiments.deletedCount} unused sentiments`);
    console.log(`Deleted ${results.contacts.deletedCount} empty contacts`);
    console.log(`Deleted ${results.notes.deletedCount} empty notes`);
    
    const totalErrors = results.occupations.errors.length + results.organizations.errors.length + results.sentiments.errors.length + results.contacts.errors.length + results.notes.errors.length;
    if (totalErrors > 0) {
      console.error('Errors occurred:', {
        occupationErrors: results.occupations.errors,
        organizationErrors: results.organizations.errors,
        sentimentErrors: results.sentiments.errors,
        contactErrors: results.contacts.errors,
        noteErrors: results.notes.errors
      });
    }
  } catch (error) {
    console.error('Failed to cleanup everything with sentiments:', error);
  }
}

/**
 * Example: Complete workflow including sentiments
 */
export async function completeCleanupWorkflowWithSentiments() {
  console.log('=== Complete cleanup workflow with sentiments ===');
  
  // First, get current stats
  await getStatsExample();
  
  // Then perform complete cleanup including sentiments
  await cleanupEverythingWithSentimentsExample();
  
  // Finally, get stats again to see the results
  console.log('\n=== Stats after complete cleanup with sentiments ===');
  await getStatsExample();
}

/**
 * Example: Complete workflow for empty entities only
 */
export async function completeEmptyEntitiesWorkflow() {
  console.log('=== Complete empty entities cleanup workflow ===');
  
  // First, get current stats
  await getStatsExample();
  
  // Then perform empty entities cleanup
  await cleanupEmptyEntitiesExample();
  
  // Finally, get stats again to see the results
  console.log('\n=== Stats after empty entities cleanup ===');
  await getStatsExample();
}

// Uncomment to run examples (make sure to have proper environment setup)
// completeCleanupWorkflow();
