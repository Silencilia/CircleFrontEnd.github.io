'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useRef } from 'react';
import { DataService, supabaseDataService, localStorageDataService } from '../data/dataService';
import { supabase } from '../lib/supabase';

// Data interfaces

export interface PrecisionDate {
  year: number | null;
  month: number | null; // 1-12
  day: number | null;   // 1-31
}
export interface TimeValue {
  hour: number | null; // 0-23 (24-hour format)
  minute: number | null; // 0-59
}
export interface Subject {
  id: string;
  label: string;
  category: string;
}
export interface Organization {
  id: string;
  name: string;
}

export interface Occupation {
  id: string;
  title: string;
}

export interface Relationship {
  id: string;
  label: string;
  category: string;
}

export interface Sentiment {
  id: string;
  label: string;
  category: string;
}

export interface Draft {
  id: string;
  text: string;
  date: PrecisionDate;
  time: TimeValue;
}


// Helpers for converting to/from TimeValue
export function parseTimeToTimeValue(input: TimeValue | string | Date | null | undefined): TimeValue {
  if (!input) return { hour: null, minute: null };
  if (typeof (input as any).hour === 'number' || (input as any).hour === null) {
    const tv = input as TimeValue;
    const hour = tv.hour == null ? null : Math.max(0, Math.min(23, tv.hour));
    const minute = tv.minute == null ? null : Math.max(0, Math.min(59, tv.minute));
    return { hour, minute };
  }
  if (input instanceof Date) {
    return { hour: input.getHours(), minute: input.getMinutes() };
  }
  if (typeof input === 'string') {
    // Accept HH:mm or h:mm AM/PM
    const hhmm24 = /^(\d{1,2}):(\d{2})$/;
    const hhmm12 = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    let m = input.match(hhmm24);
    if (m) {
      const h = Math.max(0, Math.min(23, parseInt(m[1], 10)));
      const mm = Math.max(0, Math.min(59, parseInt(m[2], 10)));
      return { hour: h, minute: mm };
    }
    m = input.match(hhmm12);
    if (m) {
      let h = Math.max(1, Math.min(12, parseInt(m[1], 10))) % 12; // 0..11
      const mm = Math.max(0, Math.min(59, parseInt(m[2], 10)));
      const ampm = m[3].toUpperCase();
      if (ampm === 'PM') h += 12;
      return { hour: h, minute: mm };
    }
  }
  return { hour: null, minute: null };
}

export function formatTimeValueToString(value: TimeValue | null | undefined): string | undefined {
  if (!value || value.hour == null || value.minute == null) return undefined;
  return `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;
}

export interface Note {
  id: string;
  title: string;
  text: string;
  // Structured time format
  time_value?: TimeValue;
  // New precision-aware date matching Contact.birth_date structure
  date?: PrecisionDate;
  sentiment_ids: string[];
  contact_ids: string[];
  created_at?: string;
  is_trashed?: boolean;
}

// Represents a follow-up item or promise to act
export interface Commitment {
  id: string;
  text: string;
  time: string;
  contact_ids: string[];
  is_trashed: boolean;
}




export interface Contact {
  id: string;
  name: string;
  occupation_id?: string;
  organization_id?: string;
  birth_date?: PrecisionDate;
  subject_ids: string[];
  relationship_ids: string[];
  note_ids: string[];
  is_trashed?: boolean;
  created_at?: string;
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
  commitments: Commitment[];
  drafts: Draft[];
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
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'ADD_COMMITMENT'; payload: Commitment }
  | { type: 'UPDATE_COMMITMENT'; payload: Commitment }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'UPDATE_SUBJECT'; payload: Subject }
  | { type: 'ADD_RELATIONSHIP'; payload: Relationship }
  | { type: 'ADD_ORGANIZATION'; payload: Organization }
  | { type: 'ADD_OCCUPATION'; payload: Occupation }
  | { type: 'ADD_SENTIMENT'; payload: Sentiment }
  | { type: 'UPDATE_SENTIMENT'; payload: Sentiment }
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
  commitments: [],
  drafts: [],
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

    case 'ADD_COMMITMENT':
      return { ...state, commitments: [...state.commitments, action.payload] };

    case 'UPDATE_COMMITMENT':
      return {
        ...state,
        commitments: state.commitments.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    
    case 'UPDATE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map(subject =>
          subject.id === action.payload.id ? action.payload : subject
        ),
      };
    
    case 'ADD_SUBJECT':
      return { ...state, subjects: [...state.subjects, action.payload] };

    case 'ADD_RELATIONSHIP':
      return { ...state, relationships: [...state.relationships, action.payload] };
    
    case 'ADD_ORGANIZATION':
      return { ...state, organizations: [...state.organizations, action.payload] };

    case 'ADD_OCCUPATION':
      return { ...state, occupations: [...state.occupations, action.payload] };

    case 'ADD_SENTIMENT':
      return { ...state, sentiments: [...state.sentiments, action.payload] };

    case 'UPDATE_SENTIMENT':
      return {
        ...state,
        sentiments: state.sentiments.map(sentiment =>
          sentiment.id === action.payload.id ? action.payload : sentiment
        ),
      };
    
    case 'RESET_TO_SAMPLE':
      return { ...initialState, isLoading: true };
    
    default:
      return state;
  }
}

// Context interface
interface ContactContextType {
  state: ContactState;
  //  methods with Supabase integration
  loadData: () => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  addContact: (contact: Omit<Contact, 'id'>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'created_at'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  addCommitment: (commitment: Omit<Commitment, 'id'>) => Promise<void>;
  updateCommitment: (id: string, updates: Partial<Commitment>) => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<Subject>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  addOrganization: (organization: Omit<Organization, 'id'>) => Promise<Organization>;
  addOccupation: (occupation: Omit<Occupation, 'id'>) => Promise<Occupation>;
  addRelationship: (relationship: Omit<Relationship, 'id'>) => Promise<Relationship>;
  addSentiment: (sentiment: Omit<Sentiment, 'id'>) => Promise<Sentiment>;
  updateSentiment: (id: string, updates: Partial<Sentiment>) => Promise<void>;
  // New contact creation
  createNewContact: () => Promise<Contact>;
  // Temporary contact for editing
  createTemporaryContact: () => Contact;
  // New note creation
  createNewNote: () => Promise<Note>;
  // Temporary note for editing
  createTemporaryNote: () => Note;
}

// Create context
const ContactContext = createContext<ContactContextType | undefined>(undefined);

// Provider component
export function ContactProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(contactReducer, initialState);
  
  // Track which data service to use (Supabase or localStorage)
  const dataServiceRef = useRef<DataService>(supabaseDataService);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Reload when auth state changes (sign in/out)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event) => {
      loadData();
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      // Select appropriate data service
      if (user) {
        dataServiceRef.current = supabaseDataService;

        // Cache user ID in sessionStorage for API calls
        sessionStorage.setItem('userId', user.id);

        // Trigger embedding sync in background
        fetch('/api/embeddings/sync', {
          method: 'POST',
          headers: {
            'X-User-ID': user.id,
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then(result => console.log('Embedding sync complete:', result))
          .catch(err => console.error('Embedding sync failed:', err));
      } else {
        dataServiceRef.current = localStorageDataService;
        // Clear cached user ID on sign-out
        sessionStorage.removeItem('userId');
      }

      const data = await dataServiceRef.current.getAllData();
      dispatch({ type: 'SET_DATA', payload: data });
    } catch (error) {
      console.error('Failed to load data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };



  //  methods with data service integration
  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const updatedContact = await dataServiceRef.current.updateContact(id, updates);
      dispatch({ type: 'UPDATE_CONTACT', payload: updatedContact });
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
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

  const addContact = async (contact: Omit<Contact, 'id'>) => {
    try {
      const newContact = await dataServiceRef.current.addContact(contact);
      dispatch({ type: 'ADD_CONTACT', payload: newContact });
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await dataServiceRef.current.deleteContact(id);
      dispatch({ type: 'DELETE_CONTACT', payload: id });
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  };

  const addSubject = async (subject: Omit<Subject, 'id'>) => {
    try {
      const newSubject = await dataServiceRef.current.addSubject(subject);
      dispatch({ type: 'ADD_SUBJECT', payload: newSubject });
      return newSubject;
    } catch (error) {
      console.error('Failed to add subject:', error);
      throw error;
    }
  };

  const addOrganization = async (organization: Omit<Organization, 'id'>): Promise<Organization> => {
    try {
      const newOrganization = await dataServiceRef.current.addOrganization(organization);
      dispatch({ type: 'ADD_ORGANIZATION', payload: newOrganization });
      return newOrganization;
    } catch (error) {
      console.error('Failed to add organization:', error);
      throw error;
    }
  };

  const addOccupation = async (occupation: Omit<Occupation, 'id'>): Promise<Occupation> => {
    try {
      const newOccupation = await dataServiceRef.current.addOccupation(occupation);
      dispatch({ type: 'ADD_OCCUPATION', payload: newOccupation });
      return newOccupation;
    } catch (error) {
      console.error('Failed to add occupation:', error);
      throw error;
    }
  };

  const addRelationship = async (relationship: Omit<Relationship, 'id'>) => {
    try {
      const newRelationship = await dataServiceRef.current.addRelationship(relationship);
      dispatch({ type: 'ADD_RELATIONSHIP', payload: newRelationship });
      return newRelationship;
    } catch (error) {
      console.error('Failed to add relationship:', error);
      throw error;
    }
  };

  const addSentiment = async (sentiment: Omit<Sentiment, 'id'>) => {
    try {
      const newSentiment = await dataServiceRef.current.addSentiment(sentiment);
      // Add the new sentiment to the state immediately
      dispatch({ type: 'ADD_SENTIMENT', payload: newSentiment });
      return newSentiment;
    } catch (error) {
      console.error('Failed to add sentiment:', error);
      throw error;
    }
  };

  const updateSentiment = async (id: string, updates: Partial<Sentiment>) => {
    try {
      const updatedSentiment = await dataServiceRef.current.updateSentiment(id, updates);
      dispatch({ type: 'UPDATE_SENTIMENT', payload: updatedSentiment });
    } catch (error) {
      console.error('Failed to update sentiment:', error);
      throw error;
    }
  };

  const addNote = async (note: Omit<Note, 'id' | 'created_at'>) => {
    try {
      const newNote = await dataServiceRef.current.addNote(note);
      dispatch({ type: 'ADD_NOTE', payload: newNote });
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const updatedNote = await dataServiceRef.current.updateNote(id, updates);
      dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  };

  const addCommitment = async (commitment: Omit<Commitment, 'id'>) => {
    try {
      const created = await dataServiceRef.current.addCommitment(commitment);
      dispatch({ type: 'ADD_COMMITMENT', payload: created });
    } catch (error) {
      console.error('Failed to add commitment:', error);
      throw error;
    }
  };

  const updateCommitment = async (id: string, updates: Partial<Commitment>) => {
    try {
      const updated = await dataServiceRef.current.updateCommitment(id, updates);
      dispatch({ type: 'UPDATE_COMMITMENT', payload: updated });
    } catch (error) {
      console.error('Failed to update commitment:', error);
      throw error;
    }
  };

  const createNewContact = async (): Promise<Contact> => {
    try {
      // Create a new contact with empty values
      const newContact: Omit<Contact, 'id'> = {
        name: '',
        occupation_id: undefined,
        organization_id: undefined,
        birth_date: undefined,
        subject_ids: [],
        relationship_ids: [],
        note_ids: [],
        is_trashed: false
      };
      
      const createdContact = await dataServiceRef.current.addContact(newContact);
      dispatch({ type: 'ADD_CONTACT', payload: createdContact });
      return createdContact;
    } catch (error) {
      console.error('Failed to create new contact:', error);
      throw error;
    }
  };

  const createNewNote = async (): Promise<Note> => {
    try {
      // Create a new note with empty values
      const newNote: Omit<Note, 'id' | 'created_at'> = {
        title: '',
        text: '',
        time_value: { hour: null, minute: null },
        date: { year: null, month: null, day: null },
        sentiment_ids: [],
        contact_ids: [],
        is_trashed: false
      };

      const createdNote = await dataServiceRef.current.addNote(newNote);
      dispatch({ type: 'ADD_NOTE', payload: createdNote });
      return createdNote;
    } catch (error) {
      console.error('Failed to create new note:', error);
      throw error;
    }
  };

  const createTemporaryContact = (): Contact => {
    // Create a temporary contact for editing purposes (not saved to database yet)
    const tempContact: Contact = {
      id: `temp-${Date.now()}`, // Temporary ID
      name: '',
      occupation_id: undefined,
      organization_id: undefined,
      birth_date: undefined,
      subject_ids: [],
      relationship_ids: [],
      note_ids: [],
      is_trashed: false
    };

    return tempContact;
  };

  const createTemporaryNote = (): Note => {
    // Create a temporary note for editing purposes (not saved to database yet)
    const tempNote: Note = {
      id: `temp-${Date.now()}`, // Temporary ID
      title: '',
      text: '',
      time_value: { hour: null, minute: null },
      date: { year: null, month: null, day: null },
      sentiment_ids: [],
      contact_ids: [],
      is_trashed: false
    };

    return tempNote;
  };


  const value: ContactContextType = {
    state,
    loadData,
    addContact,
    updateContact,
    deleteContact,
    addNote,
    updateNote,
    addCommitment,
    updateCommitment,
    addSubject,
    updateSubject,
    addOrganization,
    addOccupation,
    addRelationship,
    addSentiment,
    updateSentiment,
    createNewContact,
    createTemporaryContact,
    createNewNote,
    createTemporaryNote,
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
