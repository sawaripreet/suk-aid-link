import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Droplet, HeartPulse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | LifeLink Sukkur Blood Network" },
      {
        name: "description",
        content: "Create a donor or requester account to post and answer emergency blood requests in Sukkur.",
      },
      { property: "og:title", content: "Sign in | LifeLink Sukkur" },
      { property: "og:description", content: "Donor and requester accounts for the Sukkur blood network." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
  fullName: z.string().trim().max(100).optional(),
});

function AuthPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/profile" });
  }, [user, navigate]);

  const submit = async (mode: "in" | "up") => {
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsed.data.fullName ?? "" },
          },
        });
        if (error) throw error;
        toast.success("Account created. You can complete your profile now.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-2 md:items-center">
      <div className="space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
          <HeartPulse className="size-3.5" /> {t("tagline")}
        </span>
        <h1 className="font-display text-4xl font-bold uppercase leading-tight">
          Every minute counts. <span className="text-primary">Be the match.</span>
        </h1>
        <p className="text-muted-foreground">
          Register once as a donor or a requester. We match blood groups using verified medical compatibility
          rules and connect you by call or WhatsApp in one tap.
        </p>
        <Link to="/requests" className="inline-block text-sm font-semibold text-primary underline">
          Browse emergency requests
        </Link>
      </div>

      <Card className="shadow-alert">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="size-5 text-primary" /> {t("appName")}
          </CardTitle>
          <CardDescription>Donors and requesters use the same account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="in">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="in">{t("signIn")}</TabsTrigger>
              <TabsTrigger value="up">{t("signUp")}</TabsTrigger>
            </TabsList>

            <TabsContent value="in" className="mt-4 space-y-3">
              <Field label={t("email")} value={email} onChange={setEmail} type="email" />
              <Field label={t("password")} value={password} onChange={setPassword} type="password" />
              <Button className="w-full" disabled={loading} onClick={() => submit("in")}>
                {t("signIn")}
              </Button>
            </TabsContent>

            <TabsContent value="up" className="mt-4 space-y-3">
              <Field label={t("fullName")} value={fullName} onChange={setFullName} />
              <Field label={t("email")} value={email} onChange={setEmail} type="email" />
              <Field label={t("password")} value={password} onChange={setPassword} type="password" />
              <Button className="w-full" disabled={loading} onClick={() => submit("up")}>
                {t("signUp")}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
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
