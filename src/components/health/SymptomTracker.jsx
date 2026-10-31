import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Activity, Trash2, HeartPulse, Brain, Utensils, Sparkles, StickyNote } from 'lucide-react';
import { format } from 'date-fns';

const symptomTypes = [
  { value: 'physical', label: 'Physical', icon: HeartPulse, examples: 'Headache, cramps, back pain' },
  { value: 'emotional', label: 'Emotional', icon: Brain, examples: 'Anxiety, mood swings' },
  { value: 'digestive', label: 'Digestive', icon: Utensils, examples: 'Bloating, nausea' },
  { value: 'skin', label: 'Skin', icon: Sparkles, examples: 'Acne, dryness' },
  { value: 'other', label: 'Other', icon: StickyNote, examples: 'Other symptoms' }
];

export default function SymptomTracker({ symptoms = [], onAddSymptom, onDeleteSymptom }) {
  const [showForm, setShowForm] = useState(false);
  const [newSymptom, setNewSymptom] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    symptom_type: 'physical',
    symptom_name: '',
    severity: 3,
    notes: '',
    related_to_cycle: false
  });

  const handleSave = () => {
    if (!newSymptom.symptom_name.trim()) return;
    onAddSymptom(newSymptom);
    setNewSymptom({
      date: format(new Date(), 'yyyy-MM-dd'),
      symptom_type: 'physical',
      symptom_name: '',
      severity: 3,
      notes: '',
      related_to_cycle: false
    });
    setShowForm(false);
  };

  const recentSymptoms = symptoms.slice(0, 10);
  const severityLabels = ['', 'Mild', 'Low', 'Moderate', 'High', 'Severe'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold" style={{ color: 'var(--app-text-primary)' }}>Symptom Tracking</h3>
        <Button onClick={() => setShowForm(!showForm)} variant="outline" className="rounded-xl" style={{ borderColor: 'var(--app-card-border)', color: 'var(--app-text-primary)' }}>
          <Plus className="w-4 h-4 mr-2" /> Log Symptom
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-5 border space-y-4"
            style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
          >
            <div>
              <Label className="mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>Symptom type</Label>
              <Select value={newSymptom.symptom_type} onValueChange={(v) => setNewSymptom({ ...newSymptom, symptom_type: v })}>
                <SelectTrigger className="rounded-xl" style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {symptomTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>What's bothering you?</Label>
              <Input
                placeholder="E.g., Headache, cramping..."
                value={newSymptom.symptom_name}
                onChange={(e) => setNewSymptom({ ...newSymptom, symptom_name: e.target.value })}
                className="rounded-xl"
                style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}
              />
            </div>

            <div>
              <Label className="mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>How severe? (1-5)</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setNewSymptom({ ...newSymptom, severity: level })}
                    className="flex-1 py-3 rounded-xl border-2 text-center transition-all"
                    style={{
                      borderColor: newSymptom.severity === level ? 'var(--app-accent)' : 'var(--app-card-border)',
                      background: newSymptom.severity === level ? 'var(--app-accent-light)' : 'transparent',
                      color: 'var(--app-text-primary)'
                    }}
                  >
                    <span className="text-lg font-bold">{level}</span>
                    <p className="text-xs mt-1" style={{ color: 'var(--app-text-muted)' }}>{severityLabels[level]}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="related_to_cycle"
                checked={newSymptom.related_to_cycle}
                onChange={(e) => setNewSymptom({ ...newSymptom, related_to_cycle: e.target.checked })}
                className="w-4 h-4 rounded accent-rose-500"
              />
              <label htmlFor="related_to_cycle" className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>
                Related to menstrual cycle
              </label>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleSave} className="flex-1 rounded-xl text-white" style={{ background: 'var(--app-accent-gradient)' }}>Save</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {recentSymptoms.length > 0 && (
        <div className="space-y-2">
          {recentSymptoms.map((symptom, index) => {
            const type = symptomTypes.find(t => t.value === symptom.symptom_type);
            return (
              <motion.div
                key={symptom.id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl p-4 border flex items-center justify-between"
                style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
              >
                <div className="flex items-center gap-3">
                  {React.createElement(type?.icon || StickyNote, { className: 'w-5 h-5', style: { color: 'var(--app-accent)' } })}
                  <div>
                    <p className="font-medium" style={{ color: 'var(--app-text-primary)' }}>{symptom.symptom_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{format(new Date(symptom.date), 'MMM d')}</span>
                      <span className="text-xs" style={{ color: 'var(--app-text-muted)' }}>•</span>
                      <span className="text-xs" style={{ color: 'var(--app-text-secondary)' }}>Severity: {symptom.severity}/5</span>
                      {symptom.related_to_cycle && (
                        <>
                          <span className="text-xs" style={{ color: 'var(--app-text-muted)' }}>•</span>
                          <span className="text-xs" style={{ color: 'var(--app-accent)' }}>Cycle-related</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDeleteSymptom(symptom.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}

      {recentSymptoms.length === 0 && !showForm && (
        <div className="rounded-2xl p-8 text-center border" style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}>
          <Activity className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--app-accent)' }} />
          <p style={{ color: 'var(--app-text-secondary)' }}>No symptoms logged yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--app-text-muted)' }}>Track patterns and understand your body better</p>
        </div>
      )}
    </div>
  );
}