import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ tagline, size = 52 }: { tagline?: string; size?: number }) {
  return (
    <Link className="brand" href="/" aria-label="m04.shop">
      <span className="brand-tile" style={{ width: size, height: size }}>
        <Image src="/brand/m04-logo.png" alt="m04.shop" width={size} height={size} priority />
      </span>
      {tagline ? <span className="brand-tagline">{tagline}</span> : null}
    </Link>
  );
}
