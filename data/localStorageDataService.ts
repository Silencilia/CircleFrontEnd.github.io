// data/localStorageDataService.ts
import { Contact, Subject, Organization, Occupation, Relationship, Sentiment, Note, Commitment, Draft, PrecisionDate, TimeValue } from '../contexts/ContactContext';
import { DataService } from './dataService';

// localStorage keys
const KEYS = {
  CONTACTS: 'circle_contacts',
  SUBJECTS: 'circle_subjects',
  ORGANIZATIONS: 'circle_organizations',
  OCCUPATIONS: 'circle_occupations',
  RELATIONSHIPS: 'circle_relationships',
  SENTIMENTS: 'circle_sentiments',
  NOTES: 'circle_notes',
  COMMITMENTS: 'circle_commitments',
};

export class LocalStorageDataService implements DataService {
  // Helper methods for localStorage operations
  private getItem<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  }

  private setItem<T>(key: string, data: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const contacts = this.getItem<Contact>(KEYS.CONTACTS);
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Contact ${id} not found`);
    
    const updated = { ...contacts[index], ...updates };
    contacts[index] = updated;
    this.setItem(KEYS.CONTACTS, contacts);
    return updated;
  }

  async addContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    const contacts = this.getItem<Contact>(KEYS.CONTACTS);
    const newContact: Contact = {
      ...contact,
      id: crypto.randomUUID(),
    };
    contacts.push(newContact);
    this.setItem(KEYS.CONTACTS, contacts);
    return newContact;
  }

  async deleteContact(id: string): Promise<void> {
    const contacts = this.getItem<Contact>(KEYS.CONTACTS);
    const filtered = contacts.filter(c => c.id !== id);
    this.setItem(KEYS.CONTACTS, filtered);
  }

  async addSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
    const subjects = this.getItem<Subject>(KEYS.SUBJECTS);
    const newSubject: Subject = {
      ...subject,
      id: crypto.randomUUID(),
    };
    subjects.push(newSubject);
    this.setItem(KEYS.SUBJECTS, subjects);
    return newSubject;
  }

  async addOrganization(organization: Omit<Organization, 'id'>): Promise<Organization> {
    const organizations = this.getItem<Organization>(KEYS.ORGANIZATIONS);
    const newOrganization: Organization = {
      ...organization,
      id: crypto.randomUUID(),
    };
    organizations.push(newOrganization);
    this.setItem(KEYS.ORGANIZATIONS, organizations);
    return newOrganization;
  }

  async addOccupation(occupation: Omit<Occupation, 'id'>): Promise<Occupation> {
    const occupations = this.getItem<Occupation>(KEYS.OCCUPATIONS);
    const newOccupation: Occupation = {
      ...occupation,
      id: crypto.randomUUID(),
    };
    occupations.push(newOccupation);
    this.setItem(KEYS.OCCUPATIONS, occupations);
    return newOccupation;
  }

  async addRelationship(relationship: Omit<Relationship, 'id'>): Promise<Relationship> {
    const relationships = this.getItem<Relationship>(KEYS.RELATIONSHIPS);
    const newRelationship: Relationship = {
      ...relationship,
      id: crypto.randomUUID(),
    };
    relationships.push(newRelationship);
    this.setItem(KEYS.RELATIONSHIPS, relationships);
    return newRelationship;
  }

  async addSentiment(sentiment: Omit<Sentiment, 'id'>): Promise<Sentiment> {
    const sentiments = this.getItem<Sentiment>(KEYS.SENTIMENTS);
    const newSentiment: Sentiment = {
      ...sentiment,
      id: crypto.randomUUID(),
    };
    sentiments.push(newSentiment);
    this.setItem(KEYS.SENTIMENTS, sentiments);
    return newSentiment;
  }

  async updateSentiment(id: string, updates: Partial<Sentiment>): Promise<Sentiment> {
    const sentiments = this.getItem<Sentiment>(KEYS.SENTIMENTS);
    const index = sentiments.findIndex(s => s.id === id);
    if (index === -1) throw new Error(`Sentiment ${id} not found`);
    
    const updated = { ...sentiments[index], ...updates };
    sentiments[index] = updated;
    this.setItem(KEYS.SENTIMENTS, sentiments);
    return updated;
  }

  async addNote(note: Omit<Note, 'id' | 'created_at'>): Promise<Note> {
    const notes = this.getItem<Note>(KEYS.NOTES);
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    notes.push(newNote);
    this.setItem(KEYS.NOTES, notes);
    return newNote;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const notes = this.getItem<Note>(KEYS.NOTES);
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error(`Note ${id} not found`);
    
    const updated = { ...notes[index], ...updates };
    notes[index] = updated;
    this.setItem(KEYS.NOTES, notes);
    return updated;
  }

  async addCommitment(commitment: Omit<Commitment, 'id'>): Promise<Commitment> {
    const commitments = this.getItem<Commitment>(KEYS.COMMITMENTS);
    const newCommitment: Commitment = {
      ...commitment,
      id: crypto.randomUUID(),
    };
    commitments.push(newCommitment);
    this.setItem(KEYS.COMMITMENTS, commitments);
    return newCommitment;
  }

  async updateCommitment(id: string, updates: Partial<Commitment>): Promise<Commitment> {
    const commitments = this.getItem<Commitment>(KEYS.COMMITMENTS);
    const index = commitments.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Commitment ${id} not found`);
    
    const updated = { ...commitments[index], ...updates };
    commitments[index] = updated;
    this.setItem(KEYS.COMMITMENTS, commitments);
    return updated;
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
    return {
      contacts: this.getItem<Contact>(KEYS.CONTACTS),
      subjects: this.getItem<Subject>(KEYS.SUBJECTS),
      organizations: this.getItem<Organization>(KEYS.ORGANIZATIONS),
      occupations: this.getItem<Occupation>(KEYS.OCCUPATIONS),
      relationships: this.getItem<Relationship>(KEYS.RELATIONSHIPS),
      sentiments: this.getItem<Sentiment>(KEYS.SENTIMENTS),
      notes: this.getItem<Note>(KEYS.NOTES),
      commitments: this.getItem<Commitment>(KEYS.COMMITMENTS),
      drafts: [], // TODO: Implement drafts functionality
    };
  }
}

