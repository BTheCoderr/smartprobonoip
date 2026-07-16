import Image from "next/image";
import {
  ProductProofPreview,
  type ProductProofVariant,
} from "@/components/ui/ProductProofPreview";
import { PRODUCT_PROOF_MEDIA } from "@/lib/copy";

/**
 * Renders a real screenshot when PRODUCT_PROOF_MEDIA[variant] is set.
 * Otherwise falls back to the interactive UI preview — never invents proof.
 */
export function ProductProofMedia({
  variant,
}: {
  variant: ProductProofVariant;
}) {
  const src =
    variant === "builder" ||
    variant === "snapshot" ||
    variant === "search" ||
    variant === "pdf"
      ? PRODUCT_PROOF_MEDIA[variant]
      : null;

  if (!src) {
    return <ProductProofPreview variant={variant} />;
  }

  return (
    <div className="product-proof-frame overflow-hidden">
      <Image
        src={src}
        alt={`SmartProBonoIP ${variant} product screenshot`}
        width={960}
        height={640}
        className="h-auto w-full object-cover object-top"
      />
    </div>
  );
}

/** Optional short product clip above the proof grid when PRODUCT_PROOF_MEDIA.video is set. */
export function ProductProofVideoSlot() {
  const src = PRODUCT_PROOF_MEDIA.video;
  if (!src) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-md border border-mist-200 bg-mist-50/40">
      <video
        className="aspect-video w-full object-cover"
        controls
        playsInline
        preload="metadata"
        src={src}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
