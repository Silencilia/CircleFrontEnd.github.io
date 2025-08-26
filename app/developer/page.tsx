'use client';

import React from 'react';
import NavigationBar from '../../components/NavigationBar';
import { DeleteTagButton, SubjectTag, RelationshipTag } from '../../components/Tag';

export default function DeveloperPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FBF7F3]">
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-8">
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
                <span className="font-inter text-sm text-circle-primary">Subject (hover to see delete):</span>
                <SubjectTag 
                  subject={{ id: 1, label: 'coffee', category: 'activity' }}
                  editable={true}
                  deletable={true}
                  onEditComplete={() => console.log('Subject edited')}
                  onDeleteComplete={() => console.log('Subject deleted')}
                />
              </div>
              
              {/* Editable Relationship Tag */}
              <div className="flex items-center gap-4">
                <span className="font-inter text-sm text-circle-primary">Relationship (hover to see delete):</span>
                <RelationshipTag 
                  relationship={{ id: 1, label: 'friend', category: 'personal' }}
                  editable={true}
                  deletable={true}
                  onEditComplete={() => console.log('Relationship edited')}
                  onDeleteComplete={() => console.log('Relationship deleted')}
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500 max-w-md mx-auto">
              <p>• Click on tags to edit text (Enter to save, Escape to cancel)</p>
              <p>• Hover over tags to see delete button (5px gap)</p>
              <p>• Delete button appears to the right of tag text</p>
              <p>• All changes log to console for testing</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* NavigationBar */}
      <NavigationBar currentPage="developer" />
    </div>
  );
}
