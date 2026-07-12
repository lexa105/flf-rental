"use server";

import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type ActivityType = "checkout" | "checkin" | "maintenance" | "missing" | "added" | "deleted";

interface ActivityLogInput {
  ownerId: string;
  equipmentId: string | null;
  itemName: string;
  itemCode: string | null;
  type: ActivityType;
  note?: string | null;
}

function deriveCode(id: string, serial: string | null | undefined): string {
  return serial || id.slice(0, 8).toUpperCase();
}

/**
 * Inserts a row into the `activity` log. Best-effort: failures are swallowed
 * (logged to the server console) so the caller's primary mutation still
 * reports success even if the log insert fails.
 */
async function logActivity(supabase: SupabaseServerClient, input: ActivityLogInput): Promise<void> {
  const { error } = await supabase.from("activity").insert({
    owner_id: input.ownerId,
    equipment_id: input.equipmentId,
    item_name: input.itemName,
    item_code: input.itemCode,
    type: input.type,
    note: input.note ?? null,
  });
  if (error) {
    console.error("activity log insert failed:", error.message);
  }
}

// ── Shared types ─────────────────────────────────────────────────────────────

export interface AddEquipmentInput {
  name: string;
  category: string;
  locationName: string;
  serial?: string;
  note?: string;
}

export interface AddEquipmentResult {
  success: boolean;
  message?: string;
  item?: { id: string; created_at: string };
}

export type EquipmentStatusAction = "checkout" | "checkin" | "maintenance" | "missing";

// ── addEquipment ─────────────────────────────────────────────────────────────

/**
 * Inserts a new equipment row for the signed-in user. Resolves `locationName`
 * to a `location_id` by matching against the user's own locations; if no
 * match is found the item is inserted with a null location.
 */
export async function addEquipment(input: AddEquipmentInput): Promise<AddEquipmentResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: "Not authenticated." };

  let locationId: string | null = null;
  if (input.locationName) {
    const { data: location } = await supabase
      .from("location")
      .select("id")
      .eq("profile_id", user.id)
      .eq("name", input.locationName)
      .maybeSingle();
    locationId = location?.id ?? null;
  }

  const { data, error } = await supabase
    .from("equipment")
    .insert({
      name: input.name,
      category: input.category,
      status: "available",
      location_id: locationId,
      serial: input.serial || null,
      notes: input.note || null,
      owner_id: user.id,
    })
    .select()
    .single();
  if (error) return { success: false, message: error.message };

  await logActivity(supabase, {
    ownerId: user.id,
    equipmentId: data.id,
    itemName: data.name ?? input.name,
    itemCode: deriveCode(data.id, data.serial),
    type: "added",
    note: input.note || null,
  });

  return { success: true, item: { id: data.id, created_at: data.created_at } };
}

// ── updateEquipmentStatus ────────────────────────────────────────────────────

const STATUS_BY_ACTION: Record<EquipmentStatusAction, string> = {
  checkout: "checked-out",
  checkin: "available",
  maintenance: "maintenance",
  missing: "missing",
};

/**
 * Applies a check-out / check-in / maintenance status change to an equipment
 * row. RLS scopes the update to rows owned by the signed-in user.
 */
export async function updateEquipmentStatus(
  id: string,
  action: EquipmentStatusAction,
  note?: string,
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: "Not authenticated." };

  const update: { status: string; checked_out_at: string | null; notes?: string } = {
    status: STATUS_BY_ACTION[action],
    checked_out_at: action === "checkout" ? new Date().toISOString() : null,
  };
  if (note) update.notes = note;

  const { data, error } = await supabase.from("equipment").update(update).eq("id", id).select().single();
  if (error) return { success: false, message: error.message };

  await logActivity(supabase, {
    ownerId: user.id,
    equipmentId: data.id,
    itemName: data.name ?? "",
    itemCode: deriveCode(data.id, data.serial),
    type: action,
    note: note || null,
  });

  return { success: true };
}

// ── deleteEquipment ──────────────────────────────────────────────────────────

/**
 * Permanently deletes an equipment row. RLS scopes the delete to rows owned
 * by the signed-in user.
 */
export async function deleteEquipment(id: string): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: "Not authenticated." };

  const { data: existing } = await supabase
    .from("equipment")
    .select("name, serial, id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("equipment").delete().eq("id", id);
  if (error) return { success: false, message: error.message };

  if (existing) {
    await logActivity(supabase, {
      ownerId: user.id,
      equipmentId: null,
      itemName: existing.name ?? "",
      itemCode: deriveCode(existing.id, existing.serial),
      type: "deleted",
      note: null,
    });
  }

  return { success: true };
}
