import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Flag, Tag, FileText } from "lucide-react";
import { format } from 'date-fns';
import { useLanguage } from '@/lib/LanguageContext';

export default function AddTaskModal({ isOpen, onClose, onSave, editTask, selectedDate }) {
  const { t } = useLanguage();
  const [task, setTask] = useState({
    title: '', date: format(new Date(), 'yyyy-MM-dd'), time: '', duration: '',
    notes: '', priority: 'normal', category: 'personal', status: 'pending'
  });

  useEffect(() => {
    if (editTask) {
      setTask(editTask);
    } else {
      setTask({
        title: '', date: selectedDate || format(new Date(), 'yyyy-MM-dd'), time: '', duration: '',
        notes: '', priority: 'normal', category: 'personal', status: 'pending'
      });
    }
  }, [editTask, selectedDate, isOpen]);

  const handleSave = () => {
    if (!task.title.trim()) return;
    onSave(task);
    // Reset for next task
    setTask({
      title: '', date: selectedDate || format(new Date(), 'yyyy-MM-dd'), time: '', duration: '',
      notes: '', priority: 'normal', category: 'personal', status: 'pending'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-3xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--app-modal-bg, var(--app-card-bg))', color: 'var(--app-text-primary)' }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold" style={{ color: 'var(--app-text-primary)' }}>
            {editTask ? t('editTask') : t('addNewTask')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-2">
          <div>
            <Label className="mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>{t('whatToDo')}</Label>
            <Input
              placeholder={t('enterTaskTitle')}
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="rounded-xl py-5"
              style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-2 flex items-center gap-2" style={{ color: 'var(--app-text-secondary)' }}>
                <Calendar className="w-4 h-4" style={{ color: 'var(--app-accent)' }} /> {t('date')}
              </Label>
              <Input
                type="date"
                value={task.date}
                onChange={(e) => setTask({ ...task, date: e.target.value })}
                className="rounded-xl"
                style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}
              />
            </div>
            <div>
              <Label className="mb-2 flex items-center gap-2" style={{ color: 'var(--app-text-secondary)' }}>
                <Clock className="w-4 h-4" style={{ color: 'var(--app-accent-secondary, var(--app-accent))' }} /> {t('time')}
              </Label>
              <Input
                type="time"
                value={task.time}
                onChange={(e) => setTask({ ...task, time: e.target.value })}
                className="rounded-xl"
                style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>{t('durationMin')}</Label>
            <Input
              type="number"
              placeholder="30"
              value={task.duration}
              onChange={(e) => setTask({ ...task, duration: e.target.value })}
              className="rounded-xl"
              style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-2 flex items-center gap-2" style={{ color: 'var(--app-text-secondary)' }}>
                <Flag className="w-4 h-4" style={{ color: 'var(--app-accent)' }} /> {t('priority')}
              </Label>
              <Select value={task.priority} onValueChange={(v) => setTask({ ...task, priority: v })}>
                <SelectTrigger className="rounded-xl" style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('low')}</SelectItem>
                  <SelectItem value="normal">{t('normal')}</SelectItem>
                  <SelectItem value="high">{t('high')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 flex items-center gap-2" style={{ color: 'var(--app-text-secondary)' }}>
                <Tag className="w-4 h-4" style={{ color: 'var(--app-accent)' }} /> {t('category')}
              </Label>
              <Select value={task.category} onValueChange={(v) => setTask({ ...task, category: v })}>
                <SelectTrigger className="rounded-xl" style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">{t('personal')}</SelectItem>
                  <SelectItem value="work">{t('work')}</SelectItem>
                  <SelectItem value="health">{t('health')}</SelectItem>
                  <SelectItem value="self-care">{t('selfCare')}</SelectItem>
                  <SelectItem value="other">{t('other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-2" style={{ color: 'var(--app-text-secondary)' }}>
              <FileText className="w-4 h-4" style={{ color: 'var(--app-text-muted)' }} /> {t('notes')}
            </Label>
            <Textarea
              placeholder={t('addNotes')}
              value={task.notes}
              onChange={(e) => setTask({ ...task, notes: e.target.value })}
              className="rounded-xl min-h-[80px]"
              style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 py-5 rounded-xl border-2">
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!task.title.trim()}
              className="flex-1 py-5 rounded-xl text-white"
              style={{ background: 'var(--app-accent-gradient)' }}
            >
              {editTask ? t('saveChanges') : t('addTask')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}