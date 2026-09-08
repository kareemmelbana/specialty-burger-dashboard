import { useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bike,
  BookOpen,
  Box,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  Gift,
  Grid2X2,
  Layers3,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  MessageCircle,
  MoreHorizontal,
  Package,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings2,
  ShoppingBag,
  Star,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import {
  getGetAnalyticsQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetRestaurantSettingsQueryKey,
  getGetWebsiteContentQueryKey,
  getListCategoriesQueryKey,
  getListCustomersQueryKey,
  getListNotificationsQueryKey,
  getListOffersQueryKey,
  getListOrdersQueryKey,
  getListProductsQueryKey,
  getListReviewsQueryKey,
  useCreateCategory,
  useCreateOffer,
  useCreateProduct,
  useDeleteCategory,
  useDeleteProduct,
  useDeleteOffer,
  useDuplicateProduct,
  useGetAnalytics,
  useGetDashboardSummary,
  useGetRestaurantSettings,
  useGetWebsiteContent,
  useUpdateWebsiteContent,
  useListCategories,
  useListCustomers,
  useListNotifications,
  useListOffers,
  useListOrders,
  useListProducts,
  useListReviews,
  useMarkNotificationRead,
  useUpdateCategory,
  useUpdateOffer,
  useUpdateOrder,
  useUpdateProduct,
  useUpdateRestaurantSettings,
  useUpdateReview,
  supabase,
  isSupabaseConfigured,
  deleteProductImage,
  uploadProductImage,
} from "@/lib/api-client";
import { Link, Route, Switch, useLocation, useParams } from "wouter";

const queryClient = new QueryClient();
const money = (n = 0) =>
  `SAR ${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const shortDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—";
const timeAgo = (d: string) =>
  d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";
const titleize = (s = "") => s.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
const formatCurrentDate = () =>
  new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const relativeTime = (d?: string | null) => {
  if (!d) return "No orders yet";
  const seconds = Math.round((new Date(d).getTime() - Date.now()) / 1000);
  const absolute = Math.abs(seconds);
  if (absolute < 60) return "Just now";
  const unit = absolute < 3600 ? "minute" : absolute < 86400 ? "hour" : "day";
  const divisor = unit === "minute" ? 60 : unit === "hour" ? 3600 : 86400;
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round(seconds / divisor),
    unit,
  );
};

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3" data-testid="link-brand">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Flame size={21} strokeWidth={2.5} />
      </span>
      {!compact && (
        <span>
          <b className="font-display text-[17px] tracking-tight text-sidebar-foreground">
            SPECIALTY
          </b>
          <small className="block text-[10px] font-bold uppercase tracking-[.24em] text-primary">
            Burger / جدة
          </small>
        </span>
      )}
    </Link>
  );
}

const nav = [
  { href: "/dashboard", label: "Overview", ar: "نظرة عامة", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", ar: "الطلبات", icon: ShoppingBag },
  { href: "/menu", label: "Menu", ar: "القائمة", icon: Box },
  { href: "/menu/categories", label: "Categories", ar: "التصنيفات", icon: Layers3 },
  { href: "/customers", label: "Customers", ar: "العملاء", icon: Users },
  { href: "/offers", label: "Offers", ar: "العروض", icon: Tag },
  { href: "/content", label: "Website content", ar: "محتوى الموقع", icon: BookOpen },
  { href: "/analytics", label: "Analytics", ar: "التحليلات", icon: BarChart3 },
  { href: "/reviews", label: "Reviews", ar: "التقييمات", icon: Star },
];

function Shell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [authChecking, setAuthChecking] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) {
        if (active) {
          setAuthChecking(false);
          setLocation("/login");
        }
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) setLocation("/login");
      setAuthChecking(false);
    })();
    return () => {
      active = false;
    };
  }, [setLocation]);

  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(formatCurrentDate);
  const notificationsQuery = useListNotifications();
  const unreadNotifications = (notificationsQuery.data ?? []).filter(
    (notification: any) => !notification.read,
  ).length;
  useEffect(() => {
    const interval = window.setInterval(() => setCurrentDate(formatCurrentDate()), 60_000);
    return () => window.clearInterval(interval);
  }, []);
  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setLocation("/login");
  };
  if (authChecking)
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-background text-sm">
        Checking session…
      </div>
    );
  return (
    <div className="grain flex min-h-[100dvh] bg-background text-foreground" dir="rtl">
      <aside
        className={`shell-nav fixed inset-y-0 right-0 z-40 flex w-[268px] flex-col bg-sidebar px-4 py-5 text-sidebar-foreground shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${open ? "translate-x-0" : "translate-x-full"}`}
        dir="ltr"
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <Logo />
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-white lg:hidden"
            data-testid="button-close-menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-sidebar-foreground/40">
          Operations
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {nav.map(({ href, label, ar, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold ${location === href ? "bg-primary text-primary-foreground shadow-lg" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}
              data-testid={`link-nav-${label.toLowerCase().replaceAll(" ", "-")}`}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              <span className={`text-[10px] ${location === href ? "opacity-70" : "opacity-35"}`}>
                {ar}
              </span>
            </Link>
          ))}
        </nav>
        <div className="mt-5 border-t border-sidebar-border pt-4">
          <Link
            href="/notifications"
            className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            data-testid="link-notifications"
          >
            <Bell size={17} />
            <span className="flex-1">Notifications</span>
            {unreadNotifications > 0 && (
              <span className="min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-bold text-primary-foreground">
                {unreadNotifications}
              </span>
            )}
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            data-testid="link-settings"
          >
            <Settings2 size={17} />
            <span className="flex-1">Settings</span>
            <span className="text-[10px] opacity-35">الإعدادات</span>
          </Link>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-sidebar-foreground/45 hover:bg-sidebar-accent hover:text-red-300"
            data-testid="button-logout"
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-sidebar-accent p-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
            SB
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold">specialty burger</p>
            <p className="text-[10px] text-sidebar-foreground/45">Owner account</p>
          </div>
          <span className="h-2 w-2 rounded-full bg-[#76d4aa]" />
        </div>
      </aside>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
          data-testid="button-overlay"
        />
      )}
      <main className="min-w-0 flex-1" dir="rtl">
        <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-border/80 bg-background/90 px-4 backdrop-blur-xl sm:px-7">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl border border-border bg-card p-2 lg:hidden"
            data-testid="button-open-menu"
          >
            <MenuIcon size={19} />
          </button>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-muted-foreground">
              {currentDate}
            </p>
            <h1 className="font-display text-lg font-semibold tracking-tight">
              {location === "/dashboard"
                ? "Good evening, Owner"
                : titleize(location.split("/").filter(Boolean).pop() || "Overview")}
            </h1>
          </div>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-xl border border-secondary bg-secondary/50 px-3 py-2 text-xs font-bold text-secondary-foreground sm:flex"
            data-testid="link-whatsapp"
          >
            <MessageCircle size={15} /> WhatsApp ordering
          </a>
          <Link
            href="/notifications"
            className="relative rounded-xl border border-border bg-card p-2.5 hover:border-primary"
            data-testid="button-header-notifications"
          >
            <Bell size={18} />
            {unreadNotifications > 0 && (
              <span className="absolute -left-1 -top-1 min-w-4 rounded-full border-2 border-background bg-primary px-0.5 text-center text-[9px] font-bold text-primary-foreground">
                {unreadNotifications}
              </span>
            )}
          </Link>
        </header>
        <div className="mx-auto max-w-[1500px] p-4 sm:p-7">{children}</div>
      </main>
    </div>
  );
}

function Loading({ label = "Loading your service board" }: { label?: string }) {
  return (
    <div className="space-y-5">
      <div className="h-10 w-72 rounded-xl skeleton" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl skeleton" />
        ))}
      </div>
      <div className="h-72 rounded-2xl skeleton" />
      <p className="text-center text-xs text-muted-foreground">{label}…</p>
    </div>
  );
}
function ErrorState({ retry }: { retry?: () => void }) {
  return (
    <div className="grid min-h-[360px] place-items-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
      <div>
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <Activity size={22} />
        </div>
        <h2 className="font-display text-xl font-bold">The grill went quiet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We could not load this station. Try again.
        </p>
        {retry && (
          <button
            onClick={retry}
            className="mt-4 rounded-xl bg-foreground px-4 py-2 text-xs font-bold text-background"
            data-testid="button-retry"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
function Empty({
  icon: Icon = Package,
  title,
  body,
}: {
  icon?: typeof Package;
  title: string;
  body: string;
}) {
  return (
    <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <div>
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Icon size={21} />
        </div>
        <h3 className="font-display font-bold">{title}</h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
function PageIntro({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-primary">
          {eyebrow}
        </p>
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
function Button({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
}) {
  const c =
    variant === "primary"
      ? "bg-primary text-primary-foreground shadow-sm hover:brightness-95"
      : variant === "danger"
        ? "bg-destructive text-destructive-foreground"
        : variant === "outline"
          ? "border border-border bg-card hover:border-primary hover:bg-primary/5"
          : "hover:bg-muted";
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold ${c} ${props.className || ""}`}
    >
      {children}
    </button>
  );
}
function Badge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "green" | "yellow" | "red" | "blue" | "muted";
}) {
  const cls = {
    green: "bg-secondary text-secondary-foreground",
    yellow: "bg-primary/20 text-foreground",
    red: "bg-destructive/10 text-destructive",
    blue: "bg-sky-100 text-sky-800",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${cls}`}>
      {children}
    </span>
  );
}
function Metric({
  label,
  value,
  delta,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: typeof Wallet;
  tone?: "primary" | "mint" | "dark" | "red";
}) {
  const bg = {
    primary: "bg-primary/15 text-primary-foreground",
    mint: "bg-secondary text-secondary-foreground",
    dark: "bg-foreground text-background",
    red: "bg-destructive/10 text-destructive",
  }[tone];
  return (
    <div className="rounded-2xl border border-card-border bg-card p-4 shadow-sm enter">
      <div className="flex items-start justify-between">
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${bg}`}>
          <Icon size={17} />
        </div>
        {delta && (
          <span
            className={`flex items-center gap-1 text-[10px] font-bold ${delta.startsWith("-") ? "text-destructive" : "text-secondary-foreground"}`}
          >
            {delta.startsWith("-") ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function MiniChart({ data = [] as any[], color = "#e7a82f" }: { data?: any[]; color?: string }) {
  const vals = data.length ? data.map((x) => Number(x.value) || 0) : [0];
  const max = Math.max(...vals, 1),
    min = Math.min(...vals, 0);
  const points = vals
    .map(
      (v, i) =>
        `${(i / Math.max(vals.length - 1, 1)) * 100},${92 - ((v - min) / Math.max(max - min, 1)) * 75}`,
    )
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-full w-full overflow-visible"
    >
      <path d={`M ${points} L 100,100 L 0,100 Z`} fill={color} opacity=".11" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        className="chart-line"
      />
    </svg>
  );
}

function Dashboard() {
  const q = useGetDashboardSummary({ range: "today" });
  const qc = useQueryClient();
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const channel = client
      .channel("dashboard-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        qc.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      })
      .subscribe();
    return () => { void client.removeChannel(channel); };
  }, [qc]);
  const d: any = q.data;
  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorState retry={() => q.refetch()} />;
  const summary = d || {};
  const revenue = summary.revenueSeries || [];
  const recent = summary.recentOrders || [];
  return (
    <div className="enter">
      <PageIntro
        eyebrow="Service board · Jeddah"
        title="The pulse of Specialty."
        subtitle="Fresh off the grill, at a glance."
        action={
          <div className="flex items-center gap-2">
            <Badge tone="green">
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#278b68]" /> Accepting
              orders
            </Badge>
            <a
              href="https://specialty-burger.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold hover:border-primary hover:bg-primary/5"
              data-testid="button-export-dashboard"
            >
              <ExternalLink size={14} /> View live site
            </a>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Today’s revenue"
          value={money(summary.todayRevenue)}
          delta={
            summary.revenueChange == null
              ? undefined
              : `${summary.revenueChange >= 0 ? "+" : ""}${summary.revenueChange.toFixed(1)}%`
          }
          icon={Wallet}
          tone="primary"
        />
        <Metric
          label="Orders today"
          value={String(summary.todayOrders ?? 0)}
          icon={ShoppingBag}
          tone="mint"
        />
        <Metric
          label="Average order"
          value={money(summary.averageOrder)}
          icon={TrendingUp}
          tone="dark"
        />
        <Metric
          label="Active offers"
          value={String(summary.activeOffers ?? 0)}
          icon={Gift}
          tone="red"
        />
        <Metric
          label="Menu items"
          value={String(summary.menuItems ?? 0)}
          icon={Box}
          tone="primary"
        />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Revenue rhythm</h3>
              <p className="text-xs text-muted-foreground">Today, compared with the last 7 days</p>
            </div>
            <select
              className="rounded-lg border border-border bg-background px-2 py-2 text-xs font-bold"
              defaultValue="7d"
              data-testid="select-dashboard-range"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <div className="mt-7 h-56">
            <MiniChart data={revenue} />
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
            {revenue.map((x: any, i: number) => (
              <span key={i}>{x.label}</span>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-card-border bg-foreground p-5 text-background shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">
                Live service
              </p>
              <h3 className="mt-2 font-display text-xl font-bold">What needs your attention?</h3>
            </div>
            <Zap size={20} className="text-primary" />
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-xl bg-background/10 p-3">
              <div className="flex justify-between text-xs font-bold">
                <span>Orders in kitchen</span>
                <span className="text-primary">{summary.kitchenOrders ?? 0}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/15">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min(100, (Number(summary.kitchenOrders ?? 0) / Math.max(Number(summary.todayOrders ?? 0), 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-background/10 p-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <MessageCircle size={15} />
              </div>
              <div>
                <p className="text-xs font-bold">{summary.whatsappStatus}</p>
                <p className="mt-0.5 text-[10px] text-background/55">
                  Last order: {relativeTime(summary.lastOrderAt)}
                </p>
              </div>
            </div>
            <Link
              href="/orders"
              className="flex items-center justify-between border-t border-background/15 pt-4 text-xs font-bold text-primary"
              data-testid="link-live-orders"
            >
              Open order board <span>←</span>
            </Link>
          </div>
        </section>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h3 className="font-display text-lg font-bold">Recent orders</h3>
              <p className="text-xs text-muted-foreground">The latest tickets from the counter</p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-bold text-secondary-foreground"
              data-testid="link-all-orders"
            >
              See all →
            </Link>
          </div>
          {recent.length ? (
            <div className="divide-y divide-border">
              {recent.slice(0, 5).map((o: any) => (
                <Link
                  href={`/orders?id=${o.id}`}
                  key={o.id}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50"
                  data-testid={`row-recent-order-${o.id}`}
                >
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-xs font-bold">
                    {o.number?.replace("#", "").slice(-2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">Order #{String(o.number).replace(/^#/, "")}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {o.tableNumber != null ? `Table ${o.tableNumber} · ` : ""}{timeAgo(o.createdAt)}
                    </p>
                  </div>
                  <Badge
                    tone={
                      o.status === "completed"
                        ? "green"
                        : o.status === "cancelled"
                          ? "red"
                          : "yellow"
                    }
                  >
                    {titleize(o.status)}
                  </Badge>
                  <b className="w-20 text-left text-sm">{money(o.total)}</b>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="No tickets yet"
              body="Orders will appear here as soon as the grill gets busy."
            />
          )}
        </section>
        <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Best sellers</h3>
              <p className="text-xs text-muted-foreground">What Jeddah is craving today</p>
            </div>
            <Flame size={18} className="text-primary" />
          </div>
          <div className="mt-5 space-y-4">
            {(summary.topProducts || []).slice(0, 4).map((p: any, i: number) => (
              <div className="flex items-center gap-3" key={p.name}>
                <span className="w-4 text-xs font-bold text-muted-foreground">0{i + 1}</span>
                <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
                  {p.image ? (
                    <img src={p.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Box size={16} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.units || 0} sold · {p.category}
                  </p>
                </div>
                <b className="text-xs">{money(p.revenue)}</b>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SearchBar({
  value,
  onChange,
  placeholder = "Search by name, phone or order…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={16}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-border bg-card pr-10 pl-4 text-sm outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2"
        placeholder={placeholder}
        data-testid="input-search"
      />
    </div>
  );
}
function ProductModal({
  product,
  categories,
  close,
}: {
  product?: any;
  categories: any[];
  close: () => void;
}) {
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(
    product || {
      name: "",
      nameAr: "",
      description: "",
      price: 32,
      discountPrice: null,
      categoryId: categories[0]?.id || "",
      available: true,
      featured: false,
      bestseller: false,
      isNew: true,
      prepTime: 15,
      calories: null,
      image: "",
    },
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(product?.image || "");
  const [imageError, setImageError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const handleImage = (file?: File) => {
    if (!file) return;
    setImageError("");
    setSaveError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Images must be 5 MB or smaller.");
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setSelectedFile(file);
      setPreviewUrl(url);
      setForm({ ...form, image: "" });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setImageError("The selected file is not a valid image.");
    };
    image.src = url;
  };
  const removeImage = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl("");
    setForm({ ...form, image: "" });
    setImageError("");
  };
  const save = async () => {
    setSaveError("");
    setUploading(Boolean(selectedFile));
    let uploaded: { path: string; url: string } | null = null;
    let databaseSaved = false;
    try {
      if (selectedFile) uploaded = await uploadProductImage(selectedFile);
      const payload = {
        ...form,
        image: uploaded?.url ?? form.image ?? "",
        price: Number(form.price),
        prepTime: Number(form.prepTime),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      };
      const saved = product
        ? await update.mutateAsync({ id: product.id, data: payload })
        : await create.mutateAsync({ data: payload });
      databaseSaved = true;
      if (product && product.image !== saved.image)
        await deleteProductImage(product.image).catch(() => {});
      qc.invalidateQueries({ queryKey: getListProductsQueryKey() });
      close();
    } catch (error: any) {
      if (uploaded && !databaseSaved) await deleteProductImage(uploaded.url).catch(() => {});
      setSaveError(error?.message || "Could not save the product. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 p-4">
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl enter"
        dir="rtl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">
              Menu studio
            </p>
            <h3 className="font-display text-2xl font-bold">
              {product ? "Edit product" : "Add a product"}
            </h3>
          </div>
          <button
            onClick={close}
            className="rounded-lg p-2 hover:bg-muted"
            data-testid="button-close-modal"
          >
            <X size={19} />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["name", "Name / English"],
            ["nameAr", "الاسم بالعربية"],
            ["price", "Price (SAR)"],
            ["prepTime", "Prep time (min)"],
          ].map(([key, label]) => (
            <label key={key} className="text-xs font-bold">
              {label}
              <input
                value={form[key] ?? ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal outline-none focus:border-primary"
                data-testid={`input-product-${key}`}
              />
            </label>
          ))}
          <label className="text-xs font-bold sm:col-span-2">
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1.5 h-20 w-full rounded-xl border border-border bg-background p-3 text-sm font-normal outline-none focus:border-primary"
              data-testid="input-product-description"
            />
          </label>
          <label className="text-xs font-bold">
            Category
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"
              data-testid="select-product-category"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold">
            Discount price
            <input
              value={form.discountPrice ?? ""}
              onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
              className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"
              data-testid="input-product-discount"
            />
          </label>
          <div className="sm:col-span-2 rounded-2xl border border-border bg-background p-4">
            <div className="flex items-start gap-4">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold">Product image</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  JPG, JPEG, PNG or WEBP · max 5 MB
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:brightness-95">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => handleImage(e.target.files?.[0])}
                      data-testid="input-product-image"
                    />
                    {previewUrl ? "Change image" : "Upload image"}
                  </label>
                  {previewUrl && (
                    <Button
                      variant="outline"
                      type="button"
                      onClick={removeImage}
                      data-testid="button-remove-product-image"
                    >
                      Remove image
                    </Button>
                  )}
                </div>
                {imageError && (
                  <p className="mt-2 text-xs font-semibold text-destructive">{imageError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {[
            ["available", "Available"],
            ["featured", "Featured"],
            ["bestseller", "Bestseller"],
            ["isNew", "New"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setForm({ ...form, [key]: !form[key] })}
              className={`rounded-xl border px-3 py-2 text-xs font-bold ${form[key] ? "border-primary bg-primary/15" : "border-border"}`}
              data-testid={`button-toggle-${key}`}
            >
              {form[key] && <Check size={13} className="mr-1 inline" />}
              {label}
            </button>
          ))}
        </div>
        {saveError && (
          <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
            {saveError}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={close} data-testid="button-cancel-product">
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={uploading || create.isPending || update.isPending}
            data-testid="button-save-product"
          >
            {uploading
              ? "Uploading image…"
              : create.isPending || update.isPending
                ? "Saving…"
                : "Save product"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MenuPage({ categoriesOnly = false }: { categoriesOnly?: boolean }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const pq = useListProducts({ search: search || undefined, availability: filter as any });
  const cq = useListCategories();
  const products: any[] = pq.data || [];
  const categories: any[] = cq.data || [];
  const update = useUpdateProduct();
  const duplicate = useDuplicateProduct();
  const del = useDeleteProduct();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const deleteCat: any = useQueryClient();
  const qc = useQueryClient();
  if (pq.isLoading || cq.isLoading) return <Loading label="Loading the menu" />;
  if (pq.isError || cq.isError)
    return (
      <ErrorState
        retry={() => {
          pq.refetch();
          cq.refetch();
        }}
      />
    );
  if (categoriesOnly)
    return (
      <CategoryPage
        categories={categories}
        create={createCat}
        update={updateCat}
        remove={deleteCategory}
        qc={qc}
      />
    );
  const toggle = (p: any) =>
    update.mutate(
      { id: p.id, data: { ...p, available: !p.available } },
      { onSuccess: () => qc.invalidateQueries({ queryKey: getListProductsQueryKey() }) },
    );
  const remove = (p: any) => {
    if (confirm(`Delete ${p.name}?`))
      del.mutate(
        { id: p.id },
        { onSuccess: () => qc.invalidateQueries({ queryKey: getListProductsQueryKey() }) },
      );
  };
  return (
    <div className="enter">
      <PageIntro
        eyebrow="Menu control"
        title="The menu, dialled in."
        subtitle={`${products.length} products · fast edits for a fast service`}
        action={
          <Button onClick={() => setModal({ new: true })} data-testid="button-add-product">
            <Plus size={16} /> Add product
          </Button>
        }
      />
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search products in English or Arabic…"
        />
        <div className="flex gap-2 overflow-x-auto">
          {[
            ["all", "All items"],
            ["available", "Available"],
            ["unavailable", "Paused"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-bold ${filter === v ? "border-primary bg-primary/15" : "border-border bg-card"}`}
              data-testid={`button-filter-${v}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.length ? (
          products.map((p: any, i: number) => (
            <article
              key={p.id}
              className={`group overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm enter enter-${(i % 4) + 1}`}
              data-testid={`card-product-${p.id}`}
            >
              <div className="relative h-40 overflow-hidden bg-muted">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center bg-gradient-to-br from-secondary to-primary/40">
                    <Flame size={32} className="text-foreground/20" />
                  </div>
                )}
                <div className="absolute right-3 top-3 flex gap-1">
                  {p.bestseller && <Badge tone="yellow">Bestseller</Badge>}
                  {p.isNew && <Badge tone="green">New</Badge>}
                </div>
                <button
                  onClick={() => toggle(p)}
                  className={`absolute bottom-3 left-3 rounded-full px-3 py-1.5 text-[10px] font-bold shadow-sm ${p.available ? "bg-card text-foreground" : "bg-foreground text-background"}`}
                  data-testid={`button-availability-${p.id}`}
                >
                  {p.available ? "Available" : "Paused"}
                </button>
              </div>
              <div className="p-4">
                <div className="flex justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {p.nameAr} · {p.category}
                    </p>
                  </div>
                  <div className="text-left">
                    <b className="text-sm">{money(p.discountPrice || p.price)}</b>
                    {p.discountPrice && (
                      <del className="block text-[10px] text-muted-foreground">
                        {money(p.price)}
                      </del>
                    )}
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {p.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock3 size={13} />
                    {p.prepTime} min
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setModal(p)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                      data-testid={`button-edit-product-${p.id}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() =>
                        duplicate.mutate(
                          { id: p.id },
                          {
                            onSuccess: () =>
                              qc.invalidateQueries({ queryKey: getListProductsQueryKey() }),
                          },
                        )
                      }
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                      data-testid={`button-duplicate-product-${p.id}`}
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => remove(p)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      data-testid={`button-delete-product-${p.id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="sm:col-span-2 xl:col-span-3">
            <Empty
              icon={Search}
              title="Nothing on this pass"
              body="Try another search or bring a paused item back to the board."
            />
          </div>
        )}
      </div>
      {modal && (
        <ProductModal
          product={modal.new ? undefined : modal}
          categories={categories}
          close={() => setModal(null)}
        />
      )}
    </div>
  );
}

function CategoryPage({
  categories,
  create,
  update,
  remove,
  qc,
}: {
  categories: any[];
  create: any;
  update: any;
  remove: any;
  qc: any;
}) {
  const [form, setForm] = useState<any>(null);
  const save = () => {
    const data = { name: form.name, nameAr: form.nameAr, enabled: form.enabled };
    const done = () => {
      qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      setForm(null);
    };
    form.id
      ? update.mutate(
          { id: form.id, data: { ...data, order: Number(form.order) } },
          { onSuccess: done },
        )
      : create.mutate({ data }, { onSuccess: done });
  };
  return (
    <div className="enter">
      <PageIntro
        eyebrow="Menu architecture"
        title="Categories with a point of view."
        subtitle="Keep the ordering natural for the customer site."
        action={
          <Button
            onClick={() =>
              setForm({ name: "", nameAr: "", enabled: true, order: categories.length + 1 })
            }
            data-testid="button-add-category"
          >
            <Plus size={16} /> Add category
          </Button>
        }
      />
      <div className="space-y-3">
        {categories
          .sort((a, b) => a.order - b.order)
          .map((c: any, i: number) => (
            <div
              key={c.id}
              className="flex items-center gap-4 rounded-2xl border border-card-border bg-card p-4 shadow-sm"
              data-testid={`row-category-${c.id}`}
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <Grid2X2 size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold">{c.name}</h3>
                  <span className="text-xs text-muted-foreground">{c.nameAr}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.count} menu items · position {c.order}
                </p>
              </div>
              <Badge tone={c.enabled ? "green" : "muted"}>{c.enabled ? "Visible" : "Hidden"}</Badge>
              <button
                onClick={() =>
                  update.mutate(
                    { id: c.id, data: { enabled: !c.enabled } },
                    {
                      onSuccess: () =>
                        qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() }),
                    },
                  )
                }
                className="rounded-xl border border-border p-2 hover:bg-muted"
                data-testid={`button-toggle-category-${c.id}`}
              >
                {c.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button
                onClick={() => setForm(c)}
                className="rounded-xl border border-border p-2 hover:bg-muted"
                data-testid={`button-edit-category-${c.id}`}
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${c.name}?`))
                    remove.mutate(
                      { id: c.id },
                      {
                        onSuccess: () =>
                          qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() }),
                      },
                    );
                }}
                className="rounded-xl border border-border p-2 text-destructive hover:bg-destructive/10"
                data-testid={`button-delete-category-${c.id}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        {!categories.length && (
          <Empty
            icon={Layers3}
            title="No categories yet"
            body="Create the first lane for your menu."
          />
        )}
      </div>
      {form && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 p-4">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl">
            <div className="flex justify-between">
              <h3 className="font-display text-xl font-bold">
                {form.id ? "Edit category" : "New category"}
              </h3>
              <button onClick={() => setForm(null)} data-testid="button-close-category">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {[
                ["name", "Name / English"],
                ["nameAr", "الاسم بالعربية"],
                ["order", "Position"],
              ].map(([k, l]) => (
                <label className="block text-xs font-bold" key={k}>
                  {l}
                  <input
                    value={form[k] ?? ""}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"
                    data-testid={`input-category-${k}`}
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setForm(null)}
                data-testid="button-cancel-category"
              >
                Cancel
              </Button>
              <Button onClick={save} data-testid="button-save-category">
                Save category
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const q = useListOrders({ search: search || undefined, status: status as any, date: date || undefined });
  const allOrdersQuery = useListOrders({ date: date || undefined });
  const orders: any[] = q.data || [];
  const allOrders: any[] = allOrdersQuery.data || [];
  const update = useUpdateOrder();
  const qc = useQueryClient();
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const channel = client
      .channel("orders-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        qc.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      })
      .subscribe();
    return () => { void client.removeChannel(channel); };
  }, [qc]);
  if (q.isLoading) return <Loading label="Loading the order board" />;
  if (q.isError) return <ErrorState retry={() => q.refetch()} />;
  const statuses = [
    "all",
    "new",
    "confirmed",
    "preparing",
    "ready",
    "completed",
    "cancelled",
  ];
  const next = (o: any) => {
    const i = statuses.indexOf(o.status);
    if (i < 0) return;
    const n = statuses[Math.min(i + 1, 6)];
    if (n && n !== o.status)
      update.mutate(
        { id: o.id, data: { status: n as any } },
        { onSuccess: () => qc.invalidateQueries({ queryKey: getListOrdersQueryKey() }) },
      );
  };
  return (
    <div className="enter">
      <PageIntro
        eyebrow="Order desk"
        title="Keep the line moving."
        subtitle={`${orders.length} orders in your view`}
        action={
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#278b68]" />
            <span className="text-xs font-bold text-secondary-foreground">Live sync on</span>
          </div>
        }
      />
      <div className="mb-5 space-y-3">
        <SearchBar value={search} onChange={setSearch} />
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold">
            <span className="text-muted-foreground">Date</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="bg-transparent text-xs font-bold outline-none" data-testid="input-order-date" />
          </label>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statuses.map((s) => (
            <button
              onClick={() => setStatus(s)}
              key={s}
              className={`whitespace-nowrap rounded-xl border px-3 py-2 text-[11px] font-bold ${status === s ? "border-primary bg-primary/15" : "border-border bg-card"}`}
              data-testid={`button-status-${s}`}
            >
              {titleize(s)}
              {s !== "all" && (
                <span className="mr-1 text-muted-foreground">
                  · {allOrders.filter((o) => o.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
        <div className="hidden grid-cols-[1fr_1.3fr_1fr_.8fr_.8fr_110px] gap-4 border-b border-border bg-muted/50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:grid">
          <span>Ticket</span>
          <span>Table</span>
          <span>Items</span>
          <span>Total</span>
          <span>Status</span>
          <span />
        </div>
        {orders.length ? (
          orders.map((o: any) => (
            <div
              key={o.id}
              className="grid gap-3 border-b border-border p-4 last:border-0 hover:bg-muted/40 md:grid-cols-[1fr_1.3fr_1fr_.8fr_.8fr_110px] md:items-center md:gap-4 md:px-5"
              data-testid={`row-order-${o.id}`}
            >
              <div>
                <b className="text-sm">Order #{String(o.number).replace(/^#/, "")}</b>
                <p className="text-[11px] text-muted-foreground">
                  {o.tableNumber != null ? `Table ${o.tableNumber} · ` : "Table — · "}{timeAgo(o.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold">Table {o.tableNumber ?? "—"}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {o.items?.reduce((sum: number, item: any) => sum + Number(item.quantity ?? 0), 0)} Items
                {o.items?.length ? ` · ${o.items.map((i: any) => `${i.quantity}× ${i.name}`).join(", ")}` : ""}
              </p>
              <b className="text-sm">{money(o.total_amount ?? o.total)}</b>
              <Badge
                tone={
                  o.status === "completed"
                    ? "green"
                    : o.status === "cancelled"
                      ? "red"
                      : o.status === "new"
                        ? "blue"
                        : "yellow"
                }
              >
                {titleize(o.status)}
              </Badge>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelected(o)}
                  className="rounded-lg p-2 hover:bg-muted"
                  data-testid={`button-view-order-${o.id}`}
                >
                  <Eye size={15} />
                </button>
                {!["completed", "cancelled"].includes(o.status) && (
                  <button
                    onClick={() => next(o)}
                    className="rounded-lg bg-primary/15 p-2 text-primary-foreground hover:bg-primary/30"
                    data-testid={`button-advance-order-${o.id}`}
                  >
                    <ChevronDown size={15} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <Empty
            icon={ShoppingBag}
            title="No orders in this lane"
            body="Change the filter or enjoy the quiet before the next rush."
          />
        )}
      </div>
      {selected && (
        <OrderDetail order={selected} close={() => setSelected(null)} update={update} qc={qc} />
      )}
    </div>
  );
}
function OrderDetail({
  order,
  close,
  update,
  qc,
}: {
  order: any;
  close: () => void;
  update: any;
  qc: any;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-card p-6 shadow-2xl enter">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">
              Ticket detail
            </p>
            <h3 className="font-display text-2xl font-bold">Order #{String(order.number).replace(/^#/, "")}</h3>
          </div>
          <button
            onClick={close}
            className="rounded-lg p-2 hover:bg-muted"
            data-testid="button-close-order-detail"
          >
            <X size={19} />
          </button>
        </div>
        <div className="mt-6 rounded-2xl bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">Current status</span>
            <select
              value={order.status}
              onChange={(event) => update.mutate({ id: order.id, data: { status: event.target.value } }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListOrdersQueryKey() }) })}
              className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-bold"
              data-testid="select-order-status"
            >
              {["new", "confirmed", "preparing", "ready", "completed", "cancelled"].map((status) => <option key={status} value={status}>{titleize(status)}</option>)}
            </select>
          </div>
          <div className="mt-4 flex gap-1">
            {["new", "confirmed", "preparing", "ready", "completed"].map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${["new", "confirmed", "preparing", "ready", "completed"].indexOf(order.status) >= i ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <p className="text-sm font-bold">Table {order.tableNumber ?? "—"}</p>
          {order.items?.map((it: any, index: number) => (
            <div className="border-b border-border pb-3 text-sm" key={it.id ?? index}>
              <div className="flex justify-between gap-3">
                <span><b>{it.quantity}×</b> {it.name}</span>
                <b>{money(it.subtotal)}</b>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Unit price: {money(it.unitPrice ?? it.price)}
              </p>
              {it.addons?.length ? <div className="mt-2 space-y-1 pl-3 text-[11px] text-muted-foreground">
                <p className="font-bold text-foreground">Add-ons:</p>
                {it.addons.map((addon: any, addonIndex: number) => <p key={addon.id ?? addonIndex}>- {addon.name} × {addon.quantity ?? 1} — {money(addon.price)}</p>)}
              </div> : null}
            </div>
          ))}
          <div className="flex justify-between pt-2 text-sm">
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </div>
          <div className="flex justify-between pt-2 font-display text-lg font-bold">
            <span>Total</span>
            <span>{money(order.total)}</span>
          </div>
        </div>
        <Button
          className="mt-6 w-full"
          onClick={() => {
            update.mutate(
              { id: order.id, data: { status: "completed" } },
              {
                onSuccess: () => {
                  qc.invalidateQueries({ queryKey: getListOrdersQueryKey() });
                  close();
                },
              },
            );
          }}
          data-testid="button-complete-order"
        >
          <Check size={16} /> Mark completed
        </Button>
      </div>
    </div>
  );
}

function CustomersPage() {
  const [search, setSearch] = useState("");
  const q = useListCustomers({ search: search || undefined });
  const customers: any[] = q.data || [];
  const [selected, setSelected] = useState<any>(null);
  if (q.isLoading) return <Loading label="Loading the guest book" />;
  if (q.isError) return <ErrorState retry={() => q.refetch()} />;
  return (
    <div className="enter">
      <PageIntro
        eyebrow="Guest book"
        title="Know your regulars."
        subtitle={`${customers.length} guests · relationships worth remembering`}
      />
      <div className="mb-5 max-w-xl">
        <SearchBar value={search} onChange={setSearch} placeholder="Search name, phone or email…" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
        {customers.length ? (
          customers.map((c: any) => (
            <button
              onClick={() => setSelected(c)}
              key={c.id}
              className="flex w-full items-center gap-4 border-b border-border p-4 text-right last:border-0 hover:bg-muted/40"
              data-testid={`row-customer-${c.id}`}
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                {c.name
                  ?.split(" ")
                  .map((x: string) => x[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.phone} · {c.email}
                </p>
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-bold">{money(c.spending)}</p>
                <p className="text-[10px] text-muted-foreground">{c.orders} orders</p>
              </div>
              <div className="hidden text-left md:block">
                <p className="text-xs font-bold">{shortDate(c.lastOrder)}</p>
                <p className="text-[10px] text-muted-foreground">last visit</p>
              </div>
              <ChevronDown size={16} className="rotate-90 text-muted-foreground" />
            </button>
          ))
        ) : (
          <Empty
            icon={Users}
            title="No guests found"
            body="Try searching with a name or phone number."
          />
        )}
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl enter">
            <div className="flex justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">
                  Guest profile
                </p>
                <h3 className="font-display text-2xl font-bold">{selected.name}</h3>
              </div>
              <button onClick={() => setSelected(null)} data-testid="button-close-customer">
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs text-muted-foreground">Lifetime spend</p>
                <b className="mt-1 block font-display text-xl">{money(selected.spending)}</b>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs text-muted-foreground">Orders</p>
                <b className="mt-1 block font-display text-xl">{selected.orders}</b>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <p className="flex gap-2">
                <Phone size={15} />
                {selected.phone}
              </p>
              <p>{selected.email}</p>
              <p>
                Joined {shortDate(selected.registeredAt)} · last order{" "}
                {shortDate(selected.lastOrder)}
              </p>
            </div>
            <Button
              className="mt-6 w-full"
              onClick={() => setSelected(null)}
              data-testid="button-close-customer-panel"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function OffersPage() {
  const q = useListOffers();
  const offers: any[] = q.data || [];
  const [form, setForm] = useState<any>(null);
  const create = useCreateOffer();
  const update = useUpdateOffer();
  const del = useDeleteOffer();
  const qc = useQueryClient();
  const save = () => {
    const data = { ...form, value: Number(form.value), maxUses: Number(form.maxUses) };
    const done = () => {
      qc.invalidateQueries({ queryKey: getListOffersQueryKey() });
      setForm(null);
    };
    form.id
      ? update.mutate({ id: form.id, data }, { onSuccess: done })
      : create.mutate({ data }, { onSuccess: done });
  };
  if (q.isLoading) return <Loading label="Loading offers" />;
  if (q.isError) return <ErrorState retry={() => q.refetch()} />;
  return (
    <div className="enter">
      <PageIntro
        eyebrow="Offers & coupons"
        title="Give them a reason to return."
        subtitle="Simple levers, measured carefully."
        action={
          <Button
            onClick={() =>
              setForm({
                name: "",
                description: "",
                type: "percentage",
                value: 15,
                code: "",
                startDate: "2024-06-18",
                endDate: "2024-07-18",
                maxUses: 100,
                target: "All customers",
              })
            }
            data-testid="button-add-offer"
          >
            <Plus size={16} /> New offer
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {offers.length ? (
          offers.map((o: any) => (
            <div
              className="rounded-2xl border border-card-border bg-card p-5 shadow-sm"
              key={o.id}
              data-testid={`card-offer-${o.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">{o.name}</h3>
                    <Badge
                      tone={
                        o.status === "active" ? "green" : o.status === "expired" ? "red" : "yellow"
                      }
                    >
                      {titleize(o.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{o.description}</p>
                </div>
                <button
                  onClick={() => setForm(o)}
                  className="rounded-lg p-2 hover:bg-muted"
                  data-testid={`button-edit-offer-${o.id}`}
                >
                  <Pencil size={15} />
                </button>
              </div>
              <div className="my-5 flex items-center gap-3 rounded-xl bg-muted p-3">
                <span className="font-display text-2xl font-bold text-secondary-foreground">
                  {o.type === "percentage"
                    ? `${o.value}%`
                    : o.type === "fixed"
                      ? money(o.value)
                      : o.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {o.code ? (
                    <>
                      Coupon <b className="text-foreground">{o.code}</b>
                    </>
                  ) : (
                    "Automatic offer"
                  )}
                </span>
                <span className="mr-auto text-left text-[11px] font-bold">
                  {o.uses}/{o.maxUses} used
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {shortDate(o.startDate)} — {shortDate(o.endDate)}
                </span>
                <button
                  onClick={() => {
                    if (confirm("Delete this offer?"))
                      del.mutate(
                        { id: o.id },
                        {
                          onSuccess: () =>
                            qc.invalidateQueries({ queryKey: getListOffersQueryKey() }),
                        },
                      );
                  }}
                  className="text-destructive hover:underline"
                  data-testid={`button-delete-offer-${o.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="lg:col-span-2">
            <Empty
              icon={Gift}
              title="No offers in the drawer"
              body="Create a thoughtful offer for the next Jeddah rush."
            />
          </div>
        )}
      </div>
      {form && <OfferModal form={form} setForm={setForm} save={save} close={() => setForm(null)} />}
    </div>
  );
}
function OfferModal({
  form,
  setForm,
  save,
  close,
}: {
  form: any;
  setForm: (x: any) => void;
  save: () => void;
  close: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/35 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl enter">
        <div className="flex justify-between">
          <h3 className="font-display text-xl font-bold">{form.id ? "Edit offer" : "New offer"}</h3>
          <button onClick={close} data-testid="button-close-offer">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            ["name", "Offer name"],
            ["description", "Short description"],
            ["value", "Value"],
            ["code", "Coupon code"],
            ["startDate", "Starts"],
            ["endDate", "Ends"],
            ["maxUses", "Max uses"],
          ].map(([k, l]) => (
            <label
              key={k}
              className={`${k === "description" ? "sm:col-span-2" : ""} text-xs font-bold`}
            >
              {l}
              <input
                value={form[k] ?? ""}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"
                data-testid={`input-offer-${k}`}
              />
            </label>
          ))}
          <label className="text-xs font-bold">
            Type
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"
              data-testid="select-offer-type"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
              <option value="coupon">Coupon</option>
              <option value="bogo">BOGO</option>
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={close} data-testid="button-cancel-offer">
            Cancel
          </Button>
          <Button onClick={save} data-testid="button-save-offer">
            Save offer
          </Button>
        </div>
      </div>
    </div>
  );
}

function ContentPage() {
  const q = useGetWebsiteContent();
  const update = useUpdateWebsiteContent();
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);
  useEffect(() => {
    if (q.data && !form) setForm(q.data);
  }, [q.data]);
  if (q.isLoading || !form) return <Loading label="Loading the public site content" />;
  if (q.isError) return <ErrorState retry={() => q.refetch()} />;
  const save = () =>
    update.mutate(
      { data: form },
      { onSuccess: () => qc.invalidateQueries({ queryKey: getGetWebsiteContentQueryKey() }) },
    );
  return (
    <div className="enter">
      <PageIntro
        eyebrow="Public site"
        title="Make the first bite count."
        subtitle="Edit what guests see before they open WhatsApp."
        action={
          <Button onClick={save} disabled={update.isPending} data-testid="button-save-content">
            <Check size={16} />
            {update.isPending ? "Saving…" : "Publish changes"}
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Store size={17} className="text-primary" />
            <h3 className="font-display text-lg font-bold">Hero message</h3>
          </div>
          <div className="space-y-4">
            {[
              ["heroTitle", "Headline"],
              ["heroSubtitle", "Supporting line"],
              ["heroImage", "Hero image URL"],
              ["restaurantDescription", "Restaurant description"],
            ].map(([k, l]) => (
              <label key={k} className="block text-xs font-bold">
                {l}
                {k === "restaurantDescription" ? (
                  <textarea
                    value={form[k] || ""}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="mt-1.5 h-24 w-full rounded-xl border border-border bg-background p-3 text-sm font-normal"
                  />
                ) : (
                  <input
                    value={form[k] || ""}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"
                    data-testid={`input-content-${k}`}
                  />
                )}
              </label>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <MessageCircle size={17} className="text-primary" />
            <h3 className="font-display text-lg font-bold">Contact & footer</h3>
          </div>
          <div className="space-y-4">
            {[
              ["whatsapp", "WhatsApp number"],
              ["phone", "Phone"],
              ["address", "Address"],
              ["openingHours", "Opening hours"],
              ["instagram", "Instagram"],
              ["snapchat", "Snapchat"],
              ["footer", "Footer line"],
            ].map(([k, l]) => (
              <label key={k} className="block text-xs font-bold">
                {l}
                <input
                  value={form[k] || ""}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"
                  data-testid={`input-content-${k}`}
                />
              </label>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingsPage() {
  const q = useGetRestaurantSettings();
  const update = useUpdateRestaurantSettings();
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);
  useEffect(() => {
    if (q.data && !form) setForm(q.data);
  }, [q.data]);
  if (q.isLoading || !form) return <Loading label="Loading branch settings" />;
  if (q.isError) return <ErrorState retry={() => q.refetch()} />;
  const save = () =>
    update.mutate(
      {
        data: {
          ...form,
          minimumOrder: Number(form.minimumOrder),
          deliveryFee: Number(form.deliveryFee),
          deliveryTime: Number(form.deliveryTime),
        },
      },
      { onSuccess: () => qc.invalidateQueries({ queryKey: getGetRestaurantSettingsQueryKey() }) },
    );
  return (
    <div className="enter">
      <PageIntro
        eyebrow="Control room"
        title="Make the branch yours."
        subtitle="The small settings that keep service honest."
        action={
          <Button onClick={save} data-testid="button-save-settings">
            <Check size={16} /> Save settings
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold">Service status</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            This is reflected immediately on the customer site.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {["open", "busy", "closed"].map((s) => (
              <button
                onClick={() => setForm({ ...form, status: s })}
                key={s}
                className={`rounded-xl border p-3 text-xs font-bold ${form.status === s ? "border-primary bg-primary/15" : "border-border"}`}
                data-testid={`button-restaurant-status-${s}`}
              >
                <span
                  className={`mx-auto mb-2 block h-2.5 w-2.5 rounded-full ${s === "open" ? "bg-[#278b68]" : s === "busy" ? "bg-primary" : "bg-destructive"}`}
                />
                {titleize(s)}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            {[
              ["name", "Restaurant name"],
              ["logo", "Logo URL"],
              ["minimumOrder", "Minimum order (SAR)"],
              ["deliveryFee", "Delivery fee (SAR)"],
              ["deliveryTime", "Delivery time (min)"],
            ].map(([k, l]) => (
              <label key={k} className="block text-xs font-bold">
                {l}
                <input
                  value={form[k] ?? ""}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal"
                  data-testid={`input-settings-${k}`}
                />
              </label>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold">Ordering options</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose how guests can collect their order.
          </p>
          <div className="mt-5 space-y-3">
            {[
              ["pickup", "Pickup at branch"],
              ["delivery", "Delivery in Jeddah"],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setForm({ ...form, [k]: !form[k] })}
                className="flex w-full items-center justify-between rounded-xl border border-border p-4 text-sm font-bold"
                data-testid={`button-toggle-settings-${k}`}
              >
                <span>{l}</span>
                <span
                  className={`grid h-6 w-10 place-items-center rounded-full ${form[k] ? "bg-primary" : "bg-muted"}`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-card transition-transform ${form[k] ? "translate-x-2" : "-translate-x-2"}`}
                  />
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6 border-t border-border pt-5">
            <h4 className="text-sm font-bold">Opening hours</h4>
            <div className="mt-3 space-y-2">
              {(form.hours || []).map((h: any, i: number) => (
                <div key={h.day} className="flex items-center gap-2 text-xs">
                  <span className="w-16 font-bold">{h.day}</span>
                  <input
                    value={h.open}
                    onChange={(e) => {
                      const hours = [...form.hours];
                      hours[i] = { ...h, open: e.target.value };
                      setForm({ ...form, hours });
                    }}
                    className="h-9 w-24 rounded-lg border border-border bg-background px-2"
                  />
                  <span>—</span>
                  <input
                    value={h.close}
                    onChange={(e) => {
                      const hours = [...form.hours];
                      hours[i] = { ...h, close: e.target.value };
                      setForm({ ...form, hours });
                    }}
                    className="h-9 w-24 rounded-lg border border-border bg-background px-2"
                  />
                  <button
                    onClick={() => {
                      const hours = [...form.hours];
                      hours[i] = { ...h, enabled: !h.enabled };
                      setForm({ ...form, hours });
                    }}
                    className={`mr-auto rounded-lg px-2 py-1 text-[10px] font-bold ${h.enabled ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}
                    data-testid={`button-hour-${i}`}
                  >
                    {h.enabled ? "Open" : "Off"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const [range, setRange] = useState<any>("7d");
  const q = useGetAnalytics({ range });
  const a: any = q.data;
  if (q.isLoading) return <Loading label="Crunching the numbers" />;
  if (q.isError) return <ErrorState retry={() => q.refetch()} />;
  return (
    <div className="enter">
      <PageIntro
        eyebrow="Numbers with a pulse"
        title="See the shape of service."
        subtitle="A quieter view of what the rush is doing."
        action={
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-bold"
            data-testid="select-analytics-range"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="month">This month</option>
          </select>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Revenue" value={money(a?.revenue)} icon={Wallet} />
        <Metric label="Orders" value={String(a?.orders ?? 0)} icon={ShoppingBag} tone="mint" />
        <Metric
          label="Average order"
          value={money(a?.averageOrder)}
          icon={TrendingUp}
          tone="dark"
        />
        <Metric
          label="Customer growth"
          value={a?.customerGrowth == null ? "—" : `${a.customerGrowth}%`}
          icon={Users}
          tone="red"
        />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold">Sales over time</h3>
          <div className="mt-6 h-64">
            <MiniChart data={a?.salesSeries} />
          </div>
        </section>
        <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold">Service signals</h3>
          <div className="mt-5 space-y-3">
            {[
              ["Peak hour", a?.peakHour ?? "—", Clock3],
              ["New customers", a?.newCustomers ?? "—", Users],
              ["Returning customers", a?.returningCustomers ?? "—", TrendingUp],
            ].map(([l, v, I]: any) => (
              <div className="flex items-center gap-3 rounded-xl bg-muted p-3" key={l}>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-card text-primary">
                  <I size={16} />
                </div>
                <span className="flex-1 text-xs text-muted-foreground">{l}</span>
                <b className="font-display">{v}</b>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold">Top products</h3>
          {a?.topProducts?.length ? (
            a.topProducts.slice(0, 5).map((p: any, i: number) => (
              <div className="mt-4 flex items-center gap-3" key={p.name}>
                <span className="w-5 text-xs font-bold text-muted-foreground">0{i + 1}</span>
                <span className="flex-1 text-sm font-bold">{p.name}</span>
                <span className="text-xs text-muted-foreground">{p.units} units</span>
                <b className="text-xs">{money(p.revenue)}</b>
              </div>
            ))
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              No order items can be matched to products yet.
            </p>
          )}
        </section>
        <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold">Category mix</h3>
          {a?.categories?.length ? (
            a.categories.map((c: any) => (
              <div key={c.label} className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs">
                  <b>{c.label}</b>
                  <span className="text-muted-foreground">{money(c.value)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (Number(c.value) / Math.max(...a.categories.map((x: any) => Number(x.value)), 1)) * 100)}%`,
                      backgroundColor: "#e7a82f",
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">No category sales data available.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function ReviewsPage() {
  const q = useListReviews();
  const sourceReviews: any[] = q.data || [];
  const update = useUpdateReview();
  const qc = useQueryClient();
  if (q.isLoading) return <Loading label="Loading guest feedback" />;
  if (q.isError) return <ErrorState retry={() => q.refetch()} />;
  const reviews = sourceReviews.map((review: any) => ({
    ...review,
    customer: review.customer ?? review.customer_name ?? review.name ?? "—",
    city: review.city ?? review.customer_city ?? "—",
    review: review.review ?? review.text ?? review.comment ?? review.review_text ?? "",
    rating: Number(review.rating ?? review.stars ?? 0),
    date: review.date ?? review.createdAt ?? review.created_at,
    status: String(review.status ?? "pending").toLowerCase(),
  }));
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const approvedThisMonth = reviews.filter(
    (review) =>
      review.status === "approved" &&
      review.date &&
      new Date(review.date) >= monthStart,
  ).length;
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const moderate = (r: any, status: string) =>
    update.mutate(
      { id: r.id, data: { status: status as any } },
      { onSuccess: () => qc.invalidateQueries({ queryKey: getListReviewsQueryKey() }) },
    );
  return (
    <div className="enter">
      <PageIntro
        eyebrow="Guest voice"
        title="Keep the good, fix the rest."
        subtitle="Moderate feedback before it reaches the public site."
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-card-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Average rating</p>
          <b className="mt-1 block font-display text-3xl">
            {averageRating.toFixed(1)} <span className="text-primary">★</span>
          </b>
        </div>
        <div className="rounded-2xl border border-card-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pending review</p>
          <b className="mt-1 block font-display text-3xl">
            {reviews.filter((r) => r.status === "pending").length}
          </b>
        </div>
        <div className="rounded-2xl border border-card-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Approved this month</p>
          <b className="mt-1 block font-display text-3xl">
            {approvedThisMonth}
          </b>
        </div>
      </div>
      <div className="space-y-3">
        {reviews.length ? (
          reviews.map((r: any) => (
            <div
              className="rounded-2xl border border-card-border bg-card p-5 shadow-sm"
              key={r.id}
              data-testid={`card-review-${r.id}`}
            >
              <div className="flex flex-wrap items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary font-bold text-secondary-foreground">
                  {r.customer?.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <b className="text-sm">{r.customer}</b>
                    <Badge
                      tone={
                        r.status === "approved"
                          ? "green"
                          : r.status === "hidden"
                            ? "muted"
                            : "yellow"
                      }
                    >
                      {titleize(r.status)}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {r.city} · {r.product ?? "—"} · {shortDate(r.date)}
                  </p>
                </div>
                <div className="text-primary">
                  {"★".repeat(Math.max(0, Math.min(5, r.rating)))}
                  <span className="text-muted">
                    {"★".repeat(Math.max(0, 5 - r.rating))}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">“{r.review}”</p>
              <div className="mt-4 flex gap-2">
                {r.status !== "approved" && (
                  <Button
                    onClick={() => moderate(r, "approved")}
                    data-testid={`button-approve-review-${r.id}`}
                  >
                    <Check size={14} /> Approve
                  </Button>
                )}
                {r.status !== "hidden" && (
                  <Button
                    variant="outline"
                    onClick={() => moderate(r, "hidden")}
                    data-testid={`button-hide-review-${r.id}`}
                  >
                    <EyeOff size={14} /> Hide
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => moderate(r, "pending")}
                  data-testid={`button-reset-review-${r.id}`}
                >
                  Reset
                </Button>
              </div>
            </div>
          ))
        ) : (
          <Empty
            icon={Star}
            title="No reviews waiting"
            body="The room is quiet. Guest feedback will land here."
          />
        )}
      </div>
    </div>
  );
}

function NotificationsPage() {
  const q = useListNotifications();
  const ns: any[] = q.data || [];
  const mark = useMarkNotificationRead();
  const qc = useQueryClient();
  return (
    <div className="enter">
      <PageIntro
        eyebrow="Signal desk"
        title="Nothing slips past."
        subtitle="Updates from orders, guests and the kitchen."
        action={
          <Button
            variant="outline"
            onClick={() =>
              ns
                .filter((n) => !n.read)
                .forEach((n) =>
                  mark.mutate(
                    { id: n.id },
                    {
                      onSuccess: () =>
                        qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() }),
                    },
                  ),
                )
            }
            data-testid="button-mark-all-read"
          >
            <Check size={15} /> Mark all read
          </Button>
        }
      />
      <div className="space-y-2">
        {ns.length ? (
          ns.map((n: any) => (
            <button
              onClick={() =>
                !n.read &&
                mark.mutate(
                  { id: n.id },
                  {
                    onSuccess: () =>
                      qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() }),
                  },
                )
              }
              key={n.id}
              className={`flex w-full gap-4 rounded-2xl border p-4 text-right ${n.read ? "border-border bg-card" : "border-primary/30 bg-primary/5"} hover:border-primary`}
              data-testid={`row-notification-${n.id}`}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-primary">
                {n.type === "new_order" ? (
                  <ShoppingBag size={17} />
                ) : n.type === "review" ? (
                  <Star size={17} />
                ) : n.type === "stock" ? (
                  <Box size={17} />
                ) : (
                  <Bell size={17} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2">
                  <b className="text-sm">{n.title}</b>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{n.description}</p>
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </button>
          ))
        ) : (
          <Empty icon={Bell} title="All caught up" body="New service signals will appear here." />
        )}
      </div>
    </div>
  );
}

function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const login = async (e: any) => {
    e.preventDefault();
    setError("");
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setLocation("/dashboard");
  };
  return (
    <div className="grain flex min-h-[100dvh] items-center justify-center bg-sidebar p-4" dir="rtl">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-sidebar-border bg-card shadow-2xl lg:grid-cols-[.9fr_1.1fr]">
        <div className="relative hidden min-h-[620px] overflow-hidden bg-foreground p-10 text-background lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary/25 blur-2xl" />
          <div>
            <Logo compact />
            <p className="mt-8 max-w-xs font-display text-4xl font-bold leading-tight">
              The grill is yours to run.
            </p>
            <p className="mt-4 max-w-xs text-sm leading-6 text-background/55">
              One calm operating system for every ticket, table and flame in Jeddah.
            </p>
          </div>
          <div className="relative">
            <div className="mb-3 h-1 w-16 bg-primary" />
            <p className="text-xs text-background/55">“Fast hands. Fresh fire. Same standard.”</p>
          </div>
        </div>
        <div className="p-7 sm:p-12">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">
            Owner access · دخول المالك
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold">Welcome back.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your Supabase owner account.
          </p>
          <form onSubmit={login} className="mt-8 space-y-4">
            <label className="block text-xs font-bold">
              Email
              <input
                name="email"
                autoComplete="email"
                className="mt-1.5 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                data-testid="input-login-email"
              />
            </label>
            <label className="block text-xs font-bold">
              Password
              <input
                name="password"
                autoComplete="current-password"
                type="password"
                className="mt-1.5 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                data-testid="input-login-password"
              />
            </label>
            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="mt-3 h-12 w-full text-foreground" disabled={loading}>
              {loading ? "Signing in…" : "Enter the control room"}
              <ArrowUpRight size={16} />
            </Button>
          </form>
          <div className="mt-8 rounded-2xl bg-secondary/50 p-4 text-xs text-secondary-foreground">
            <b>Secure owner access.</b>
            <p className="mt-1 opacity-75">Create the owner account in Supabase Authentication.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
function NotFound() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background p-6 text-center">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">404</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page you requested does not exist.</p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <RouteRedirect />
      </Route>
      <Route path="/dashboard">
        <Shell>
          <Dashboard />
        </Shell>
      </Route>
      <Route path="/menu/categories">
        <Shell>
          <MenuPage categoriesOnly />
        </Shell>
      </Route>
      <Route path="/menu">
        <Shell>
          <MenuPage />
        </Shell>
      </Route>
      <Route path="/orders">
        <Shell>
          <OrdersPage />
        </Shell>
      </Route>
      <Route path="/customers">
        <Shell>
          <CustomersPage />
        </Shell>
      </Route>
      <Route path="/offers">
        <Shell>
          <OffersPage />
        </Shell>
      </Route>
      <Route path="/content">
        <Shell>
          <ContentPage />
        </Shell>
      </Route>
      <Route path="/settings">
        <Shell>
          <SettingsPage />
        </Shell>
      </Route>
      <Route path="/analytics">
        <Shell>
          <AnalyticsPage />
        </Shell>
      </Route>
      <Route path="/reviews">
        <Shell>
          <ReviewsPage />
        </Shell>
      </Route>
      <Route path="/notifications">
        <Shell>
          <NotificationsPage />
        </Shell>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}
function RouteRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    (async () => {
      if (!supabase) {
        setLocation("/login");
        return;
      }
      const { data } = await supabase.auth.getUser();
      setLocation(data.user ? "/dashboard" : "/login");
    })();
  }, [setLocation]);
  return <div className="min-h-[100dvh] bg-background" />;
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
export default App;
