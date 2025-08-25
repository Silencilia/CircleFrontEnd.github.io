// Browser Script to Reload localStorage for Circle App
// Run this in your browser's Developer Console (F12 > Console tab)

console.log('🔄 Circle App - localStorage Reload Script');
console.log('=====================================');

// Function to reload localStorage
function reloadLocalStorage() {
  console.log('🔄 Reloading localStorage...');
  
  try {
    // Get the current data from localStorage
    const currentData = localStorage.getItem('circle-data');
    
    if (currentData) {
      console.log('📦 Current localStorage data found');
      console.log('Data size:', (currentData.length / 1024).toFixed(2) + ' KB');
      
      // Parse and validate the data
      const parsedData = JSON.parse(currentData);
      console.log('✅ Data parsed successfully');
      console.log('Contacts:', parsedData.contacts?.length || 0);
      console.log('Subjects:', parsedData.subjects?.length || 0);
      console.log('Relationships:', parsedData.relationships?.length || 0);
      console.log('Notes:', parsedData.notes?.length || 0);
      
      // Clear and reload the page to trigger fresh data load
      console.log('🔄 Clearing localStorage and reloading page...');
      localStorage.removeItem('circle-data');
      
      // Wait a moment then reload
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } else {
      console.log('⚠️ No localStorage data found');
      console.log('🔄 Reloading page to load fresh data...');
      window.location.reload();
    }
    
  } catch (error) {
    console.error('❌ Error parsing localStorage data:', error);
    console.log('🔄 Clearing corrupted data and reloading...');
    localStorage.removeItem('circle-data');
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
}

// Function to reset to sample data
function resetToSampleData() {
  console.log('🔄 Resetting to sample data...');
  localStorage.removeItem('circle-data');
  
  setTimeout(() => {
    window.location.reload();
  }, 500);
}

// Function to show current localStorage info
function showLocalStorageInfo() {
  console.log('📊 Current localStorage Information:');
  console.log('=====================================');
  
  try {
    const data = localStorage.getItem('circle-data');
    if (data) {
      const parsed = JSON.parse(data);
      console.log('✅ Data exists and is valid');
      console.log('📦 Data size:', (data.length / 1024).toFixed(2) + ' KB');
      console.log('👥 Contacts:', parsed.contacts?.length || 0);
      console.log('🏷️ Subjects:', parsed.subjects?.length || 0);
      console.log('🔗 Relationships:', parsed.relationships?.length || 0);
      console.log('📝 Notes:', parsed.notes?.length || 0);
      console.log('🏢 Organizations:', parsed.organizations?.length || 0);
      console.log('💼 Occupations:', parsed.occupations?.length || 0);
      
      // Show first few contacts
      if (parsed.contacts && parsed.contacts.length > 0) {
        console.log('👥 Sample contacts:');
        parsed.contacts.slice(0, 3).forEach((contact, index) => {
          const occupation = parsed.occupations?.find(o => o.id === contact.occupationId);
          const organization = parsed.organizations?.find(org => org.id === contact.organizationId);
          const occupationText = occupation ? occupation.title : 'No occupation';
          const organizationText = organization ? ` at ${organization.name}` : '';
          console.log(`  ${index + 1}. ${contact.name} (${occupationText}${organizationText})`);
        });
        if (parsed.contacts.length > 3) {
          console.log(`  ... and ${parsed.contacts.length - 3} more`);
        }
      }
    } else {
      console.log('⚠️ No localStorage data found');
    }
  } catch (error) {
    console.error('❌ Error reading localStorage:', error);
  }
}

// Function to clear localStorage completely
function clearLocalStorage() {
  console.log('🗑️ Clearing localStorage completely...');
  localStorage.removeItem('circle-data');
  console.log('✅ localStorage cleared');
  console.log('🔄 Reloading page...');
  
  setTimeout(() => {
    window.location.reload();
  }, 500);
}

// Function to export current data
function exportLocalStorageData() {
  try {
    const data = localStorage.getItem('circle-data');
    if (data) {
      const parsed = JSON.parse(data);
      const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `circle-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      console.log('📤 Data exported successfully');
    } else {
      console.log('⚠️ No data to export');
    }
  } catch (error) {
    console.error('❌ Error exporting data:', error);
  }
}

// Function to import data from clipboard (you'll need to paste JSON data)
function importFromClipboard() {
  console.log('📋 To import data:');
  console.log('1. Copy your JSON data to clipboard');
  console.log('2. Run: importFromClipboard()');
  console.log('3. Paste your data when prompted');
  
  // This would require user interaction, so we'll just show instructions
  console.log('💡 For now, manually paste your JSON data and run:');
  console.log('localStorage.setItem("circle-data", yourJsonString)');
  console.log('Then reload the page');
}

// Main execution
console.log('🚀 Available functions:');
console.log('• reloadLocalStorage() - Reload localStorage and refresh page');
console.log('• resetToSampleData() - Reset to sample data');
console.log('• showLocalStorageInfo() - Show current localStorage status');
console.log('• clearLocalStorage() - Clear localStorage completely');
console.log('• exportLocalStorageData() - Export current data as JSON');
console.log('• importFromClipboard() - Show import instructions');

// Auto-run info display
console.log('\n📊 Current localStorage status:');
showLocalStorageInfo();

console.log('\n✨ Ready! Use any of the functions above to manage localStorage.');
