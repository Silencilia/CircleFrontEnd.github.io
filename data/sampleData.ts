import { Contact, Subject, Relationship, Note, Organization, Occupation } from '../contexts/ContactContext';

export const sampleOrganizations: Organization[] = [
  { id: 1, name: 'TechCorp Inc.' },
  { id: 2, name: 'Global Marketing Solutions' },
  { id: 3, name: 'Creative Studio Pro' },
  { id: 4, name: 'InnovateTech' },
  { id: 5, name: 'DataFlow Analytics' },
  { id: 6, name: 'Strategic Partners LLC' },
  { id: 7, name: 'First National Bank' },
  { id: 8, name: 'UserFirst Design' },
  { id: 9, name: 'SalesForce Pro' },
  { id: 10, name: 'Content Creators Co.' },
  { id: 11, name: 'Efficient Operations Ltd.' },
  { id: 12, name: 'Business Insights Group' }
];

export const sampleOccupations: Occupation[] = [
  { id: 1, title: 'Software Engineer' },
  { id: 2, title: 'Marketing Manager' },
  { id: 3, title: 'Designer' },
  { id: 4, title: 'Product Manager' },
  { id: 5, title: 'Data Scientist' },
  { id: 6, title: 'Consultant' },
  { id: 7, title: 'Financial Analyst' },
  { id: 8, title: 'UX Researcher' },
  { id: 9, title: 'Sales Director' },
  { id: 10, title: 'Content Strategist' },
  { id: 11, title: 'Operations Manager' },
  { id: 12, title: 'Business Analyst' }
];

export const sampleSubjects: Subject[] = [
  { id: 1, label: 'coffee', category: 'activity' },
  { id: 2, label: 'tech', category: 'interest' },
  { id: 3, label: 'music', category: 'hobby' },
  { id: 4, label: 'travel', category: 'hobby' },
  { id: 5, label: 'family', category: 'organization' },
  { id: 6, label: 'food', category: 'interest' },
  { id: 7, label: 'art', category: 'hobby' },
  { id: 8, label: 'sports', category: 'activity' },
  { id: 9, label: 'reading', category: 'hobby' },
  { id: 10, label: 'photography', category: 'hobby' },
  { id: 11, label: 'cooking', category: 'hobby' },
  { id: 12, label: 'gaming', category: 'hobby' },
  { id: 13, label: 'yoga', category: 'activity' },
  { id: 14, label: 'dancing', category: 'activity' },
  { id: 15, label: 'hiking', category: 'activity' },
  { id: 16, label: 'swimming', category: 'activity' },
  { id: 17, label: 'cycling', category: 'activity' },
  { id: 18, label: 'running', category: 'activity' },
  { id: 19, label: 'gardening', category: 'hobby' },
  { id: 20, label: 'painting', category: 'hobby' },
  { id: 21, label: 'writing', category: 'hobby' },
  { id: 22, label: 'languages', category: 'interest' },
  { id: 23, label: 'science', category: 'interest' },
  { id: 24, label: 'history', category: 'interest' },
  { id: 25, label: 'politics', category: 'interest' },
  { id: 26, label: 'fashion', category: 'interest' },
  { id: 27, label: 'cars', category: 'interest' },
  { id: 28, label: 'pets', category: 'interest' },
  { id: 29, label: 'volunteering', category: 'activity' },
  { id: 30, label: 'meditation', category: 'activity' },
  { id: 31, label: 'startup', category: 'organization' },
  { id: 32, label: 'corporate', category: 'organization' },
  { id: 33, label: 'nonprofit', category: 'organization' },
  { id: 34, label: 'freelance', category: 'organization' },
  { id: 35, label: 'academia', category: 'organization' }
];

export const sampleRelationships: Relationship[] = [
  { id: 1, label: 'friend', category: 'personal' },
  { id: 2, label: 'colleague', category: 'professional' },
  { id: 3, label: 'mentor', category: 'professional' },
  { id: 4, label: 'supervisor', category: 'professional' },
  { id: 5, label: 'close friend', category: 'personal' },
  { id: 6, label: 'acquaintance', category: 'personal' },
  { id: 7, label: 'partner', category: 'romantic' },
  { id: 8, label: 'date', category: 'romantic' }
];

export const sampleNotes: Note[] = [
  {
    id: 1,
    text: 'Had coffee and discussed new project ideas',
    person: 'Alex Johnson',
    time: 'Dec 15, 2024 2:00 PM',
    location: 'Starbucks Downtown',
    event: 'Coffee meeting',
    sentiment: 'positive',
    contactIds: [1],
    createdAt: '2024-12-15T14:00:00Z'
  },
  {
    id: 2,
    text: 'Team lunch meeting about Q1 strategy',
    person: 'Sarah Chen',
    time: 'Dec 12, 2024 12:00 PM',
    location: 'Office Conference Room',
    event: 'Team meeting',
    sentiment: 'neutral',
    contactIds: [2],
    createdAt: '2024-12-12T12:00:00Z'
  }
];

export const sampleContacts: Contact[] = [
  {
    id: 1,
    name: 'Alex Johnson',
    occupationId: 1,
    organizationId: 1,
    birthDate: '1990-05-15',
    lastInteraction: 1734307200000, // Dec 15, 2024 timestamp
    subjectIds: [1, 2, 3, 6, 9, 13, 15, 22, 27, 29, 32],
    relationshipIds: [1, 5],
    noteIds: [1]
  },
  {
    id: 2,
    name: 'Sarah Chen',
    // Removed occupationId and organizationId to test missing data
    birthDate: '1988-09-22',
    lastInteraction: 1734048000000, // Dec 12, 2024 timestamp
    subjectIds: [4, 7, 10, 13, 14, 19, 21, 24, 26, 30],
    relationshipIds: [2, 4],
    noteIds: [2]
  },
  {
    id: 3,
    name: 'Michael Rodriguez',
    occupationId: 3,
    // Removed organizationId to test missing organization
    birthDate: '1992-03-10',
    lastInteraction: 1733788800000, // Dec 10, 2024 timestamp
    subjectIds: [5, 8, 11, 14, 17, 19, 23, 28, 12, 16],
    relationshipIds: [1, 2],
    noteIds: []
  },
  {
    id: 4,
    name: 'Emily Watson',
    occupationId: 4,
    organizationId: 4,
    // Removed birthDate to test missing birth date
    lastInteraction: 1733616000000, // Dec 8, 2024 timestamp
    subjectIds: [2, 6, 9, 13, 15, 20, 22, 25, 27, 29],
    relationshipIds: [2, 3],
    noteIds: []
  },
  {
    id: 5,
    name: 'David Kim',
    // Removed occupationId to test missing occupation
    organizationId: 5,
    birthDate: '1991-07-18',
    lastInteraction: 1733356800000, // Dec 5, 2024 timestamp
    subjectIds: [3, 7, 10, 12, 14, 18, 21, 24, 26, 30],
    relationshipIds: [1, 2],
    noteIds: []
  },
  {
    id: 6,
    name: 'Lisa Thompson',
    occupationId: 6,
    organizationId: 6,
    birthDate: '1987-12-03',
    lastInteraction: 1733184000000, // Dec 3, 2024 timestamp
    subjectIds: [1, 4, 8, 11, 15, 17, 19, 23, 28, 12],
    relationshipIds: [2, 6],
    noteIds: []
  },
  {
    id: 7,
    name: 'James Wilson',
    // Removed all optional fields to test complete missing data
    lastInteraction: 1733006400000, // Dec 1, 2024 timestamp
    subjectIds: [2, 5, 9, 12, 16, 20, 23, 25, 27, 29],
    relationshipIds: [2, 7],
    noteIds: []
  },
  {
    id: 8,
    name: 'Maria Garcia',
    occupationId: 8,
    // Removed organizationId and birthDate
    lastInteraction: 1732752000000, // Nov 28, 2024 timestamp
    subjectIds: [1, 3, 6, 10, 13, 17, 21, 24, 26, 30],
    relationshipIds: [1, 3],
    noteIds: []
  },
  {
    id: 9,
    name: 'Robert Taylor',
    occupationId: 9,
    organizationId: 9,
    birthDate: '1985-01-30',
    lastInteraction: 1732579200000, // Nov 25, 2024 timestamp
    subjectIds: [4, 7, 11, 14, 18, 19, 22, 28, 12, 15],
    relationshipIds: [2, 5],
    noteIds: []
  },
  {
    id: 10,
    name: 'Jennifer Lee',
    // Removed occupationId and birthDate
    organizationId: 10,
    lastInteraction: 1732406400000, // Nov 22, 2024 timestamp
    subjectIds: [3, 8, 10, 13, 16, 20, 23, 25, 27, 29],
    relationshipIds: [1, 6],
    noteIds: []
  },
  {
    id: 11,
    name: 'Christopher Brown',
    occupationId: 11,
    organizationId: 11,
    birthDate: '1988-12-14',
    lastInteraction: 1732233600000, // Nov 20, 2024 timestamp
    subjectIds: [2, 5, 9, 12, 15, 17, 21, 24, 26, 30],
    relationshipIds: [2, 4],
    noteIds: []
  },
  {
    id: 12,
    name: 'Amanda Davis',
    // Removed all optional fields to test complete missing data
    lastInteraction: 1732060800000, // Nov 18, 2024 timestamp
    subjectIds: [1, 4, 7, 11, 14, 18, 19, 22, 28, 12],
    relationshipIds: [1, 2],
    noteIds: []
  }
];

export function getSampleData() {
  return {
    contacts: sampleContacts,
    subjects: sampleSubjects,
    organizations: sampleOrganizations,
    occupations: sampleOccupations,
    relationships: sampleRelationships,
    notes: sampleNotes
  };
}
