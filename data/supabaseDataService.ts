// data/supabaseDataService.ts
import { supabase } from '../lib/supabase';
import { Contact, Subject, Organization, Occupation, Relationship, Sentiment, Note, Commitment, Draft, PrecisionDate, TimeValue } from '../contexts/ContactContext';
import { DataService } from './dataService';

// Helper functions to convert between app types and database types
function precisionDateToDb(date: PrecisionDate | undefined, prefix: string = 'birth'): { [key: string]: number | null } {
  if (!date) return { [`${prefix}_year`]: null, [`${prefix}_month`]: null, [`${prefix}_day`]: null };
  return {
    [`${prefix}_year`]: date.year,
    [`${prefix}_month`]: date.month,
    [`${prefix}_day`]: date.day
  };
}

function dbToPrecisionDate(birth_year: number | null, birth_month: number | null, birth_day: number | null): PrecisionDate | undefined {
  if (birth_year === null || birth_month === null || birth_day === null) return undefined;
  return { year: birth_year, month: birth_month, day: birth_day };
}

function timeValueToDb(time: TimeValue | undefined): { time_hour: number | null, time_minute: number | null } {
  if (!time) return { time_hour: null, time_minute: null };
  return {
    time_hour: time.hour,
    time_minute: time.minute
  };
}

function dbToTimeValue(time_hour: number | null, time_minute: number | null): TimeValue | undefined {
  if (time_hour === null || time_minute === null) return undefined;
  return { hour: time_hour, minute: time_minute };
}

export class SupabaseDataService implements DataService {
  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const { birth_date, ...otherUpdates } = updates;
    const dbUpdates: any = { ...otherUpdates };
    
    if (birth_date) {
      const { birth_year, birth_month, birth_day } = precisionDateToDb(birth_date);
      dbUpdates.birth_year = birth_year;
      dbUpdates.birth_month = birth_month;
      dbUpdates.birth_day = birth_day;
    }

    const { data, error } = await supabase
      .from('contacts')
      .update(dbUpdates)
      .eq('id', id)
      .select(`
        *,
        occupation:occupations(*),
        organization:organizations(*)
      `)
      .single();

    if (error) throw error;

    // Get related data
    const contact = await this.getContactWithRelations(data.id);
    return contact;
  }

  async addContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    const { birth_date, subject_ids, relationship_ids, note_ids, ...contactData } = contact;
    const { birth_year, birth_month, birth_day } = precisionDateToDb(birth_date);

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        ...contactData,
        birth_year,
        birth_month,
        birth_day
      })
      .select()
      .single();

    if (error) throw error;

    // Add relationships
    if (subject_ids.length > 0) {
      await supabase
        .from('contact_subjects')
        .insert(subject_ids.map(subject_id => ({ contact_id: data.id, subject_id })));
    }

    if (relationship_ids.length > 0) {
      await supabase
        .from('contact_relationships')
        .insert(relationship_ids.map(relationship_id => ({ contact_id: data.id, relationship_id })));
    }

    if (note_ids.length > 0) {
      await supabase
        .from('contact_notes')
        .insert(note_ids.map(note_id => ({ contact_id: data.id, note_id })));
    }

    return this.getContactWithRelations(data.id);
  }

  async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async addSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .insert(subject)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addOrganization(organization: Omit<Organization, 'id'>): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .insert(organization)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addOccupation(occupation: Omit<Occupation, 'id'>): Promise<Occupation> {
    const { data, error } = await supabase
      .from('occupations')
      .insert(occupation)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addRelationship(relationship: Omit<Relationship, 'id'>): Promise<Relationship> {
    const { data, error } = await supabase
      .from('relationships')
      .insert(relationship)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addSentiment(sentiment: Omit<Sentiment, 'id'>): Promise<Sentiment> {
    const { data, error } = await supabase
      .from('sentiments')
      .insert(sentiment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSentiment(id: string, updates: Partial<Sentiment>): Promise<Sentiment> {
    const { data, error } = await supabase
      .from('sentiments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addNote(note: Omit<Note, 'id' | 'created_at'>): Promise<Note> {
    const { date, time_value, sentiment_ids, contact_ids, ...noteData } = note;
    const noteDateFields = precisionDateToDb(date, 'note');
    const { time_hour, time_minute } = timeValueToDb(time_value);

    const { data, error } = await supabase
      .from('notes')
      .insert({
        ...noteData,
        ...noteDateFields,
        time_hour,
        time_minute
      })
      .select()
      .single();

    if (error) throw error;

    // Add relationships
    if (sentiment_ids.length > 0) {
      await supabase
        .from('note_sentiments')
        .insert(sentiment_ids.map(sentiment_id => ({ note_id: data.id, sentiment_id })));
    }

    if (contact_ids.length > 0) {
      await supabase
        .from('contact_notes')
        .insert(contact_ids.map(contact_id => ({ note_id: data.id, contact_id })));
    }

    return this.getNoteWithRelations(data.id);
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    console.log('SupabaseDataService: updateNote called with id:', id, 'updates:', updates);
    
    const { date, time_value, sentiment_ids, contact_ids, ...otherUpdates } = updates;
    const dbUpdates: any = { ...otherUpdates };
    
    if (date) {
      const noteDateFields = precisionDateToDb(date, 'note');
      Object.assign(dbUpdates, noteDateFields);
    }

    if (time_value) {
      const { time_hour, time_minute } = timeValueToDb(time_value);
      dbUpdates.time_hour = time_hour;
      dbUpdates.time_minute = time_minute;
    }

    console.log('SupabaseDataService: dbUpdates to send:', dbUpdates);

    // First, let's check if the note exists
    const { data: existingNote, error: checkError } = await supabase
      .from('notes')
      .select('id, title')
      .eq('id', id)
      .single();

    console.log('SupabaseDataService: Note existence check:', { existingNote, checkError });

    if (checkError) throw checkError;
    if (!existingNote) throw new Error(`Note with id ${id} not found`);

    // Only update the main notes table if there are actual field updates
    let data = existingNote;
    if (Object.keys(dbUpdates).length > 0) {
      const { data: updateData, error } = await supabase
        .from('notes')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      console.log('SupabaseDataService: Update result:', { data: updateData, error });

      if (error) throw error;
      data = updateData;
    } else {
      console.log('SupabaseDataService: Skipping main table update - no field updates needed');
    }

    // Update relationships if provided
    if (sentiment_ids) {
      await supabase.from('note_sentiments').delete().eq('note_id', id);
      if (sentiment_ids.length > 0) {
        await supabase
          .from('note_sentiments')
          .insert(sentiment_ids.map(sentiment_id => ({ note_id: id, sentiment_id })));
      }
    }

    if (contact_ids) {
      await supabase.from('contact_notes').delete().eq('note_id', id);
      if (contact_ids.length > 0) {
        await supabase
          .from('contact_notes')
          .insert(contact_ids.map(contact_id => ({ note_id: id, contact_id })));
      }
    }

    return this.getNoteWithRelations(data.id);
  }

  async addCommitment(commitment: Omit<Commitment, 'id'>): Promise<Commitment> {
    const { contact_ids, ...commitmentData } = commitment;

    const { data, error } = await supabase
      .from('commitments')
      .insert(commitmentData)
      .select()
      .single();

    if (error) throw error;

    // Add relationships
    if (contact_ids.length > 0) {
      await supabase
        .from('commitment_contacts')
        .insert(contact_ids.map(contact_id => ({ commitment_id: data.id, contact_id })));
    }

    return this.getCommitmentWithRelations(data.id);
  }

  async updateCommitment(id: string, updates: Partial<Commitment>): Promise<Commitment> {
    const { contact_ids, ...otherUpdates } = updates;

    const { data, error } = await supabase
      .from('commitments')
      .update(otherUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update relationships if provided
    if (contact_ids) {
      await supabase.from('commitment_contacts').delete().eq('commitment_id', id);
      if (contact_ids.length > 0) {
        await supabase
          .from('commitment_contacts')
          .insert(contact_ids.map(contact_id => ({ commitment_id: id, contact_id })));
      }
    }

    return this.getCommitmentWithRelations(data.id);
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
    // Fetch all data in parallel
    const [
      { data: contacts, error: contactsError },
      { data: subjects, error: subjectsError },
      { data: organizations, error: organizationsError },
      { data: occupations, error: occupationsError },
      { data: relationships, error: relationshipsError },
      { data: sentiments, error: sentimentsError },
      { data: notes, error: notesError },
      { data: commitments, error: commitmentsError },
      { data: drafts, error: draftsError }
    ] = await Promise.all([
      supabase.from('contacts').select(`
        *,
        occupation:occupations(*),
        organization:organizations(*)
      `),
      supabase.from('subjects').select('*'),
      supabase.from('organizations').select('*'),
      supabase.from('occupations').select('*'),
      supabase.from('relationships').select('*'),
      supabase.from('sentiments').select('*'),
      supabase.from('notes').select('*'),
      supabase.from('commitments').select('*'),
      supabase.from('drafts').select('*')
    ]);

    // Check for errors
    const errors = [contactsError, subjectsError, organizationsError, occupationsError, relationshipsError, sentimentsError, notesError, commitmentsError, draftsError];
    const firstError = errors.find(error => error);
    if (firstError) throw firstError;

    // Get all relationships
    const [contactSubjects, contactRelationships, contactNotes, noteSentiments, commitmentContacts] = await Promise.all([
      supabase.from('contact_subjects').select('*'),
      supabase.from('contact_relationships').select('*'),
      supabase.from('contact_notes').select('*'),
      supabase.from('note_sentiments').select('*'),
      supabase.from('commitment_contacts').select('*')
    ]);

    // Build lookup maps
    const contactSubjectsMap = new Map<string, string[]>();
    contactSubjects.data?.forEach(cs => {
      if (!contactSubjectsMap.has(cs.contact_id)) contactSubjectsMap.set(cs.contact_id, []);
      contactSubjectsMap.get(cs.contact_id)!.push(cs.subject_id);
    });

    const contactRelationshipsMap = new Map<string, string[]>();
    contactRelationships.data?.forEach(cr => {
      if (!contactRelationshipsMap.has(cr.contact_id)) contactRelationshipsMap.set(cr.contact_id, []);
      contactRelationshipsMap.get(cr.contact_id)!.push(cr.relationship_id);
    });

    const contactNotesMap = new Map<string, string[]>();
    contactNotes.data?.forEach(cn => {
      if (!contactNotesMap.has(cn.contact_id)) contactNotesMap.set(cn.contact_id, []);
      contactNotesMap.get(cn.contact_id)!.push(cn.note_id);
    });

    const noteSentimentsMap = new Map<string, string[]>();
    noteSentiments.data?.forEach(ns => {
      if (!noteSentimentsMap.has(ns.note_id)) noteSentimentsMap.set(ns.note_id, []);
      noteSentimentsMap.get(ns.note_id)!.push(ns.sentiment_id);
    });

    const commitmentContactsMap = new Map<string, string[]>();
    commitmentContacts.data?.forEach(cc => {
      if (!commitmentContactsMap.has(cc.commitment_id)) commitmentContactsMap.set(cc.commitment_id, []);
      commitmentContactsMap.get(cc.commitment_id)!.push(cc.contact_id);
    });

    // Convert to app types
    const convertedContacts = contacts?.map(contact => ({
      id: contact.id, // Keep UUID as string
      name: contact.name,
      occupation_id: contact.occupation_id || undefined,
      organization_id: contact.organization_id || undefined,
      birth_date: dbToPrecisionDate(contact.birth_year, contact.birth_month, contact.birth_day),
      last_interaction: contact.last_interaction,
      subject_ids: contactSubjectsMap.get(contact.id) || [],
      relationship_ids: contactRelationshipsMap.get(contact.id) || [],
      note_ids: contactNotesMap.get(contact.id) || [],
      is_trashed: contact.is_trashed
    })) || [];

    const convertedNotes = notes?.map(note => ({
      id: note.id,
      title: note.title,
      text: note.text,
      date: dbToPrecisionDate(note.note_year, note.note_month, note.note_day),
      time_value: dbToTimeValue(note.time_hour, note.time_minute),
      sentiment_ids: noteSentimentsMap.get(note.id) || [],
      contact_ids: contactNotesMap.get(note.id) || [],
      created_at: note.created_at,
      is_trashed: note.is_trashed
    })) || [];

    const convertedCommitments = commitments?.map(commitment => ({
      id: commitment.id,
      text: commitment.text,
      time: commitment.time,
      contact_ids: commitmentContactsMap.get(commitment.id) || [],
      is_trashed: commitment.is_trashed
    })) || [];

    const convertedDrafts = drafts?.map(draft => ({
      date: { year: draft.draft_year, month: draft.draft_month, day: draft.draft_day },
      time: { hour: draft.time_hour, minute: draft.time_minute },
      text: draft.text
    })) || [];

    return {
      contacts: convertedContacts,
      subjects: subjects?.map(s => ({ id: s.id, label: s.label, category: s.category })) || [],
      organizations: organizations?.map(o => ({ id: o.id, name: o.name })) || [],
      occupations: occupations?.map(o => ({ id: o.id, title: o.title })) || [],
      relationships: relationships?.map(r => ({ id: r.id, label: r.label, category: r.category })) || [],
      sentiments: sentiments?.map(s => ({ id: s.id, label: s.label, category: s.category })) || [],
      notes: convertedNotes,
      commitments: convertedCommitments,
      drafts: convertedDrafts
    };
  }

  private async getContactWithRelations(contactId: string): Promise<Contact> {
    // Get contact with related data
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select(`
        *,
        occupation:occupations(*),
        organization:organizations(*)
      `)
      .eq('id', contactId)
      .single();

    if (contactError) throw contactError;

    // Get related subjects
    const { data: subjectData } = await supabase
      .from('contact_subjects')
      .select('subject_id')
      .eq('contact_id', contactId);

    // Get related relationships
    const { data: relationshipData } = await supabase
      .from('contact_relationships')
      .select('relationship_id')
      .eq('contact_id', contactId);

    // Get related notes
    const { data: noteData } = await supabase
      .from('contact_notes')
      .select('note_id')
      .eq('contact_id', contactId);

    // Convert to Contact interface
    const contact: Contact = {
      id: contactData.id,
      name: contactData.name,
      occupation_id: contactData.occupation_id,
      organization_id: contactData.organization_id,
      birth_date: dbToPrecisionDate(contactData.birth_year, contactData.birth_month, contactData.birth_day),
      last_interaction: contactData.last_interaction,
      is_trashed: contactData.is_trashed || false,
      subject_ids: subjectData?.map(s => s.subject_id) || [],
      relationship_ids: relationshipData?.map(r => r.relationship_id) || [],
      note_ids: noteData?.map(n => n.note_id) || []
    };

    return contact;
  }

  private async getNoteWithRelations(noteId: string): Promise<Note> {
    // Get note data
    const { data: noteData, error: noteError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single();

    if (noteError) throw noteError;

    // Get related sentiments
    const { data: sentimentData } = await supabase
      .from('note_sentiments')
      .select('sentiment_id')
      .eq('note_id', noteId);

    // Get related contacts
    const { data: contactData } = await supabase
      .from('contact_notes')
      .select('contact_id')
      .eq('note_id', noteId);

    // Convert to Note interface
    const note: Note = {
      id: noteData.id,
      title: noteData.title,
      text: noteData.text,
      date: dbToPrecisionDate(noteData.note_year, noteData.note_month, noteData.note_day),
      time_value: dbToTimeValue(noteData.time_hour, noteData.time_minute),
      sentiment_ids: sentimentData?.map(s => s.sentiment_id) || [],
      contact_ids: contactData?.map(c => c.contact_id) || [],
      created_at: noteData.created_at,
      is_trashed: noteData.is_trashed
    };

    return note;
  }

  private async getCommitmentWithRelations(commitmentId: string): Promise<Commitment> {
    // Implementation for getting a single commitment with all relations
    throw new Error('Not implemented');
  }
}