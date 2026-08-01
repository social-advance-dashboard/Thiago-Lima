import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Social Advance",
    short_name: "Social Advance",
    description: "Dashboard interno da Social Advance",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#378ADD",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
