import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/lib/supabase';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '@/lib/api/products';
import type { Database } from '@/types/database';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];

const Products = () => {
  const { t } = useTranslation('products');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedCompanyId } = useCompany();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<ProductInsert>>({
    name: '',
    category: 'drink',
    price: 0,
    stock: 0,
    min_stock: 5,
    description: '',
    is_active: true,
  });

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', selectedCompanyId],
    queryFn: () => selectedCompanyId ? getProducts(selectedCompanyId, false) : Promise.resolve([]),
    enabled: !!selectedCompanyId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!selectedCompanyId) return;

    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `company_id=eq.${selectedCompanyId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['products', selectedCompanyId] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [selectedCompanyId, queryClient]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ProductInsert) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', selectedCompanyId] });
      toast({
        title: t('toast.createSuccess'),
        variant: 'default',
      });
      closeForm();
    },
    onError: () => {
      toast({
        title: t('toast.createError'),
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductInsert> }) =>
      updateProduct(id, selectedCompanyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', selectedCompanyId] });
      toast({
        title: t('toast.updateSuccess'),
        variant: 'default',
      });
      closeForm();
    },
    onError: () => {
      toast({
        title: t('toast.updateError'),
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id, selectedCompanyId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', selectedCompanyId] });
      toast({
        title: t('toast.deleteSuccess'),
        variant: 'default',
      });
      setIsDeleteOpen(false);
      setDeletingProduct(null);
    },
    onError: () => {
      toast({
        title: t('toast.deleteError'),
        variant: 'destructive',
      });
    },
  });

  // Filtered products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && product.is_active) ||
      (statusFilter === 'inactive' && !product.is_active) ||
      (statusFilter === 'low-stock' && (product.stock ?? 0) <= (product.min_stock ?? 0));
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock ?? 0,
        min_stock: product.min_stock ?? 5,
        description: product.description ?? '',
        is_active: product.is_active ?? true,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'drink',
        price: 0,
        stock: 0,
        min_stock: 5,
        description: '',
        is_active: true,
      });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'drink',
      price: 0,
      stock: 0,
      min_stock: 5,
      description: '',
      is_active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;

    const dataToSubmit: ProductInsert = {
      ...formData as ProductInsert,
      company_id: selectedCompanyId,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const openDelete = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (deletingProduct) {
      deleteMutation.mutate(deletingProduct.id);
    }
  };

  if (!selectedCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Package className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">{t('emptyState.description')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
                <TabsList>
                  <TabsTrigger value="all">{t('filterAll')}</TabsTrigger>
                  <TabsTrigger value="drink">{t('filterDrink')}</TabsTrigger>
                  <TabsTrigger value="food">{t('filterFood')}</TabsTrigger>
                  <TabsTrigger value="other">{t('filterOther')}</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filterAll')}</SelectItem>
                  <SelectItem value="active">{t('filterActive')}</SelectItem>
                  <SelectItem value="inactive">{t('filterInactive')}</SelectItem>
                  <SelectItem value="low-stock">{t('filterLowStock')}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => openForm()}>
                <Plus className="w-4 h-4 mr-2" />
                {t('addProduct')}
              </Button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Package className="w-12 h-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="font-semibold">{t('emptyState.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('emptyState.description')}</p>
              </div>
              <Button onClick={() => openForm()}>
                <Plus className="w-4 h-4 mr-2" />
                {t('emptyState.action')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.category')}</TableHead>
                  <TableHead>{t('table.price')}</TableHead>
                  <TableHead>{t('table.stock')}</TableHead>
                  <TableHead>{t('table.minStock')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const isLowStock = (product.stock ?? 0) <= (product.min_stock ?? 0);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{t(`category.${product.category}`)}</TableCell>
                      <TableCell>€{product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={isLowStock ? 'text-destructive font-semibold' : ''}>
                          {product.stock ?? 0}
                        </span>
                      </TableCell>
                      <TableCell>{product.min_stock ?? 0}</TableCell>
                      <TableCell>
                        {isLowStock ? (
                          <Badge variant="destructive">{t('status.lowStock')}</Badge>
                        ) : product.is_active ? (
                          <Badge variant="default">{t('status.active')}</Badge>
                        ) : (
                          <Badge variant="secondary">{t('status.inactive')}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openForm(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDelete(product)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? t('form.editTitle') : t('form.createTitle')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('form.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('form.namePlaceholder')}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">{t('form.category')}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as 'drink' | 'food' | 'other' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drink">{t('category.drink')}</SelectItem>
                    <SelectItem value="food">{t('category.food')}</SelectItem>
                    <SelectItem value="other">{t('category.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">{t('form.price')}</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder={t('form.pricePlaceholder')}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">{t('form.stock')}</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    placeholder={t('form.stockPlaceholder')}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="min_stock">{t('form.minStock')}</Label>
                <Input
                  id="min_stock"
                  type="number"
                  min="0"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) })}
                  placeholder={t('form.minStockPlaceholder')}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  {t('form.isActive')}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                {t('form.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? t('form.saving')
                  : t('form.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
              {t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
