"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import { Header } from "./Header";
import { InventoryView, ActivityView, TeamView } from "./views";
import { ItemDrawer, AddItemModal, StatusConfirmModal, ProfileDrawer } from "./overlays";
import { Icons } from "./icons";
import { ITEMS, ACTIVITY, TEAM, userById } from "./data";
import type {
  Item, ActivityEntry, TeamMember, ViewTab, PendingAction, StatusConfirmPayload,
} from "./types";

function PageHead({ view }: { view: ViewTab }) {
  if (view === "inventory") return (
    <div className="flex items-end justify-between mb-[22px] gap-6">
      <div>
        <h1 className="font-serif text-[32px] font-medium tracking-[-0.015em] leading-[1.05] m-0">
          @Tung&apos;s Inventory
        </h1>
        <div className="text-[13px] text-muted mt-1.5">
          Everything in the cage, on the road, and out for service.
        </div>
      </div>
      <div className="flex gap-2">
        <button className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-md text-[13px] font-medium border border-transparent bg-transparent text-ink-2 cursor-pointer hover:bg-surface-2 hover:text-ink">
          <Icons.download size={14} /> Export CSV
        </button>
      </div>
    </div>
  );

  if (view === "activity") return (
    <div className="flex items-end justify-between mb-[22px] gap-6">
      <div>
        <h1 className="font-serif text-[32px] font-medium tracking-[-0.015em] leading-[1.05] m-0">
          Activity <em className="italic text-accent font-normal">log</em>
        </h1>
        <div className="text-[13px] text-muted mt-1.5">
          Every check-in, check-out, and status change, newest first.
        </div>
      </div>
    </div>
  );

  if (view === "team") return (
    <div className="flex items-end justify-between mb-[22px] gap-6">
      <div>
        <h1 className="font-serif text-[32px] font-medium tracking-[-0.015em] leading-[1.05] m-0">
          Team
        </h1>
        <div className="text-[13px] text-muted mt-1.5">Who has what, right now.</div>
      </div>
    </div>
  );

  return null;
}

export default function InventoryApp() {
  const [items, setItems]           = useState<Item[]>(ITEMS);
  const [activity, setActivity]     = useState<ActivityEntry[]>(ACTIVITY);
  const [view, setView]             = useState<ViewTab>("inventory");
  const [query, setQuery]           = useState("");
  const [status, setStatus]         = useState("all");
  const [category, setCategory]     = useState("all");
  const [sort, setSort]             = useState("id");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerItem, setDrawerItem] = useState<Item | null>(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [pending, setPending]       = useState<PendingAction | null>(null);
  const [profileUser, setProfileUser] = useState<TeamMember | null>(null);
  const { theme, toggleTheme } = useTheme();

  // Filtering + sorting
  const filtered = useMemo(() => {
    let r = items.slice();
    if (status !== "all")   r = r.filter((i) => i.status === status);
    if (category !== "all") r = r.filter((i) => i.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((i) => {
        const u = i.assignee ? userById(i.assignee) : undefined;
        return (
          i.name.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          (i.location || "").toLowerCase().includes(q) ||
          (u && u.name.toLowerCase().includes(q))
        );
      });
    }
    if (sort === "name") {
      r.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "status") {
      const ord: Record<string, number> = { missing: 0, maintenance: 1, "checked-out": 2, available: 3 };
      r.sort((a, b) => (ord[a.status] ?? 4) - (ord[b.status] ?? 4));
    } else if (sort === "recent") {
      const order = activity.map((a) => a.item);
      r.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    } else {
      r.sort((a, b) => a.id.localeCompare(b.id));
    }
    return r;
  }, [items, status, category, query, sort, activity]);

  // Drawer
  const openDrawer = (id: string) => {
    setSelectedId(id);
    setDrawerItem(items.find((i) => i.id === id) ?? null);
  };
  const closeDrawer = () => { setDrawerItem(null); setSelectedId(null); };

  // Status actions
  const requestAction = (action: "checkout" | "checkin" | "maintenance", item: Item) =>
    setPending({ action, item });

  const confirmAction = ({ assignee, due, note }: StatusConfirmPayload) => {
    if (!pending) return;
    const { action, item } = pending;
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== item.id) return it;
        if (action === "checkout")    return { ...it, status: "checked-out", assignee, since: due ? `until ${due}` : "today", note: note || it.note };
        if (action === "checkin")     return { ...it, status: "available",   assignee: undefined, since: undefined };
        if (action === "maintenance") return { ...it, status: "maintenance", assignee: undefined, since: undefined, note: note || it.note };
        return it;
      })
    );
    const verbs: Record<string, string> = { checkout: "Checked out", checkin: "Checked in", maintenance: "Sent for maintenance" };
    const userName = userById(assignee)?.name;
    setActivity((prev) => [{
      id: "a" + Date.now(),
      ts: "Just now",
      type: action,
      user: assignee || "u5",
      item: item.id,
      note: action === "checkout" && userName ? `Out until ${due}` : note || undefined,
    }, ...prev]);
    setPending(null);
    setDrawerItem((d) =>
      d && d.id === item.id
        ? { ...d, status: action === "checkout" ? "checked-out" : action === "checkin" ? "available" : "maintenance" }
        : d
    );
    toast.success(`${verbs[action]} · ${item.name}`);
  };

  // Add item
  const addItem = (form: { name: string; category: string; location: string; serial: string; note: string }) => {
    const nextNum = String(items.length + 1).padStart(3, "0");
    const newItem: Item = {
      id:       `FLF-${nextNum}`,
      name:     form.name,
      category: form.category as Item["category"],
      status:   "available",
      location: form.location,
      serial:   form.serial || undefined,
      note:     form.note || undefined,
    };
    setItems((prev) => [newItem, ...prev]);
    setActivity((prev) => [{
      id:   "a" + Date.now(),
      ts:   "Just now",
      type: "added",
      user: "u5",
      item: newItem.id,
      note: `Added to inventory · ${form.location}`,
    }, ...prev]);
    setShowAdd(false);
    toast.success(`Added · ${newItem.name}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink antialiased">
      <Header
        view={view} setView={setView}
        query={query} setQuery={setQuery}
        onAdd={() => setShowAdd(true)}
        theme={theme} toggleTheme={toggleTheme}
      />

      <main className="px-7 py-7 pb-20 max-w-[1480px] w-full mx-auto flex-1 max-[720px]:px-4 max-[720px]:py-4">
        <PageHead view={view} />

        {view === "inventory" && (
          <InventoryView
            items={filtered} allItems={items}
            selectedId={selectedId} onSelect={openDrawer}
            onQuickAction={requestAction}
            status={status} setStatus={setStatus}
            category={category} setCategory={setCategory}
            sort={sort} setSort={setSort}
          />
        )}
        {view === "activity" && <ActivityView activity={activity} />}
        {view === "team" && (
          <TeamView
            team={TEAM} items={items}
            onSelect={(id) => setProfileUser(TEAM.find((u) => u.id === id) ?? null)}
          />
        )}
      </main>

      <ItemDrawer item={drawerItem} onClose={closeDrawer} history={activity} onAction={requestAction} />
      <ProfileDrawer user={profileUser} onClose={() => setProfileUser(null)} items={items} activity={activity} />
      <AddItemModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={addItem} />
      <StatusConfirmModal pending={pending} onClose={() => setPending(null)} onConfirm={confirmAction} />
    </div>
  );
}
