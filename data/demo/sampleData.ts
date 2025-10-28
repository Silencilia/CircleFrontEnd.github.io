import { LS_KEYS } from '../localStorageKeys';
import type { Contact, Subject, Organization, Occupation, Relationship, Sentiment, Note, Commitment, PrecisionDate, TimeValue } from '../../contexts/ContactContext';

// Stable IDs to keep references deterministic
const ids = {
  // sentiments
  sentimentPositive: 'sent:positive',
  sentimentNeutral: 'sent:neutral',
  sentimentNegative: 'sent:negative',
  // relationships
  relFriend: 'rel:friend',
  relColleague: 'rel:colleague',
  relFamily: 'rel:family',
  // subjects
  subjMusic: 'subj:music',
  subjWork: 'subj:work',
  subjTravel: 'subj:travel',
  subjFood: 'subj:food',
  subjFitness: 'subj:fitness',
  // organizations
  orgAcme: 'org:acme',
  orgGlobex: 'org:globex',
  orgStMary: 'org:stmary',
  // occupations
  occEngineer: 'occ:engineer',
  occDesigner: 'occ:designer',
  occTeacher: 'occ:teacher',
  occDoctor: 'occ:doctor',
};

export const demoSentiments: Sentiment[] = [
  { id: ids.sentimentPositive, label: 'positive', category: 'general' },
  { id: ids.sentimentNeutral, label: 'neutral', category: 'general' },
  { id: ids.sentimentNegative, label: 'negative', category: 'general' },
];

export const demoRelationships: Relationship[] = [
  { id: ids.relFriend, label: 'friend', category: 'personal' },
  { id: ids.relColleague, label: 'colleague', category: 'work' },
  { id: ids.relFamily, label: 'family', category: 'personal' },
];

export const demoSubjects: Subject[] = [
  { id: ids.subjMusic, label: 'Music', category: 'hobby' },
  { id: ids.subjWork, label: 'Work', category: 'life' },
  { id: ids.subjTravel, label: 'Travel', category: 'life' },
  { id: ids.subjFood, label: 'Food', category: 'hobby' },
  { id: ids.subjFitness, label: 'Fitness', category: 'health' },
];

export const demoOrganizations: Organization[] = [
  { id: ids.orgAcme, name: 'Acme Corp' },
  { id: ids.orgGlobex, name: 'Globex' },
  { id: ids.orgStMary, name: 'St. Mary School' },
];

export const demoOccupations: Occupation[] = [
  { id: ids.occEngineer, title: 'Software Engineer' },
  { id: ids.occDesigner, title: 'Product Designer' },
  { id: ids.occTeacher, title: 'Teacher' },
  { id: ids.occDoctor, title: 'Physician' },
];

// 10 contacts
export const demoContacts: Contact[] = [
  { id: 'c:01', name: 'Alice Johnson', occupation_id: ids.occDesigner, organization_id: ids.orgAcme, birth_date: { year: 1992, month: 4, day: 15 }, subject_ids: [ids.subjMusic, ids.subjWork], relationship_ids: [ids.relColleague], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:02', name: 'Bob Smith', occupation_id: ids.occEngineer, organization_id: ids.orgGlobex, birth_date: { year: 1988, month: 9, day: 3 }, subject_ids: [ids.subjWork, ids.subjTravel], relationship_ids: [ids.relColleague], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:03', name: 'Carol Lee', occupation_id: ids.occTeacher, organization_id: ids.orgStMary, birth_date: { year: 1990, month: 12, day: 22 }, subject_ids: [ids.subjFood, ids.subjTravel], relationship_ids: [ids.relFriend], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:04', name: 'David Kim', occupation_id: ids.occEngineer, organization_id: ids.orgAcme, birth_date: { year: 1985, month: 6, day: 10 }, subject_ids: [ids.subjFitness, ids.subjWork], relationship_ids: [ids.relColleague], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:05', name: 'Eva Brown', occupation_id: ids.occDoctor, organization_id: undefined, birth_date: { year: 1991, month: 3, day: 8 }, subject_ids: [ids.subjFitness, ids.subjFood], relationship_ids: [ids.relFriend], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:06', name: 'Frank Green', occupation_id: ids.occEngineer, organization_id: ids.orgGlobex, birth_date: { year: 1987, month: 11, day: 19 }, subject_ids: [ids.subjMusic], relationship_ids: [ids.relFriend], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:07', name: 'Grace Miller', occupation_id: ids.occDesigner, organization_id: ids.orgAcme, birth_date: { year: 1993, month: 7, day: 25 }, subject_ids: [ids.subjTravel], relationship_ids: [ids.relColleague], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:08', name: 'Henry Davis', occupation_id: ids.occTeacher, organization_id: ids.orgStMary, birth_date: { year: 1989, month: 2, day: 14 }, subject_ids: [ids.subjFood, ids.subjMusic], relationship_ids: [ids.relFamily], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:09', name: 'Ivy Wilson', occupation_id: ids.occDoctor, organization_id: undefined, birth_date: { year: 1994, month: 10, day: 5 }, subject_ids: [ids.subjTravel, ids.subjMusic], relationship_ids: [ids.relFriend], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:10', name: 'Jack Turner', occupation_id: ids.occEngineer, organization_id: ids.orgGlobex, birth_date: { year: 1990, month: 1, day: 30 }, subject_ids: [ids.subjWork, ids.subjFitness], relationship_ids: [ids.relColleague], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
];

function dt(offsetDays: number): PrecisionDate {
  const d = new Date(Date.now() - offsetDays * 24 * 3600 * 1000);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}
function tm(h: number, m: number): TimeValue { return { hour: h, minute: m }; }

// ~30 notes, 3-4 per contact, cross-link contacts and sentiments
export const demoNotes: Note[] = [
  { id: 'n:01', title: 'Coffee with Alice', text: 'Met {{contact:c:01}} for coffee; discussed the new design sprint.', date: dt(2), time_value: tm(9, 30), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:01'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:02', title: 'Standup with Bob', text: 'Daily standup with {{contact:c:02}} and team about release blockers.', date: dt(1), time_value: tm(10, 0), sentiment_ids: [ids.sentimentNeutral], contact_ids: ['c:02'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:03', title: 'Lunch with Carol', text: 'Great ramen spot with {{contact:c:03}}; talked about upcoming trip.', date: dt(5), time_value: tm(12, 15), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:03'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:04', title: 'Gym with David', text: 'Workout session with {{contact:c:04}}; set new PR.', date: dt(3), time_value: tm(18, 0), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:04'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:05', title: 'Checkup with Eva', text: 'Consulted {{contact:c:05}} about running pains; advised rest.', date: dt(14), time_value: tm(16, 45), sentiment_ids: [ids.sentimentNeutral], contact_ids: ['c:05'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:06', title: 'Jam with Frank', text: 'Played guitar with {{contact:c:06}}; trying new riffs.', date: dt(7), time_value: tm(20, 0), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:06'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:07', title: 'Travel plans with Grace', text: 'Planning summer trip with {{contact:c:07}}.', date: dt(10), time_value: tm(19, 15), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:07'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:08', title: 'Family dinner with Henry', text: 'Dinner at home with {{contact:c:08}}; talked about school.', date: dt(4), time_value: tm(18, 30), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:08'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:09', title: 'Hike with Ivy', text: 'Morning hike with {{contact:c:09}}; beautiful views.', date: dt(9), time_value: tm(8, 0), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:09'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:10', title: 'Release review with Jack', text: 'Reviewed sprint tasks with {{contact:c:10}}; fixed last bugs.', date: dt(0), time_value: tm(17, 0), sentiment_ids: [ids.sentimentNeutral], contact_ids: ['c:10'], is_trashed: false, created_at: new Date().toISOString() },

  { id: 'n:11', title: 'Design critique', text: 'Feedback session with {{contact:c:01}} and {{contact:c:07}}.', date: dt(6), time_value: tm(11, 0), sentiment_ids: [ids.sentimentNeutral], contact_ids: ['c:01','c:07'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:12', title: 'Pair programming', text: 'Paired with {{contact:c:02}} on API error handling.', date: dt(2), time_value: tm(14, 45), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:02'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:13', title: 'PT advice', text: 'Follow-up advice from {{contact:c:05}} about stretching routines.', date: dt(12), time_value: tm(9, 0), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:05'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:14', title: 'Music night', text: 'Open mic night with {{contact:c:06}}; great crowd.', date: dt(8), time_value: tm(21, 30), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:06'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:15', title: 'Art show', text: 'Visited gallery with {{contact:c:03}}; inspiring pieces.', date: dt(11), time_value: tm(15, 0), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:03'], is_trashed: false, created_at: new Date().toISOString() },

  { id: 'n:16', title: 'One-on-one', text: 'Career 1:1 with {{contact:c:04}}; discussed goals.', date: dt(13), time_value: tm(10, 30), sentiment_ids: [ids.sentimentNeutral], contact_ids: ['c:04'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:17', title: 'Cooking class', text: 'Took class with {{contact:c:03}}; tried new recipes.', date: dt(20), time_value: tm(18, 0), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:03'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:18', title: 'Weekend run', text: 'Ran 5K with {{contact:c:05}} and {{contact:c:10}}.', date: dt(16), time_value: tm(7, 30), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:05','c:10'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:19', title: 'Travel itinerary', text: 'Drafted plan with {{contact:c:07}}; booked flights.', date: dt(18), time_value: tm(19, 0), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:07'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:20', title: 'Quarterly planning', text: 'Roadmap discussion with {{contact:c:02}} and {{contact:c:04}}.', date: dt(15), time_value: tm(13, 0), sentiment_ids: [ids.sentimentNeutral], contact_ids: ['c:02','c:04'], is_trashed: false, created_at: new Date().toISOString() },

  { id: 'n:21', title: 'Band rehearsal', text: 'Rehearsed with {{contact:c:06}}; setlist finalized.', date: dt(22), time_value: tm(20, 0), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:06'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:22', title: 'Parent-teacher meeting', text: 'Met {{contact:c:08}} about classroom updates.', date: dt(25), time_value: tm(16, 0), sentiment_ids: [ids.sentimentNeutral], contact_ids: ['c:08'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:23', title: 'Family gathering', text: 'Weekend BBQ with {{contact:c:08}} and {{contact:c:09}}.', date: dt(27), time_value: tm(17, 0), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:08','c:09'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:24', title: 'Design workshop', text: 'Workshop with {{contact:c:01}} and {{contact:c:07}}.', date: dt(23), time_value: tm(11, 30), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:01','c:07'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:25', title: 'Health check', text: 'Routine check with {{contact:c:05}}.', date: dt(26), time_value: tm(9, 15), sentiment_ids: [ids.sentimentNeutral], contact_ids: ['c:05'], is_trashed: false, created_at: new Date().toISOString() },

  { id: 'n:26', title: 'Sprint demo', text: 'Shared progress with {{contact:c:02}} and {{contact:c:10}}.', date: dt(28), time_value: tm(14, 0), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:02','c:10'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:27', title: 'After-work hangout', text: 'Drinks with {{contact:c:01}}, {{contact:c:04}}, and {{contact:c:07}}.', date: dt(30), time_value: tm(18, 30), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:01','c:04','c:07'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:28', title: 'Code review', text: 'Reviewed PRs with {{contact:c:02}}.', date: dt(21), time_value: tm(15, 45), sentiment_ids: [ids.sentimentNeutral], contact_ids: ['c:02'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:29', title: 'City walk', text: 'Explored downtown with {{contact:c:09}}.', date: dt(32), time_value: tm(10, 30), sentiment_ids: [ids.sentimentPositive], contact_ids: ['c:09'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:30', title: 'Morning standup', text: 'Sync with {{contact:c:10}}; set daily goals.', date: dt(29), time_value: tm(9, 0), sentiment_ids: [ids.sentimentNeutral], contact_ids: ['c:10'], is_trashed: false, created_at: new Date().toISOString() },
];

export const demoCommitments: Commitment[] = [
  { id: 'cm:01', text: 'Follow up with Alice on design doc', time: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(), contact_ids: ['c:01'], is_trashed: false },
  { id: 'cm:02', text: 'Book flights with Grace', time: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(), contact_ids: ['c:07'], is_trashed: false },
  { id: 'cm:03', text: 'Schedule checkup with Eva', time: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(), contact_ids: ['c:05'], is_trashed: false },
];

export function loadDemoData(): void {
  if (typeof window === 'undefined') return;
  // Write arrays to LS with prefixed keys; do not overwrite if user already has data
  // We intentionally overwrite for demo simplicity; could gate with a version key later
  // Build many-to-many mapping from notes → contact.note_ids
  const contactsMap = new Map<string, Contact>(demoContacts.map(c => [c.id, { ...c, note_ids: [] }]));
  for (const n of demoNotes) {
    for (const cid of n.contact_ids) {
      const c = contactsMap.get(cid);
      if (c) {
        if (!c.note_ids.includes(n.id)) c.note_ids.push(n.id);
      }
    }
  }
  const contactsWithNotes = Array.from(contactsMap.values());
  localStorage.setItem(LS_KEYS.CONTACTS, JSON.stringify(contactsWithNotes));
  localStorage.setItem(LS_KEYS.SUBJECTS, JSON.stringify(demoSubjects));
  localStorage.setItem(LS_KEYS.ORGANIZATIONS, JSON.stringify(demoOrganizations));
  localStorage.setItem(LS_KEYS.OCCUPATIONS, JSON.stringify(demoOccupations));
  localStorage.setItem(LS_KEYS.RELATIONSHIPS, JSON.stringify(demoRelationships));
  localStorage.setItem(LS_KEYS.SENTIMENTS, JSON.stringify(demoSentiments));
  localStorage.setItem(LS_KEYS.NOTES, JSON.stringify(demoNotes));
  localStorage.setItem(LS_KEYS.COMMITMENTS, JSON.stringify(demoCommitments));
}


