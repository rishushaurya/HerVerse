import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Baby, BookOpen, Building2, Flame, GraduationCap, Home, ShieldCheck, Users, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/LanguageContext';
import MobileNav from '@/components/common/MobileNav';

export default function GovernmentSchemes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { t } = useLanguage();

  const schemes = [
    { title: t('scheme_bbbp_title'), description: t('scheme_bbbp_desc'), category: "education", ministry: "Ministry of Women and Child Development", link: "https://wcd.nic.in/bbbp-schemes", icon: GraduationCap, benefits: ["Education support", "Awareness campaigns", "Financial assistance"] },
    { title: t('scheme_ssy_title'), description: t('scheme_ssy_desc'), category: "financial", ministry: "Ministry of Finance", link: "https://www.indiapost.gov.in/Financial/Pages/Content/Sukanya-Samriddhi-Account.aspx", icon: Wallet, benefits: ["High interest rate", "Tax benefits", "Secure future"] },
    { title: t('scheme_pmmvy_title'), description: t('scheme_pmmvy_desc'), category: "health", ministry: "Ministry of Women and Child Development", link: "https://pmmvy.wcd.gov.in/", icon: Baby, benefits: ["₹5000 cash benefit", "Health support", "Nutrition assistance"] },
    { title: t('scheme_msk_title'), description: t('scheme_msk_desc'), category: "empowerment", ministry: "Ministry of Women and Child Development", link: "https://wcd.nic.in/schemes/mahila-shakti-kendra", icon: Users, benefits: ["Skill training", "Community support", "Leadership development"] },
    { title: t('scheme_sui_title'), description: t('scheme_sui_desc'), category: "employment", ministry: "Ministry of Finance", link: "https://www.standupmitra.in/", icon: Building2, benefits: ["₹10 lakh to ₹1 crore loan", "Business support", "Entrepreneurship"] },
    { title: t('scheme_wwh_title'), description: t('scheme_wwh_desc'), category: "housing", ministry: "Ministry of Women and Child Development", link: "https://wcd.nic.in/schemes/working-women-hostel", icon: Home, benefits: ["Safe accommodation", "Affordable rates", "Day care facilities"] },
    { title: t('scheme_osc_title'), description: t('scheme_osc_desc'), category: "safety", ministry: "Ministry of Women and Child Development", link: "https://wcd.nic.in/schemes/one-stop-centre-scheme-1", icon: ShieldCheck, benefits: ["Legal aid", "Counseling", "Medical assistance", "Shelter"] },
    { title: t('scheme_pmuy_title'), description: t('scheme_pmuy_desc'), category: "welfare", ministry: "Ministry of Petroleum & Natural Gas", link: "https://www.pmuy.gov.in/", icon: Flame, benefits: ["Free LPG connection", "EMI facility", "Health benefits"] },
    { title: t('scheme_ncs_title'), description: t('scheme_ncs_desc'), category: "childcare", ministry: "Ministry of Women and Child Development", link: "https://wcd.nic.in/schemes/national-creche-scheme", icon: Baby, benefits: ["Childcare support", "Affordable rates", "Safe environment"] },
    { title: t('scheme_step_title'), description: t('scheme_step_desc'), category: "employment", ministry: "Ministry of Women and Child Development", link: "https://wcd.nic.in/schemes/support-training-and-employment-programme-women-step", icon: BookOpen, benefits: ["Skill training", "Employment support", "Financial independence"] }
  ];

  const categories = [
    { value: 'all', label: t('cat_all') },
    { value: 'health', label: t('cat_health') },
    { value: 'education', label: t('cat_education') },
    { value: 'employment', label: t('cat_employment') },
    { value: 'financial', label: t('cat_financial') },
    { value: 'safety', label: t('cat_safety') }
  ];

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) || scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || scheme.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300" style={{ background: 'var(--app-bg-gradient)', color: 'var(--app-text-primary)' }}>
      <div className="px-5 pt-12 pb-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--app-text-primary)' }}>{t('governmentSchemesTitle')}</h1>
          <p className="mt-1" style={{ color: 'var(--app-text-secondary)' }}>{t('yourRightsAndBenefits')}</p>
        </motion.div>
      </div>

      <div className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-text-muted)' }} />
          <Input
            placeholder={t('searchSchemes')}
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
              onClick={() => setActiveCategory(cat.value)}
              className="px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium border"
              style={activeCategory === cat.value
                ? { background: 'var(--app-accent-gradient)', color: '#fff', border: 'none' }
                : { background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', color: 'var(--app-text-secondary)' }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {filteredSchemes.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: 'var(--app-text-muted)' }}>No schemes found matching your search</p>
          </div>
        ) : (
          filteredSchemes.map((scheme, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl p-5 border hover:shadow-md transition-all"
              style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', boxShadow: 'var(--app-shadow)' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'var(--app-accent-light)' }}>
                  <scheme.icon className="w-6 h-6" style={{ color: 'var(--app-accent)' }} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--app-text-primary)' }}>{scheme.title}</h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--app-text-secondary)' }}>{scheme.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {scheme.benefits.map((benefit, i) => (
                      <span key={i} className="px-2 py-1 text-xs rounded-lg" style={{ background: 'var(--app-badge-bg)', color: 'var(--app-badge-text)' }}>
                        ✓ {benefit}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--app-text-muted)' }}>{scheme.ministry}</p>
                  <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--app-accent)' }}>
                    {t('learnMore')} <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <MobileNav currentPage="GovernmentSchemes" />
    </div>
  );
}