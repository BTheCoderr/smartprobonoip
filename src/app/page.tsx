import type { Metadata } from "next";
import UmbrellaLandingPage from "@/components/pages/UmbrellaLandingPage";

export const metadata: Metadata = {
  title: "SmartProBono — Legal + IP Preparation",
  description:
    "Choose legal help or IP readiness, then learn, prepare, organize, and connect from one SmartProBono platform.",
};

export default function HomePage() {
  return <UmbrellaLandingPage />;
}
