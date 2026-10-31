import React, { useState, useEffect } from 'react';
import { getCycleInfo } from '@/lib/cycle';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';

import MobileNav from '@/components/common/MobileNav';
import SOSButton from '@/components/common/SOSButton';
import MoodCheckIn from '@/components/home/MoodCheckIn';
import TodayOverview from '@/components/home/TodayOverview';
import HealthSnapshot from '@/components/home/HealthSnapshot';
import PassiveInsight from '@/components/home/PassiveInsight';
import LiveClock from '@/components/home/LiveClock';
import StreakCounter from '@/components/home/StreakCounter';
import WellnessScore from '@/components/home/WellnessScore';
import AffirmationCard from '@/components/home/AffirmationCard';
import { Sparkles, Shield, Phone } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const moodData = localStorage.getItem('moodSelection');
    if (moodData) {
      const { date } = JSON.parse(moodData);
      if (date !== today) setShowMoodSelector(true);
    } else {
      setShowMoodSelector(true);
    }
  }, [today]);

  const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => base44.auth.me() });
  const { data: preferences, isLoading: isLoadingPrefs } = useQuery({
    queryKey: ['preferences'],
    queryFn: async () => { const prefs = await base44.entities.UserPreferences.list(); return prefs[0] || null; }
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoadingPrefs) return;
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) navigate(createPageUrl('Start'));
      else if (user && !user.name) navigate(createPageUrl('Registration'));
    };
    checkAuth();
  }, [user, isLoadingPrefs, navigate]);

  const { data: tasks = [] } = useQuery({ queryKey: ['tasks', today], queryFn: () => base44.entities.Task.filter({ date: today }) });
  const { data: checkIns = [] } = useQuery({ queryKey: ['checkIns'], queryFn: () => base44.entities.DailyCheckIn.list('-date', 7) });
  const todayCheckIn = checkIns.find(c => c.date === today);
  const { data: periodLogs = [] } = useQuery({ queryKey: ['periodLogs'], queryFn: () => base44.entities.PeriodLog.list('-start_date', 3) });
  const { data: contacts = [] } = useQuery({ queryKey: ['emergencyContacts'], queryFn: () => base44.entities.EmergencyContact.list() });

  const saveMoodMutation = useMutation({
    mutationFn: async (mood) => {
      if (todayCheckIn) return base44.entities.DailyCheckIn.update(todayCheckIn.id, { mood });
      else return base44.entities.DailyCheckIn.create({ date: today, mood });
    },
    onSuccess: (data, mood) => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      localStorage.setItem('moodSelection', JSON.stringify({ date: today, mood }));
      setShowMoodSelector(false);
    }
  });

  const { day: cycleDay, phase: cyclePhase } = getCycleInfo(preferences?.last_period_start, preferences?.average_cycle_length || 28);
  const nextTask = tasks.find(t => t.status === 'pending');

  const getPassiveInsight = () => {
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    if (cyclePhase === 'Menstrual') return { type: 'care', message: t("insightMenstrual") };
    if (todayCheckIn?.stress_level >= 4) return { type: 'rest', message: t("insightStressed") };
    if (todayCheckIn?.energy <= 2) return { type: 'rest', message: t("insightLowEnergy") };
    if (pendingTasks > 5) return { type: 'warning', message: t("insightBusyDay") };
    if (todayCheckIn?.mood >= 4) return { type: 'energy', message: t("insightGoodMood") };
    return null;
  };

  const insight = getPassiveInsight();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('goodMorning'));
    else if (hour < 18) setGreeting(t('goodAfternoon'));
    else setGreeting(t('goodEvening'));
  }, [t]);

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300" style={{ background: 'var(--app-bg-gradient)', color: 'var(--app-text-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--app-text-primary)' }}>
                {greeting}, {user?.name?.split(' ')[0] || t('hello')}
              </h1>
              <p className="mt-1" style={{ color: 'var(--app-text-secondary)' }}>{t('howAreYouFeeling')}</p>
            </div>
            <div
              className="w-12 h-12 rounded-full border-2 shadow-sm overflow-hidden"
              style={{ borderColor: 'var(--app-card-border)', background: 'var(--app-accent-gradient)' }}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xl font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-5 space-y-4">
        {/* Live Clock */}
        <LiveClock />

        {/* Daily Affirmation */}
        <AffirmationCard language={language || preferences?.language || 'english'} />

        {/* Quick Mood Check */}
        {showMoodSelector && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <MoodCheckIn selectedMood={todayCheckIn?.mood} onSelect={(mood) => saveMoodMutation.mutate(mood)} />
          </motion.div>
        )}

        {/* Streak + Wellness Score side by side */}
        <div className="grid grid-cols-2 gap-4">
          <StreakCounter checkIns={checkIns} />
          <WellnessScore checkIn={todayCheckIn} />
        </div>

        {/* Passive Insight */}
        {insight && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <PassiveInsight type={insight.type} message={insight.message} />
          </motion.div>
        )}

        {/* Today's Overview */}
        <TodayOverview
          nextTask={nextTask}
          cyclePhase={preferences?.period_tracking ? cyclePhase : null}
          healthNote={todayCheckIn?.sleep_hours < 6 ? t("healthNoteSleep") : null}
        />

        {/* Health Snapshot */}
        <HealthSnapshot
          checkIn={todayCheckIn}
          cycleDay={preferences?.period_tracking ? cycleDay : null}
          cyclePhase={preferences?.period_tracking ? cyclePhase : null}
        />

        {/* Daily Check-in Card */}
        <div
          className="rounded-3xl p-6 border relative overflow-hidden"
          style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10 opacity-30" style={{ background: 'var(--app-accent-light)' }} />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--app-text-primary)' }}>{t('dailyCheckIn')}</h3>
                <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(createPageUrl('Health'))}
                className="text-white text-xs px-4 py-2 rounded-full font-medium"
                style={{ background: 'var(--app-accent-gradient)' }}
              >
                {t('logNow')}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
            onClick={() => navigate(createPageUrl('VerseAI'))}
            className="rounded-2xl p-4 border text-left hover:shadow-md transition-all"
            style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--app-accent-light)' }}>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--app-accent-secondary)' }} />
            </div>
            <p className="font-semibold" style={{ color: 'var(--app-text-primary)' }}>VerseAI</p>
            <p className="text-sm mt-1" style={{ color: 'var(--app-text-secondary)' }}>{t('getSupport')}</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
            onClick={() => navigate(createPageUrl('GovernmentSchemes'))}
            className="rounded-2xl p-4 border text-left hover:shadow-md transition-all"
            style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--app-accent-light)' }}>
              <Shield className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
            </div>
            <p className="font-semibold" style={{ color: 'var(--app-text-primary)' }}>{t('govSchemes')}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--app-text-secondary)' }}>{t('yourRights')}</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }}
            onClick={() => navigate(createPageUrl('Helplines'))}
            className="rounded-2xl p-4 border text-left hover:shadow-md transition-all col-span-2"
            style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--app-accent-light)' }}>
                <Phone className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--app-text-primary)' }}>{t('helplines')}</p>
                <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{t('getHelp')}</p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      <SOSButton
        contacts={contacts}
        onAddContact={async (contactData) => {
          await base44.entities.EmergencyContact.create(contactData);
          queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
        }}
        onBulkAddContacts={async (contactsArray) => {
          await Promise.all(contactsArray.filter(c => !c.isPrefilled).map(contactData => base44.entities.EmergencyContact.create(contactData)));
          queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] });
        }}
      />

      <MobileNav currentPage="Home" />
    </div>
  );
}