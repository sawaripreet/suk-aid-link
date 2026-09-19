export const BLOOD_GROUPS = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

/** Medically verified red-cell compatibility: recipient -> donors they can receive from. */
export const COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

export function canDonate(donor: string, recipient: string): boolean {
  const list = COMPATIBILITY[recipient as BloodGroup];
  return !!list && list.includes(donor as BloodGroup);
}

/** Exact match first, then O- universal, then the rest. */
export function matchRank(donor: string, recipient: string): number {
  if (donor === recipient) return 0;
  if (donor === "O-") return 1;
  return 2;
}

export const CITIES = [
  "Sukkur",
  "Rohri",
  "New Sukkur",
  "Khairpur",
  "Shikarpur",
  "Larkana",
  "Ghotki",
  "Pano Aqil",
  "Salehpat",
  "Kandhkot",
  "Jacobabad",
  "Naushahro Feroze",
];

export const HOSPITALS = [
  "Sukkur Civil Hospital",
  "SIUT Sukkur",
  "Ghulam Muhammad Mahar Medical College Hospital",
  "Bhitai Hospital Sukkur",
  "Sukkur Blood Transfusion Centre",
  "Khairpur Civil Hospital",
  "Other",
];

export const COOLDOWN_DAYS = 90;

export type Eligibility = {
  eligible: boolean;
  daysLeft: number;
  nextDate: Date | null;
};

export function eligibility(lastDonationDate?: string | null): Eligibility {
  if (!lastDonationDate) return { eligible: true, daysLeft: 0, nextDate: null };
  const last = new Date(lastDonationDate);
  const next = new Date(last.getTime());
  next.setDate(next.getDate() + COOLDOWN_DAYS);
  const diff = Math.ceil((next.getTime() - Date.now()) / 86400000);
  return { eligible: diff <= 0, daysLeft: Math.max(diff, 0), nextDate: next };
}

export const URGENCIES = ["critical", "urgent", "standard"] as const;
export type Urgency = (typeof URGENCIES)[number];

export const STATUSES = ["pending", "in_progress", "fulfilled", "expired"] as const;
export type RequestStatus = (typeof STATUSES)[number];

export function waLink(phone: string, message: string) {
  const digits = phone.replace(/[^\d]/g, "").replace(/^0/, "92");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
