import { Icons } from "./icons";
import { Avatar, Pill, Thumb } from "./ui";
import { CATEGORIES, userById, categoryById } from "./data";
import type { Item, ActivityEntry, TeamMember } from "./types";

/* ── Stat Row ─────────────────────────────────────────────────────────── */
function StatRow({ items }: { items: Item[] }) {
  const total       = items.length;
  const available   = items.filter((i) => i.status === "available").length;
  const checkedOut  = items.filter((i) => i.status === "checked-out").length;
  const maintenance = items.filter((i) => i.status === "maintenance").length;
  const missing     = items.filter((i) => i.status === "missing").length;

  return (
    <div className="grid grid-cols-4 gap-px bg-border border border-border rounded-[10px] overflow-hidden mb-[22px] max-[1100px]:grid-cols-2">
      {[
        { label: "Inventory",   value: total,                foot: "items tracked",     dot: null },
        { label: "Available",   value: available,            foot: "Ready to check out", dot: "bg-status-green" },
        { label: "In the field", value: checkedOut,          foot: "Checked out",        dot: "bg-status-amber" },
        { label: "Attention",   value: maintenance + missing, foot: `${maintenance} maintenance${missing > 0 ? ` · ${missing}  missing` : ""}`, dot: "bg-status-blue" },
      ].map((s) => (
        <div key={s.label} className="bg-surface px-5 py-4 flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.08em] text-muted font-medium">{s.label}</span>
          <span className="font-serif text-[30px] tracking-[-0.02em] leading-none font-medium">{s.value}</span>
          <span className="text-[12px] text-muted flex items-center gap-1.5">
            {s.dot && <span className={`w-[7px] h-[7px] rounded-full inline-block ${s.dot}`} />}
            {s.foot}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Filters bar ──────────────────────────────────────────────────────── */
function Filters({
  status, setStatus, category, setCategory, sort, setSort, counts,
}: {
  status: string; setStatus: (s: string) => void;
  category: string; setCategory: (c: string) => void;
  sort: string; setSort: (s: string) => void;
  counts: Record<string, number>;
}) {
  const tabs = [
    { id: "all",         label: "All",         count: counts.all },
    { id: "available",   label: "Available",   count: counts.available },
    { id: "checked-out", label: "Checked out", count: counts["checked-out"] },
    { id: "maintenance", label: "Maintenance", count: counts.maintenance },
    { id: "missing",     label: "Missing",     count: counts.missing },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap px-3 py-[10px] bg-surface border border-border rounded-t-[10px] border-b-0">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setStatus(t.id)}
          className={`inline-flex items-center gap-1.5 px-[10px] py-[5px] rounded-full text-[12.5px] font-medium border transition-colors duration-[120ms] cursor-pointer ${
            status === t.id
              ? "bg-ink text-paper border-ink"
              : "border-border-strong bg-paper text-ink-2 hover:bg-surface-2 hover:text-ink"
          }`}
        >
          {t.label}
          <span className="font-mono text-[10.5px] opacity-70 pl-0.5">{t.count}</span>
        </button>
      ))}

      <div className="w-px h-[18px] bg-border mx-1" />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="select-minimal appearance-none bg-paper border border-border-strong rounded-md px-[10px] pr-7 py-[5px] text-[12.5px] font-medium text-ink-2 cursor-pointer outline-none"
      >
        <option value="all">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>

      <div className="flex-1" />

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="select-minimal appearance-none bg-paper border border-border-strong rounded-md px-[10px] pr-7 py-[5px] text-[12.5px] font-medium text-ink-2 cursor-pointer outline-none"
      >
        <option value="id">Sort: ID</option>
        <option value="name">Sort: Name</option>
        <option value="status">Sort: Status</option>
        <option value="recent">Sort: Recently active</option>
      </select>
    </div>
  );
}

/* ── Inventory View ───────────────────────────────────────────────────── */
export function InventoryView({
  items, allItems, selectedId, onSelect, onQuickAction,
  status, setStatus, category, setCategory, sort, setSort,
}: {
  items: Item[]; allItems: Item[]; selectedId: string | null;
  onSelect: (id: string) => void;
  onQuickAction: (action: "checkout" | "checkin" | "maintenance" | "missing" | "delete", item: Item) => void;
  status: string; setStatus: (s: string) => void;
  category: string; setCategory: (c: string) => void;
  sort: string; setSort: (s: string) => void;
}) {
  const counts = {
    all:           allItems.length,
    available:     allItems.filter((i) => i.status === "available").length,
    "checked-out": allItems.filter((i) => i.status === "checked-out").length,
    maintenance:   allItems.filter((i) => i.status === "maintenance").length,
    missing:       allItems.filter((i) => i.status === "missing").length,
  };

  return (
    <>
      <StatRow items={allItems} />
      <Filters {...{ status, setStatus, category, setCategory, sort, setSort, counts }} />
      <div className="bg-surface border border-border rounded-b-[10px] overflow-hidden">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              <th className="text-left text-[11px] uppercase tracking-[0.08em] font-semibold text-muted px-3.5 py-[11px] border-b border-border bg-surface-2 w-[60px]" />
              <th className="text-left text-[11px] uppercase tracking-[0.08em] font-semibold text-muted px-3.5 py-[11px] border-b border-border bg-surface-2">Item</th>
              <th className="text-left text-[11px] uppercase tracking-[0.08em] font-semibold text-muted px-3.5 py-[11px] border-b border-border bg-surface-2 w-[140px]">Category</th>
              <th className="text-left text-[11px] uppercase tracking-[0.08em] font-semibold text-muted px-3.5 py-[11px] border-b border-border bg-surface-2 w-[150px]">Status</th>
              <th className="text-left text-[11px] uppercase tracking-[0.08em] font-semibold text-muted px-3.5 py-[11px] border-b border-border bg-surface-2 w-[200px]">Assignee</th>
              <th className="text-left text-[11px] uppercase tracking-[0.08em] font-semibold text-muted px-3.5 py-[11px] border-b border-border bg-surface-2 w-[200px] max-[720px]:hidden">Location</th>
              <th className="text-left text-[11px] uppercase tracking-[0.08em] font-semibold text-muted px-3.5 py-[11px] border-b border-border bg-surface-2 w-[80px]" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-muted">
                  No items match these filters.
                </td>
              </tr>
            )}
            {items.map((it) => {
              const assignee = it.assignee ? userById(it.assignee) : undefined;
              const cat = categoryById(it.category);
              const isSelected = selectedId === it.id;
              return (
                <tr
                  key={it.id}
                  className={`group border-b border-border last:border-b-0 cursor-pointer transition-colors duration-100 ${
                    isSelected ? "bg-accent-soft" : "hover:bg-surface-2"
                  }`}
                  onClick={() => onSelect(it.id)}
                >
                  <td className="px-3.5 py-3 align-middle">
                    <Thumb item={it} />
                  </td>
                  <td className="px-3.5 py-3 align-middle">
                    <div className="font-medium text-ink tracking-[-0.005em]">{it.name}</div>
                    <div className="font-mono text-[11px] text-muted mt-0.5">
                      {it.code}{it.note ? ` · ${it.note}` : ""}
                    </div>
                  </td>
                  <td className="px-3.5 py-3 align-middle">
                    <span className="text-[12px] text-ink-2 before:content-[''] before:inline-block before:w-1.5 before:h-1.5 before:rounded-[2px] before:bg-border-strong before:mr-[7px] before:align-[1px]">
                      {cat?.label}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 align-middle">
                    <Pill status={it.status} />
                  </td>
                  <td className="px-3.5 py-3 align-middle">
                    {assignee ? (
                      <span className="inline-flex items-center gap-[9px]">
                        <Avatar user={assignee} />
                        <span className="text-ink">{assignee.name}</span>
                      </span>
                    ) : (
                      <span className="text-muted italic">—</span>
                    )}
                  </td>
                  <td className="px-3.5 py-3 align-middle text-ink-2 max-[720px]:hidden">
                    {it.location}
                    {it.since && <div className="text-muted text-[11.5px]">since {it.since}</div>}
                  </td>
                  <td className="px-3.5 py-3 align-middle">
                    <div
                      className={`row-actions flex items-center gap-1 opacity-0 transition-opacity duration-100 ${isSelected ? "opacity-100" : "group-hover:opacity-100"}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {it.status === "available" && (
                        <button
                          className="w-8 h-8 grid place-items-center rounded-md border border-transparent bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer"
                          onClick={() => onQuickAction("checkout", it)}
                          title="Check out"
                        >
                          <Icons.arrowOut size={15} />
                        </button>
                      )}
                      {it.status === "checked-out" && (
                        <button
                          className="w-8 h-8 grid place-items-center rounded-md border border-transparent bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer"
                          onClick={() => onQuickAction("checkin", it)}
                          title="Check in"
                        >
                          <Icons.arrowIn size={15} />
                        </button>
                      )}
                      <button
                        className="w-8 h-8 grid place-items-center rounded-md border border-transparent bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer"
                        onClick={() => onSelect(it.id)}
                        title="Details"
                      >
                        <Icons.more size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Activity View ────────────────────────────────────────────────────── */
const ICON_CLASS: Record<string, string> = {
  checkout:    "text-status-amber bg-amber-soft",
  checkin:     "text-status-green bg-green-soft",
  maintenance: "text-status-blue bg-blue-soft",
  missing:     "text-status-red bg-red-soft",
  added:       "text-ink-2 bg-surface-2 border border-border",
  deleted:     "text-status-red bg-red-soft",
};

const ACTION_VERB: Record<string, string> = {
  checkout:    "checked out",
  checkin:     "checked in",
  maintenance: "sent to maintenance",
  missing:     "flagged as missing",
  added:       "added",
  deleted:     "deleted",
};

function activityIcon(type: string) {
  if (type === "checkout")    return <Icons.arrowOut size={14} />;
  if (type === "checkin")     return <Icons.arrowIn size={14} />;
  if (type === "maintenance") return <Icons.wrench size={14} />;
  if (type === "missing")     return <Icons.warn size={14} />;
  if (type === "deleted")     return <Icons.trash size={14} />;
  return <Icons.plus size={14} />;
}

export function ActivityView({ activity }: { activity: ActivityEntry[] }) {
  return (
    <div className="bg-surface border border-border rounded-[10px] py-1">
      {activity.map((a) => {
        const userName = a.userName ?? userById(a.user)?.name;
        return (
          <div
            key={a.id}
            className="grid gap-3.5 px-[22px] py-3.5 border-b border-border last:border-b-0 items-center"
            style={{ gridTemplateColumns: "130px 30px 1fr" }}
          >
            <span className="font-mono text-[11.5px] text-muted">{a.ts}</span>
            <span className={`w-7 h-7 rounded-full grid place-items-center ${ICON_CLASS[a.type] ?? "text-ink-2 bg-surface-2"}`}>
              {activityIcon(a.type)}
            </span>
            <div>
              <div className="text-[13.5px]">
                <strong className="font-semibold text-ink">{userName}</strong>{" "}
                <span className="text-muted">{ACTION_VERB[a.type]}</span>{" "}
                {a.itemName && <span className="text-ink">{a.itemName}</span>}{" "}
                <span className="font-mono text-[11.5px] text-muted">{a.itemCode ?? a.item}</span>
              </div>
              {a.note && <div className="text-[12.5px] text-muted mt-0.5">{a.note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Team View ────────────────────────────────────────────────────────── */
export function TeamView({
  team, items, onSelect,
}: {
  team: TeamMember[];
  items: Item[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
      {team.map((u) => {
        const checked = items.filter((i) => i.assignee === u.id);
        return (
          <button
            key={u.id}
            type="button"
            onClick={() => onSelect(u.id)}
            className="group bg-surface border border-border rounded-[10px] p-4 flex flex-col gap-3.5 text-left font-[inherit] text-[inherit] cursor-pointer transition-all duration-[140ms] hover:border-border-strong hover:-translate-y-px hover:shadow-[0_1px_0_rgba(31,27,22,0.04),0_2px_6px_rgba(31,27,22,0.04)]"
          >
            <div className="flex items-center gap-3">
              <Avatar user={u} size={48} />
              <div className="flex-1 min-w-0">
                <div className="font-serif text-[17px] font-medium tracking-[-0.01em] leading-[1.1]">{u.name}</div>
                <div className="text-[12px] text-muted mt-0.5">{u.role}</div>
              </div>
              <span className="w-[26px] h-[26px] rounded-md grid place-items-center text-muted opacity-0 translate-x-[-3px] translate-y-[3px] group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:bg-surface-2 group-hover:text-accent transition-all duration-[160ms]">
                <Icons.arrowOut size={13} />
              </span>
            </div>

            <div className="flex flex-col gap-1.5 pt-3 border-t border-dashed border-border">
              <div className="text-[11px] uppercase tracking-[0.08em] text-muted font-semibold flex justify-between">
                <span>Currently holding</span>
                <span>{checked.length}</span>
              </div>
              {checked.length === 0 && (
                <div className="text-[12.5px] text-muted italic py-1">No items checked out</div>
              )}
              {checked.slice(0, 4).map((it) => (
                <div key={it.id} className="text-[12.5px] flex justify-between items-center py-1">
                  <span>{it.name}</span>
                  <span className="font-mono text-[11px] text-muted">{it.code}</span>
                </div>
              ))}
              {checked.length > 4 && (
                <div className="text-[12.5px] text-muted italic py-1">
                  + {checked.length - 4} more
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
