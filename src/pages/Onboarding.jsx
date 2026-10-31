import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useTheme } from '@/lib/ThemeContext';
import { useLanguage } from '@/lib/LanguageContext';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import LanguageSelect from '@/components/onboarding/LanguageSelect';
import LifeSetupQuestion from '@/components/onboarding/LifeSetupQuestion';
import PrivacyScreen from '@/components/onboarding/PrivacyScreen';
import { User, Clock, Calendar, Heart, Brain, Flower2, GraduationCap, Briefcase, Home, HandHeart, Sparkles, Bell, BellOff, CalendarDays, CalendarRange, HeartPulse, Hourglass, Moon, Smile } from 'lucide-react';

const lifeSetupSteps = [
  {
    key: 'age_range',
    question: "What's your age range?",
    description: "This helps us personalize your experience",
    icon: User,
    options: [
      { value: '18-24', label: '18-24' },
      { value: '25-34', label: '25-34' },
      { value: '35-44', label: '35-44' },
      { value: '45-54', label: '45-54' },
      { value: '55+', label: '55+' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' }
    ]
  },
  {
    key: 'life_stage',
    question: "What's your current life stage?",
    description: "We'll tailor features to your lifestyle",
    icon: User,
    options: [
      { value: 'student', label: 'Student', icon: GraduationCap, description: 'Studying or in school' },
      { value: 'working', label: 'Working Professional', icon: Briefcase, description: 'Career-focused' },
      { value: 'homemaker', label: 'Homemaker', icon: Home, description: 'Managing home life' },
      { value: 'caregiver', label: 'Caregiver', icon: HandHeart, description: 'Taking care of others' },
      { value: 'other', label: 'Other', icon: Sparkles }
    ]
  },
  {
    key: 'reminder_style',
    question: "How would you like your reminders?",
    description: "We'll match your preference",
    icon: Clock,
    options: [
      { value: 'gentle', label: 'Gentle', icon: Flower2, description: 'Soft, caring nudges' },
      { value: 'normal', label: 'Normal', icon: Bell, description: 'Clear reminders' },
      { value: 'minimal', label: 'Minimal', icon: BellOff, description: 'Only important alerts' }
    ]
  },
  {
    key: 'planner_usage',
    question: "How often do you plan your schedule?",
    description: "We'll set up your planner view",
    icon: Calendar,
    options: [
      { value: 'daily', label: 'Daily', icon: CalendarDays, description: 'I plan each day' },
      { value: 'weekly', label: 'Weekly', icon: CalendarRange, description: 'I plan by the week' },
      { value: 'monthly', label: 'Monthly', icon: Calendar, description: 'Big picture planning' }
    ]
  },
  {
    key: 'period_tracking',
    question: "Would you like to track your period?",
    description: "Helps us provide cycle insights",
    icon: Heart,
    options: [
      { value: true, label: 'Yes, please', icon: HeartPulse, description: 'Track my cycle' },
      { value: false, label: 'Not now', icon: Hourglass, description: 'Maybe later' }
    ]
  },
  {
    key: 'mental_health_checkins',
    question: "Would you like mental wellness check-ins?",
    description: "Gentle prompts to reflect on how you feel",
    icon: Brain,
    options: [
      { value: 'yes', label: 'Yes', icon: Brain, description: 'Regular check-ins' },
      { value: 'sometimes', label: 'Sometimes', icon: Moon, description: 'Occasional prompts' },
      { value: 'no', label: 'No', icon: Smile, description: 'I prefer not to' }
    ]
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { switchTheme } = useTheme();
  const { switchLanguage } = useLanguage();
  const [step, setStep] = useState(0); // 0=welcome, 1=language, 2-7=life setup, 8=privacy
  const [preferences, setPreferences] = useState({
    language: 'english',
    age_range: null,
    life_stage: null,
    reminder_style: 'gentle',
    planner_usage: 'daily',
    health_tracking: 'basic',
    period_tracking: false,
    mental_health_checkins: 'sometimes',
    onboarding_completed: false
  });

  const totalLifeSetupSteps = lifeSetupSteps.length;

  const handleLanguageSelect = (lang) => {
    setPreferences({ ...preferences, language: lang });
  };

  const handleLifeSetupSelect = (key, value) => {
    setPreferences({ ...preferences, [key]: value });
  };

  const handleComplete = async () => {
    try {
      // 1. Check if preferences exist for this user (to prevent duplicates)
      const existingPrefs = await base44.entities.UserPreferences.list();

      const prefsData = {
        ...preferences,
        onboarding_completed: true,
        theme: 'light' // Default theme if not set
      };

      if (existingPrefs && existingPrefs.length > 0) {
        // Update existing
        await base44.entities.UserPreferences.update(existingPrefs[0].id, prefsData);
      } else {
        // Create new
        await base44.entities.UserPreferences.create(prefsData);
      }

      // 2. Sync Contexts immediately
      switchLanguage(preferences.language);
      switchTheme('light'); // or prompt for theme in onboarding? Defaulting to light for now.

      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Do not navigate away so user can retry
      alert("Failed to save your preferences. Please try again.");
    }
  };

  const handleSkip = () => {
    setStep(step + 1);
  };

  // Welcome screen
  if (step === 0) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200 shadow-sm"
          >
            Skip to App
          </button>
        </div>
        <WelcomeScreen onNext={() => setStep(1)} />
      </div>
    );
  }

  // Language selection
  if (step === 1) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200 shadow-sm"
          >
            Skip to App
          </button>
        </div>
        <LanguageSelect
          selected={preferences.language}
          onSelect={handleLanguageSelect}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      </div>
    );
  }

  // Life setup questions (steps 2-7)
  const lifeSetupIndex = step - 2;
  if (lifeSetupIndex >= 0 && lifeSetupIndex < lifeSetupSteps.length) {
    const currentQuestion = lifeSetupSteps[lifeSetupIndex];
    return (
      <div className="relative min-h-screen">
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200 shadow-sm"
          >
            Skip to App
          </button>
        </div>
        <LifeSetupQuestion
          question={currentQuestion.question}
          description={currentQuestion.description}
          icon={currentQuestion.icon}
          options={currentQuestion.options}
          selected={preferences[currentQuestion.key]}
          onSelect={(value) => handleLifeSetupSelect(currentQuestion.key, value)}
          onNext={() => setStep(step + 1)}
          onBack={() => setStep(step - 1)}
          onSkip={handleSkip}
          currentStep={lifeSetupIndex + 1}
          totalSteps={totalLifeSetupSteps}
        />
      </div>
    );
  }

  // Privacy screen
  return (
    <div className="relative min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => navigate(createPageUrl('Home'))}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200 shadow-sm"
        >
          Skip to App
        </button>
      </div>
      <PrivacyScreen
        onComplete={handleComplete}
        onBack={() => setStep(step - 1)}
      />
    </div>
  );
}