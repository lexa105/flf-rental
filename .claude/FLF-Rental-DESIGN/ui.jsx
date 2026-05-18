// FLF Rental — shared UI atoms
const FLF_TEAM = window.FLF.TEAM;
const FLF_CATEGORIES = window.FLF.CATEGORIES;

const userById = (id) => FLF_TEAM.find((u) => u.id === id);
const categoryById = (id) => FLF_CATEGORIES.find((c) => c.id === id);

const STATUS_LABEL = {
  "available": "Available",
  "checked-out": "Checked out",
  "maintenance": "Maintenance",
  "missing": "Missing",
};

function Avatar({ user, size = 26, ring = false }) {
  if (!user) return null;
  // soft warm tones using user hue — used as photo-load fallback background
  const bg = `oklch(0.88 0.04 ${user.hue})`;
  const fg = `oklch(0.32 0.06 ${user.hue})`;
  const cls = (size > 30 ? "avatar avatar-lg" : "avatar") + (ring ? " avatar-ring" : "");
  return (
    <span
      className={cls}
      style={{ background: bg, color: fg, width: size, height: size, fontSize: size * 0.4 }}
      title={user.name}
    >
      {user.photo && (
        <img
          src={user.photo}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      <span className="avatar-initials">{user.initials}</span>
    </span>
  );
}

function Pill({ status }) {
  return (
    <span className={`pill pill-${status}`}>
      <span className={`dot ${
        status === "available" ? "dot-green" :
        status === "checked-out" ? "dot-amber" :
        status === "maintenance" ? "dot-blue" : "dot-red"
      }`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function Thumb({ item, size = 44 }) {
  // We don't have real images — render a category glyph in a striped placeholder.
  const glyph = {
    camera: Icons.camera,
    lens: (p) => <Icon {...p} d={["M12 5a7 7 0 1 1 0 14 7 7 0 0 1 0-14z", "M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"]} />,
    audio: (p) => <Icon {...p} d={["M5 9h2v6H5z", "M9 6h2v12H9z", "M13 4h2v16h-2z", "M17 8h2v8h-2z"]} />,
    lighting: (p) => <Icon {...p} d={["M12 3v2M5 7l1 1M19 7l-1 1", "M9 14a3 3 0 1 1 6 0c0 2-1.5 2-1.5 4h-3c0-2-1.5-2-1.5-4z", "M11 21h2"]} />,
    grip: (p) => <Icon {...p} d={["M12 4l-7 16M12 4l7 16", "M12 4v16", "M8 14h8"]} />,
    storage: (p) => <Icon {...p} d={["M4 6h16v12H4z", "M8 6v4h2V6", "M16 14h2"]} />,
    accessory: (p) => <Icon {...p} d={["M12 4l8 4-8 4-8-4 8-4z", "M4 12l8 4 8-4", "M4 16l8 4 8-4"]} />,
  }[item.category] || Icons.image;

  return (
    <div className="thumb thumb-strokes" style={{ width: size, height: size }}>
      <span style={{ position: "relative", display: "grid", placeItems: "center", width: "100%", height: "100%", background: "transparent" }}>
        {glyph({ size: size * 0.5 })}
      </span>
    </div>
  );
}

window.FLFUI = { Avatar, Pill, Thumb, userById, categoryById, STATUS_LABEL };
