import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { BLOOD_GROUPS, CITIES, eligibility } from "@/lib/blood";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BloodTag } from "@/components/badges";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My donor profile | LifeLink Sukkur" },
      {
        name: "description",
        content: "Manage your donor details, availability and 90-day donation cooldown status.",
      },
      { property: "og:title", content: "My donor profile | LifeLink Sukkur" },
      { property: "og:description", content: "Donor details, availability and eligibility countdown." },
    ],
  }),
  component: ProfilePage,
});

type Form = {
  full_name: string;
  phone: string;
  whatsapp: string;
  city: string;
  area: string;
  blood_group: string;
  is_donor: boolean;
  is_available: boolean;
  last_donation_date: string;
};

const EMPTY: Form = {
  full_name: "",
  phone: "",
  whatsapp: "",
  city: "Sukkur",
  area: "",
  blood_group: "O+",
  is_donor: true,
  is_available: true,
  last_donation_date: "",
};

function ProfilePage() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const { data } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        whatsapp: data.whatsapp ?? "",
        city: data.city ?? "Sukkur",
        area: data.area ?? "",
        blood_group: data.blood_group ?? "O+",
        is_donor: data.is_donor ?? false,
        is_available: data.is_available ?? true,
        last_donation_date: data.last_donation_date ?? "",
      });
    }
  }, [data]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!user) return;
    if (form.full_name.trim().length < 2) return toast.error("Please enter your full name");
    if (form.phone.trim().length < 7) return toast.error("Please enter a valid phone number");
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.full_name.trim().slice(0, 100),
      phone: form.phone.trim().slice(0, 20),
      whatsapp: (form.whatsapp || form.phone).trim().slice(0, 20),
      city: form.city,
      area: form.area.trim().slice(0, 120),
      blood_group: form.blood_group,
      is_donor: form.is_donor,
      is_available: form.is_available,
      last_donation_date: form.last_donation_date || null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profile"] });
    qc.invalidateQueries({ queryKey: ["donors"] });
  };

  const elig = eligibility(form.last_donation_date || null);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold uppercase">{t("profile")}</h1>
        <BloodTag group={form.blood_group} />
        {form.is_donor && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            <BadgeCheck className="size-3.5" /> Donor
          </span>
        )}
        {data?.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success px-3 py-1 text-xs font-semibold text-success-foreground">
            <ShieldCheck className="size-3.5" /> {t("verified")}
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact & location</CardTitle>
          <CardDescription>Only signed-in members of the network can see these details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <TextField label={t("fullName")} value={form.full_name} onChange={(v) => set("full_name", v)} />
          <TextField label={t("phone")} value={form.phone} onChange={(v) => set("phone", v)} />
          <TextField label={t("whatsapp")} value={form.whatsapp} onChange={(v) => set("whatsapp", v)} />
          <div className="space-y-1.5">
            <Label>{t("city")}</Label>
            <Select value={form.city} onValueChange={(v) => set("city", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TextField label={t("area")} value={form.area} onChange={(v) => set("area", v)} />
          <div className="space-y-1.5">
            <Label>{t("bloodGroup")}</Label>
            <Select value={form.blood_group} onValueChange={(v) => set("blood_group", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("availability")}</CardTitle>
          <CardDescription>
            Donors must wait {90} days between whole-blood donations. We calculate this for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="font-semibold">{t("registerDonor")}</p>
              <p className="text-sm text-muted-foreground">Appear in donor search and request matches.</p>
            </div>
            <Switch checked={form.is_donor} onCheckedChange={(v) => set("is_donor", v)} />
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="font-semibold">{form.is_available ? t("available") : t("unavailable")}</p>
              <p className="text-sm text-muted-foreground">Toggle off when you cannot donate right now.</p>
            </div>
            <Switch checked={form.is_available} onCheckedChange={(v) => set("is_available", v)} />
          </div>

          <div className="space-y-1.5">
            <Label>{t("lastDonation")}</Label>
            <Input
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={form.last_donation_date}
              onChange={(e) => set("last_donation_date", e.target.value)}
            />
            <p className="pt-1 text-sm">
              {elig.eligible ? (
                <span className="font-semibold text-success">{t("eligible")}</span>
              ) : (
                <span className="font-semibold text-urgent">
                  {t("cooldown")} — {elig.daysLeft} {t("daysLeft")} (next:{" "}
                  {elig.nextDate?.toLocaleDateString()})
                </span>
              )}
            </p>
          </div>

          <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
            {t("saveProfile")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
