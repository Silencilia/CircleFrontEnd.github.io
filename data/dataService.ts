import { Contact, Subject, Organization, Occupation, Relationship, Sentiment, Note, Commitment } from '../contexts/ContactContext';
import { getSampleData } from './sampleData';
import { resolveContactTokens } from './strings';

export interface DataService {
  updateContact(id: number, updates: Partial<Contact>): Promise<Contact>;
  addContact(contact: Omit<Contact, 'id'>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;
  addSubject(subject: Omit<Subject, 'id'>): Promise<Subject>;
  addOrganization(organization: Omit<Organization, 'id'>): Promise<Organization>;
  addOccupation(occupation: Omit<Occupation, 'id'>): Promise<Occupation>;
  addRelationship(relationship: Omit<Relationship, 'id'>): Promise<Relationship>;
  addSentiment(sentiment: Omit<Sentiment, 'id'>): Promise<Sentiment>;
  addNote(note: Omit<Note, 'id' | 'createdAt'>): Promise<Note>;
  updateNote(id: number, updates: Partial<Note>): Promise<Note>;
  // Commitments
  addCommitment(commitment: Omit<Commitment, 'id'>): Promise<Commitment>;
  updateCommitment(id: number, updates: Partial<Commitment>): Promise<Commitment>;
  getAllData(): Promise<{
    contacts: Contact[];
    subjects: Subject[];
    organizations: Organization[];
    occupations: Occupation[];
    relationships: Relationship[];
    sentiments: Sentiment[];
    notes: Note[];
    commitments: Commitment[];
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
  };

  constructor() {
    // Initialize with sample data first, then try to load from localStorage
    this.data = getSampleData();
    // Load from localStorage only on the client side
    if (typeof window !== 'undefined') {
      this.loadData();
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
        } else {
          console.warn('MockDataService: Invalid data format, using sample data');
          removeLocalStorage('circle-data');
        }
      } catch (error) {
        console.error('MockDataService: Failed to parse saved data, using sample data');
        removeLocalStorage('circle-data');
      }
    }
  }

  private isValidData(data: any): boolean {
    return data.subjects && Array.isArray(data.subjects) && 
           data.relationships && Array.isArray(data.relationships) &&
           data.contacts && Array.isArray(data.contacts) &&
           data.organizations && Array.isArray(data.organizations) &&
           data.occupations && Array.isArray(data.occupations) &&
           data.sentiments && Array.isArray(data.sentiments) &&
           data.notes && Array.isArray(data.notes);
  }

  private saveData(): void {
    setLocalStorage('circle-data', JSON.stringify(this.data));
  }

  private simulateDelay(): Promise<void> {
    // Simulate network delay (50-200ms)
    const delay = Math.random() * 150 + 50;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
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
      id: Date.now(), // Simple ID generation for mock
      isTrashed: false
    };
    
    this.data.contacts.push(newContact);
    this.saveData();
    return newContact;
  }

  async deleteContact(id: number): Promise<void> {
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
      id: Date.now() 
    };
    
    this.data.subjects.push(newSubject);
    this.saveData();
    return newSubject;
  }

  async addOrganization(organization: Omit<Organization, 'id'>): Promise<Organization> {
    await this.simulateDelay();
    
    const newOrganization = { 
      ...organization, 
      id: Date.now() 
    };
    
    this.data.organizations.push(newOrganization);
    this.saveData();
    return newOrganization;
  }

  async addOccupation(occupation: Omit<Occupation, 'id'>): Promise<Occupation> {
    await this.simulateDelay();
    
    const newOccupation = { 
      ...occupation, 
      id: Date.now() 
    };
    
    this.data.occupations.push(newOccupation);
    this.saveData();
    return newOccupation;
  }

  async addRelationship(relationship: Omit<Relationship, 'id'>): Promise<Relationship> {
    await this.simulateDelay();
    
    const newRelationship = { 
      ...relationship, 
      id: Date.now() 
    };
    
    this.data.relationships.push(newRelationship);
    this.saveData();
    return newRelationship;
  }

  async addSentiment(sentiment: Omit<Sentiment, 'id'>): Promise<Sentiment> {
    await this.simulateDelay();
    
    const newSentiment = { 
      ...sentiment, 
      id: Date.now() 
    };
    
    this.data.sentiments.push(newSentiment);
    this.saveData();
    return newSentiment;
  }

  async addNote(note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
    await this.simulateDelay();
    
    // Resolve any {{contact:ID}} tokens in text to the latest contact name
    const resolvedText = resolveContactTokens(note.text, this.data.contacts);
    const newNote = { 
      ...note, 
      text: resolvedText,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      isTrashed: false
    };
    
    this.data.notes.push(newNote);
    this.saveData();
    return newNote;
  }

  async updateNote(id: number, updates: Partial<Note>): Promise<Note> {
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
    const newCommitment: Commitment = { ...commitment, id: Date.now() };
    this.data.commitments.push(newCommitment);
    this.saveData();
    return newCommitment;
  }

  async updateCommitment(id: number, updates: Partial<Commitment>): Promise<Commitment> {
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
  }> {
    console.log('📡 MockDataService: getAllData called');
    console.log('🔍 MockDataService: Current internal data source:', {
      isFromLocalStorage: this.data !== getSampleData(),
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
      dataSource: this.data !== getSampleData() ? 'localStorage' : 'sampleData'
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
      commitments: [...this.data.commitments]
    };
  }
}

// Export singleton instance
export const dataService = new MockDataService();
