import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY not found in .env.local")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createBucket() {
  const { data, error } = await supabaseAdmin.storage.createBucket("construction-files", {
    public: true,
    fileSizeLimit: 50000000
  })
  
  if (error) {
    console.log("Error:", error.message)
    process.exit(1)
  } else {
    console.log("Bucket created successfully:", data)
  }
}

createBucket()
