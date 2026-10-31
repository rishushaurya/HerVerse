import React from 'react';
import { motion } from "framer-motion";
import { Sparkles, AlertCircle, Sun, Moon, Heart } from "lucide-react";

const icons = {
  info: Sparkles,
  warning: AlertCircle,
  care: Heart,
  energy: Sun,
  rest: Moon
};

export default function PassiveInsight({ type = 'info', message }) {
  const Icon = icons[type] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="border rounded-2xl p-4 flex items-start gap-3"
      style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--app-accent-light)' }}>
        <Icon className="w-4 h-4" style={{ color: 'var(--app-accent)' }} />
      </div>
      <p className="text-sm leading-relaxed pt-1" style={{ color: 'var(--app-text-secondary)' }}>{message}</p>
    </motion.div>
  );
}