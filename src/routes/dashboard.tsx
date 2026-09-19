import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, AlertTriangle, Droplet, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { BLOOD_GROUPS, COMPATIBILITY, eligibility } from "@/lib/blood";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInPrompt } from "@/routes/donors";
import type { Donor } from "@/components/DonorCard";
import type { BloodRequest } from "@/routes/requests/index";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Live blood shortage dashboard | LifeLink Sukkur" },
      {
        name: "description",
        content: "Live analytics of blood demand versus available donors by group and district in Sukkur region.",
      },
      { property: "og:title", content: "Live blood shortage dashboard | LifeLink Sukkur" },
      { property: "og:description", content: "Demand versus available donors by blood group and district." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
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
      const { data, error } = await supabase.from("blood_requests").select("*");
      if (error) throw error;
      return data as BloodRequest[];
    },
  });

  if (!user) return <SignInPrompt />;

  const openRequests = requests.filter((r) => r.status === "pending" || r.status === "in_progress");
  const availableDonors = donors.filter((d) => d.is_available && eligibility(d.last_donation_date).eligible);

  const byGroup = BLOOD_GROUPS.map((g) => {
    const demand = openRequests.filter((r) => r.blood_group === g).reduce((s, r) => s + r.units, 0);
    const supply = availableDonors.filter((d) => d.blood_group === g).length;
    const compatibleSupply = availableDonors.filter(
      (d) => d.blood_group && COMPATIBILITY[g].includes(d.blood_group as never),
    ).length;
    return { group: g, demand, supply, compatibleSupply, shortage: demand - compatibleSupply };
  });

  const districts = Array.from(new Set(donors.map((d) => d.city))).map((city) => ({
    city,
    donors: donors.filter((d) => d.city === city).length,
    available: availableDonors.filter((d) => d.city === city).length,
  }));

  const criticalNow = openRequests.filter((r) => r.urgency === "critical").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase">{t("dashboard")}</h1>
        <p className="text-muted-foreground">{t("demandVsDonors")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Users className="size-5" />} label={t("totalDonors")} value={donors.length} />
        <Stat icon={<Droplet className="size-5" />} label={t("availableDonors")} value={availableDonors.length} />
        <Stat icon={<Activity className="size-5" />} label={t("openRequests")} value={openRequests.length} />
        <Stat
          icon={<AlertTriangle className="size-5" />}
          label={t("criticalNow")}
          value={criticalNow}
          alert={criticalNow > 0}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("shortage")}</CardTitle>
          <CardDescription>
            Units requested vs donors who are compatible, eligible and available right now.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byGroup}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="group" stroke="var(--color-muted-foreground)" />
              <YAxis allowDecimals={false} stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  color: "var(--color-card-foreground)",
                }}
              />
              <Legend />
              <Bar dataKey="demand" name="Units needed" fill="var(--color-critical)" radius={[6, 6, 0, 0]} />
              <Bar
                dataKey="compatibleSupply"
                name="Compatible donors available"
                fill="var(--color-success)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("donorsByArea")}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {districts.length === 0 ? (
              <p className="text-muted-foreground">{t("noResults")}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" allowDecimals={false} stroke="var(--color-muted-foreground)" />
                  <YAxis type="category" dataKey="city" width={90} stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="available" name="Available donors" radius={[0, 6, 6, 0]}>
                    {districts.map((d) => (
                      <Cell key={d.city} fill="var(--color-primary)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("compatibility")}</CardTitle>
            <CardDescription>Recipient group and the donor groups they can safely receive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {BLOOD_GROUPS.map((g) => {
              const row = byGroup.find((b) => b.group === g)!;
              return (
                <div key={g} className="flex flex-wrap items-center gap-2 rounded-lg border p-2 text-sm">
                  <span className="w-12 rounded bg-blood px-2 py-1 text-center font-display font-bold text-primary-foreground">
                    {g}
                  </span>
                  <span className="flex-1 text-muted-foreground">← {COMPATIBILITY[g].join(", ")}</span>
                  {row.shortage > 0 && (
                    <span className="rounded-full bg-critical px-2 py-0.5 text-xs font-semibold text-critical-foreground">
                      short {row.shortage}
                    </span>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <Card className={alert ? "border-critical/60 shadow-alert" : ""}>
      <CardContent className="flex items-center gap-4 p-5">
        <span
          className={`flex size-11 items-center justify-center rounded-xl ${alert ? "bg-critical text-critical-foreground" : "bg-accent text-accent-foreground"}`}
        >
          {icon}
        </span>
        <div>
          <p className="font-display text-2xl font-bold">{value}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
