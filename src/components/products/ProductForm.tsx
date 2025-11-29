import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, ProductInput } from '@/lib/storage/products';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductInput) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

// Fallback validation messages (should be overridden by translations)
const fallbackValidationMessages = {
  name: {
    min: 'Product name must be at least 2 characters.',
    max: 'Product name cannot be longer than 100 characters.',
  },
  price: {
    min: 'Price must be a positive number.',
    invalid: 'Price must be a valid number.',
  },
  stock: {
    min: 'Stock must be a non-negative integer.',
    invalid: 'Stock must be a valid integer.',
  },
  category: {
    min: 'Category must be at least 2 characters.',
    max: 'Category cannot be longer than 50 characters.',
  },
  unit: {
    min: 'Unit must be at least 1 character.',
    max: 'Unit cannot be longer than 20 characters.',
  },
};

type FormValidationMessages = typeof fallbackValidationMessages;

const validateTranslationMessages = (
  messages: unknown,
  path: string = 'form.validation'
): Partial<FormValidationMessages> => {
  if (!messages || typeof messages !== 'object') {
    console.warn(`[ProductForm] Missing or invalid translation structure at "${path}"`);
    return {};
  }

  const validated: Partial<FormValidationMessages> = {};
  const msg = messages as Record<string, unknown>;

  if (msg.name && typeof msg.name === 'object') {
    const name = msg.name as Record<string, unknown>;
    validated.name = {
      min: typeof name.min === 'string' ? name.min : undefined,
      max: typeof name.max === 'string' ? name.max : undefined,
    } as FormValidationMessages['name'];
  }
  if (msg.price && typeof msg.price === 'object') {
    const price = msg.price as Record<string, unknown>;
    validated.price = {
      min: typeof price.min === 'string' ? price.min : undefined,
      invalid: typeof price.invalid === 'string' ? price.invalid : undefined,
    } as FormValidationMessages['price'];
  }
  if (msg.stock && typeof msg.stock === 'object') {
    const stock = msg.stock as Record<string, unknown>;
    validated.stock = {
      min: typeof stock.min === 'string' ? stock.min : undefined,
      invalid: typeof stock.invalid === 'string' ? stock.invalid : undefined,
    } as FormValidationMessages['stock'];
  }
  if (msg.category && typeof msg.category === 'object') {
    const category = msg.category as Record<string, unknown>;
    validated.category = {
      min: typeof category.min === 'string' ? category.min : undefined,
      max: typeof category.max === 'string' ? category.max : undefined,
    } as FormValidationMessages['category'];
  }
  if (msg.unit && typeof msg.unit === 'object') {
    const unit = msg.unit as Record<string, unknown>;
    validated.unit = {
      min: typeof unit.min === 'string' ? unit.min : undefined,
      max: typeof unit.max === 'string' ? unit.max : undefined,
    } as FormValidationMessages['unit'];
  }

  return validated;
};

const createFormSchema = (messages?: Partial<FormValidationMessages>) => {
  const finalMessages: FormValidationMessages = {
    name: {
      min: messages?.name?.min ?? fallbackValidationMessages.name.min,
      max: messages?.name?.max ?? fallbackValidationMessages.name.max,
    },
    price: {
      min: messages?.price?.min ?? fallbackValidationMessages.price.min,
      invalid: messages?.price?.invalid ?? fallbackValidationMessages.price.invalid,
    },
    stock: {
      min: messages?.stock?.min ?? fallbackValidationMessages.stock.min,
      invalid: messages?.stock?.invalid ?? fallbackValidationMessages.stock.invalid,
    },
    category: {
      min: messages?.category?.min ?? fallbackValidationMessages.category.min,
      max: messages?.category?.max ?? fallbackValidationMessages.category.max,
    },
    unit: {
      min: messages?.unit?.min ?? fallbackValidationMessages.unit.min,
      max: messages?.unit?.max ?? fallbackValidationMessages.unit.max,
    },
  };

  return z.object({
    name: z.string().min(2, { message: finalMessages.name.min }).max(100, { message: finalMessages.name.max }),
    description: z.string().max(500).optional().nullable(),
    price: z.coerce.number().min(0.01, { message: finalMessages.price.min }).refine(val => !isNaN(val), { message: finalMessages.price.invalid }),
    cost: z.coerce.number().min(0).optional().nullable(),
    stock: z.coerce.number().int().min(0, { message: finalMessages.stock.min }).refine(val => !isNaN(val), { message: finalMessages.stock.invalid }),
    min_stock: z.coerce.number().int().min(0).optional().nullable(),
    category: z.string().min(2, { message: finalMessages.category.min }).max(50, { message: finalMessages.category.max }),
    unit: z.string().min(1, { message: finalMessages.unit.min }).max(20, { message: finalMessages.unit.max }),
    barcode: z.string().max(50).optional().nullable(),
    image_url: z.string().url().optional().nullable().or(z.literal('')),
    is_active: z.boolean().default(true),
    internal_notes: z.string().max(500).optional().nullable(),
  });
};

type ProductFormValues = z.infer<ReturnType<typeof createFormSchema>>;

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isSubmitting, onCancel }) => {
  const { t } = useTranslation('products');

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

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      cost: initialData?.cost || 0,
      stock: initialData?.stock || 0,
      min_stock: initialData?.min_stock || 0,
      category: initialData?.category || '',
      unit: initialData?.unit || '',
      barcode: initialData?.barcode || '',
      image_url: initialData?.image_url || '',
      is_active: initialData?.is_active ?? true,
      internal_notes: initialData?.internal_notes || '',
    },
  });

  const categories = t('form.categories', { returnObjects: true }) as string[];
  const units = t('form.units', { returnObjects: true }) as string[];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-boteco-neutral">{t('form.nameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.namePlaceholder')} {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-boteco-neutral">{t('form.descriptionLabel')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('form.descriptionPlaceholder')} {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-boteco-neutral">{t('form.priceLabel')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder={t('form.pricePlaceholder')} {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-boteco-neutral">{t('form.costLabel')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder={t('form.costPlaceholder')} {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-boteco-neutral">{t('form.stockLabel')}</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder={t('form.stockPlaceholder')} {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="min_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-boteco-neutral">{t('form.minStockLabel')}</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder={t('form.minStockPlaceholder')} {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-boteco-neutral">{t('form.categoryLabel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.categoryPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-boteco-neutral">{t('form.unitLabel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.unitPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-boteco-neutral">{t('form.barcodeLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.barcodePlaceholder')} {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-boteco-neutral">{t('form.imageUrlLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.imageUrlPlaceholder')} {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="internal_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-boteco-neutral">{t('form.internalNotesLabel')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('form.internalNotesPlaceholder')} {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base text-boteco-neutral">
                  {t('form.isActiveLabel')}
                </FormLabel>
                <FormDescription className="text-boteco-neutral/80">
                  {t('form.isActiveDescription')}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                  aria-label={t('form.isActiveLabel')}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t('form.cancelButton')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('form.submitting')}
              </>
            ) : (
              initialData ? t('form.updateButton') : t('form.createButton')
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;