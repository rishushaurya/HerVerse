import React, { useRef, useEffect } from 'react';
import { motion } from "framer-motion";
import { format, addDays, isSameDay } from 'date-fns';

export default function CalendarStrip({ selectedDate, onSelectDate, tasks = [] }) {
  const scrollRef = useRef(null);
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i - 7));

  const getTaskCount = (date) => {
    return tasks.filter(t => t.date === format(date, 'yyyy-MM-dd')).length;
  };

  useEffect(() => {
    if (scrollRef.current) {
      const todayElement = scrollRef.current.querySelector('[data-today="true"]');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, []);

  return (
    <div className="rounded-3xl p-4 border" style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {days.map((date) => {
          const isSelected = isSameDay(date, new Date(selectedDate));
          const isToday = isSameDay(date, today);
          const taskCount = getTaskCount(date);

          return (
            <motion.button
              key={date.toISOString()}
              data-today={isToday}
              onClick={() => onSelectDate(format(date, 'yyyy-MM-dd'))}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center min-w-[52px] py-3 px-2 rounded-2xl transition-all"
              style={
                isSelected
                  ? { background: 'var(--app-accent-gradient)', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                  : isToday
                    ? { background: 'var(--app-accent-light)', color: 'var(--app-accent)' }
                    : {}
              }
            >
              <span className="text-xs font-medium" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--app-text-muted)' }}>
                {format(date, 'EEE')}
              </span>
              <span className="text-lg font-bold mt-1" style={{ color: isSelected ? '#fff' : 'var(--app-text-primary)' }}>
                {format(date, 'd')}
              </span>
              {taskCount > 0 && (
                <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: isSelected ? '#fff' : 'var(--app-accent)' }} />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}