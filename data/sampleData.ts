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
  { id: 1, label: 'excited', category: 'positive' },
  { id: 2, label: 'happy', category: 'positive' },
  { id: 3, label: 'enthusiastic', category: 'positive' },
  { id: 4, label: 'satisfied', category: 'positive' },
  { id: 5, label: 'optimistic', category: 'positive' },
  { id: 6, label: 'neutral', category: 'neutral' },
  { id: 7, label: 'calm', category: 'neutral' },
  { id: 8, label: 'focused', category: 'neutral' },
  { id: 9, label: 'concerned', category: 'negative' },
  { id: 10, label: 'frustrated', category: 'negative' },
  { id: 11, label: 'worried', category: 'negative' },
  { id: 12, label: 'disappointed', category: 'negative' }
];

export const sampleNotes: Note[] = [
  // Alex Johnson (Contact 1) - 5 notes
  {
    id: 1,
    text: 'Had an amazing coffee meeting with Alex at the new downtown café. We discussed potential collaboration opportunities and shared insights about current market trends. The conversation was incredibly productive and we agreed to follow up next week with a concrete proposal.',
    time: 'Dec 15, 2024 2:00 PM',
    sentimentIds: [1, 3], // excited, enthusiastic
    contactIds: [1]
  },
  {
    id: 2,
    text: 'Met Alex at the tech conference and had an engaging discussion about AI trends. Alex shared fascinating insights about machine learning applications in their current project. This was a great networking opportunity that could lead to future collaborations.',
    time: 'Dec 10, 2024 4:30 PM',
    sentimentIds: [1], // excited
    contactIds: [1]
  },
  {
    id: 3,
    text: 'Quick lunch meeting to discuss potential partnership opportunities. Alex mentioned they\'re actively looking for developers with React experience for their upcoming project. I promised to connect them with our development team.',
    time: 'Dec 5, 2024 12:00 PM',
    sentimentIds: [6], // neutral
    contactIds: [1]
  },
  {
    id: 4,
    text: 'Phone call about project timeline concerns. Alex expressed some worries about meeting the aggressive deadline for their product launch. I offered to help review their code architecture and provide optimization suggestions.',
    time: 'Nov 28, 2024 3:00 PM',
    sentimentIds: [9, 6], // concerned, neutral
    contactIds: [1]
  },
  {
    id: 5,
    text: 'Ran into Alex at the gym and had a candid conversation about work-life balance. Alex mentioned they\'ve been working long hours recently and feeling the stress. I suggested some time management techniques that have worked for me.',
    time: 'Nov 20, 2024 6:00 PM',
    sentimentIds: [9, 7], // concerned, calm
    contactIds: [1]
  },

  // Sarah Chen (Contact 2) - 5 notes
  {
    id: 6,
    text: 'Team lunch meeting focused on Q1 strategy planning. Sarah led an excellent discussion about upcoming projects and resource allocation. However, some concerns were raised about the feasibility of our ambitious timeline.',
    time: 'Dec 12, 2024 12:00 PM',
    sentimentIds: [9, 8], // concerned, focused
    contactIds: [2]
  },
  {
    id: 7,
    text: 'Had an inspiring coffee chat about Sarah\'s career development goals. She shared her strong interest in transitioning into product management and asked for advice. We discussed potential opportunities and skills she should develop.',
    time: 'Dec 8, 2024 10:00 AM',
    sentimentIds: [1, 5], // excited, optimistic
    contactIds: [2]
  },
  {
    id: 8,
    text: 'Quick hallway conversation about the new design system implementation. Sarah provided valuable feedback about the color palette and suggested important improvements for accessibility compliance. Her attention to detail is impressive.',
    time: 'Dec 3, 2024 2:30 PM',
    sentimentIds: [8, 4], // focused, satisfied
    contactIds: [2]
  },
  {
    id: 9,
    text: 'Attended the contemporary art gallery opening together. Sarah was genuinely excited about the new exhibition and we had a wonderful discussion about modern artistic trends. It was a great cultural experience that deepened our friendship.',
    time: 'Nov 25, 2024 7:00 PM',
    sentimentIds: [1, 2], // excited, happy
    contactIds: [2]
  },
  {
    id: 10,
    text: 'Phone call regarding cross-team project collaboration challenges. Sarah mentioned some communication issues between departments that are affecting project timelines. I offered to help facilitate a meeting between the teams.',
    time: 'Nov 18, 2024 4:00 PM',
    sentimentIds: [6, 9], // neutral, concerned
    contactIds: [2]
  },

  // Michael Rodriguez (Contact 3) - 5 notes
  {
    id: 11,
    text: 'The client presentation went poorly due to unexpected technical difficulties and some unprepared responses to their questions. This created a negative impression that we\'ll need to work hard to overcome in future meetings.',
    time: 'Dec 10, 2024 10:00 AM',
    sentimentIds: [10, 11, 12], // frustrated, worried, disappointed
    contactIds: [3]
  },
  {
    id: 12,
    text: 'Met Michael for lunch to debrief after the failed presentation. He was clearly frustrated and disappointed with how things went. We spent time analyzing what went wrong and developing a comprehensive plan for improvement.',
    time: 'Dec 11, 2024 1:00 PM',
    sentimentIds: [12, 10], // disappointed, frustrated
    contactIds: [3]
  },
  {
    id: 13,
    text: 'Coffee meeting about the upcoming project launch. Michael seemed much more confident this time and had significantly better prepared materials. It\'s encouraging to see the marked improvement in his preparation and presentation skills.',
    time: 'Dec 5, 2024 9:00 AM',
    sentimentIds: [5, 4], // optimistic, satisfied
    contactIds: [3]
  },
  {
    id: 14,
    text: 'Bumped into Michael at the gym and discussed work-related stress management. He mentioned he\'s been proactively working on his presentation skills and even enrolled in public speaking classes. Great personal development initiative.',
    time: 'Nov 30, 2024 6:00 PM',
    sentimentIds: [5, 2], // optimistic, happy
    contactIds: [3]
  },
  {
    id: 15,
    text: 'Phone call about team dynamics and productivity issues. Michael expressed concerns about some team members not contributing their fair share to project deliverables. I suggested organizing a team meeting to address these issues directly.',
    time: 'Nov 22, 2024 3:30 PM',
    sentimentIds: [11, 9], // worried, concerned
    contactIds: [3]
  },

  // Emily Watson (Contact 4) - 5 notes
  {
    id: 16,
    text: 'Celebrated our successful product launch with the entire team! Everyone worked incredibly hard and we delivered everything on time. The early user feedback has been overwhelmingly positive, which makes all the effort worthwhile.',
    time: 'Dec 8, 2024 6:00 PM',
    sentimentIds: [1, 2, 4], // excited, happy, satisfied
    contactIds: [4]
  },
  {
    id: 17,
    text: 'Coffee meeting to discuss the next product roadmap and upcoming features. Emily was incredibly enthusiastic about her innovative ideas for user experience improvements. Her strategic thinking and creative vision continue to impress me.',
    time: 'Dec 12, 2024 11:00 AM',
    sentimentIds: [3, 1], // enthusiastic, excited
    contactIds: [4]
  },
  {
    id: 18,
    text: 'Quick hallway conversation about recent user feedback analysis. Emily shared some fascinating insights from the latest user interviews and usability testing sessions. I offered to help analyze the quantitative data to complement her qualitative findings.',
    time: 'Dec 6, 2024 3:00 PM',
    sentimentIds: [8, 6], // focused, neutral
    contactIds: [4]
  },
  {
    id: 19,
    text: 'Attended Emily\'s workshop on user experience design principles. She delivered an outstanding presentation with deep knowledge of the subject matter. Her ability to explain complex UX concepts clearly is truly remarkable.',
    time: 'Nov 28, 2024 2:00 PM',
    sentimentIds: [4, 3], // satisfied, enthusiastic
    contactIds: [4]
  },
  {
    id: 20,
    text: 'Phone call about improving cross-functional team collaboration. Emily mentioned some challenges with communication between different departments that are impacting project efficiency. I suggested implementing regular synchronization meetings.',
    time: 'Nov 20, 2024 4:30 PM',
    sentimentIds: [9, 8], // concerned, focused
    contactIds: [4]
  },

  // David Kim (Contact 5) - 5 notes
  {
    id: 21,
    text: 'Had a great catch-up call with my former colleague David. We discussed significant industry changes and explored potential job opportunities in the market. It was wonderful to reconnect after such a long time.',
    time: 'Dec 5, 2024 3:30 PM',
    sentimentIds: [2, 6], // happy, neutral
    contactIds: [5]
  },
  {
    id: 22,
    text: 'Met David for lunch to discuss exciting collaboration possibilities. He shared several interesting project ideas and we thoroughly explored various ways we could work together professionally. The opportunities look very promising.',
    time: 'Dec 10, 2024 12:30 PM',
    sentimentIds: [5, 3], // optimistic, enthusiastic
    contactIds: [5]
  },
  {
    id: 23,
    text: 'Coffee meeting focused on current industry trends and market analysis. David shared some particularly insightful observations about market dynamics and provided valuable professional contacts. Excellent networking opportunity.',
    time: 'Dec 2, 2024 10:00 AM',
    sentimentIds: [3, 4], // enthusiastic, satisfied
    contactIds: [5]
  },
  {
    id: 24,
    text: 'Attended the startup meetup where David was presenting his innovative new venture. He delivered an impressive pitch with a compelling business model that generated significant interest from potential investors.',
    time: 'Nov 25, 2024 7:30 PM',
    sentimentIds: [1, 3], // excited, enthusiastic
    contactIds: [5]
  },
  {
    id: 25,
    text: 'Phone call about mentorship and business scaling advice. David asked for guidance on managing his rapidly growing team and scaling business operations effectively. I shared lessons learned from my own entrepreneurial experience.',
    time: 'Nov 18, 2024 2:00 PM',
    sentimentIds: [4, 7], // satisfied, calm
    contactIds: [5]
  },

  // Lisa Thompson (Contact 6) - 5 notes
  {
    id: 26,
    text: 'Attended Lisa\'s strategic planning workshop at the conference center. She demonstrated excellent facilitation skills and shared deep expertise in organizational strategy. The session provided valuable insights for our business planning.',
    time: 'Dec 3, 2024 1:00 PM',
    sentimentIds: [4, 8], // satisfied, focused
    contactIds: [6]
  },
  {
    id: 27,
    text: 'Coffee meeting to explore potential project collaboration opportunities. Lisa shared fascinating case studies from her consulting work and we discussed various partnership possibilities that could benefit both our organizations.',
    time: 'Dec 8, 2024 9:00 AM',
    sentimentIds: [6, 5], // neutral, optimistic
    contactIds: [6]
  },
  {
    id: 28,
    text: 'Brief hallway conversation about valuable industry insights. Lisa mentioned some interesting trends she\'s observed through her extensive consulting work with various clients. Her perspective is always enlightening and well-informed.',
    time: 'Dec 1, 2024 4:00 PM',
    sentimentIds: [3, 8], // enthusiastic, focused
    contactIds: [6]
  },
  {
    id: 29,
    text: 'Met Lisa at the business networking event downtown. She was effectively representing her consulting firm and actively seeking new client relationships. Her professional networking skills and business acumen are truly impressive.',
    time: 'Nov 27, 2024 6:00 PM',
    sentimentIds: [2, 4], // happy, satisfied
    contactIds: [6]
  },
  {
    id: 30,
    text: 'Phone call to provide feedback on Lisa\'s consulting proposal. She asked for my professional opinion on a comprehensive proposal she was developing for a major client. I provided detailed suggestions for improvement and refinement.',
    time: 'Nov 20, 2024 3:00 PM',
    sentimentIds: [6, 8], // neutral, focused
    contactIds: [6]
  },

  // James Wilson (Contact 7) - 5 notes
  {
    id: 31,
    text: 'Attended James\'s presentation on digital transformation strategies at the business conference. He delivered valuable insights that are highly relevant to our industry\'s current challenges and future opportunities.',
    time: 'Dec 1, 2024 2:00 PM',
    sentimentIds: [4, 8], // satisfied, focused
    contactIds: [7]
  },
  {
    id: 32,
    text: 'Coffee meeting to discuss potential cross-industry collaboration initiatives. James shared innovative ideas about partnerships between different sectors and how they can drive innovation and mutual growth.',
    time: 'Dec 6, 2024 10:30 AM',
    sentimentIds: [6, 3], // neutral, enthusiastic
    contactIds: [7]
  },
  {
    id: 33,
    text: 'Lunch meeting focused on current market trends and consumer behavior analysis. James provided insightful observations about changing customer preferences and emerging market opportunities that could impact our business strategy.',
    time: 'Dec 2, 2024 12:00 PM',
    sentimentIds: [8, 5], // focused, optimistic
    contactIds: [7]
  },
  {
    id: 34,
    text: 'Attended the innovation summit where James moderated a panel on emerging technologies. His excellent moderation skills and comprehensive knowledge of technological trends made for an engaging and informative session.',
    time: 'Nov 29, 2024 3:30 PM',
    sentimentIds: [4, 3], // satisfied, enthusiastic
    contactIds: [7]
  },
  {
    id: 35,
    text: 'Phone call about strategic partnership challenges and opportunities. James mentioned some difficulties with their current partnerships and asked for advice based on my experience. I shared best practices for partnership management.',
    time: 'Nov 22, 2024 4:00 PM',
    sentimentIds: [6, 9], // neutral, concerned
    contactIds: [7]
  },

  // Maria Garcia (Contact 8) - 5 notes
  {
    id: 36,
    text: 'Attended Maria\'s presentation at the UX research conference about user behavior patterns. Her research findings were absolutely fascinating and her presentation skills were exceptional. Valuable insights for our product development.',
    time: 'Nov 28, 2024 11:00 AM',
    sentimentIds: [1, 4], // excited, satisfied
    contactIds: [8]
  },
  {
    id: 37,
    text: 'Coffee meeting to explore research collaboration opportunities. Maria shared interesting methodologies from her academic work and we discussed potential joint research projects that could benefit both our organizations.',
    time: 'Dec 4, 2024 2:00 PM',
    sentimentIds: [3, 5], // enthusiastic, optimistic
    contactIds: [8]
  },
  {
    id: 38,
    text: 'Quick hallway conversation about recent user testing results. Maria mentioned some particularly interesting findings from her latest usability studies that could provide valuable insights for our product development roadmap.',
    time: 'Nov 30, 2024 3:00 PM',
    sentimentIds: [6, 8], // neutral, focused
    contactIds: [8]
  },
  {
    id: 39,
    text: 'Attended the academic symposium where Maria chaired a session on human-computer interaction. Her academic leadership and deep expertise in the field were clearly demonstrated through her excellent session management.',
    time: 'Nov 25, 2024 1:30 PM',
    sentimentIds: [4, 3], // satisfied, enthusiastic
    contactIds: [8]
  },
  {
    id: 40,
    text: 'Phone call to provide feedback on Maria\'s research proposal. She asked for my input on a comprehensive research proposal she was developing for a major grant application. I provided constructive suggestions for improvement.',
    time: 'Nov 18, 2024 2:30 PM',
    sentimentIds: [6, 8], // neutral, focused
    contactIds: [8]
  },

  // Robert Taylor (Contact 9) - 5 notes
  {
    id: 41,
    text: 'Attended Robert\'s presentation at the sales conference on relationship building strategies. He shared excellent sales insights and valuable networking techniques that could be applied across various business contexts.',
    time: 'Nov 25, 2024 10:00 AM',
    sentimentIds: [4, 3], // satisfied, enthusiastic
    contactIds: [9]
  },
  {
    id: 42,
    text: 'Coffee meeting to discuss effective sales strategies and techniques. Robert shared interesting approaches to customer acquisition and retention that have proven successful in his experience. Very valuable professional insights.',
    time: 'Dec 2, 2024 3:00 PM',
    sentimentIds: [3, 8], // enthusiastic, focused
    contactIds: [9]
  },
  {
    id: 43,
    text: 'Lunch meeting about market expansion opportunities and challenges. Robert provided insights about entering new markets and building effective sales teams in different regions. His strategic thinking is impressive.',
    time: 'Nov 28, 2024 12:30 PM',
    sentimentIds: [6, 5], // neutral, optimistic
    contactIds: [9]
  },
  {
    id: 44,
    text: 'Met Robert at the business networking event where he was representing his company. He was actively seeking new business opportunities and demonstrated excellent networking skills throughout the evening.',
    time: 'Nov 22, 2024 6:30 PM',
    sentimentIds: [2, 4], // happy, satisfied
    contactIds: [9]
  },
  {
    id: 45,
    text: 'Phone call about sales training and team development challenges. Robert mentioned some difficulties with his sales team\'s performance and asked for advice on training programs. I shared relevant resources and recommendations.',
    time: 'Nov 15, 2024 4:30 PM',
    sentimentIds: [6, 9], // neutral, concerned
    contactIds: [9]
  },

  // Jennifer Lee (Contact 10) - 5 notes
  {
    id: 46,
    text: 'Attended Jennifer\'s content strategy workshop on storytelling in marketing. She delivered an outstanding presentation with valuable insights about content creation and audience engagement. Excellent professional development opportunity.',
    time: 'Nov 22, 2024 2:00 PM',
    sentimentIds: [4, 3], // satisfied, enthusiastic
    contactIds: [10]
  },
  {
    id: 47,
    text: 'Coffee meeting to discuss potential content collaboration projects. Jennifer shared creative content ideas and we explored various partnership opportunities that could enhance both our marketing efforts significantly.',
    time: 'Nov 29, 2024 11:00 AM',
    sentimentIds: [3, 5], // enthusiastic, optimistic
    contactIds: [10]
  },
  {
    id: 48,
    text: 'Lunch meeting about current marketing trends and industry evolution. Jennifer provided insights about content marketing\'s changing landscape and shared effective audience engagement strategies from her recent campaigns.',
    time: 'Nov 26, 2024 1:00 PM',
    sentimentIds: [6, 8], // neutral, focused
    contactIds: [10]
  },
  {
    id: 49,
    text: 'Attended the digital marketing summit where Jennifer presented on social media strategies. She demonstrated excellent digital marketing expertise and provided practical tips that attendees could implement immediately.',
    time: 'Nov 20, 2024 3:00 PM',
    sentimentIds: [4, 1], // satisfied, excited
    contactIds: [10]
  },
  {
    id: 50,
    text: 'Phone call to provide feedback on Jennifer\'s content calendar proposal. She asked for my professional opinion on a comprehensive content calendar she was developing for a major client campaign. I provided detailed suggestions.',
    time: 'Nov 15, 2024 2:00 PM',
    sentimentIds: [6, 8], // neutral, focused
    contactIds: [10]
  },

  // Christopher Brown (Contact 11) - 5 notes
  {
    id: 51,
    text: 'Attended Christopher\'s presentation at the operations conference on process optimization strategies. He shared excellent operational insights and provided practical implementation tips that could significantly improve our efficiency.',
    time: 'Nov 20, 2024 9:00 AM',
    sentimentIds: [4, 3], // satisfied, enthusiastic
    contactIds: [11]
  },
  {
    id: 52,
    text: 'Coffee meeting to discuss operational efficiency improvements and best practices. Christopher shared innovative approaches to streamlining business processes that have proven effective in his organization. Very valuable insights.',
    time: 'Nov 27, 2024 2:30 PM',
    sentimentIds: [3, 8], // enthusiastic, focused
    contactIds: [11]
  },
  {
    id: 53,
    text: 'Lunch meeting about team management and leadership strategies. Christopher provided insights about building high-performing teams and effectively managing remote workforces in today\'s business environment.',
    time: 'Nov 24, 2024 12:00 PM',
    sentimentIds: [6, 5], // neutral, optimistic
    contactIds: [11]
  },
  {
    id: 54,
    text: 'Attended the business process workshop where Christopher facilitated a session on lean methodology implementation. His facilitation skills and deep expertise in process improvement were clearly demonstrated.',
    time: 'Nov 18, 2024 1:00 PM',
    sentimentIds: [4, 8], // satisfied, focused
    contactIds: [11]
  },
  {
    id: 55,
    text: 'Phone call about process improvement challenges and solutions. Christopher mentioned some difficulties with their current business processes and asked for advice based on my experience. I shared relevant best practices.',
    time: 'Nov 12, 2024 3:30 PM',
    sentimentIds: [6, 9], // neutral, concerned
    contactIds: [11]
  },

  // Amanda Davis (Contact 12) - 5 notes
  {
    id: 56,
    text: 'Attended Amanda\'s presentation at the business analysis conference on data-driven decision making. She shared excellent analytical insights and practical applications that could significantly improve our business intelligence.',
    time: 'Nov 18, 2024 11:00 AM',
    sentimentIds: [4, 3], // satisfied, enthusiastic
    contactIds: [12]
  },
  {
    id: 57,
    text: 'Coffee meeting to discuss analytics collaboration and data science opportunities. Amanda shared interesting data analysis techniques and we explored potential joint projects that could enhance our analytical capabilities.',
    time: 'Nov 25, 2024 10:00 AM',
    sentimentIds: [3, 5], // enthusiastic, optimistic
    contactIds: [12]
  },
  {
    id: 58,
    text: 'Lunch meeting about business intelligence implementation and dashboard development. Amanda provided insights about implementing BI tools effectively and shared best practices for building comprehensive data dashboards.',
    time: 'Nov 22, 2024 12:30 PM',
    sentimentIds: [6, 8], // neutral, focused
    contactIds: [12]
  },
  {
    id: 59,
    text: 'Attended the data analytics workshop where Amanda led a session on predictive modeling techniques. Her analytical skills and practical knowledge of advanced modeling techniques were truly impressive.',
    time: 'Nov 16, 2024 2:00 PM',
    sentimentIds: [4, 1], // satisfied, excited
    contactIds: [12]
  },
  {
    id: 60,
    text: 'Phone call to provide feedback on Amanda\'s data governance framework proposal. She asked for my input on a comprehensive framework she was developing for organizational data management. I provided constructive suggestions.',
    time: 'Nov 10, 2024 4:00 PM',
    sentimentIds: [6, 8], // neutral, focused
    contactIds: [12]
  }
];

export const sampleContacts: Contact[] = [
  {
    id: 1,
    name: 'Alex Johnson',
    occupationId: 1,
    organizationId: 1,
    birthDate: { year: 1990, month: 5, day: 15 },
    lastInteraction: 1734307200000, // Dec 15, 2024 timestamp
    subjectIds: [1, 2, 3, 6, 9, 13, 15, 22, 27, 29, 32],
    relationshipIds: [1, 5],
    noteIds: [1, 2, 3, 4, 5]
  },
  {
    id: 2,
    name: 'Sarah Chen',
    // Removed occupationId and organizationId to test missing data
    birthDate: { year: 1988, month: 9, day: 22 },
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
    birthDate: { year: 1992, month: 3, day: 10 },
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
    birthDate: { year: 1991, month: 7, day: 18 },
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
    birthDate: { year: 1987, month: 12, day: 3 },
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
    birthDate: { year: 1985, month: 1, day: 30 },
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
    birthDate: { year: 1988, month: 12, day: 14 },
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

// Create a mutable copy of sample data that can be updated
let mutableSampleData = {
  contacts: [...sampleContacts],
  subjects: [...sampleSubjects],
  organizations: [...sampleOrganizations],
  occupations: [...sampleOccupations],
  relationships: [...sampleRelationships],
  sentiments: [...sampleSentiments],
  notes: [...sampleNotes]
};

export function getMutableSampleData() {
  return mutableSampleData;
}

export function updateMutableSampleData(newData: any) {
  Object.assign(mutableSampleData, newData);
  return mutableSampleData;
}

export function resetMutableSampleData() {
  mutableSampleData = {
    contacts: [...sampleContacts],
    subjects: [...sampleSubjects],
    organizations: [...sampleOrganizations],
    occupations: [...sampleOccupations],
    relationships: [...sampleRelationships],
    sentiments: [...sampleSentiments],
    notes: [...sampleNotes]
  };
  return mutableSampleData;
}
