'use client';

import React, { useState } from 'react';
import { useContacts } from '../contexts/ContactContext';

const ContactManager: React.FC = () => {
  const { state, addContact, deleteContact, resetToSample } = useContacts();
  
  const [newContact, setNewContact] = useState({
    name: '',
    occupationId: '',
    organizationId: '',
    birthDate: '',
    lastInteraction: '',
    subjectIds: [] as number[],
    relationshipIds: [] as number[],
    noteIds: [] as number[]
  });

  const formatTimestamp = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString();
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.occupationId && newContact.birthDate) {
      addContact({
        name: newContact.name,
        occupationId: parseInt(newContact.occupationId),
        organizationId: newContact.organizationId ? parseInt(newContact.organizationId) : undefined,
        birthDate: newContact.birthDate,
        lastInteraction: newContact.lastInteraction ? new Date(newContact.lastInteraction).getTime() : Date.now(),
        subjectIds: newContact.subjectIds,
        relationshipIds: newContact.relationshipIds,
        noteIds: newContact.noteIds
      });
      setNewContact({ name: '', occupationId: '', organizationId: '', birthDate: '', lastInteraction: '', subjectIds: [], relationshipIds: [], noteIds: [] });
    }
  };

  const handleDeleteContact = (id: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      deleteContact(id);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Contact Manager</h2>
      
      {/* Add New Contact Form */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Add New Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newContact.occupationId}
            onChange={(e) => setNewContact({ ...newContact, occupationId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Occupation</option>
            {state.occupations.map(occupation => (
              <option key={occupation.id} value={occupation.id}>
                {occupation.title}
              </option>
            ))}
          </select>
          <select
            value={newContact.organizationId}
            onChange={(e) => setNewContact({ ...newContact, organizationId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Organization</option>
            {state.organizations.map(organization => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            placeholder="Birth Date"
            value={newContact.birthDate}
            onChange={(e) => setNewContact({ ...newContact, birthDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <input
            type="date"
            placeholder="Last Interaction (optional)"
            value={newContact.lastInteraction}
            onChange={(e) => setNewContact({ ...newContact, lastInteraction: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleAddContact}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Contact
        </button>
      </div>

      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800">Contacts</h4>
          <p className="text-2xl font-bold text-blue-600">{state.contacts.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-800">Subjects</h4>
          <p className="text-2xl font-bold text-green-600">{state.subjects.length}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <h4 className="font-semibold text-purple-800">Relationships</h4>
          <p className="text-2xl font-bold text-purple-600">{state.relationships.length}</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg">
          <h4 className="font-semibold text-orange-800">Notes</h4>
          <p className="text-2xl font-bold text-orange-600">{state.notes.length}</p>
        </div>
        <div className="p-4 bg-indigo-50 rounded-lg">
          <h4 className="font-semibold text-indigo-800">Organizations</h4>
          <p className="text-2xl font-bold text-indigo-600">{state.organizations.length}</p>
        </div>
      </div>

      {/* Contact List */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">All Contacts ({state.contacts.length})</h3>
          <div className="space-x-2">
            <button
              onClick={() => {
                localStorage.removeItem('circle-data');
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Clear Storage & Reload
            </button>
            <button
              onClick={resetToSample}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reset to Sample Data
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.contacts.map((contact) => {
            // Look up the actual data using IDs
            const occupation = contact.occupationId ? state.occupations.find(o => o.id === contact.occupationId) : null;
            const organization = contact.organizationId ? state.organizations.find(org => org.id === contact.organizationId) : null;
            const subjects = contact.subjectIds ? contact.subjectIds.map(id => state.subjects.find(s => s.id === id)).filter((s): s is NonNullable<typeof s> => s !== undefined) : [];
            const relationships = contact.relationshipIds ? contact.relationshipIds.map(id => state.relationships.find(r => r.id === id)).filter((r): r is NonNullable<typeof r> => r !== undefined) : [];
            
            return (
              <div key={contact.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{contact.name}</h4>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-600 text-sm mb-1">{occupation?.title || 'No occupation'}</p>
                {organization && (
                  <p className="text-gray-600 text-sm mb-1">{organization.name}</p>
                )}
                {contact.birthDate && (
                  <p className="text-gray-500 text-xs mb-1">Birth: {contact.birthDate}</p>
                )}
                {contact.lastInteraction && (
                  <p className="text-gray-500 text-xs mb-2">Last: {formatTimestamp(contact.lastInteraction)}</p>
                )}
                
                {/* Subjects */}
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Subjects:</p>
                  <div className="flex flex-wrap gap-1">
                    {subjects.slice(0, 3).map((subject) => (
                      <span
                        key={subject.id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {subject.label}
                      </span>
                    ))}
                    {subjects.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{subjects.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Relationships */}
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Relationships:</p>
                  <div className="flex flex-wrap gap-1">
                    {relationships.slice(0, 2).map((relationship) => (
                      <span
                        key={relationship.id}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {relationship.label}
                      </span>
                    ))}
                    {relationships.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{relationships.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Notes count */}
                <div className="text-xs text-gray-500">
                  Notes: {contact.noteIds?.length || 0}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Debug Info */}
      <div className="text-xs text-gray-500">
        <p>Data is automatically saved to localStorage. Refresh the page to see persistence.</p>
        <p>Data structure updated: Using ID-based references for better data consistency</p>
      </div>
    </div>
  );
}

export default ContactManager;
