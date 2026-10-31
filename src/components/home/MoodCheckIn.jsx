import React from 'react';
import { MOOD_ICONS } from '@/lib/moods';
import { motion } from "framer-motion";
import { useLanguage } from '@/lib/LanguageContext';

export default function MoodCheckIn({ selectedMood, onSelect, compact = false }) {
  const { t } = useLanguage();

  const moods = [
    { value: 1, label: t('sad') },
    { value: 2, label: t('low') },
    { value: 3, label: t('okay') },
    { value: 4, label: t('good') },
    { value: 5, label: t('great') }
  ];

  return (
    <div
      className={`${compact ? 'flex gap-2 justify-center' : 'rounded-3xl p-6 border'}`}
      style={!compact ? {
        background: 'var(--app-card-bg)',
        borderColor: 'var(--app-card-border)',
        boxShadow: 'var(--app-shadow)'
      } : undefined}
    >
      {!compact && (
        <p className="mb-4 text-center" style={{ color: 'var(--app-text-secondary)' }}>{t('howAreYouFeeling')}</p>
      )}
      <div className="flex justify-between gap-2">
        {moods.map((mood, index) => (
          <motion.button
            key={mood.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(mood.value)}
            aria-label={mood.label}
            className={`flex flex-col items-center ${compact ? 'p-2' : 'p-3'} rounded-2xl transition-all`}
            style={selectedMood === mood.value
              ? { background: 'var(--app-accent-light)', boxShadow: `0 0 0 2px var(--app-accent)`, transform: 'scale(1.1)' }
              : {}
            }
          >
            {React.createElement(MOOD_ICONS[mood.value - 1], {
              className: `${compact ? 'w-7 h-7' : 'w-8 h-8'} mb-1`,
              style: { color: selectedMood === mood.value ? 'var(--app-accent)' : 'var(--app-text-secondary)' },
              'aria-hidden': true,
            })}
            {!compact && (
              <span className="text-xs" style={{ color: selectedMood === mood.value ? 'var(--app-text-primary)' : 'var(--app-text-muted)' }}>
                {mood.label}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}