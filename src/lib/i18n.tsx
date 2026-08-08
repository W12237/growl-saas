'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Header
    'appName': 'Agency OS',
    'appSub': 'Growl Cloud',
    'searchPlaceholder': 'Search control panel...',
    'switchLang': 'العربية',

    // Nav Sections
    'sec.main': 'Main',
    'sec.work': 'Workspace & Projects',
    'sec.intelligence': 'AI & Intelligence',
    'sec.operations': 'Operations & Finance',
    'sec.system': 'System Administration',

    // Nav Links
    'nav.dashboard': 'Dashboard',
    'nav.crm': 'CRM & Deals',
    'nav.clients': 'Clients',
    'nav.projects': 'Projects',
    'nav.campaigns': 'Campaigns',
    'nav.content': 'Content Engine',
    'nav.approvals': 'Approvals',
    'nav.files': 'File Vault',
    'nav.ai': 'AI Suite',
    'nav.reports': 'Reports & Analytics',
    'nav.finance': 'Financials',
    'nav.team': 'Team & Roles',
    'nav.chat': 'Team Chat',
    'nav.meetings': 'Meetings',
    'nav.automation': 'Automations',
    'nav.settings': 'Settings',

    // Settings Tabs
    'settings.title': 'Settings & System Control',
    'settings.subtitle': 'Manage your profile, team permissions, branding aesthetics, and global system configurations.',
    'settings.tab.profile': 'My Profile',
    'settings.tab.users': 'Users & Roles',
    'settings.tab.appearance': 'Appearance',
    'settings.tab.language': 'Language & Region',
    'settings.tab.security': 'Security',
    
    // Appearance & Language Tab
    'settings.themeMode': 'Theme Mode',
    'settings.darkMode': 'Dark Mode',
    'settings.lightMode': 'Light Mode',
    'settings.systemDefault': 'System Default',
    'settings.accentColor': 'Accent Color',
    'settings.selectLang': 'Primary Language',
    'settings.langEn': 'English (United States)',
    'settings.langAr': 'العربية (Arabic)',
    'settings.save': 'Save Preferences',
    'settings.saving': 'Saving Changes...',

    // AI Suite
    'ai.title': 'AI Suite & Content Engine',
    'ai.subtitle': 'Leverage free AI models to generate high-performing content, social posts, emails, and campaign strategies.',
    'ai.copywriter': 'Smart Copywriter',
    'ai.copywriterDesc': 'Generate engaging copy for ads, social media, and emails in seconds using trained models.',
    'ai.assetGen': 'Asset Generator',
    'ai.assetGenDesc': 'Create custom text prompts and visual asset descriptions for creative campaigns.',
    'ai.analytics': 'Predictive Analytics',
    'ai.analyticsDesc': 'Forecast campaign performance and generate actionable AI tips based on live system metrics.',
    'ai.assistant': 'AI Assistant',
    'ai.promptPlaceholder': 'E.g., Write a 5-day email sequence launching our new SaaS agency solution...',
    'ai.generateBtn': 'Generate Now',
    'ai.generating': 'Generating Content...',
    'ai.savedSuccess': 'Content generated and saved to Database!',
    'ai.ready': 'Ready',

    // Common
    'common.logout': 'Log Out',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.status': 'Status',
    'common.role': 'Role',
    'common.admin': 'Admin',
    'common.member': 'Member',
    'common.actions': 'Actions'
  },
  ar: {
    // Brand & Header
    'appName': 'وكالة جراول',
    'appSub': 'نظام التشغيل الذكي',
    'searchPlaceholder': 'ابحث في لوحة التحكم...',
    'switchLang': 'English',

    // Nav Sections
    'sec.main': 'الرئيسية',
    'sec.work': 'مساحة العمل والمشاريع',
    'sec.intelligence': 'الذكاء الاصطناعي والتحليلات',
    'sec.operations': 'العمليات والمالية',
    'sec.system': 'إدارة النظام',

    // Nav Links
    'nav.dashboard': 'لوحة القيادة',
    'nav.crm': 'إدارة الصفقات (CRM)',
    'nav.clients': 'العملاء',
    'nav.projects': 'المشاريع',
    'nav.campaigns': 'الحملات الإعلانية',
    'nav.content': 'مُنتِج المحتوى',
    'nav.approvals': 'الموافقات',
    'nav.files': 'خزينة الملفات',
    'nav.ai': 'منصة الذكاء الاصطناعي',
    'nav.reports': 'التقارير والتحليلات',
    'nav.finance': 'المالية والفواتير',
    'nav.team': 'الفريق والصلاحيات',
    'nav.chat': 'محادثات الفريق',
    'nav.meetings': 'الاجتماعات',
    'nav.automation': 'الأتمتة والمهام',
    'nav.settings': 'الإعدادات',

    // Settings Tabs
    'settings.title': 'الإعدادات وإدارة النظام',
    'settings.subtitle': 'إدارة ملفك الشخصي، صلاحيات الفريق، مظهر النظام، والإعدادات العامة.',
    'settings.tab.profile': 'ملفي الشخصي',
    'settings.tab.users': 'المستخدمين والصلاحيات',
    'settings.tab.appearance': 'المظهر والألوان',
    'settings.tab.language': 'اللغة والمنطقة',
    'settings.tab.security': 'الأمان',

    // Appearance & Language Tab
    'settings.themeMode': 'وضع المظهر',
    'settings.darkMode': 'الوضع الداكن',
    'settings.lightMode': 'الوضع الفاتح',
    'settings.systemDefault': 'حسب النظام',
    'settings.accentColor': 'اللون المميز',
    'settings.selectLang': 'اللغة الرئيسية',
    'settings.langEn': 'English (الإنجليزية)',
    'settings.langAr': 'العربية (Arabic)',
    'settings.save': 'حفظ التفضيلات',
    'settings.saving': 'جاري الحفظ...',

    // AI Suite
    'ai.title': 'منصة الذكاء الاصطناعي والمحتوى',
    'ai.subtitle': 'استخدم نماذج الذكاء الاصطناعي المجانية لإنشاء محتوى إعلاني وتسويقي وكتابة المقالات واستراتيجيات الحملات.',
    'ai.copywriter': 'كاتب الإعلانات الذكي',
    'ai.copywriterDesc': 'إنشاء نصوص إعلانية ومنشورات وسائط اجتماعية ورسائل بريد إلكتروني في ثوانٍ.',
    'ai.assetGen': 'مولّد الأفكار والصور',
    'ai.assetGenDesc': 'ابتكار وصف بصري وأفكار تصميمية مخصصة للحملات الإبداعية.',
    'ai.analytics': 'التحليلات التنبؤية',
    'ai.analyticsDesc': 'توقع أداء الحملات والحصول على نصائح تحسين بناءً على بيانات النظام.',
    'ai.assistant': 'مساعد الذكاء الاصطناعي',
    'ai.promptPlaceholder': 'مثال: اكتب سلسلة بريد إلكتروني من 5 أجزاء لإطلاق منتج برمجيات جديد تستهدف مدير التسويق...',
    'ai.generateBtn': 'إنشاء الآن',
    'ai.generating': 'جاري إنشاء المحتوى...',
    'ai.savedSuccess': 'تم إنشاء المحتوى وحفظه في قاعدة البيانات بنجاح!',
    'ai.ready': 'جاهز',

    // Common
    'common.logout': 'تسجيل الخروج',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.status': 'الحالة',
    'common.role': 'الدور',
    'common.admin': 'مسؤول',
    'common.member': 'عضو',
    'common.actions': 'الإجراءات'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  direction: 'ltr',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = (localStorage.getItem('agency_language') as Language) || 'en';
    setLanguageState(savedLang);
    applyLanguageSettings(savedLang);

    const handleSync = () => {
      const currentSaved = (localStorage.getItem('agency_language') as Language) || 'en';
      setLanguageState(currentSaved);
      applyLanguageSettings(currentSaved);
    };

    window.addEventListener('language-changed', handleSync);
    window.addEventListener('theme-changed', handleSync);

    return () => {
      window.removeEventListener('language-changed', handleSync);
      window.removeEventListener('theme-changed', handleSync);
    };
  }, []);

  const applyLanguageSettings = (lang: Language) => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('agency_language', lang);
    applyLanguageSettings(lang);
    window.dispatchEvent(new Event('language-changed'));
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
