// FLF Rental — main app
const { useState, useEffect, useMemo, useRef } = React;
const APP_TEAM = window.FLF.TEAM;
const APP_ITEMS = window.FLF.ITEMS;
const APP_ACTIVITY = window.FLF.ACTIVITY;
const { ItemDrawer, AddItemModal, StatusConfirmModal, ProfileDrawer } = window.FLFOverlays;
const { InventoryView, ActivityView, TeamView } = window.FLFViews;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light"
} /*EDITMODE-END*/;

function Header({ view, setView, query, setQuery, onAdd, theme, toggleTheme }) {
  const tabs = [
  { id: "inventory", label: "Inventory" },
  { id: "activity", label: "Activity" },
  { id: "team", label: "Team" }];

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">FLF</span>
        <span>Rental<em> &nbsp;system</em></span>
      </div>
      <nav className="nav">
        {tabs.map((t) =>
        <button key={t.id} className={view === t.id ? "active" : ""} onClick={() => setView(t.id)}>
            {t.label}
          </button>
        )}
      </nav>
      <div className="topbar-right">
        <div className="search">
          <span className="search-icon"><Icons.search size={15} /></span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items, IDs, people…" />
          
          <kbd>⌘K</kbd>
        </div>
        <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? <Icons.sun size={16} /> : <Icons.moon size={16} />}
        </button>
        <button className="btn btn-accent" onClick={onAdd}>
          <Icons.plus size={14} /> Add item
        </button>
      </div>
    </header>);

}

function PageHead({ view }) {
  if (view === "inventory") return (
    <div className="page-head">
      <div>
        <h1 className="page-title">@Tung's Inventory</h1>
        <div className="page-sub">Everything in the cage, on the road, and out for service.</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-ghost"><Icons.download size={14} /> Export CSV</button>
      </div>
    </div>);

  if (view === "activity") return (
    <div className="page-head">
      <div>
        <h1 className="page-title">Activity <em>log</em></h1>
        <div className="page-sub">Every check-in, check-out, and status change, newest first.</div>
      </div>
    </div>);

  if (view === "team") return (
    <div className="page-head">
      <div>
        <h1 className="page-title">Team</h1>
        <div className="page-sub">Who has what, right now.</div>
      </div>
    </div>);

}

function Toast({ msg }) {
  return (
    <div className={`toast ${msg ? "show" : ""}`}>
      <Icons.check size={14} className="tick" /> {msg}
    </div>);

}

function App() {
  // ----- state
  const [items, setItems] = useState(APP_ITEMS);
  const [activity, setActivity] = useState(APP_ACTIVITY);
  const [view, setView] = useState("inventory");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("id");
  const [selectedId, setSelectedId] = useState(null);
  const [drawerItem, setDrawerItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pending, setPending] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [toast, setToast] = useState("");

  // ----- tweaks (theme)
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme);
  }, [tweaks.theme]);
  const toggleTheme = () => setTweak("theme", tweaks.theme === "light" ? "dark" : "light");

  // ----- filtering
  const filtered = useMemo(() => {
    let r = items.slice();
    if (status !== "all") r = r.filter((i) => i.status === status);
    if (category !== "all") r = r.filter((i) => i.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((i) => {
        const u = i.assignee ? APP_TEAM.find((t) => t.id === i.assignee) : null;
        return (
          i.name.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          (i.location || "").toLowerCase().includes(q) ||
          u && u.name.toLowerCase().includes(q));

      });
    }
    if (sort === "name") r.sort((a, b) => a.name.localeCompare(b.name));else
    if (sort === "status") {
      const ord = { "missing": 0, "maintenance": 1, "checked-out": 2, "available": 3 };
      r.sort((a, b) => ord[a.status] - ord[b.status]);
    } else if (sort === "recent") {
      const order = activity.map((a) => a.item);
      r.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    } else r.sort((a, b) => a.id.localeCompare(b.id));
    return r;
  }, [items, status, category, query, sort, activity]);

  // ----- actions
  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  };

  const openDrawer = (id) => {
    setSelectedId(id);
    setDrawerItem(items.find((i) => i.id === id));
  };
  const closeDrawer = () => {setDrawerItem(null);setSelectedId(null);};

  const requestAction = (action, item) => setPending({ action, item });

  const confirmAction = ({ assignee, due, note }) => {
    if (!pending) return;
    const { action, item } = pending;
    setItems((prev) => prev.map((it) => {
      if (it.id !== item.id) return it;
      if (action === "checkout") return { ...it, status: "checked-out", assignee, since: due ? `until ${due}` : "today", note: note || it.note };
      if (action === "checkin") return { ...it, status: "available", assignee: undefined, since: undefined };
      if (action === "maintenance") return { ...it, status: "maintenance", assignee: undefined, since: undefined, note: note || it.note };
      return it;
    }));
    const verbs = { checkout: "Checked out", checkin: "Checked in", maintenance: "Sent for maintenance" };
    const userName = APP_TEAM.find((t) => t.id === assignee)?.name;
    setActivity((prev) => [{
      id: "a" + Date.now(),
      ts: "Just now",
      type: action,
      user: assignee || "u5",
      item: item.id,
      note: action === "checkout" && userName ? `Out until ${due}` : note || undefined
    }, ...prev]);
    setPending(null);
    // keep drawer in sync
    setDrawerItem((d) => d && d.id === item.id ? { ...d, status:
      action === "checkout" ? "checked-out" : action === "checkin" ? "available" : "maintenance"
    } : d);
    showToast(`${verbs[action]} · ${item.name}`);
  };

  const addItem = (form) => {
    const nextNum = String(items.length + 1).padStart(3, "0");
    const newItem = {
      id: `FLF-${nextNum}`,
      name: form.name,
      category: form.category,
      status: "available",
      location: form.location,
      serial: form.serial || undefined,
      note: form.note || undefined
    };
    setItems((prev) => [newItem, ...prev]);
    setActivity((prev) => [{
      id: "a" + Date.now(),
      ts: "Just now",
      type: "added",
      user: "u5",
      item: newItem.id,
      note: `Added to inventory · ${form.location}`
    }, ...prev]);
    setShowAdd(false);
    showToast(`Added · ${newItem.name}`);
  };

  // Tweaks UI
  const Tweaks = window.TweaksPanel ? window.TweaksPanel : null;
  const TweakRadio = window.TweakRadio;
  const TweakSection = window.TweakSection;

  return (
    <div className="app">
      <Header
        view={view} setView={setView}
        query={query} setQuery={setQuery}
        onAdd={() => setShowAdd(true)}
        theme={tweaks.theme} toggleTheme={toggleTheme} />
      
      <main className="main">
        <PageHead view={view} />
        {view === "inventory" &&
        <InventoryView
          items={filtered}
          allItems={items}
          selectedId={selectedId}
          onSelect={openDrawer}
          onQuickAction={requestAction}
          status={status} setStatus={setStatus}
          category={category} setCategory={setCategory}
          sort={sort} setSort={setSort} />

        }
        {view === "activity" && <ActivityView activity={activity} />}
        {view === "team" && <TeamView team={APP_TEAM} items={items} onSelect={(id) => setProfileUser(APP_TEAM.find(u => u.id === id))} />}
      </main>

      <ItemDrawer
        item={drawerItem}
        onClose={closeDrawer}
        history={activity}
        onAction={requestAction} />
      
      <ProfileDrawer
        user={profileUser}
        onClose={() => setProfileUser(null)}
        items={items}
        activity={activity} />
      
      <AddItemModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={addItem} />
      <StatusConfirmModal
        pending={pending}
        onClose={() => setPending(null)}
        onConfirm={confirmAction} />
      
      <Toast msg={toast} />

      {Tweaks &&
      <Tweaks>
          <TweakSection label="Appearance">
            <TweakRadio
            label="Theme"
            value={tweaks.theme}
            onChange={(v) => setTweak("theme", v)}
            options={["light", "dark"]} />
          
          </TweakSection>
        </Tweaks>
      }
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);