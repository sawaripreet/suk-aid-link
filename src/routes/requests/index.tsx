import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Hospital, Clock, Flag, Phone, MessageCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import {
  BLOOD_GROUPS,
  CITIES,
  HOSPITALS,
  STATUSES,
  URGENCIES,
  telLink,
  timeAgo,
  waLink,
} from "@/lib/blood";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BloodTag, StatusBadge, UrgencyBadge } from "@/components/badges";
import { SignInPrompt } from "@/routes/donors";

export const Route = createFileRoute("/requests/")({
  head: () => ({
    meta: [
      { title: "Emergency blood requests | LifeLink Sukkur" },
      {
        name: "description",
        content: "Live feed of urgent blood requests from Sukkur hospitals with one-tap call and WhatsApp.",
      },
      { property: "og:title", content: "Emergency blood requests | LifeLink Sukkur" },
      { property: "og:description", content: "Live urgent blood requests from hospitals across Sukkur." },
    ],
  }),
  component: RequestsPage,
});

export type BloodRequest = {
  id: string;
  requester_id: string;
  patient_name: string;
  blood_group: string;
  units: number;
  urgency: string;
  hospital: string;
  city: string;
  condition_summary: string;
  contact_phone: string;
  contact_whatsapp: string;
  status: string;
  created_at: string;
};

const schema = z.object({
  patient_name: z.string().trim().max(100),
  blood_group: z.string(),
  units: z.number().int().min(1).max(20),
  urgency: z.string(),
  hospital: z.string().trim().nonempty({ message: "Hospital is required" }).max(150),
  city: z.string(),
  condition_summary: z.string().trim().max(500),
  contact_phone: z.string().trim().min(7, { message: "Valid contact phone required" }).max(20),
  contact_whatsapp: z.string().trim().max(20),
});

function RequestsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("open");
  const [groupFilter, setGroupFilter] = useState("all");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blood_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BloodRequest[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("blood_requests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const report = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("request_reports")
        .insert({ request_id: id, reporter_id: user!.id, reason: "Flagged as suspicious by a member" });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Reported for review. Thank you."),
    onError: () => toast.error("You already reported this request."),
  });

  if (!user) return <SignInPrompt />;

  const urgencyRank: Record<string, number> = { critical: 0, urgent: 1, standard: 2 };
  const filtered = requests
    .filter((r) => (statusFilter === "open" ? r.status === "pending" || r.status === "in_progress" : statusFilter === "all" || r.status === statusFilter))
    .filter((r) => groupFilter === "all" || r.blood_group === groupFilter)
    .sort((a, b) => (urgencyRank[a.urgency] ?? 3) - (urgencyRank[b.urgency] ?? 3));

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase">{t("requests")}</h1>
          <p className="text-muted-foreground">Sorted by urgency. Critical cases first.</p>
        </div>
        <NewRequestDialog />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open requests</SelectItem>
            <SelectItem value="all">{t("all")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-36">
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

      {isLoading ? (
        <p className="text-muted-foreground">Loading requests…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          {t("noResults")}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              isOwner={r.requester_id === user.id}
              onStatus={(status) => updateStatus.mutate({ id: r.id, status })}
              onReport={() => report.mutate(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function RequestCard({
  request: r,
  isOwner,
  onStatus,
  onReport,
}: {
  request: BloodRequest;
  isOwner: boolean;
  onStatus: (s: string) => void;
  onReport: () => void;
}) {
  const { t } = useI18n();
  const message = `URGENT BLOOD REQUEST\nBlood group: ${r.blood_group} (${r.units} unit(s))\nHospital: ${r.hospital}, ${r.city}\nPatient: ${r.patient_name || "N/A"}\nCondition: ${r.condition_summary || "N/A"}\nContact: ${r.contact_phone}\nPosted via LifeLink Sukkur`;

  return (
    <Card className={r.urgency === "critical" ? "border-critical/60 shadow-alert" : ""}>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <BloodTag group={r.blood_group} className="h-12 min-w-14 text-lg" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <UrgencyBadge urgency={r.urgency} />
              <StatusBadge status={r.status} />
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3.5" /> {timeAgo(r.created_at)}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-1.5 font-semibold">
              <Hospital className="size-4 text-primary" /> {r.hospital}, {r.city}
            </p>
            <p className="text-sm text-muted-foreground">
              {r.units} unit(s) needed{r.patient_name ? ` · Patient: ${r.patient_name}` : ""}
            </p>
          </div>
        </div>

        {r.condition_summary && <p className="text-sm">{r.condition_summary}</p>}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={telLink(r.contact_phone)}>
              <Phone className="size-4" /> {t("call")}
            </a>
          </Button>
          <Button size="sm" asChild>
            <a
              href={waLink(r.contact_whatsapp || r.contact_phone, message)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="size-4" /> {t("whatsappBtn")}
            </a>
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <Link to="/requests/$id" params={{ id: r.id }}>
              <Users className="size-4" /> {t("matches")}
            </Link>
          </Button>
          {!isOwner && (
            <Button size="sm" variant="ghost" onClick={onReport}>
              <Flag className="size-4" /> {t("report")}
            </Button>
          )}
          {isOwner && (
            <Select value={r.status} onValueChange={onStatus}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NewRequestDialog() {
  const { t } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    patient_name: "",
    blood_group: "O+",
    units: "1",
    urgency: "critical",
    hospital: HOSPITALS[0]!,
    city: "Sukkur",
    condition_summary: "",
    contact_phone: "",
    contact_whatsapp: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const parsed = schema.safeParse({ ...form, units: Number(form.units) });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    const { error } = await supabase.from("blood_requests").insert({
      ...parsed.data,
      contact_whatsapp: parsed.data.contact_whatsapp || parsed.data.contact_phone,
      requester_id: user!.id,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Emergency request posted");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["requests"] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-blood">
          <Plus className="size-4" /> {t("newRequest")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("newRequest")}</DialogTitle>
          <DialogDescription>
            Post only genuine emergencies. False requests can be flagged by the community.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("patientName")} value={form.patient_name} onChange={(v) => set("patient_name", v)} />
          <Pick label={t("bloodGroup")} value={form.blood_group} onChange={(v) => set("blood_group", v)} options={[...BLOOD_GROUPS]} />
          <Field label={t("units")} value={form.units} onChange={(v) => set("units", v)} type="number" />
          <Pick
            label={t("urgency")}
            value={form.urgency}
            onChange={(v) => set("urgency", v)}
            options={[...URGENCIES]}
            render={(o) => t(o)}
          />
          <Pick label={t("hospital")} value={form.hospital} onChange={(v) => set("hospital", v)} options={HOSPITALS} />
          <Pick label={t("city")} value={form.city} onChange={(v) => set("city", v)} options={CITIES} />
          <Field label={t("contactPhone")} value={form.contact_phone} onChange={(v) => set("contact_phone", v)} />
          <Field label={t("whatsapp")} value={form.contact_whatsapp} onChange={(v) => set("contact_whatsapp", v)} />
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{t("condition")}</Label>
            <Textarea
              rows={3}
              maxLength={500}
              value={form.condition_summary}
              onChange={(e) => set("condition_summary", e.target.value)}
            />
          </div>
        </div>

        <Button onClick={submit} className="w-full bg-blood">
          {t("post")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Pick({
  label,
  value,
  onChange,
  options,
  render,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  render?: (o: string) => string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {render ? render(o) : o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
