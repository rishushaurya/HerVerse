import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';

import MobileNav from '@/components/common/MobileNav';
import SOSButton from '@/components/common/SOSButton';
import CalendarStrip from '@/components/planner/CalendarStrip';
import TaskCard from '@/components/planner/TaskCard';
import AddTaskModal from '@/components/planner/AddTaskModal';

export default function Planner() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-date', 100)
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: () => base44.entities.EmergencyContact.list()
  });

  const dayTasks = allTasks.filter(t => t.date === selectedDate);

  const createTaskMutation = useMutation({
    mutationFn: (task) => base44.entities.Task.create(task),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); setIsModalOpen(false); }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); setEditTask(null); setIsModalOpen(false); }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const handleSaveTask = (taskData) => {
    if (editTask) {
      updateTaskMutation.mutate({ id: editTask.id, data: taskData });
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const handleCompleteTask = (id) => {
    const task = allTasks.find(t => t.id === id);
    if (task) {
      updateTaskMutation.mutate({ id, data: { status: task.status === 'completed' ? 'pending' : 'completed' } });
    }
  };

  const handleEditTask = (task) => { setEditTask(task); setIsModalOpen(true); };
  const pendingTasks = dayTasks.filter(t => t.status !== 'completed');
  const completedTasks = dayTasks.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300" style={{ background: 'var(--app-bg-gradient)', color: 'var(--app-text-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--app-text-primary)' }}>{t('planner')}</h1>
            <p className="mt-1" style={{ color: 'var(--app-text-secondary)' }}>{format(new Date(selectedDate), 'EEEE, MMMM d')}</p>
          </div>
          <Button
            onClick={() => { setEditTask(null); setIsModalOpen(true); }}
            className="w-12 h-12 rounded-2xl shadow-lg text-white"
            style={{ background: 'var(--app-accent-gradient)' }}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>

      {/* Calendar Strip */}
      <div className="px-5 mb-4">
        <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} tasks={allTasks} />
      </div>

      {/* Tasks List */}
      <div className="px-5 space-y-4">
        {pendingTasks.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--app-text-secondary)' }}>
              {pendingTasks.length} {t('tasksToDo')}
            </p>
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {pendingTasks.sort((a, b) => (a.time || '').localeCompare(b.time || '')).map((task) => (
                  <TaskCard key={task.id} task={task} onComplete={handleCompleteTask} onEdit={handleEditTask} onDelete={(id) => deleteTaskMutation.mutate(id)} />
                ))}
              </div>
            </AnimatePresence>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="pt-4">
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--app-text-muted)' }}>
              ✓ {t('completed')} ({completedTasks.length})
            </p>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} onComplete={handleCompleteTask} onEdit={handleEditTask} onDelete={(id) => deleteTaskMutation.mutate(id)} />
              ))}
            </div>
          </div>
        )}

        {dayTasks.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--app-accent-light)' }}>
              <CalendarIcon className="w-10 h-10" style={{ color: 'var(--app-accent)' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--app-text-primary)' }}>{t('noTasksToday')}</h3>
            <p className="mb-6" style={{ color: 'var(--app-text-muted)' }}>{t('enjoyFreeTime')}</p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="rounded-xl border-2"
              style={{ borderColor: 'var(--app-accent)', color: 'var(--app-accent)' }}
            >
              <Plus className="w-4 h-4 mr-2" /> {t('addTask')}
            </Button>
          </motion.div>
        )}
      </div>

      <AddTaskModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditTask(null); }} onSave={handleSaveTask} editTask={editTask} selectedDate={selectedDate} />
      <SOSButton contacts={contacts} onAddContact={async (contactData) => { await base44.entities.EmergencyContact.create(contactData); queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] }); }} />
      <MobileNav currentPage="Planner" />
    </div>
  );
}