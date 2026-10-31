import React, { useState } from 'react';
import { MOOD_ICONS } from '@/lib/moods';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Sparkles, Battery, Moon, Brain, Droplets, FileText, GlassWater } from 'lucide-react';

const energyLabels = ['Exhausted', 'Low', 'Okay', 'Good', 'Energized'];
const stressLabels = ['Calm', 'Relaxed', 'Normal', 'Stressed', 'Overwhelmed'];

export default function DailyCheckInForm({ existingCheckIn, onSave, onCancel }) {
  const { t } = useLanguage();
  const [checkIn, setCheckIn] = useState(existingCheckIn || {
    mood: 3, energy: 3, sleep_hours: 7, stress_level: 3, water_intake: 4, physical_discomfort: '', notes: ''
  });

  const cs = { background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Mood */}
      <div className="rounded-3xl p-5 border" style={cs}>
        <Label className="mb-4 flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--app-text-primary)' }}>
          <Sparkles className="w-5 h-5" style={{ color: 'var(--app-accent)' }} /> {t('howsYourMood')}
        </Label>
        <div className="flex justify-between mt-4">
          {MOOD_ICONS.map((MoodIcon, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCheckIn({ ...checkIn, mood: index + 1 })}
              className="w-14 h-14 rounded-2xl text-2xl flex items-center justify-center transition-all"
              style={checkIn.mood === index + 1
                ? { background: 'var(--app-accent-light)', boxShadow: `0 0 0 2px var(--app-accent)`, transform: 'scale(1.1)' }
                : { background: 'var(--app-card-hover, transparent)' }
              }
            >
              <MoodIcon className="w-7 h-7" style={{ color: checkIn.mood === index + 1 ? 'var(--app-accent)' : 'var(--app-text-secondary)' }} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Energy */}
      <div className="rounded-3xl p-5 border" style={cs}>
        <Label className="mb-4 flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--app-text-primary)' }}>
          <Battery className="w-5 h-5" style={{ color: 'var(--app-accent)' }} /> {t('energyLevel')}
        </Label>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setCheckIn({ ...checkIn, energy: level })}
              className="flex-1 py-3 rounded-xl border-2 text-center transition-all"
              style={{
                borderColor: checkIn.energy === level ? 'var(--app-accent)' : 'var(--app-card-border)',
                background: checkIn.energy === level ? 'var(--app-accent-light)' : 'transparent'
              }}
            >
              <span className="text-lg font-bold" style={{ color: 'var(--app-text-primary)' }}>{level}</span>
              <p className="text-xs mt-1" style={{ color: 'var(--app-text-muted)' }}>{energyLabels[level - 1]}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Sleep */}
      <div className="rounded-3xl p-5 border" style={cs}>
        <Label className="mb-4 flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--app-text-primary)' }}>
          <Moon className="w-5 h-5" style={{ color: 'var(--app-accent)' }} /> {t('hoursOfSleep')}
        </Label>
        <div className="flex items-center gap-4 mt-2">
          <Input
            type="number" min="0" max="24" step="0.5"
            value={checkIn.sleep_hours}
            onChange={(e) => setCheckIn({ ...checkIn, sleep_hours: parseFloat(e.target.value) || 0 })}
            className="w-24 text-center text-lg font-semibold rounded-xl"
            style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}
          />
          <span style={{ color: 'var(--app-text-secondary)' }}>hours</span>
        </div>
      </div>

      {/* Stress */}
      <div className="rounded-3xl p-5 border" style={cs}>
        <Label className="mb-4 flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--app-text-primary)' }}>
          <Brain className="w-5 h-5" style={{ color: 'var(--app-accent)' }} /> {t('stressLevel')}
        </Label>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setCheckIn({ ...checkIn, stress_level: level })}
              className="flex-1 py-3 rounded-xl border-2 text-center transition-all"
              style={{
                borderColor: checkIn.stress_level === level ? 'var(--app-accent)' : 'var(--app-card-border)',
                background: checkIn.stress_level === level ? 'var(--app-accent-light)' : 'transparent'
              }}
            >
              <span className="text-lg font-bold" style={{ color: 'var(--app-text-primary)' }}>{level}</span>
              <p className="text-xs mt-1" style={{ color: 'var(--app-text-muted)' }}>{stressLabels[level - 1]}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Water */}
      <div className="rounded-3xl p-5 border" style={cs}>
        <Label className="mb-4 flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--app-text-primary)' }}>
          <Droplets className="w-5 h-5" style={{ color: 'var(--app-accent)' }} /> {t('waterIntake')}
        </Label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[...Array(10)].map((_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCheckIn({ ...checkIn, water_intake: i + 1 })}
              className="w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all"
              style={{
                background: i < checkIn.water_intake ? 'var(--app-accent-light)' : 'var(--app-card-hover, transparent)',
                opacity: i < checkIn.water_intake ? 1 : 0.4
              }}
            >
              <GlassWater className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
            </motion.button>
          ))}
        </div>
        <p className="text-sm mt-2" style={{ color: 'var(--app-text-secondary)' }}>{checkIn.water_intake} glasses</p>
      </div>

      {/* Physical Discomfort */}
      <div className="rounded-3xl p-5 border" style={cs}>
        <Label className="mb-3 flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--app-text-primary)' }}>
          <FileText className="w-5 h-5" style={{ color: 'var(--app-text-muted)' }} /> {t('physicalDiscomfort')}
        </Label>
        <Input
          placeholder={t('physicalDiscomfortPlaceholder')}
          value={checkIn.physical_discomfort}
          onChange={(e) => setCheckIn({ ...checkIn, physical_discomfort: e.target.value })}
          className="rounded-xl"
          style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}
        />
      </div>

      {/* Notes */}
      <div className="rounded-3xl p-5 border" style={cs}>
        <Label className="mb-3 flex items-center gap-2 text-base font-semibold" style={{ color: 'var(--app-text-primary)' }}>
          {t('notesOptional')}
        </Label>
        <Textarea
          placeholder={t('notesPlaceholder')}
          value={checkIn.notes}
          onChange={(e) => setCheckIn({ ...checkIn, notes: e.target.value })}
          className="rounded-xl min-h-[100px]"
          style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-24">
        <Button variant="outline" onClick={onCancel} className="flex-1 py-5 rounded-xl border-2">Cancel</Button>
        <Button onClick={() => onSave(checkIn)} className="flex-1 py-5 rounded-xl text-white" style={{ background: 'var(--app-accent-gradient)' }}>
          Save Check-in
        </Button>
      </div>
    </motion.div>
  );
}