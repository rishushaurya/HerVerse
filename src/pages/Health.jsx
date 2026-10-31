import React, { useState } from 'react';
import { MOOD_ICONS } from '@/lib/moods';
import { useLanguage } from '@/lib/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Heart, Calendar, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import MobileNav from '@/components/common/MobileNav';
import SOSButton from '@/components/common/SOSButton';
import DailyCheckInForm from '@/components/health/DailyCheckInForm';
import PeriodTracker from '@/components/health/PeriodTracker';
import HealthInsights from '@/components/health/HealthInsights';
import SymptomTracker from '@/components/health/SymptomTracker';
import ExerciseLogger from '@/components/health/ExerciseLogger';

export default function Health() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: preferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: async () => { const prefs = await base44.entities.UserPreferences.list(); return prefs[0] || null; }
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['checkIns'],
    queryFn: () => base44.entities.DailyCheckIn.list('-date', 30)
  });
  const todayCheckIn = checkIns.find(c => c.date === today);

  const { data: periodLogs = [] } = useQuery({
    queryKey: ['periodLogs'],
    queryFn: () => base44.entities.PeriodLog.list('-start_date', 12)
  });

  const { data: symptoms = [] } = useQuery({
    queryKey: ['symptoms'],
    queryFn: () => base44.entities.SymptomLog.list('-date', 50)
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list('-date', 50)
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: () => base44.entities.EmergencyContact.list()
  });

  const saveCheckInMutation = useMutation({
    mutationFn: async (data) => {
      if (todayCheckIn) { return base44.entities.DailyCheckIn.update(todayCheckIn.id, data); }
      else { return base44.entities.DailyCheckIn.create({ ...data, date: today }); }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['checkIns'] }); setShowCheckInForm(false); }
  });

  const savePeriodLogMutation = useMutation({
    mutationFn: async (data) => {
      const log = await base44.entities.PeriodLog.create(data);
      // Only move forward: back-filling an older period must not reset the current cycle.
      if (preferences?.id && (!preferences.last_period_start || data.start_date > preferences.last_period_start)) {
        await base44.entities.UserPreferences.update(preferences.id, { last_period_start: data.start_date });
      }
      return log;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['periodLogs'] }); queryClient.invalidateQueries({ queryKey: ['preferences'] }); }
  });

  const addSymptomMutation = useMutation({
    mutationFn: (data) => base44.entities.SymptomLog.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['symptoms'] })
  });
  const deleteSymptomMutation = useMutation({
    mutationFn: (id) => base44.entities.SymptomLog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['symptoms'] })
  });
  const addExerciseMutation = useMutation({
    mutationFn: (data) => base44.entities.Exercise.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exercises'] })
  });
  const deleteExerciseMutation = useMutation({
    mutationFn: (id) => base44.entities.Exercise.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exercises'] })
  });

  const healthSections = [
    { icon: Heart, title: t('dailyCheckIn'), description: todayCheckIn ? t('loggedToday') : t('dailyCheckInDescr'), color: 'rose', action: () => setShowCheckInForm(true), status: todayCheckIn ? 'done' : 'pending' },
    { icon: Calendar, title: t('periodBody'), description: t('trackCycle'), color: 'purple', action: () => setActiveTab('period'), status: preferences?.period_tracking ? 'active' : 'inactive' },
    { icon: Brain, title: t('mentalWellness'), description: t('moodPatterns'), color: 'amber', action: () => setActiveTab('insights'), status: 'active' },
    { icon: Sparkles, title: t('insights'), description: t('healthPatterns'), color: 'blue', action: () => setActiveTab('insights'), status: 'active' }
  ];

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300" style={{ background: 'var(--app-bg-gradient)', color: 'var(--app-text-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--app-text-primary)' }}>{t('healthTitle')}</h1>
          <p className="mt-1" style={{ color: 'var(--app-text-secondary)' }}>{t('healthSubtitle')}</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            className="w-full rounded-2xl p-1"
            style={{ background: 'var(--app-tab-bg)', boxShadow: 'var(--app-shadow)' }}
          >
            <TabsTrigger
              value="overview"
              className="flex-1 rounded-xl data-[state=active]:shadow-sm"
              style={{ '--tw-text-opacity': 1 }}
              data-active-bg="var(--app-tab-active-bg)"
            >
              {t('overview')}
            </TabsTrigger>
            <TabsTrigger
              value="period"
              className="flex-1 rounded-xl data-[state=active]:shadow-sm"
            >
              {t('period')}
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="flex-1 rounded-xl data-[state=active]:shadow-sm"
            >
              {t('insights')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {showCheckInForm ? (
              <DailyCheckInForm existingCheckIn={todayCheckIn} onSave={(data) => saveCheckInMutation.mutate(data)} onCancel={() => setShowCheckInForm(false)} />
            ) : (
              <>
                {healthSections.map((section, index) => (
                  <motion.button
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={section.action}
                    className="w-full rounded-2xl p-4 border flex items-center gap-4 hover:shadow-md transition-all text-left"
                    style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${section.color}-50`}>
                      <section.icon className={`w-6 h-6 text-${section.color}-500`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: 'var(--app-text-primary)' }}>{section.title}</p>
                      <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{section.description}</p>
                    </div>
                    {section.status === 'done' && (
                      <span className="px-3 py-1 text-xs rounded-full" style={{ background: 'var(--app-badge-bg)', color: 'var(--app-badge-text)' }}>✓</span>
                    )}
                    <ChevronRight className="w-5 h-5" style={{ color: 'var(--app-text-muted)' }} />
                  </motion.button>
                ))}

                {checkIns.length > 0 && (
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--app-text-secondary)' }}>{t('recentCheckIns')}</h3>
                    <div className="rounded-2xl p-4 border" style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}>
                      <div className="flex justify-between items-center">
                        {checkIns.slice(0, 7).map((checkIn, i) => {
                          const MoodIcon = MOOD_ICONS[checkIn.mood - 1];
                          return (
                            <div key={i} className="text-center">
                              <p className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{format(new Date(checkIn.date), 'EEE')}</p>
                              {MoodIcon && <MoodIcon className="w-6 h-6 mx-auto mt-1" style={{ color: 'var(--app-accent)' }} />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="period" className="mt-4">
            <PeriodTracker periodLogs={periodLogs} onLogPeriod={(data) => savePeriodLogMutation.mutate(data)} lastPeriodStart={preferences?.last_period_start} averageCycleLength={preferences?.average_cycle_length} />
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <HealthInsights checkIns={checkIns} periodLogs={periodLogs} />
            <div className="mt-6">
              <SymptomTracker symptoms={symptoms} onAddSymptom={(data) => addSymptomMutation.mutate(data)} onDeleteSymptom={(id) => deleteSymptomMutation.mutate(id)} />
            </div>
            <div className="mt-6">
              <ExerciseLogger exercises={exercises} onAddExercise={(data) => addExerciseMutation.mutate(data)} onDeleteExercise={(id) => deleteExerciseMutation.mutate(id)} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <SOSButton contacts={contacts} onAddContact={async (contactData) => { await base44.entities.EmergencyContact.create(contactData); queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] }); }} />
      <MobileNav currentPage="Health" />
    </div>
  );
}