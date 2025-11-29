import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import Seo from '@/components/Seo';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useUserCompany } from '@/hooks/use-user-company';
import { useForm } from 'react-hook-form';

// Fallback validation messages (should be overridden by translations)
const fallbackValidationMessages = {
  firstName: {
    min: 'First name must be at least 2 characters.',
    max: 'First name cannot be longer than 50 characters.',
  },
  lastName: {
    min: 'Last name must be at least 2 characters.',
    max: 'Last name cannot be longer than 50 characters.',
  },
  companyName: {
    min: 'Company name must be at least 2 characters.',
    max: 'Company name cannot be longer than 100 characters.',
  },
  companySlug: {
    min: 'Unique identifier must be at least 3 characters.',
    max: 'Unique identifier cannot be longer than 50 characters.',
    invalid: 'Unique identifier must contain only lowercase letters, numbers, and hyphens.',
    exists: 'This unique identifier is already in use. Please choose another.',
  },
};

type FormValidationMessages = typeof fallbackValidationMessages;

/**
 * Validates translation structure and logs warnings for missing keys
 */
const validateTranslationMessages = (
  messages: unknown,
  path: string = 'form.validation'
): Partial<FormValidationMessages> => {
  if (!messages || typeof messages !== 'object') {
    console.warn(`[CompanyRegistration] Missing or invalid translation structure at "${path}"`);
    return {};
  }

  const validated: Partial<FormValidationMessages> = {};
  const msg = messages as Record<string, unknown>;

  // Validate firstName messages
  if (msg.firstName && typeof msg.firstName === 'object') {
    const firstName = msg.firstName as Record<string, unknown>;
    validated.firstName = {
      min: typeof firstName.min === 'string' ? firstName.min : undefined,
      max: typeof firstName.max === 'string' ? firstName.max : undefined,
    } as FormValidationMessages['firstName'];
    
    if (!firstName.min) console.warn(`[CompanyRegistration] Missing translation: ${path}.firstName.min`);
    if (!firstName.max) console.warn(`[CompanyRegistration] Missing translation: ${path}.firstName.max`);
  } else {
    console.warn(`[CompanyRegistration] Missing translation: ${path}.firstName`);
  }

  // Validate lastName messages
  if (msg.lastName && typeof msg.lastName === 'object') {
    const lastName = msg.lastName as Record<string, unknown>;
    validated.lastName = {
      min: typeof lastName.min === 'string' ? lastName.min : undefined,
      max: typeof lastName.max === 'string' ? lastName.max : undefined,
    } as FormValidationMessages['lastName'];
    
    if (!lastName.min) console.warn(`[CompanyRegistration] Missing translation: ${path}.lastName.min`);
    if (!lastName.max) console.warn(`[CompanyRegistration] Missing translation: ${path}.lastName.max`);
  } else {
    console.warn(`[CompanyRegistration] Missing translation: ${path}.lastName`);
  }

  // Validate companyName messages
  if (msg.companyName && typeof msg.companyName === 'object') {
    const companyName = msg.companyName as Record<string, unknown>;
    validated.companyName = {
      min: typeof companyName.min === 'string' ? companyName.min : undefined,
      max: typeof companyName.max === 'string' ? companyName.max : undefined,
    } as FormValidationMessages['companyName'];
    
    if (!companyName.min) console.warn(`[CompanyRegistration] Missing translation: ${path}.companyName.min`);
    if (!companyName.max) console.warn(`[CompanyRegistration] Missing translation: ${path}.companyName.max`);
  } else {
    console.warn(`[CompanyRegistration] Missing translation: ${path}.companyName`);
  }

  // Validate companySlug messages
  if (msg.companySlug && typeof msg.companySlug === 'object') {
    const companySlug = msg.companySlug as Record<string, unknown>;
    validated.companySlug = {
      min: typeof companySlug.min === 'string' ? companySlug.min : undefined,
      max: typeof companySlug.max === 'string' ? companySlug.max : undefined,
      invalid: typeof companySlug.invalid === 'string' ? companySlug.invalid : undefined,
      exists: typeof companySlug.exists === 'string' ? companySlug.exists : undefined,
    } as FormValidationMessages['companySlug'];
    
    if (!companySlug.min) console.warn(`[CompanyRegistration] Missing translation: ${path}.companySlug.min`);
    if (!companySlug.max) console.warn(`[CompanyRegistration] Missing translation: ${path}.companySlug.max`);
    if (!companySlug.invalid) console.warn(`[CompanyRegistration] Missing translation: ${path}.companySlug.invalid`);
    if (!companySlug.exists) console.warn(`[CompanyRegistration] Missing translation: ${path}.companySlug.exists`);
  } else {
    console.warn(`[CompanyRegistration] Missing translation: ${path}.companySlug`);
  }

  return validated;
};

const createFormSchema = (messages?: Partial<FormValidationMessages>) => {
  const finalMessages: FormValidationMessages = {
    firstName: {
      min: messages?.firstName?.min ?? fallbackValidationMessages.firstName.min,
      max: messages?.firstName?.max ?? fallbackValidationMessages.firstName.max,
    },
    lastName: {
      min: messages?.lastName?.min ?? fallbackValidationMessages.lastName.min,
      max: messages?.lastName?.max ?? fallbackValidationMessages.lastName.max,
    },
    companyName: {
      min: messages?.companyName?.min ?? fallbackValidationMessages.companyName.min,
      max: messages?.companyName?.max ?? fallbackValidationMessages.companyName.max,
    },
    companySlug: {
      min: messages?.companySlug?.min ?? fallbackValidationMessages.companySlug.min,
      max: messages?.companySlug?.max ?? fallbackValidationMessages.companySlug.max,
      invalid: messages?.companySlug?.invalid ?? fallbackValidationMessages.companySlug.invalid,
      exists: messages?.companySlug?.exists ?? fallbackValidationMessages.companySlug.exists,
    },
  };

  return z.object({
    firstName: z
      .string()
      .min(2, { message: finalMessages.firstName.min })
      .max(50, { message: finalMessages.firstName.max }),
    lastName: z
      .string()
      .min(2, { message: finalMessages.lastName.min })
      .max(50, { message: finalMessages.lastName.max }),
    companyName: z
      .string()
      .min(2, { message: finalMessages.companyName.min })
      .max(100, { message: finalMessages.companyName.max }),
    companySlug: z
      .string()
      .min(3, { message: finalMessages.companySlug.min })
      .max(50, { message: finalMessages.companySlug.max })
      .regex(/^[a-z0-9-]+$/, { message: finalMessages.companySlug.invalid })
      .refine(async (slug) => {
        // Check if slug already exists in boteco.companies
        const { data, error } = await supabase
          .from('companies')
          .select('slug')
          .eq('slug', slug)
          .limit(1);

        if (error) {
          console.error('Error checking slug existence:', error);
          // If there's an error, assume it exists to prevent duplicate creation
          return false; 
        }
        return data?.length === 0; // Slug is valid if no company found with it
      }, { message: finalMessages.companySlug.exists }),
  });
};

type CompanyRegistrationFormValues = z.infer<ReturnType<typeof createFormSchema>>;

const CompanyRegistration: React.FC = () => {
  const { t, i18n } = useTranslation('company-registration');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: clerkUser } = useUser();
  const userId = clerkUser?.id;

  const { data: userData, isLoading: isUserDataLoading, isError: isUserDataError } = useUserCompany();

  const validationMessages = React.useMemo(
    () =>
      validateTranslationMessages(
        t('form.validation', {
          returnObjects: true,
        })
      ),
    [t],
  );

  const formSchema = React.useMemo(
    () => createFormSchema(validationMessages),
    [validationMessages],
  );

  const form = useForm<CompanyRegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: userData?.profile?.first_name || '',
      lastName: userData?.profile?.last_name || '',
      companyName: userData?.company?.name || '',
      companySlug: userData?.company?.slug || '',
    },
    values: { // Ensure form values are updated when userData changes
      firstName: userData?.profile?.first_name || '',
      lastName: userData?.profile?.last_name || '',
      companyName: userData?.company?.name || '',
      companySlug: userData?.company?.slug || '',
    },
  });

  // Redirect if user already has a company
  React.useEffect(() => {
    if (!isUserDataLoading && userData?.userHasCompany) {
      showSuccess(t('redirecting'));
      navigate('/painel');
    }
  }, [isUserDataLoading, userData?.userHasCompany, navigate, t]);

  const registerMutation = useMutation({
    mutationFn: async (values: CompanyRegistrationFormValues) => {
      if (!userId) {
        throw new Error('User not authenticated.');
      }

      // 1. Update public.profiles
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileUpdateError) {
        throw new Error(`Failed to update profile: ${profileUpdateError.message}`);
      }

      // 2. Insert into boteco.companies
      const { data: companyData, error: companyInsertError } = await supabase
        .from('companies')
        .insert({
          name: values.companyName,
          slug: values.companySlug,
          owner_id: userId,
        })
        .select('id')
        .single();

      if (companyInsertError) {
        throw new Error(`Failed to register company: ${companyInsertError.message}`);
      }

      const newCompanyId = companyData.id;

      // 3. Insert into boteco.company_users (assign owner role)
      const { error: companyUserInsertError } = await supabase
        .from('company_users')
        .insert({
          company_id: newCompanyId,
          user_id: userId,
          role: 'owner',
        });

      if (companyUserInsertError) {
        throw new Error(`Failed to assign company owner role: ${companyUserInsertError.message}`);
      }

      return { success: true };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['userCompany', userId] }); // Invalidate to refetch company status
      showSuccess(t('form.successMessage'), { description: t('form.successDescription') });
      navigate('/painel');
    },
    onError: (error) => {
      console.error('Company registration error:', error);
      showError(t('form.errorMessage'), { description: error.message || t('form.errorDescription') });
    },
  });

  const onSubmit = async (values: CompanyRegistrationFormValues) => {
    registerMutation.mutate(values);
  };

  const pageTitle = t('seo.title');
  const pageDescription = t('seo.description');

  if (isUserDataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-boteco-primary" />
          <p className="mt-2 text-sm text-boteco-neutral/80">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isUserDataError) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-destructive">Erro ao carregar dados</h1>
        <p className="text-boteco-neutral/80">Não foi possível carregar suas informações. Por favor, tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={pageTitle}
        description={pageDescription}
        ogTitle={pageTitle}
        ogDescription={pageDescription}
        locale={i18n.language}
      />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card depth="elevated" className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-boteco-primary mb-2">
              {t('title')}
            </CardTitle>
            <CardDescription className="text-lg text-boteco-neutral/90">
              {t('description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-boteco-neutral">{t('form.firstNameLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('form.firstNamePlaceholder')} {...field} className="mt-1" disabled={registerMutation.isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-boteco-neutral">{t('form.lastNameLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('form.lastNamePlaceholder')} {...field} className="mt-1" disabled={registerMutation.isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-boteco-neutral">{t('form.companyNameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('form.companyNamePlaceholder')} {...field} className="mt-1" disabled={registerMutation.isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companySlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-boteco-neutral">{t('form.companySlugLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('form.companySlugPlaceholder')} {...field} className="mt-1" disabled={registerMutation.isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full active:scale-98 transition-transform duration-100"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('form.submitting')}
                    </>
                  ) : (
                    t('form.submitButton')
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CompanyRegistration;