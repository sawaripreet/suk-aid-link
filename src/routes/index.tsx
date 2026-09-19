import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Droplet, HeartPulse, Languages, MapPin, Phone, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { BLOOD_GROUPS, COMPATIBILITY, eligibility, timeAgo } from "@/lib/blood";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BloodTag, UrgencyBadge } from "@/components/badges";
import type { Donor } from "@/components/DonorCard";
import type { BloodRequest } from "@/routes/requests/index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LifeLink Sukkur | Emergency Blood Donor Network" },
      {
        name: "description",
        content:
          "Post an emergency blood request and instantly reach compatible, available donors across Sukkur, Rohri, Khairpur and nearby districts.",
      },
      { property: "og:title", content: "LifeLink Sukkur | Emergency Blood Donor Network" },
      {
        property: "og:description",
        content: "Emergency blood requests matched to compatible donors across the Sukkur region.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const { user } = useAuth();

  const { data: donors = [] } = useQuery({
    queryKey: ["donors"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("is_donor", true);
      if (error) throw error;
      return data as Donor[];
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blood_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as BloodRequest[];
    },
  });

  const available = donors.filter((d) => d.is_available && eligibility(d.last_donation_date).eligible).length;
  const open = requests.filter((r) => r.status === "pending" || r.status === "in_progress");

  return (
    <div>
      <section className="relative overflow-hidden bg-blood text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <HeartPulse className="size-3.5" /> {t("tagline")}
            </span>
            <h1 className="font-display text-5xl font-bold uppercase leading-[1.05] md:text-6xl">
              Blood found in minutes, not hours.
            </h1>
            <p className="max-w-lg text-lg opacity-90">
              LifeLink connects emergency blood requests from Sukkur Civil Hospital, SIUT Sukkur, GMMMC and other
              regional hospitals with compatible, eligible donors nearby — verified matching, one-tap call and
              WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/requests">
                  <Droplet className="size-4" /> {t("needBlood")}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
              >
                <Link to={user ? "/profile" : "/auth"}>
                  <Users className="size-4" /> {t("becomeDonor")}
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-sm">
              <Fact value={donors.length} label={t("totalDonors")} />
              <Fact value={available} label={t("availableDonors")} />
              <Fact value={open.length} label={t("openRequests")} />
            </div>
          </div>

          <div className="grid gap-3">
            {open.length > 0 ? (
              open.slice(0, 3).map((r) => (
                <Link key={r.id} to="/requests/$id" params={{ id: r.id }}>
                  <div className="flex items-center gap-4 rounded-2xl bg-background/95 p-4 text-foreground shadow-alert">
                    <BloodTag group={r.blood_group} className="h-12 min-w-14 text-lg" />
                    <div className="flex-1">
                      <UrgencyBadge urgency={r.urgency} />
                      <p className="mt-1 font-semibold">{r.hospital}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.units} unit(s) · {r.city} · {timeAgo(r.created_at)}
                      </p>
                    </div>
                    <Phone className="size-5 text-primary" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl bg-background/95 p-8 text-center text-foreground shadow-alert">
                <Droplet className="mx-auto mb-3 size-8 text-primary" />
                <p className="font-display text-lg font-bold uppercase">No open emergencies right now</p>
                <p className="text-sm text-muted-foreground">
                  {user
                    ? "Register as a donor so you are ready when the next call comes."
                    : "Sign in to see live requests and donor contacts."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold uppercase">How LifeLink saves time</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Feature
            icon={<Droplet className="size-5" />}
            title="Verified compatibility matching"
            text="Every request is matched with donors using strict red-cell compatibility rules — no guesswork at the bedside."
          />
          <Feature
            icon={<Activity className="size-5" />}
            title="90-day eligibility tracking"
            text="Donors record their last donation and the app calculates the cooldown, so only truly eligible donors appear."
          />
          <Feature
            icon={<Phone className="size-5" />}
            title="One-tap emergency contact"
            text="Pre-filled WhatsApp messages with hospital, blood group and patient details — plus direct dialling."
          />
          <Feature
            icon={<MapPin className="size-5" />}
            title="District-level search"
            text="Filter by Sukkur, Rohri, Khairpur, Shikarpur, Ghotki and more to find the closest donor first."
          />
          <Feature
            icon={<Languages className="size-5" />}
            title="English, اردو and سنڌي"
            text="The whole interface switches language instantly for regional accessibility."
          />
          <Feature
            icon={<ShieldCheck className="size-5" />}
            title="Report & verification"
            text="Community flagging and verified badges keep fake requests out of the feed."
          />
        </div>
      </section>

      <section className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="font-display text-3xl font-bold uppercase">{t("compatibility")}</h2>
          <p className="text-muted-foreground">Who can safely receive from whom.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BLOOD_GROUPS.map((g) => (
              <Card key={g}>
                <CardContent className="space-y-2 p-4">
                  <BloodTag group={g} className="h-10 min-w-12 text-base" />
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Can receive from</p>
                  <p className="text-sm font-semibold">{COMPATIBILITY[g].join(", ")}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Fact({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="text-xs uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          {icon}
        </span>
        <h3 className="font-display text-lg font-bold uppercase">{title}</h3>
        <p className="text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
