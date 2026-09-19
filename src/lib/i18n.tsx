import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ur" | "sd";

type Dict = Record<string, string>;

const en: Dict = {
  appName: "LifeLink Sukkur",
  tagline: "Emergency blood donor network for Sukkur & the region",
  home: "Home",
  requests: "Emergency Requests",
  donors: "Find Donors",
  dashboard: "Live Dashboard",
  profile: "My Profile",
  signIn: "Sign in",
  signUp: "Create account",
  signOut: "Sign out",
  email: "Email",
  password: "Password",
  fullName: "Full name",
  phone: "Phone",
  whatsapp: "WhatsApp number",
  city: "City / District",
  area: "Area / Landmark",
  bloodGroup: "Blood group",
  availability: "Availability",
  available: "Available to donate",
  unavailable: "Temporarily unavailable",
  lastDonation: "Last donation date",
  eligible: "Eligible",
  cooldown: "In cooldown",
  daysLeft: "days left",
  registerDonor: "Register as donor",
  saveProfile: "Save profile",
  newRequest: "Post emergency request",
  patientName: "Patient name",
  units: "Units needed",
  urgency: "Urgency",
  critical: "Critical – within hours",
  urgent: "Urgent – within 24 hours",
  standard: "Standard",
  hospital: "Hospital",
  condition: "Patient condition summary",
  contactPhone: "Contact phone",
  status: "Status",
  pending: "Pending",
  in_progress: "In progress",
  fulfilled: "Fulfilled",
  expired: "Expired",
  matches: "Matching donors",
  call: "Call",
  whatsappBtn: "WhatsApp",
  report: "Report",
  verified: "Verified",
  post: "Post request",
  search: "Search",
  all: "All",
  noResults: "No results found",
  needBlood: "Need blood now",
  becomeDonor: "Become a donor",
  totalDonors: "Registered donors",
  availableDonors: "Available now",
  openRequests: "Open requests",
  criticalNow: "Critical now",
  shortage: "Shortage analysis",
  demandVsDonors: "Demand vs available donors by blood group",
  donorsByArea: "Donors by district",
  compatibility: "Compatibility chart",
};

const ur: Dict = {
  appName: "لائف لنک سکھر",
  tagline: "سکھر اور گرد و نواح کے لیے ہنگامی خون عطیہ نیٹ ورک",
  home: "ہوم",
  requests: "ہنگامی درخواستیں",
  donors: "عطیہ دہندگان تلاش کریں",
  dashboard: "لائیو ڈیش بورڈ",
  profile: "میری پروفائل",
  signIn: "سائن ان",
  signUp: "اکاؤنٹ بنائیں",
  signOut: "سائن آؤٹ",
  email: "ای میل",
  password: "پاس ورڈ",
  fullName: "پورا نام",
  phone: "فون",
  whatsapp: "واٹس ایپ نمبر",
  city: "شہر / ضلع",
  area: "علاقہ / نشانی",
  bloodGroup: "بلڈ گروپ",
  availability: "دستیابی",
  available: "عطیہ کے لیے دستیاب",
  unavailable: "عارضی طور پر غیر دستیاب",
  lastDonation: "آخری عطیہ کی تاریخ",
  eligible: "اہل",
  cooldown: "وقفے میں",
  daysLeft: "دن باقی",
  registerDonor: "بطور ڈونر رجسٹر ہوں",
  saveProfile: "پروفائل محفوظ کریں",
  newRequest: "ہنگامی درخواست لگائیں",
  patientName: "مریض کا نام",
  units: "درکار یونٹس",
  urgency: "فوریت",
  critical: "نازک – چند گھنٹوں میں",
  urgent: "فوری – 24 گھنٹوں میں",
  standard: "عام",
  hospital: "ہسپتال",
  condition: "مریض کی حالت",
  contactPhone: "رابطہ نمبر",
  status: "حالت",
  pending: "زیر التوا",
  in_progress: "جاری",
  fulfilled: "مکمل",
  expired: "ختم",
  matches: "موزوں عطیہ دہندگان",
  call: "کال",
  whatsappBtn: "واٹس ایپ",
  report: "رپورٹ",
  verified: "تصدیق شدہ",
  post: "درخواست جمع کریں",
  search: "تلاش",
  all: "تمام",
  noResults: "کوئی نتیجہ نہیں",
  needBlood: "ابھی خون درکار ہے",
  becomeDonor: "ڈونر بنیں",
  totalDonors: "رجسٹرڈ ڈونرز",
  availableDonors: "ابھی دستیاب",
  openRequests: "کھلی درخواستیں",
  criticalNow: "نازک کیسز",
  shortage: "قلت کا تجزیہ",
  demandVsDonors: "بلڈ گروپ کے مطابق طلب اور دستیاب ڈونرز",
  donorsByArea: "ضلع کے مطابق ڈونرز",
  compatibility: "مطابقت چارٹ",
};

const sd: Dict = {
  appName: "لائيف لنڪ سکر",
  tagline: "سکر ۽ آس پاس لاءِ ايمرجنسي رت عطيي جو نيٽ ورڪ",
  home: "گهر",
  requests: "ايمرجنسي درخواستون",
  donors: "عطيا ڏيندڙ ڳوليو",
  dashboard: "لائيو ڊيش بورڊ",
  profile: "منهنجو پروفائل",
  signIn: "سائن ان",
  signUp: "اڪائونٽ ٺاهيو",
  signOut: "سائن آئوٽ",
  email: "اي ميل",
  password: "پاسورڊ",
  fullName: "پورو نالو",
  phone: "فون",
  whatsapp: "واٽس ايپ نمبر",
  city: "شهر / ضلعو",
  area: "علائقو / نشاني",
  bloodGroup: "بلڊ گروپ",
  availability: "دستيابي",
  available: "عطيي لاءِ تيار",
  unavailable: "عارضي طور تي دستياب ناهي",
  lastDonation: "آخري عطيي جي تاريخ",
  eligible: "اهل",
  cooldown: "وقفي ۾",
  daysLeft: "ڏينهن باقي",
  registerDonor: "ڊونر طور رجسٽر ٿيو",
  saveProfile: "پروفائل محفوظ ڪريو",
  newRequest: "ايمرجنسي درخواست لڳايو",
  patientName: "مريض جو نالو",
  units: "گهربل يونٽ",
  urgency: "تڪڙ",
  critical: "نازڪ – ڪجهه ڪلاڪن ۾",
  urgent: "تڪڙو – 24 ڪلاڪن ۾",
  standard: "عام",
  hospital: "اسپتال",
  condition: "مريض جي حالت",
  contactPhone: "رابطي جو نمبر",
  status: "حالت",
  pending: "منتظر",
  in_progress: "هلندڙ",
  fulfilled: "پورو ٿيو",
  expired: "ختم",
  matches: "ملندڙ ڊونر",
  call: "ڪال",
  whatsappBtn: "واٽس ايپ",
  report: "رپورٽ",
  verified: "تصديق ٿيل",
  post: "درخواست موڪليو",
  search: "ڳوليو",
  all: "سڀ",
  noResults: "ڪوبه نتيجو ناهي",
  needBlood: "هاڻي رت گهرجي",
  becomeDonor: "ڊونر ٿيو",
  totalDonors: "رجسٽرڊ ڊونر",
  availableDonors: "هاڻي دستياب",
  openRequests: "کليل درخواستون",
  criticalNow: "نازڪ ڪيس",
  shortage: "کوٽ جو تجزيو",
  demandVsDonors: "بلڊ گروپ موجب طلب ۽ دستياب ڊونر",
  donorsByArea: "ضلعي موجب ڊونر",
  compatibility: "مطابقت چارٽ",
};

const DICTS: Record<Lang, Dict> = { en, ur, sd };

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  ur: "اردو",
  sd: "سنڌي",
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string; rtl: boolean };

const I18nContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (k) => en[k] ?? k,
  rtl: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && DICTS[saved]) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const rtl = lang !== "en";

  useEffect(() => {
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, rtl]);

  const t = (k: string) => DICTS[lang][k] ?? en[k] ?? k;

  return <I18nContext.Provider value={{ lang, setLang, t, rtl }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
