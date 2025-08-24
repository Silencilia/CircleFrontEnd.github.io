'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface Subject {
  id: string;
  label: string;
  category: 'hobby' | 'organization' | 'activity' | 'event' | 'interest' | 'other';
}

export interface Relationship {
  id: string;
  label: string;
  category: 'personal' | 'professional' | 'romantic' | 'family' | 'other';
}

export interface Note {
  id: string;
  text: string;
  person: string;
  time: string;
  location: string;
  event: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  contactIds: string[]; // References to related contacts
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  occupation: string;
  birthDate: string;
  lastInteraction: string;
  subjects: Subject[];
  relationships: Relationship[];
  notes: string[]; // Array of Note IDs
}

interface ContactState {
  contacts: Contact[];
  subjects: Subject[];
  relationships: Relationship[];
  notes: Note[];
  isLoading: boolean;
  error: string | null;
}

type ContactAction =
  | { type: 'SET_CONTACTS'; payload: Contact[] }
  | { type: 'SET_SUBJECTS'; payload: Subject[] }
  | { type: 'SET_RELATIONSHIPS'; payload: Relationship[] }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: { id: string; updates: Partial<Contact> } }
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'ADD_RELATIONSHIP'; payload: Relationship }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_TO_SAMPLE' }
  | { type: 'RELOAD_FROM_STORAGE' };

const initialState: ContactState = {
  contacts: [],
  subjects: [],
  relationships: [],
  notes: [],
  isLoading: true,
  error: null,
};

function contactReducer(state: ContactState, action: ContactAction): ContactState {
  console.log('ContactContext: Reducer action:', action.type);
  
  switch (action.type) {
    case 'SET_CONTACTS':
      console.log('ContactContext: Setting contacts:', action.payload);
      return { ...state, contacts: action.payload, isLoading: false };
    case 'SET_SUBJECTS':
      console.log('ContactContext: Setting subjects:', action.payload);
      return { ...state, subjects: action.payload };
    case 'SET_RELATIONSHIPS':
      console.log('ContactContext: Setting relationships:', action.payload);
      return { ...state, relationships: action.payload };
    case 'SET_NOTES':
      console.log('ContactContext: Setting notes:', action.payload);
      return { ...state, notes: action.payload };
    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts, action.payload] };
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === action.payload.id
            ? { ...contact, ...action.payload.updates }
            : contact
        ),
      };
    case 'DELETE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.filter(contact => contact.id !== action.payload),
      };
    case 'ADD_SUBJECT':
      return { ...state, subjects: [...state.subjects, action.payload] };
    case 'ADD_RELATIONSHIP':
      return { ...state, relationships: [...state.relationships, action.payload] };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_TO_SAMPLE':
      const sampleData = getSampleData();
      console.log('ContactContext: Resetting to sample data:', sampleData);
      return { 
        ...state, 
        contacts: sampleData.contacts, 
        subjects: sampleData.subjects,
        relationships: sampleData.relationships,
        notes: sampleData.notes,
        isLoading: false 
      };
    case 'RELOAD_FROM_STORAGE':
      const savedData = localStorage.getItem('circle-data');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          console.log('ContactContext: Reloading from localStorage:', data);
          
          // Check if the data format is valid (has proper subjects/relationships arrays)
          const isValidData = data.subjects && Array.isArray(data.subjects) && 
                             data.relationships && Array.isArray(data.relationships) &&
                             data.contacts && Array.isArray(data.contacts);
          
          if (!isValidData) {
            console.warn('ContactContext: Invalid data format detected, clearing localStorage');
            localStorage.removeItem('circle-data');
            throw new Error('Invalid data format');
          }
          
          // Return new state with reloaded data
          const reconstructedContacts = data.contacts.map((contact: any) => ({
            ...contact,
            subjects: (contact.subjects || [])
              .map((subjectId: string) => data.subjects.find((s: any) => s.id === subjectId))
              .filter(Boolean),
            relationships: (contact.relationships || [])
              .map((relationshipId: string) => data.relationships.find((r: any) => r.id === relationshipId))
              .filter(Boolean)
          }));
          
          return {
            ...state,
            contacts: reconstructedContacts,
            subjects: data.subjects,
            relationships: data.relationships,
            notes: data.notes || [],
            isLoading: false
          };
          
        } catch (error) {
          console.error('Failed to parse saved data:', error);
          // Clear corrupted data and use fresh sample data
          localStorage.removeItem('circle-data');
          const sampleData = getSampleData();
          return {
            ...state,
            contacts: sampleData.contacts,
            subjects: sampleData.subjects,
            relationships: sampleData.relationships,
            notes: sampleData.notes,
            isLoading: false
          };
        }
      } else {
        const sampleData = getSampleData();
        return {
          ...state,
          contacts: sampleData.contacts,
          subjects: sampleData.subjects,
          relationships: sampleData.relationships,
          notes: sampleData.notes,
          isLoading: false
        };
      }
    default:
      return state;
  }
}

const ContactContext = createContext<{
  state: ContactState;
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  addRelationship: (relationship: Omit<Relationship, 'id'>) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  resetToSample: () => void;
  reloadFromStorage: () => void;
} | null>(null);

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(contactReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    console.log('ContactContext: Starting data load...');
    const savedData = localStorage.getItem('circle-data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        console.log('ContactContext: Loaded from localStorage:', data);
        
        // Check if the data format is valid (has proper subjects/relationships arrays)
        const isValidData = data.subjects && Array.isArray(data.subjects) && 
                           data.relationships && Array.isArray(data.relationships) &&
                           data.contacts && Array.isArray(data.contacts);
        
        if (!isValidData) {
          console.warn('ContactContext: Invalid data format detected, clearing localStorage');
          localStorage.removeItem('circle-data');
          throw new Error('Invalid data format');
        }
        
        // Load base data first
        dispatch({ type: 'SET_SUBJECTS', payload: data.subjects });
        dispatch({ type: 'SET_RELATIONSHIPS', payload: data.relationships });
        dispatch({ type: 'SET_NOTES', payload: data.notes || [] });
        
        // Reconstruct contacts with proper subject and relationship objects
        const reconstructedContacts = data.contacts.map((contact: any) => ({
          ...contact,
          subjects: (contact.subjects || [])
            .map((subjectId: string) => data.subjects.find((s: any) => s.id === subjectId))
            .filter(Boolean),
          relationships: (contact.relationships || [])
            .map((relationshipId: string) => data.relationships.find((r: any) => r.id === relationshipId))
            .filter(Boolean)
        }));
        console.log('ContactContext: Reconstructed contacts with subjects:', reconstructedContacts);
        dispatch({ type: 'SET_CONTACTS', payload: reconstructedContacts });
        
      } catch (error) {
        console.error('Failed to parse saved data:', error);
        // Clear corrupted data and use fresh sample data
        localStorage.removeItem('circle-data');
        const sampleData = getSampleData();
        console.log('ContactContext: Using fresh sample data:', sampleData);
        dispatch({ type: 'SET_SUBJECTS', payload: sampleData.subjects });
        dispatch({ type: 'SET_RELATIONSHIPS', payload: sampleData.relationships });
        dispatch({ type: 'SET_NOTES', payload: sampleData.notes });
        dispatch({ type: 'SET_CONTACTS', payload: sampleData.contacts });
      }
    } else {
      const sampleData = getSampleData();
      console.log('ContactContext: No saved data, using sample data:', sampleData);
      // Load in correct order: subjects, relationships, notes first, then contacts
      dispatch({ type: 'SET_SUBJECTS', payload: sampleData.subjects });
      dispatch({ type: 'SET_RELATIONSHIPS', payload: sampleData.relationships });
      dispatch({ type: 'SET_NOTES', payload: sampleData.notes });
      dispatch({ type: 'SET_CONTACTS', payload: sampleData.contacts });
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!state.isLoading) {
      // Convert contacts to save format with subject/relationship IDs instead of full objects
      const contactsForSave = state.contacts.map(contact => ({
        ...contact,
        subjects: contact.subjects?.map(subject => subject.id) || [],
        relationships: contact.relationships?.map(relationship => relationship.id) || []
      }));

      localStorage.setItem('circle-data', JSON.stringify({
        contacts: contactsForSave,
        subjects: state.subjects,
        relationships: state.relationships,
        notes: state.notes
      }));
    }
  }, [state.contacts, state.subjects, state.relationships, state.notes, state.isLoading]);

  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact = { ...contact, id: Date.now().toString() };
    dispatch({ type: 'ADD_CONTACT', payload: newContact });
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    dispatch({ type: 'UPDATE_CONTACT', payload: { id, updates } });
  };

  const deleteContact = (id: string) => {
    dispatch({ type: 'DELETE_CONTACT', payload: id });
  };

  const addSubject = (subject: Omit<Subject, 'id'>) => {
    const newSubject = { ...subject, id: Date.now().toString() };
    dispatch({ type: 'ADD_SUBJECT', payload: newSubject });
  };

  const addRelationship = (relationship: Omit<Relationship, 'id'>) => {
    const newRelationship = { ...relationship, id: Date.now().toString() };
    dispatch({ type: 'ADD_RELATIONSHIP', payload: newRelationship });
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote = { 
      ...note, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_NOTE', payload: newNote });
  };

  const resetToSample = () => {
    // Clear localStorage to force fresh sample data
    localStorage.removeItem('circle-data');
    dispatch({ type: 'RESET_TO_SAMPLE' });
  };

  const reloadFromStorage = () => {
    dispatch({ type: 'RELOAD_FROM_STORAGE' });
  };

  return (
    <ContactContext.Provider
      value={{
        state,
        addContact,
        updateContact,
        deleteContact,
        addSubject,
        addRelationship,
        addNote,
        resetToSample,
        reloadFromStorage,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
}

// Sample data function
function getSampleData() {
  const subjects: Subject[] = [
    { id: '1', label: 'coffee', category: 'activity' },
    { id: '2', label: 'tech', category: 'interest' },
    { id: '3', label: 'music', category: 'hobby' },
    { id: '4', label: 'travel', category: 'hobby' },
    { id: '5', label: 'family', category: 'organization' },
    { id: '6', label: 'food', category: 'interest' },
    { id: '7', label: 'art', category: 'hobby' },
    { id: '8', label: 'sports', category: 'activity' },
    { id: '9', label: 'reading', category: 'hobby' },
    { id: '10', label: 'photography', category: 'hobby' },
    { id: '11', label: 'cooking', category: 'hobby' },
    { id: '12', label: 'gaming', category: 'hobby' },
    { id: '13', label: 'yoga', category: 'activity' },
    { id: '14', label: 'dancing', category: 'activity' },
    { id: '15', label: 'hiking', category: 'activity' },
    { id: '16', label: 'swimming', category: 'activity' },
    { id: '17', label: 'cycling', category: 'activity' },
    { id: '18', label: 'running', category: 'activity' },
    { id: '19', label: 'gardening', category: 'hobby' },
    { id: '20', label: 'painting', category: 'hobby' },
    { id: '21', label: 'writing', category: 'hobby' },
    { id: '22', label: 'languages', category: 'interest' },
    { id: '23', label: 'science', category: 'interest' },
    { id: '24', label: 'history', category: 'interest' },
    { id: '25', label: 'politics', category: 'interest' },
    { id: '26', label: 'fashion', category: 'interest' },
    { id: '27', label: 'cars', category: 'interest' },
    { id: '28', label: 'pets', category: 'interest' },
    { id: '29', label: 'volunteering', category: 'activity' },
    { id: '30', label: 'meditation', category: 'activity' }
  ];

  const relationships: Relationship[] = [
    { id: '1', label: 'friend', category: 'personal' },
    { id: '2', label: 'colleague', category: 'professional' },
    { id: '3', label: 'mentor', category: 'professional' },
    { id: '4', label: 'supervisor', category: 'professional' },
    { id: '5', label: 'close friend', category: 'personal' },
    { id: '6', label: 'acquaintance', category: 'personal' },
    { id: '7', label: 'partner', category: 'romantic' },
    { id: '8', label: 'date', category: 'romantic' }
  ];

  const notes: Note[] = [
    {
      id: '1',
      text: 'Had coffee and discussed new project ideas',
      person: 'Alex Johnson',
      time: 'Dec 15, 2024 2:00 PM',
      location: 'Starbucks Downtown',
      event: 'Coffee meeting',
      sentiment: 'positive',
      contactIds: ['1'],
      createdAt: '2024-12-15T14:00:00Z'
    },
    {
      id: '2',
      text: 'Team lunch meeting about Q1 strategy',
      person: 'Sarah Chen',
      time: 'Dec 12, 2024 12:00 PM',
      location: 'Office Conference Room',
      event: 'Team meeting',
      sentiment: 'neutral',
      contactIds: ['2'],
      createdAt: '2024-12-12T12:00:00Z'
    }
  ];

  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      occupation: 'Software Engineer',
      birthDate: '1990-05-15',
      lastInteraction: 'Dec 15, 2024',
      subjects: [subjects[0], subjects[1], subjects[2], subjects[5], subjects[8], subjects[12], subjects[14], subjects[21], subjects[26], subjects[28]],
      relationships: [relationships[0], relationships[4]],
      notes: ['1']
    },
    {
      id: '2',
      name: 'Sarah Chen',
      occupation: 'Marketing Manager',
      birthDate: '1988-09-22',
      lastInteraction: 'Dec 12, 2024',
      subjects: [subjects[3], subjects[6], subjects[9], subjects[12], subjects[13], subjects[18], subjects[20], subjects[23], subjects[25], subjects[29]],
      relationships: [relationships[1], relationships[3]],
      notes: ['2']
    },
    {
      id: '3',
      name: 'Michael Rodriguez',
      occupation: 'Designer',
      birthDate: '1992-03-10',
      lastInteraction: 'Dec 10, 2024',
      subjects: [subjects[4], subjects[7], subjects[10], subjects[13], subjects[16], subjects[18], subjects[22], subjects[27], subjects[11], subjects[15]],
      relationships: [relationships[0], relationships[1]],
      notes: []
    },
    {
      id: '4',
      name: 'Emily Watson',
      occupation: 'Product Manager',
      birthDate: '1989-11-05',
      lastInteraction: 'Dec 8, 2024',
      subjects: [subjects[1], subjects[5], subjects[8], subjects[12], subjects[14], subjects[19], subjects[21], subjects[24], subjects[26], subjects[28]],
      relationships: [relationships[1], relationships[2]],
      notes: []
    },
    {
      id: '5',
      name: 'David Kim',
      occupation: 'Data Scientist',
      birthDate: '1991-07-18',
      lastInteraction: 'Dec 5, 2024',
      subjects: [subjects[2], subjects[6], subjects[9], subjects[11], subjects[13], subjects[17], subjects[20], subjects[23], subjects[25], subjects[29]],
      relationships: [relationships[0], relationships[1]],
      notes: []
    },
    {
      id: '6',
      name: 'Lisa Thompson',
      occupation: 'Consultant',
      birthDate: '1987-12-03',
      lastInteraction: 'Dec 3, 2024',
      subjects: [subjects[0], subjects[3], subjects[7], subjects[10], subjects[14], subjects[16], subjects[18], subjects[22], subjects[27], subjects[11]],
      relationships: [relationships[1], relationships[5]],
      notes: []
    },
    {
      id: '7',
      name: 'James Wilson',
      occupation: 'Financial Analyst',
      birthDate: '1986-04-12',
      lastInteraction: 'Dec 1, 2024',
      subjects: [subjects[1], subjects[4], subjects[8], subjects[11], subjects[15], subjects[19], subjects[22], subjects[24], subjects[26], subjects[28]],
      relationships: [relationships[1], relationships[6]],
      notes: []
    },
    {
      id: '8',
      name: 'Maria Garcia',
      occupation: 'UX Researcher',
      birthDate: '1993-08-25',
      lastInteraction: 'Nov 28, 2024',
      subjects: [subjects[0], subjects[2], subjects[5], subjects[9], subjects[12], subjects[16], subjects[20], subjects[23], subjects[25], subjects[29]],
      relationships: [relationships[0], relationships[2]],
      notes: []
    },
    {
      id: '9',
      name: 'Robert Taylor',
      occupation: 'Sales Director',
      birthDate: '1985-01-30',
      lastInteraction: 'Nov 25, 2024',
      subjects: [subjects[3], subjects[6], subjects[10], subjects[13], subjects[17], subjects[18], subjects[21], subjects[27], subjects[11], subjects[14]],
      relationships: [relationships[1], relationships[4]],
      notes: []
    },
    {
      id: '10',
      name: 'Jennifer Lee',
      occupation: 'Content Strategist',
      birthDate: '1994-06-08',
      lastInteraction: 'Nov 22, 2024',
      subjects: [subjects[2], subjects[7], subjects[9], subjects[12], subjects[15], subjects[19], subjects[22], subjects[24], subjects[26], subjects[28]],
      relationships: [relationships[0], relationships[5]],
      notes: []
    },
    {
      id: '11',
      name: 'Christopher Brown',
      occupation: 'Operations Manager',
      birthDate: '1988-12-14',
      lastInteraction: 'Nov 20, 2024',
      subjects: [subjects[1], subjects[4], subjects[8], subjects[11], subjects[14], subjects[16], subjects[20], subjects[23], subjects[25], subjects[29]],
      relationships: [relationships[1], relationships[3]],
      notes: []
    },
    {
      id: '12',
      name: 'Amanda Davis',
      occupation: 'Business Analyst',
      birthDate: '1990-10-03',
      lastInteraction: 'Nov 18, 2024',
      subjects: [subjects[0], subjects[3], subjects[6], subjects[10], subjects[13], subjects[17], subjects[18], subjects[21], subjects[27], subjects[11]],
      relationships: [relationships[0], relationships[1]],
      notes: []
    }
  ];

  return { contacts, subjects, relationships, notes };
}
