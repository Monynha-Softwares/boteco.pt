import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Seo from '@/components/Seo'; // Importar o componente Seo

const Contact: React.FC = () => {
  const { t, i18n } = useTranslation('contact');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just log to console and show a toast
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    console.log('Formulário de Contato Enviado:', data);

    toast({
      title: t('form.successMessage'),
      description: "Sua mensagem foi recebida e entraremos em contato em breve.",
      variant: "default",
    });

    // Optionally clear the form
    (e.target as HTMLFormElement).reset();
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
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-monynha-primary mb-2">
              {t('title')}
            </CardTitle>
            <CardDescription className="text-lg text-monynha-neutral-600">
              {t('description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-monynha-neutral-700">
                  {t('form.nameLabel')}
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder={t('form.namePlaceholder')}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-monynha-neutral-700">
                  {t('form.emailLabel')}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('form.emailPlaceholder')}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-monynha-neutral-700">
                  {t('form.phoneLabel')}
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder={t('form.phonePlaceholder')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="message" className="text-monynha-neutral-700">
                  {t('form.messageLabel')}
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder={t('form.messagePlaceholder')}
                  rows={5}
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full bg-monynha-primary text-monynha-primary-foreground hover:bg-monynha-primary/90">
                {t('form.submitButton')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Contact;