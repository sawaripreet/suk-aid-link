import { Link, useNavigate } from "@tanstack/react-router";
import { Droplet, Moon, Sun, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useI18n, LANG_LABELS, type Lang } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return { dark, toggle };
}

export function AppHeader() {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: t("home") },
    { to: "/requests", label: t("requests") },
    { to: "/donors", label: t("donors") },
    { to: "/dashboard", label: t("dashboard") },
  ];

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const nav = (
    <>
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          onClick={() => setOpen(false)}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary [&.active]:text-primary"
        >
          {l.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-blood text-primary-foreground">
            <Droplet className="size-5" />
          </span>
          <span className="font-display text-lg font-bold uppercase tracking-wide">{t("appName")}</span>
        </Link>

        <nav className="ms-6 hidden items-center gap-6 md:flex">{nav}</nav>

        <div className="ms-auto flex items-center gap-2">
          <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
            <SelectTrigger className="h-9 w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                <SelectItem key={l} value={l}>
                  {LANG_LABELS[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile">{t("profile")}</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                {t("signOut")}
              </Button>
            </div>
          ) : (
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/auth">{t("signIn")}</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="mt-10 flex flex-col gap-5 px-4">
                {nav}
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setOpen(false)} className="text-sm font-medium">
                      {t("profile")}
                    </Link>
                    <button onClick={signOut} className="text-start text-sm font-medium text-primary">
                      {t("signOut")}
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setOpen(false)} className="text-sm font-medium text-primary">
                    {t("signIn")}
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
