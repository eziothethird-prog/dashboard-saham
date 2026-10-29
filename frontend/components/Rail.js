"use client";
import { Mark } from "@/components/SearchBar";

const ICON = {
  grafik: <path d="M3 17l5-6 4 3 6-8 3 3" />,
  teknikal: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  peers: <><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M3 10h18M9 10v10" /></>,
  fundamental: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 12h7M9 16h7" /></>,
  prediksi: <><path d="M3 18l5-5 4 3 3-4" /><path d="M17 9l4-4" strokeDasharray="2 2" /></>,
  simulasi: <><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h6M9 12h1M14 12h1M9 16h1M14 16h1" /></>,
  ai: <path d="M4 5h16v11H9l-5 4z" />,
};

// [id, label, short label for the phone bar]; the phone bar keeps five items so each label fits a thumb.
const ITEMS = [
  ["grafik", "Grafik", "Grafik"],
  ["teknikal", "Teknikal", "Teknikal"],
  ["peers", "Peers", "Peers"],
  ["fundamental", "Fundamental", "Fundam."],
  ["prediksi", "Proyeksi", null],
  ["simulasi", "Simulasi posisi", null],
];

function Icon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      {ICON[name]}
    </svg>
  );
}

// Desktop: unlabelled 56px rail. Phone: bottom bar with short labels.
export default function Rail({ hasData, onChat }) {
  return (
    <nav aria-label="Bagian dashboard"
      className={`fixed z-30 bg-ground border-line
                 bottom-0 inset-x-0 h-16 border-t ${hasData ? "flex" : "hidden md:flex"}
                 md:top-0 md:bottom-0 md:right-auto md:w-14 md:h-auto md:border-t-0 md:border-r md:flex-col md:items-center`}>
      <a href="#" aria-label="Dashboard Saham, ke atas" className="hidden md:grid place-items-center h-14 w-full border-b border-line">
        <Mark />
      </a>
      {hasData && (
        <div className="flex flex-1 md:flex-none md:flex-col md:pt-3 md:gap-1 overflow-x-auto">
          {ITEMS.map(([id, label, short]) => (
            <a key={id} href={`#${id}`} title={label} aria-label={label}
              className={`${short ? "flex" : "hidden md:flex"} flex-1 min-w-14 md:w-14 md:h-11 flex-col items-center justify-center gap-1 text-muted hover:text-ink transition-colors`}>
              <Icon name={id} />
              <span className="md:hidden text-[11px]" aria-hidden="true">{short}</span>
            </a>
          ))}
          <button onClick={onChat} title="Tanya AI" aria-label="Tanya AI"
            className="flex-1 min-w-14 md:w-14 md:h-11 md:mt-4 flex flex-col items-center justify-center gap-1 text-muted hover:text-ink transition-colors">
            <Icon name="ai" />
            <span className="md:hidden text-[11px]" aria-hidden="true">Tanya AI</span>
          </button>
        </div>
      )}
    </nav>
  );
}
