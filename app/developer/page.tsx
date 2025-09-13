'use client';

import React, { useMemo, useState } from 'react';
import NavigationBar from '../../components/NavigationBar';
import { DeleteTagButton, SubjectTag, RelationshipTag } from '../../components/Tag';
import NoteCard from '../../components/Cards/NoteCard';
import NoteCardDetail from '../../components/Cards/NoteCardDetail';
import CommitmentCard from '../../components/Cards/CommitmentCard';
import ContactCardDetail from '../../components/Cards/ContactCardDetail';
import { useContacts } from '../../contexts/ContactContext';

export default function DeveloperPage() {
  const { state } = useContacts();
  
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
              {state.notes.filter(n => !n.isTrashed).slice(0, 3).map((note) => (
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

          {/* NoteCardDetail Section */}
          <div className="space-y-6">
            <h2 className="font-inter font-semibold text-xl text-circle-primary">
              NoteCardDetail Component
            </h2>
            
            <div className="flex flex-col items-center space-y-4">
              {state.notes.filter(n => !n.isTrashed).length > 0 && (
                <NoteCardDetail 
                  note={state.notes.filter(n => !n.isTrashed)[0]} 
                  onMinimize={() => {}}
                />
              )}
            </div>
            
            <div className="text-xs text-gray-500 max-w-md mx-auto">
              <p>• Shows full note text with scrollable container (max 720px height)</p>
              <p>• Displays note title, date/time, and sentiment tags</p>
              <p>• Delete button shows confirmation dialog</p>
              <p>• Minimize button closes the detail view</p>
              <p>• Scrollbar is hidden but scrolling works with mouse wheel/drag</p>
            </div>
          </div>


          {/* CommitmentCard Section */}
          <div className="space-y-6">
            <h2 className="font-inter font-semibold text-xl text-circle-primary">
              CommitmentCard Component
            </h2>
            <div className="flex flex-row flex-wrap gap-4 items-start justify-center">
              {state.commitments.filter(c => !c.isTrashed).slice(0, 4).map((c) => (
                <CommitmentCard key={c.id} commitment={c} />
              ))}
            </div>
            <div className="text-xs text-gray-500 max-w-md mx-auto text-center">
              <p>• Shows due date/time and description</p>
              <p>• Text truncates to 80px when collapsed; expands with Maximize</p>
              <p>• Uses DeleteIcon and Maximize/Minimize icons like NoteCard</p>
            </div>
          </div>

          {/* ContactCardDetail Section */}
          <div className="space-y-6">
            <h2 className="font-inter font-semibold text-xl text-circle-primary">
              ContactCardDetail Component
            </h2>
            
            <div className="flex flex-col items-center space-y-4">
              {state.contacts.filter(c => !c.isTrashed).slice(0, 1).map((contact) => (
                <ContactCardDetail 
                  key={contact.id} 
                  contact={contact}
                  onMinimize={() => console.log('Contact detail minimized')}
                  onOpenContactDetail={(nextContact) => console.log('Switch to contact:', nextContact.name)}
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
