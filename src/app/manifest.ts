import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Match Pulse Rooms",
    short_name: "Pulse Rooms",
    description:
      "An explainable second screen for live football momentum and fan calls.",
    start_url: "/",
    display: "standalone",
    background_color: "#07110f",
    theme_color: "#07110f",
    categories: ["sports", "entertainment"],
  };
}
