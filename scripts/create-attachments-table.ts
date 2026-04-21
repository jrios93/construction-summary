import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY not found in .env.local")
  console.log("Please run: npx supabase sql to create the table manually")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createAttachmentsTable() {
  // First, let's check if the table exists
  const { data: tables } = await supabaseAdmin
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_name', 'contract_attachments')

  if (!tables || tables.length === 0) {
    console.log("Creating contract_attachments table...")
    
    // Create the table
    const { error: createError } = await supabaseAdmin.rpc('exec', {
      sql: `CREATE TABLE contract_attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID REFERENCES contract_documents(id) ON DELETE CASCADE,
        file_url TEXT NOT NULL,
        file_name TEXT,
        file_type TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );`
    })

    if (createError) {
      console.log("Error creating table:", createError.message)
    } else {
      console.log("Table created successfully!")
    }

    // Enable RLS
    await supabaseAdmin.rpc('exec', {
      sql: `ALTER TABLE contract_attachments ENABLE ROW LEVEL SECURITY;`
    })

    // Create policies
    await supabaseAdmin.rpc('exec', {
      sql: `CREATE POLICY "Anyone can select contract_attachments"
            ON contract_attachments FOR SELECT TO anon USING (true);`
    })

    await supabaseAdmin.rpc('exec', {
      sql: `CREATE POLICY "Anyone can insert contract_attachments"
            ON contract_attachments FOR INSERT TO anon WITH CHECK (true);`
    })

    await supabaseAdmin.rpc('exec', {
      sql: `CREATE POLICY "Anyone can delete contract_attachments"
            ON contract_attachments FOR DELETE TO anon USING (true);`
    })

    console.log("RLS policies created!")
  } else {
    console.log("Table already exists")
  }
}

createAttachmentsTable()
