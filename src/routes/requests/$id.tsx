import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, HeartPulse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { COMPATIBILITY, canDonate, eligibility, matchRank, type BloodGroup } from "@/lib/blood";
import { Button } from "@/components/ui/button";
import { DonorCard, type Donor } from "@/components/DonorCard";
import { BloodTag, StatusBadge, UrgencyBadge } from "@/components/badges";
import { SignInPrompt } from "@/routes/donors";
import type { BloodRequest } from "@/routes/requests/index";

export const Route = createFileRoute("/requests/$id")({
  head: () => ({
    meta: [
      { title: "Matching donors for this request | LifeLink Sukkur" },
      {
        name: "description",
        content:
          "Compatible, available donors ranked for this emergency blood request using verified transfusion rules.",
      },
      { property: "og:title", content: "Matching donors | LifeLink Sukkur" },
      { property: "og:description", content: "Compatible donors ranked for this emergency blood request." },
    ],
  }),
  component: MatchPage,
});

function MatchPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const { user } = useAuth();

  const { data: request } = useQuery({
    queryKey: ["request", id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("blood_requests").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as BloodRequest | null;
    },
  });

  const { data: donors = [] } = useQuery({
    queryKey: ["donors"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("is_donor", true);
      if (error) throw error;
      return data as Donor[];
    },
  });

  if (!user) return <SignInPrompt />;
  if (!request) return <p className="p-12 text-center text-muted-foreground">Loading request…</p>;

  const message = `URGENT BLOOD REQUEST\nBlood group needed: ${request.blood_group} (${request.units} unit(s))\nHospital: ${request.hospital}, ${request.city}\nPatient: ${request.patient_name || "N/A"}\nCondition: ${request.condition_summary || "N/A"}\nPlease contact: ${request.contact_phone}\nSent via LifeLink Sukkur`;

  const matches = donors
    .filter((d) => d.blood_group && canDonate(d.blood_group, request.blood_group))
    .sort((a, b) => {
      const availDiff = Number(b.is_available) - Number(a.is_available);
      if (availDiff) return availDiff;
      const eligDiff =
        Number(eligibility(b.last_donation_date).eligible) - Number(eligibility(a.last_donation_date).eligible);
      if (eligDiff) return eligDiff;
      const cityDiff = Number(b.city === request.city) - Number(a.city === request.city);
      if (cityDiff) return cityDiff;
      return matchRank(a.blood_group!, request.blood_group) - matchRank(b.blood_group!, request.blood_group);
    });

  const compatible = COMPATIBILITY[request.blood_group as BloodGroup] ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/requests">
          <ArrowLeft className="size-4" /> {t("requests")}
        </Link>
      </Button>

      <div className="rounded-2xl border bg-card p-6 shadow-alert">
        <div className="flex flex-wrap items-center gap-3">
          <BloodTag group={request.blood_group} className="h-12 min-w-14 text-lg" />
          <UrgencyBadge urgency={request.urgency} />
          <StatusBadge status={request.status} />
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold uppercase">
          {request.hospital}, {request.city}
        </h1>
        <p className="text-muted-foreground">
          {request.units} unit(s) of {request.blood_group}
          {request.patient_name ? ` · Patient: ${request.patient_name}` : ""}
        </p>
        {request.condition_summary && <p className="mt-2 text-sm">{request.condition_summary}</p>}

        <div className="mt-4 rounded-xl bg-accent p-4 text-sm text-accent-foreground">
          <p className="font-semibold">Can receive from: {compatible.join(", ")}</p>
          <p className="mt-1 opacity-80">Compatibility verified against standard red-cell transfusion rules.</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold uppercase">
          <HeartPulse className="size-5 text-primary" /> {t("matches")} ({matches.length})
        </h2>
        {matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            {t("noResults")}
          </div>
        ) : (
          <div className="grid gap-3">
            {matches.map((d) => (
              <DonorCard key={d.id} donor={d} message={message} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
