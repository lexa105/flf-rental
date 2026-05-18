import { useEffect, useState } from "react";
import { Icons } from "./icons";
import { Avatar, Pill, Thumb } from "./ui";
import { userById, categoryById, TEAM, CATEGORIES, LOCATIONS, STATUS_LABEL } from "./data";
import type { Item, ActivityEntry, TeamMember, PendingAction, StatusConfirmPayload } from "./types";

/* ── Item Drawer ─────────────────────────────────────────────────────── */
export function ItemDrawer({
  item, onClose, history, onAction,
}: {
  item: Item | null;
  onClose: () => void;
  history: ActivityEntry[];
  onAction: (action: "checkout" | "checkin" | "maintenance", item: Item) => void;
}) {
  const open = !!item;
  const [cached, setCached] = useState<Item | null>(item);
  useEffect(() => { if (item) setCached(item); }, [item]);
  const it = item || cached;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!it) return null;
  const assignee = it.assignee ? userById(it.assignee) : undefined;
  const cat = categoryById(it.category);
  const itemHistory = history.filter((h) => h.item === it.id);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[rgba(20,16,12,0.18)] backdrop-blur-[2px] z-50 transition-opacity duration-[180ms] ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[520px] max-w-[96vw] bg-surface border-l border-border z-[51] flex flex-col shadow-[0_1px_0_rgba(31,27,22,0.06),0_20px_60px_-20px_rgba(31,27,22,0.25)] transition-transform duration-[240ms] ease-[cubic-bezier(0.22,0.7,0.25,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Item details"
      >
        {/* Head */}
        <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[12px] text-muted">{it.id}</span>
            <Pill status={it.status} />
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 grid place-items-center rounded-md border border-transparent bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer">
            <Icons.close size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-[22px] py-[22px] pb-10">
          {/* Hero image placeholder */}
          <div className="drawer-hero-stripes relative w-full aspect-video rounded-[10px] bg-surface-2 border border-border grid place-items-center text-muted mb-[18px] overflow-hidden">
            <span className="relative font-mono text-[11px] bg-surface px-2.5 py-1 rounded-full border border-border">
              photo · drag image here
            </span>
          </div>

          <h2 className="font-serif text-[26px] font-medium tracking-[-0.015em] leading-[1.15] m-0 mb-1.5">{it.name}</h2>
          <div className="flex items-center gap-2.5 flex-wrap mb-[18px]">
            <span className="text-[12px] text-ink-2 before:content-[''] before:inline-block before:w-1.5 before:h-1.5 before:rounded-[2px] before:bg-border-strong before:mr-[7px] before:align-[1px]">
              {cat?.label}
            </span>
            <span className="text-muted text-[12.5px]">·</span>
            <span className="text-muted text-[12.5px]">{it.location}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-[22px] flex-wrap">
            {it.status === "available" && (
              <button
                onClick={() => onAction("checkout", it)}
                className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-md text-[13px] font-medium border border-ink bg-ink text-paper cursor-pointer hover:bg-ink-2 active:translate-y-px transition-all"
              >
                <Icons.arrowOut size={14} /> Check out
              </button>
            )}
            {it.status === "checked-out" && (
              <button
                onClick={() => onAction("checkin", it)}
                className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-md text-[13px] font-medium border border-ink bg-ink text-paper cursor-pointer hover:bg-ink-2 active:translate-y-px transition-all"
              >
                <Icons.arrowIn size={14} /> Check in
              </button>
            )}
            {it.status !== "maintenance" && (
              <button
                onClick={() => onAction("maintenance", it)}
                className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-md text-[13px] font-medium border border-border-strong bg-surface text-ink cursor-pointer hover:bg-surface-2 active:translate-y-px transition-all"
              >
                <Icons.wrench size={14} /> Mark maintenance
              </button>
            )}
            {it.status === "maintenance" && (
              <button
                onClick={() => onAction("checkin", it)}
                className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-md text-[13px] font-medium border border-border-strong bg-surface text-ink cursor-pointer hover:bg-surface-2 active:translate-y-px transition-all"
              >
                <Icons.check size={14} /> Mark available
              </button>
            )}
          </div>

          {/* Key-value details */}
          <dl className="grid gap-3 py-4 border-t border-b border-border mb-[18px]" style={{ gridTemplateColumns: "110px 1fr" }}>
            <dt className="text-[11px] uppercase tracking-[0.08em] text-muted font-medium">Assignee</dt>
            <dd className="m-0 text-[13.5px] text-ink">
              {assignee ? (
                <span className="inline-flex items-center gap-[9px]">
                  <Avatar user={assignee} />
                  <span>{assignee.name}</span>
                  <span className="text-muted">· {assignee.role}</span>
                </span>
              ) : (
                <span className="text-muted italic">Unassigned</span>
              )}
            </dd>
            <dt className="text-[11px] uppercase tracking-[0.08em] text-muted font-medium">Location</dt>
            <dd className="m-0 text-[13.5px] text-ink">{it.location}</dd>
            {it.since && (<><dt className="text-[11px] uppercase tracking-[0.08em] text-muted font-medium">Out since</dt><dd className="m-0 text-[13.5px] text-ink">{it.since}</dd></>)}
            {it.serial && (<><dt className="text-[11px] uppercase tracking-[0.08em] text-muted font-medium">Serial</dt><dd className="m-0 font-mono text-[12.5px] text-ink">{it.serial}</dd></>)}
            {it.note && (<><dt className="text-[11px] uppercase tracking-[0.08em] text-muted font-medium">Note</dt><dd className="m-0 text-[13.5px] text-ink">{it.note}</dd></>)}
          </dl>

          {/* History */}
          <h3 className="text-[11px] uppercase tracking-[0.08em] text-muted font-semibold mb-2.5">Activity</h3>
          <div className="flex flex-col gap-0.5">
            {itemHistory.length === 0 && (
              <div className="text-muted text-[13px] py-1.5">No recorded activity yet.</div>
            )}
            {itemHistory.map((h) => {
              const u = userById(h.user);
              return (
                <div key={h.id} className="grid gap-2.5 py-[9px] border-b border-dashed border-border last:border-b-0 items-start" style={{ gridTemplateColumns: "18px 1fr auto" }}>
                  <span className={`w-2 h-2 rounded-full mt-1.5 ${
                    h.type === "checkout" ? "bg-status-amber" :
                    h.type === "checkin" ? "bg-status-green" :
                    h.type === "maintenance" ? "bg-status-blue" :
                    h.type === "missing" ? "bg-status-red" : "bg-border-strong"
                  }`} />
                  <div className="text-[13px]">
                    <div>
                      <strong className="font-semibold">{u?.name}</strong>{" "}
                      <span className="text-muted">
                        {h.type === "checkout" ? "checked out" :
                         h.type === "checkin" ? "checked in" :
                         h.type === "maintenance" ? "sent to maintenance" :
                         h.type === "missing" ? "flagged missing" : "added"}
                      </span>
                    </div>
                    {h.note && <div className="text-[12.5px] text-muted mt-0.5">{h.note}</div>}
                  </div>
                  <span className="text-muted text-[11.5px] font-mono">{h.ts}</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── Add Item Modal ───────────────────────────────────────────────────── */
export function AddItemModal({
  open, onClose, onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: { name: string; category: string; location: string; serial: string; note: string }) => void;
}) {
  const [form, setForm] = useState({ name: "", category: "camera", location: LOCATIONS[0], serial: "", note: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
    setForm({ name: "", category: "camera", location: LOCATIONS[0], serial: "", note: "" });
  };

  const inputCls = "bg-paper border border-border-strong rounded-md px-[11px] py-[9px] text-[13.5px] outline-none transition-colors duration-[120ms] focus:border-accent w-full";
  const labelCls = "text-[11px] uppercase tracking-[0.08em] text-muted font-semibold";

  return (
    <div
      className={`fixed inset-0 bg-[rgba(20,16,12,0.32)] backdrop-blur-[3px] z-60 grid place-items-center transition-opacity duration-[160ms] ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      onClick={onClose}
    >
      <form
        className={`bg-surface border border-border rounded-xl shadow-[0_1px_0_rgba(31,27,22,0.06),0_20px_60px_-20px_rgba(31,27,22,0.25)] w-[520px] max-w-[94vw] max-h-[88vh] flex flex-col transition-[transform,opacity] duration-[160ms] ${open ? "translate-y-0 scale-100" : "translate-y-2.5 scale-[0.98]"}`}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-serif text-[20px] font-medium tracking-[-0.01em] m-0">Add to inventory</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 grid place-items-center rounded-md border border-transparent bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer">
            <Icons.close size={16} />
          </button>
        </div>

        <div className="px-5 py-[18px] overflow-auto">
          {/* Photo uploader */}
          <div className="border border-dashed border-border-strong rounded-lg bg-paper p-6 flex flex-col items-center gap-1.5 text-muted text-center mb-3.5">
            <Icons.image size={22} />
            <strong className="text-ink font-medium text-[13.5px]">Drop a photo or click to upload</strong>
            <small className="font-mono text-[11px]">PNG / JPG · 4MB max</small>
          </div>

          <div className="flex flex-col gap-1.5 mb-3.5">
            <label className={labelCls}>Name</label>
            <input value={form.name} onChange={set("name")} placeholder="Sony FX3 Body" autoFocus className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3.5">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Category</label>
              <select value={form.category} onChange={set("category")} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Location</label>
              <select value={form.location} onChange={set("location")} className={inputCls}>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-3.5">
            <label className={labelCls}>Serial (optional)</label>
            <input value={form.serial} onChange={set("serial")} placeholder="SN-…" className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Note (optional)</label>
            <textarea value={form.note} onChange={set("note")} rows={2} placeholder="Body only, w/ XLR top handle" className={inputCls + " resize-none"} />
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-border flex gap-2 justify-end bg-surface-2 rounded-b-xl">
          <button type="button" onClick={onClose} className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-md text-[13px] font-medium border border-transparent bg-transparent text-ink-2 cursor-pointer hover:bg-surface-2 hover:text-ink">
            Cancel
          </button>
          <button type="submit" disabled={!form.name.trim()} className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-md text-[13px] font-medium border border-ink bg-ink text-paper cursor-pointer hover:bg-ink-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <Icons.plus size={14} /> Add item
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Status Confirm Modal ─────────────────────────────────────────────── */
export function StatusConfirmModal({
  pending, onClose, onConfirm,
}: {
  pending: PendingAction | null;
  onClose: () => void;
  onConfirm: (payload: StatusConfirmPayload) => void;
}) {
  const open = !!pending;
  const [cached, setCached] = useState<PendingAction | null>(pending);
  useEffect(() => { if (pending) setCached(pending); }, [pending]);
  const p = pending || cached;

  const [assignee, setAssignee] = useState(TEAM[0].id);
  const [due, setDue] = useState("May 17");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (pending) {
      setAssignee(pending.item.assignee || TEAM[0].id);
      setDue("May 17");
      setNote("");
    }
  }, [pending]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!p) return null;

  const TITLES: Record<string, string> = {
    checkout: "Check out item", checkin: "Check in item", maintenance: "Send to maintenance",
  };

  const inputCls = "bg-paper border border-border-strong rounded-md px-[11px] py-[9px] text-[13.5px] outline-none transition-colors duration-[120ms] focus:border-accent w-full";
  const labelCls = "text-[11px] uppercase tracking-[0.08em] text-muted font-semibold";

  return (
    <div
      className={`fixed inset-0 bg-[rgba(20,16,12,0.32)] backdrop-blur-[3px] z-60 grid place-items-center transition-opacity duration-[160ms] ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      onClick={onClose}
    >
      <div
        className={`bg-surface border border-border rounded-xl shadow-[0_1px_0_rgba(31,27,22,0.06),0_20px_60px_-20px_rgba(31,27,22,0.25)] w-[460px] max-w-[94vw] flex flex-col transition-[transform,opacity] duration-[160ms] ${open ? "translate-y-0 scale-100" : "translate-y-2.5 scale-[0.98]"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-serif text-[20px] font-medium tracking-[-0.01em] m-0">{TITLES[p.action]}</h3>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-md border border-transparent bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer">
            <Icons.close size={16} />
          </button>
        </div>

        <div className="px-5 py-[18px]">
          {/* Item preview */}
          <div className="flex items-center gap-3 p-[10px] px-3 border border-border rounded-lg bg-surface-2 mb-4">
            <Thumb item={p.item} size={40} />
            <div>
              <div className="font-medium text-ink tracking-[-0.005em]">{p.item.name}</div>
              <div className="font-mono text-[11px] text-muted">{p.item.id} · {p.item.location}</div>
            </div>
          </div>

          {p.action === "checkout" && (
            <>
              <div className="flex flex-col gap-1.5 mb-3.5">
                <label className={labelCls}>Assignee</label>
                <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={inputCls}>
                  {TEAM.map((u) => <option key={u.id} value={u.id}>{u.name} · {u.role}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 mb-3.5">
                <label className={labelCls}>Expected return</label>
                <input value={due} onChange={(e) => setDue(e.target.value)} placeholder="May 17" className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Note (optional)</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Out for the rooftop shoot" className={inputCls} />
              </div>
            </>
          )}
          {p.action === "checkin" && (
            <p className="text-[13.5px] text-ink-2 my-1">
              Confirm <strong className="font-semibold">{p.item.name}</strong> has been returned and inspected. It will be marked available.
            </p>
          )}
          {p.action === "maintenance" && (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Reason</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Sensor cleaning" className={inputCls} />
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-border flex gap-2 justify-end bg-surface-2 rounded-b-xl">
          <button onClick={onClose} className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-md text-[13px] font-medium border border-transparent bg-transparent text-ink-2 cursor-pointer hover:bg-surface-2 hover:text-ink">
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ assignee, due, note })}
            className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-md text-[13px] font-medium border border-ink bg-ink text-paper cursor-pointer hover:bg-ink-2"
          >
            <Icons.check size={14} /> Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Profile Drawer ───────────────────────────────────────────────────── */
export function ProfileDrawer({
  user, onClose, items, activity,
}: {
  user: TeamMember | null;
  onClose: () => void;
  items: Item[];
  activity: ActivityEntry[];
}) {
  const open = !!user;
  const [cached, setCached] = useState<TeamMember | null>(user);
  useEffect(() => { if (user) setCached(user); }, [user]);
  const u = user || cached;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!u) return null;
  const holdings      = items.filter((i) => i.assignee === u.id);
  const userActivity  = activity.filter((a) => a.user === u.id).slice(0, 8);
  const checkoutCount = activity.filter((a) => a.user === u.id && a.type === "checkout").length;
  const checkinCount  = activity.filter((a) => a.user === u.id && a.type === "checkin").length;

  return (
    <>
      <div
        className={`fixed inset-0 bg-[rgba(20,16,12,0.18)] backdrop-blur-[2px] z-50 transition-opacity duration-[180ms] ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[560px] max-w-[96vw] bg-surface border-l border-border z-[51] flex flex-col shadow-[0_1px_0_rgba(31,27,22,0.06),0_20px_60px_-20px_rgba(31,27,22,0.25)] transition-transform duration-[240ms] ease-[cubic-bezier(0.22,0.7,0.25,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Team member profile"
      >
        {/* Cover image */}
        <div
          className="relative h-[140px] w-full flex-shrink-0 overflow-hidden"
          style={{ background: `linear-gradient(135deg, oklch(0.55 0.13 ${u.hue}), oklch(0.32 0.08 ${(u.hue + 40) % 360}))` }}
        >
          <div className="profile-cover-grain" />
        </div>

        {/* Floating header over cover */}
        <div className="absolute top-0 left-0 right-0 z-[3] flex items-center justify-between px-[18px] py-3.5" style={{ background: "linear-gradient(180deg, rgba(20,16,12,0.35), transparent)" }}>
          <span className="text-[12px] text-paper/70 font-mono">Profile · {u.id.toUpperCase()}</span>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-md text-paper hover:bg-white/10 cursor-pointer border-0 bg-transparent">
            <Icons.close size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-[22px] py-[22px] pb-10">
          {/* Profile head */}
          <div className="flex items-flex-end gap-4 -mt-14 mb-[18px] relative">
            <div className="flex-shrink-0 rounded-full p-1 bg-surface shadow-sm">
              <Avatar user={u} size={108} />
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="font-serif text-[26px] font-medium tracking-[-0.015em] leading-[1.1] m-0 mb-1">{u.name}</h2>
              <div className="flex items-center gap-2 text-[13px] text-muted">
                <span>{u.role}</span>
                {u.pronouns && <><span className="opacity-50">·</span><span>{u.pronouns}</span></>}
              </div>
            </div>
            <div className="flex items-center gap-1.5 pb-1">
              <button className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-md text-[13px] font-medium border border-ink bg-ink text-paper cursor-pointer hover:bg-ink-2 active:translate-y-px transition-all">
                <Icons.arrowOut size={14} /> Assign gear
              </button>
              <button className="w-8 h-8 grid place-items-center rounded-md border border-transparent bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer">
                <Icons.more size={15} />
              </button>
            </div>
          </div>

          {u.bio && (
            <p className="text-[13.5px] text-ink-2 mb-[18px] leading-[1.6] max-w-[56ch]">{u.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-px bg-border border border-border rounded-[10px] overflow-hidden mb-[18px]">
            {[
              { value: holdings.length,  label: "Currently holding" },
              { value: checkoutCount,     label: "Lifetime check-outs" },
              { value: checkinCount,      label: "Returns" },
            ].map((s) => (
              <div key={s.label} className="bg-surface-2 px-3.5 py-3 flex flex-col gap-1">
                <span className="font-serif text-[22px] font-medium tracking-[-0.015em] leading-none">{s.value}</span>
                <span className="text-[10.5px] uppercase tracking-[0.08em] text-muted font-medium">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Contact details */}
          <dl className="grid gap-3 py-4 border-t border-b border-border mb-[18px]" style={{ gridTemplateColumns: "110px 1fr" }}>
            <dt className="text-[11px] uppercase tracking-[0.08em] text-muted font-medium">Email</dt>
            <dd className="m-0 text-[13.5px]"><a href={`mailto:${u.email}`} className="text-accent no-underline border-b border-dotted border-border-strong hover:border-accent">{u.email}</a></dd>
            <dt className="text-[11px] uppercase tracking-[0.08em] text-muted font-medium">Phone</dt>
            <dd className="m-0 font-mono text-[12.5px] text-ink">{u.phone}</dd>
            <dt className="text-[11px] uppercase tracking-[0.08em] text-muted font-medium">Location</dt>
            <dd className="m-0 text-[13.5px] text-ink">{u.location}</dd>
            <dt className="text-[11px] uppercase tracking-[0.08em] text-muted font-medium">Joined</dt>
            <dd className="m-0 text-[13.5px] text-ink">{u.joined}</dd>
          </dl>

          {/* Holdings */}
          <h3 className="text-[11px] uppercase tracking-[0.08em] text-muted font-semibold mb-2.5">Currently holding</h3>
          {holdings.length === 0 ? (
            <div className="text-[12.5px] text-muted italic py-2 mb-[18px]">No items checked out right now.</div>
          ) : (
            <div className="flex flex-col gap-1.5 mb-[18px]">
              {holdings.map((it) => (
                <div key={it.id} className="flex items-center gap-3 px-2.5 py-2 bg-surface-2 border border-border rounded-lg">
                  <Thumb item={it} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[13.5px] text-ink">{it.name}</div>
                    <div className="font-mono text-[11px] text-muted mt-[1px]">{it.id} · {it.location}</div>
                  </div>
                  {it.since && (
                    <span className="text-[11px] font-mono text-muted bg-surface border border-border px-2 py-[3px] rounded-full flex-shrink-0">
                      since {it.since}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Recent activity */}
          <h3 className="text-[11px] uppercase tracking-[0.08em] text-muted font-semibold mb-2.5 mt-[18px]">Recent activity</h3>
          {userActivity.length === 0 ? (
            <div className="text-[12.5px] text-muted italic py-2">No recent activity.</div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {userActivity.map((a) => (
                <div key={a.id} className="grid gap-2.5 py-[9px] border-b border-dashed border-border last:border-b-0 items-start" style={{ gridTemplateColumns: "18px 1fr auto" }}>
                  <span className={`w-2 h-2 rounded-full mt-1.5 ${
                    a.type === "checkout" ? "bg-status-amber" :
                    a.type === "checkin" ? "bg-status-green" :
                    a.type === "maintenance" ? "bg-status-blue" :
                    a.type === "missing" ? "bg-status-red" : "bg-border-strong"
                  }`} />
                  <div className="text-[13px]">
                    <div>
                      <span className="text-muted">
                        {a.type === "checkout" ? "Checked out" :
                         a.type === "checkin" ? "Checked in" :
                         a.type === "maintenance" ? "Sent to maintenance" :
                         a.type === "missing" ? "Flagged missing" : "Added"}
                      </span>{" "}
                      <span className="font-mono text-[11.5px] text-muted">{a.item}</span>
                    </div>
                    {a.note && <div className="text-[12.5px] text-muted mt-0.5">{a.note}</div>}
                  </div>
                  <span className="text-muted text-[11.5px] font-mono">{a.ts}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
