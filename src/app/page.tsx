import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InventoryApp from "@/components/inventory/InventoryApp";
import {
  mapEquipmentToItem,
  mapActivityToEntry,
  type ActivityRow,
  type EquipmentRow,
  type LocationRow,
} from "@/app/inventory/mapper";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const [equipmentRes, locationRes, profileRes, activityRes] = await Promise.all([
    supabase
      .from("equipment")
      .select("id, created_at, name, status, location_id, category, notes, serial, checked_out_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true }),
    supabase.from("location").select("id, name, is_primary").eq("profile_id", user.id),
    supabase
      .from("profile")
      .select("display_name, username, first_name")
      .eq("id", user.id)
      .single(),
    supabase
      .from("activity")
      .select("id, created_at, equipment_id, item_name, item_code, type, note")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const equipmentRows = (equipmentRes.data ?? []) as EquipmentRow[];
  const locationRows = (locationRes.data ?? []) as LocationRow[];
  const profile = profileRes.data;
  const activityRows = (activityRes.data ?? []) as ActivityRow[];

  const initialItems = equipmentRows.map((row) => mapEquipmentToItem(row, locationRows));
  const locationNames = locationRows.map((l) => l.name);
  const ownerName = profile?.display_name || profile?.username || profile?.first_name || "";
  const initialActivity = activityRows.map((row) => mapActivityToEntry(row, ownerName));

  return (
    <InventoryApp
      initialItems={initialItems}
      locationNames={locationNames}
      ownerName={ownerName}
      initialActivity={initialActivity}
    />
  );
}
