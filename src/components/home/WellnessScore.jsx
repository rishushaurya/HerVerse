import React from 'react';
import { motion } from 'framer-motion';

export default function WellnessScore({ checkIn }) {
    const calculateScore = () => {
        if (!checkIn) return null;
        let score = 0;
        let total = 0;

        // Mood (1-5 → 0-25pts)
        if (checkIn.mood) { score += (checkIn.mood / 5) * 25; total += 25; }
        // Energy (1-5 → 0-25pts)
        if (checkIn.energy) { score += (checkIn.energy / 5) * 25; total += 25; }
        // Sleep (target 7-8h → 0-25pts)
        if (checkIn.sleep_hours != null) {
            const sleepScore = checkIn.sleep_hours >= 7 && checkIn.sleep_hours <= 9
                ? 25
                : checkIn.sleep_hours >= 6 ? 18 : checkIn.sleep_hours >= 5 ? 10 : 5;
            score += sleepScore;
            total += 25;
        }
        // Stress (inverted, 1=best → 0-25pts)
        if (checkIn.stress_level) { score += ((6 - checkIn.stress_level) / 5) * 25; total += 25; }

        return total > 0 ? Math.round((score / total) * 100) : null;
    };

    const score = calculateScore();
    if (score === null) return null;

    const getColor = (s) => {
        if (s >= 80) return '#22c55e';
        if (s >= 60) return '#84cc16';
        if (s >= 40) return '#eab308';
        if (s >= 20) return '#f97316';
        return '#ef4444';
    };

    const getLabel = (s) => {
        if (s >= 80) return 'Excellent';
        if (s >= 60) return 'Good';
        if (s >= 40) return 'Okay';
        if (s >= 20) return 'Low';
        return 'Needs care';
    };

    const color = getColor(score);
    const circumference = 2 * Math.PI * 45;
    const strokeDash = (score / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-5 border text-center"
            style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
        >
            <p className="font-semibold mb-3" style={{ color: 'var(--app-text-primary)' }}>Wellness Score</p>

            <div className="relative w-28 h-28 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--app-card-border)" strokeWidth="8" />
                    <motion.circle
                        cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: `0 ${circumference}` }}
                        animate={{ strokeDasharray: `${strokeDash} ${circumference - strokeDash}` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-2xl font-bold"
                        style={{ color }}
                    >
                        {score}
                    </motion.span>
                </div>
            </div>

            <p className="text-sm mt-2 font-medium" style={{ color }}>{getLabel(score)}</p>
        </motion.div>
    );
}
