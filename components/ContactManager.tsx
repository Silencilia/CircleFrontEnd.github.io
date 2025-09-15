'use client';

import React, { useState } from 'react';
import { useContacts, Contact } from '../contexts/ContactContext';
import { MONTH_NAMES } from '../data/strings';
import { PrimaryButton, RecycleButton } from './Button';

const ContactManager: React.FC = () => {
  const { state, addContact, deleteContact } = useContacts();
  
  const [newContact, setNewContact] = useState({
    name: '',
    occupation_id: '',
    organization_id: '',
    birth_date: '',
    last_interaction: '',
    subject_ids: [] as string[],
    relationship_ids: [] as string[],
    note_ids: [] as string[]
  });

  const formatTimestamp = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString();
  };

  const handleAddContact = async () => {
    if (newContact.name && newContact.occupation_id) {
      let birth: Contact['birth_date'] | undefined = undefined;
      if (newContact.birth_date) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(newContact.birth_date);
        if (m) {
          const year = parseInt(m[1], 10);
          const month = parseInt(m[2], 10);
          const day = parseInt(m[3], 10);
          birth = { year: isNaN(year) ? null : year, month: isNaN(month) ? null : month, day: isNaN(day) ? null : day };
        }
      }

      try {
        await addContact({
          name: newContact.name,
          occupation_id: newContact.occupation_id,
          organization_id: newContact.organization_id || undefined,
          birth_date: birth,
          last_interaction: newContact.last_interaction ? new Date(newContact.last_interaction).getTime() : Date.now(),
          subject_ids: newContact.subject_ids,
          relationship_ids: newContact.relationship_ids,
          note_ids: newContact.note_ids
        });
        setNewContact({ name: '', occupation_id: '', organization_id: '', birth_date: '', last_interaction: '', subject_ids: [], relationship_ids: [], note_ids: [] });
      } catch (error) {
        console.error('Failed to add contact:', error);
      }
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id);
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
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
            value={newContact.occupation_id}
            onChange={(e) => setNewContact({ ...newContact, occupation_id: e.target.value })}
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
            value={newContact.organization_id}
            onChange={(e) => setNewContact({ ...newContact, organization_id: e.target.value })}
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
            value={newContact.birth_date}
            onChange={(e) => setNewContact({ ...newContact, birth_date: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <input
            type="date"
            placeholder="Last Interaction (optional)"
            value={newContact.last_interaction}
            onChange={(e) => setNewContact({ ...newContact, last_interaction: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <PrimaryButton
          onClick={handleAddContact}
          variant="primary"
          size="lg"
          className="mt-4"
        >
          Add Contact
        </PrimaryButton>
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
            <PrimaryButton
              onClick={() => {
                // TODO: REMOVE - This localStorage usage is unnecessary since we're using Supabase
                // This was used when the app used MockDataService (localStorage)
                // Now that we're using SupabaseDataService, this should be replaced with a proper reset function
                localStorage.removeItem('circle-data');
                window.location.reload();
              }}
              variant="danger"
            >
              Clear Storage & Reload
            </PrimaryButton>
            {/* TODO: Remove resetToSample button - function no longer exists */}
            <PrimaryButton
              onClick={() => {
                alert('Reset to sample data functionality has been removed');
              }}
              variant="secondary"
            >
              Reset to Sample Data (Disabled)
            </PrimaryButton>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.contacts.map((contact) => {
            // Look up the actual data using IDs
            const occupation = contact.occupation_id ? state.occupations.find(o => o.id === contact.occupation_id) : null;
            const organization = contact.organization_id ? state.organizations.find(org => org.id === contact.organization_id) : null;
            const subjects = contact.subject_ids ? contact.subject_ids.map(id => state.subjects.find(s => s.id === id)).filter((s): s is NonNullable<typeof s> => s !== undefined) : [];
            const relationships = contact.relationship_ids ? contact.relationship_ids.map(id => state.relationships.find(r => r.id === id)).filter((r): r is NonNullable<typeof r> => r !== undefined) : [];
            
            return (
              <div key={contact.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{contact.name}</h4>
                  <RecycleButton
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
                        deleteContact(contact.id);
                      }
                    }}
                    ariaLabel={`Delete ${contact.name}`}
                  />
                </div>
                <p className="text-gray-600 text-sm mb-1">{occupation?.title || 'No occupation'}</p>
                {organization && (
                  <p className="text-gray-600 text-sm mb-1">{organization.name}</p>
                )}
                {(() => {
                  const b = contact.birth_date;
                  let label = '';
                  if (b && (b.year || b.month || b.day)) {
                    if (b.year && !b.month && !b.day) label = `${b.year}`;
                    else if (b.year && b.month && !b.day) label = `${MONTH_NAMES[b.month - 1]}, ${b.year}`;
                    else if (b.year && b.month && b.day) label = `${MONTH_NAMES[b.month - 1]} ${b.day}, ${b.year}`;
                  }
                  return label ? (
                    <p className="text-gray-500 text-xs mb-1">Birth: {label}</p>
                  ) : null;
                })()}
                {contact.last_interaction && (
                  <p className="text-gray-500 text-xs mb-2">Last: {formatTimestamp(contact.last_interaction)}</p>
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
                  Notes: {contact.note_ids?.length || 0}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Debug Info */}
      <div className="text-xs text-gray-500">
        <p>Data is automatically saved to Supabase database. Changes persist across sessions.</p>
        <p>Data structure updated: Using ID-based references for better data consistency</p>
      </div>
    </div>
  );
}

export default ContactManager;
