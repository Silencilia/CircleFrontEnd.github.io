'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getSampleData } from '../data/sampleData';

export interface Subject {
  id: number;
  label: string;
  category: 'hobby' | 'organization' | 'activity' | 'event' | 'interest' | 'other';
}

export interface Organization {
  id: number;
  name: string;
}

export interface Occupation {
  id: number;
  title: string;
}

export interface Relationship {
  id: number;
  label: string;
  category: 'personal' | 'professional' | 'romantic' | 'family' | 'other';
}

export interface Note {
  id: number;
  text: string;
  person: string;
  time: string;
  location: string;
  event: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  contactIds: number[]; // References to related contacts
  createdAt: string;
}

export interface Contact {
  id: number;
  name: string;
  birthDate?: string;
  occupationId?: number;
  organizationId?: number;
  lastInteraction?: number;
  relationshipIds: number[];
  subjectIds: number[];
  noteIds: number[];
}

interface ContactState {
  contacts: Contact[];
  subjects: Subject[];
  organizations: Organization[];
  occupations: Occupation[];
  relationships: Relationship[];
  notes: Note[];
  isLoading: boolean;
  error: string | null;
}

type ContactAction =
  | { type: 'SET_CONTACTS'; payload: Contact[] }
  | { type: 'SET_SUBJECTS'; payload: Subject[] }
  | { type: 'SET_ORGANIZATIONS'; payload: Organization[] }
  | { type: 'SET_OCCUPATIONS'; payload: Occupation[] }
  | { type: 'SET_RELATIONSHIPS'; payload: Relationship[] }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: { id: number; updates: Partial<Contact> } }
  | { type: 'DELETE_CONTACT'; payload: number }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'ADD_ORGANIZATION'; payload: Organization }
  | { type: 'ADD_OCCUPATION'; payload: Occupation }
  | { type: 'ADD_RELATIONSHIP'; payload: Relationship }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_TO_SAMPLE' }
  | { type: 'RELOAD_FROM_STORAGE' };

const initialState: ContactState = {
  contacts: [],
  subjects: [],
  organizations: [],
  occupations: [],
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
    case 'SET_ORGANIZATIONS':
      console.log('ContactContext: Setting organizations:', action.payload);
      return { ...state, organizations: action.payload };
    case 'SET_OCCUPATIONS':
      console.log('ContactContext: Setting occupations:', action.payload);
      return { ...state, occupations: action.payload };
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
    case 'ADD_ORGANIZATION':
      return { ...state, organizations: [...state.organizations, action.payload] };
    case 'ADD_OCCUPATION':
      return { ...state, occupations: [...state.occupations, action.payload] };
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
        organizations: sampleData.organizations,
        occupations: sampleData.occupations,
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
            organizations: data.organizations || [],
            occupations: data.occupations || [],
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
            organizations: sampleData.organizations,
            occupations: sampleData.occupations,
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
          organizations: sampleData.organizations,
          occupations: sampleData.occupations,
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
  updateContact: (id: number, updates: Partial<Contact>) => void;
  deleteContact: (id: number) => void;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  addOrganization: (organization: Omit<Organization, 'id'>) => void;
  addOccupation: (occupation: Omit<Occupation, 'id'>) => void;
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
          dispatch({ type: 'SET_ORGANIZATIONS', payload: data.organizations || [] });
          dispatch({ type: 'SET_OCCUPATIONS', payload: data.occupations || [] });
          dispatch({ type: 'SET_RELATIONSHIPS', payload: data.relationships });
          dispatch({ type: 'SET_NOTES', payload: data.notes || [] });
        
        // Reconstruct contacts with proper subject and relationship objects
        const reconstructedContacts = data.contacts.map((contact: any) => ({
          ...contact,
          occupation: data.occupations?.find((o: any) => o.id === contact.occupation) || null,
          organization: data.organizations?.find((org: any) => org.id === contact.organization) || null,
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
        dispatch({ type: 'SET_ORGANIZATIONS', payload: sampleData.organizations });
        dispatch({ type: 'SET_OCCUPATIONS', payload: sampleData.occupations });
        dispatch({ type: 'SET_RELATIONSHIPS', payload: sampleData.relationships });
        dispatch({ type: 'SET_NOTES', payload: sampleData.notes });
        dispatch({ type: 'SET_CONTACTS', payload: sampleData.contacts });
      }
    } else {
      const sampleData = getSampleData();
      console.log('ContactContext: No saved data, using sample data:', sampleData);
      // Load in correct order: subjects, relationships, notes first, then contacts
      dispatch({ type: 'SET_SUBJECTS', payload: sampleData.subjects });
      dispatch({ type: 'SET_ORGANIZATIONS', payload: sampleData.organizations });
      dispatch({ type: 'SET_OCCUPATIONS', payload: sampleData.occupations });
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
        occupation: contact.occupationId || null,
        organization: contact.organizationId || null,
        subjects: contact.subjectIds || [],
        relationships: contact.relationshipIds || []
      }));

      localStorage.setItem('circle-data', JSON.stringify({
        contacts: contactsForSave,
        subjects: state.subjects,
        organizations: state.organizations,
        occupations: state.occupations,
        relationships: state.relationships,
        notes: state.notes
      }));
    }
  }, [state.contacts, state.subjects, state.organizations, state.occupations, state.relationships, state.notes, state.isLoading]);

  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact = { ...contact, id: Date.now() };
    dispatch({ type: 'ADD_CONTACT', payload: newContact });
  };

  const updateContact = (id: number, updates: Partial<Contact>) => {
    dispatch({ type: 'UPDATE_CONTACT', payload: { id, updates } });
  };

  const deleteContact = (id: number) => {
    dispatch({ type: 'DELETE_CONTACT', payload: id });
  };

  const addSubject = (subject: Omit<Subject, 'id'>) => {
    const newSubject = { ...subject, id: Date.now() };
    dispatch({ type: 'ADD_SUBJECT', payload: newSubject });
  };

  const addOrganization = (organization: Omit<Organization, 'id'>) => {
    const newOrganization = { ...organization, id: Date.now() };
    dispatch({ type: 'ADD_ORGANIZATION', payload: newOrganization });
  };

  const addOccupation = (occupation: Omit<Occupation, 'id'>) => {
    const newOccupation = { ...occupation, id: Date.now() };
    dispatch({ type: 'ADD_OCCUPATION', payload: newOccupation });
  };

  const addRelationship = (relationship: Omit<Relationship, 'id'>) => {
    const newRelationship = { ...relationship, id: Date.now() };
    dispatch({ type: 'ADD_RELATIONSHIP', payload: newRelationship });
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote = { 
      ...note, 
      id: Date.now(),
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
        addOrganization,
        addOccupation,
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


