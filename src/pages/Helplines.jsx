import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, Shield, Heart, AlertCircle, Users, Scale, Baby } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';
import MobileNav from '@/components/common/MobileNav';

export default function Helplines() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t } = useLanguage();

  const helplines = [
    { name: t('hl_women_title'), number: "1091", description: t('hl_women_desc'), category: "emergency", icon: Shield, color: "rose" },
    { name: t('hl_emergency_title'), number: "112", description: t('hl_emergency_desc'), category: "emergency", icon: AlertCircle, color: "red" },
    { name: t('hl_police_title'), number: "100", description: t('hl_police_desc'), category: "emergency", icon: Shield, color: "blue" },
    { name: t('hl_ambulance_title'), number: "102", description: t('hl_ambulance_desc'), category: "medical", icon: Heart, color: "green" },
    { name: t('hl_ncw_title'), number: "7827-170-170", description: t('hl_ncw_desc'), category: "legal", icon: Scale, color: "purple" },
    { name: t('hl_domestic_title'), number: "181", description: t('hl_domestic_desc'), category: "support", icon: Heart, color: "pink" },
    { name: t('hl_mental_title'), number: "1800-599-0019", description: t('hl_mental_desc'), category: "mental", icon: Heart, color: "purple" },
    { name: t('hl_child_title'), number: "1098", description: t('hl_child_desc'), category: "childcare", icon: Baby, color: "amber" },
    { name: t('hl_senior_title'), number: "14567", description: t('hl_senior_desc'), category: "support", icon: Users, color: "indigo" },
    { name: t('hl_cyber_title'), number: "1930", description: t('hl_cyber_desc'), category: "legal", icon: Shield, color: "red" },
    { name: t('hl_student_title'), number: "8448-440-632", description: t('hl_student_desc'), category: "education", icon: Users, color: "blue" },
    { name: t('hl_railway_title'), number: "182", description: t('hl_railway_desc'), category: "safety", icon: Shield, color: "orange" }
  ];

  const categories = [
    { value: 'all', label: t('cat_all') },
    { value: 'emergency', label: t('cat_emergency') },
    { value: 'medical', label: t('cat_medical') },
    { value: 'legal', label: t('cat_legal') },
    { value: 'support', label: t('cat_support') },
    { value: 'mental', label: t('cat_mental') }
  ];

  const filteredHelplines = helplines.filter(helpline => {
    const matchesSearch = helpline.name.toLowerCase().includes(searchTerm.toLowerCase()) || helpline.description.toLowerCase().includes(searchTerm.toLowerCase()) || helpline.number.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || helpline.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300" style={{ background: 'var(--app-bg-gradient)', color: 'var(--app-text-primary)' }}>
      <div className="px-5 pt-12 pb-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--app-text-primary)' }}>{t('helplinesTitle')}</h1>
          <p className="mt-1" style={{ color: 'var(--app-text-secondary)' }}>{t('helpIsAvailable')}</p>
        </motion.div>
      </div>

      <div className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-muted)' }} />
          <Input
            placeholder={t('searchHelplines')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-6 rounded-2xl"
            style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)', boxShadow: 'var(--app-shadow)' }}
          />
        </div>
      </div>

      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className="px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium border"
              style={selectedCategory === cat.value
                ? { background: 'var(--app-accent-gradient)', color: '#fff', border: 'none' }
                : { background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', color: 'var(--app-text-secondary)' }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="px-5 mb-4">
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{t('inImmediateDanger')}</p>
              <p className="text-sm text-gray-600">{t('callRightAway')}</p>
            </div>
            <Button onClick={() => window.open('tel:112')} className="bg-red-500 hover:bg-red-600 rounded-xl text-white">
              Call 112
            </Button>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {filteredHelplines.map((helpline, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="rounded-2xl p-4 border hover:shadow-md transition-all"
            style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--app-accent-light)' }}>
                <helpline.icon className="w-6 h-6" style={{ color: 'var(--app-accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1" style={{ color: 'var(--app-text-primary)' }}>{helpline.name}</h3>
                <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--app-text-secondary)' }}>{helpline.description}</p>
                <span className="font-mono font-bold text-lg" style={{ color: 'var(--app-text-primary)' }}>{helpline.number}</span>
              </div>
              <Button
                onClick={() => window.open(`tel:${helpline.number}`)}
                className="rounded-xl h-10 w-10 p-0 text-white"
                style={{ background: 'var(--app-accent-gradient)' }}
              >
                <Phone className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredHelplines.length === 0 && (
        <div className="text-center py-12 px-5">
          <p style={{ color: 'var(--app-text-muted)' }}>No helplines found matching your search</p>
        </div>
      )}

      <MobileNav currentPage="Helplines" />
    </div>
  );
}