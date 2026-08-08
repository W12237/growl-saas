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

    // Dashboard Page
    'dash.title': 'Agency Executive Overview',
    'dash.subtitle': 'Real-time performance, active revenue, client metrics, and operational health.',
    'dash.revenue': 'Total Revenue',
    'dash.clients': 'Active Clients',
    'dash.profit': 'Net Profit',
    'dash.tasks': 'Tasks Due',
    'dash.campaignPerf': 'Campaign Revenue Growth',
    'dash.activities': 'Recent System Activity',
    'dash.meetings': 'Upcoming Meetings',
    'dash.teamProd': 'Team Productivity',

    // CRM
    'crm.title': 'Deal Pipeline & CRM',
    'crm.subtitle': 'Track prospective clients, deal stages, contract values, and conversion probabilities.',
    'crm.addLead': 'New Deal',
    'crm.stage.lead': 'Lead Inbound',
    'crm.stage.prospect': 'Qualified Prospect',
    'crm.stage.meeting': 'Discovery Meeting',
    'crm.stage.proposal': 'Proposal Sent',
    'crm.stage.closed': 'Closed Won',

    // Clients
    'clients.title': 'Client Management',
    'clients.subtitle': 'Active retainers, client health indicators, key contacts, and onboarding status.',
    'clients.addClient': 'Add Client',
    'clients.health.good': 'Excellent Health',
    'clients.health.atRisk': 'Needs Attention',
    'clients.retainer': 'Monthly Retainer',

    // Projects
    'projects.title': 'Project Hub',
    'projects.subtitle': 'Monitor ongoing project deliverables, deadlines, progress tracking, and assigned teams.',
    'projects.newProject': 'Create Project',
    'projects.status.active': 'Active',
    'projects.status.planning': 'Planning',
    'projects.status.completed': 'Completed',

    // Campaigns
    'campaigns.title': 'Marketing Campaigns',
    'campaigns.subtitle': 'Manage multi-channel campaigns, ad spend, conversion goals, and ROI metrics.',
    'campaigns.newCampaign': 'Launch Campaign',

    // Content Engine
    'content.title': 'Content Production',
    'content.subtitle': 'Draft, schedule, and publish multi-platform content assets across digital channels.',
    'content.newPost': 'Create Post',

    // Approvals
    'approvals.title': 'Approval Workflows',
    'approvals.subtitle': 'Client and management approval requests for creative assets, budgets, and milestones.',
    'approvals.pending': 'Pending Review',
    'approvals.approved': 'Approved',
    'approvals.rejected': 'Rejected',

    // Files
    'files.title': 'Asset Vault & Files',
    'files.subtitle': 'Secure cloud file storage for agency brand assets, legal contracts, and media files.',
    'files.upload': 'Upload Asset',

    // Reports
    'reports.title': 'Analytics & Reports',
    'reports.subtitle': 'Executive performance analytics, campaign ROI reports, and custom data exports.',
    'reports.generate': 'Generate Report',

    // Finance
    'finance.title': 'Financial Management',
    'finance.subtitle': 'Track income, software expenses, client invoices, and profit margins.',
    'finance.newInvoice': 'New Invoice',

    // Team
    'team.title': 'Team & Permissions',
    'team.subtitle': 'Manage agency staff accounts, assign system roles, and configure policy permissions.',
    'team.addMember': 'Add Team Member',

    // Chat
    'chat.title': 'Team Chat & DMs',
    'chat.subtitle': 'Real-time team messaging, project channels, and direct communication.',

    // Meetings
    'meetings.title': 'Meeting Schedule',
    'meetings.subtitle': 'Upcoming client calls, team syncs, and automated AI meeting summaries.',
    'meetings.schedule': 'Schedule Meeting',

    // Automation
    'meetings.automationTitle': 'Workflow Automations',
    'meetings.automationSubtitle': 'Automate lead follow-ups, invoice reminders, and project status triggers.',

    // Settings
    'settings.title': 'Settings & System Control',
    'settings.subtitle': 'Manage your profile, team permissions, branding aesthetics, and global system configurations.',
    'settings.tab.profile': 'My Profile',
    'settings.tab.users': 'Users & Roles',
    'settings.tab.appearance': 'Appearance',
    'settings.tab.language': 'Language & Region',
    'settings.tab.security': 'Security',
    'settings.themeMode': 'Theme Mode',
    'settings.darkMode': 'Dark Mode',
    'settings.lightMode': 'Light Mode',
    'settings.systemDefault': 'System Default',
    'settings.accentColor': 'Accent Color',
    'settings.selectLang': 'Primary Language',
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
    'common.actions': 'Actions',
    'common.noData': 'No records found in database.'
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

    // Dashboard Page
    'dash.title': 'الملخص التنفيذي للوكالة',
    'dash.subtitle': 'الأداء في الوقت الفعلي، الإيرادات النشطة، مقاييس العملاء، والصحة التشغيلية.',
    'dash.revenue': 'إجمالي الإيرادات',
    'dash.clients': 'العملاء النشطون',
    'dash.profit': 'صافي الأرباح',
    'dash.tasks': 'المهام المستحقة',
    'dash.campaignPerf': 'نمو إيرادات الحملات',
    'dash.activities': 'نشاط النظام الأخير',
    'dash.meetings': 'الاجتماعات القادمة',
    'dash.teamProd': 'إنتاجية الفريق',

    // CRM
    'crm.title': 'خط الصفقات وإدارة العملاء',
    'crm.subtitle': 'متابعة العملاء المحتملين، مراحل الصفقات، قيم العقود، واحتمالات الإغلاق.',
    'crm.addLead': 'صفقة جديدة',
    'crm.stage.lead': 'عميل محتمل جديد',
    'crm.stage.prospect': 'مؤهل للتفاوض',
    'crm.stage.meeting': 'اجتماع الاستكشاف',
    'crm.stage.proposal': 'تم إرسال العرض',
    'crm.stage.closed': 'صفقة ناجحة',

    // Clients
    'clients.title': 'إدارة العملاء',
    'clients.subtitle': 'العقود الشهرية، مؤشرات صحة العملاء، جهات الاتصال الرئيسية، وحالة التهيئة.',
    'clients.addClient': 'إضافة عميل',
    'clients.health.good': 'حالة ممتازة',
    'clients.health.atRisk': 'يحتاج متابعة',
    'clients.retainer': 'العقد الشهري',

    // Projects
    'projects.title': 'مركز المشاريع',
    'projects.subtitle': 'مراقبة تسليمات المشاريع، المواعيد النهائية، تتبع التقدم، والفرق المعينة.',
    'projects.newProject': 'مشروع جديد',
    'projects.status.active': 'نشط',
    'projects.status.planning': 'قيد التخطيط',
    'projects.status.completed': 'مكتمل',

    // Campaigns
    'campaigns.title': 'الحملات التسويقية',
    'campaigns.subtitle': 'إدارة الحملات عبر المنصات، الميزانية، أهداف التحويل، ومقاييس عائد الاستثمار.',
    'campaigns.newCampaign': 'إطلاق حملة',

    // Content Engine
    'content.title': 'إنتاج المحتوى',
    'content.subtitle': 'صياغة وجدولة ونشر الأصول الرقمية والمحتوى عبر مختلف القنوات.',
    'content.newPost': 'منشور جديد',

    // Approvals
    'approvals.title': 'مسارات الموافقات',
    'approvals.subtitle': 'طلبات موافقة العملاء والإدارة على التصاميم، الميزانيات، والمراحل.',
    'approvals.pending': 'قيد المراجعة',
    'approvals.approved': 'مقبول',
    'approvals.rejected': 'مرفوض',

    // Files
    'files.title': 'خزينة الأصول والملفات',
    'files.subtitle': 'تخزين سحابي آمن لأصول الهوية البصرية، العقود القانونية، وملفات الميديا.',
    'files.upload': 'رفع ملف',

    // Reports
    'reports.title': 'التقارير والتحليلات',
    'reports.subtitle': 'تحليلات الأداء التنفيذي، تقارير عائد الاستثمار، وتصدير البيانات.',
    'reports.generate': 'إنشاء تقرير',

    // Finance
    'finance.title': 'الإدارة المالية',
    'finance.subtitle': 'تتبع الإيرادات، المصروفات البرمجية، فواتير العملاء، وهامش الربح.',
    'finance.newInvoice': 'فاتورة جديدة',

    // Team
    'team.title': 'الفريق والصلاحيات',
    'team.subtitle': 'إدارة حسابات موظفي الوكالة، تعيين الأدوار، وتكوين سياسات الأمان.',
    'team.addMember': 'إضافة عضو',

    // Chat
    'chat.title': 'محادثات الفريق',
    'chat.subtitle': 'التواصل الفوري بين أعضاء الفريق، قنوات المشاريع، والرسائل المباشرة.',

    // Meetings
    'meetings.title': 'جدول الاجتماعات',
    'meetings.subtitle': 'مكالمات العملاء القادمة، مزامنة الفريق، وملخصات الاجتماعات الذكية.',
    'meetings.schedule': 'جدولة اجتماع',

    // Automation
    'meetings.automationTitle': 'أتمتة سير العمل',
    'meetings.automationSubtitle': 'أتمتة متابعة العملاء المحتملين، تذكيرات الفواتير، ومحفزات المشاريع.',

    // Settings
    'settings.title': 'الإعدادات وإدارة النظام',
    'settings.subtitle': 'إدارة ملفك الشخصي، صلاحيات الفريق، مظهر النظام، والإعدادات العامة.',
    'settings.tab.profile': 'ملفي الشخصي',
    'settings.tab.users': 'المستخدمين والصلاحيات',
    'settings.tab.appearance': 'المظهر والألوان',
    'settings.tab.language': 'اللغة والمنطقة',
    'settings.tab.security': 'الأمان',
    'settings.themeMode': 'وضع المظهر',
    'settings.darkMode': 'الوضع الداكن',
    'settings.lightMode': 'الوضع الفاتح',
    'settings.systemDefault': 'حسب النظام',
    'settings.accentColor': 'اللون المميز',
    'settings.selectLang': 'اللغة الرئيسية',
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
    'common.actions': 'الإجراءات',
    'common.noData': 'لا توجد بيانات مسجلة في قاعدة البيانات.'
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
