import React from 'react';
import { motion } from "framer-motion";
import { Calendar, Bell, Heart, ChevronRight } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/LanguageContext';

export default function TodayOverview({ nextTask, healthNote, cyclePhase }) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-5 border"
      style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold" style={{ color: 'var(--app-text-primary)' }}>{t('todaysOverview')}</h3>
        <span className="text-sm" style={{ color: 'var(--app-text-muted)' }}>{format(new Date(), 'EEEE, MMM d')}</span>
      </div>

      <div className="space-y-3">
        {nextTask && (
          <Link to={createPageUrl('Planner')} className="block">
            <div className="flex items-center gap-4 p-3 rounded-2xl transition-colors" style={{ background: 'var(--app-accent-light)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'var(--app-card-bg)' }}>
                <Calendar className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{t('nextTask')}</p>
                <p className="font-medium truncate" style={{ color: 'var(--app-text-primary)' }}>{nextTask.title}</p>
              </div>
              {nextTask.time && (
                <span className="text-sm font-medium" style={{ color: 'var(--app-accent)' }}>{nextTask.time}</span>
              )}
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--app-text-muted)' }} />
            </div>
          </Link>
        )}

        {cyclePhase && (
          <Link to={createPageUrl('Health')} className="block">
            <div className="flex items-center gap-4 p-3 rounded-2xl transition-colors" style={{ background: 'var(--app-accent-light)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'var(--app-card-bg)' }}>
                <Heart className="w-5 h-5" style={{ color: 'var(--app-accent-secondary)' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{t('cyclePhase')}</p>
                <p className="font-medium" style={{ color: 'var(--app-text-primary)' }}>{cyclePhase}</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--app-text-muted)' }} />
            </div>
          </Link>
        )}

        {healthNote && (
          <div className="flex items-center gap-4 p-3 rounded-2xl" style={{ background: 'var(--app-accent-light)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'var(--app-card-bg)' }}>
              <Bell className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{t('gentleReminder')}</p>
              <p className="font-medium" style={{ color: 'var(--app-text-primary)' }}>{healthNote}</p>
            </div>
          </div>
        )}

        {!nextTask && !cyclePhase && !healthNote && (
          <div className="text-center py-6">
            <p style={{ color: 'var(--app-text-muted)' }}>{t('dayIsClear')}</p>
            <p className="text-sm" style={{ color: 'var(--app-text-muted)' }}>{t('addTasksOrLog')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}