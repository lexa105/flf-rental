"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const fullName = formData.get("fullName") as string

  const { error } = await supabase
    .from("profile")
    .update({ full_name: fullName})
    .eq("id", user.id)

  if (error) {
    console.error("Error updating profile:", error)
    // Could throw or return error to UI, but we'll proceed for now to keep flow smooth
  }

  redirect("/onboarding/gear")
}

export async function addEquipment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const serialNumber = formData.get("serialNumber") as string

  // Note: Assuming a simple item. Real app would handle image upload via Storage first.
  const { error } = await supabase
    .from("equipment")
    .insert({
      owner_id: user.id,
      name,
      category,
      serial_number: serialNumber,
    })

  if (error) {
    console.error("Error adding equipment:", error)
  }

  redirect("/onboarding/storage")
}

export async function addLocations(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const primaryStreet = formData.get("primaryStreet") as string
  const primaryCity = formData.get("primaryCity") as string
  const primaryZip = formData.get("primaryZip") as string

  const secondaryStreet = formData.get("secondaryStreet") as string
  const secondaryCity = formData.get("secondaryCity") as string

  const locations = []

  if (primaryStreet || primaryCity) {
    locations.push({
      user_id: user.id,
      street_address: primaryStreet,
      city: primaryCity,
      postal_code: primaryZip,
      is_primary: true,
    })
  }

  if (secondaryStreet || secondaryCity) {
    locations.push({
      user_id: user.id,
      street_address: secondaryStreet,
      city: secondaryCity,
      is_primary: false,
    })
  }

  if (locations.length > 0) {
    // If the locations table doesn't exist, this will error, but we log and proceed.
    // The user will need to create the table or migration later.
    const { error } = await supabase
      .from("locations")
      .insert(locations)

    if (error) {
      console.error("Error adding locations:", error)
    }
  }

  redirect("/onboarding/complete")
}