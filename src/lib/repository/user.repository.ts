import { createClient } from '@/lib/supabase/client'; // Assuming client.ts is correctly set up
import type { RegisterSchemaType, LoginSchemaType } from '@/lib/validators/auth';
import type { User } from '@supabase/supabase-js';

// Define the parameters for createUserInRepository based on what's needed
type CreateUserParams = Omit<RegisterSchemaType, 'confirmPassword'>;

export async function createUserInRepository({ email, password, role }: CreateUserParams) {
  const supabase = createClient();

  // 1. Sign up the user using Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error('Supabase Auth signUp error:', authError);
    return { data: null, error: { message: authError.message, details: authError } };
  }

  if (!authData.user) {
    console.error('Supabase Auth signUp did not return a user.');
    return { data: null, error: { message: 'User registration failed: No user data returned after sign up.', details: 'No user object' } };
  }

  // 2. Insert into 'users' table
  const { error: userInsertError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: authData.user.email,
      role: role,
    });

  if (userInsertError) {
    console.error('Supabase insert into "users" table error:', userInsertError);
    return { data: null, error: { message: `Failed to save user information: ${userInsertError.message}`, details: userInsertError } };
  }

  // 3. If the role is 'professional', insert into 'subscriptions' table
  if (role === 'professional') {
    const { error: subscriptionInsertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: authData.user.id,
        status: 'free',
        start_date: new Date().toISOString(),
        end_date: null,
      });

    if (subscriptionInsertError) {
      console.error('Supabase insert into "subscriptions" table error:', subscriptionInsertError);
      return { 
        data: null, 
        error: { 
          message: `User created, but failed to set up professional subscription: ${subscriptionInsertError.message}. Please contact support.`, 
          details: subscriptionInsertError 
        } 
      };
    }
  }

  return { data: { userId: authData.user.id, email: authData.user.email, role: role }, error: null };
}


export async function signInUserInRepository({ email, password }: LoginSchemaType): Promise<{
  data: { user: User } | null;
  error: { message: string; details?: any } | null;
}> {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('Supabase Auth signIn error:', authError);
    return { data: null, error: { message: authError.message, details: authError } };
  }

  if (!authData || !authData.user) {
    console.error('Supabase Auth signIn did not return a user.');
    return { data: null, error: { message: 'Login failed: No user data returned after sign in.', details: 'No user object' } };
  }

  return { data: { user: authData.user }, error: null };
}

export async function signOutUserRepository(): Promise<{
  error: { message: string; details?: any } | null;
}> {
  const supabase = createClient();
  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.error('Supabase Auth signOut error:', signOutError);
    return { error: { message: signOutError.message, details: signOutError } };
  }

  return { error: null };
}

export async function getUserEmailById(userId: string): Promise<{
  email: string | null;
  error: { message: string; details?: any } | null;
}> {
  const supabase = createClient();
  const { data, error: dbError } = await supabase
    .from('users') // Assuming your table is named 'users'
    .select('email')
    .eq('id', userId)
    .single();

  if (dbError) {
    console.error(`Supabase error fetching email for user ID ${userId}:`, dbError);
    const userMessage = dbError.code === 'PGRST116' 
      ? `User with ID ${userId} not found or email is missing.`
      : dbError.message;
    return { email: null, error: { message: userMessage, details: dbError } };
  }

  if (!data || !data.email) {
    return { email: null, error: { message: `Email not found for user ID ${userId}.`, details: 'Email field missing or null' } };
  }

  return { email: data.email, error: null };
}
