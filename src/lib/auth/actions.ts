"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from 'next/dist/client/components/redirect-error';

import { createClient } from "@/lib/supabase/server";

export async function signout() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (!data.email || !data.password) {
    return { success: false, message: 'Email and password are required.' };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      return { success: false, message: error.message };
    }
    revalidatePath("/", "layout");
    redirect("/");
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      return { success: false, message: error.message, emailConfirmation: false };
    }

    if (!authData.session) {
      return { success: true, emailConfirmation: true, message: 'Check your email and click the confirmation link to activate your account.' };
    }

    revalidatePath("/", "layout");
    redirect("/");
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }
    return { success: false, message: 'An unexpected error occurred. Please try again.', emailConfirmation: false };
  }
}
