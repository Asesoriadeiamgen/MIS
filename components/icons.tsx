type IconProps = { className?: string };

const common = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconBook({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M12 6.5c-1.6-1.2-3.8-1.8-6.5-1.8v13c2.7 0 4.9.6 6.5 1.8" />
      <path d="M12 6.5c1.6-1.2 3.8-1.8 6.5-1.8v13c-2.7 0-4.9.6-6.5 1.8" />
      <path d="M12 6.5v13" />
    </svg>
  );
}

export function IconAgenda({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <rect x="4.5" y="5" width="15" height="15" rx="1" />
      <path d="M8 3v4M16 3v4M4.5 9.5h15" />
      <path d="M8.5 13.2h2M8.5 16.2h5" />
    </svg>
  );
}

export function IconArtesania({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <circle cx="10.5" cy="13.5" r="6" />
      <path d="M6 10.5c3 1.8 5.5 1.8 8.5 0M5.6 14.5c3.6-1 6.9-1 9.8 0M7 17.5c2.5.9 4.8.9 7 0" />
      <path d="M15.5 8.5 19.5 4.5M19.5 4.5l-1.4 3.6L21.5 7z" />
    </svg>
  );
}

export function IconVarios({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M12 3.5l1.6 4.3 4.3 1.6-4.3 1.6-1.6 4.3-1.6-4.3-4.3-1.6 4.3-1.6z" />
      <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </svg>
  );
}

export function IconCurso({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" />
      <path d="M7 10.6v5c0 1.4 2.2 2.9 5 2.9s5-1.5 5-2.9v-5" />
      <path d="M19.5 9v6" />
    </svg>
  );
}

export function IconServicio({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M12 3.5l1.6 4.3 4.3 1.6-4.3 1.6-1.6 4.3-1.6-4.3-4.3-1.6 4.3-1.6z" />
      <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </svg>
  );
}

export function IconPack({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <rect x="4" y="9.5" width="16" height="10.5" rx="1" />
      <path d="M4 13.5h16" />
      <path d="M9 9.5V7a3 3 0 0 1 6 0v2.5" />
    </svg>
  );
}

export function IconPortfolio({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="13" rx="1.2" />
      <circle cx="8.3" cy="9" r="1.4" />
      <path d="M4 15.5l4.8-4 4 3 3-2.5 4.2 3.5" />
    </svg>
  );
}

export function IconBlog({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M5 4.5h9.5L19 9v10.5H5z" />
      <path d="M14 4.5V9h5" />
      <path d="M8 12.5h8M8 15.5h8M8 18h5" />
    </svg>
  );
}

export function IconTienda({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M5 9.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      <path d="M3.5 9.5h17l-1.5-5h-14z" />
      <path d="M9 12.5a3 3 0 0 0 6 0" />
    </svg>
  );
}

export function IconFaq({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.7a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1 .8-1 1.6v.4" />
      <circle cx="12" cy="16.3" r="0.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPerfil({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <circle cx="12" cy="8.3" r="3.3" />
      <path d="M5 19.5c1.2-3.5 4-5.3 7-5.3s5.8 1.8 7 5.3" />
    </svg>
  );
}

export function IconTestimonio({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M7.5 6.5h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-6l-3.5 3v-3H7.5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
      <path d="M9.5 10.5h5M9.5 13h3.5" />
    </svg>
  );
}

export function IconCarrito({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M3.5 4.5h2l1.6 10.2a1.8 1.8 0 0 0 1.78 1.5h7.3a1.8 1.8 0 0 0 1.77-1.47l1.05-5.73H6.3" />
      <circle cx="10" cy="19.5" r="1.1" />
      <circle cx="17" cy="19.5" r="1.1" />
    </svg>
  );
}

export function IconInstagram({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.5 6.5 12 13l8.5-6.5" />
    </svg>
  );
}

export function IconWhatsapp({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M6.3 17.7 4.5 20l2.4-1.2A8 8 0 1 0 4 12a7.9 7.9 0 0 0 2.3 5.7z" />
      <path d="M9.3 9.9c.2-.6.4-.8.8-.8h.6c.2 0 .4.1.5.4l.5 1.2c.1.2.1.5-.1.6l-.5.6c.3.8 1 1.5 1.8 1.8l.6-.5c.2-.2.4-.2.6-.1l1.2.5c.3.1.4.3.4.5v.6c0 .4-.3.6-.8.8-1.6.5-4.2-1-5.1-1.9-.9-.9-2.4-3.5-1.9-5.1z" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

export function IconEye({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEyeOff({ className }: IconProps) {
  return (
    <svg {...common} className={className} aria-hidden="true">
      <path d="M3.5 3.5l17 17" />
      <path d="M10.6 6.1c.45-.07.9-.1 1.4-.1 6 0 9.5 6.5 9.5 6.5a17.4 17.4 0 0 1-3.3 4.1M7.4 7.4A17.6 17.6 0 0 0 2.5 12S6 18.5 12 18.5c1.3 0 2.5-.3 3.6-.8" />
      <path d="M9.9 10c-.3.4-.4.9-.4 1.4 0 1.4 1.1 2.5 2.5 2.5.5 0 1-.1 1.4-.4" />
    </svg>
  );
}
