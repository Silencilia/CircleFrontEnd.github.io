import { LS_KEYS } from '../localStorageKeys';
import type { Contact, Subject, Organization, Occupation, Relationship, Sentiment, Note, Commitment, PrecisionDate, TimeValue } from '../../contexts/ContactContext';

// Stable IDs to keep references deterministic
const ids = {
  // sentiments
  sentimentPositive: 'sent:positive',
  sentimentNeutral: 'sent:neutral',
  sentimentNegative: 'sent:negative',
  sentimentExcited: 'sent:excited',
  sentimentGrateful: 'sent:grateful',
  sentimentCurious: 'sent:curious',
  sentimentConfused: 'sent:confused',
  sentimentStressed: 'sent:stressed',
  sentimentReflective: 'sent:reflective',
  // relationships
  relFriend: 'rel:friend',
  relColleague: 'rel:colleague',
  relFamily: 'rel:family',
  relRomantic: 'rel:romantic',
  relMentor: 'rel:mentor',
  relClient: 'rel:client',
  relManager: 'rel:manager',
  relTeammate: 'rel:teammate',
  relNeighbor: 'rel:neighbor',
  relAcquaintance: 'rel:acquaintance',
  // subjects
  subjMusic: 'subj:music',
  subjWork: 'subj:work',
  subjTravel: 'subj:travel',
  subjFood: 'subj:food',
  subjFitness: 'subj:fitness',
  subjParenting: 'subj:parenting',
  subjFinance: 'subj:finance',
  subjStartups: 'subj:startups',
  subjBooks: 'subj:books',
  subjMovies: 'subj:movies',
  subjPublicSpeaking: 'subj:public_speaking',
  subjVolunteering: 'subj:volunteering',
  subjWellness: 'subj:wellness',
  subjRunning: 'subj:running',
  subjYoga: 'subj:yoga',
  subjClimbing: 'subj:climbing',
  subjPhotography: 'subj:photography',
  subjGardening: 'subj:gardening',
  subjCooking: 'subj:cooking',
  subjArt: 'subj:art',
  subjUX: 'subj:ux',
  subjArchitecture: 'subj:architecture',
  subjCoding: 'subj:coding',
  subjAI: 'subj:ai',
  subjEducation: 'subj:education',
  subjMedicine: 'subj:medicine',
  subjTeamLeadership: 'subj:team_leadership',
  subjProjectManagement: 'subj:project_management',
  subjTravelLogistics: 'subj:travel_logistics',
  subjEventPlanning: 'subj:event_planning',
  subjMusicProduction: 'subj:music_production',
  subjGuitar: 'subj:guitar',
  subjDesignSystems: 'subj:design_systems',
  subjProductStrategy: 'subj:product_strategy',
  subjMarketing: 'subj:marketing',
  // organizations
  orgAcme: 'org:acme',
  orgGlobex: 'org:globex',
  orgStMary: 'org:stmary',
  orgCityClinic: 'org:city_clinic',
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
  { id: ids.sentimentExcited, label: 'excited', category: 'general' },
  { id: ids.sentimentGrateful, label: 'grateful', category: 'general' },
  { id: ids.sentimentCurious, label: 'curious', category: 'general' },
  { id: ids.sentimentConfused, label: 'confused', category: 'general' },
  { id: ids.sentimentStressed, label: 'stressed', category: 'general' },
  { id: ids.sentimentReflective, label: 'reflective', category: 'general' },
];

export const demoRelationships: Relationship[] = [
  { id: ids.relFriend, label: 'friend', category: 'personal' },
  { id: ids.relColleague, label: 'colleague', category: 'work' },
  { id: ids.relFamily, label: 'family', category: 'personal' },
  { id: ids.relRomantic, label: 'romantic', category: 'romantic' },
  { id: ids.relMentor, label: 'mentor', category: 'work' },
  { id: ids.relClient, label: 'client', category: 'work' },
  { id: ids.relManager, label: 'manager', category: 'work' },
  { id: ids.relTeammate, label: 'teammate', category: 'work' },
  { id: ids.relNeighbor, label: 'neighbor', category: 'personal' },
  { id: ids.relAcquaintance, label: 'acquaintance', category: 'personal' },
];

export const demoSubjects: Subject[] = [
  { id: ids.subjMusic, label: 'Music', category: 'hobby' },
  { id: ids.subjWork, label: 'Work', category: 'life' },
  { id: ids.subjTravel, label: 'Travel', category: 'life' },
  { id: ids.subjFood, label: 'Food', category: 'hobby' },
  { id: ids.subjFitness, label: 'Fitness', category: 'health' },
  { id: ids.subjParenting, label: 'Parenting', category: 'life' },
  { id: ids.subjFinance, label: 'Personal Finance', category: 'life' },
  { id: ids.subjStartups, label: 'Startups', category: 'career' },
  { id: ids.subjBooks, label: 'Books', category: 'hobby' },
  { id: ids.subjMovies, label: 'Movies', category: 'hobby' },
  { id: ids.subjPublicSpeaking, label: 'Public Speaking', category: 'career' },
  { id: ids.subjVolunteering, label: 'Volunteering', category: 'life' },
  { id: ids.subjWellness, label: 'Wellness', category: 'health' },
  { id: ids.subjRunning, label: 'Running', category: 'health' },
  { id: ids.subjYoga, label: 'Yoga', category: 'health' },
  { id: ids.subjClimbing, label: 'Climbing', category: 'health' },
  { id: ids.subjPhotography, label: 'Photography', category: 'hobby' },
  { id: ids.subjGardening, label: 'Gardening', category: 'hobby' },
  { id: ids.subjCooking, label: 'Cooking', category: 'hobby' },
  { id: ids.subjArt, label: 'Art', category: 'hobby' },
  { id: ids.subjUX, label: 'UX', category: 'career' },
  { id: ids.subjArchitecture, label: 'Architecture', category: 'career' },
  { id: ids.subjCoding, label: 'Coding', category: 'career' },
  { id: ids.subjAI, label: 'AI', category: 'career' },
  { id: ids.subjEducation, label: 'Education', category: 'life' },
  { id: ids.subjMedicine, label: 'Medicine', category: 'career' },
  { id: ids.subjTeamLeadership, label: 'Team Leadership', category: 'career' },
  { id: ids.subjProjectManagement, label: 'Project Management', category: 'career' },
  { id: ids.subjTravelLogistics, label: 'Travel Logistics', category: 'life' },
  { id: ids.subjEventPlanning, label: 'Event Planning', category: 'career' },
  { id: ids.subjMusicProduction, label: 'Music Production', category: 'hobby' },
  { id: ids.subjGuitar, label: 'Guitar', category: 'hobby' },
  { id: ids.subjDesignSystems, label: 'Design Systems', category: 'career' },
  { id: ids.subjProductStrategy, label: 'Product Strategy', category: 'career' },
  { id: ids.subjMarketing, label: 'Marketing', category: 'career' },
];

export const demoOrganizations: Organization[] = [
  { id: ids.orgAcme, name: 'Acme Corp' },
  { id: ids.orgGlobex, name: 'Globex' },
  { id: ids.orgStMary, name: 'St. Mary School' },
  { id: ids.orgCityClinic, name: 'City Health Clinic' },
];

export const demoOccupations: Occupation[] = [
  { id: ids.occEngineer, title: 'Software Engineer' },
  { id: ids.occDesigner, title: 'Product Designer' },
  { id: ids.occTeacher, title: 'Teacher' },
  { id: ids.occDoctor, title: 'Physician' },
];

// 10 contacts
export const demoContacts: Contact[] = [
  { id: 'c:01', name: 'Alice Johnson', occupation_id: ids.occDesigner, organization_id: ids.orgAcme, birth_date: { year: 1992, month: 4, day: 15 }, subject_ids: [ids.subjDesignSystems, ids.subjUX, ids.subjMusic, ids.subjProductStrategy, ids.subjPublicSpeaking, ids.subjBooks, ids.subjArt, ids.subjMarketing], relationship_ids: [ids.relColleague, ids.relFriend, ids.relMentor], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:02', name: 'Bob Smith', occupation_id: ids.occEngineer, organization_id: ids.orgGlobex, birth_date: { year: 1988, month: 9, day: 3 }, subject_ids: [ids.subjCoding, ids.subjAI, ids.subjWork, ids.subjProjectManagement, ids.subjTeamLeadership, ids.subjStartups, ids.subjBooks, ids.subjRunning], relationship_ids: [ids.relColleague, ids.relTeammate, ids.relMentor], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:03', name: 'Carol Lee', occupation_id: ids.occTeacher, organization_id: ids.orgStMary, birth_date: { year: 1990, month: 12, day: 22 }, subject_ids: [ids.subjEducation, ids.subjParenting, ids.subjBooks, ids.subjCooking, ids.subjTravel, ids.subjArt, ids.subjVolunteering, ids.subjGardening], relationship_ids: [ids.relFriend, ids.relNeighbor], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:04', name: 'David Kim', occupation_id: ids.occEngineer, organization_id: ids.orgAcme, birth_date: { year: 1985, month: 6, day: 10 }, subject_ids: [ids.subjFitness, ids.subjRunning, ids.subjYoga, ids.subjClimbing, ids.subjWork, ids.subjProjectManagement, ids.subjPublicSpeaking], relationship_ids: [ids.relColleague, ids.relTeammate, ids.relFriend], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:05', name: 'Eva Brown', occupation_id: ids.occDoctor, organization_id: undefined, birth_date: { year: 1991, month: 3, day: 8 }, subject_ids: [ids.subjMedicine, ids.subjWellness, ids.subjRunning, ids.subjYoga, ids.subjCooking, ids.subjFitness, ids.subjTravel], relationship_ids: [ids.relClient, ids.relFriend], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:06', name: 'Frank Green', occupation_id: ids.occEngineer, organization_id: ids.orgGlobex, birth_date: { year: 1987, month: 11, day: 19 }, subject_ids: [ids.subjMusic, ids.subjMusicProduction, ids.subjGuitar, ids.subjCoding, ids.subjPhotography, ids.subjTravel, ids.subjBooks], relationship_ids: [ids.relFriend, ids.relNeighbor, ids.relTeammate], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:07', name: 'Grace Miller', occupation_id: ids.occDesigner, organization_id: ids.orgAcme, birth_date: { year: 1993, month: 7, day: 25 }, subject_ids: [ids.subjTravel, ids.subjTravelLogistics, ids.subjEventPlanning, ids.subjUX, ids.subjDesignSystems, ids.subjMarketing, ids.subjPhotography, ids.subjArt], relationship_ids: [ids.relColleague, ids.relClient, ids.relFriend], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:08', name: 'Henry Davis', occupation_id: ids.occTeacher, organization_id: ids.orgStMary, birth_date: { year: 1989, month: 2, day: 14 }, subject_ids: [ids.subjEducation, ids.subjParenting, ids.subjBooks, ids.subjGardening, ids.subjCooking, ids.subjMovies, ids.subjWellness], relationship_ids: [ids.relFamily, ids.relNeighbor], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:09', name: 'Ivy Wilson', occupation_id: ids.occDoctor, organization_id: ids.orgCityClinic, birth_date: { year: 1994, month: 10, day: 5 }, subject_ids: [ids.subjTravel, ids.subjMusic, ids.subjWellness, ids.subjYoga, ids.subjGardening, ids.subjArt, ids.subjPhotography, ids.subjBooks, ids.subjMovies], relationship_ids: [ids.relFriend, ids.relRomantic], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'c:10', name: 'Jack Turner', occupation_id: ids.occEngineer, organization_id: ids.orgGlobex, birth_date: { year: 1990, month: 1, day: 30 }, subject_ids: [ids.subjWork, ids.subjProjectManagement, ids.subjTeamLeadership, ids.subjProductStrategy, ids.subjStartups, ids.subjMarketing, ids.subjCoding, ids.subjAI], relationship_ids: [ids.relColleague, ids.relManager, ids.relTeammate], note_ids: [], is_trashed: false, created_at: new Date().toISOString() },
];

function dt(offsetDays: number): PrecisionDate {
  const d = new Date(Date.now() - offsetDays * 24 * 3600 * 1000);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}
function tm(h: number, m: number): TimeValue { return { hour: h, minute: m }; }

// ~30 notes, 3-4 per contact, cross-link contacts and sentiments
export const demoNotes: Note[] = [
  { id: 'n:01', title: 'Coffee with Alice', text: `Met {{contact:c:01}} for coffee to review the design system roll-out and sketch a practical roadmap we can actually ship. We compared the current component library with the proposed design tokens, identified gaps in the typography scale, and talked about how to phase adoption to minimize churn in downstream feature teams.

We also wandered into adjacent topics that always seem to come up when we meet: how music practice routines mirror deliberate practice in UX craft, how product strategy often benefits from thinking in themes rather than projects, and which books have influenced our approach to stakeholder communication. Alice shared a quick outline for a lunch-and-learn on public speaking that she is giving next month; we listed a few anecdotes that land well in front of skeptical audiences.

Action items: I will summarize the draft migration plan, align naming across the 'Design Systems' documentation, and send a short note to engineering managers clarifying what stays stable for the next two sprints. Alice will gather examples of ambiguous components that would benefit from clearer guidelines and will invite a few design leads to a quick review.`, date: dt(2), time_value: tm(9, 30), sentiment_ids: [ids.sentimentPositive, ids.sentimentReflective, ids.sentimentCurious], contact_ids: ['c:01'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:02', title: 'Standup with Bob', text: `Daily standup with {{contact:c:02}} and the team focused on unblocking the release branch. We confirmed the CI instability was coming from a flaky integration test around the new API error handling. Bob suggested temporarily quarantining the test while we stabilize retries and structured error payloads in the service layer.

We also reviewed the sprint goal: ship the feature flag rollout, document the monitoring dashboards, and reduce our PR cycle time by enforcing smaller batches. We agreed that pairing on one or two of the gnarlier tickets would speed things up. I volunteered to draft a short checklist for reviewers that captures the expectations around logging, metrics, and user-facing copy.

No surprises from PM; we noted one dependency on infra for provisioning, and Bob will ping them. Team mood is steady; confidence medium-high.`, date: dt(1), time_value: tm(10, 0), sentiment_ids: [ids.sentimentNeutral, ids.sentimentConfused, ids.sentimentReflective], contact_ids: ['c:02'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:03', title: 'Lunch with Carol', text: `Great ramen spot with {{contact:c:03}}. Conversation ranged from upcoming travel plans and how to make packing simpler with a repeatable list, to education ideas she wants to pilot next term. Carol described how she connects reading assignments to hands-on projects so students see concepts in action.

We swapped favorite books and a few recipes we want to try at home. Carol mentioned a weekend volunteering event she is organizing, possibly combining a community garden cleanup with a small workshop for kids. We also sketched a brief itinerary for a short fall trip, aiming to keep costs modest while still getting outside and enjoying some art and food in a new place.

I left energized by the mix of practical planning and playful creativity.`, date: dt(5), time_value: tm(12, 15), sentiment_ids: [ids.sentimentPositive, ids.sentimentGrateful], contact_ids: ['c:03'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:04', title: 'Gym with David', text: `Workout session with {{contact:c:04}} focused on compound lifts and a measured approach to progressive overload. We warmed up intentionally, then cycled through squats, bench, and deadlifts, tracking form cues and rest intervals. David shared how his running base and occasional yoga sessions improve recovery and mental clarity during long weeks.

Between sets we talked about project management tactics that translate from the gym to work: keep the plan simple, record what happened, and adjust next time. We outlined a minimalist training template for busy weeks that still hits the major movement patterns, and a slightly more ambitious one for weeks with room to build volume. We agreed consistency beats intensity, and we wrote down a short list of non-negotiables: sleep, hydration, and a quick mobility block.

We also discussed public speaking reps for him—brief lightning talks to the team where he can practice pacing and breathing, similar to controlling tempo during difficult sets. I promised to review his outline and share a few storytelling frameworks that keep technical audiences engaged without drifting into jargon. We set a soft goal for a 5K tune-up race next month and penciled in a checkpoint run to test pacing.

Leaving the gym, we felt that steady progress—both in lifting and at work—comes from small, repeated wins.`, date: dt(3), time_value: tm(18, 0), sentiment_ids: [ids.sentimentPositive, ids.sentimentReflective, ids.sentimentExcited], contact_ids: ['c:04'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:05', title: 'Checkup with Eva', text: `Consulted {{contact:c:05}} about a stubborn running ache that flares after longer sessions. Eva walked through a clear diagnostic: history, current training load, shoes, and recovery habits. She emphasized building strength gradually, rotating intensity, and adding a short mobility circuit post-run. We covered wellness basics—sleep, nutrition, and stress—without turning it into a lecture.

She provided a calm, practical plan: two strength sessions that target stability, one easy run with strides, a mindful yoga flow on the off day, and optional cycling for variety. We also listed cues to watch for that would warrant follow-up. Her manner blends professional clarity with friendly reassurance; I felt heard and left with confidence.`, date: dt(14), time_value: tm(16, 45), sentiment_ids: [ids.sentimentNeutral, ids.sentimentCurious, ids.sentimentReflective], contact_ids: ['c:05'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:06', title: 'Jam with Frank', text: `Played guitar with {{contact:c:06}} and worked through a few new riffs. We layered rhythm and melody, then experimented with tone shaping and simple home recording techniques. Frank walked me through his music production workflow, from capturing clean takes to arranging tracks without overcomplicating the mix.

We also talked about the parallels between practicing scales and iterating on code—small, focused reps add up. He shared a short reading list on creativity and a couple of concert videos worth studying for stage presence and audience pacing. We ended the night with a rough demo we both liked and a plan to tighten it up next week.`, date: dt(7), time_value: tm(20, 0), sentiment_ids: [ids.sentimentPositive, ids.sentimentExcited, ids.sentimentReflective], contact_ids: ['c:06'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:07', title: 'Travel plans with Grace', text: `Planning summer trip with {{contact:c:07}} turned into a thorough session on travel logistics and shared expectations. We started by listing reasons to travel—time in nature, a dose of art, and a chance to unplug from work. Then we constrained the plan with a few guardrails: budget, vacation days, and the kind of daily rhythm that leaves room for spontaneity.

Grace excels at event planning and it shows; she built a comparison of flight options, noted transfer times, and highlighted where adding a day would dramatically reduce stress. We mapped one base city with a couple of day trips, an afternoon at a small museum, and evening walks with photography in mind. We sketched a packing list that keeps gear minimal but covers hiking layers, a compact camera, and a book to share.

We also discussed how to divide responsibilities so neither of us becomes the designated planner. She’ll hold the itinerary and reservations; I’ll handle research and local transportation. We agreed on a simple rule for meals: lean toward places with regional dishes we can’t easily get at home, and keep one unplanned slot each day for curiosity.

By the end, we had a draft we both liked and a short set of next steps: Grace will confirm dates with work, I’ll book refundable flights, and we’ll set a checkpoint to fine-tune details.`, date: dt(10), time_value: tm(19, 15), sentiment_ids: [ids.sentimentPositive, ids.sentimentExcited, ids.sentimentCurious], contact_ids: ['c:07'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:08', title: 'Family dinner with Henry', text: `Dinner at home with {{contact:c:08}} was unhurried and warm. We cooked together, swapped a few movie recommendations, and caught up on how school projects are going. Henry shared a thoughtful approach to connecting with students: start with questions that invite stories, then guide toward the lesson once everyone feels seen.

We talked about parenting rhythms, the value of simple routines, and how reading a few pages together each night keeps curiosity alive. We planned a small weekend garden project and a potluck with neighbors to mark the change of seasons. I left feeling grateful for the steady, familial cadence of the evening.`, date: dt(4), time_value: tm(18, 30), sentiment_ids: [ids.sentimentPositive, ids.sentimentGrateful, ids.sentimentReflective], contact_ids: ['c:08'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:09', title: 'Hike with Ivy', text: `Morning hike with {{contact:c:09}} along a quiet trail just after sunrise. Views opened up gradually, and the conversation did, too. Ivy talked about how yoga helps her reset after demanding weeks and how getting outside reframes small frustrations. We compared cameras and traded tips for capturing simple scenes without turning the walk into a photoshoot.

We brainstormed a low-key picnic plan for next time, maybe pairing it with a short trip to see a new exhibit. We left with the sense that we should do this more often—keep it easy, keep it fun, and keep looking up.`, date: dt(9), time_value: tm(8, 0), sentiment_ids: [ids.sentimentPositive, ids.sentimentReflective, ids.sentimentGrateful], contact_ids: ['c:09'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:10', title: 'Release review with Jack', text: `Reviewed sprint tasks with {{contact:c:10}} and walked through the state of the release branch. We started by enumerating what’s done, what’s at risk, and what needs deliberate attention before the cut. Jack asked smart questions about the monitoring plan, incident response, and how we would communicate user-facing changes. We confirmed the feature flag strategy, updated the playbook, and wrote down a crisp definition of done for the remaining tickets.

We then looked beyond this release, scanning the next two quarters for milestones that depend on the groundwork we’re laying now. We talked about team leadership patterns that sustain focus: fewer in-flight projects, tighter feedback loops on PRs, and keeping meetings short with written context. We identified a couple of experiments to reduce cycle time without burning people out—shared pairing windows, a small refactor budget each sprint, and automating a tedious check in CI.

Finally, we reviewed how we’ll measure success: clear dashboards for error rates and latency, a short survey for internal consumers, and a simple weekly note capturing wins and learnings. We finished feeling aligned and ready to ship.`, date: dt(0), time_value: tm(17, 0), sentiment_ids: [ids.sentimentNeutral, ids.sentimentReflective], contact_ids: ['c:10'], is_trashed: false, created_at: new Date().toISOString() },

  { id: 'n:11', title: 'Design critique', text: `Imported email thread with {{contact:c:01}} and {{contact:c:07}} regarding the design critique and the direction of our design system. Headers and quoted context preserved for clarity.

From: Alice Johnson <alice@example.com>
To: Grace Miller <grace@example.com>, Me <me@example.com>
Subject: Re: Design Critique – Buttons, Forms, and Migration
Date: Mon, 12 Jun 09:18:02 -0700

Hey both,

Following our coffee chat, I captured a few themes: tighten our type scale, unify button shapes across surfaces, and stage the migration so teams can adopt parts without waiting on everything. I proposed a doc structure and attached a few screenshots of ambiguous states. Thoughts on sequencing? —A

----- Original Message -----
From: Me <me@example.com>
To: Alice Johnson <alice@example.com>, Grace Miller <grace@example.com>
Date: Mon, 12 Jun 08:02:11 -0700
Subject: Design Critique – Buttons, Forms, and Migration

Morning! After last week’s review, I’d like feedback on a phased rollout plan. The gist: codify the foundations (tokens, grid, spacing), provide high-confidence primitives (Button, Input, Select), and then migrate container patterns with clear deprecations. We’ll show examples that balance developer ergonomics with visual consistency, avoiding churn for downstream feature teams.

— Proposed Outline —
1) Foundations: tokens, typography scale, color roles with accessible contrast guidance.
2) Primitives: focus, hover, and disabled states that match motion guidelines; priority levels; destructive variants.
3) Forms: validation messaging, inline help, and spacing rules that survive translation and longer labels.
4) Migration Guide: mapping legacy components to new primitives, with notes on a11y and content.
5) Comms: broadcast plan and FAQ; office hours.

----- Reply -----
From: Grace Miller <grace@example.com>
To: Me <me@example.com>, Alice Johnson <alice@example.com>
Date: Mon, 12 Jun 10:02:44 -0700
Subject: Re: Design Critique – Buttons, Forms, and Migration

Love this outline. I’ll add a section on imagery and motion for marketing contexts so we don’t fork brand voice across product and site. Could we show before/after examples with measurements? I can own crafting two case studies: checkout (form density, progressive disclosure) and settings (secondary actions, subdued emphasis). Also: let’s make room for a dark mode pass before we lock palettes.

—G

----- Reply -----
From: Alice Johnson <alice@example.com>
To: Grace Miller <grace@example.com>, Me <me@example.com>
Date: Mon, 12 Jun 11:26:03 -0700
Subject: Re: Design Critique – Buttons, Forms, and Migration

Agree re: case studies. I’ll document pitfalls: mismatched radii, inconsistent label casing, and ambiguous focus rings. For accessibility, we should set hard constraints: minimum touch targets, color contrast, and motion reduction. I’ll draft the typography section with scale and naming.

----- Reply -----
From: Me <me@example.com>
To: Alice Johnson <alice@example.com>, Grace Miller <grace@example.com>
Date: Mon, 12 Jun 12:14:20 -0700
Subject: Re: Design Critique – Buttons, Forms, and Migration

Thanks both. I’m adding a migration checklist that devs can paste into PRs:

- Replace old tokens; do not mix systems within a single surface.
- Adopt new Button/Link variants with role-appropriate emphasis.
- Validate spacing with the new grid; avoid ad-hoc margins.
- Confirm focus styles and keyboard paths.
- Update copy to follow the voice and tone guidelines; confirm i18n expansion.

Let’s aim for a working draft by Friday. I’ll schedule a live critique where we walk through real screens and capture decisions in-line. I’ll also bring a short deck summarizing the why for leadership.

— End Thread —

Meta-notes: This captures our direction and next steps. The plan anchors on 'Design Systems', 'UX', and 'Marketing' coherence while staying pragmatic about developer experience. Follow-ups: measure adoption, collect friction, and adjust.`, date: dt(6), time_value: tm(11, 0), sentiment_ids: [ids.sentimentNeutral, ids.sentimentCurious, ids.sentimentReflective], contact_ids: ['c:01','c:07'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:12', title: 'Pair programming', text: `Paired with {{contact:c:02}} on API error handling, starting with a quick review of failing tests and a shared mental model of the desired behavior. We used a timer to swap driver/navigator roles every fifteen minutes, which kept us both engaged and prevented rabbit holes. Bob suggested making error types explicit so we could branch on intent, not message text. We refactored a couple of call sites, wrote a regression test, and added a small utility for consistent logging that includes correlation IDs. We also noted a few candidates for future cleanup and left breadcrumbs in the code for discoverability. The session felt smooth and focused; we kept scope tight and left the code easier to reason about.`, date: dt(2), time_value: tm(14, 45), sentiment_ids: [ids.sentimentPositive, ids.sentimentReflective, ids.sentimentCurious], contact_ids: ['c:02'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:13', title: 'PT advice', text: `Follow-up advice from {{contact:c:05}} on stretching and strength progressions. We reviewed a short routine anchored by sensible ranges of motion: calf raises, single-leg balance, light band work, and a gentle hip series. Eva emphasized that the goal is to move consistently, not to chase intensity on recovery days.

She suggested placing the routine after easy runs, stacking it with a five-minute breath-led cooldown. We also noted how small cues—soft knees, long spine—help avoid over-correcting. I’ll track how things feel across the week and send her a quick update.`, date: dt(12), time_value: tm(9, 0), sentiment_ids: [ids.sentimentPositive, ids.sentimentGrateful], contact_ids: ['c:05'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:14', title: 'Music night', text: `Open mic night with {{contact:c:06}} had a friendly crowd and a forgiving room. We chose a simple set of two originals and one cover, leaned into dynamics, and tried to keep the arrangement uncluttered. Frank’s sense of groove carried the tunes; I focused on staying relaxed and letting phrases breathe. We listened to a few other performers and took notes on stage presence and pacing—how people settled the room, how they used silence, and how they adjusted when something went sideways. We left with a short list of adjustments and a plan to record a practice take to hear what the room hears.`, date: dt(8), time_value: tm(21, 30), sentiment_ids: [ids.sentimentPositive, ids.sentimentExcited], contact_ids: ['c:06'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:15', title: 'Art show', text: `Visited a small gallery with {{contact:c:03}} and let the afternoon unfold at a slower pace. We moved through rooms without trying to see everything, pausing where a piece invited a second look. Carol described how she helps students approach art: start by noticing, then describe, then interpret, and only later evaluate.

We talked about how this maps to writing and design critiques—separate observation from judgment; let language catch up to what you’re seeing. A series of charcoal studies sparked a conversation about constraint and repetition; a mixed-media collage led to thoughts about how memory fragments inform what we make. We ended with coffee and a couple of sketches for a classroom exercise that blends observation, drawing, and short writing.

It felt like a reminder that attention is a muscle worth training.`, date: dt(11), time_value: tm(15, 0), sentiment_ids: [ids.sentimentPositive, ids.sentimentReflective], contact_ids: ['c:03'], is_trashed: false, created_at: new Date().toISOString() },

  { id: 'n:16', title: 'One-on-one', text: `Career 1:1 with {{contact:c:04}} focused on sharpening goals for the next quarter. We talked about two tracks—technical depth in system reliability and a few public speaking reps to share lessons learned. David will own a small but meaningful reliability improvement and present a short lightning talk about it to the team.

We set a cadence for check-ins, agreed on what success looks like, and promised to keep the plan flexible as new constraints appear.`, date: dt(13), time_value: tm(10, 30), sentiment_ids: [ids.sentimentNeutral, ids.sentimentReflective], contact_ids: ['c:04'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:17', title: 'Cooking class', text: `Took a casual cooking class with {{contact:c:03}} and practiced a couple of new techniques: knife work that actually saves time, seasoning in layers, and finishing with acid to brighten flavors. Carol loved how the instructor paused to explain the why behind each step. We made a simple soup and a quick sauté that we could replicate at home on a weeknight. We swapped ideas for a small dinner with friends and sketched a menu that balances effort and comfort. It felt good to make something tangible with our hands after a screen-heavy week.`, date: dt(20), time_value: tm(18, 0), sentiment_ids: [ids.sentimentPositive, ids.sentimentCurious, ids.sentimentGrateful], contact_ids: ['c:03'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:18', title: 'Weekend run', text: `Imported chat transcript with {{contact:c:05}} and {{contact:c:10}} about the weekend 5K and how we’re weaving training into busy schedules. Timestamps preserved.

[07:12] Jack: Morning! What pace are we thinking? I’m good with an easy conversational run.
[07:12] Eva: Same. Let’s keep it aerobic and finish feeling like we could do more. I’d like to add strides after.
[07:13] Me: Works. Route: park loop twice then the river path. Water fountain at the bridge.

[07:30] Jack: Warmed up. Noticing the left calf is a bit tight but fine once we’re moving.
[07:31] Eva: Let’s keep the first mile very easy. Breath through the nose if you can. Shoulders relaxed.
[07:32] Me: Copy that. Today is about time on feet, not pace.

[07:45] Jack: Feeling better. Breathing settled. Conversation pace indeed.
[07:46] Eva: Post-run we’ll do 4×20s strides with full recovery. Then a short mobility block: calf raises, hip airplanes, thoracic rotations.
[07:47] Me: I’ll film one stride so we can check cadence and posture.

[08:02] Jack: Love this loop. Sunlight on the water is a vibe.
[08:03] Eva: Perfect weather. Keep ankles springy, avoid overstriding.
[08:04] Me: Quick systems chat: release prep looks good. I’ll post the checklist later.

[08:20] Jack: Done with the easy portion. Ready for strides when you are.
[08:21] Eva: Stride 1: tall posture, quick feet. Recover fully.
[08:23] Me: Stride 2: slight forward lean from the ankles, stay relaxed.
[08:25] Eva: Stride 3: think quick but quiet steps. No pushing.
[08:27] Jack: Stride 4: fun! Feels smooth today.

[08:35] Eva: Cool-down walk. Hydrate and snack. Jack, consider 1 minute of calf raises later; Me, add the band work we discussed.
[08:36] Me: Copy. I’ll also schedule a short yoga session this evening.
[08:36] Jack: I’ll prep the release review notes and ping infra.

— Summary —
Relaxed group run, light strides, and a practical recovery plan. Threaded in talk about team leadership and release prep with {{contact:c:10}}, plus form cues and wellness notes from {{contact:c:05}}.`, date: dt(16), time_value: tm(7, 30), sentiment_ids: [ids.sentimentPositive, ids.sentimentExcited], contact_ids: ['c:05','c:10'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:19', title: 'Travel itinerary', text: `Drafted a shared itinerary with {{contact:c:07}} and finalized refundable flights. We prioritized fewer moves, more depth: one base city with day trips that let us test photography at golden hour and spend time in quieter neighborhoods. We placed museum visits at mid-day when walking is welcome and planned two hikes with flexible turnarounds.

We used a simple template for each day—morning anchor, midday open slot, late afternoon activity, and dinner—so the plan breathes. Grace handled bookings and confirmations; I researched local transit passes and sketched contingency options if weather shifts. We also set a short rule set: phones on airplane mode during meals, one hour each day to read, and one unplanned window for surprises.

We’ll revisit packing next week and decide whether to travel with just carry-ons.`, date: dt(18), time_value: tm(19, 0), sentiment_ids: [ids.sentimentPositive, ids.sentimentExcited, ids.sentimentCurious], contact_ids: ['c:07'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:20', title: 'Quarterly planning', text: `Roadmap discussion with {{contact:c:02}} and {{contact:c:04}} centered on focus and sequencing. We listed all active initiatives, then aggressively cut the list to what we can credibly deliver. Bob argued for narrowing scope where possible and baking in small refactor budgets to reduce future drag. David suggested setting aside a recurring pairing window to unblock thorny tasks faster. We set two crisp milestones, defined how we’ll measure progress, and wrote down risk triggers that will prompt a plan B. We also agreed to keep communication lightweight and regular: a short written update each Friday that captures decisions, risks, and wins.`, date: dt(15), time_value: tm(13, 0), sentiment_ids: [ids.sentimentNeutral, ids.sentimentReflective, ids.sentimentStressed], contact_ids: ['c:02','c:04'], is_trashed: false, created_at: new Date().toISOString() },

  { id: 'n:21', title: 'Band rehearsal', text: `Rehearsed with {{contact:c:06}} and locked in a tight setlist. We started with a slow warm-up, dialed in tone, and then ran transitions between songs to tighten timing. Frank suggested a few arrangement tweaks that opened space for the vocals and simplified the guitar parts without losing energy.

We recorded a quick practice take to review phrasing and dynamics later. We wrapped with a checklist for next time: strings, fresh picks, and a simple backing track for one tune so we can experiment with layering without overcomplicating the setup.`, date: dt(22), time_value: tm(20, 0), sentiment_ids: [ids.sentimentPositive, ids.sentimentExcited], contact_ids: ['c:06'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:22', title: 'Parent-teacher meeting', text: `Conversation transcript with {{contact:c:08}} about classroom updates, student engagement, and practical support at home. Notes captured in near-verbatim style for context.

Me: Thanks for meeting after school. I wanted to hear how the new reading groups are working.
Henry: They’re going well overall. Smaller groups make it easier to meet students where they are. The challenge is pacing—we need to keep faster readers engaged without rushing others.
Me: What’s working best?
Henry: Short cycles. Ten minutes of reading, five minutes of discussion, then a brief write-up. Students stay more focused when they know a change is coming.
Me: Anything parents can do at home that aligns with your approach?
Henry: Read together for a few minutes most nights—anything the child enjoys. Ask open questions that invite stories, not quizzes. Let them pick topics, then guide gently.
Me: How are the new materials?
Henry: Better. Clearer guidance for diverse learners and more room for choice. We’re also building a small library with donated books.
Me: What should we watch for?
Henry: Signs of frustration that persist across days. If that happens, send a quick note. We can adjust groups or swap reading levels.

We also covered upcoming events, a classroom garden project, and a short movie night to build community. Henry emphasized that progress often looks like steady, unremarkable consistency rather than dramatic leaps.`, date: dt(25), time_value: tm(16, 0), sentiment_ids: [ids.sentimentNeutral, ids.sentimentReflective], contact_ids: ['c:08'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:23', title: 'Family gathering', text: `Weekend BBQ with {{contact:c:08}} and {{contact:c:09}} felt easy and unrushed. We prepped a few simple dishes, set a table outside, and let the afternoon flow. Conversations drifted from favorite movies to plans for a small fall trip and even a bit of light gardening strategy. Henry talked about a classroom project he wants to try; Ivy shared a photo series idea she’s been sketching for weekend walks.

We played a short game with the kids, took turns on the grill, and passed around a book someone brought. It was a reminder that shared meals and unstructured time do a lot of work that calendars can’t. We left with a plan to repeat it soon and rotate hosting to keep it easy.`, date: dt(27), time_value: tm(17, 0), sentiment_ids: [ids.sentimentPositive, ids.sentimentGrateful], contact_ids: ['c:08','c:09'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:24', title: 'Design workshop', text: `Workshop with {{contact:c:01}} and {{contact:c:07}} brought design and marketing closer around shared principles. We opened by restating our goals—clarity, coherence, and efficiency—then built real examples on screen. Alice led a live critique of interface states; Grace showed how imagery and motion choices can remain consistent across contexts without feeling rigid.

We wrote down a handful of decisions in the moment: naming for a few Button variants, spacing rules for dense forms, and an approach to imagery that works in product and on landing pages. We closed with a short retrospective and immediate next steps.`, date: dt(23), time_value: tm(11, 30), sentiment_ids: [ids.sentimentPositive, ids.sentimentCurious], contact_ids: ['c:01','c:07'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:25', title: 'Health check', text: `Routine check with {{contact:c:05}} covered the basics: how I’m sleeping, the mix of activities across the week, and how the body feels on average days versus peak stress days. Eva suggested a simple quarterly rhythm—get labs if needed, adjust training volume seasonally, and plan rest weeks on purpose rather than by accident.

We agreed to revisit in a month after the current work push calms down.`, date: dt(26), time_value: tm(9, 15), sentiment_ids: [ids.sentimentNeutral, ids.sentimentReflective], contact_ids: ['c:05'], is_trashed: false, created_at: new Date().toISOString() },

  { id: 'n:26', title: 'Sprint demo', text: `Sprint demo transcript with {{contact:c:02}} and {{contact:c:10}}. Speaker tags preserved.

Host (Me): Thanks for joining. We’ll walk through three parts: API resilience, error reporting, and the feature flag rollout. We’ll pause for questions after each.

Part 1 – API Resilience
Bob: We added idempotent retries on the client and exponential backoff for network timeouts. The goal is to reduce user-facing errors without masking real failures. We also instrumented request/response timings.
Jack: How do we prevent retries from amplifying traffic during incidents?
Bob: We cap attempts and add jitter. We also surface a circuit-breaker metric; ops can tighten limits during an incident.

Part 2 – Error Reporting
Me: We standardized error payloads with a machine-readable code and a human-readable message. Logging now captures correlation IDs, and we added a button in the UI to copy the error context.
Jack: What’s our plan for redacting sensitive data?
Me: The logger has an allowlist for fields; PII is never logged. We added unit tests to enforce this.

Part 3 – Feature Flags
Bob: Flags guard risky changes and make rollouts reversible. We added a tiny CLI to flip flags per environment.
Jack: How do we avoid long-lived flags?
Bob: Each flag has an owner and an expiry date. CI warns on overdue flags.

Q&A
PM: Will the retries affect analytics?
Me: We’re de-duplicating client events server-side using IDs.
Infra: Any config we need to change?
Jack: Only the new dashboards; we’ll share links after.

Wrap-up
Me: Thanks everyone. Next steps are in the doc. We’ll post the recording for those who missed the session.`, date: dt(28), time_value: tm(14, 0), sentiment_ids: [ids.sentimentPositive, ids.sentimentExcited, ids.sentimentReflective], contact_ids: ['c:02','c:10'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:27', title: 'After-work hangout', text: `Drinks with {{contact:c:01}}, {{contact:c:04}}, and {{contact:c:07}} turned into a relaxed debrief. We traded small wins from the week, swapped book and music recommendations, and compared notes on where to focus next sprint. Alice shared a neat trick for structuring critiques, David recapped a training cycle he likes, and Grace talked about a simple approach to trip planning that reduces friction.

We ended with a short list of ideas to try next week and a promise to keep evenings like this on the calendar.`, date: dt(30), time_value: tm(18, 30), sentiment_ids: [ids.sentimentPositive, ids.sentimentGrateful], contact_ids: ['c:01','c:04','c:07'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:28', title: 'Code review', text: `Reviewed PRs with {{contact:c:02}} and focused on clarity: small changes, descriptive names, and tests that tell a story. We tried to keep feedback specific, actionable, and kind. Where code felt tangled, we asked questions about intent; where names felt vague, we suggested alternatives that carry meaning. We called out a few patterns worth extracting and noted where duplication was a signal, not a problem, given the release timeline. Bob suggested a small lint rule to catch a recurring footgun and drafted the first pass while I verified it against the codebase. We wrapped with two merges and a plan to follow up next week on the refactor candidates.`, date: dt(21), time_value: tm(15, 45), sentiment_ids: [ids.sentimentNeutral, ids.sentimentReflective], contact_ids: ['c:02'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:29', title: 'City walk', text: `Explored downtown with {{contact:c:09}} and aimed for slow looking. We checked out a small bookstore, a quiet side street with great light for photos, and a cafe with a back patio. Conversation drifted between travel ideas, favorite films, and a simple plan to host friends for dinner soon.

We agreed to keep an eye on the weather next weekend for another walk, maybe with a museum stop.`, date: dt(32), time_value: tm(10, 30), sentiment_ids: [ids.sentimentPositive, ids.sentimentReflective], contact_ids: ['c:09'], is_trashed: false, created_at: new Date().toISOString() },
  { id: 'n:30', title: 'Morning standup', text: `Sync with {{contact:c:10}} to set daily goals and check release readiness. We kept it quick: one commitment each, one risk, and one note of appreciation for the prior day. Jack will verify dashboards, I’ll post the checklist, and we’ll regroup after lunch if anything changes. We also aligned on the message for stakeholders if timelines shift: clear status, concrete next steps, and an honest read on risk. The goal is to reduce noise while increasing trust—say less, mean more, do what we promised.`, date: dt(29), time_value: tm(9, 0), sentiment_ids: [ids.sentimentNeutral, ids.sentimentReflective], contact_ids: ['c:10'], is_trashed: false, created_at: new Date().toISOString() },
];

export const demoCommitments: Commitment[] = [
  { 
    id: 'cm:01', 
    text: 'Follow up with Alice on design doc', 
    due_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    due_time: new Date(Date.now() + 2 * 24 * 3600 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    contact_ids: ['c:01'], 
    is_trashed: false 
  },
  { 
    id: 'cm:02', 
    text: 'Book flights with Grace', 
    due_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    due_time: new Date(Date.now() + 7 * 24 * 3600 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    contact_ids: ['c:07'], 
    is_trashed: false 
  },
  { 
    id: 'cm:03', 
    text: 'Schedule checkup with Eva', 
    due_date: new Date(Date.now() + 10 * 24 * 3600 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    due_time: new Date(Date.now() + 10 * 24 * 3600 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    contact_ids: ['c:05'], 
    is_trashed: false 
  },
];

function seedDemoChat(): void {
  if (typeof window === 'undefined') return;
  
  const chatId = 'demo-chat-001';
  const key = `circle_chat_messages_${chatId}`;
  
  const now = new Date();
  // Timestamps: spread entries over ~13 minutes for realism
  const baseTime = now.getTime() - 13 * 60 * 1000;
  
  const entries = [
    // Entry 1: user records encounter
    {
      id: 'msg-demo-01',
      role: 'user' as const,
      text: "[09:03] Alice: Perfect. Morning!\n[09:06] Me: Quick agenda: review design system rollout + migration plan, gaps in the component library, and typography scale.\n[09:08] Alice: Let’s compare the current components to the new design tokens; I have a few screenshots of ambiguous states.\n[09:12] Me: Seeing mismatched radii and inconsistent label casing in forms; spacing feels ad-hoc.\n[09:15] Alice: We should tighten the type scale and set spacing rules that survive translation.\n[09:18] Me: For rollout, phase adoption so downstream teams don’t churn; start with foundations (tokens, grid, spacing) then ship high-confidence primitives.\n[09:22] Alice: Agreed. We can document a migration checklist and call out deprecations.\n[09:25] Me: Action items for me: draft the migration plan, align naming across docs, and clarify what stays stable for the next two sprints for eng managers.\n[09:28] Alice: I’ll gather examples of ambiguous components and invite a couple of design leads for a review.\n[09:31] Me: You mentioned your lunch-and-learn on public speaking next month—love the outline.\n[09:32] Alice: Yep, and the anecdotes that land with skeptical audiences—we can pick two that fit your migration story.\n[09:36] Me: Also chatted about how music practice maps to deliberate practice in UX craft and stakeholder communication.\n[09:42] Alice: Send me the draft by Friday; I’ll leave inline comments.\n[09:45] Me: Deal. Great coffee and super productive.",
      createdAt: new Date(baseTime).toISOString(),
    },
    // Entry 2: system asks for confirmation
    {
      id: 'msg-demo-02',
      role: 'system' as const,
      text: "Sounds like you met a few people. Do these look right?",
      createdAt: new Date(baseTime + 1 * 60 * 1000).toISOString(),
    },
    // Entry 3: NameConfirm component (locked, already confirmed)
    {
      id: 'msg-demo-03',
      role: 'system' as const,
      parts: [
        {
          type: 'component' as const,
          kind: 'NameConfirm' as const,
          props: {
            draftId: 'draft-demo-1',
            locked: 'confirm',
            existing: [
              {
                contactId: 'c:01',
                contactName: 'Alice Johnson',
                original: 'Alice Johnson',
                snippet: '...coffee with Alice Johnson where...',
              },
            ],
            newOnes: [],
            selectedExisting: { 'c:01': true },
            selectedNew: {},
          },
        },
      ],
      createdAt: new Date(baseTime + 1.5 * 60 * 1000).toISOString(),
    },
    // Entry 4: system confirms selection and shows draft
    {
      id: 'msg-demo-04',
      role: 'system' as const,
      text: "Very well. You selected these people you know:\n{{contact:c:01}}\nHere is a draft of your new note. Let me know if you want to save it or summarize it for key information.",
      createdAt: new Date(baseTime + 2 * 60 * 1000).toISOString(),
    },
    // Entry 5: DraftCard component (locked as extracted)
    {
      id: 'msg-demo-05',
      role: 'system' as const,
      parts: [
        {
          type: 'component' as const,
          kind: 'DraftCard' as const,
          props: {
            draft: {
              id: 'draft-demo-1',
              title: 'Coffee with Alice',
              text: "[09:03] Alice: Perfect. Morning!\n[09:06] Me: Quick agenda: review design system rollout + migration plan, gaps in the component library, and typography scale.\n[09:08] Alice: Let’s compare the current components to the new design tokens; I have a few screenshots of ambiguous states.\n[09:12] Me: Seeing mismatched radii and inconsistent label casing in forms; spacing feels ad-hoc.\n[09:15] Alice: We should tighten the type scale and set spacing rules that survive translation.\n[09:18] Me: For rollout, phase adoption so downstream teams don’t churn; start with foundations (tokens, grid, spacing) then ship high-confidence primitives.\n[09:22] Alice: Agreed. We can document a migration checklist and call out deprecations.\n[09:25] Me: Action items for me: draft the migration plan, align naming across docs, and clarify what stays stable for the next two sprints for eng managers.\n[09:28] Alice: I’ll gather examples of ambiguous components and invite a couple of design leads for a review.\n[09:31] Me: You mentioned your lunch-and-learn on public speaking next month—love the outline.\n[09:32] Alice: Yep, and the anecdotes that land with skeptical audiences—we can pick two that fit your migration story.\n[09:36] Me: Also chatted about how music practice maps to deliberate practice in UX craft and stakeholder communication.\n[09:42] Alice: Send me the draft by Friday; I’ll leave inline comments.\n[09:45] Me: Deal. Great coffee and super productive.",
              date: { year: 2025, month: 10, day: 27 },
              time: { hour: 9, minute: 30 },
            },
            locked: 'extract',
          },
        },
      ],
      createdAt: new Date(baseTime + 2.5 * 60 * 1000).toISOString(),
    },
    // Entry 6: system announces note creation
    {
      id: 'msg-demo-06',
      role: 'system' as const,
      text: "Great! Here is your note:",
      createdAt: new Date(baseTime + 5 * 60 * 1000).toISOString(),
    },
    // Entry 7: NoteCard showing the summarized note
    {
      id: 'msg-demo-07',
      role: 'system' as const,
      parts: [
        {
          type: 'component' as const,
          kind: 'NoteCard' as const,
          props: { id: 'n:01' },
        },
      ],
      createdAt: new Date(baseTime + 5.5 * 60 * 1000).toISOString(),
    },
    // Entry 8: user asks search question (targets a different note)
    {
      id: 'msg-demo-08',
      role: 'user' as const,
      text: "What decisions did we capture during the design workshop with Alice and Grace?",
      createdAt: new Date(baseTime + 7 * 60 * 1000).toISOString(),
    },
    // Entry 9: system answers with context (summarizes note n:24)
    {
      id: 'msg-demo-09',
      role: 'system' as const,
      text: "You aligned on shared principles and captured concrete decisions: naming for several Button variants, spacing rules for dense forms, and an imagery approach that stays consistent across product and landing pages. Alice led a live critique of interface states, and Grace showed imagery and motion choices. You closed with a short retrospective and immediate next steps.",
      createdAt: new Date(baseTime + 8 * 60 * 1000).toISOString(),
    },
    // Entry 10: citation parts for search (cite c:01, c:07 and n:24)
    {
      id: 'msg-demo-10',
      role: 'system' as const,
      parts: [
        {
          type: 'component' as const,
          kind: 'ContactCard' as const,
          props: { id: 'c:01' },
        },
        {
          type: 'component' as const,
          kind: 'ContactCard' as const,
          props: { id: 'c:07' },
        },
        {
          type: 'component' as const,
          kind: 'NoteCard' as const,
          props: { id: 'n:24' },
        },
      ],
      createdAt: new Date(baseTime + 8.5 * 60 * 1000).toISOString(),
    },
    // Entry 11: user asks for advice (targets yet another note)
    {
      id: 'msg-demo-11',
      role: 'user' as const,
      text: "I want to improve my public speaking by practicing lightning talks with David. What should I do next?",
      createdAt: new Date(baseTime + 10 * 60 * 1000).toISOString(),
    },
    // Entry 12: system provides advice (grounded in note n:04)
    {
      id: 'msg-demo-12',
      role: 'system' as const,
      text: "Great plan. Since David has been practicing public speaking reps, try these next steps:\n\n1. Schedule a 5-minute lightning talk to your team about the design system migration. Focus on pacing and breathing (as you discussed at the gym).\n\n2. Ask David to observe and give feedback on structure, clarity, and one delivery element (e.g., pauses). Keep scope tiny but consistent.\n\n3. Repeat weekly for 3–4 weeks. Track one small improvement each time—deliberate practice beats intensity.\n\n4. When comfortable, expand to a 10-minute version or co-present with David for supportive reps.",
      createdAt: new Date(baseTime + 11 * 60 * 1000).toISOString(),
    },
    // Entry 13: citation parts for advice (cite c:04 and n:04)
    {
      id: 'msg-demo-13',
      role: 'system' as const,
      parts: [
        {
          type: 'component' as const,
          kind: 'ContactCard' as const,
          props: { id: 'c:04' },
        },
        {
          type: 'component' as const,
          kind: 'NoteCard' as const,
          props: { id: 'n:04' },
        },
      ],
      createdAt: new Date(baseTime + 11.5 * 60 * 1000).toISOString(),
    },
  ];
  
  localStorage.setItem(key, JSON.stringify(entries));
  // Set a human-readable title for the demo chat based on the first entry
  try {
    const title = 'Coffee with Alice';
    localStorage.setItem(`circle_chat_title_${chatId}`, title);
  } catch {}
  
  // Optionally activate this chat if no current chat exists
  if (!localStorage.getItem('currentChatId')) {
    localStorage.setItem('currentChatId', chatId);
  }
}

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
  
  // Seed demo chat
  seedDemoChat();
}


