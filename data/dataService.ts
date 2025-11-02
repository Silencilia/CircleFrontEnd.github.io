import { Contact, Subject, Organization, Occupation, Relationship, Sentiment, Note, Commitment, Draft } from '../contexts/ContactContext';
import { SupabaseDataService } from './supabaseDataService';
import { LocalStorageDataService } from './localStorageDataService';

export interface DataService {
  updateContact(id: string, updates: Partial<Contact>): Promise<Contact>;
  addContact(contact: Omit<Contact, 'id'>): Promise<Contact>;
  deleteContact(id: string): Promise<void>;
  addSubject(subject: Omit<Subject, 'id'>): Promise<Subject>;
  addOrganization(organization: Omit<Organization, 'id'>): Promise<Organization>;
  addOccupation(occupation: Omit<Occupation, 'id'>): Promise<Occupation>;
  addRelationship(relationship: Omit<Relationship, 'id'>): Promise<Relationship>;
  addSentiment(sentiment: Omit<Sentiment, 'id'>): Promise<Sentiment>;
  updateSentiment(id: string, updates: Partial<Sentiment>): Promise<Sentiment>;
  addNote(note: Omit<Note, 'id' | 'created_at'>): Promise<Note>;
  updateNote(id: string, updates: Partial<Note>): Promise<Note>;
  // Commitments
  addCommitment(commitment: Omit<Commitment, 'id'>): Promise<Commitment>;
  updateCommitment(id: string, updates: Partial<Commitment>): Promise<Commitment>;
  getAllData(): Promise<{
    contacts: Contact[];
    subjects: Subject[];
    organizations: Organization[];
    occupations: Occupation[];
    relationships: Relationship[];
    sentiments: Sentiment[];
    notes: Note[];
    commitments: Commitment[];
    drafts: Draft[];
  }>;
}

// Export both service implementations
export const supabaseDataService: DataService = new SupabaseDataService();
export const localStorageDataService: DataService = new LocalStorageDataService();

// Default export for backward compatibility (will be replaced by context-based selection)
export const dataService: DataService = supabaseDataService;
