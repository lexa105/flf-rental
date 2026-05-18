import { Icons } from "./icons";
import type { ViewTab } from "./types";

const TABS: { id: ViewTab; label: string }[] = [
  { id: "inventory", label: "Inventory" },
  { id: "activity",  label: "Activity" },
  { id: "team",      label: "Team" },
];

export function Header({
  view,
  setView,
  query,
  setQuery,
  onAdd,
  theme,
  toggleTheme,
}: {
  view: ViewTab;
  setView: (v: ViewTab) => void;
  query: string;
  setQuery: (q: string) => void;
  onAdd: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  return (
    <header className="flex items-center gap-6 px-7 py-[14px] border-b border-border bg-surface sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-2.5 font-serif text-[19px] tracking-[-0.01em] font-medium">
        <span className="w-7 h-7 rounded-[6px] bg-ink text-paper grid place-items-center font-mono text-[11px] font-semibold tracking-[0.04em]">
          FLF
        </span>
        <span>
          Rental<em className="italic text-accent font-normal">&nbsp;system</em>
        </span>
      </div>

      {/* Nav tabs */}
      <nav className="flex gap-1 ml-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`bg-transparent border-0 px-3 py-[7px] rounded-md text-[13.5px] font-medium tracking-[-0.005em] transition-colors duration-[120ms] cursor-pointer ${
              view === t.id
                ? "bg-ink text-paper"
                : "text-ink-2 hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2.5">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-[7px] border border-border bg-paper rounded-md w-[280px] transition-colors duration-[120ms] focus-within:border-border-strong focus-within:bg-surface">
          <span className="text-muted grid place-items-center">
            <Icons.search size={15} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items, IDs, people…"
            className="bg-transparent border-0 outline-none flex-1 text-[13.5px] placeholder:text-muted"
          />
          <kbd className="font-mono text-[10.5px] text-muted border border-border bg-surface rounded-[3px] px-[5px] py-[1px]">
            ⌘K
          </kbd>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          className="w-8 h-8 grid place-items-center rounded-md border border-transparent bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
        >
          {theme === "dark" ? <Icons.sun size={16} /> : <Icons.moon size={16} />}
        </button>

        {/* Add item */}
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-md text-[13px] font-medium whitespace-nowrap border border-accent bg-accent text-accent-ink cursor-pointer hover:brightness-95 active:translate-y-px transition-all"
        >
          <Icons.plus size={14} /> Add item
        </button>
      </div>
    </header>
  );
}
