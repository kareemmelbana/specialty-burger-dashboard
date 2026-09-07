import { createFileRoute } from "@tanstack/react-router";
import App from "@/app/App";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Specialty Burger Admin — لوحة تحكم سبيشالتي برجر" },
      {
        name: "description",
        content:
          "لوحة تحكم مطعم سبيشالتي برجر في جدة: الطلبات، القائمة، العملاء، العروض، محتوى الموقع والتقارير.",
      },
      { property: "og:title", content: "Specialty Burger Admin — لوحة تحكم سبيشالتي برجر" },
      {
        property: "og:description",
        content: "إدارة الطلبات والقائمة والعروض ومحتوى موقع سبيشالتي برجر من مكان واحد.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});
