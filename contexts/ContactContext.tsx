'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { dataService } from '../data/dataService';

// Data interfaces
export interface Subject {
  id: number;
  label: string;
  category: string;
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
  category: string;
}

export interface Sentiment {
  id: number;
  label: string;
  category: string;
}

export interface Note {
  id: number;
  text: string;
  time: string;
  sentimentIds: number[];
  contactIds: number[];
  createdAt?: string;
}

export interface Contact {
  id: number;
  name: string;
  occupationId?: number;
  organizationId?: number;
  birthDate?: string;
  lastInteraction: number;
  subjectIds: number[];
  relationshipIds: number[];
  noteIds: number[];
}

// State interface
export interface ContactState {
  contacts: Contact[];
  subjects: Subject[];
  organizations: Organization[];
  occupations: Occupation[];
  relationships: Relationship[];
  sentiments: Sentiment[];
  notes: Note[];
  isLoading: boolean;
  error: string | null;
}

// Action types
type ContactAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: Omit<ContactState, 'isLoading' | 'error'> }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: Contact }
  | { type: 'DELETE_CONTACT'; payload: number }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'UPDATE_SUBJECT'; payload: Subject }
  | { type: 'ADD_ORGANIZATION'; payload: Organization }
  | { type: 'ADD_OCCUPATION'; payload: Occupation }
  | { type: 'RESET_TO_SAMPLE' };

// Initial state
const initialState: ContactState = {
  contacts: [],
  subjects: [],
  organizations: [],
  occupations: [],
  relationships: [],
  sentiments: [],
  notes: [],
  isLoading: true,
  error: null,
};

// Reducer function
function contactReducer(state: ContactState, action: ContactAction): ContactState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_DATA':
      return { ...state, ...action.payload, isLoading: false, error: null };
    
    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts, action.payload] };
    
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(contact =>
          contact.id === action.payload.id ? action.payload : contact
        ),
      };
    
    case 'DELETE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.filter(contact => contact.id !== action.payload),
      };
    
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.payload.id ? action.payload : note
        ),
      };
    
    case 'UPDATE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map(subject =>
          subject.id === action.payload.id ? action.payload : subject
        ),
      };
    
    case 'ADD_ORGANIZATION':
      return { ...state, organizations: [...state.organizations, action.payload] };

    case 'ADD_OCCUPATION':
      return { ...state, occupations: [...state.occupations, action.payload] };
    
    case 'RESET_TO_SAMPLE':
      return { ...initialState, isLoading: true };
    
    default:
      return state;
  }
}

// Context interface
interface ContactContextType {
  state: ContactState;
  // Legacy synchronous methods (for backward compatibility)
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: number, updates: Partial<Contact>) => void;
  deleteContact: (id: number) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  updateNote: (id: number, updates: Partial<Note>) => void;
  resetToSample: () => void;
  // Enhanced async methods with optimistic updates
  updateContactAsync: (id: number, updates: Partial<Contact>) => Promise<void>;
  addContactAsync: (contact: Omit<Contact, 'id'>) => Promise<void>;
  deleteContactAsync: (id: number) => Promise<void>;
  addSubjectAsync: (subject: Omit<Subject, 'id'>) => Promise<void>;
  updateSubjectAsync: (id: number, updates: Partial<Subject>) => Promise<void>;
  addOrganizationAsync: (organization: Omit<Organization, 'id'>) => Promise<Organization>;
  addOccupationAsync: (occupation: Omit<Occupation, 'id'>) => Promise<Occupation>;
  addRelationshipAsync: (relationship: Omit<Relationship, 'id'>) => Promise<void>;
  addSentimentAsync: (sentiment: Omit<Sentiment, 'id'>) => Promise<void>;
  addNoteAsync: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<void>;
  updateNoteAsync: (id: number, updates: Partial<Note>) => Promise<void>;
}

// Create context
const ContactContext = createContext<ContactContextType | undefined>(undefined);

// Provider component
export function ContactProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(contactReducer, initialState);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await dataService.getAllData();
      dispatch({ type: 'SET_DATA', payload: data });
    } catch (error) {
      console.error('Failed to load data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addContact = async (contact: Omit<Contact, 'id'>) => {
    try {
      const newContact = await dataService.addContact(contact);
      dispatch({ type: 'ADD_CONTACT', payload: newContact });
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw error;
    }
  };

  const updateContact = async (id: number, updates: Partial<Contact>) => {
    try {
      const updatedContact = await dataService.updateContact(id, updates);
      dispatch({ type: 'UPDATE_CONTACT', payload: updatedContact });
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  };

  const deleteContact = async (id: number) => {
    try {
      await dataService.deleteContact(id);
      dispatch({ type: 'DELETE_CONTACT', payload: id });
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  };

  const addNote = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      const newNote = await dataService.addNote(note);
      dispatch({ type: 'ADD_NOTE', payload: newNote });
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  };

  const updateNote = async (id: number, updates: Partial<Note>) => {
    try {
      const updatedNote = await dataService.updateNote(id, updates);
      dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  };

  const resetToSample = async () => {
    try {
      dispatch({ type: 'RESET_TO_SAMPLE' });
      await loadData();
    } catch (error) {
      console.error('Failed to reset to sample data:', error);
      throw error;
    }
  };

  // Legacy synchronous methods
  const addContactSync = (contact: Omit<Contact, 'id'>) => {
    const newContact = { ...contact, id: Date.now() };
    dispatch({ type: 'ADD_CONTACT', payload: newContact });
  };

  const updateContactSync = (id: number, updates: Partial<Contact>) => {
    dispatch({ type: 'UPDATE_CONTACT', payload: { id, ...updates } as Contact });
  };

  const deleteContactSync = (id: number) => {
    dispatch({ type: 'DELETE_CONTACT', payload: id });
  };

  const addNoteSync = (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote = { ...note, id: Date.now(), createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_NOTE', payload: newNote });
  };

  const updateNoteSync = (id: number, updates: Partial<Note>) => {
    dispatch({ type: 'UPDATE_NOTE', payload: { id, ...updates } as Note });
  };

  const resetToSampleSync = () => {
    dispatch({ type: 'RESET_TO_SAMPLE' });
    loadData();
  };

  // Enhanced async methods
  const updateContactAsync = async (id: number, updates: Partial<Contact>) => {
    try {
      const updatedContact = await dataService.updateContact(id, updates);
      dispatch({ type: 'UPDATE_CONTACT', payload: updatedContact });
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  };

  const updateSubjectAsync = async (id: number, updates: Partial<Subject>) => {
    try {
      // For now, we'll update the subject in the local state
      // In a real app, you'd call dataService.updateSubject(id, updates)
      const currentSubject = state.subjects.find(s => s.id === id);
      if (currentSubject) {
        const updatedSubject = { ...currentSubject, ...updates };
        dispatch({ type: 'UPDATE_SUBJECT', payload: updatedSubject });
      }
    } catch (error) {
      console.error('Failed to update subject:', error);
      throw error;
    }
  };

  const addContactAsync = async (contact: Omit<Contact, 'id'>) => {
    try {
      const newContact = await dataService.addContact(contact);
      dispatch({ type: 'ADD_CONTACT', payload: newContact });
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw error;
    }
  };

  const deleteContactAsync = async (id: number) => {
    try {
      await dataService.deleteContact(id);
      dispatch({ type: 'DELETE_CONTACT', payload: id });
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  };

  const addSubjectAsync = async (subject: Omit<Subject, 'id'>) => {
    try {
      const newSubject = await dataService.addSubject(subject);
      // Note: We need to add SUBJECT action type to the reducer
      // For now, we'll reload all data
      await loadData();
    } catch (error) {
      console.error('Failed to add subject:', error);
      throw error;
    }
  };

  const addOrganizationAsync = async (organization: Omit<Organization, 'id'>): Promise<Organization> => {
    try {
      const newOrganization = await dataService.addOrganization(organization);
      dispatch({ type: 'ADD_ORGANIZATION', payload: newOrganization });
      return newOrganization;
    } catch (error) {
      console.error('Failed to add organization:', error);
      throw error;
    }
  };

  const addOccupationAsync = async (occupation: Omit<Occupation, 'id'>): Promise<Occupation> => {
    try {
      const newOccupation = await dataService.addOccupation(occupation);
      dispatch({ type: 'ADD_OCCUPATION', payload: newOccupation });
      return newOccupation;
    } catch (error) {
      console.error('Failed to add occupation:', error);
      throw error;
    }
  };

  const addRelationshipAsync = async (relationship: Omit<Relationship, 'id'>) => {
    try {
      const newRelationship = await dataService.addRelationship(relationship);
      // Note: We need to add RELATIONSHIP action type to the reducer
      // For now, we'll reload all data
      await loadData();
    } catch (error) {
      console.error('Failed to add relationship:', error);
      throw error;
    }
  };

  const addSentimentAsync = async (sentiment: Omit<Sentiment, 'id'>) => {
    try {
      const newSentiment = await dataService.addSentiment(sentiment);
      // Note: We need to add SENTIMENT action type to the reducer
      // For now, we'll reload all data
      await loadData();
    } catch (error) {
      console.error('Failed to add sentiment:', error);
      throw error;
    }
  };

  const addNoteAsync = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      const newNote = await dataService.addNote(note);
      dispatch({ type: 'ADD_NOTE', payload: newNote });
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  };

  const updateNoteAsync = async (id: number, updates: Partial<Note>) => {
    try {
      const updatedNote = await dataService.updateNote(id, updates);
      dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  };

  const value: ContactContextType = {
    state,
    addContact: addContactSync,
    updateContact: updateContactSync,
    deleteContact: deleteContactSync,
    addNote: addNoteSync,
    updateNote: updateNoteSync,
    resetToSample: resetToSampleSync,
    updateContactAsync,
    addContactAsync,
    deleteContactAsync,
    addSubjectAsync,
    updateSubjectAsync,
    addOrganizationAsync,
    addOccupationAsync,
    addRelationshipAsync,
    addSentimentAsync,
    addNoteAsync,
    updateNoteAsync,
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
}

// Custom hook to use the context
export function useContacts(): ContactContextType {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
}
