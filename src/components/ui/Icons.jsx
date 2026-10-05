/* Brand marks and custom jewellery icons (lucide-react covers generic UI icons). */

export function Logo({ className = '', light = false }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span className={`font-display text-[26px] font-medium tracking-[0.34em] ${light ? 'text-ivory' : 'text-ink'}`} style={{ marginRight: '-0.34em' }}>
        AURELIA
      </span>
      <span className={`mt-1 text-[8px] font-semibold tracking-[0.5em] ${light ? 'text-gold-light' : 'text-gold-dark'}`} style={{ marginRight: '-0.5em' }}>
        FINE JEWELLERY
      </span>
    </span>
  );
}

export function DiamondMark({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className={className} aria-hidden="true">
      <path d="M6.5 3.5h11L22 9l-10 12L2 9z" />
      <path d="M2 9h20M9.5 3.5 8 9l4 12 4-12-1.5-5.5" />
    </svg>
  );
}

export function RingIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" className={className} aria-hidden="true">
      <circle cx="16" cy="19.5" r="8.5" />
      <path d="M12.5 7.5h7L22 10l-6 5-6-5z" />
    </svg>
  );
}

export function NecklaceIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" className={className} aria-hidden="true">
      <path d="M5 4c0 9 4.5 15 11 15s11-6 11-15" />
      <path d="M16 19v2.5" />
      <path d="M16 21.5l3 3.5-3 4-3-4z" />
    </svg>
  );
}

export function EarringIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" className={className} aria-hidden="true">
      <circle cx="16" cy="6" r="2.2" />
      <path d="M16 8.2v3.3" />
      <path d="M9.5 21a6.5 6.5 0 0 1 13 0c0 1-.2 1.6-.6 2H10.1c-.4-.4-.6-1-.6-2z" />
      <path d="M11 25.5v1M14 25.5v1.5M18 25.5v1.5M21 25.5v1" />
    </svg>
  );
}

export function BraceletIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" className={className} aria-hidden="true">
      <ellipse cx="16" cy="16" rx="11" ry="7" />
      <ellipse cx="16" cy="16" rx="8" ry="4.5" />
      <circle cx="16" cy="23" r="1.4" />
    </svg>
  );
}

export function BangleIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="11" />
      <circle cx="16" cy="16" r="8.4" />
      <circle cx="16" cy="5" r="1" fill="currentColor" />
      <circle cx="27" cy="16" r="1" fill="currentColor" />
      <circle cx="5" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="27" r="1" fill="currentColor" />
    </svg>
  );
}

export const CATEGORY_ICONS = {
  rings: RingIcon,
  necklaces: NecklaceIcon,
  earrings: EarringIcon,
  bracelets: BraceletIcon,
  bangles: BangleIcon,
};

export function Icon360({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <ellipse cx="12" cy="12" rx="10" ry="4.2" />
      <path d="M15.5 17.6 18 16l-1.6-2.4" />
      <path d="M12 3v3M12 18v3" strokeDasharray="1.5 2" />
    </svg>
  );
}

export function TryOnIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
      <circle cx="12" cy="10" r="3.2" />
      <path d="M7.5 18c.9-2.2 2.6-3.3 4.5-3.3s3.6 1.1 4.5 3.3" />
      <circle cx="8.3" cy="12.6" r=".9" fill="currentColor" />
      <circle cx="15.7" cy="12.6" r=".9" fill="currentColor" />
    </svg>
  );
}

/* Social marks (simple monochrome glyphs) */
export function InstagramIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21z" />
    </svg>
  );
}

export function PinterestIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5a9.5 9.5 0 0 0-3.5 18.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.8-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.6 1.9 1.9 0 3.3-2 3.3-4.9 0-2.5-1.8-4.3-4.4-4.3-3 0-4.8 2.3-4.8 4.6 0 .9.4 1.9.8 2.4.1.1.1.2.1.3l-.3 1.2c0 .2-.2.2-.4.1-1.4-.6-2.2-2.6-2.2-4.2 0-3.4 2.5-6.6 7.2-6.6 3.8 0 6.7 2.7 6.7 6.3 0 3.8-2.4 6.8-5.7 6.8-1.1 0-2.2-.6-2.5-1.3l-.7 2.6c-.2 1-.9 2.2-1.4 2.9A9.5 9.5 0 1 0 12 2.5z" />
    </svg>
  );
}

export function YoutubeIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z" />
    </svg>
  );
}
