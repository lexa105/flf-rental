import { CATEGORIES } from "@/components/inventory/data";
import type { ActionType, ActivityEntry, Category, Item, Status } from "@/components/inventory/types";

// ── DB row shapes (subset of columns this mapper reads) ─────────────────────

export interface EquipmentRow {
  id: string;
  created_at: string;
  name: string | null;
  status: string | null;
  location_id: string | null;
  category: string | null;
  notes: string | null;
  serial: string | null;
  checked_out_at: string | null;
}

export interface LocationRow {
  id: string;
  name: string;
  is_primary: boolean;
}

export interface ActivityRow {
  id: string;
  created_at: string;
  equipment_id: string | null;
  item_name: string;
  item_code: string | null;
  type: string;
  note: string | null;
}

const KNOWN_CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id));

function resolveCategory(category: string | null): Category {
  if (category && KNOWN_CATEGORY_IDS.has(category)) return category as Category;
  return "other";
}

function resolveLocationName(locationId: string | null, locations: LocationRow[]): string {
  const matched = locationId ? locations.find((l) => l.id === locationId) : undefined;
  if (matched) return matched.name;
  const primary = locations.find((l) => l.is_primary);
  return primary?.name ?? "—";
}

/** Formats an ISO timestamp as a short human date, e.g. "Jul 12". */
export function formatSince(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
}

/** Maps a Supabase `equipment` row to the UI's `Item` shape. */
export function mapEquipmentToItem(row: EquipmentRow, locations: LocationRow[]): Item {
  const status = (row.status ?? "available") as Status;

  return {
    id: row.id,
    code: row.serial ?? row.id.slice(0, 8).toUpperCase(),
    name: row.name ?? "",
    category: resolveCategory(row.category),
    status,
    location: resolveLocationName(row.location_id, locations),
    since: status === "checked-out" && row.checked_out_at ? formatSince(row.checked_out_at) : undefined,
    note: row.notes ?? undefined,
    serial: row.serial ?? undefined,
    assignee: undefined,
  };
}

/** Formats an ISO timestamp as e.g. "Jul 12 · 09:12" (short month, day, 24h time). */
export function formatActivityTs(iso: string): string {
  const date = new Date(iso);
  const datePart = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return `${datePart} · ${timePart}`;
}

/** Maps a Supabase `activity` row to the UI's `ActivityEntry` shape. */
export function mapActivityToEntry(row: ActivityRow, ownerName: string): ActivityEntry {
  return {
    id: row.id,
    ts: formatActivityTs(row.created_at),
    type: row.type as ActionType,
    user: "owner",
    userName: ownerName,
    item: row.equipment_id ?? "",
    itemCode: row.item_code ?? undefined,
    itemName: row.item_name,
    note: row.note ?? undefined,
  };
}
