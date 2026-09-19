import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { BLOOD_GROUPS, CITIES, canDonate, eligibility } from "@/lib/blood";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DonorCard, type Donor } from "@/components/DonorCard";

export const Route = createFileRoute("/donors")({
  head: () => ({
    meta: [
      { title: "Find blood donors in Sukkur | LifeLink" },
      {
        name: "description",
        content: "Search registered donors by blood group, district and live availability across Sukkur region.",
      },
      { property: "og:title", content: "Find blood donors in Sukkur | LifeLink" },
      { property: "og:description", content: "Search donors by blood group, district and availability." },
    ],
  }),
  component: DonorsPage,
});

function DonorsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [group, setGroup] = useState("all");
  const [city, setCity] = useState("all");
  const [q, setQ] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [compatMode, setCompatMode] = useState(false);

  const { data: donors = [], isLoading } = useQuery({
    queryKey: ["donors"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_donor", true)
        .order("is_available", { ascending: false });
      if (error) throw error;
      return data as Donor[];
    },
  });

  const filtered = donors.filter((d) => {
    if (group !== "all") {
      if (compatMode ? !canDonate(d.blood_group ?? "", group) : d.blood_group !== group) return false;
    }
    if (city !== "all" && d.city !== city) return false;
    if (onlyAvailable && (!d.is_available || !eligibility(d.last_donation_date).eligible)) return false;
    if (q && !`${d.full_name} ${d.area} ${d.city}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  if (!user) return <SignInPrompt />;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase">{t("donors")}</h1>
        <p className="text-muted-foreground">
          {filtered.length} of {donors.length} registered donors match your filters.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border bg-card p-4 md:grid-cols-4">
        <div className="space-y-1.5">
          <Label>{t("bloodGroup")}</Label>
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              {BLOOD_GROUPS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t("city")}</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t("search")}</Label>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="ps-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or area" />
          </div>
        </div>
        <div className="flex flex-col justify-center gap-3 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={onlyAvailable} onCheckedChange={setOnlyAvailable} />
            Only eligible & available
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={compatMode} onCheckedChange={setCompatMode} />
            Compatible with selected group
          </label>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading donors…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          <Users className="mx-auto mb-3 size-8" />
          {t("noResults")}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((d) => (
            <DonorCard key={d.id} donor={d} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SignInPrompt() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h2 className="font-display text-2xl font-bold uppercase">Sign in required</h2>
      <p className="mt-2 text-muted-foreground">
        Donor contact details are only shared with verified members of the network.
      </p>
      <Button asChild className="mt-6">
        <Link to="/auth">{t("signIn")}</Link>
      </Button>
    </div>
  );
}
