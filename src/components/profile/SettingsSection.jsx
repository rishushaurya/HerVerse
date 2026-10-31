import React from 'react';
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsSection({ title, items }) {
  return (
    <div className="mb-6">
      <h3
        className="text-sm font-medium uppercase tracking-wider mb-3 px-1"
        style={{ color: 'var(--app-text-muted)' }}
      >
        {title}
      </h3>
      <div
        className="rounded-2xl overflow-hidden border"
        style={{
          background: 'var(--app-card-bg)',
          borderColor: 'var(--app-card-border)',
          boxShadow: 'var(--app-shadow)'
        }}
      >
        {items.map((item, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.98 }}
            onClick={item.onClick}
            className={`w-full flex items-center justify-between p-4 transition-colors ${index !== items.length - 1 ? 'border-b' : ''
              }`}
            style={{
              borderColor: 'var(--app-card-border)'
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconBg || 'bg-gray-100'}`}>
                <item.icon className={`w-5 h-5 ${item.iconColor || 'text-gray-600'}`} />
              </div>
              <div className="text-left">
                <p className="font-medium" style={{ color: 'var(--app-text-primary)' }}>{item.label}</p>
                {item.description && (
                  <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{item.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.value && (
                <span className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{item.value}</span>
              )}
              {item.badge && (
                <span
                  className="px-2 py-0.5 text-xs rounded-full"
                  style={{ background: 'var(--app-badge-bg)', color: 'var(--app-badge-text)' }}
                >
                  {item.badge}
                </span>
              )}
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--app-text-muted)' }} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}