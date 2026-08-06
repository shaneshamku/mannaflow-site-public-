import { createClient } from "@supabase/supabase-js";

// Resets an existing Supabase Auth user's password. Unlike the seed, this
// overwrites the password on an already-created user.
//   RESET_EMAIL=admin@mannaflow.com RESET_PASSWORD='new-strong-pw' \
//     node --env-file=.env scripts/reset-supabase-password.mjs
const email = process.env.RESET_EMAIL;
const password = process.env.RESET_PASSWORD;
if (!email || !password) throw new Error("RESET_EMAIL and RESET_PASSWORD are required.");
if (password.length < 8) throw new Error("Choose a password of at least 8 characters.");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (error) throw error;
const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) throw new Error(`No auth user found for ${email}.`);

const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
  password,
  email_confirm: true,
});
if (updateError) throw updateError;
console.log(`Password reset for ${email}. You can now sign in with the new password.`);
