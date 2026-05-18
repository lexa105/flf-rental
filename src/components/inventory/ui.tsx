import { Icon } from "./icons";
import { userById, STATUS_LABEL } from "./data";
import type { Item, TeamMember } from "./types";

export function Avatar({
  user,
  size = 26,
  ring = false,
}: {
  user: TeamMember | undefined;
  size?: number;
  ring?: boolean;
}) {
  if (!user) return null;
  const bg = `oklch(0.88 0.04 ${user.hue})`;
  const fg = `oklch(0.32 0.06 ${user.hue})`;
  return (
    <span
      className={`relative inline-grid place-items-center rounded-full border border-border-strong overflow-hidden flex-shrink-0 ${ring ? "shadow-[0_0_0_2px_var(--surface),0_0_0_3px_var(--accent-soft)]" : ""}`}
      style={{
        background: bg,
        color: fg,
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 600,
        fontFamily: "var(--font-geist-sans)",
        letterSpacing: "0.02em",
      }}
      title={user.name}
    >
      {user.photo && (
        <img
          src={user.photo}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      )}
      <span className="relative z-0">{user.initials}</span>
    </span>
  );
}

const STATUS_DOT: Record<string, string> = {
  "available":   "bg-status-green",
  "checked-out": "bg-status-amber",
  "maintenance": "bg-status-blue",
  "missing":     "bg-status-red",
};

const STATUS_PILL: Record<string, string> = {
  "available":   "bg-green-soft text-status-green",
  "checked-out": "bg-amber-soft text-status-amber",
  "maintenance": "bg-blue-soft text-status-blue",
  "missing":     "bg-red-soft text-status-red",
};

export function Pill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-[9px] py-[3px] pl-2 rounded-full text-[12px] font-medium ${STATUS_PILL[status] ?? ""}`}>
      <span className={`w-[7px] h-[7px] rounded-full inline-block ${STATUS_DOT[status] ?? "bg-border-strong"}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

const CATEGORY_GLYPHS: Record<string, React.ReactNode> = {
  camera:    <Icon size={22} d={["M3 7h3l2-3h8l2 3h3v12H3z", "M12 11a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z"]} />,
  lens:      <Icon size={22} d={["M12 5a7 7 0 1 1 0 14 7 7 0 0 1 0-14z", "M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"]} />,
  audio:     <Icon size={22} d={["M5 9h2v6H5z", "M9 6h2v12H9z", "M13 4h2v16h-2z", "M17 8h2v8h-2z"]} />,
  lighting:  <Icon size={22} d={["M12 3v2M5 7l1 1M19 7l-1 1", "M9 14a3 3 0 1 1 6 0c0 2-1.5 2-1.5 4h-3c0-2-1.5-2-1.5-4z", "M11 21h2"]} />,
  grip:      <Icon size={22} d={["M12 4l-7 16M12 4l7 16", "M12 4v16", "M8 14h8"]} />,
  storage:   <Icon size={22} d={["M4 6h16v12H4z", "M8 6v4h2V6", "M16 14h2"]} />,
  accessory: <Icon size={22} d={["M12 4l8 4-8 4-8-4 8-4z", "M4 12l8 4 8-4", "M4 16l8 4 8-4"]} />,
};

export function Thumb({ item, size = 44 }: { item: Item; size?: number }) {
  const glyph = CATEGORY_GLYPHS[item.category] ?? <Icon size={size * 0.5} d={["M4 5h16v14H4z", "M4 16l5-5 4 4 3-3 4 4"]} />;
  return (
    <div
      className="thumb-strokes relative rounded-[6px] bg-surface-2 border border-border grid place-items-center text-muted flex-shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <span className="relative grid place-items-center opacity-55"
        style={{ fontSize: size * 0.5 }}>
        {glyph}
      </span>
    </div>
  );
}

export { userById };
