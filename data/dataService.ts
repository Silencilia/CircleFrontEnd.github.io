import { Contact, Subject, Organization, Occupation, Relationship, Sentiment, Note, Commitment, Draft } from '../contexts/ContactContext';
import { resolveContactTokens } from './strings';
import { SupabaseDataService } from './supabaseDataService';

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
  addNote(note: Omit<Note, 'id' | 'createdAt'>): Promise<Note>;
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

// Helper function to safely access localStorage
const getLocalStorage = (key: string): string | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return null;
};

const setLocalStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
  }
};

const removeLocalStorage = (key: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
  }
};

// Mock implementation that simulates database operations
export class MockDataService implements DataService {
  private data: {
    contacts: Contact[];
    subjects: Subject[];
    organizations: Organization[];
    occupations: Occupation[];
    relationships: Relationship[];
    sentiments: Sentiment[];
    notes: Note[];
    commitments: Commitment[];
    drafts: Draft[];
  };

  constructor() {
    // Initialize with empty data structure
    this.data = {
      contacts: [],
      subjects: [],
      organizations: [],
      occupations: [],
      relationships: [],
      sentiments: [],
      notes: [],
      commitments: [],
      drafts: []
    };
    // Load from localStorage only on the client side
    if (typeof window !== 'undefined') {
      this.loadData();
      // Ensure data is migrated to latest schema (e.g., note titles)
      const changed = this.migrateData();
      if (changed) {
        this.saveData();
      }
    }
  }

  private loadData() {
    const savedData = getLocalStorage('circle-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Validate data structure
        if (this.isValidData(parsed)) {
          this.data = parsed;
          // Run migrations on loaded data
          const changed = this.migrateData();
          if (changed) {
            this.saveData();
          }
        } else {
          console.warn('MockDataService: Invalid data format, using empty data');
          removeLocalStorage('circle-data');
        }
      } catch (error) {
        console.error('MockDataService: Failed to parse saved data, using empty data');
        removeLocalStorage('circle-data');
      }
    }
  }

  // Migrate saved data to ensure required fields exist
  private migrateData(): boolean {
    let changed = false;
    // Backfill missing note titles
    this.data.notes = this.data.notes.map((n: Note) => {
      if (!n.title || (typeof n.title === 'string' && n.title.trim() === '')) {
        const resolvedText = resolveContactTokens(n.text || '', this.data.contacts);
        const generated = this.generateTitleFromText(resolvedText);
        const updated: Note = { ...n, title: generated };
        changed = true;
        return updated;
      }
      return n;
    });
    return changed;
  }

  private generateTitleFromText(text: string): string {
    const fallback = 'Untitled';
    if (!text) return fallback;
    // Use first sentence up to 70 chars, prefer breaking at punctuation
    const trimmed = text.replace(/\s+/g, ' ').trim();
    if (!trimmed) return fallback;
    const sentenceMatch = trimmed.match(/^(.+?)([.!?])\s/);
    const candidate = sentenceMatch ? sentenceMatch[1] : trimmed;
    const maxLen = 70;
    if (candidate.length <= maxLen) return candidate;
    return candidate.slice(0, maxLen).trimEnd() + '…';
  }

  private isValidData(data: any): boolean {
    return data.subjects && Array.isArray(data.subjects) && 
           data.relationships && Array.isArray(data.relationships) &&
           data.contacts && Array.isArray(data.contacts) &&
           data.organizations && Array.isArray(data.organizations) &&
           data.occupations && Array.isArray(data.occupations) &&
           data.sentiments && Array.isArray(data.sentiments) &&
           data.notes && Array.isArray(data.notes) &&
           data.drafts && Array.isArray(data.drafts);
  }

  private saveData(): void {
    setLocalStorage('circle-data', JSON.stringify(this.data));
  }

  private simulateDelay(): Promise<void> {
    // Simulate network delay (50-200ms)
    const delay = Math.random() * 150 + 50;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    await this.simulateDelay();
    
    const contactIndex = this.data.contacts.findIndex(c => c.id === id);
    if (contactIndex === -1) {
      throw new Error(`Contact with id ${id} not found`);
    }
    
    // Update the contact
    this.data.contacts[contactIndex] = { 
      ...this.data.contacts[contactIndex], 
      ...updates 
    };
    
    this.saveData();
    return this.data.contacts[contactIndex];
  }

  async addContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    await this.simulateDelay();
    
    const newContact = { 
      ...contact, 
      id: Date.now().toString(), // Simple ID generation for mock
      isTrashed: false
    };
    
    this.data.contacts.push(newContact);
    this.saveData();
    return newContact;
  }

  async deleteContact(id: string): Promise<void> {
    await this.simulateDelay();
    
    this.loadData(); // Ensure data is loaded
    const initialLength = this.data.contacts.length;
    this.data.contacts = this.data.contacts.filter((c: Contact) => c.id !== id);
    
    if (this.data.contacts.length === initialLength) {
      throw new Error(`Contact with id ${id} not found`);
    }
    
    this.saveData();
  }

  async addSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
    await this.simulateDelay();
    
    const newSubject = { 
      ...subject, 
      id: Date.now().toString() 
    };
    
    this.data.subjects.push(newSubject);
    this.saveData();
    return newSubject;
  }

  async addOrganization(organization: Omit<Organization, 'id'>): Promise<Organization> {
    await this.simulateDelay();
    
    const newOrganization = { 
      ...organization, 
      id: Date.now().toString() 
    };
    
    this.data.organizations.push(newOrganization);
    this.saveData();
    return newOrganization;
  }

  async addOccupation(occupation: Omit<Occupation, 'id'>): Promise<Occupation> {
    await this.simulateDelay();
    
    const newOccupation = { 
      ...occupation, 
      id: Date.now().toString() 
    };
    
    this.data.occupations.push(newOccupation);
    this.saveData();
    return newOccupation;
  }

  async addRelationship(relationship: Omit<Relationship, 'id'>): Promise<Relationship> {
    await this.simulateDelay();
    
    const newRelationship = { 
      ...relationship, 
      id: Date.now().toString() 
    };
    
    this.data.relationships.push(newRelationship);
    this.saveData();
    return newRelationship;
  }

  async addSentiment(sentiment: Omit<Sentiment, 'id'>): Promise<Sentiment> {
    await this.simulateDelay();
    
    const newSentiment = { 
      ...sentiment, 
      id: Date.now().toString() 
    };
    
    this.data.sentiments.push(newSentiment);
    this.saveData();
    return newSentiment;
  }

  async updateSentiment(id: string, updates: Partial<Sentiment>): Promise<Sentiment> {
    await this.simulateDelay();
    
    const sentimentIndex = this.data.sentiments.findIndex(s => s.id === id);
    if (sentimentIndex === -1) {
      throw new Error(`Sentiment with id ${id} not found`);
    }
    
    const updatedSentiment = { 
      ...this.data.sentiments[sentimentIndex], 
      ...updates 
    };
    
    this.data.sentiments[sentimentIndex] = updatedSentiment;
    this.saveData();
    return updatedSentiment;
  }

  async addNote(note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
    await this.simulateDelay();
    
    // Resolve any {{contact:ID}} tokens in text to the latest contact name
    const resolvedText = resolveContactTokens(note.text, this.data.contacts);
    // Ensure title exists (generate from text if missing)
    const ensuredTitle = (note as any).title && (note as any).title.trim().length > 0
      ? (note as any).title
      : this.generateTitleFromText(resolvedText);
    const newNote = { 
      ...note,
      title: ensuredTitle,
      text: resolvedText,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isTrashed: false
    };
    
    this.data.notes.push(newNote);
    this.saveData();
    return newNote;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    await this.simulateDelay();
    
    const noteIndex = this.data.notes.findIndex(n => n.id === id);
    if (noteIndex === -1) {
      throw new Error(`Note with id ${id} not found`);
    }
    
    // Update the note
    this.data.notes[noteIndex] = { 
      ...this.data.notes[noteIndex], 
      ...updates 
    };
    
    this.saveData();
    return this.data.notes[noteIndex];
  }

  async addCommitment(commitment: Omit<Commitment, 'id'>): Promise<Commitment> {
    await this.simulateDelay();
    const newCommitment: Commitment = { ...commitment, id: Date.now().toString() };
    this.data.commitments.push(newCommitment);
    this.saveData();
    return newCommitment;
  }

  async updateCommitment(id: string, updates: Partial<Commitment>): Promise<Commitment> {
    await this.simulateDelay();
    const idx = this.data.commitments.findIndex(c => c.id === id);
    if (idx === -1) throw new Error(`Commitment with id ${id} not found`);
    this.data.commitments[idx] = { ...this.data.commitments[idx], ...updates };
    this.saveData();
    return this.data.commitments[idx];
  }

  async getAllData(): Promise<{
    contacts: Contact[];
    subjects: Subject[];
    organizations: Organization[];
    occupations: Occupation[];
    relationships: Relationship[];
    sentiments: Sentiment[];
    notes: Note[];
    commitments: Commitment[];
    drafts: Draft[];
  }> {
    console.log('📡 MockDataService: getAllData called');
    console.log('🔍 MockDataService: Current internal data source:', {
      contactsCount: this.data.contacts.length,
      sampleContactName: this.data.contacts[0]?.name || 'none'
    });
    
    await this.simulateDelay();
    
    // Reload from localStorage to get latest data
    console.log('🔄 MockDataService: Reloading from localStorage before returning data');
    this.loadData();
    
    console.log('📤 MockDataService: Returning data to caller:', {
      contactsCount: this.data.contacts.length,
      notesCount: this.data.notes.length,
      sampleContactName: this.data.contacts[0]?.name || 'none',
      dataSource: 'localStorage'
    });
    
    // Return a copy to prevent direct mutations
    return {
      contacts: [...this.data.contacts],
      subjects: [...this.data.subjects],
      organizations: [...this.data.organizations],
      occupations: [...this.data.occupations],
      relationships: [...this.data.relationships],
      sentiments: [...this.data.sentiments],
      notes: [...this.data.notes],
      commitments: [...this.data.commitments],
      drafts: [...this.data.drafts]
    };
  }
}

// Choose data service based on environment
const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';

export const dataService: DataService = useSupabase 
  ? new SupabaseDataService() 
  : new MockDataService();
