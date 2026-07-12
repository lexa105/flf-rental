import { describe, expect, it } from "vitest";
import {
  formatSince,
  formatActivityTs,
  mapEquipmentToItem,
  mapActivityToEntry,
  type ActivityRow,
  type EquipmentRow,
  type LocationRow,
} from "./mapper";

const LOCATIONS: LocationRow[] = [
  { id: "loc-1", name: "Studio A · Cage", is_primary: true },
  { id: "loc-2", name: "Run Bag 01", is_primary: false },
];

function makeRow(overrides: Partial<EquipmentRow> = {}): EquipmentRow {
  return {
    id: "0f9d1e2a-aaaa-bbbb-cccc-000000000000",
    created_at: "2026-07-01T00:00:00.000Z",
    name: "Sony FX3",
    status: null,
    location_id: null,
    category: "camera",
    notes: null,
    serial: null,
    checked_out_at: null,
    ...overrides,
  };
}

describe("formatSince", () => {
  it("formats an ISO timestamp as a short month/day string", () => {
    expect(formatSince("2026-07-12T18:00:00.000Z")).toBe("Jul 12");
  });
});

describe("mapEquipmentToItem", () => {
  it("defaults status to available and derives a code from the id when no serial", () => {
    const item = mapEquipmentToItem(makeRow(), LOCATIONS);
    expect(item.status).toBe("available");
    expect(item.code).toBe("0F9D1E2A");
    expect(item.id).toBe("0f9d1e2a-aaaa-bbbb-cccc-000000000000");
  });

  it("uses the serial as the code when present", () => {
    const item = mapEquipmentToItem(makeRow({ serial: "SN-44218" }), LOCATIONS);
    expect(item.code).toBe("SN-44218");
    expect(item.serial).toBe("SN-44218");
  });

  it("falls back to 'other' for an unknown or null category", () => {
    expect(mapEquipmentToItem(makeRow({ category: "widgets" }), LOCATIONS).category).toBe("other");
    expect(mapEquipmentToItem(makeRow({ category: null }), LOCATIONS).category).toBe("other");
  });

  it("resolves location by location_id match", () => {
    const item = mapEquipmentToItem(makeRow({ location_id: "loc-2" }), LOCATIONS);
    expect(item.location).toBe("Run Bag 01");
  });

  it("falls back to the primary location when location_id doesn't match", () => {
    const item = mapEquipmentToItem(makeRow({ location_id: "missing" }), LOCATIONS);
    expect(item.location).toBe("Studio A · Cage");
  });

  it("falls back to an em dash when there is no matching or primary location", () => {
    const item = mapEquipmentToItem(makeRow(), []);
    expect(item.location).toBe("—");
  });

  it("sets since only when checked-out with a checked_out_at value", () => {
    const checkedOut = mapEquipmentToItem(
      makeRow({ status: "checked-out", checked_out_at: "2026-07-12T00:00:00.000Z" }),
      LOCATIONS,
    );
    expect(checkedOut.since).toBe("Jul 12");

    const available = mapEquipmentToItem(
      makeRow({ status: "available", checked_out_at: "2026-07-12T00:00:00.000Z" }),
      LOCATIONS,
    );
    expect(available.since).toBeUndefined();

    const checkedOutNoTimestamp = mapEquipmentToItem(
      makeRow({ status: "checked-out", checked_out_at: null }),
      LOCATIONS,
    );
    expect(checkedOutNoTimestamp.since).toBeUndefined();
  });

  it("maps notes to note and leaves assignee undefined", () => {
    const item = mapEquipmentToItem(makeRow({ notes: "Needs a case" }), LOCATIONS);
    expect(item.note).toBe("Needs a case");
    expect(item.assignee).toBeUndefined();
  });
});

describe("formatActivityTs", () => {
  it("formats a local timestamp as short month, day, and 24h HH:MM", () => {
    // Constructed from local wall-clock components so the assertion is
    // timezone-independent: toISOString() round-trips through the same
    // instant that formatActivityTs re-parses and re-formats locally.
    const local = new Date(2026, 6, 12, 9, 12, 0);
    expect(formatActivityTs(local.toISOString())).toBe("Jul 12 · 09:12");
  });

  it("zero-pads single-digit hours and minutes", () => {
    const local = new Date(2026, 0, 5, 2, 5, 0);
    expect(formatActivityTs(local.toISOString())).toBe("Jan 5 · 02:05");
  });
});

describe("mapActivityToEntry", () => {
  function makeActivityRow(overrides: Partial<ActivityRow> = {}): ActivityRow {
    return {
      id: "act-1",
      created_at: new Date(2026, 6, 12, 9, 12, 0).toISOString(),
      equipment_id: "eq-1",
      item_name: "Sony FX3",
      item_code: "SN-1",
      type: "checkout",
      note: null,
      ...overrides,
    };
  }

  it("maps a row to an ActivityEntry attributed to the owner", () => {
    const entry = mapActivityToEntry(makeActivityRow(), "Riley Brooks");
    expect(entry).toEqual({
      id: "act-1",
      ts: "Jul 12 · 09:12",
      type: "checkout",
      user: "owner",
      userName: "Riley Brooks",
      item: "eq-1",
      itemCode: "SN-1",
      itemName: "Sony FX3",
      note: undefined,
    });
  });

  it("falls back to an empty item id when equipment_id is null (e.g. a deleted item)", () => {
    const entry = mapActivityToEntry(makeActivityRow({ equipment_id: null, type: "deleted" }), "Riley Brooks");
    expect(entry.item).toBe("");
    expect(entry.type).toBe("deleted");
  });

  it("maps a null note to undefined and a present note through unchanged", () => {
    expect(mapActivityToEntry(makeActivityRow({ note: null }), "Riley Brooks").note).toBeUndefined();
    expect(mapActivityToEntry(makeActivityRow({ note: "Out until Fri" }), "Riley Brooks").note).toBe("Out until Fri");
  });

  it("maps a null item_code to undefined", () => {
    expect(mapActivityToEntry(makeActivityRow({ item_code: null }), "Riley Brooks").itemCode).toBeUndefined();
  });
});
