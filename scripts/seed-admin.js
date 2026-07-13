import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY env var required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seedAdmin() {
  const email = "roguemutant@matchday-ledger.app";
  const password = "Bubblegubble@1";

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes("already exists")) {
      console.log("Admin user already exists. Skipping.");
    } else {
      console.error("Failed:", error.message);
      process.exit(1);
    }
  } else {
    console.log("Admin user created:", data.user?.id);
    console.log("  Email:", email);
  }
}

seedAdmin();
