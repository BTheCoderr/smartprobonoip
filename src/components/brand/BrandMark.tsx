import Link from "next/link";
import { BRAND, BRAND_COLORS } from "@/lib/brand";

const ICON_SIZES = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
} as const;

const WORDMARK_SIZES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
} as const;

export function BrandMarkIcon({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: keyof typeof ICON_SIZES;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`${ICON_SIZES[size]} shrink-0 ${className}`}
    >
      <rect
        x="10"
        y="14"
        width="30"
        height="30"
        rx="1.5"
        fill="#eef5f8"
        stroke={BRAND_COLORS.deepNavy}
        strokeWidth="1.5"
      />
      <rect
        x="6"
        y="10"
        width="30"
        height="30"
        rx="1.5"
        fill={BRAND_COLORS.offWhite}
        stroke={BRAND_COLORS.deepNavy}
        strokeWidth="1.5"
      />
      <rect
        x="2"
        y="6"
        width="30"
        height="30"
        rx="1.5"
        fill="#ffffff"
        stroke={BRAND_COLORS.deepNavy}
        strokeWidth="1.5"
      />
      <path
        d="M2 6h10v5H2V6Z"
        fill={BRAND_COLORS.offWhite}
        stroke={BRAND_COLORS.deepNavy}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.5h22"
        stroke="#dce6ec"
        strokeWidth="0.75"
        strokeDasharray="2 2"
      />
      <path
        d="M6 14.5h18"
        stroke="#dce6ec"
        strokeWidth="0.75"
        strokeDasharray="2 2"
      />
      <rect
        x="7"
        y="17"
        width="17"
        height="11"
        rx="1"
        fill="#e8f4f5"
        stroke={BRAND_COLORS.primaryTeal}
        strokeWidth="1.25"
        strokeDasharray="3 2"
      />
      <circle cx="21.5" cy="19.5" r="1.25" fill={BRAND_COLORS.softAqua} />
      <text
        x="15.5"
        y="25.5"
        fill={BRAND_COLORS.darkTeal}
        fontSize="7.5"
        fontWeight="700"
        fontFamily="ui-monospace, monospace"
        textAnchor="middle"
      >
        IP
      </text>
      <path
        d="M2 34h30"
        stroke={BRAND_COLORS.primaryTeal}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BrandMarkWordmark({
  size = "md",
  showSubtitle = false,
  light = false,
}: {
  size?: keyof typeof WORDMARK_SIZES;
  showSubtitle?: boolean;
  light?: boolean;
}) {
  return (
    <span className="min-w-0 flex flex-col leading-tight">
      <span
        className={`truncate font-semibold tracking-tight ${WORDMARK_SIZES[size]} ${
          light ? "text-cream" : "text-navy-900"
        }`}
      >
        {BRAND.umbrella}
        <span className={light ? "text-teal-300" : "text-teal-600"}>IP</span>
      </span>
      {showSubtitle ? (
        <span
          className={`truncate font-mono text-[10px] uppercase tracking-[0.12em] ${
            light ? "text-navy-100" : "text-muted-blue"
          }`}
        >
          {BRAND.feature}
        </span>
      ) : null}
    </span>
  );
}

export function BrandMark({
  variant = "compact",
  size = "md",
  showSubtitle,
  light = false,
  href,
  className = "",
}: {
  variant?: "full" | "compact" | "icon";
  size?: keyof typeof ICON_SIZES;
  showSubtitle?: boolean;
  light?: boolean;
  href?: string;
  className?: string;
}) {
  const subtitle =
    showSubtitle ?? (variant === "full");

  const content =
    variant === "icon" ? (
      <BrandMarkIcon size={size} />
    ) : (
      <span className={`flex min-w-0 items-center gap-2.5 ${className}`}>
        <BrandMarkIcon size={size} />
        <BrandMarkWordmark
          size={size}
          showSubtitle={subtitle}
          light={light}
        />
      </span>
    );

  if (href) {
    return (
      <Link href={href} className={`inline-flex min-w-0 ${className}`}>
        {content}
      </Link>
    );
  }

  if (variant === "icon") {
    return <span className={`inline-flex ${className}`}>{content}</span>;
  }

  return content;
}
