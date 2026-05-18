"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from 'next/dist/client/components/redirect-error';


import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in real projects, use a library like zod to validate data
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (!data.email || !data.password) {
    return { success: false, message: 'Email and password are required.'};
  }

  try {
    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      return { success: false, message: error.message};
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

  // type-casting here for convenience
  // in real projects, use a library like zod to validate data
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };


  try {
    const { data: authData, error } = await supabase.auth.signUp(data);

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
