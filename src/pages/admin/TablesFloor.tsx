import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompany } from '@/contexts/CompanyContext';
import { getTables, updateTableStatus, type Table } from '@/lib/api/tables';
import { supabase } from '@/lib/supabase';
import { MoreVertical, Users, Clock, CheckCircle2, AlertTriangle, Wrench } from 'lucide-react';
import Seo from '@/components/Seo';

const TablesFloor: React.FC = () => {
  const { t, i18n } = useTranslation('tables-floor');
  const { selectedCompany } = useCompany();
  const companyId = selectedCompany?.id;

  const { data: tables, isLoading, refetch } = useQuery({
    queryKey: ['tables', 'floor', companyId],
    queryFn: () => getTables(companyId!, false),
    enabled: !!companyId,
    staleTime: 15 * 1000,
  });

  // Realtime subscription for table status updates
  React.useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`tables-floor-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tables',
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, refetch]);

  const handleStatusChange = async (tableId: string, newStatus: Table['status']) => {
    if (!companyId) return;

    try {
      await updateTableStatus(tableId, companyId, newStatus);
      refetch();
    } catch (error) {
      console.error('Failed to update table status:', error);
    }
  };

  const getStatusBadgeVariant = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'destructive';
      case 'reserved':
        return 'secondary';
      case 'maintenance':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'occupied':
        return <Users className="h-4 w-4" />;
      case 'reserved':
        return <Clock className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const statusCounts = React.useMemo(() => {
    if (!tables) return { available: 0, occupied: 0, reserved: 0, maintenance: 0 };
    
    return tables.reduce(
      (acc, table) => {
        acc[table.status] = (acc[table.status] || 0) + 1;
        return acc;
      },
      { available: 0, occupied: 0, reserved: 0, maintenance: 0 } as Record<Table['status'], number>
    );
  }, [tables]);

  if (!companyId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-boteco-primary">
          {t('noCompany.title', { defaultValue: 'Selecione uma empresa' })}
        </h1>
        <p className="text-boteco-neutral/80">
          {t('noCompany.helper', { defaultValue: 'Escolha uma empresa para visualizar o salão.' })}
        </p>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={t('title', { defaultValue: 'Visão do Salão' })}
        description={t('description', { defaultValue: 'Gerencie o status das mesas em tempo real' })}
        locale={i18n.language}
      />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-boteco-primary">
            {t('title', { defaultValue: 'Visão do Salão' })}
          </h1>
          <p className="text-boteco-neutral/80 mt-1">
            {t('subtitle', { defaultValue: 'Acompanhe e gerencie o status de todas as mesas' })}
          </p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card depth="surface">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-boteco-neutral/70">
                    {t('status.available', { defaultValue: 'Disponíveis' })}
                  </p>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.available}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600/50" />
              </div>
            </CardContent>
          </Card>

          <Card depth="surface">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-boteco-neutral/70">
                    {t('status.occupied', { defaultValue: 'Ocupadas' })}
                  </p>
                  <p className="text-2xl font-bold text-red-600">{statusCounts.occupied}</p>
                </div>
                <Users className="h-8 w-8 text-red-600/50" />
              </div>
            </CardContent>
          </Card>

          <Card depth="surface">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-boteco-neutral/70">
                    {t('status.reserved', { defaultValue: 'Reservadas' })}
                  </p>
                  <p className="text-2xl font-bold text-orange-600">{statusCounts.reserved}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600/50" />
              </div>
            </CardContent>
          </Card>

          <Card depth="surface">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-boteco-neutral/70">
                    {t('status.maintenance', { defaultValue: 'Manutenção' })}
                  </p>
                  <p className="text-2xl font-bold text-gray-600">{statusCounts.maintenance}</p>
                </div>
                <Wrench className="h-8 w-8 text-gray-600/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : tables && tables.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tables.map((table) => (
              <Card
                key={table.id}
                depth="elevated"
                className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-boteco-neutral">{table.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {table.capacity} {t('seats', { defaultValue: 'lugares', count: table.capacity })}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          {t('actions.changeStatus', { defaultValue: 'Alterar status' })}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(table.id, 'available')}>
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                          {t('status.available', { defaultValue: 'Disponível' })}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(table.id, 'occupied')}>
                          <Users className="h-4 w-4 mr-2 text-red-600" />
                          {t('status.occupied', { defaultValue: 'Ocupada' })}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(table.id, 'reserved')}>
                          <Clock className="h-4 w-4 mr-2 text-orange-600" />
                          {t('status.reserved', { defaultValue: 'Reservada' })}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(table.id, 'maintenance')}>
                          <Wrench className="h-4 w-4 mr-2 text-gray-600" />
                          {t('status.maintenance', { defaultValue: 'Manutenção' })}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant={getStatusBadgeVariant(table.status)} className="w-full justify-center">
                    <span className="mr-1">{getStatusIcon(table.status)}</span>
                    {t(`status.${table.status}`, { defaultValue: table.status })}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card depth="surface">
            <CardContent className="py-12 text-center">
              <p className="text-boteco-neutral/60">
                {t('empty', { defaultValue: 'Nenhuma mesa cadastrada ainda.' })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default TablesFloor;
