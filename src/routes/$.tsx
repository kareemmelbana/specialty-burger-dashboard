import { createFileRoute } from "@tanstack/react-router";
import App from "@/app/App";

export const Route = createFileRoute("/$")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Specialty Burger Admin — لوحة تحكم سبيشالتي برجر" },
      {
        name: "description",
        content: "لوحة تحكم مطعم سبيشالتي برجر: الطلبات، القائمة، العملاء، العروض والإعدادات.",
      },
      { property: "og:title", content: "Specialty Burger Admin" },
      { property: "og:description", content: "إدارة عمليات مطعم سبيشالتي برجر في جدة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});
