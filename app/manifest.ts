
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WEALTHORA",
    short_name: "WEALTHORA",
    description: "Building wealth with trust",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#050806",
    theme_color: "#071b10",
    icons: [
      {
        src: "/wealthora-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
