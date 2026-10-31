import React from 'react';
import { motion } from "framer-motion";
import { Sparkles, Moon, Battery, Brain, Heart } from "lucide-react";

export default function HealthInsights({ checkIns = [], periodLogs = [] }) {
  const recentCheckIns = checkIns.slice(0, 7);

  const getAverage = (field) => {
    if (recentCheckIns.length === 0) return null;
    const sum = recentCheckIns.reduce((acc, c) => acc + (c[field] || 0), 0);
    return (sum / recentCheckIns.length).toFixed(1);
  };

  const getTrend = (field) => {
    if (recentCheckIns.length < 3) return 'stable';
    const recent = recentCheckIns.slice(0, 3).reduce((a, c) => a + (c[field] || 0), 0) / 3;
    const older = recentCheckIns.slice(-3).reduce((a, c) => a + (c[field] || 0), 0) / 3;
    if (recent > older + 0.5) return 'up';
    if (recent < older - 0.5) return 'down';
    return 'stable';
  };

  const insights = [];

  const avgSleep = getAverage('sleep_hours');
  if (avgSleep) {
    if (avgSleep < 6) {
      insights.push({ type: 'warning', icon: Moon, title: 'Rest needed', message: `You've been sleeping around ${avgSleep} hours. Try to aim for 7-8 hours for better energy.` });
    } else if (avgSleep >= 7) {
      insights.push({ type: 'positive', icon: Moon, title: 'Great sleep pattern!', message: `You're getting good rest with ${avgSleep} hours on average. Keep it up!` });
    }
  }

  const energyTrend = getTrend('energy');
  if (energyTrend === 'down') {
    insights.push({ type: 'warning', icon: Battery, title: 'Energy dipping', message: 'Your energy has been lower lately. Consider lighter tasks and more breaks.' });
  }

  const avgStress = getAverage('stress_level');
  if (avgStress && avgStress > 3.5) {
    insights.push({ type: 'care', icon: Brain, title: 'Stress is high', message: 'You seem stressed lately. Remember to take breaks and do something you enjoy.' });
  }

  if (periodLogs.length > 0) {
    const lastPeriod = periodLogs[0];
    const daysSince = Math.floor((new Date() - new Date(lastPeriod.start_date)) / (1000 * 60 * 60 * 24));
    if (daysSince >= 25 && daysSince <= 30) {
      insights.push({ type: 'info', icon: Heart, title: 'Period may be coming', message: 'Based on your cycle, your period might start soon. Plan accordingly!' });
    }
  }

  if (insights.length === 0 && recentCheckIns.length > 0) {
    insights.push({ type: 'positive', icon: Sparkles, title: "You're doing great!", message: 'Your health patterns look good. Keep taking care of yourself!' });
  }

  if (insights.length === 0) {
    return (
      <div className="rounded-3xl p-8 border text-center" style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}>
        <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--app-accent)' }} />
        <h3 className="font-semibold mb-2" style={{ color: 'var(--app-text-primary)' }}>No insights yet</h3>
        <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>Keep logging your daily check-ins to see personalized insights here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--app-text-primary)' }}>
        <Sparkles className="w-5 h-5" style={{ color: 'var(--app-accent)' }} /> Your Insights
      </h3>

      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-2xl p-4 border"
          style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
        >
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--app-accent-light)' }}>
              <insight.icon className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: 'var(--app-text-primary)' }}>{insight.title}</h4>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--app-text-secondary)' }}>{insight.message}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}