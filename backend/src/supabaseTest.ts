import { createClient } from '@supabase/supabase-js'

// CRITICAL CHECKS
const supabaseUrl = process.env.SUPABASE_URL 
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

// Validation Checks
if (!supabaseUrl) throw new Error('Missing SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing SUPABASE_ANON_KEY')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Connection Test Function
async function testConnection() {
  try {
    // NOTE: Replace 'your_test_table' with a real table name in your Supabase project
    const { data, error } = await supabase
      .from('your_test_table')
      .select('*')
      .limit(1)

    if (error) throw error
    console.log('Database Connection: ✅ Successful')
    console.log('Sample data:', data)
  } catch (err) {
    console.error('Connection Error:', err)
  }
}

testConnection() 