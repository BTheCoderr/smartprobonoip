export const PRODUCT_DEMO_VIDEO = {
  youtubeId: "dgBbGfNxWdg",
  title: "SmartProBonoIP product walkthrough",
  kicker: "Product demo",
  headline: "See how SmartProBonoIP prepares a better inventor handoff",
  lead:
    "Follow an inventor from an unstructured idea to an organized IP Readiness Packet prepared for the next professional conversation.",
  ctaLabel: "Become a SmartProBonoIP pilot partner",
  ctaHref: "/pilot#pilot-application",
  playLabel: "Play product walkthrough video",
  privacyNote:
    "YouTube loads only after you press play. We do not send invention details to analytics.",
} as const;

export function productDemoEmbedSrc(origin: string): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
    autoplay: "1",
  });
  if (origin) params.set("origin", origin);
  return `https://www.youtube-nocookie.com/embed/${PRODUCT_DEMO_VIDEO.youtubeId}?${params.toString()}`;
}

export function productDemoThumbnailSrc(): string {
  return `https://i.ytimg.com/vi/${PRODUCT_DEMO_VIDEO.youtubeId}/hqdefault.jpg`;
}
