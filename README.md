# USMLE Trivia App

A modern, mobile-first web application for USMLE (United States Medical Licensing Examination) preparation built with React, Vite, Supabase, and Tailwind CSS.

## ✨ Features

- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Interactive Quiz System**: Timed questions with immediate feedback
- **Multiple Categories**: Various medical subjects including Cardiology, Neurology, Pharmacology, etc.
- **Leaderboard**: Compete with medical students worldwide with profile images and country flags
- **Progress Tracking**: Monitor your performance and study progress
- **Smooth Animations**: Beautiful transitions using Framer Motion
- **User Profile**: Track stats, achievements, and settings
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Database Integration**: Full Supabase backend with authentication

## 🚀 Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast development and build tool  
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icons
- **Supabase** - Backend as a Service (Database, Auth, Storage)
- **PostgreSQL** - Robust database with advanced features

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/intelogroup/usmle-trivia-app.git
   cd usmle-trivia-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a Supabase project
   - Copy your project URL and anon key to `.env.local`
   - Run the database migrations from `/database/migrations/`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Header, BottomNav, etc.)
│   ├── ui/              # Reusable UI components
│   ├── auth/            # Authentication components
│   └── test/            # Testing components
├── pages/               # Main application pages
├── hooks/               # Custom React hooks
├── services/            # API calls and data management
├── lib/                 # Library configurations (Supabase)
├── contexts/            # React context providers
├── styles/              # Global styles and themes
└── App.jsx              # Main app component
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Pages

### Home Page
- Welcome message and user greeting
- Quick stats overview (accuracy, study time, streak)
- Quick action buttons for immediate practice
- Recent activity timeline

### Quiz Tab (formerly Categories Page)
- Medical subject categories with progress tracking
- Visual indicators for completion status
- Three quiz modes:
  - **Blitz Quiz**: Quick 15-question practice with random selection
  - **Custom Quiz**: Personalized quiz where users select subjects/systems/topics
  - **Block Test**: Standardized 40-question blocks with configurable timing
- Easy navigation to specific topics

### Leaderboard
- Global ranking system with real profile pictures
- Country flags for international competition
- Performance metrics and streaks
- User statistics and achievements

### Quiz Page
- Timed questions with countdown
- Multiple choice answers with visual feedback
- Progress bar showing quiz completion
- Immediate explanations after each question
- Smooth transitions between questions

### Results Page
- Animated score display with circular progress
- Performance level indicator
- Detailed statistics breakdown
- Action buttons for next steps
- Motivational messages

### Profile Page
- User information and avatar
- Achievement badges and progress
- Settings and preferences
- Study statistics and analytics

## 🎨 Design Features

- **Gradient Backgrounds**: Beautiful color gradients throughout the app
- **Card-Based Layout**: Clean, organized content in cards
- **Smooth Animations**: Framer Motion for engaging user experience
- **Responsive Design**: Works perfectly on all screen sizes
- **Professional Typography**: Clean, readable fonts
- **Intuitive Navigation**: Easy-to-use bottom navigation
- **Profile Images**: High-quality placeholder avatars
- **Country Flags**: Real flag images for global feel

## 🗃️ Database Schema

The app includes comprehensive database migrations for:
- User profiles and authentication
- Questions with categories and tags
- User progress tracking
- Leaderboard and scoring system
- Security policies and RLS

## 🔧 Customization

### Adding New Categories
Edit the categories array in `src/pages/QuizTab.jsx`:

```jsx
const categories = [
  {
    id: 'new-category',
    title: 'New Category',
    description: 'Description of the new category',
    icon: IconComponent,
    color: 'bg-color-500',
    progress: 0,
    questionCount: 100
  }
]
```

### Adding New Questions
Use the database migrations or add through Supabase dashboard:

```sql
INSERT INTO questions (question_text, options, correct_answer, explanation, category)
VALUES ('Your question?', '["A", "B", "C", "D"]', 0, 'Explanation', 'cardiology');
```

### Styling
- Colors can be customized in `tailwind.config.js`
- Global styles are in `src/styles/globals.css`
- Component-specific styles use Tailwind classes

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider:
   - Vercel (recommended)
   - Netlify
   - GitHub Pages
   - AWS S3
   - Any static hosting service

3. **Configure Supabase**
   - Set up production database
   - Configure authentication providers
   - Update environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Future Enhancements

- [ ] User authentication and login ✅
- [ ] Backend API integration ✅
- [ ] Offline support with PWA
- [ ] Study reminders and notifications
- [ ] Social features and leaderboards ✅
- [ ] Advanced analytics and insights
- [ ] Content management system
- [ ] Multi-language support
- [ ] Real-time multiplayer quizzes
- [ ] AI-powered question recommendations

## 🙏 Acknowledgments

- USMLE for providing the medical education framework
- React community for excellent documentation
- Tailwind CSS for the amazing utility-first approach
- Framer Motion for beautiful animations
- Supabase for the excellent backend infrastructure
- Medical students worldwide for inspiration

---

Built with ❤️ for medical students preparing for USMLE
