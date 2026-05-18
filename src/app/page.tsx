import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import InventoryApp from "@/components/inventory/InventoryApp";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return <InventoryApp />;
}
