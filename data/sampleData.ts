import { Contact, Subject, Relationship, Sentiment, Note, Organization, Occupation } from '../contexts/ContactContext';

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

export const sampleSentiments: Sentiment[] = [
  { id: 1, label: 'positive', category: 'positive' },
  { id: 2, label: 'neutral', category: 'neutral' },
  { id: 3, label: 'negative', category: 'negative' },
  { id: 4, label: 'excited', category: 'positive' },
  { id: 5, label: 'happy', category: 'positive' },
  { id: 6, label: 'satisfied', category: 'positive' },
  { id: 7, label: 'calm', category: 'neutral' },
  { id: 8, label: 'indifferent', category: 'neutral' },
  { id: 9, label: 'frustrated', category: 'negative' },
  { id: 10, label: 'disappointed', category: 'negative' }
];

export const sampleNotes: Note[] = [
  // Alex Johnson (Contact 1) - 5 notes
  {
    id: 1,
    text: 'Had coffee and discussed new project ideas. We talked about potential collaboration opportunities and shared insights about the current market trends. The conversation was very productive and we agreed to follow up next week.',
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
    text: 'Met at the tech conference and discussed AI trends. Alex shared interesting insights about machine learning applications in their current project. Great networking opportunity.',
    person: 'Alex Johnson',
    time: 'Dec 10, 2024 4:30 PM',
    location: 'Tech Conference Center',
    event: 'Tech conference',
    sentiment: 'positive',
    contactIds: [1],
    createdAt: '2024-12-10T16:30:00Z'
  },
  {
    id: 3,
    text: 'Quick lunch meeting to discuss potential partnership. Alex mentioned they\'re looking for developers with React experience. Promised to connect them with our team.',
    person: 'Alex Johnson',
    time: 'Dec 5, 2024 12:00 PM',
    location: 'Local Deli',
    event: 'Lunch meeting',
    sentiment: 'neutral',
    contactIds: [1],
    createdAt: '2024-12-05T12:00:00Z'
  },
  {
    id: 4,
    text: 'Phone call about project timeline. Alex expressed concerns about meeting the deadline. Offered to help review the code and provide suggestions.',
    person: 'Alex Johnson',
    time: 'Nov 28, 2024 3:00 PM',
    location: 'Phone call',
    event: 'Project review call',
    sentiment: 'neutral',
    contactIds: [1],
    createdAt: '2024-11-28T15:00:00Z'
  },
  {
    id: 5,
    text: 'Met at the gym and chatted about work-life balance. Alex mentioned they\'ve been working long hours and feeling stressed. Suggested some time management techniques.',
    person: 'Alex Johnson',
    time: 'Nov 20, 2024 6:00 PM',
    location: 'Fitness Center',
    event: 'Gym session',
    sentiment: 'positive',
    contactIds: [1],
    createdAt: '2024-11-20T18:00:00Z'
  },

  // Sarah Chen (Contact 2) - 5 notes
  {
    id: 6,
    text: 'Team lunch meeting about Q1 strategy. Discussed upcoming projects and resource allocation. Some concerns were raised about timeline feasibility.',
    person: 'Sarah Chen',
    time: 'Dec 12, 2024 12:00 PM',
    location: 'Office Conference Room',
    event: 'Team meeting',
    sentiment: 'neutral',
    contactIds: [2],
    createdAt: '2024-12-12T12:00:00Z'
  },
  {
    id: 7,
    text: 'Coffee chat about career development. Sarah shared her interest in moving into product management. Discussed potential opportunities and skills she should develop.',
    person: 'Sarah Chen',
    time: 'Dec 8, 2024 10:00 AM',
    location: 'Office Kitchen',
    event: 'Career discussion',
    sentiment: 'positive',
    contactIds: [2],
    createdAt: '2024-12-08T10:00:00Z'
  },
  {
    id: 8,
    text: 'Quick hallway conversation about the new design system. Sarah had some feedback about the color palette and suggested improvements for accessibility.',
    person: 'Sarah Chen',
    time: 'Dec 3, 2024 2:30 PM',
    location: 'Office Hallway',
    event: 'Design feedback',
    sentiment: 'positive',
    contactIds: [2],
    createdAt: '2024-12-03T14:30:00Z'
  },
  {
    id: 9,
    text: 'Met at the art gallery opening. Sarah was excited about the new exhibition and we discussed our shared interest in contemporary art. Great cultural experience.',
    person: 'Sarah Chen',
    time: 'Nov 25, 2024 7:00 PM',
    location: 'Modern Art Gallery',
    event: 'Gallery opening',
    sentiment: 'positive',
    contactIds: [2],
    createdAt: '2024-11-25T19:00:00Z'
  },
  {
    id: 10,
    text: 'Phone call about project collaboration. Sarah mentioned some challenges with cross-team communication. Offered to help facilitate a meeting between the teams.',
    person: 'Sarah Chen',
    time: 'Nov 18, 2024 4:00 PM',
    location: 'Phone call',
    event: 'Project collaboration call',
    sentiment: 'neutral',
    contactIds: [2],
    createdAt: '2024-11-18T16:00:00Z'
  },

  // Michael Rodriguez (Contact 3) - 5 notes
  {
    id: 11,
    text: 'Client presentation went poorly. Technical difficulties and unprepared responses led to a negative impression. Need to improve preparation for future meetings.',
    person: 'Michael Rodriguez',
    time: 'Dec 10, 2024 10:00 AM',
    location: 'Client Office',
    event: 'Client presentation',
    sentiment: 'negative',
    contactIds: [3],
    createdAt: '2024-12-10T10:00:00Z'
  },
  {
    id: 12,
    text: 'Met for lunch to discuss the failed presentation. Michael was clearly frustrated and disappointed. Helped him analyze what went wrong and plan improvements.',
    person: 'Michael Rodriguez',
    time: 'Dec 11, 2024 1:00 PM',
    location: 'Mexican Restaurant',
    event: 'Post-presentation debrief',
    sentiment: 'negative',
    contactIds: [3],
    createdAt: '2024-12-11T13:00:00Z'
  },
  {
    id: 13,
    text: 'Quick coffee meeting about upcoming project. Michael seemed more confident this time and had better prepared materials. Good to see the improvement.',
    person: 'Michael Rodriguez',
    time: 'Dec 5, 2024 9:00 AM',
    location: 'Coffee Shop',
    event: 'Project planning',
    sentiment: 'positive',
    contactIds: [3],
    createdAt: '2024-12-05T09:00:00Z'
  },
  {
    id: 14,
    text: 'Met at the gym and discussed work stress. Michael mentioned he\'s been working on presentation skills and taking public speaking classes. Great initiative.',
    person: 'Michael Rodriguez',
    time: 'Nov 30, 2024 6:00 PM',
    location: 'Fitness Center',
    event: 'Gym workout',
    sentiment: 'positive',
    contactIds: [3],
    createdAt: '2024-11-30T18:00:00Z'
  },
  {
    id: 15,
    text: 'Phone call about team dynamics. Michael expressed concerns about some team members not pulling their weight. Suggested having a team meeting to address issues.',
    person: 'Michael Rodriguez',
    time: 'Nov 22, 2024 3:30 PM',
    location: 'Phone call',
    event: 'Team issues discussion',
    sentiment: 'negative',
    contactIds: [3],
    createdAt: '2024-11-22T15:30:00Z'
  },

  // Emily Watson (Contact 4) - 5 notes
  {
    id: 16,
    text: 'Successful product launch celebration. Team worked hard and delivered on time. Everyone was excited about the positive feedback from early users.',
    person: 'Emily Watson',
    time: 'Dec 8, 2024 6:00 PM',
    location: 'Company HQ',
    event: 'Product launch',
    sentiment: 'positive',
    contactIds: [4],
    createdAt: '2024-12-08T18:00:00Z'
  },
  {
    id: 17,
    text: 'Coffee meeting to discuss next product roadmap. Emily was enthusiastic about new features and shared some innovative ideas. Great strategic thinking.',
    person: 'Emily Watson',
    time: 'Dec 12, 2024 11:00 AM',
    location: 'Office Coffee Bar',
    event: 'Product roadmap discussion',
    sentiment: 'positive',
    contactIds: [4],
    createdAt: '2024-12-12T11:00:00Z'
  },
  {
    id: 18,
    text: 'Quick hallway chat about user feedback. Emily mentioned some interesting insights from user interviews. Offered to help analyze the data.',
    person: 'Emily Watson',
    time: 'Dec 6, 2024 3:00 PM',
    location: 'Office Hallway',
    event: 'User feedback discussion',
    sentiment: 'neutral',
    contactIds: [4],
    createdAt: '2024-12-06T15:00:00Z'
  },
  {
    id: 19,
    text: 'Met at the design workshop. Emily was leading a session on user experience principles. Great presentation skills and deep knowledge of the subject.',
    person: 'Emily Watson',
    time: 'Nov 28, 2024 2:00 PM',
    location: 'Design Studio',
    event: 'UX workshop',
    sentiment: 'positive',
    contactIds: [4],
    createdAt: '2024-11-28T14:00:00Z'
  },
  {
    id: 20,
    text: 'Phone call about team collaboration. Emily mentioned some challenges with cross-functional communication. Suggested implementing regular sync meetings.',
    person: 'Emily Watson',
    time: 'Nov 20, 2024 4:30 PM',
    location: 'Phone call',
    event: 'Team collaboration call',
    sentiment: 'neutral',
    contactIds: [4],
    createdAt: '2024-11-20T16:30:00Z'
  },

  // David Kim (Contact 5) - 5 notes
  {
    id: 21,
    text: 'Quick catch-up call with old colleague. Discussed industry changes and potential job opportunities. Good to reconnect after so long.',
    person: 'David Kim',
    time: 'Dec 5, 2024 3:30 PM',
    location: 'Phone call',
    event: 'Catch-up call',
    sentiment: 'positive',
    contactIds: [5],
    createdAt: '2024-12-05T15:30:00Z'
  },
  {
    id: 22,
    text: 'Met for lunch to discuss potential collaboration. David shared some interesting project ideas and we explored ways to work together. Promising opportunities.',
    person: 'David Kim',
    time: 'Dec 10, 2024 12:30 PM',
    location: 'Korean BBQ Restaurant',
    event: 'Collaboration discussion',
    sentiment: 'positive',
    contactIds: [5],
    createdAt: '2024-12-10T12:30:00Z'
  },
  {
    id: 23,
    text: 'Quick coffee meeting about industry trends. David had some insightful observations about the market and shared valuable contacts. Great networking.',
    person: 'David Kim',
    time: 'Dec 2, 2024 10:00 AM',
    location: 'Local Coffee Shop',
    event: 'Industry trends discussion',
    sentiment: 'positive',
    contactIds: [5],
    createdAt: '2024-12-02T10:00:00Z'
  },
  {
    id: 24,
    text: 'Met at the startup meetup. David was presenting his new venture and looking for feedback. Great pitch and interesting business model.',
    person: 'David Kim',
    time: 'Nov 25, 2024 7:30 PM',
    location: 'Startup Hub',
    event: 'Startup meetup',
    sentiment: 'positive',
    contactIds: [5],
    createdAt: '2024-11-25T19:30:00Z'
  },
  {
    id: 25,
    text: 'Phone call about mentorship. David asked for advice on scaling his business and managing a growing team. Shared some lessons learned from experience.',
    person: 'David Kim',
    time: 'Nov 18, 2024 2:00 PM',
    location: 'Phone call',
    event: 'Mentorship call',
    sentiment: 'positive',
    contactIds: [5],
    createdAt: '2024-11-18T14:00:00Z'
  },

  // Lisa Thompson (Contact 6) - 5 notes
  {
    id: 26,
    text: 'Met at the consulting workshop. Lisa was facilitating a session on strategic planning. Great facilitation skills and deep expertise in the subject.',
    person: 'Lisa Thompson',
    time: 'Dec 3, 2024 1:00 PM',
    location: 'Conference Center',
    event: 'Strategic planning workshop',
    sentiment: 'positive',
    contactIds: [6],
    createdAt: '2024-12-03T13:00:00Z'
  },
  {
    id: 27,
    text: 'Coffee meeting to discuss potential project collaboration. Lisa shared some interesting case studies and we explored partnership opportunities.',
    person: 'Lisa Thompson',
    time: 'Dec 8, 2024 9:00 AM',
    location: 'Office Coffee Bar',
    event: 'Project collaboration discussion',
    sentiment: 'neutral',
    contactIds: [6],
    createdAt: '2024-12-08T09:00:00Z'
  },
  {
    id: 28,
    text: 'Quick hallway conversation about industry insights. Lisa mentioned some interesting trends she\'s observed in her consulting work. Valuable perspective.',
    person: 'Lisa Thompson',
    time: 'Dec 1, 2024 4:00 PM',
    location: 'Office Hallway',
    event: 'Industry insights chat',
    sentiment: 'positive',
    contactIds: [6],
    createdAt: '2024-12-01T16:00:00Z'
  },
  {
    id: 29,
    text: 'Met at the business networking event. Lisa was representing her consulting firm and looking for new clients. Great networking skills.',
    person: 'Lisa Thompson',
    time: 'Nov 27, 2024 6:00 PM',
    location: 'Business Center',
    event: 'Networking event',
    sentiment: 'positive',
    contactIds: [6],
    createdAt: '2024-11-27T18:00:00Z'
  },
  {
    id: 30,
    text: 'Phone call about consulting project. Lisa asked for feedback on a proposal she was working on. Provided some suggestions for improvement.',
    person: 'Lisa Thompson',
    time: 'Nov 20, 2024 3:00 PM',
    location: 'Phone call',
    event: 'Proposal feedback call',
    sentiment: 'neutral',
    contactIds: [6],
    createdAt: '2024-11-20T15:00:00Z'
  },

  // James Wilson (Contact 7) - 5 notes
  {
    id: 31,
    text: 'Met at the business conference. James was presenting on digital transformation strategies. Great presentation and valuable insights for our industry.',
    person: 'James Wilson',
    time: 'Dec 1, 2024 2:00 PM',
    location: 'Business Conference Center',
    event: 'Digital transformation presentation',
    sentiment: 'positive',
    contactIds: [7],
    createdAt: '2024-12-01T14:00:00Z'
  },
  {
    id: 32,
    text: 'Coffee meeting to discuss industry collaboration. James shared some interesting ideas about cross-industry partnerships and innovation.',
    person: 'James Wilson',
    time: 'Dec 6, 2024 10:30 AM',
    location: 'Local Coffee Shop',
    event: 'Industry collaboration discussion',
    sentiment: 'neutral',
    contactIds: [7],
    createdAt: '2024-12-06T10:30:00Z'
  },
  {
    id: 33,
    text: 'Quick lunch meeting about market trends. James had some insightful observations about customer behavior changes and market opportunities.',
    person: 'James Wilson',
    time: 'Dec 2, 2024 12:00 PM',
    location: 'Office Cafeteria',
    event: 'Market trends discussion',
    sentiment: 'positive',
    contactIds: [7],
    createdAt: '2024-12-02T12:00:00Z'
  },
  {
    id: 34,
    text: 'Met at the innovation summit. James was moderating a panel on emerging technologies. Great moderation skills and deep knowledge.',
    person: 'James Wilson',
    time: 'Nov 29, 2024 3:30 PM',
    location: 'Innovation Center',
    event: 'Technology panel discussion',
    sentiment: 'positive',
    contactIds: [7],
    createdAt: '2024-11-29T15:30:00Z'
  },
  {
    id: 35,
    text: 'Phone call about strategic partnership. James mentioned some challenges with their current partnerships and asked for advice. Shared some best practices.',
    person: 'James Wilson',
    time: 'Nov 22, 2024 4:00 PM',
    location: 'Phone call',
    event: 'Partnership strategy call',
    sentiment: 'neutral',
    contactIds: [7],
    createdAt: '2024-11-22T16:00:00Z'
  },

  // Maria Garcia (Contact 8) - 5 notes
  {
    id: 36,
    text: 'Met at the UX research conference. Maria was presenting her findings on user behavior patterns. Fascinating research and great presentation skills.',
    person: 'Maria Garcia',
    time: 'Nov 28, 2024 11:00 AM',
    location: 'UX Research Center',
    event: 'User behavior presentation',
    sentiment: 'positive',
    contactIds: [8],
    createdAt: '2024-11-28T11:00:00Z'
  },
  {
    id: 37,
    text: 'Coffee meeting to discuss research collaboration. Maria shared some interesting methodologies and we explored potential joint research projects.',
    person: 'Maria Garcia',
    time: 'Dec 4, 2024 2:00 PM',
    location: 'University Coffee Shop',
    event: 'Research collaboration discussion',
    sentiment: 'positive',
    contactIds: [8],
    createdAt: '2024-12-04T14:00:00Z'
  },
  {
    id: 38,
    text: 'Quick hallway conversation about user testing. Maria mentioned some interesting findings from recent usability studies. Valuable insights for our product.',
    person: 'Maria Garcia',
    time: 'Nov 30, 2024 3:00 PM',
    location: 'University Hallway',
    event: 'User testing discussion',
    sentiment: 'neutral',
    contactIds: [8],
    createdAt: '2024-11-30T15:00:00Z'
  },
  {
    id: 39,
    text: 'Met at the academic symposium. Maria was chairing a session on human-computer interaction. Great academic leadership and deep expertise.',
    person: 'Maria Garcia',
    time: 'Nov 25, 2024 1:30 PM',
    location: 'Academic Conference Center',
    event: 'HCI symposium',
    sentiment: 'positive',
    contactIds: [8],
    createdAt: '2024-11-25T13:30:00Z'
  },
  {
    id: 40,
    text: 'Phone call about research methodology. Maria asked for feedback on a research proposal she was developing. Provided some suggestions for improvement.',
    person: 'Maria Garcia',
    time: 'Nov 18, 2024 2:30 PM',
    location: 'Phone call',
    event: 'Research proposal feedback',
    sentiment: 'neutral',
    contactIds: [8],
    createdAt: '2024-11-18T14:30:00Z'
  },

  // Robert Taylor (Contact 9) - 5 notes
  {
    id: 41,
    text: 'Met at the sales conference. Robert was presenting on relationship building strategies. Great sales insights and valuable networking tips.',
    person: 'Robert Taylor',
    time: 'Nov 25, 2024 10:00 AM',
    location: 'Sales Conference Center',
    event: 'Relationship building presentation',
    sentiment: 'positive',
    contactIds: [9],
    createdAt: '2024-11-25T10:00:00Z'
  },
  {
    id: 42,
    text: 'Coffee meeting to discuss sales strategies. Robert shared some interesting approaches to customer acquisition and retention. Valuable sales techniques.',
    person: 'Robert Taylor',
    time: 'Dec 2, 2024 3:00 PM',
    location: 'Office Coffee Bar',
    event: 'Sales strategy discussion',
    sentiment: 'positive',
    contactIds: [9],
    createdAt: '2024-12-02T15:00:00Z'
  },
  {
    id: 43,
    text: 'Quick lunch meeting about market expansion. Robert had some insights about entering new markets and building sales teams. Strategic thinking.',
    person: 'Robert Taylor',
    time: 'Nov 28, 2024 12:30 PM',
    location: 'Business Restaurant',
    event: 'Market expansion discussion',
    sentiment: 'neutral',
    contactIds: [9],
    createdAt: '2024-11-28T12:30:00Z'
  },
  {
    id: 44,
    text: 'Met at the business networking event. Robert was representing his company and looking for new business opportunities. Great networking skills.',
    person: 'Robert Taylor',
    time: 'Nov 22, 2024 6:30 PM',
    location: 'Business Center',
    event: 'Business networking',
    sentiment: 'positive',
    contactIds: [9],
    createdAt: '2024-11-22T18:30:00Z'
  },
  {
    id: 45,
    text: 'Phone call about sales training. Robert mentioned some challenges with his sales team and asked for advice on training programs. Shared some resources.',
    person: 'Robert Taylor',
    time: 'Nov 15, 2024 4:30 PM',
    location: 'Phone call',
    event: 'Sales training discussion',
    sentiment: 'neutral',
    contactIds: [9],
    createdAt: '2024-11-15T16:30:00Z'
  },

  // Jennifer Lee (Contact 10) - 5 notes
  {
    id: 46,
    text: 'Met at the content strategy workshop. Jennifer was leading a session on storytelling in marketing. Great presentation and valuable content insights.',
    person: 'Jennifer Lee',
    time: 'Nov 22, 2024 2:00 PM',
    location: 'Marketing Center',
    event: 'Content strategy workshop',
    sentiment: 'positive',
    contactIds: [10],
    createdAt: '2024-11-22T14:00:00Z'
  },
  {
    id: 47,
    text: 'Coffee meeting to discuss content collaboration. Jennifer shared some interesting content ideas and we explored potential partnership opportunities.',
    person: 'Jennifer Lee',
    time: 'Nov 29, 2024 11:00 AM',
    location: 'Local Coffee Shop',
    event: 'Content collaboration discussion',
    sentiment: 'positive',
    contactIds: [10],
    createdAt: '2024-11-29T11:00:00Z'
  },
  {
    id: 48,
    text: 'Quick lunch meeting about marketing trends. Jennifer had some insights about content marketing evolution and audience engagement strategies.',
    person: 'Jennifer Lee',
    time: 'Nov 26, 2024 1:00 PM',
    location: 'Office Cafeteria',
    event: 'Marketing trends discussion',
    sentiment: 'neutral',
    contactIds: [10],
    createdAt: '2024-11-26T13:00:00Z'
  },
  {
    id: 49,
    text: 'Met at the digital marketing summit. Jennifer was presenting on social media strategies. Great digital marketing expertise and practical tips.',
    person: 'Jennifer Lee',
    time: 'Nov 20, 2024 3:00 PM',
    location: 'Digital Marketing Center',
    event: 'Social media presentation',
    sentiment: 'positive',
    contactIds: [10],
    createdAt: '2024-11-20T15:00:00Z'
  },
  {
    id: 50,
    text: 'Phone call about content strategy. Jennifer asked for feedback on a content calendar she was developing. Provided some suggestions for improvement.',
    person: 'Jennifer Lee',
    time: 'Nov 15, 2024 2:00 PM',
    location: 'Phone call',
    event: 'Content calendar feedback',
    sentiment: 'neutral',
    contactIds: [10],
    createdAt: '2024-11-15T14:00:00Z'
  },

  // Christopher Brown (Contact 11) - 5 notes
  {
    id: 51,
    text: 'Met at the operations conference. Christopher was presenting on process optimization strategies. Great operational insights and practical implementation tips.',
    person: 'Christopher Brown',
    time: 'Nov 20, 2024 9:00 AM',
    location: 'Operations Conference Center',
    event: 'Process optimization presentation',
    sentiment: 'positive',
    contactIds: [11],
    createdAt: '2024-11-20T09:00:00Z'
  },
  {
    id: 52,
    text: 'Coffee meeting to discuss operational efficiency. Christopher shared some interesting approaches to streamlining business processes. Valuable insights.',
    person: 'Christopher Brown',
    time: 'Nov 27, 2024 2:30 PM',
    location: 'Office Coffee Bar',
    event: 'Operational efficiency discussion',
    sentiment: 'positive',
    contactIds: [11],
    createdAt: '2024-11-27T14:30:00Z'
  },
  {
    id: 53,
    text: 'Quick lunch meeting about team management. Christopher had some insights about building high-performing teams and managing remote workforces.',
    person: 'Christopher Brown',
    time: 'Nov 24, 2024 12:00 PM',
    location: 'Business Restaurant',
    event: 'Team management discussion',
    sentiment: 'neutral',
    contactIds: [11],
    createdAt: '2024-11-24T12:00:00Z'
  },
  {
    id: 54,
    text: 'Met at the business process workshop. Christopher was facilitating a session on lean methodology. Great facilitation skills and deep expertise.',
    person: 'Christopher Brown',
    time: 'Nov 18, 2024 1:00 PM',
    location: 'Business Process Center',
    event: 'Lean methodology workshop',
    sentiment: 'positive',
    contactIds: [11],
    createdAt: '2024-11-18T13:00:00Z'
  },
  {
    id: 55,
    text: 'Phone call about process improvement. Christopher mentioned some challenges with their current processes and asked for advice. Shared some best practices.',
    person: 'Christopher Brown',
    time: 'Nov 12, 2024 3:30 PM',
    location: 'Phone call',
    event: 'Process improvement call',
    sentiment: 'neutral',
    contactIds: [11],
    createdAt: '2024-11-12T15:30:00Z'
  },

  // Amanda Davis (Contact 12) - 5 notes
  {
    id: 56,
    text: 'Met at the business analysis conference. Amanda was presenting on data-driven decision making. Great analytical insights and practical applications.',
    person: 'Amanda Davis',
    time: 'Nov 18, 2024 11:00 AM',
    location: 'Business Analysis Center',
    event: 'Data-driven decision making presentation',
    sentiment: 'positive',
    contactIds: [12],
    createdAt: '2024-11-18T11:00:00Z'
  },
  {
    id: 57,
    text: 'Coffee meeting to discuss analytics collaboration. Amanda shared some interesting data analysis techniques and we explored potential joint projects.',
    person: 'Amanda Davis',
    time: 'Nov 25, 2024 10:00 AM',
    location: 'Local Coffee Shop',
    event: 'Analytics collaboration discussion',
    sentiment: 'positive',
    contactIds: [12],
    createdAt: '2024-11-25T10:00:00Z'
  },
  {
    id: 58,
    text: 'Quick lunch meeting about business intelligence. Amanda had some insights about implementing BI tools and building data dashboards.',
    person: 'Amanda Davis',
    time: 'Nov 22, 2024 12:30 PM',
    location: 'Office Cafeteria',
    event: 'Business intelligence discussion',
    sentiment: 'neutral',
    contactIds: [12],
    createdAt: '2024-11-22T12:30:00Z'
  },
  {
    id: 59,
    text: 'Met at the data analytics workshop. Amanda was leading a session on predictive modeling. Great analytical skills and practical knowledge.',
    person: 'Amanda Davis',
    time: 'Nov 16, 2024 2:00 PM',
    location: 'Data Analytics Center',
    event: 'Predictive modeling workshop',
    sentiment: 'positive',
    contactIds: [12],
    createdAt: '2024-11-16T14:00:00Z'
  },
  {
    id: 60,
    text: 'Phone call about data strategy. Amanda asked for feedback on a data governance framework she was developing. Provided some suggestions for improvement.',
    person: 'Amanda Davis',
    time: 'Nov 10, 2024 4:00 PM',
    location: 'Phone call',
    event: 'Data governance feedback',
    sentiment: 'neutral',
    contactIds: [12],
    createdAt: '2024-11-10T16:00:00Z'
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
    noteIds: [1, 2, 3, 4, 5]
  },
  {
    id: 2,
    name: 'Sarah Chen',
    // Removed occupationId and organizationId to test missing data
    birthDate: '1988-09-22',
    lastInteraction: 1734048000000, // Dec 12, 2024 timestamp
    subjectIds: [4, 7, 10, 13, 14, 19, 21, 24, 26, 30],
    relationshipIds: [2, 4],
    noteIds: [6, 7, 8, 9, 10]
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
    noteIds: [11, 12, 13, 14, 15]
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
    noteIds: [16, 17, 18, 19, 20]
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
    noteIds: [21, 22, 23, 24, 25]
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
    noteIds: [26, 27, 28, 29, 30]
  },
  {
    id: 7,
    name: 'James Wilson',
    // Removed all optional fields to test complete missing data
    lastInteraction: 1733006400000, // Dec 1, 2024 timestamp
    subjectIds: [2, 5, 9, 12, 16, 20, 23, 25, 27, 29],
    relationshipIds: [2, 7],
    noteIds: [31, 32, 33, 34, 35]
  },
  {
    id: 8,
    name: 'Maria Garcia',
    occupationId: 8,
    // Removed organizationId and birthDate
    lastInteraction: 1732752000000, // Nov 28, 2024 timestamp
    subjectIds: [1, 3, 6, 10, 13, 17, 21, 24, 26, 30],
    relationshipIds: [1, 3],
    noteIds: [36, 37, 38, 39, 40]
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
    noteIds: [41, 42, 43, 44, 45]
  },
  {
    id: 10,
    name: 'Jennifer Lee',
    // Removed occupationId and birthDate
    organizationId: 10,
    lastInteraction: 1732406400000, // Nov 22, 2024 timestamp
    subjectIds: [3, 8, 10, 13, 16, 20, 23, 25, 27, 29],
    relationshipIds: [1, 6],
    noteIds: [46, 47, 48, 49, 50]
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
    noteIds: [51, 52, 53, 54, 55]
  },
  {
    id: 12,
    name: 'Amanda Davis',
    // Removed all optional fields to test complete missing data
    lastInteraction: 1732060800000, // Nov 18, 2024 timestamp
    subjectIds: [1, 4, 7, 11, 14, 18, 19, 22, 28, 12],
    relationshipIds: [1, 2],
    noteIds: [56, 57, 58, 59, 60]
  }
];

export function getSampleData() {
  return {
    contacts: sampleContacts,
    subjects: sampleSubjects,
    organizations: sampleOrganizations,
    occupations: sampleOccupations,
    relationships: sampleRelationships,
    sentiments: sampleSentiments,
    notes: sampleNotes
  };
}
