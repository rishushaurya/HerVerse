import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Dumbbell, Trash2, Flower2, Footprints, Activity, Music, Waves, Bike, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const activities = [
  { value: 'yoga', label: 'Yoga', icon: Flower2 },
  { value: 'walking', label: 'Walking', icon: Footprints },
  { value: 'running', label: 'Running', icon: Activity },
  { value: 'gym', label: 'Gym', icon: Dumbbell },
  { value: 'dance', label: 'Dance', icon: Music },
  { value: 'swimming', label: 'Swimming', icon: Waves },
  { value: 'cycling', label: 'Cycling', icon: Bike },
  { value: 'other', label: 'Other', icon: Sparkles }
];

export default function ExerciseLogger({ exercises = [], onAddExercise, onDeleteExercise }) {
  const [showForm, setShowForm] = useState(false);
  const [newExercise, setNewExercise] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    activity_type: 'yoga',
    duration: '',
    intensity: 'moderate',
    notes: ''
  });

  const handleSave = () => {
    if (!newExercise.duration) return;
    onAddExercise(newExercise);
    setNewExercise({ date: format(new Date(), 'yyyy-MM-dd'), activity_type: 'yoga', duration: '', intensity: 'moderate', notes: '' });
    setShowForm(false);
  };

  const recentExercises = exercises.slice(0, 7);
  const totalMinutes = exercises
    .filter(e => e.date >= format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'))
    .reduce((sum, e) => sum + (parseInt(e.duration) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Weekly Summary */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--app-accent-gradient)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">This week</p>
            <p className="text-2xl font-bold text-white">{totalMinutes} min</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold" style={{ color: 'var(--app-text-primary)' }}>Exercise Log</h3>
        <Button onClick={() => setShowForm(!showForm)} variant="outline" className="rounded-xl" style={{ borderColor: 'var(--app-card-border)', color: 'var(--app-text-primary)' }}>
          <Plus className="w-4 h-4 mr-2" /> Log Activity
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>Activity</Label>
                <Select value={newExercise.activity_type} onValueChange={(v) => setNewExercise({ ...newExercise, activity_type: v })}>
                  <SelectTrigger className="rounded-xl" style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map((activity) => (
                      <SelectItem key={activity.value} value={activity.value}>{activity.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>Duration (min)</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={newExercise.duration}
                  onChange={(e) => setNewExercise({ ...newExercise, duration: e.target.value })}
                  className="rounded-xl"
                  style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>Intensity</Label>
              <div className="flex gap-2">
                {['light', 'moderate', 'intense'].map((intensity) => (
                  <button
                    key={intensity}
                    onClick={() => setNewExercise({ ...newExercise, intensity })}
                    className="flex-1 py-2 rounded-xl border-2 text-sm capitalize"
                    style={{
                      borderColor: newExercise.intensity === intensity ? 'var(--app-accent)' : 'var(--app-card-border)',
                      background: newExercise.intensity === intensity ? 'var(--app-accent-light)' : 'transparent',
                      color: 'var(--app-text-primary)'
                    }}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleSave} className="flex-1 rounded-xl text-white" style={{ background: 'var(--app-accent-gradient)' }}>Save</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {recentExercises.length > 0 && (
        <div className="space-y-2">
          {recentExercises.map((exercise, index) => {
            const activity = activities.find(a => a.value === exercise.activity_type);
            return (
              <motion.div
                key={exercise.id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl p-4 border flex items-center justify-between"
                style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
              >
                <div className="flex items-center gap-3">
                  {React.createElement(activity?.icon || Sparkles, { className: 'w-6 h-6', style: { color: 'var(--app-accent)' } })}
                  <div>
                    <p className="font-medium" style={{ color: 'var(--app-text-primary)' }}>{activity?.label || exercise.activity_type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{format(new Date(exercise.date), 'MMM d')}</span>
                      <span className="text-xs" style={{ color: 'var(--app-text-muted)' }}>•</span>
                      <span className="text-xs" style={{ color: 'var(--app-text-secondary)' }}>{exercise.duration} min</span>
                      <span className="text-xs" style={{ color: 'var(--app-text-muted)' }}>•</span>
                      <span className="text-xs capitalize" style={{ color: 'var(--app-text-secondary)' }}>{exercise.intensity}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDeleteExercise(exercise.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}