// FLF Rental — Drawer, AddModal, StatusModal
const { Avatar, Pill, Thumb, userById, categoryById, STATUS_LABEL } = window.FLFUI;
const { TEAM: T_TEAM, CATEGORIES: T_CATS, LOCATIONS: T_LOCS } = window.FLF;

function ItemDrawer({ item, onClose, history, onAction }) {
  const open = !!item;
  // Hold the last item so the drawer can animate out without flashing empty.
  const [cached, setCached] = React.useState(item);
  React.useEffect(() => { if (item) setCached(item); }, [item]);
  const it = item || cached;

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!it) return null;
  const assignee = it.assignee ? userById(it.assignee) : null;
  const cat = categoryById(it.category);
  const itemHistory = history.filter((h) => h.item === it.id);

  return (
    <>
      <div className={`drawer-backdrop ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`drawer ${open ? "open" : ""}`} role="dialog" aria-label="Item details">
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="item-id" style={{ fontSize: 12 }}>{it.id}</span>
            <Pill status={it.status} />
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icons.close size={16} />
          </button>
        </div>
        <div className="drawer-body">
          <div className="drawer-hero">
            <span className="ph-text">photo · drag image here</span>
          </div>

          <h2>{it.name}</h2>
          <div className="meta-row">
            <span className="cat-tag">{cat?.label}</span>
            <span style={{ color: "var(--muted)", fontSize: 12.5 }}>·</span>
            <span style={{ color: "var(--muted)", fontSize: 12.5 }}>{it.location}</span>
          </div>

          <div className="action-row">
            {it.status === "available" && (
              <button className="btn btn-primary" onClick={() => onAction("checkout", it)}>
                <Icons.arrowOut size={14} /> Check out
              </button>
            )}
            {it.status === "checked-out" && (
              <button className="btn btn-primary" onClick={() => onAction("checkin", it)}>
                <Icons.arrowIn size={14} /> Check in
              </button>
            )}
            {it.status !== "maintenance" && (
              <button className="btn" onClick={() => onAction("maintenance", it)}>
                <Icons.wrench size={14} /> Mark maintenance
              </button>
            )}
            {it.status === "maintenance" && (
              <button className="btn" onClick={() => onAction("checkin", it)}>
                <Icons.check size={14} /> Mark available
              </button>
            )}
          </div>

          <dl className="kv">
            <dt>Assignee</dt>
            <dd>
              {assignee ? (
                <span className="cell-assignee">
                  <Avatar user={assignee} />
                  <span className="name">{assignee.name}</span>
                  <span style={{ color: "var(--muted)" }}>· {assignee.role}</span>
                </span>
              ) : (
                <span className="assignee-empty">Unassigned</span>
              )}
            </dd>
            <dt>Location</dt><dd>{it.location}</dd>
            {it.since && (<><dt>Out since</dt><dd>{it.since}</dd></>)}
            {it.serial && (<><dt>Serial</dt><dd style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{it.serial}</dd></>)}
            {it.note && (<><dt>Note</dt><dd>{it.note}</dd></>)}
          </dl>

          <h3 className="section-title">Activity</h3>
          <div className="history-list">
            {itemHistory.length === 0 && (
              <div style={{ color: "var(--muted)", fontSize: 13, padding: "6px 0" }}>No recorded activity yet.</div>
            )}
            {itemHistory.map((h) => {
              const u = userById(h.user);
              return (
                <div className="history-item" key={h.id}>
                  <span className={`history-dot ${
                    h.type === "checkout" ? "dot-amber" :
                    h.type === "checkin" ? "dot-green" :
                    h.type === "maintenance" ? "dot-blue" :
                    h.type === "missing" ? "dot-red" : ""}`} />
                  <div>
                    <div>
                      <strong>{u?.name}</strong>{" "}
                      <span style={{ color: "var(--muted)" }}>
                        {h.type === "checkout" ? "checked out" :
                         h.type === "checkin" ? "checked in" :
                         h.type === "maintenance" ? "sent to maintenance" :
                         h.type === "missing" ? "flagged missing" : "added"}
                      </span>
                    </div>
                    {h.note && <div className="activity-note">{h.note}</div>}
                  </div>
                  <span className="history-ts">{h.ts}</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}

function AddItemModal({ open, onClose, onSubmit }) {
  const [form, setForm] = React.useState({
    name: "", category: "camera", location: T_LOCS[0], serial: "", note: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e?.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
    setForm({ name: "", category: "camera", location: T_LOCS[0], serial: "", note: "" });
  };
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={`modal-backdrop ${open ? "open" : ""}`} onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <h3>Add to inventory</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icons.close size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div className="uploader">
            <Icons.image size={22} />
            <strong>Drop a photo or click to upload</strong>
            <small>PNG / JPG · 4MB max</small>
          </div>
          <div style={{ height: 14 }} />
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={set("name")} placeholder="Sony FX3 Body" autoFocus />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={set("category")}>
                {T_CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Location</label>
              <select value={form.location} onChange={set("location")}>
                {T_LOCS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Serial (optional)</label>
            <input value={form.serial} onChange={set("serial")} placeholder="SN-…" />
          </div>
          <div className="field">
            <label>Note (optional)</label>
            <textarea value={form.note} onChange={set("note")} rows={2} placeholder="Body only, w/ XLR top handle" />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!form.name.trim()}>
            <Icons.plus size={14} /> Add item
          </button>
        </div>
      </form>
    </div>
  );
}

function StatusConfirmModal({ pending, onClose, onConfirm }) {
  const open = !!pending;
  const [cached, setCached] = React.useState(pending);
  React.useEffect(() => { if (pending) setCached(pending); }, [pending]);
  const p = pending || cached;
  const [assignee, setAssignee] = React.useState(T_TEAM[0].id);
  const [due, setDue] = React.useState("May 17");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (pending) {
      setAssignee(pending.item.assignee || T_TEAM[0].id);
      setDue("May 17");
      setNote("");
    }
  }, [pending]);

  if (!p) return null;

  const titles = {
    checkout: "Check out item",
    checkin: "Check in item",
    maintenance: "Send to maintenance",
  };
  const action = p.action;

  return (
    <div className={`modal-backdrop ${open ? "open" : ""}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 460 }}>
        <div className="modal-head">
          <h3>{titles[action]}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icons.close size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 12px", border: "1px solid var(--border)",
            borderRadius: 8, background: "var(--surface-2)", marginBottom: 16
          }}>
            <Thumb item={p.item} size={40} />
            <div>
              <div className="item-name">{p.item.name}</div>
              <div className="item-id">{p.item.id} · {p.item.location}</div>
            </div>
          </div>

          {action === "checkout" && (
            <>
              <div className="field">
                <label>Assignee</label>
                <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                  {T_TEAM.map((u) => <option key={u.id} value={u.id}>{u.name} · {u.role}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Expected return</label>
                <input value={due} onChange={(e) => setDue(e.target.value)} placeholder="May 17" />
              </div>
              <div className="field">
                <label>Note (optional)</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Out for the rooftop shoot" />
              </div>
            </>
          )}
          {action === "checkin" && (
            <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: "4px 0 8px" }}>
              Confirm <strong>{p.item.name}</strong> has been returned and inspected. It will be marked available.
            </p>
          )}
          {action === "maintenance" && (
            <div className="field">
              <label>Reason</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Sensor cleaning" />
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className={action === "maintenance" ? "btn" : "btn-primary btn"}
            onClick={() => onConfirm({ assignee, due, note })}
          >
            <Icons.check size={14} /> Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileDrawer({ user, onClose, items, activity }) {
  const open = !!user;
  const [cached, setCached] = React.useState(user);
  React.useEffect(() => { if (user) setCached(user); }, [user]);
  const u = user || cached;

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!u) return null;
  const holdings = items.filter((i) => i.assignee === u.id);
  const userActivity = activity.filter((a) => a.user === u.id).slice(0, 8);
  const checkoutCount = activity.filter((a) => a.user === u.id && a.type === "checkout").length;
  const checkinCount = activity.filter((a) => a.user === u.id && a.type === "checkin").length;

  return (
    <>
      <div className={`drawer-backdrop ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`drawer profile-drawer ${open ? "open" : ""}`} role="dialog" aria-label="Team member profile">
        <div className="drawer-head">
          <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            Profile · {u.id.toUpperCase()}
          </span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icons.close size={16} />
          </button>
        </div>

        <div className="profile-cover" style={{ background: `linear-gradient(135deg, oklch(0.55 0.13 ${u.hue}), oklch(0.32 0.08 ${(u.hue + 40) % 360}))` }}>
          <div className="profile-cover-grain" />
        </div>

        <div className="drawer-body profile-body">
          <div className="profile-head">
            <div className="profile-avatar">
              <Avatar user={u} size={108} />
            </div>
            <div className="profile-identity">
              <h2>{u.name}</h2>
              <div className="profile-role">
                <span>{u.role}</span>
                {u.pronouns && <><span className="dot-sep">·</span><span>{u.pronouns}</span></>}
              </div>
            </div>
            <div className="profile-actions">
              <button className="btn btn-primary">
                <Icons.arrowOut size={14} /> Assign gear
              </button>
              <button className="icon-btn" title="More">
                <Icons.more size={15} />
              </button>
            </div>
          </div>

          {u.bio && <p className="profile-bio">{u.bio}</p>}

          <div className="profile-stats">
            <div className="profile-stat">
              <span className="stat-value">{holdings.length}</span>
              <span className="stat-label">Currently holding</span>
            </div>
            <div className="profile-stat">
              <span className="stat-value">{checkoutCount}</span>
              <span className="stat-label">Lifetime check-outs</span>
            </div>
            <div className="profile-stat">
              <span className="stat-value">{checkinCount}</span>
              <span className="stat-label">Returns</span>
            </div>
          </div>

          <dl className="kv">
            <dt>Email</dt><dd><a href={`mailto:${u.email}`} className="profile-link">{u.email}</a></dd>
            <dt>Phone</dt><dd style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{u.phone}</dd>
            <dt>Location</dt><dd>{u.location}</dd>
            <dt>Joined</dt><dd>{u.joined}</dd>
          </dl>

          <h3 className="section-title">Currently holding</h3>
          {holdings.length === 0 ? (
            <div className="empty-holdings" style={{ padding: "8px 0 18px" }}>No items checked out right now.</div>
          ) : (
            <div className="profile-holdings">
              {holdings.map((it) => (
                <div className="profile-holding" key={it.id}>
                  <Thumb item={it} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="item-name" style={{ fontSize: 13.5 }}>{it.name}</div>
                    <div className="item-id">{it.id} · {it.location}</div>
                  </div>
                  {it.since && <span className="since-tag">since {it.since}</span>}
                </div>
              ))}
            </div>
          )}

          <h3 className="section-title" style={{ marginTop: 18 }}>Recent activity</h3>
          {userActivity.length === 0 ? (
            <div className="empty-holdings" style={{ padding: "8px 0" }}>No recent activity.</div>
          ) : (
            <div className="history-list">
              {userActivity.map((a) => (
                <div className="history-item" key={a.id}>
                  <span className={`history-dot ${
                    a.type === "checkout" ? "dot-amber" :
                    a.type === "checkin" ? "dot-green" :
                    a.type === "maintenance" ? "dot-blue" :
                    a.type === "missing" ? "dot-red" : ""}`} />
                  <div>
                    <div>
                      <span style={{ color: "var(--muted)" }}>
                        {a.type === "checkout" ? "Checked out" :
                         a.type === "checkin" ? "Checked in" :
                         a.type === "maintenance" ? "Sent to maintenance" :
                         a.type === "missing" ? "Flagged missing" : "Added"}
                      </span>{" "}
                      <span className="id" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--muted)" }}>{a.item}</span>
                    </div>
                    {a.note && <div className="activity-note">{a.note}</div>}
                  </div>
                  <span className="history-ts">{a.ts}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

window.FLFOverlays = { ItemDrawer, AddItemModal, StatusConfirmModal, ProfileDrawer };
