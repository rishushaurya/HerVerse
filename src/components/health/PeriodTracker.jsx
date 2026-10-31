import React, { useState } from 'react';
import { getCycleInfo } from '@/lib/cycle';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Droplet, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

const symptoms = [
  { id: 'cramps', label: 'Cramps' },
  { id: 'headache', label: 'Headache' },
  { id: 'bloating', label: 'Bloating' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'mood_swings', label: 'Mood swings' },
  { id: 'back_pain', label: 'Back pain' },
  { id: 'acne', label: 'Acne' },
  { id: 'cravings', label: 'Cravings' }
];

const flowOptions = [
  { value: 'light', label: 'Light', color: 'bg-rose-200' },
  { value: 'medium', label: 'Medium', color: 'bg-rose-400' },
  { value: 'heavy', label: 'Heavy', color: 'bg-rose-600' }
];

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function PeriodTracker({ periodLogs = [], onLogPeriod, lastPeriodStart, averageCycleLength = 28 }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showLogForm, setShowLogForm] = useState(false);
  const [newLog, setNewLog] = useState({
    start_date: format(new Date(), 'yyyy-MM-dd'),
    flow_intensity: 'medium',
    symptoms: []
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { day: cycleDay, phase: cyclePhase } = getCycleInfo(lastPeriodStart, averageCycleLength);

  const isPeriodDay = (date) => {
    return periodLogs.some(log => {
      const start = new Date(log.start_date);
      const end = log.end_date ? new Date(log.end_date) : addDays(start, 5);
      return date >= start && date <= end;
    });
  };

  const handleSaveLog = () => {
    onLogPeriod(newLog);
    setShowLogForm(false);
    setNewLog({ start_date: format(new Date(), 'yyyy-MM-dd'), flow_intensity: 'medium', symptoms: [] });
  };

  const toggleSymptom = (symptomId) => {
    setNewLog(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter(s => s !== symptomId)
        : [...prev.symptoms, symptomId]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Cycle Info Card */}
      {cycleDay && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5"
          style={{ background: 'var(--app-accent-gradient)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Current cycle</p>
              <p className="text-3xl font-bold text-white">Day {cycleDay}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">Phase</p>
              <p className="text-lg font-semibold text-white">{cyclePhase}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Calendar */}
      <div className="rounded-3xl p-5 border" style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}>
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-xl">
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--app-text-primary)' }} />
          </Button>
          <h3 className="font-semibold" style={{ color: 'var(--app-text-primary)' }}>{format(currentMonth, 'MMMM yyyy')}</h3>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-xl">
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--app-text-primary)' }} />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs py-2" style={{ color: 'var(--app-text-muted)' }}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((date) => {
            const isToday = isSameDay(date, new Date());
            const isPeriod = isPeriodDay(date);
            return (
              <div
                key={date.toISOString()}
                className="aspect-square flex items-center justify-center text-sm rounded-xl"
                style={
                  isPeriod
                    ? { background: 'var(--app-accent)', color: '#fff' }
                    : isToday
                      ? { background: 'var(--app-accent-light)', color: 'var(--app-accent)', fontWeight: 600 }
                      : { color: 'var(--app-text-secondary)' }
                }
              >
                {format(date, 'd')}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Period Button */}
      {!showLogForm && (
        <Button onClick={() => setShowLogForm(true)} className="w-full py-6 rounded-2xl text-white" style={{ background: 'var(--app-accent-gradient)' }}>
          <Droplet className="w-5 h-5 mr-2" /> Log Period
        </Button>
      )}

      {/* Log Form */}
      {showLogForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 border space-y-4"
          style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
        >
          <h3 className="font-semibold" style={{ color: 'var(--app-text-primary)' }}>Log Your Period</h3>

          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>Start date</label>
            <input
              type="date"
              value={newLog.start_date}
              onChange={(e) => setNewLog({ ...newLog, start_date: e.target.value })}
              className="w-full p-3 rounded-xl border"
              style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}
            />
          </div>

          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>Flow intensity</label>
            <div className="flex gap-2">
              {flowOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setNewLog({ ...newLog, flow_intensity: option.value })}
                  className="flex-1 py-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: newLog.flow_intensity === option.value ? 'var(--app-accent)' : 'var(--app-card-border)',
                    background: newLog.flow_intensity === option.value ? 'var(--app-accent-light)' : 'transparent'
                  }}
                >
                  <div className={`w-4 h-4 ${option.color} rounded-full mx-auto mb-1`} />
                  <span className="text-sm" style={{ color: 'var(--app-text-primary)' }}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>Symptoms</label>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className="px-3 py-2 rounded-xl text-sm flex items-center gap-1 transition-all border-2"
                  style={{
                    borderColor: newLog.symptoms.includes(symptom.id) ? 'var(--app-accent)' : 'transparent',
                    background: newLog.symptoms.includes(symptom.id) ? 'var(--app-accent-light)' : 'var(--app-card-hover, var(--app-card-bg))',
                    color: 'var(--app-text-primary)'
                  }}
                >
                  <span>{symptom.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowLogForm(false)} className="flex-1 py-5 rounded-xl">Cancel</Button>
            <Button onClick={handleSaveLog} className="flex-1 py-5 rounded-xl text-white" style={{ background: 'var(--app-accent-gradient)' }}>Save</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}