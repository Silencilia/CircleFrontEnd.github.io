'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getSampleData } from '../data/sampleData';
import { dataService } from '../data/dataService';

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
  | { type: 'SET_ALL_DATA'; payload: { contacts: Contact[]; subjects: Subject[]; organizations: Organization[]; occupations: Occupation[]; relationships: Relationship[]; notes: Note[] } }
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
    case 'SET_ALL_DATA':
      return {
        ...state,
        contacts: action.payload.contacts,
        subjects: action.payload.subjects,
        organizations: action.payload.organizations,
        occupations: action.payload.occupations,
        relationships: action.payload.relationships,
        notes: action.payload.notes,
        isLoading: false,
        error: null
      };
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
  // New async methods for unidirectional data flow
  updateContactAsync: (id: number, updates: Partial<Contact>) => Promise<void>;
  addContactAsync: (contact: Omit<Contact, 'id'>) => Promise<void>;
  deleteContactAsync: (id: number) => Promise<void>;
  addSubjectAsync: (subject: Omit<Subject, 'id'>) => Promise<void>;
  addOrganizationAsync: (organization: Omit<Organization, 'id'>) => Promise<void>;
  addOccupationAsync: (occupation: Omit<Occupation, 'id'>) => Promise<void>;
  addRelationshipAsync: (relationship: Omit<Relationship, 'id'>) => Promise<void>;
  addNoteAsync: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<void>;
} | null>(null);

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(contactReducer, initialState);

  // Load data using DataService on mount
  useEffect(() => {
    console.log('ContactContext: Starting data load using DataService...');
    
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const data = await dataService.getAllData();
        console.log('ContactContext: Loaded data from DataService:', data);
        
        dispatch({ type: 'SET_ALL_DATA', payload: data });
      } catch (error) {
        console.error('ContactContext: Failed to load data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
        dispatch({ type: 'SET_LOADING', payload: false });
        
        // Fallback to sample data
        try {
          const sampleData = getSampleData();
          console.log('ContactContext: Using fallback sample data:', sampleData);
          dispatch({ type: 'SET_ALL_DATA', payload: sampleData });
        } catch (fallbackError) {
          console.error('ContactContext: Even sample data failed:', fallbackError);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to load any data' });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };
    
    loadData();
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

  // Legacy synchronous methods (for backward compatibility)
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

  // New async methods for unidirectional data flow
  const updateContactAsync = async (id: number, updates: Partial<Contact>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Update via DataService
      await dataService.updateContact(id, updates);
      
      // Reload all data to ensure consistency
      const data = await dataService.getAllData();
      dispatch({ type: 'SET_ALL_DATA', payload: data });
    } catch (error) {
      console.error('Failed to update contact:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: `Failed to update contact: ${errorMessage}` });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const addContactAsync = async (contact: Omit<Contact, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await dataService.addContact(contact);
      
      // Reload all data to ensure consistency
      const data = await dataService.getAllData();
      dispatch({ type: 'SET_ALL_DATA', payload: data });
    } catch (error) {
      console.error('Failed to add contact:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: `Failed to add contact: ${errorMessage}` });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const deleteContactAsync = async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await dataService.deleteContact(id);
      
      // Reload all data to ensure consistency
      const data = await dataService.getAllData();
      dispatch({ type: 'SET_ALL_DATA', payload: data });
    } catch (error) {
      console.error('Failed to delete contact:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: `Failed to delete contact: ${errorMessage}` });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const addSubjectAsync = async (subject: Omit<Subject, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await dataService.addSubject(subject);
      
      const data = await dataService.getAllData();
      dispatch({ type: 'SET_ALL_DATA', payload: data });
    } catch (error) {
      console.error('Failed to add subject:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: `Failed to add subject: ${errorMessage}` });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const addOrganizationAsync = async (organization: Omit<Organization, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await dataService.addOrganization(organization);
      
      const data = await dataService.getAllData();
      dispatch({ type: 'SET_ALL_DATA', payload: data });
    } catch (error) {
      console.error('Failed to add organization:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: `Failed to add organization: ${errorMessage}` });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const addOccupationAsync = async (occupation: Omit<Occupation, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await dataService.addOccupation(occupation);
      
      const data = await dataService.getAllData();
      dispatch({ type: 'SET_ALL_DATA', payload: data });
    } catch (error) {
      console.error('Failed to add occupation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: `Failed to add occupation: ${errorMessage}` });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const addRelationshipAsync = async (relationship: Omit<Relationship, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await dataService.addRelationship(relationship);
      
      const data = await dataService.getAllData();
      dispatch({ type: 'SET_ALL_DATA', payload: data });
    } catch (error) {
      console.error('Failed to add relationship:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: `Failed to add relationship: ${errorMessage}` });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const addNoteAsync = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await dataService.addNote(note);
      
      const data = await dataService.getAllData();
      dispatch({ type: 'SET_ALL_DATA', payload: data });
    } catch (error) {
      console.error('Failed to add note:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: `Failed to add note: ${errorMessage}` });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const resetToSample = async () => {
    try {
      // Clear localStorage to force fresh sample data
      localStorage.removeItem('circle-data');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Get fresh sample data
      const sampleData = getSampleData();
      dispatch({ type: 'SET_ALL_DATA', payload: sampleData });
    } catch (error) {
      console.error('Failed to reset to sample data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reset to sample data' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const reloadFromStorage = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await dataService.getAllData();
      dispatch({ type: 'SET_ALL_DATA', payload: data });
    } catch (error) {
      console.error('Failed to reload from storage:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reload data' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
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
        // New async methods
        updateContactAsync,
        addContactAsync,
        deleteContactAsync,
        addSubjectAsync,
        addOrganizationAsync,
        addOccupationAsync,
        addRelationshipAsync,
        addNoteAsync,
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


