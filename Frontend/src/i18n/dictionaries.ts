/**
 * Translation dictionaries.
 *
 * Every user-facing string lives here so the platform can serve English and
 * Hindi (and later regional languages) without touching components. Keys are
 * dot-namespaced by area.
 */
export const en = {
  "nav.home": "Home",
  "nav.courses": "Courses",
  "nav.programmes": "Programmes",
  "nav.about": "About",
  "nav.dashboard": "Dashboard",
  "nav.myCourses": "My Courses",
  "nav.competency": "My Competencies",
  "nav.gaps": "Skill Gaps",
  "nav.paths": "Learning Paths",
  "nav.assessments": "Assessments",
  "nav.labs": "Virtual Labs",
  "nav.certificates": "Certificates",
  "nav.assistant": "AI Assistant",
  "nav.workforce": "Workforce",
  "nav.analytics": "Analytics",
  "nav.reports": "Reports",
  "nav.studio": "Assessment Studio",
  "nav.integrations": "Integrations",
  "nav.apiRegistry": "API Registry",
  "nav.audit": "Audit Log",
  "nav.notifications": "Notifications",
  "nav.profile": "Profile",

  "action.signIn": "Sign in",
  "action.signOut": "Sign out",
  "action.getStarted": "Get started",
  "action.explore": "Explore courses",
  "action.retry": "Try again",
  "action.viewAll": "View all",
  "action.enrol": "Enrol",
  "action.resume": "Resume",
  "action.search": "Search",
  "action.filter": "Filter",
  "action.clear": "Clear",

  "common.loading": "Loading",
  "common.error": "Something went wrong",
  "common.empty": "Nothing here yet",
  "common.of": "of",
  "common.hours": "hours",
  "common.minutes": "minutes",

  "competency.current": "Current level",
  "competency.required": "Required level",
  "competency.gap": "Gap",
  "competency.confidence": "Confidence",
  "competency.evidence": "Evidence",

  "role.employee": "Employee / Official",
  "role.administrator": "Administrator",
  "role.engineer": "Engineer / Developer",
} as const;

export type TranslationKey = keyof typeof en;

export const hi: Record<TranslationKey, string> = {
  "nav.home": "मुख्य पृष्ठ",
  "nav.courses": "पाठ्यक्रम",
  "nav.programmes": "प्रशिक्षण कार्यक्रम",
  "nav.about": "हमारे बारे में",
  "nav.dashboard": "डैशबोर्ड",
  "nav.myCourses": "मेरे पाठ्यक्रम",
  "nav.competency": "मेरी दक्षताएँ",
  "nav.gaps": "कौशल अंतर",
  "nav.paths": "अधिगम पथ",
  "nav.assessments": "मूल्यांकन",
  "nav.labs": "वर्चुअल लैब",
  "nav.certificates": "प्रमाण पत्र",
  "nav.assistant": "एआई सहायक",
  "nav.workforce": "कार्यबल",
  "nav.analytics": "विश्लेषण",
  "nav.reports": "रिपोर्ट",
  "nav.studio": "मूल्यांकन स्टूडियो",
  "nav.integrations": "एकीकरण",
  "nav.apiRegistry": "एपीआई रजिस्ट्री",
  "nav.audit": "ऑडिट लॉग",
  "nav.notifications": "सूचनाएँ",
  "nav.profile": "प्रोफ़ाइल",

  "action.signIn": "साइन इन करें",
  "action.signOut": "साइन आउट करें",
  "action.getStarted": "शुरू करें",
  "action.explore": "पाठ्यक्रम देखें",
  "action.retry": "पुनः प्रयास करें",
  "action.viewAll": "सभी देखें",
  "action.enrol": "नामांकन करें",
  "action.resume": "जारी रखें",
  "action.search": "खोजें",
  "action.filter": "फ़िल्टर",
  "action.clear": "साफ़ करें",

  "common.loading": "लोड हो रहा है",
  "common.error": "कुछ गड़बड़ हो गई",
  "common.empty": "अभी कुछ नहीं है",
  "common.of": "में से",
  "common.hours": "घंटे",
  "common.minutes": "मिनट",

  "competency.current": "वर्तमान स्तर",
  "competency.required": "आवश्यक स्तर",
  "competency.gap": "अंतर",
  "competency.confidence": "विश्वसनीयता",
  "competency.evidence": "प्रमाण",

  "role.employee": "कर्मचारी / अधिकारी",
  "role.administrator": "प्रशासक",
  "role.engineer": "इंजीनियर / डेवलपर",
};

export const DICTIONARIES = { en, hi } as const;
