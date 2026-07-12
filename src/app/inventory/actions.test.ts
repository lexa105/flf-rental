import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addEquipment, updateEquipmentStatus, deleteEquipment } from "./actions";

interface MockUser {
  id: string;
}

const {
  mockGetUser,
  mockFrom,
  mockInsert,
  mockInsertSelect,
  mockInsertSingle,
  mockUpdate,
  mockUpdateEq,
  mockUpdateSelect,
  mockUpdateSingle,
  mockDelete,
  mockDeleteEq,
  mockEquipmentSelect,
  mockEquipmentSelectEq,
  mockEquipmentMaybeSingle,
  mockLocationSelect,
  mockLocationEqProfile,
  mockLocationEqName,
  mockLocationMaybeSingle,
  mockActivityInsert,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockInsert: vi.fn(),
  mockInsertSelect: vi.fn(),
  mockInsertSingle: vi.fn(),
  mockUpdate: vi.fn(),
  mockUpdateEq: vi.fn(),
  mockUpdateSelect: vi.fn(),
  mockUpdateSingle: vi.fn(),
  mockDelete: vi.fn(),
  mockDeleteEq: vi.fn(),
  mockEquipmentSelect: vi.fn(),
  mockEquipmentSelectEq: vi.fn(),
  mockEquipmentMaybeSingle: vi.fn(),
  mockLocationSelect: vi.fn(),
  mockLocationEqProfile: vi.fn(),
  mockLocationEqName: vi.fn(),
  mockLocationMaybeSingle: vi.fn(),
  mockActivityInsert: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

const AUTHENTICATED_USER: MockUser = { id: "user-123" };

function mockUnauthenticated() {
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
}

function mockAuthenticated() {
  mockGetUser.mockResolvedValue({ data: { user: AUTHENTICATED_USER }, error: null });
}

beforeEach(() => {
  vi.clearAllMocks();

  // equipment.insert(...).select().single()
  mockInsert.mockReturnValue({ select: mockInsertSelect });
  mockInsertSelect.mockReturnValue({ single: mockInsertSingle });
  mockInsertSingle.mockResolvedValue({
    data: { id: "eq-1", created_at: "2026-07-12T00:00:00.000Z", name: "Sony FX3", serial: "SN-1" },
    error: null,
  });

  // equipment.update(...).eq(...).select().single()
  mockUpdate.mockReturnValue({ eq: mockUpdateEq });
  mockUpdateEq.mockReturnValue({ select: mockUpdateSelect });
  mockUpdateSelect.mockReturnValue({ single: mockUpdateSingle });
  mockUpdateSingle.mockResolvedValue({
    data: { id: "eq-1", name: "Sony FX3", serial: "SN-1" },
    error: null,
  });

  // equipment.select('name, serial, id').eq('id', ...).maybeSingle()  (deleteEquipment snapshot)
  mockEquipmentSelect.mockReturnValue({ eq: mockEquipmentSelectEq });
  mockEquipmentSelectEq.mockReturnValue({ maybeSingle: mockEquipmentMaybeSingle });
  mockEquipmentMaybeSingle.mockResolvedValue({
    data: { name: "Sony FX3", serial: "SN-1", id: "eq-1" },
    error: null,
  });

  // equipment.delete().eq(...)
  mockDelete.mockReturnValue({ eq: mockDeleteEq });
  mockDeleteEq.mockResolvedValue({ error: null });

  // location.select('id').eq('profile_id', ...).eq('name', ...).maybeSingle()
  mockLocationSelect.mockReturnValue({ eq: mockLocationEqProfile });
  mockLocationEqProfile.mockReturnValue({ eq: mockLocationEqName });
  mockLocationEqName.mockReturnValue({ maybeSingle: mockLocationMaybeSingle });
  mockLocationMaybeSingle.mockResolvedValue({ data: { id: "loc-1" }, error: null });

  // activity.insert(...)
  mockActivityInsert.mockResolvedValue({ error: null });

  mockFrom.mockImplementation((table: string) => {
    if (table === "equipment")
      return { insert: mockInsert, update: mockUpdate, delete: mockDelete, select: mockEquipmentSelect };
    if (table === "location") return { select: mockLocationSelect };
    if (table === "activity") return { insert: mockActivityInsert };
    throw new Error(`unexpected table: ${table}`);
  });
});

describe("addEquipment", () => {
  const input = {
    name: "Sony FX3",
    category: "camera",
    locationName: "Studio A · Cage",
    serial: "SN-1",
    note: "Body only",
  };

  it("returns not authenticated when there is no user", async () => {
    mockUnauthenticated();
    const result = await addEquipment(input);
    expect(result).toEqual({ success: false, message: "Not authenticated." });
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("resolves the location id by name and inserts the equipment row", async () => {
    mockAuthenticated();
    const result = await addEquipment(input);

    expect(mockFrom).toHaveBeenCalledWith("location");
    expect(mockLocationEqProfile).toHaveBeenCalledWith("profile_id", "user-123");
    expect(mockLocationEqName).toHaveBeenCalledWith("name", "Studio A · Cage");

    expect(mockFrom).toHaveBeenCalledWith("equipment");
    expect(mockInsert).toHaveBeenCalledWith({
      name: "Sony FX3",
      category: "camera",
      status: "available",
      location_id: "loc-1",
      serial: "SN-1",
      notes: "Body only",
      owner_id: "user-123",
    });

    expect(result).toEqual({
      success: true,
      item: { id: "eq-1", created_at: "2026-07-12T00:00:00.000Z" },
    });
  });

  it("inserts a null location_id when no matching location is found", async () => {
    mockAuthenticated();
    mockLocationMaybeSingle.mockResolvedValue({ data: null, error: null });

    await addEquipment(input);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ location_id: null }),
    );
  });

  it("skips the location lookup and nulls serial/notes when omitted", async () => {
    mockAuthenticated();
    await addEquipment({ name: "Rode NTG5", category: "audio", locationName: "" });

    expect(mockLocationSelect).not.toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ location_id: null, serial: null, notes: null }),
    );
  });

  it("returns the supabase error message when the insert fails", async () => {
    mockAuthenticated();
    mockInsertSingle.mockResolvedValue({ data: null, error: { message: "boom" } });
    const result = await addEquipment(input);
    expect(result).toEqual({ success: false, message: "boom" });
    expect(mockActivityInsert).not.toHaveBeenCalled();
  });

  it("logs an 'added' activity entry with the new item's id and code", async () => {
    mockAuthenticated();
    await addEquipment(input);

    expect(mockFrom).toHaveBeenCalledWith("activity");
    expect(mockActivityInsert).toHaveBeenCalledWith({
      owner_id: "user-123",
      equipment_id: "eq-1",
      item_name: "Sony FX3",
      item_code: "SN-1",
      type: "added",
      note: "Body only",
    });
  });

  it("derives the item code from the id when there is no serial", async () => {
    mockAuthenticated();
    mockInsertSingle.mockResolvedValue({
      data: { id: "eq-abcdefgh-1234", created_at: "2026-07-12T00:00:00.000Z", name: "Rode NTG5", serial: null },
      error: null,
    });

    await addEquipment({ name: "Rode NTG5", category: "audio", locationName: "" });

    expect(mockActivityInsert).toHaveBeenCalledWith(
      expect.objectContaining({ item_code: "EQ-ABCDE" }),
    );
  });

  it("still returns success when the activity insert fails", async () => {
    mockAuthenticated();
    mockActivityInsert.mockResolvedValue({ error: { message: "activity boom" } });

    const result = await addEquipment(input);
    expect(result).toEqual({
      success: true,
      item: { id: "eq-1", created_at: "2026-07-12T00:00:00.000Z" },
    });
  });
});

describe("updateEquipmentStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-12T18:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns not authenticated when there is no user", async () => {
    mockUnauthenticated();
    const result = await updateEquipmentStatus("eq-1", "checkout");
    expect(result).toEqual({ success: false, message: "Not authenticated." });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("checks an item out with a checked_out_at timestamp and optional note", async () => {
    mockAuthenticated();
    const result = await updateEquipmentStatus("eq-1", "checkout", "Out for the shoot");
    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      status: "checked-out",
      checked_out_at: "2026-07-12T18:00:00.000Z",
      notes: "Out for the shoot",
    });
    expect(mockUpdateEq).toHaveBeenCalledWith("id", "eq-1");
    expect(mockActivityInsert).toHaveBeenCalledWith({
      owner_id: "user-123",
      equipment_id: "eq-1",
      item_name: "Sony FX3",
      item_code: "SN-1",
      type: "checkout",
      note: "Out for the shoot",
    });
  });

  it("checks an item in, clearing checked_out_at and omitting notes when none given", async () => {
    mockAuthenticated();
    const result = await updateEquipmentStatus("eq-1", "checkin");
    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      status: "available",
      checked_out_at: null,
    });
    expect(mockActivityInsert).toHaveBeenCalledWith(
      expect.objectContaining({ type: "checkin", note: null }),
    );
  });

  it("sends an item to maintenance with a reason note", async () => {
    mockAuthenticated();
    const result = await updateEquipmentStatus("eq-1", "maintenance", "Sensor cleaning");
    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      status: "maintenance",
      checked_out_at: null,
      notes: "Sensor cleaning",
    });
    expect(mockActivityInsert).toHaveBeenCalledWith(
      expect.objectContaining({ type: "maintenance", note: "Sensor cleaning" }),
    );
  });

  it("flags an item missing with a null checked_out_at and optional note", async () => {
    mockAuthenticated();
    const result = await updateEquipmentStatus("eq-1", "missing", "Not returned from May 02 shoot");
    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      status: "missing",
      checked_out_at: null,
      notes: "Not returned from May 02 shoot",
    });
    expect(mockActivityInsert).toHaveBeenCalledWith(
      expect.objectContaining({ type: "missing", note: "Not returned from May 02 shoot" }),
    );
  });

  it("returns the supabase error message when the update fails", async () => {
    mockAuthenticated();
    mockUpdateSingle.mockResolvedValue({ data: null, error: { message: "boom" } });
    const result = await updateEquipmentStatus("eq-1", "checkin");
    expect(result).toEqual({ success: false, message: "boom" });
    expect(mockActivityInsert).not.toHaveBeenCalled();
  });

  it("still returns success when the activity insert fails", async () => {
    mockAuthenticated();
    mockActivityInsert.mockResolvedValue({ error: { message: "activity boom" } });
    const result = await updateEquipmentStatus("eq-1", "checkin");
    expect(result).toEqual({ success: true });
  });
});

describe("deleteEquipment", () => {
  it("returns not authenticated when there is no user", async () => {
    mockUnauthenticated();
    const result = await deleteEquipment("eq-1");
    expect(result).toEqual({ success: false, message: "Not authenticated." });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("deletes the equipment row for the signed-in user", async () => {
    mockAuthenticated();
    const result = await deleteEquipment("eq-1");
    expect(result).toEqual({ success: true });
    expect(mockFrom).toHaveBeenCalledWith("equipment");
    expect(mockDelete).toHaveBeenCalledWith();
    expect(mockDeleteEq).toHaveBeenCalledWith("id", "eq-1");
  });

  it("returns the supabase error message when the delete fails", async () => {
    mockAuthenticated();
    mockDeleteEq.mockResolvedValue({ error: { message: "boom" } });
    const result = await deleteEquipment("eq-1");
    expect(result).toEqual({ success: false, message: "boom" });
  });

  it("logs a 'deleted' activity entry with a snapshot taken before the delete, and a null equipment_id", async () => {
    mockAuthenticated();
    await deleteEquipment("eq-1");

    expect(mockEquipmentSelect).toHaveBeenCalledWith("name, serial, id");
    expect(mockEquipmentSelectEq).toHaveBeenCalledWith("id", "eq-1");
    expect(mockActivityInsert).toHaveBeenCalledWith({
      owner_id: "user-123",
      equipment_id: null,
      item_name: "Sony FX3",
      item_code: "SN-1",
      type: "deleted",
      note: null,
    });
  });

  it("skips the activity log when the pre-delete snapshot finds no row", async () => {
    mockAuthenticated();
    mockEquipmentMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await deleteEquipment("eq-1");
    expect(result).toEqual({ success: true });
    expect(mockActivityInsert).not.toHaveBeenCalled();
  });

  it("still returns success when the activity insert fails", async () => {
    mockAuthenticated();
    mockActivityInsert.mockResolvedValue({ error: { message: "activity boom" } });
    const result = await deleteEquipment("eq-1");
    expect(result).toEqual({ success: true });
  });
});
