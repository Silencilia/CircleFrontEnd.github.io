'use client';

import React, { useEffect, useState } from 'react';
import NavigationBar from '../../components/NavigationBar';
import DraftCardDetail from '../../components/Cards/DraftCardDetail';
import ContactCardDetail from '../../components/Cards/ContactCardDetail';
import NoteCardNew from '../../components/Cards/NoteCardNew';
import { useContacts } from '../../contexts/ContactContext';
import { supabase } from '../../lib/supabase';

export default function DeveloperPage() {
  const { state } = useContacts();
  const [supabaseTest, setSupabaseTest] = useState({
    status: 'Testing...',
    url: '',
    keyExists: false,
    error: null as string | null
  });
  
  const [migrationStatus, setMigrationStatus] = useState('');
  const [dataSourceStatus, setDataSourceStatus] = useState('');
  
  // Test Supabase connection
  useEffect(() => {
    const testSupabase = async () => {
      try {
        console.log('Testing Supabase connection...');
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        
        setSupabaseTest(prev => ({
          ...prev,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
          keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }));
        
        const { data, error } = await supabase
          .from('contacts')
          .select('count');
        
        if (error) {
          console.error('❌ Connection failed:', error);
          setSupabaseTest(prev => ({
            ...prev,
            status: `❌ Error: ${error.message}`,
            error: error.message
          }));
        } else {
          console.log('✅ Supabase connection successful!');
          setSupabaseTest(prev => ({
            ...prev,
            status: `✅ Success! Contact count: ${data?.[0]?.count || 0}`,
            error: null
          }));
        }
      } catch (err) {
        console.error('❌ Error:', err);
        setSupabaseTest(prev => ({
          ...prev,
          status: `❌ Error: ${err}`,
          error: String(err)
        }));
      }
    };
    
    testSupabase();
    
    // Test data source
    const testDataSource = async () => {
      try {
        const contacts = state.contacts;
        const notes = state.notes;
        const drafts = state.drafts;
        const isUsingSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';
        setDataSourceStatus(`Using ${isUsingSupabase ? 'Supabase' : 'Mock Data'} - ${contacts.length} contacts, ${notes.length} notes, ${drafts.length} drafts loaded`);
      } catch (error) {
        setDataSourceStatus(`Error loading data: ${error}`);
      }
    };
    
    testDataSource();
  }, [state.contacts, state.notes, state.drafts]);
  
  // Migration function
  const runMigration = async () => {
    setMigrationStatus('Running migration...');
    try {
      const response = await fetch('/api/migrate', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        setMigrationStatus(`✅ Migration completed! Inserted: ${JSON.stringify(result.summary, null, 2)}`);
      } else {
        setMigrationStatus(`❌ Migration failed: ${result.error}`);
      }
    } catch (error) {
      setMigrationStatus(`❌ Migration failed: ${error}`);
    }
  };
  
  // Sample draft for testing
  const sampleDraft = {
    date: { year: 2024, month: 12, day: 15 },
    time: { hour: 14, minute: 30 },
    text: 'Placeholder of user draft input. These are quick record on the user\'s social encounters, usually done in a hasty manner. A draft is a place where the user store these unsorted information. It also functions as a reserve for unprocessed imported information such as chat history, voice record, screenshot-extracted text, etc. The text container here has a maximum height of 720px (four lines of text). It uses vertical scrolling by dragging or mouse middle key roll for overflow text. This is a longer text to test the scrolling functionality of the DraftCardDetail component.'
  };

  // Sample contact for testing
  const sampleContact = {
    id: '999',
    name: 'John Doe',
    birthDate: { year: 1990, month: 5, day: 15 },
    occupationId: '1',
    organizationId: '1',
    last_interaction: Date.now(),
    subject_ids: ['1', '2'],
    relationship_ids: ['1'],
    note_ids: ['1', '2'],
    isTrashed: false
  };

  // Sample note for testing
  const sampleNote = {
    id: '999',
    title: 'Sample Note',
    text: 'This is a sample note for testing the NoteCardNew component. It contains some text that references @John Doe and shows how the component displays note information with date, time, and sentiment tags.',
    date: { year: 2024, month: 12, day: 15 },
    time_value: { hour: 14, minute: 30 },
    contact_ids: ['999'],
    sentiment_ids: ['1', '2'],
    is_trashed: false
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF7F3]">
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="text-center space-y-8">
          <h1 className="font-merriweather font-normal text-display-large text-circle-primary mb-4">
            Developer Page
          </h1>
          
          {/* Supabase Connection Test Section */}
          <div className="space-y-6">
            <h2 className="font-inter font-semibold text-xl text-circle-primary">
              Supabase Connection Test
            </h2>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border max-w-2xl mx-auto">
              <div className="space-y-4">
                <div className="text-lg font-medium">
                  {supabaseTest.status}
                </div>
                
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Supabase URL:</span>
                    <span className={supabaseTest.url === 'Not set' ? 'text-red-500' : 'text-green-600'}>
                      {supabaseTest.url === 'Not set' ? 'Not set' : 'Set ✓'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Anon Key:</span>
                    <span className={!supabaseTest.keyExists ? 'text-red-500' : 'text-green-600'}>
                      {supabaseTest.keyExists ? 'Set ✓' : 'Not set'}
                    </span>
                  </div>
                </div>
                
                {supabaseTest.error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
                    <strong>Error:</strong> {supabaseTest.error}
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  <p>• Check the browser console (F12) for detailed logs</p>
                  <p>• Make sure your .env.local file exists with correct credentials</p>
                  <p>• Restart the dev server after creating .env.local</p>
                </div>
                
                {/* Data Source Status */}
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <div className="text-sm font-medium text-blue-800">Data Source:</div>
                  <div className="text-sm text-blue-600">{dataSourceStatus}</div>
                </div>
                
                {/* Migration Button */}
                <div className="mt-6 pt-4 border-t">
                  <button 
                    onClick={runMigration}
                    disabled={migrationStatus.includes('Running')}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {migrationStatus.includes('Running') ? 'Running Migration...' : 'Run Migration'}
                  </button>
                  
                  {migrationStatus && (
                    <div className="mt-3 text-sm">
                      <pre className="bg-gray-100 p-3 rounded text-left overflow-auto max-h-40">
                        {migrationStatus}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* DraftCardDetail Section */}
          <div className="space-y-6">
            <h2 className="font-inter font-semibold text-xl text-circle-primary">
              DraftCardDetail Component
            </h2>
            
            <div className="flex flex-col items-center space-y-4">
              <DraftCardDetail 
                draft={sampleDraft}
                onExtract={(draft) => console.log('Extract draft:', draft)}
                onDelete={(draft) => console.log('Delete draft:', draft)}
                onMinimize={() => console.log('Minimize draft detail')}
              />
            </div>
            
            <div className="text-xs text-gray-500 max-w-md mx-auto">
              <p>• Shows draft content with date, time, and text</p>
              <p>• Uses ExtractButton, DeleteButton, and MinimizeButton</p>
              <p>• All text uses body-medium-draft style at 50% opacity</p>
              <p>• Text container has max height of 720px with hidden scrollbar</p>
              <p>• Scroll by mouse wheel or click-hold dragging</p>
            </div>
          </div>

          {/* ContactCardDetail Section */}
          <div className="space-y-6">
            <h2 className="font-inter font-semibold text-xl text-circle-primary">
              ContactCardDetail Component
            </h2>
            
            <div className="flex flex-col items-center space-y-4">
              <ContactCardDetail 
                contact={sampleContact}
                onMinimize={() => console.log('Minimize contact detail')}
                onOpenNote={(note, caller) => console.log('Open note:', note, 'from:', caller)}
                onOpenContactDetail={(contact, caller) => console.log('Open contact detail:', contact, 'from:', caller)}
              />
            </div>
            
            <div className="text-xs text-gray-500 max-w-md mx-auto">
              <p>• Shows contact information with editable name, occupation, and organization</p>
              <p>• Displays birth date with calendar picker</p>
              <p>• Shows notes with scrollable container</p>
              <p>• Displays relationship and subject tags</p>
              <p>• Uses BackButton, RecycleButton, and MinimizeButton</p>
            </div>
          </div>

          {/* NoteCardNew Section */}
          <div className="space-y-6">
            <h2 className="font-inter font-semibold text-xl text-circle-primary">
              NoteCardNew Component
            </h2>
            
            <div className="flex flex-col items-center space-y-4">
              <NoteCardNew 
                note={sampleNote}
                onMinimize={() => console.log('Minimize note detail')}
                onOpenContactDetail={(contact, caller) => console.log('Open contact detail:', contact, 'from:', caller)}
              />
            </div>
            
            <div className="text-xs text-gray-500 max-w-md mx-auto">
              <p>• Shows note information with title, date, time, and text content</p>
              <p>• Displays clickable date and time for editing</p>
              <p>• Shows sentiment tags below the text</p>
              <p>• Uses ConfirmButton and CancelButton components</p>
              <p>• Supports contact references in text with @ syntax</p>
            </div>
          </div>

        </div>
      </div>
      
      {/* NavigationBar */}
      <NavigationBar currentPage="developer" />
    </div>
  );
}
