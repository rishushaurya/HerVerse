import React from 'react';
import { motion } from "framer-motion";
import { Droplets, Moon, Battery, TrendingUp } from "lucide-react";
import { useLanguage } from '@/lib/LanguageContext';

export default function HealthSnapshot({ checkIn, cycleDay, cyclePhase }) {
  const { t } = useLanguage();

  const items = [
    { icon: Battery, label: t('energy'), value: checkIn?.energy || '-', max: 5 },
    { icon: Moon, label: t('sleep'), value: checkIn?.sleep_hours || '-', suffix: 'hrs' },
    { icon: Droplets, label: t('water'), value: checkIn?.water_intake || '-', suffix: 'glasses' },
    { icon: TrendingUp, label: t('stress'), value: checkIn?.stress_level || '-', max: 5, inverted: true }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl p-5 border"
      style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold" style={{ color: 'var(--app-text-primary)' }}>{t('healthSnapshot')}</h3>
        {cycleDay && (
          <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'var(--app-badge-bg)', color: 'var(--app-badge-text)' }}>
            {t('day')} {cycleDay}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="text-center"
          >
            <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-2" style={{ background: 'var(--app-accent-light)' }}>
              <item.icon className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--app-text-primary)' }}>
              {item.value}{item.suffix && typeof item.value === 'number' ? ` ${item.suffix}` : ''}
            </p>
            <p className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{item.label}</p>
          </motion.div>
        ))}
      </div>

      {cyclePhase && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--app-card-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{t('currentPhase')}</span>
            <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: 'var(--app-badge-bg)', color: 'var(--app-badge-text)' }}>
              {cyclePhase}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}