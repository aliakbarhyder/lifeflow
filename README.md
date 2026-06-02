# LifeFlow AI - Browser Extension

<div align="center">
  <img src="public/icon.svg" width="80" height="80" alt="LifeFlow AI Logo" />
  <h1>LifeFlow AI</h1>
  <p>AI-powered productivity and learning platform</p>
</div>

---

## 🌟 Features

### Smart Focus Shield
- Block distracting websites during focus sessions
- Preset sites: YouTube, TikTok, Instagram, Reddit, X, Twitch, Discord
- Track blocked attempts and build streaks
- Focus timer with customizable durations

### AI Page Intelligence
- Summarize any webpage
- Create notes and highlights from content
- AI-powered explanations and insights

### Universal Notes
- Create notes, quotes, highlights, and tasks
- Tag and search through your knowledge
- Full-text search functionality

### Task Manager
- Create tasks with priorities and due dates
- Subtasks support
- Track completion and progress

### Learning Mode
- Create and study flashcards
- Take quizzes to test your knowledge
- Generate flashcards from notes

### AI Reflection System
- End-of-session reflections
- Productivity insights and suggestions
- Weekly summaries

### Growth Dashboard
- Focus Score, Productivity Score, Learning Score, Consistency Score
- Combined LifeFlow Score with animated progress rings
- Analytics and trend tracking

### Achievement System
- Earn XP and level up
- Unlock badges (Focus Warrior, Learning Legend, etc.)
- Track your progress

---

## 🎨 Design

- **Dark mode first** with premium glassmorphism
- **Colors**: Black, Crimson Red (#DC143C), White, Purple glow accents
- **Typography**: Inter font family
- **Animations**: Smooth Framer Motion animations
- **ALI AI Avatar**: Custom AI assistant with animated avatar displayed throughout the extension

---

## 🛠️ Tech Stack

- **Manifest V3** - Chrome Extension API
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **TailwindCSS** - Styling
- **Vite** - Build Tool
- **Framer Motion** - Animations
- **IndexedDB** - Local Storage (via idb library)

---

## 📁 Project Structure

```
lifeflow/
├── dist/                    # Built extension files
│   ├── manifest.json         # Chrome extension manifest
│   ├── popup.html            # Extension popup
│   ├── dashboard.html        # Main dashboard page
│   ├── sidepanel.html         # Side panel page
│   ├── index.html             # Main landing page
│   ├── blocked.html           # Blocked site page
│   ├── icon.svg              # Extension icon
│   └── assets/               # Bundled JS/CSS
│
├── public/                   # Public assets
│   ├── icon.svg             # Extension icon
│   └── manifest.json         # Manifest source
│
├── src/
│   ├── components/           # Reusable React components
│   │   ├── AliAvatar.tsx    # ALI AI avatar component
│   │   ├── Button.tsx        # Button components
│   │   ├── Card.tsx          # Card components
│   │   ├── Input.tsx         # Form inputs
│   │   ├── Modal.tsx         # Modal dialogs
│   │   └── ProgressRing.tsx  # Animated progress rings
│   │
│   ├── pages/                # Page components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── FocusTimer.tsx    # Focus session timer
│   │   ├── NotesPanel.tsx    # Notes management
│   │   ├── TasksPanel.tsx    # Task management
│   │   ├── LearningPanel.tsx # Flashcards & quizzes
│   │   ├── AchievementsPanel.tsx # Achievements view
│   │   ├── AnalyticsPanel.tsx # Analytics dashboard
│   │   ├── SettingsPanel.tsx # Settings page
│   │   ├── ReflectionPanel.tsx # Session reflection
│   │   └── Onboarding.tsx    # First-time user flow
│   │
│   ├── store/               # Data layer
│   │   └── db.ts            # IndexedDB operations
│   │
│   ├── styles/              # Stylesheets
│   │   ├── globals.css     # Global styles
│   │   └── content.css     # Content script styles
│   │
│   ├── types/              # TypeScript types
│   │   └── index.ts        # Type definitions
│   │
│   ├── utils/              # Utility functions
│   │   └── helpers.ts      # Helper functions
│   │
│   ├── main.tsx            # Main entry point
│   ├── popup.tsx           # Popup entry point
│   ├── dashboard.tsx       # Dashboard entry point
│   └── sidepanel.tsx       # Sidepanel entry point
│
├── index.html               # Main HTML
├── popup.html              # Popup HTML
├── dashboard.html          # Dashboard HTML
├── sidepanel.html          # Side panel HTML
├── package.json             # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts         # Vite config
├── tailwind.config.js      # Tailwind config
└── postcss.config.js       # PostCSS config
```

---

## 🚀 Installation

### Development Build

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Open Chrome and load the extension**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder from this project

### Loading the Extension

1. Navigate to `chrome://extensions/`
2. Enable Developer mode (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder
5. The LifeFlow AI icon should appear in your toolbar

### Accessing the Extension

- **Click the icon** in the Chrome toolbar to open the popup
- **Right-click on page** → "Open side panel" for the full dashboard
- Or open any HTML file directly for testing

---

## ⚙️ Configuration

### AI Settings

Go to Settings → AI Settings to configure:
- AI Provider: OpenAI, Anthropic, or Custom
- API Key: Your API key for AI features

### Focus Shield

Configure blocked sites in Settings → Focus Shield:
- Toggle individual sites
- Add custom URLs to block
- Block by category (social, entertainment, etc.)

---

## 📊 Features Implemented

✅ Smart Focus Shield with timer  
✅ Website blocking with preset sites  
✅ Focus session tracking and history  
✅ Universal Notes with search  
✅ Task Manager with priorities  
✅ Flashcards and Quiz system  
✅ AI Reflection system  
✅ Growth Dashboard with scores  
✅ Achievement system with badges  
✅ Analytics and trends  
✅ Onboarding flow  
✅ Settings page  
✅ ALI AI avatar throughout  

---

## 🐛 Known Issues

- Background service worker and content scripts need to be compiled separately
- Some TypeScript strict mode errors were relaxed for compatibility

---

## 🔮 Future Enhancements

- AI integration for smart features
- Sync across devices
- Chrome notifications
- Context menu integration
- Keyboard shortcuts

---

Built with ❤️ by the LifeFlow AI Team