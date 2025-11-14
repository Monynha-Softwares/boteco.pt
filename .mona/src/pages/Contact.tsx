import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Seo from '@/components/Seo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CONTACT_REQUESTS_QUERY_KEY,
  createContactRequest,
  ContactRequestInput,
} from '@/lib/storage/contactRequests';

const fallbackValidationMessages = {
  name: {
    min: 'O nome deve ter pelo menos 2 caracteres.',
    max: 'O nome não pode ter mais de 50 caracteres.',
  },
  email: {
    invalid: 'Por favor, insira um endereço de e-mail válido.',
  },
  message: {
    min: 'A mensagem deve ter pelo menos 10 caracteres.',
    max: 'A mensagem não pode ter mais de 500 caracteres.',
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
    console.warn(`[Contact] Missing or invalid translation structure at "${path}"`);
    return {};
  }

  const validated: Partial<FormValidationMessages> = {};
  const msg = messages as Record<string, unknown>;

  // Validate name messages
  if (msg.name && typeof msg.name === 'object') {
    const name = msg.name as Record<string, unknown>;
    validated.name = {
      min: typeof name.min === 'string' ? name.min : undefined,
      max: typeof name.max === 'string' ? name.max : undefined,
    } as FormValidationMessages['name'];
    
    if (!name.min) console.warn(`[Contact] Missing translation: ${path}.name.min`);
    if (!name.max) console.warn(`[Contact] Missing translation: ${path}.name.max`);
  } else {
    console.warn(`[Contact] Missing translation: ${path}.name`);
  }

  // Validate email messages
  if (msg.email && typeof msg.email === 'object') {
    const email = msg.email as Record<string, unknown>;
    validated.email = {
      invalid: typeof email.invalid === 'string' ? email.invalid : undefined,
    } as FormValidationMessages['email'];
    
    if (!email.invalid) console.warn(`[Contact] Missing translation: ${path}.email.invalid`);
  } else {
    console.warn(`[Contact] Missing translation: ${path}.email`);
  }

  // Validate message messages
  if (msg.message && typeof msg.message === 'object') {
    const message = msg.message as Record<string, unknown>;
    validated.message = {
      min: typeof message.min === 'string' ? message.min : undefined,
      max: typeof message.max === 'string' ? message.max : undefined,
    } as FormValidationMessages['message'];
    
    if (!message.min) console.warn(`[Contact] Missing translation: ${path}.message.min`);
    if (!message.max) console.warn(`[Contact] Missing translation: ${path}.message.max`);
  } else {
    console.warn(`[Contact] Missing translation: ${path}.message`);
  }

  return validated;
};

const createFormSchema = (messages?: Partial<FormValidationMessages>) => {
  const finalMessages: FormValidationMessages = {
    name: {
      min: messages?.name?.min ?? fallbackValidationMessages.name.min,
      max: messages?.name?.max ?? fallbackValidationMessages.name.max,
    },
    email: {
      invalid: messages?.email?.invalid ?? fallbackValidationMessages.email.invalid,
    },
    message: {
      min: messages?.message?.min ?? fallbackValidationMessages.message.min,
      max: messages?.message?.max ?? fallbackValidationMessages.message.max,
    },
  };

  return z.object({
    name: z
      .string()
      .min(2, {
        message: finalMessages.name.min,
      })
      .max(50, {
        message: finalMessages.name.max,
      }),
    email: z.string().email({
      message: finalMessages.email.invalid,
    }),
    phone: z.string().optional(),
    message: z
      .string()
      .min(10, {
        message: finalMessages.message.min,
      })
      .max(500, {
        message: finalMessages.message.max,
      }),
  });
};

type ContactFormSchema = ReturnType<typeof createFormSchema>;
type ContactFormValues = z.infer<ContactFormSchema>;

const Contact: React.FC = () => {
  const { t, i18n } = useTranslation('contact');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const contactMutation = useMutation({
    mutationFn: async (payload: ContactRequestInput) => createContactRequest(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CONTACT_REQUESTS_QUERY_KEY });
    },
  });
  const isSubmitting = contactMutation.isPending;

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

  const formResolver = React.useMemo(() => zodResolver(formSchema), [formSchema]);

  // Inicializa o formulário com react-hook-form e zodResolver
  const form = useForm<ContactFormValues>({
    resolver: formResolver,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  // Função de submissão do formulário
  const onSubmit = async (data: ContactFormValues) => {
    try {
      await contactMutation.mutateAsync(data);
      toast({
        title: t('form.successMessage'),
        description: t('form.successDescription', {
          defaultValue: t('form.successMessage'),
        }),
        variant: "default",
      });
      form.reset();
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : t('form.errorDescription', {
              defaultValue: t('form.errorMessage'),
            });
      toast({
        title: t('form.errorMessage'),
        description,
        variant: "destructive",
      });
    }
  };

  const pageTitle = t('title');
  const pageDescription = t('description');

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
        <Card
          depth="elevated"
          className="transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
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
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-boteco-neutral">{t('form.nameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('form.namePlaceholder')} {...field} className="mt-1" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-boteco-neutral">{t('form.emailLabel')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t('form.emailPlaceholder')} {...field} className="mt-1" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-boteco-neutral">{t('form.phoneLabel')}</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder={t('form.phonePlaceholder')} {...field} className="mt-1" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-boteco-neutral">{t('form.messageLabel')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('form.messagePlaceholder')} rows={5} {...field} className="mt-1" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full active:scale-98 transition-transform duration-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('form.submitting', { defaultValue: 'Enviando...' })}
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

export default Contact;