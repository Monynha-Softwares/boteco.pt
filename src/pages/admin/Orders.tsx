import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus, Search, Eye, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useCompany } from '@/contexts/CompanyContext';
import type { Database } from '@/types/database';
import { getOrders, updateOrder, createOrder } from '@/lib/api/orders';
import { getTables } from '@/lib/api/tables';

// Types
 type Order = Database['public']['Tables']['orders']['Row'];
 type OrderInsert = Database['public']['Tables']['orders']['Insert'];
 type TableEntity = Database['public']['Tables']['tables']['Row'];

const Orders = () => {
  const { t } = useTranslation('orders');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedCompanyId } = useCompany();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [cancelingOrder, setCancelingOrder] = useState<Order | null>(null);

  const [formData, setFormData] = useState<Partial<OrderInsert>>({
    company_id: '',
    table_id: '',
    status: 'pending',
  });

  // Fetch tables for selection
  const { data: tables = [] } = useQuery({
    queryKey: ['tables', selectedCompanyId, 'orders'],
    queryFn: () => selectedCompanyId ? getTables(selectedCompanyId, true) : Promise.resolve([]),
    enabled: !!selectedCompanyId,
  });

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', selectedCompanyId, statusFilter],
    queryFn: () => selectedCompanyId ? getOrders(selectedCompanyId, statusFilter === 'all' ? undefined : statusFilter as Order['status']) : Promise.resolve([]),
    enabled: !!selectedCompanyId,
  });

  // Realtime subscription for orders
  useEffect(() => {
    if (!selectedCompanyId) return;
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `company_id=eq.${selectedCompanyId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['orders', selectedCompanyId] });
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [selectedCompanyId, queryClient]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: OrderInsert) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', selectedCompanyId] });
      toast({ title: t('toast.createSuccess') });
      closeForm();
    },
    onError: () => toast({ title: t('toast.createError'), variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<OrderInsert> }) => updateOrder(id, selectedCompanyId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', selectedCompanyId] });
      toast({ title: t('toast.updateSuccess') });
      closeForm();
    },
    onError: () => toast({ title: t('toast.updateError'), variant: 'destructive' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) => updateOrder(id, selectedCompanyId!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', selectedCompanyId] });
      toast({ title: t('toast.statusSuccess') });
      setIsDetailsOpen(false);
    },
    onError: () => toast({ title: t('toast.statusError'), variant: 'destructive' }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateOrder(id, selectedCompanyId!, { status: 'canceled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', selectedCompanyId] });
      toast({ title: t('toast.cancelSuccess') });
      setIsCancelOpen(false);
    },
    onError: () => toast({ title: t('toast.cancelError'), variant: 'destructive' }),
  });

  // Filtering
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch; // status already applied in query
  });

  // UI helpers
  const openForm = (order?: Order) => {
    if (order) {
      setEditingOrder(order);
      setFormData({ company_id: order.company_id, table_id: order.table_id, status: order.status });
    } else {
      setEditingOrder(null);
      setFormData({ company_id: selectedCompanyId!, table_id: '', status: 'pending' });
    }
    setIsFormOpen(true);
  };
  const closeForm = () => { setIsFormOpen(false); setEditingOrder(null); };

  const openDetails = (order: Order) => { setViewingOrder(order); setIsDetailsOpen(true); };
  const openCancel = (order: Order) => { setCancelingOrder(order); setIsCancelOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    const submitData: OrderInsert = { company_id: selectedCompanyId, table_id: formData.table_id!, status: formData.status as Order['status'] };
    if (editingOrder) {
      updateMutation.mutate({ id: editingOrder.id, updates: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const statusBadge = (status: Order['status']) => {
    const variant: Record<Order['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
      pending: 'secondary',
      preparing: 'default',
      ready: 'outline',
      delivered: 'default',
      canceled: 'destructive',
    };
    return <Badge variant={variant[status]}>{t(`status.${status}`)}</Badge>;
  };

  if (!selectedCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <ClipboardList className="w-12 h-12 text-muted-foreground" />
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filterAll')}</SelectItem>
                  <SelectItem value="pending">{t('filterPending')}</SelectItem>
                  <SelectItem value="preparing">{t('filterPreparing')}</SelectItem>
                  <SelectItem value="ready">{t('filterReady')}</SelectItem>
                  <SelectItem value="delivered">{t('filterDelivered')}</SelectItem>
                  <SelectItem value="canceled">{t('filterCanceled')}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => openForm()}>
                <Plus className="w-4 h-4 mr-2" />
                {t('newOrder')}
              </Button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <ClipboardList className="w-12 h-12 text-muted-foreground" />
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
                  <TableHead>{t('table.number')}</TableHead>
                  <TableHead>{t('table.table')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.created')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{tables.find(t => t.id === order.table_id)?.name || '—'}</TableCell>
                    <TableCell>{statusBadge(order.status)}</TableCell>
                    <TableCell>{order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openDetails(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {order.status !== 'canceled' && (
                          <Button variant="ghost" size="sm" onClick={() => openCancel(order)}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingOrder ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="table_id">{t('form.selectTable')}</label>
                <Select value={formData.table_id} onValueChange={(value) => setFormData({ ...formData, table_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectTablePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map(table => (
                      <SelectItem key={table.id} value={table.id}>{table.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="status">{t('table.status')}</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Order['status'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('status.pending')}</SelectItem>
                    <SelectItem value="preparing">{t('status.preparing')}</SelectItem>
                    <SelectItem value="ready">{t('status.ready')}</SelectItem>
                    <SelectItem value="delivered">{t('status.delivered')}</SelectItem>
                    <SelectItem value="canceled">{t('status.canceled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>{t('form.cancel')}</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? t('form.saving') : t('form.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('details.title')}</DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>{t('details.orderNumber')}{viewingOrder.id.slice(0,8)}</span>
                <span>{statusBadge(viewingOrder.status)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('details.table')}</p>
                  <p>{tables.find(t => t.id === viewingOrder.table_id)?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('details.created')}</p>
                  <p>{viewingOrder.created_at ? new Date(viewingOrder.created_at).toLocaleString() : '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('details.updated')}</p>
                  <p>{viewingOrder.updated_at ? new Date(viewingOrder.updated_at).toLocaleString() : '—'}</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                {viewingOrder.status !== 'canceled' && viewingOrder.status !== 'delivered' && (
                  <Button
                    size="sm"
                    onClick={() => statusMutation.mutate({ id: viewingOrder.id, status: 'delivered' })}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> {t('actions.complete')}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(false)}>{t('details.close')}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cancel.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('cancel.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancelingOrder && cancelMutation.mutate(cancelingOrder.id)} disabled={cancelMutation.isPending}>
              {t('cancel.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Orders;
