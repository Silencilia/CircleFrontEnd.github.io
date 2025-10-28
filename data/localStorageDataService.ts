// data/localStorageDataService.ts
import { Contact, Subject, Organization, Occupation, Relationship, Sentiment, Note, Commitment, Draft, PrecisionDate, TimeValue } from '../contexts/ContactContext';
import { DataService } from './dataService';
import { LS_KEYS } from './localStorageKeys';

// Keys centralized in data/localStorageKeys.ts

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
    const contacts = this.getItem<Contact>(LS_KEYS.CONTACTS);
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Contact ${id} not found`);
    
    const updated = { ...contacts[index], ...updates };
    contacts[index] = updated;
    this.setItem(LS_KEYS.CONTACTS, contacts);
    return updated;
  }

  async addContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    const contacts = this.getItem<Contact>(LS_KEYS.CONTACTS);
    const newContact: Contact = {
      ...contact,
      id: crypto.randomUUID(),
    };
    contacts.push(newContact);
    this.setItem(LS_KEYS.CONTACTS, contacts);
    return newContact;
  }

  async deleteContact(id: string): Promise<void> {
    const contacts = this.getItem<Contact>(LS_KEYS.CONTACTS);
    const filtered = contacts.filter(c => c.id !== id);
    this.setItem(LS_KEYS.CONTACTS, filtered);
  }

  async addSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
    const subjects = this.getItem<Subject>(LS_KEYS.SUBJECTS);
    const newSubject: Subject = {
      ...subject,
      id: crypto.randomUUID(),
    };
    subjects.push(newSubject);
    this.setItem(LS_KEYS.SUBJECTS, subjects);
    return newSubject;
  }

  async addOrganization(organization: Omit<Organization, 'id'>): Promise<Organization> {
    const organizations = this.getItem<Organization>(LS_KEYS.ORGANIZATIONS);
    const newOrganization: Organization = {
      ...organization,
      id: crypto.randomUUID(),
    };
    organizations.push(newOrganization);
    this.setItem(LS_KEYS.ORGANIZATIONS, organizations);
    return newOrganization;
  }

  async addOccupation(occupation: Omit<Occupation, 'id'>): Promise<Occupation> {
    const occupations = this.getItem<Occupation>(LS_KEYS.OCCUPATIONS);
    const newOccupation: Occupation = {
      ...occupation,
      id: crypto.randomUUID(),
    };
    occupations.push(newOccupation);
    this.setItem(LS_KEYS.OCCUPATIONS, occupations);
    return newOccupation;
  }

  async addRelationship(relationship: Omit<Relationship, 'id'>): Promise<Relationship> {
    const relationships = this.getItem<Relationship>(LS_KEYS.RELATIONSHIPS);
    const newRelationship: Relationship = {
      ...relationship,
      id: crypto.randomUUID(),
    };
    relationships.push(newRelationship);
    this.setItem(LS_KEYS.RELATIONSHIPS, relationships);
    return newRelationship;
  }

  async addSentiment(sentiment: Omit<Sentiment, 'id'>): Promise<Sentiment> {
    const sentiments = this.getItem<Sentiment>(LS_KEYS.SENTIMENTS);
    const newSentiment: Sentiment = {
      ...sentiment,
      id: crypto.randomUUID(),
    };
    sentiments.push(newSentiment);
    this.setItem(LS_KEYS.SENTIMENTS, sentiments);
    return newSentiment;
  }

  async updateSentiment(id: string, updates: Partial<Sentiment>): Promise<Sentiment> {
    const sentiments = this.getItem<Sentiment>(LS_KEYS.SENTIMENTS);
    const index = sentiments.findIndex(s => s.id === id);
    if (index === -1) throw new Error(`Sentiment ${id} not found`);
    
    const updated = { ...sentiments[index], ...updates };
    sentiments[index] = updated;
    this.setItem(LS_KEYS.SENTIMENTS, sentiments);
    return updated;
  }

  async addNote(note: Omit<Note, 'id' | 'created_at'>): Promise<Note> {
    const notes = this.getItem<Note>(LS_KEYS.NOTES);
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    notes.push(newNote);
    this.setItem(LS_KEYS.NOTES, notes);
    return newNote;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const notes = this.getItem<Note>(LS_KEYS.NOTES);
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error(`Note ${id} not found`);
    
    const updated = { ...notes[index], ...updates };
    notes[index] = updated;
    this.setItem(LS_KEYS.NOTES, notes);
    return updated;
  }

  async addCommitment(commitment: Omit<Commitment, 'id'>): Promise<Commitment> {
    const commitments = this.getItem<Commitment>(LS_KEYS.COMMITMENTS);
    const newCommitment: Commitment = {
      ...commitment,
      id: crypto.randomUUID(),
    };
    commitments.push(newCommitment);
    this.setItem(LS_KEYS.COMMITMENTS, commitments);
    return newCommitment;
  }

  async updateCommitment(id: string, updates: Partial<Commitment>): Promise<Commitment> {
    const commitments = this.getItem<Commitment>(LS_KEYS.COMMITMENTS);
    const index = commitments.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Commitment ${id} not found`);
    
    const updated = { ...commitments[index], ...updates };
    commitments[index] = updated;
    this.setItem(LS_KEYS.COMMITMENTS, commitments);
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
      contacts: this.getItem<Contact>(LS_KEYS.CONTACTS),
      subjects: this.getItem<Subject>(LS_KEYS.SUBJECTS),
      organizations: this.getItem<Organization>(LS_KEYS.ORGANIZATIONS),
      occupations: this.getItem<Occupation>(LS_KEYS.OCCUPATIONS),
      relationships: this.getItem<Relationship>(LS_KEYS.RELATIONSHIPS),
      sentiments: this.getItem<Sentiment>(LS_KEYS.SENTIMENTS),
      notes: this.getItem<Note>(LS_KEYS.NOTES),
      commitments: this.getItem<Commitment>(LS_KEYS.COMMITMENTS),
      drafts: [], // TODO: Implement drafts functionality
    };
  }
}

