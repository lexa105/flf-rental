// FLF Rental — Inventory table, Activity, Team views
const { Avatar: V_Avatar, Pill: V_Pill, Thumb: V_Thumb, userById: V_user, categoryById: V_cat } = window.FLFUI;
const { CATEGORIES: V_CATS } = window.FLF;

function StatRow({ items }) {
  const total = items.length;
  const available = items.filter((i) => i.status === "available").length;
  const checkedOut = items.filter((i) => i.status === "checked-out").length;
  const maintenance = items.filter((i) => i.status === "maintenance").length;
  const missing = items.filter((i) => i.status === "missing").length;
  return (
    <div className="stats">
      <div className="stat">
        <span className="stat-label">Inventory</span>
        <span className="stat-value">{total}</span>
        <span className="stat-foot">items tracked</span>
      </div>
      <div className="stat">
        <span className="stat-label">Available</span>
        <span className="stat-value">{available}</span>
        <span className="stat-foot"><span className="dot dot-green" /> Ready to check out</span>
      </div>
      <div className="stat">
        <span className="stat-label">In the field</span>
        <span className="stat-value">{checkedOut}</span>
        <span className="stat-foot"><span className="dot dot-amber" /> Checked out</span>
      </div>
      <div className="stat">
        <span className="stat-label">Attention</span>
        <span className="stat-value">{maintenance + missing}</span>
        <span className="stat-foot">
          <span className="dot dot-blue" /> {maintenance} maintenance
          {missing > 0 && <><span style={{ margin: "0 4px" }}>·</span><span className="dot dot-red" /> {missing} missing</>}
        </span>
      </div>
    </div>
  );
}

function Filters({ status, setStatus, category, setCategory, sort, setSort, counts }) {
  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "available", label: "Available", count: counts.available },
    { id: "checked-out", label: "Checked out", count: counts["checked-out"] },
    { id: "maintenance", label: "Maintenance", count: counts.maintenance },
    { id: "missing", label: "Missing", count: counts.missing },
  ];
  return (
    <div className="filters">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`chip ${status === t.id ? "active" : ""}`}
          onClick={() => setStatus(t.id)}
        >
          {t.label}<span className="chip-count">{t.count}</span>
        </button>
      ))}
      <div className="filters-divider" />
      <select className="minimal" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">All categories</option>
        {V_CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      <div className="spacer" />
      <select className="minimal" value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="id">Sort: ID</option>
        <option value="name">Sort: Name</option>
        <option value="status">Sort: Status</option>
        <option value="recent">Sort: Recently active</option>
      </select>
    </div>
  );
}

function InventoryView({ items, allItems, selectedId, onSelect, onQuickAction, status, setStatus, category, setCategory, sort, setSort }) {
  const counts = {
    all: allItems.length,
    available: allItems.filter((i) => i.status === "available").length,
    "checked-out": allItems.filter((i) => i.status === "checked-out").length,
    maintenance: allItems.filter((i) => i.status === "maintenance").length,
    missing: allItems.filter((i) => i.status === "missing").length,
  };

  return (
    <>
      <StatRow items={allItems} />
      <Filters {...{ status, setStatus, category, setCategory, sort, setSort, counts }} />
      <div className="table-wrap">
        <table className="inv">
          <thead>
            <tr>
              <th style={{ width: 60 }}></th>
              <th>Item</th>
              <th style={{ width: 140 }}>Category</th>
              <th style={{ width: 150 }}>Status</th>
              <th style={{ width: 200 }}>Assignee</th>
              <th style={{ width: 200 }} className="col-loc">Location</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
                No items match these filters.
              </td></tr>
            )}
            {items.map((it) => {
              const assignee = it.assignee ? V_user(it.assignee) : null;
              const cat = V_cat(it.category);
              return (
                <tr key={it.id} className={selectedId === it.id ? "selected" : ""} onClick={() => onSelect(it.id)}>
                  <td><V_Thumb item={it} /></td>
                  <td>
                    <div className="item-name">{it.name}</div>
                    <div className="item-id">{it.id}{it.note ? ` · ${it.note}` : ""}</div>
                  </td>
                  <td><span className="cat-tag">{cat?.label}</span></td>
                  <td><V_Pill status={it.status} /></td>
                  <td>
                    {assignee ? (
                      <span className="cell-assignee">
                        <V_Avatar user={assignee} />
                        <span className="name">{assignee.name}</span>
                      </span>
                    ) : (
                      <span className="assignee-empty">—</span>
                    )}
                  </td>
                  <td className="col-loc cell-loc">
                    {it.location}
                    {it.since && <div className="since">since {it.since}</div>}
                  </td>
                  <td>
                    <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                      {it.status === "available" && (
                        <button className="icon-btn" onClick={() => onQuickAction("checkout", it)} title="Check out">
                          <Icons.arrowOut size={15} />
                        </button>
                      )}
                      {it.status === "checked-out" && (
                        <button className="icon-btn" onClick={() => onQuickAction("checkin", it)} title="Check in">
                          <Icons.arrowIn size={15} />
                        </button>
                      )}
                      <button className="icon-btn" onClick={() => onSelect(it.id)} title="Details">
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

function ActivityView({ activity }) {
  const iconFor = (type) => {
    if (type === "checkout") return <Icons.arrowOut size={14} />;
    if (type === "checkin") return <Icons.arrowIn size={14} />;
    if (type === "maintenance") return <Icons.wrench size={14} />;
    if (type === "missing") return <Icons.warn size={14} />;
    return <Icons.plus size={14} />;
  };
  const verb = (type) => ({
    checkout: "checked out",
    checkin: "checked in",
    maintenance: "sent to maintenance",
    missing: "flagged as missing",
    added: "added"
  })[type];

  return (
    <div className="activity-card">
      {activity.map((a) => {
        const u = V_user(a.user);
        return (
          <div className="activity-row" key={a.id}>
            <span className="activity-ts">{a.ts}</span>
            <span className={`activity-icon activity-icon-${a.type}`}>{iconFor(a.type)}</span>
            <div>
              <div className="activity-text">
                <strong>{u?.name}</strong>{" "}
                <span style={{ color: "var(--muted)" }}>{verb(a.type)}</span>{" "}
                <span className="id">{a.item}</span>
              </div>
              {a.note && <div className="activity-note">{a.note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TeamView({ team, items, onSelect }) {
  return (
    <div className="team-grid">
      {team.map((u) => {
        const checked = items.filter((i) => i.assignee === u.id);
        return (
          <button className="team-card" key={u.id} onClick={() => onSelect && onSelect(u.id)} type="button">
            <div className="team-card-head">
              <V_Avatar user={u} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="team-name">{u.name}</div>
                <div className="team-role">{u.role}</div>
              </div>
              <span className="team-card-chev" aria-hidden="true">
                <Icons.arrowOut size={13} />
              </span>
            </div>
            <div className="holdings">
              <div className="holdings-head">
                <span>Currently holding</span>
                <span>{checked.length}</span>
              </div>
              {checked.length === 0 && (
                <div className="empty-holdings">No items checked out</div>
              )}
              {checked.slice(0, 4).map((it) => (
                <div className="holding-item" key={it.id}>
                  <span>{it.name}</span>
                  <span className="id">{it.id}</span>
                </div>
              ))}
              {checked.length > 4 && (
                <div className="holding-item" style={{ color: "var(--muted)", fontStyle: "italic" }}>
                  <span>+ {checked.length - 4} more</span>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

window.FLFViews = { InventoryView, ActivityView, TeamView };
