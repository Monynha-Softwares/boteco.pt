import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Manual authentication handling
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  const token = authHeader.replace('Bearer ', '');
  // In a real scenario, you would verify this token using a library like 'jose'
  // or Supabase's `supabase.auth.getClaims()` with the service role client.
  // For this example, we'll assume the token is valid for demonstration.

  const { companyId } = await req.json();
  if (!companyId) {
    return new Response('Missing companyId', { status: 400, headers: corsHeaders });
  }

  // Create a Supabase client with the service role key to access protected tables/secrets
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Fetch the tenant database mapping from the main project's boteco schema
    const { data: tenantMapping, error: mappingError } = await supabaseAdmin
      .from('tenant_databases')
      .select('database_name, connection_string_secret_name')
      .eq('company_id', companyId)
      .single();

    if (mappingError || !tenantMapping) {
      console.error('Error fetching tenant mapping:', mappingError?.message || 'Mapping not found');
      return new Response('Tenant database mapping not found or access denied', { status: 404, headers: corsHeaders });
    }

    // Retrieve the connection string from Supabase secrets
    // Note: Deno.env.get() can directly access secrets configured in Supabase Edge Functions
    const tenantDbConnectionString = Deno.env.get(tenantMapping.connection_string_secret_name);

    if (!tenantDbConnectionString) {
      console.error(`Connection string secret '${tenantMapping.connection_string_secret_name}' not found.`);
      return new Response('Tenant database connection string not configured', { status: 500, headers: corsHeaders });
    }

    // In a full implementation, you would now use this connection string
    // to connect to the tenant's database and perform the requested operation.
    // For this example, we'll just return the database name (not the connection string itself).
    return new Response(JSON.stringify({
      databaseName: tenantMapping.database_name,
      // In a real scenario, you would NOT return the connection string to the client.
      // Instead, the Edge Function would use it internally to query the tenant DB.
      // For demonstration, we'll indicate success.
      message: "Tenant database details retrieved successfully by Edge Function."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});