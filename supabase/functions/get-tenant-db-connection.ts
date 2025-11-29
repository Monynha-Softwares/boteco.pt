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
  // For production, use `supabaseAdmin.auth.getUser(token)` to verify.

  const { companyId, operation, payload } = await req.json();
  if (!companyId || !operation) {
    return new Response('Missing companyId or operation', { status: 400, headers: corsHeaders });
  }

  // Create a Supabase client with the service role key to access protected tables/secrets
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // 1. Verify user's company membership and role (Authorization)
    const { data: companyUser, error: companyUserError } = await supabaseAdmin
      .from('company_users')
      .select('role')
      .eq('company_id', companyId)
      .eq('user_id', (await supabaseAdmin.auth.getUser(token)).data.user?.id) // Get user ID from token
      .single();

    if (companyUserError || !companyUser) {
      console.error('User not authorized for this company:', companyUserError?.message || 'Membership not found');
      return new Response('Forbidden: User not authorized for this company', { status: 403, headers: corsHeaders });
    }

    const userRole = companyUser.role; // e.g., 'owner', 'manager', 'employee'
    // Implement role-based access control here if needed for specific operations
    // e.g., if (operation === 'delete_product' && userRole !== 'owner') return new Response('Forbidden', { status: 403 });

    // 2. Fetch the tenant database mapping from the main project's boteco schema
    const { data: tenantMapping, error: mappingError } = await supabaseAdmin
      .from('tenant_databases')
      .select('database_name, connection_string_secret_name')
      .eq('company_id', companyId)
      .single();

    if (mappingError || !tenantMapping) {
      console.error('Error fetching tenant mapping:', mappingError?.message || 'Mapping not found');
      return new Response('Tenant database mapping not found or access denied', { status: 404, headers: corsHeaders });
    }

    // 3. Retrieve the connection string from Supabase secrets
    const tenantDbConnectionString = Deno.env.get(tenantMapping.connection_string_secret_name);

    if (!tenantDbConnectionString) {
      console.error(`Connection string secret '${tenantMapping.connection_string_secret_name}' not found.`);
      return new Response('Tenant database connection string not configured', { status: 500, headers: corsHeaders });
    }

    // 4. Connect to the tenant-specific database
    // In a real scenario, you'd use a PostgreSQL client library (e.g., 'pg')
    // to connect using `tenantDbConnectionString` and perform the `operation`.
    // For this example, we'll simulate the operation.

    let resultData;
    switch (operation) {
      case 'get_products':
        // Simulate fetching products from tenant DB
        resultData = { message: `Simulated: Fetched products for company ${companyId} from DB ${tenantMapping.database_name}` };
        break;
      case 'create_order':
        // Simulate creating an order in tenant DB
        resultData = { message: `Simulated: Created order for company ${companyId} in DB ${tenantMapping.database_name}`, order: payload };
        break;
      // Add more operations as needed
      default:
        return new Response('Invalid operation', { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify(resultData), {
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