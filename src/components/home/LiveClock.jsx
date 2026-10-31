import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sunrise, Sun, Sunset, Moon } from 'lucide-react';

export default function LiveClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours();
    const TimeIcon = hours < 12 ? Sunrise : hours < 17 ? Sun : hours < 21 ? Sunset : Moon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-4 border flex items-center justify-between"
            style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--app-accent-light)' }}>
                    <Clock className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
                </div>
                <div>
                    <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--app-text-primary)' }}>
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--app-text-muted)' }}>
                        {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>
            <TimeIcon className="w-7 h-7" style={{ color: 'var(--app-accent)' }} aria-hidden="true" />
        </motion.div>
    );
}
