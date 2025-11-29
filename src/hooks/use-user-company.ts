import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react'; // Assuming Clerk is used for auth

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface UserCompany {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
}

export const useUserCompany = () => {
  const { user: clerkUser } = useUser(); // Get user from Clerk if enabled
  const userId = clerkUser?.id; // Use Clerk user ID

  return useQuery({
    queryKey: ['userCompany', userId],
    queryFn: async () => {
      if (!userId) {
        return { profile: null, company: null, userHasCompany: false };
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }

      // Fetch company owned by the user
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, slug, owner_id')
        .eq('owner_id', userId)
        .single();

      if (companyError && companyError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching user company:', companyError);
        throw companyError;
      }

      return {
        profile: profileData as UserProfile | null,
        company: companyData as UserCompany | null,
        userHasCompany: !!companyData,
      };
    },
    enabled: !!userId, // Only run query if userId is available
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};