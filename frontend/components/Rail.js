"use client";
import { Mark } from "@/components/SearchBar";

const ICON = {
  overview: <><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="5" rx="1" /><rect x="13" y="10" width="8" height="11" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /></>,
  teknikal: <><path d="M7 4v16M17 4v16" /><rect x="5" y="8" width="4" height="7" /><rect x="15" y="6" width="4" height="9" /></>,
  fundamental: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 12h7M9 16h7" /></>,
  komparasi: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
};

// [id, label, short label for the phone bar]
const ITEMS = [
  ["overview", "Overview", "Overview"],
  ["teknikal", "Analisis teknikal", "Teknikal"],
  ["fundamental", "Analisis fundamental", "Fundam."],
  ["komparasi", "Komparasi emiten", "Komparasi"],
];

function Icon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      {ICON[name]}
    </svg>
  );
}

// Desktop: unlabelled 56px rail. Phone: bottom bar with short labels.
export default function Rail() {
  return (
    <nav aria-label="Bagian dashboard"
      className="fixed z-30 bg-ground border-line bottom-0 inset-x-0 h-16 border-t flex md:top-0 md:bottom-0 md:right-auto md:w-14 md:h-auto md:border-t-0 md:border-r md:flex-col md:items-center">
      <a href="#" aria-label="Dashboard Saham, ke atas" className="hidden md:grid place-items-center h-14 w-full border-b border-line">
        <Mark />
      </a>
      <div className="flex flex-1 md:flex-none md:flex-col md:pt-3 md:gap-1">
        {ITEMS.map(([id, label, short]) => (
          <a key={id} href={`#${id}`} title={label} aria-label={label}
            className="flex flex-1 md:w-14 md:h-11 flex-col items-center justify-center gap-1 text-muted hover:text-ink transition-colors">
            <Icon name={id} />
            <span className="md:hidden text-[11px]" aria-hidden="true">{short}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
