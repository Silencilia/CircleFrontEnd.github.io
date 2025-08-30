import { Contact, Subject, Organization, Occupation, Relationship, Sentiment, Note } from '../contexts/ContactContext';
import { getSampleData } from './sampleData';

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
  getAllData(): Promise<{
    contacts: Contact[];
    subjects: Subject[];
    organizations: Organization[];
    occupations: Occupation[];
    relationships: Relationship[];
    sentiments: Sentiment[];
    notes: Note[];
  }>;
}

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
  };

  constructor() {
    this.data = this.loadData();
  }

  private loadData() {
    const savedData = localStorage.getItem('circle-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Validate data structure
        if (this.isValidData(parsed)) {
          return parsed;
        } else {
          console.warn('MockDataService: Invalid data format, using sample data');
          localStorage.removeItem('circle-data');
        }
      } catch (error) {
        console.error('MockDataService: Failed to parse saved data, using sample data');
        localStorage.removeItem('circle-data');
      }
    }
    return getSampleData();
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
    localStorage.setItem('circle-data', JSON.stringify(this.data));
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
      id: Date.now() // Simple ID generation for mock
    };
    
    this.data.contacts.push(newContact);
    this.saveData();
    return newContact;
  }

  async deleteContact(id: number): Promise<void> {
    await this.simulateDelay();
    
    const initialLength = this.data.contacts.length;
    this.data.contacts = this.data.contacts.filter(c => c.id !== id);
    
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
    
    const newNote = { 
      ...note, 
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    this.data.notes.push(newNote);
    this.saveData();
    return newNote;
  }

  async getAllData(): Promise<{
    contacts: Contact[];
    subjects: Subject[];
    organizations: Organization[];
    occupations: Occupation[];
    relationships: Relationship[];
    sentiments: Sentiment[];
    notes: Note[];
  }> {
    await this.simulateDelay();
    
    // Reload from localStorage to get latest data
    this.data = this.loadData();
    
    // Return a copy to prevent direct mutations
    return {
      contacts: [...this.data.contacts],
      subjects: [...this.data.subjects],
      organizations: [...this.data.organizations],
      occupations: [...this.data.occupations],
      relationships: [...this.data.relationships],
      sentiments: [...this.data.sentiments],
      notes: [...this.data.notes]
    };
  }
}

// Export singleton instance
export const dataService = new MockDataService();
