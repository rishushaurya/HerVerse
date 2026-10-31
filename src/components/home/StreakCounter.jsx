import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { format, subDays } from 'date-fns';

export default function StreakCounter({ checkIns = [] }) {
    // Calculate consecutive check-in days
    const calculateStreak = () => {
        if (checkIns.length === 0) return 0;

        const dates = checkIns
            .map(c => c.date || c.created_at?.split('T')[0])
            .filter(Boolean)
            .sort((a, b) => new Date(b) - new Date(a));

        const uniqueDates = [...new Set(dates)];
        if (uniqueDates.length === 0) return 0;

        let streak = 1;
        // Local dates: check-ins are saved with her local date, and UTC is "yesterday" before 05:30 IST.
        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        // Check if most recent check-in is today or yesterday
        if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

        for (let i = 1; i < uniqueDates.length; i++) {
            const curr = new Date(uniqueDates[i - 1]);
            const prev = new Date(uniqueDates[i]);
            const diffDays = (curr - prev) / 86400000;
            if (diffDays === 1) streak++;
            else break;
        }
        return streak;
    };

    const streak = calculateStreak();
    const milestones = [7, 14, 30, 50, 100];
    const nextMilestone = milestones.find(m => m > streak) || 100;
    const progress = Math.min((streak / nextMilestone) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 border"
            style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
        >
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-3">
                <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold whitespace-nowrap" style={{ color: 'var(--app-text-primary)' }}>Daily Streak</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold" style={{ color: 'var(--app-text-primary)' }}>{streak}</span>
                    <span className="text-sm" style={{ color: 'var(--app-text-muted)' }}>days</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--app-card-border)' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                />
            </div>
            <div className="flex flex-wrap justify-between gap-x-2 mt-1">
                <span className="text-xs" style={{ color: 'var(--app-text-muted)' }}>
                    {streak > 0 ? 'Keep going!' : 'Check in to start!'}
                </span>
                <span className="text-xs" style={{ color: 'var(--app-text-muted)' }}>
                    Next: {nextMilestone} days
                </span>
            </div>
        </motion.div>
    );
}
