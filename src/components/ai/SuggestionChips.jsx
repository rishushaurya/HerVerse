import React from 'react';
import { motion } from "framer-motion";
import { useLanguage } from '@/lib/LanguageContext';

export default function SuggestionChips({ onSelect }) {
  const { t } = useLanguage();

  const suggestions = [
    { text: t('suggestionTired') },
    { text: t('suggestionStress') },
    { text: t('suggestionEat') },
    { text: t('suggestionRelax') },
    { text: t('suggestionAnxious') },
    { text: t('suggestionSleep') }
  ];

  return (
    <div className="py-4">
      <p className="text-sm mb-3" style={{ color: 'var(--app-text-secondary)' }}>{t('tryAsking')}</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(suggestion.text)}
            className="px-4 py-2 rounded-full text-sm transition-all border"
            style={{
              background: 'var(--app-card-bg)',
              borderColor: 'var(--app-card-border)',
              color: 'var(--app-text-secondary)',
              boxShadow: 'var(--app-shadow)'
            }}
          >
            {suggestion.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}