# Circle - Personal Social Manager

Circle is a personal social manager app that helps users remember meaningful details about contacts and make informed social decisions based on those memories.

## Features

### Core Features
- **Contacts & Profiles**: Store basic info, track relationships, and categorize contacts
- **Interaction Logging**: Record meaningful conversation points with metadata
- **Memory-Powered Q&A**: Ask natural language questions about contacts
- **Decision & Planning Advice**: AI-assisted advice for social decisions
- **Social Graph**: Capture relationships between contacts
- **AI Input Extraction**: Convert various inputs into structured profile entries

### Current Implementation
- **Note Page**: Main interface showing contact previews with tags
- **Contact Cards**: Horizontal scrollable list of contact information
- **Input Section**: Voice and file upload functionality
- **Navigation**: Four main sections (Note, Memo, Contacts, User)

## Tech Stack

- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **Fonts**: Inter (UI) and Merriweather (headings)

## Design System

### Colors
- **Neutral**: #FBF7F3 (Background)
- **Neutral Variant**: #F0EDE7 (Cards, Buttons)
- **Primary**: #262B35 (Text, Borders)
- **Secondary**: #E76835 (Tags, Accents)
- **White**: #FFFFFF (Input Background)

### Typography
- **Display Small**: 36px/44px (Merriweather)
- **Headline Extra Small**: 16px/28px (Merriweather)
- **Title Medium**: 16px/24px (Inter)
- **Body Medium**: 14px/20px (Inter)
- **Label Large**: 14px/20px (Inter)
- **Label Small**: 11px/16px (Inter)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build
```bash
npm run build
npm start
```

## Project Structure

```
circle/
├── app/
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main Note page
├── components/
│   ├── ContactCardSimple.tsx # Individual contact display
│   ├── ContactPreview.tsx   # Horizontal scrollable contact list
│   ├── Header.tsx           # App header with logo and Ask Circle button
│   ├── InputSection.tsx     # Voice and file upload controls
│   └── NavigationBar.tsx    # Bottom navigation bar
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind configuration with custom theme
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## Component Architecture

- **ContactCardSimple**: Displays individual contact with name, occupation, last interaction, and tags
- **ContactPreview**: Container for horizontal scrolling contact cards
- **Header**: App branding and Ask Circle functionality
- **InputSection**: Voice recording and file upload interface
- **NavigationBar**: Bottom navigation with four main sections

## Future Enhancements

- Backend API integration
- Database setup (PostgreSQL + vector search)
- AI integration for Q&A and advice
- User authentication
- Contact management pages
- Interaction logging interface
- Social graph visualization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
