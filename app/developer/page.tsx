'use client';

import React, { useState } from 'react';
import NavigationBar from '../../components/NavigationBar';
import { DeleteTagButton, SubjectTag, RelationshipTag } from '../../components/Tag';
import NoteCard from '../../components/NoteCard';
import ContactCardDetail from '../../components/ContactCardDetail';
import { useContacts } from '../../contexts/ContactContext';
import DynamicPrecisionDatePicker, { DynamicPrecisionDateValue } from '../../components/DatePicker';

export default function DeveloperPage() {
  const { state } = useContacts();
  const [dateValue, setDateValue] = useState<DynamicPrecisionDateValue>({ precision: 'none', year: null, month: null, day: null });
  
  return (
    <div className="flex flex-col min-h-screen bg-[#FBF7F3]">
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="text-center space-y-8 w-full max-w-4xl mx-auto flex flex-col items-center">
          <div>
            <h1 className="font-merriweather font-normal text-display-large text-circle-primary mb-4">
              Developer Page
            </h1>
            <p className="font-inter font-normal text-body-medium text-circle-primary">
              This page is for testing purposes.
            </p>
          </div>
          
          {/* DatePicker Section */}
          <div className="space-y-4 w-full flex flex-col items-center">
            <h2 className="font-inter font-semibold text-xl text-circle-primary text-center">DatePicker Component</h2>
            <div className="w-full flex flex-col items-center">
              <DynamicPrecisionDatePicker
                value={dateValue}
                onChange={setDateValue}
                label="Birth date picker"
              />
              <div className="mt-3 bg-circle-neutral p-3 rounded w-[450px]">
                <div className="font-inter text-body-small text-circle-primary">Component Data:</div>
                <pre className="bg-circle-white p-3 rounded text-xs overflow-auto">{JSON.stringify(dateValue, null, 2)}</pre>
              </div>
            </div>
          </div>

          {/* DeleteTagButton Review Section */}
          <div className="space-y-6">
            <h2 className="font-inter font-semibold text-xl text-circle-primary">
              DeleteTagButton Review
            </h2>
            
            <div className="flex flex-col items-center space-y-4">
              {/* Default button */}
              <div className="flex items-center gap-4">
                <span className="font-inter text-sm text-circle-primary">Default:</span>
                <DeleteTagButton 
                  onDelete={() => console.log('Default delete clicked')}
                />
              </div>
              
              {/* Button for white text tag (matches subject tag) */}
              <div className="flex items-center gap-4">
                <span className="font-inter text-sm text-circle-primary">Subject tag style:</span>
                <DeleteTagButton 
                  onDelete={() => console.log('Subject tag delete clicked')}
                  buttonColor="white"
                  iconStrokeColor="#E76835"
                />
              </div>
              
              {/* Button for relationship tag */}
              <div className="flex items-center gap-4">
                <span className="font-inter text-sm text-circle-primary">Relationship tag style:</span>
                <DeleteTagButton 
                  onDelete={() => console.log('Relationship tag delete clicked')}
                  buttonColor="white"
                  iconStrokeColor="#262B35"
                />
              </div>
              
              {/* Button with different colors */}
              <div className="flex items-center gap-4">
                <span className="font-inter text-sm text-circle-primary">Custom colors:</span>
                <DeleteTagButton 
                  onDelete={() => console.log('Custom delete clicked')}
                  buttonColor="#262B35"
                  iconStrokeColor="#FBF7F3"
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500 max-w-md mx-auto">
              <p>• Button size: 10×10px with 6px border radius</p>
              <p>• Icon size: 8×8px, centered</p>
              <p>• Button color should match tag text color</p>
              <p>• Icon color should match tag fill color</p>
            </div>
          </div>

          {/* ContentEditable Tags Section */}
          <div className="space-y-6">
            <h2 className="font-inter font-semibold text-xl text-circle-primary">
              ContentEditable Tags
            </h2>
            
            <div className="flex flex-col items-center space-y-4">
              {/* Editable Subject Tag */}
              <div className="flex items-center gap-4">
                <span className="font-inter text-sm text-circle-primary">Subject:</span>
                <SubjectTag 
                  subject={{ id: 1, label: 'coffee', category: 'activity' }}
                  contactId={state.contacts[0]?.id || 1}
                  editable={true}
                  onEditComplete={() => console.log('Subject edited')}
                />
              </div>
              
              {/* Editable Relationship Tag */}
              <div className="flex items-center gap-4">
                <span className="font-inter text-sm text-circle-primary">Relationship:</span>
                <RelationshipTag 
                  relationship={{ id: 1, label: 'friend', category: 'personal' }}
                  editable={true}
                  onEditComplete={() => console.log('Relationship edited')}
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500 max-w-md mx-auto">
              <p>• Click on tags to edit text (Enter to save, Escape to cancel)</p>
              <p>• All changes log to console for testing</p>
            </div>
          </div>

          {/* NoteCard Section */}
          <div className="space-y-6">
            <h2 className="font-inter font-semibold text-xl text-circle-primary">
              NoteCard Component
            </h2>
            
            <div className="flex flex-col items-center space-y-4">
              {state.notes.slice(0, 3).map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
            
            <div className="text-xs text-gray-500 max-w-md mx-auto">
              <p>• Shows note timestamp, sentiment tags, and description</p>
              <p>• Text is truncated to fit within 3 rows (60px height)</p>
              <p>• Displays sentiment, event, and location as tags</p>
              <p>• Uses 24h time format and 5px gaps between sentiment tags</p>
            </div>
          </div>

          {/* ContactCardDetail Section */}
          <div className="space-y-6">
            <h2 className="font-inter font-semibold text-xl text-circle-primary">
              ContactCardDetail Component
            </h2>
            
            <div className="flex flex-col items-center space-y-4">
              {state.contacts.slice(0, 1).map((contact) => (
                <ContactCardDetail 
                  key={contact.id} 
                  contact={contact}
                  onMinimize={() => console.log('Contact detail minimized')}
                />
              ))}
            </div>
            
            <div className="text-xs text-gray-500 max-w-md mx-auto">
              <p>• Shows detailed contact information with notes and tags</p>
              <p>• Notes section has scrollable container (540px height)</p>
              <p>• Tags section has scrollable container (95px height)</p>
              <p>• Uses CalendarIcon, MinimizeIcon, and NoteIcon</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* NavigationBar */}
      <NavigationBar currentPage="developer" />
    </div>
  );
}
