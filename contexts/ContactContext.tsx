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

export interface Sentiment {
  id: number;
  label: string;
  category: 'positive' | 'neutral' | 'negative';
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

// Normalized state structure for better performance
interface NormalizedState {
  entities: {
    contacts: Record<number, Contact>;
    subjects: Record<number, Subject>;
    organizations: Record<number, Organization>;
    occupations: Record<number, Occupation>;
    relationships: Record<number, Relationship>;
    sentiments: Record<number, Sentiment>;
    notes: Record<number, Note>;
  };
  // Keep arrays for backward compatibility and easy iteration
  contacts: Contact[];
  subjects: Subject[];
  organizations: Organization[];
  occupations: Occupation[];
  relationships: Relationship[];
  sentiments: Sentiment[];
  notes: Note[];
  // UI state
  isLoading: boolean;
  error: string | null;
  // Optimistic updates tracking
  optimisticUpdates: {
    contacts: Set<number>;
    subjects: Set<number>;
    organizations: Set<number>;
    occupations: Set<number>;
    relationships: Set<number>;
    sentiments: Set<number>;
    notes: Set<number>;
  };
}

interface ContactState extends NormalizedState {}

// Helper functions for normalization
const normalizeArray = <T extends { id: number }>(array: T[]): Record<number, T> => {
  return array.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, T>);
};

const denormalizeRecord = <T extends { id: number }>(record: Record<number, T>): T[] => {
  return Object.values(record);
};

// Enhanced action types with selective updates and optimistic actions
type ContactAction =
  // Normalization actions
  | { type: 'SET_CONTACTS'; payload: Contact[] }
  | { type: 'SET_SUBJECTS'; payload: Subject[] }
  | { type: 'SET_ORGANIZATIONS'; payload: Organization[] }
  | { type: 'SET_OCCUPATIONS'; payload: Occupation[] }
  | { type: 'SET_RELATIONSHIPS'; payload: Relationship[] }
  | { type: 'SET_SENTIMENTS'; payload: Sentiment[] }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'SET_ALL_DATA'; payload: { contacts: Contact[]; subjects: Subject[]; organizations: Organization[]; occupations: Occupation[]; relationships: Relationship[]; sentiments: Sentiment[]; notes: Note[] } }
  
  // Selective update actions
  | { type: 'UPDATE_CONTACT_SELECTIVE'; payload: { id: number; updates: Partial<Contact> } }
  | { type: 'UPDATE_SUBJECT_SELECTIVE'; payload: { id: number; updates: Partial<Subject> } }
  | { type: 'UPDATE_ORGANIZATION_SELECTIVE'; payload: { id: number; updates: Partial<Organization> } }
  | { type: 'UPDATE_OCCUPATION_SELECTIVE'; payload: { id: number; updates: Partial<Occupation> } }
  | { type: 'UPDATE_RELATIONSHIP_SELECTIVE'; payload: { id: number; updates: Partial<Relationship> } }
  | { type: 'UPDATE_SENTIMENT_SELECTIVE'; payload: { id: number; updates: Partial<Sentiment> } }
  | { type: 'UPDATE_NOTE_SELECTIVE'; payload: { id: number; updates: Partial<Note> } }
  
  // Add actions
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'ADD_ORGANIZATION'; payload: Organization }
  | { type: 'ADD_OCCUPATION'; payload: Occupation }
  | { type: 'ADD_RELATIONSHIP'; payload: Relationship }
  | { type: 'ADD_SENTIMENT'; payload: Sentiment }
  | { type: 'ADD_NOTE'; payload: Note }
  
  // Delete actions
  | { type: 'DELETE_CONTACT'; payload: number }
  | { type: 'DELETE_SUBJECT'; payload: number }
  | { type: 'DELETE_ORGANIZATION'; payload: number }
  | { type: 'DELETE_OCCUPATION'; payload: number }
  | { type: 'DELETE_RELATIONSHIP'; payload: number }
  | { type: 'DELETE_SENTIMENT'; payload: number }
  | { type: 'DELETE_NOTE'; payload: number }
  
  // Optimistic update actions
  | { type: 'OPTIMISTIC_UPDATE_CONTACT'; payload: { id: number; updates: Partial<Contact> } }
  | { type: 'OPTIMISTIC_ADD_CONTACT'; payload: Contact }
  | { type: 'OPTIMISTIC_DELETE_CONTACT'; payload: number }
  | { type: 'OPTIMISTIC_UPDATE_NOTE'; payload: { id: number; updates: Partial<Note> } }
  | { type: 'OPTIMISTIC_ADD_NOTE'; payload: Note }
  | { type: 'OPTIMISTIC_DELETE_NOTE'; payload: number }
  
  // Rollback optimistic updates
  | { type: 'ROLLBACK_OPTIMISTIC_UPDATE'; payload: { entityType: keyof NormalizedState['entities']; id: number } }
  | { type: 'ROLLBACK_ALL_OPTIMISTIC_UPDATES' }
  
  // UI state actions
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_TO_SAMPLE' }
  | { type: 'RELOAD_FROM_STORAGE' };

const initialState: ContactState = {
  entities: {
    contacts: {},
    subjects: {},
    organizations: {},
    occupations: {},
    relationships: {},
    sentiments: {},
    notes: {},
  },
  contacts: [],
  subjects: [],
  organizations: [],
  occupations: [],
  relationships: [],
  sentiments: [],
  notes: [],
  isLoading: true,
  error: null,
  optimisticUpdates: {
    contacts: new Set(),
    subjects: new Set(),
    organizations: new Set(),
    occupations: new Set(),
    relationships: new Set(),
    sentiments: new Set(),
    notes: new Set(),
  },
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
    case 'SET_SENTIMENTS':
      console.log('ContactContext: Setting sentiments:', action.payload);
      return { ...state, sentiments: action.payload };
    case 'SET_NOTES':
      console.log('ContactContext: Setting notes:', action.payload);
      return { ...state, notes: action.payload };
    case 'SET_ALL_DATA':
      return {
        ...state,
        entities: {
          contacts: normalizeArray(action.payload.contacts),
          subjects: normalizeArray(action.payload.subjects),
          organizations: normalizeArray(action.payload.organizations),
          occupations: normalizeArray(action.payload.occupations),
          relationships: normalizeArray(action.payload.relationships),
          sentiments: normalizeArray(action.payload.sentiments),
          notes: normalizeArray(action.payload.notes),
        },
        contacts: action.payload.contacts,
        subjects: action.payload.subjects,
        organizations: action.payload.organizations,
        occupations: action.payload.occupations,
        relationships: action.payload.relationships,
        sentiments: action.payload.sentiments,
        notes: action.payload.notes,
        isLoading: false,
        error: null
      };
    case 'UPDATE_CONTACT_SELECTIVE':
      return {
        ...state,
        entities: {
          ...state.entities,
          contacts: {
            ...state.entities.contacts,
            [action.payload.id]: {
              ...state.entities.contacts[action.payload.id],
              ...action.payload.updates,
            },
          },
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          contacts: new Set(state.optimisticUpdates.contacts).add(action.payload.id),
        },
      };
    case 'UPDATE_SUBJECT_SELECTIVE':
      return {
        ...state,
        entities: {
          ...state.entities,
          subjects: {
            ...state.entities.subjects,
            [action.payload.id]: {
              ...state.entities.subjects[action.payload.id],
              ...action.payload.updates,
            },
          },
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          subjects: new Set(state.optimisticUpdates.subjects).add(action.payload.id),
        },
      };
    case 'UPDATE_ORGANIZATION_SELECTIVE':
      return {
        ...state,
        entities: {
          ...state.entities,
          organizations: {
            ...state.entities.organizations,
            [action.payload.id]: {
              ...state.entities.organizations[action.payload.id],
              ...action.payload.updates,
            },
          },
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          organizations: new Set(state.optimisticUpdates.organizations).add(action.payload.id),
        },
      };
    case 'UPDATE_OCCUPATION_SELECTIVE':
      return {
        ...state,
        entities: {
          ...state.entities,
          occupations: {
            ...state.entities.occupations,
            [action.payload.id]: {
              ...state.entities.occupations[action.payload.id],
              ...action.payload.updates,
            },
          },
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          occupations: new Set(state.optimisticUpdates.occupations).add(action.payload.id),
        },
      };
    case 'UPDATE_RELATIONSHIP_SELECTIVE':
      return {
        ...state,
        entities: {
          ...state.entities,
          relationships: {
            ...state.entities.relationships,
            [action.payload.id]: {
              ...state.entities.relationships[action.payload.id],
              ...action.payload.updates,
            },
          },
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          relationships: new Set(state.optimisticUpdates.relationships).add(action.payload.id),
        },
      };
    case 'UPDATE_SENTIMENT_SELECTIVE':
      return {
        ...state,
        entities: {
          ...state.entities,
          sentiments: {
            ...state.entities.sentiments,
            [action.payload.id]: {
              ...state.entities.sentiments[action.payload.id],
              ...action.payload.updates,
            },
          },
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          sentiments: new Set(state.optimisticUpdates.sentiments).add(action.payload.id),
        },
      };
    case 'UPDATE_NOTE_SELECTIVE':
      return {
        ...state,
        entities: {
          ...state.entities,
          notes: {
            ...state.entities.notes,
            [action.payload.id]: {
              ...state.entities.notes[action.payload.id],
              ...action.payload.updates,
            },
          },
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          notes: new Set(state.optimisticUpdates.notes).add(action.payload.id),
        },
      };
    case 'ADD_CONTACT':
      return {
        ...state,
        entities: {
          ...state.entities,
          contacts: {
            ...state.entities.contacts,
            [action.payload.id]: action.payload,
          },
        },
        contacts: [...state.contacts, action.payload],
        optimisticUpdates: {
          ...state.optimisticUpdates,
          contacts: new Set(state.optimisticUpdates.contacts).add(action.payload.id),
        },
      };
    case 'ADD_SUBJECT':
      return {
        ...state,
        entities: {
          ...state.entities,
          subjects: {
            ...state.entities.subjects,
            [action.payload.id]: action.payload,
          },
        },
        subjects: [...state.subjects, action.payload],
        optimisticUpdates: {
          ...state.optimisticUpdates,
          subjects: new Set(state.optimisticUpdates.subjects).add(action.payload.id),
        },
      };
    case 'ADD_ORGANIZATION':
      return {
        ...state,
        entities: {
          ...state.entities,
          organizations: {
            ...state.entities.organizations,
            [action.payload.id]: action.payload,
          },
        },
        organizations: [...state.organizations, action.payload],
        optimisticUpdates: {
          ...state.optimisticUpdates,
          organizations: new Set(state.optimisticUpdates.organizations).add(action.payload.id),
        },
      };
    case 'ADD_OCCUPATION':
      return {
        ...state,
        entities: {
          ...state.entities,
          occupations: {
            ...state.entities.occupations,
            [action.payload.id]: action.payload,
          },
        },
        occupations: [...state.occupations, action.payload],
        optimisticUpdates: {
          ...state.optimisticUpdates,
          occupations: new Set(state.optimisticUpdates.occupations).add(action.payload.id),
        },
      };
    case 'ADD_RELATIONSHIP':
      return {
        ...state,
        entities: {
          ...state.entities,
          relationships: {
            ...state.entities.relationships,
            [action.payload.id]: action.payload,
          },
        },
        relationships: [...state.relationships, action.payload],
        optimisticUpdates: {
          ...state.optimisticUpdates,
          relationships: new Set(state.optimisticUpdates.relationships).add(action.payload.id),
        },
      };
    case 'ADD_SENTIMENT':
      return {
        ...state,
        entities: {
          ...state.entities,
          sentiments: {
            ...state.entities.sentiments,
            [action.payload.id]: action.payload,
          },
        },
        sentiments: [...state.sentiments, action.payload],
        optimisticUpdates: {
          ...state.optimisticUpdates,
          sentiments: new Set(state.optimisticUpdates.sentiments).add(action.payload.id),
        },
      };
    case 'ADD_NOTE':
      return {
        ...state,
        entities: {
          ...state.entities,
          notes: {
            ...state.entities.notes,
            [action.payload.id]: action.payload,
          },
        },
        notes: [...state.notes, action.payload],
        optimisticUpdates: {
          ...state.optimisticUpdates,
          notes: new Set(state.optimisticUpdates.notes).add(action.payload.id),
        },
      };
         case 'DELETE_CONTACT':
       const { [action.payload]: deletedContact, ...remainingContacts } = state.entities.contacts;
       return {
         ...state,
         entities: {
           ...state.entities,
           contacts: remainingContacts,
         },
         contacts: state.contacts.filter(contact => contact.id !== action.payload),
         optimisticUpdates: {
           ...state.optimisticUpdates,
           contacts: new Set(state.optimisticUpdates.contacts).add(action.payload),
         },
       };
    case 'DELETE_SUBJECT':
      const { [action.payload]: deletedSubject, ...remainingSubjects } = state.entities.subjects;
      return {
        ...state,
        entities: {
          ...state.entities,
          subjects: remainingSubjects,
        },
        subjects: state.subjects.filter(subject => subject.id !== action.payload),
        optimisticUpdates: {
          ...state.optimisticUpdates,
          subjects: new Set(state.optimisticUpdates.subjects).add(action.payload),
        },
      };
    case 'DELETE_ORGANIZATION':
      const { [action.payload]: deletedOrg, ...remainingOrgs } = state.entities.organizations;
      return {
        ...state,
        entities: {
          ...state.entities,
          organizations: remainingOrgs,
        },
        organizations: state.organizations.filter(org => org.id !== action.payload),
        optimisticUpdates: {
          ...state.optimisticUpdates,
          organizations: new Set(state.optimisticUpdates.organizations).add(action.payload),
        },
      };
    case 'DELETE_OCCUPATION':
      const { [action.payload]: deletedOcc, ...remainingOccs } = state.entities.occupations;
      return {
        ...state,
        entities: {
          ...state.entities,
          occupations: remainingOccs,
        },
        occupations: state.occupations.filter(occ => occ.id !== action.payload),
        optimisticUpdates: {
          ...state.optimisticUpdates,
          occupations: new Set(state.optimisticUpdates.occupations).add(action.payload),
        },
      };
    case 'DELETE_RELATIONSHIP':
      const { [action.payload]: deletedRel, ...remainingRels } = state.entities.relationships;
      return {
        ...state,
        entities: {
          ...state.entities,
          relationships: remainingRels,
        },
        relationships: state.relationships.filter(rel => rel.id !== action.payload),
        optimisticUpdates: {
          ...state.optimisticUpdates,
          relationships: new Set(state.optimisticUpdates.relationships).add(action.payload),
        },
      };
    case 'DELETE_SENTIMENT':
      const { [action.payload]: deletedSent, ...remainingSents } = state.entities.sentiments;
      return {
        ...state,
        entities: {
          ...state.entities,
          sentiments: remainingSents,
        },
        sentiments: state.sentiments.filter(sent => sent.id !== action.payload),
        optimisticUpdates: {
          ...state.optimisticUpdates,
          sentiments: new Set(state.optimisticUpdates.sentiments).add(action.payload),
        },
      };
    case 'DELETE_NOTE':
      const { [action.payload]: deletedNote, ...remainingNotes } = state.entities.notes;
      return {
        ...state,
        entities: {
          ...state.entities,
          notes: remainingNotes,
        },
        notes: state.notes.filter(note => note.id !== action.payload),
        optimisticUpdates: {
          ...state.optimisticUpdates,
          notes: new Set(state.optimisticUpdates.notes).add(action.payload),
        },
      };
    case 'OPTIMISTIC_UPDATE_CONTACT':
      return {
        ...state,
        entities: {
          ...state.entities,
          contacts: {
            ...state.entities.contacts,
            [action.payload.id]: {
              ...state.entities.contacts[action.payload.id],
              ...action.payload.updates,
            },
          },
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          contacts: new Set(state.optimisticUpdates.contacts).add(action.payload.id),
        },
      };
    case 'OPTIMISTIC_ADD_CONTACT':
      return {
        ...state,
        entities: {
          ...state.entities,
          contacts: {
            ...state.entities.contacts,
            [action.payload.id]: action.payload,
          },
        },
        contacts: [...state.contacts, action.payload],
        optimisticUpdates: {
          ...state.optimisticUpdates,
          contacts: new Set(state.optimisticUpdates.contacts).add(action.payload.id),
        },
      };
    case 'OPTIMISTIC_DELETE_CONTACT':
      const { [action.payload]: deletedContactOpt, ...remainingContactsOpt } = state.entities.contacts;
      return {
        ...state,
        entities: {
          ...state.entities,
          contacts: remainingContactsOpt,
        },
        contacts: state.contacts.filter(contact => contact.id !== action.payload),
        optimisticUpdates: {
          ...state.optimisticUpdates,
          contacts: new Set(state.optimisticUpdates.contacts).add(action.payload),
        },
      };
    case 'OPTIMISTIC_UPDATE_NOTE':
      return {
        ...state,
        entities: {
          ...state.entities,
          notes: {
            ...state.entities.notes,
            [action.payload.id]: {
              ...state.entities.notes[action.payload.id],
              ...action.payload.updates,
            },
          },
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          notes: new Set(state.optimisticUpdates.notes).add(action.payload.id),
        },
      };
    case 'OPTIMISTIC_ADD_NOTE':
      return {
        ...state,
        entities: {
          ...state.entities,
          notes: {
            ...state.entities.notes,
            [action.payload.id]: action.payload,
          },
        },
        notes: [...state.notes, action.payload],
        optimisticUpdates: {
          ...state.optimisticUpdates,
          notes: new Set(state.optimisticUpdates.notes).add(action.payload.id),
        },
      };
    case 'OPTIMISTIC_DELETE_NOTE':
      const { [action.payload]: deletedNoteOpt, ...remainingNotesOpt } = state.entities.notes;
      return {
        ...state,
        entities: {
          ...state.entities,
          notes: remainingNotesOpt,
        },
        notes: state.notes.filter(note => note.id !== action.payload),
        optimisticUpdates: {
          ...state.optimisticUpdates,
          notes: new Set(state.optimisticUpdates.notes).add(action.payload),
        },
      };
    case 'ROLLBACK_OPTIMISTIC_UPDATE':
      return {
        ...state,
        entities: {
          ...state.entities,
          [action.payload.entityType]: {
            ...state.entities[action.payload.entityType],
            [action.payload.id]: state.entities[action.payload.entityType][action.payload.id],
          },
        },
        optimisticUpdates: {
          ...state.optimisticUpdates,
          [action.payload.entityType]: new Set(state.optimisticUpdates[action.payload.entityType]).delete(action.payload.id),
        },
      };
    case 'ROLLBACK_ALL_OPTIMISTIC_UPDATES':
      return {
        ...state,
        optimisticUpdates: {
          contacts: new Set(),
          subjects: new Set(),
          organizations: new Set(),
          occupations: new Set(),
          relationships: new Set(),
          sentiments: new Set(),
          notes: new Set(),
        },
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_TO_SAMPLE':
      const sampleData = getSampleData();
      console.log('ContactContext: Resetting to sample data:', sampleData);
      return { 
        ...state, 
        entities: {
          contacts: normalizeArray(sampleData.contacts),
          subjects: normalizeArray(sampleData.subjects),
          organizations: normalizeArray(sampleData.organizations),
          occupations: normalizeArray(sampleData.occupations),
          relationships: normalizeArray(sampleData.relationships),
          sentiments: normalizeArray(sampleData.sentiments),
          notes: normalizeArray(sampleData.notes),
        },
        contacts: sampleData.contacts,
        subjects: sampleData.subjects,
        organizations: sampleData.organizations,
        occupations: sampleData.occupations,
        relationships: sampleData.relationships,
        sentiments: sampleData.sentiments,
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
            entities: {
              contacts: normalizeArray(reconstructedContacts),
              subjects: normalizeArray(data.subjects),
              organizations: normalizeArray(data.organizations || []),
              occupations: normalizeArray(data.occupations || []),
              relationships: normalizeArray(data.relationships),
              sentiments: normalizeArray(data.sentiments || []),
              notes: normalizeArray(data.notes || []),
            },
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
            entities: {
              contacts: normalizeArray(sampleData.contacts),
              subjects: normalizeArray(sampleData.subjects),
              organizations: normalizeArray(sampleData.organizations),
              occupations: normalizeArray(sampleData.occupations),
              relationships: normalizeArray(sampleData.relationships),
              sentiments: normalizeArray(sampleData.sentiments),
              notes: normalizeArray(sampleData.notes),
            },
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
          entities: {
            contacts: normalizeArray(sampleData.contacts),
            subjects: normalizeArray(sampleData.subjects),
            organizations: normalizeArray(sampleData.organizations),
            occupations: normalizeArray(sampleData.occupations),
            relationships: normalizeArray(sampleData.relationships),
            sentiments: normalizeArray(sampleData.sentiments),
            notes: normalizeArray(sampleData.notes),
          },
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
  // Enhanced async methods with optimistic updates
  updateContactAsync: (id: number, updates: Partial<Contact>) => Promise<void>;
  addContactAsync: (contact: Omit<Contact, 'id'>) => Promise<void>;
  deleteContactAsync: (id: number) => Promise<void>;
  addSubjectAsync: (subject: Omit<Subject, 'id'>) => Promise<void>;
  addOrganizationAsync: (organization: Omit<Organization, 'id'>) => Promise<void>;
  addOccupationAsync: (occupation: Omit<Occupation, 'id'>) => Promise<void>;
  addRelationshipAsync: (relationship: Omit<Relationship, 'id'>) => Promise<void>;
  addSentimentAsync: (sentiment: Omit<Sentiment, 'id'>) => Promise<void>;
  addNoteAsync: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<void>;
  // Utility functions for normalized state
  getContactById: (id: number) => Contact | undefined;
  getSubjectById: (id: number) => Subject | undefined;
  getOrganizationById: (id: number) => Organization | undefined;
  getOccupationById: (id: number) => Occupation | undefined;
  getRelationshipById: (id: number) => Relationship | undefined;
  getSentimentById: (id: number) => Sentiment | undefined;
  getNoteById: (id: number) => Note | undefined;
  getContactsBySubject: (subjectId: number) => Contact[];
  getContactsByRelationship: (relationshipId: number) => Contact[];
  getNotesByContact: (contactId: number) => Note[];
  isOptimisticallyUpdated: (entityType: keyof NormalizedState['entities'], id: number) => boolean;
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
        sentiments: state.sentiments,
        notes: state.notes
      }));
    }
  }, [state.contacts, state.subjects, state.organizations, state.occupations, state.relationships, state.sentiments, state.notes, state.isLoading]);

  // Legacy synchronous methods (for backward compatibility)
  const addContact = (contact: Omit<Contact, 'id'>) => {
    const newContact = { ...contact, id: Date.now() };
    dispatch({ type: 'ADD_CONTACT', payload: newContact });
  };

  const updateContact = (id: number, updates: Partial<Contact>) => {
    dispatch({ type: 'UPDATE_CONTACT_SELECTIVE', payload: { id, updates } });
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

  // Enhanced async methods with optimistic updates and selective updates
  const updateContactAsync = async (id: number, updates: Partial<Contact>) => {
    try {
      // Optimistic update
      dispatch({ type: 'OPTIMISTIC_UPDATE_CONTACT', payload: { id, updates } });
      
      // Update via DataService
      await dataService.updateContact(id, updates);
      
      // Confirm the update (remove from optimistic updates)
      dispatch({ type: 'ROLLBACK_OPTIMISTIC_UPDATE', payload: { entityType: 'contacts', id } });
    } catch (error) {
      console.error('Failed to update contact:', error);
      // Rollback optimistic update on error
      dispatch({ type: 'ROLLBACK_OPTIMISTIC_UPDATE', payload: { entityType: 'contacts', id } });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: `Failed to update contact: ${errorMessage}` });
      throw error;
    }
  };

  const addContactAsync = async (contact: Omit<Contact, 'id'>) => {
    try {
      // Optimistic add
      const tempId = Date.now();
      const optimisticContact = { ...contact, id: tempId };
      dispatch({ type: 'OPTIMISTIC_ADD_CONTACT', payload: optimisticContact });
      
      // Add via DataService
      const newContact = await dataService.addContact(contact);
      
      // Replace optimistic contact with real one
      dispatch({ type: 'ROLLBACK_OPTIMISTIC_UPDATE', payload: { entityType: 'contacts', id: tempId } });
      dispatch({ type: 'ADD_CONTACT', payload: newContact });
    } catch (error) {
      console.error('Failed to add contact:', error);
      // Rollback optimistic add on error
      dispatch({ type: 'ROLLBACK_OPTIMISTIC_UPDATE', payload: { entityType: 'contacts', id: Date.now() } });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: `Failed to add contact: ${errorMessage}` });
      throw error;
    }
  };

  const deleteContactAsync = async (id: number) => {
    // Store the contact for potential rollback
    const contactToDelete = state.entities.contacts[id];
    
    try {
      // Optimistic delete
      dispatch({ type: 'OPTIMISTIC_DELETE_CONTACT', payload: id });
      
      // Delete via DataService
      await dataService.deleteContact(id);
      
      // Confirm the delete (remove from optimistic updates)
      dispatch({ type: 'ROLLBACK_OPTIMISTIC_UPDATE', payload: { entityType: 'contacts', id } });
    } catch (error) {
      console.error('Failed to delete contact:', error);
      // Rollback optimistic delete on error
      if (contactToDelete) {
        dispatch({ type: 'ADD_CONTACT', payload: contactToDelete });
      }
      dispatch({ type: 'ROLLBACK_OPTIMISTIC_UPDATE', payload: { entityType: 'contacts', id } });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: `Failed to delete contact: ${errorMessage}` });
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

  const addSentimentAsync = async (sentiment: Omit<Sentiment, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await dataService.addSentiment(sentiment);
      
      const data = await dataService.getAllData();
      dispatch({ type: 'SET_ALL_DATA', payload: data });
    } catch (error) {
      console.error('Failed to add sentiment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: `Failed to add sentiment: ${errorMessage}` });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const addNoteAsync = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      // Optimistic add
      const tempId = Date.now();
      const optimisticNote = { ...note, id: tempId, createdAt: new Date().toISOString() };
      dispatch({ type: 'OPTIMISTIC_ADD_NOTE', payload: optimisticNote });
      
      // Add via DataService
      const newNote = await dataService.addNote(note);
      
      // Replace optimistic note with real one
      dispatch({ type: 'ROLLBACK_OPTIMISTIC_UPDATE', payload: { entityType: 'notes', id: tempId } });
      dispatch({ type: 'ADD_NOTE', payload: newNote });
    } catch (error) {
      console.error('Failed to add note:', error);
      // Rollback optimistic add on error
      dispatch({ type: 'ROLLBACK_OPTIMISTIC_UPDATE', payload: { entityType: 'notes', id: Date.now() } });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_ERROR', payload: `Failed to add note: ${errorMessage}` });
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

  // Utility functions for working with normalized state
  const getContactById = (id: number): Contact | undefined => {
    return state.entities.contacts[id];
  };

  const getSubjectById = (id: number): Subject | undefined => {
    return state.entities.subjects[id];
  };

  const getOrganizationById = (id: number): Organization | undefined => {
    return state.entities.organizations[id];
  };

  const getOccupationById = (id: number): Occupation | undefined => {
    return state.entities.occupations[id];
  };

  const getRelationshipById = (id: number): Relationship | undefined => {
    return state.entities.relationships[id];
  };

  const getSentimentById = (id: number): Sentiment | undefined => {
    return state.entities.sentiments[id];
  };

  const getNoteById = (id: number): Note | undefined => {
    return state.entities.notes[id];
  };

  const getContactsBySubject = (subjectId: number): Contact[] => {
    return state.contacts.filter(contact => contact.subjectIds.includes(subjectId));
  };

  const getContactsByRelationship = (relationshipId: number): Contact[] => {
    return state.contacts.filter(contact => contact.relationshipIds.includes(relationshipId));
  };

  const getNotesByContact = (contactId: number): Note[] => {
    return state.notes.filter(note => note.contactIds.includes(contactId));
  };

  const isOptimisticallyUpdated = (entityType: keyof NormalizedState['entities'], id: number): boolean => {
    return state.optimisticUpdates[entityType].has(id);
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
        // Enhanced async methods with optimistic updates
        updateContactAsync,
        addContactAsync,
        deleteContactAsync,
        addSubjectAsync,
        addOrganizationAsync,
        addOccupationAsync,
        addRelationshipAsync,
        addSentimentAsync,
        addNoteAsync,
        // Utility functions for normalized state
        getContactById,
        getSubjectById,
        getOrganizationById,
        getOccupationById,
        getRelationshipById,
        getSentimentById,
        getNoteById,
        getContactsBySubject,
        getContactsByRelationship,
        getNotesByContact,
        isOptimisticallyUpdated,
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


