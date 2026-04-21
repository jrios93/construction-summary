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

async function setupPolicies() {
  // Enable RLS on contract_documents
  await supabaseAdmin.rpc('exec', {
    sql: `ALTER TABLE contract_documents ENABLE ROW LEVEL SECURITY;`
  })

  // Create policy for INSERT (anyone can insert)
  const { error: insertError } = await supabaseAdmin.rpc('exec', {
    sql: `CREATE POLICY "Anyone can insert contract_documents"
          ON contract_documents FOR INSERT
          TO anon
          WITH CHECK (true);`
  })

  // Create policy for SELECT (anyone can read)
  const { error: selectError } = await supabaseAdmin.rpc('exec', {
    sql: `CREATE POLICY "Anyone can read contract_documents"
          ON contract_documents FOR SELECT
          TO anon
          USING (true);`
  })

  // Create policy for DELETE (anyone can delete)
  const { error: deleteError } = await supabaseAdmin.rpc('exec', {
    sql: `CREATE POLICY "Anyone can delete contract_documents"
          ON contract_documents FOR DELETE
          TO anon
          USING (true);`
  })

  if (insertError) console.log("Insert policy:", insertError.message)
  else console.log("Insert policy created")

  if (selectError) console.log("Select policy:", selectError.message)
  else console.log("Select policy created")

  if (deleteError) console.log("Delete policy:", deleteError.message)
  else console.log("Delete policy created")
}

setupPolicies()