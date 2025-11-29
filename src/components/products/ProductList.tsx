import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';
import { useUserCompany } from '@/hooks/use-user-company';
import {
  Product,
  ProductInput,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  PRODUCTS_QUERY_KEY,
} from '@/lib/storage/products';
import ProductForm from './ProductForm';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProductList: React.FC = () => {
  const { t } = useTranslation('products');
  const queryClient = useQueryClient();
  const { data: userCompanyData, isLoading: isUserCompanyLoading, isError: isUserCompanyError } = useUserCompany();
  const companyId = userCompanyData?.company?.id;

  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | undefined>(undefined);

  const productsQuery = useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, companyId],
    queryFn: () => getProducts(companyId!),
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const createProductMutation = useMutation({
    mutationFn: (newProduct: ProductInput) => createProduct(companyId!, newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, companyId] });
      showSuccess(t('form.createSuccess'));
      setIsFormDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      showError(t('form.createError'), { description: error.message });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, product }: { id: string; product: Partial<ProductInput> }) => updateProduct(id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, companyId] });
      showSuccess(t('form.updateSuccess'));
      setIsFormDialogOpen(false);
      setEditingProduct(undefined);
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      showError(t('form.updateError'), { description: error.message });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY, companyId] });
      showSuccess(t('form.deleteSuccess'));
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      showError(t('form.deleteError'), { description: error.message });
    },
  });

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormDialogOpen(true);
  };

  const handleFormSubmit = (data: ProductInput) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, product: data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;
  const isLoading = productsQuery.isLoading || isUserCompanyLoading;
  const isError = productsQuery.isError || isUserCompanyError;

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-8">
        <AlertTitle>{t('errors.title')}</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>{t('errors.loadProducts')}</span>
          <Button variant="outline" size="sm" onClick={() => productsQuery.refetch()}>
            {t('actions.retry')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <section className="mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-boteco-primary">
          {t('list.title')}
        </h2>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddProduct} disabled={isLoading}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('list.addProductButton')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-depth-surface text-foreground">
            <DialogHeader>
              <DialogTitle className="text-boteco-primary">
                {editingProduct ? t('form.editTitle') : t('form.createTitle')}
              </DialogTitle>
              <DialogDescription className="text-boteco-neutral/80">
                {editingProduct ? t('form.editDescription') : t('form.createDescription')}
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              initialData={editingProduct}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              onCancel={() => setIsFormDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : productsQuery.data && productsQuery.data.length > 0 ? (
        <Card depth="surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-boteco-neutral">{t('list.tableHeaders.name')}</TableHead>
                <TableHead className="text-boteco-neutral">{t('list.tableHeaders.category')}</TableHead>
                <TableHead className="text-boteco-neutral">{t('list.tableHeaders.price')}</TableHead>
                <TableHead className="text-boteco-neutral">{t('list.tableHeaders.stock')}</TableHead>
                <TableHead className="text-boteco-neutral">{t('list.tableHeaders.status')}</TableHead>
                <TableHead className="text-right text-boteco-neutral">{t('list.tableHeaders.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsQuery.data.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-boteco-neutral">{product.name}</TableCell>
                  <TableCell className="text-boteco-neutral/80">{product.category}</TableCell>
                  <TableCell className="text-boteco-neutral/80">{product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-boteco-neutral/80">{product.stock} {product.unit}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        product.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }
                    >
                      {product.is_active ? t('list.status.active') : t('list.status.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                        aria-label={t('list.editProduct', { productName: product.name })}
                        disabled={deleteProductMutation.isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('list.deleteProduct', { productName: product.name })}
                            disabled={deleteProductMutation.isPending}
                          >
                            {deleteProductMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-depth-surface text-foreground">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-boteco-primary">
                              {t('form.deleteConfirmTitle')}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-boteco-neutral/80">
                              {t('form.deleteConfirmDescription', { productName: product.name })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel asChild>
                              <Button variant="outline">{t('form.cancelButton')}</Button>
                            </AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Button
                                variant="destructive"
                                onClick={() => deleteProductMutation.mutate(product.id)}
                                disabled={deleteProductMutation.isPending}
                              >
                                {deleteProductMutation.isPending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  t('form.deleteButton')
                                )}
                              </Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <p className="text-sm text-boteco-neutral/60">
          {t('list.empty')}
        </p>
      )}
    </section>
  );
};

export default ProductList;