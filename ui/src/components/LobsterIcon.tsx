interface Props {
  size?: number;
  className?: string;
}

export default function LobsterIcon({ size = 24, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Claws */}
      <path d="M12 18c-4-6-10-4-10-1s4 7 8 5l4-2" fill="currentColor" opacity="0.9"/>
      <path d="M52 18c4-6 10-4 10-1s-4 7-8 5l-4-2" fill="currentColor" opacity="0.9"/>
      {/* Arms */}
      <path d="M18 22c-3 0-7-2-8-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M46 22c3 0 7-2 8-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Body */}
      <ellipse cx="32" cy="26" rx="14" ry="10" fill="currentColor" opacity="0.85"/>
      {/* Head */}
      <ellipse cx="32" cy="20" rx="10" ry="7" fill="currentColor"/>
      {/* Eyes */}
      <circle cx="27" cy="16" r="2.5" fill="currentColor"/>
      <circle cx="37" cy="16" r="2.5" fill="currentColor"/>
      <circle cx="27" cy="15.5" r="1.2" fill="#0d0d15"/>
      <circle cx="37" cy="15.5" r="1.2" fill="#0d0d15"/>
      {/* Eye stalks */}
      <line x1="27" y1="13" x2="25" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="37" y1="13" x2="39" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="25" cy="8" r="2" fill="currentColor"/>
      <circle cx="39" cy="8" r="2" fill="currentColor"/>
      {/* Tail segments */}
      <ellipse cx="32" cy="34" rx="12" ry="5" fill="currentColor" opacity="0.75"/>
      <ellipse cx="32" cy="40" rx="10" ry="4" fill="currentColor" opacity="0.65"/>
      <ellipse cx="32" cy="45" rx="8" ry="3.5" fill="currentColor" opacity="0.55"/>
      <ellipse cx="32" cy="50" rx="6" ry="3" fill="currentColor" opacity="0.45"/>
      {/* Tail fan */}
      <path d="M26 53c-3 4-6 6-4 7s6-1 8-4" fill="currentColor" opacity="0.5"/>
      <path d="M32 53c0 5 0 8 0 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M38 53c3 4 6 6 4 7s-6-1-8-4" fill="currentColor" opacity="0.5"/>
      {/* Legs */}
      <line x1="22" y1="28" x2="16" y2="34" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/>
      <line x1="24" y1="32" x2="18" y2="38" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/>
      <line x1="42" y1="28" x2="48" y2="34" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/>
      <line x1="40" y1="32" x2="46" y2="38" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}
