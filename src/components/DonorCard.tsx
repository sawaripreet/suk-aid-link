import { MapPin, Phone, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BloodTag } from "@/components/badges";
import { eligibility, telLink, waLink } from "@/lib/blood";
import { useI18n } from "@/lib/i18n";

export type Donor = {
  id: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  city: string;
  area: string;
  blood_group: string | null;
  is_available: boolean;
  last_donation_date: string | null;
  verified: boolean;
};

export function DonorCard({ donor, message }: { donor: Donor; message?: string }) {
  const { t } = useI18n();
  const elig = eligibility(donor.last_donation_date);
  const text =
    message ??
    `Assalam o Alaikum ${donor.full_name}, this is an urgent blood donation request from LifeLink Sukkur. Your blood group ${donor.blood_group} may be needed. Can you help?`;

  return (
    <Card className="transition-shadow hover:shadow-alert">
      <CardContent className="flex flex-wrap items-center gap-4 p-4">
        <BloodTag group={donor.blood_group ?? "?"} className="h-11 text-base" />
        <div className="min-w-40 flex-1">
          <p className="flex items-center gap-2 font-semibold">
            {donor.full_name || "Donor"}
            {donor.verified && <ShieldCheck className="size-4 text-success" />}
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {donor.area ? `${donor.area}, ` : ""}
            {donor.city}
          </p>
        </div>

        <div className="flex flex-col items-start gap-1 text-xs font-semibold">
          <span className={donor.is_available ? "text-success" : "text-muted-foreground"}>
            {donor.is_available ? t("available") : t("unavailable")}
          </span>
          <span className={elig.eligible ? "text-success" : "text-urgent"}>
            {elig.eligible ? t("eligible") : `${t("cooldown")} · ${elig.daysLeft} ${t("daysLeft")}`}
          </span>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={telLink(donor.phone)}>
              <Phone className="size-4" /> {t("call")}
            </a>
          </Button>
          <Button size="sm" asChild>
            <a href={waLink(donor.whatsapp || donor.phone, text)} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" /> {t("whatsappBtn")}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
