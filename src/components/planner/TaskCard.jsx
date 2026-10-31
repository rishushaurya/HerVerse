import React from 'react';
import { motion } from "framer-motion";
import { Check, Clock, Flag, MoreVertical, User, Briefcase, HeartPulse, Flower2, Pin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/lib/LanguageContext';

const categoryIcons = {
  personal: User,
  work: Briefcase,
  health: HeartPulse,
  'self-care': Flower2,
  other: Pin
};

export default function TaskCard({ task, onComplete, onEdit, onDelete }) {
  const { t } = useLanguage();
  const isCompleted = task.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      layout
      className={`rounded-2xl p-4 border transition-all ${isCompleted ? 'opacity-60' : 'hover:shadow-md'}`}
      style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onComplete(task.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${isCompleted ? 'bg-green-500 border-green-500' : ''}`}
          style={!isCompleted ? { borderColor: 'var(--app-card-border)' } : {}}
        >
          {isCompleted && <Check className="w-4 h-4 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${isCompleted ? 'line-through' : ''}`} style={{ color: isCompleted ? 'var(--app-text-muted)' : 'var(--app-text-primary)' }}>
                {React.createElement(categoryIcons[task.category] || Pin, { className: 'inline w-4 h-4 mr-1.5 -mt-0.5', style: { color: 'var(--app-accent)' }, 'aria-hidden': true })}
                {task.title}
              </p>
              {task.notes && (
                <p className="text-sm mt-1 truncate" style={{ color: 'var(--app-text-muted)' }}>{task.notes}</p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="p-1 rounded-lg" style={{ color: 'var(--app-text-muted)' }}>
                <MoreVertical className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>{t('editTask')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-500">{t('deleteTask')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {task.time && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--app-accent-light)', color: 'var(--app-text-secondary)' }}>
                <Clock className="w-3 h-3" /> {task.time}
              </span>
            )}
            {task.priority && task.priority !== 'normal' && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border" style={{ borderColor: 'var(--app-card-border)', color: 'var(--app-text-secondary)' }}>
                <Flag className="w-3 h-3" /> {task.priority}
              </span>
            )}
            {task.duration && (
              <span className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{task.duration} {t('min')}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}