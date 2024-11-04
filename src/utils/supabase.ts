import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://mrczauafzaqkmjtqioan.supabase.co",
  import.meta.env.VITE_SUPABASE_API_KEY
  // { multiTab: false }
);
