import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  Warehouse,
  TruckIcon,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  Building2,
  Receipt,
  ShoppingCart,
  ClipboardList,
  DollarSign,
  PieChart,
  UserCog,
  BellRing,
  Calendar,
  FileText,
  Tags,
  Percent,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number;
  items?: {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC = () => {
  const { t } = useTranslation('painel');
  const location = useLocation();
  const { state } = useSidebar();

  // Navigation structure - organized by functional areas
  const navigation: NavGroup[] = [
    {
      title: t('sidebar.groups.overview', { defaultValue: 'Visão Geral' }),
      items: [
        {
          title: t('sidebar.dashboard', { defaultValue: 'Dashboard' }),
          icon: LayoutDashboard,
          href: '/painel',
        },
        {
          title: t('sidebar.notifications', { defaultValue: 'Notificações' }),
          icon: BellRing,
          href: '/painel/notificacoes',
          badge: 3,
        },
      ],
    },
    {
      title: t('sidebar.groups.operations', { defaultValue: 'Operações' }),
      items: [
        {
          title: t('sidebar.tablesMain', { defaultValue: 'Mesas & Pedidos' }),
          icon: UtensilsCrossed,
          href: '/painel/mesas',
          badge: 'LIVE',
          items: [
            {
              title: t('sidebar.tables.floor', { defaultValue: 'Visão do Salão' }),
              href: '/painel/mesas/salao',
              icon: LayoutDashboard,
            },
            {
              title: t('sidebar.tables.orders', { defaultValue: 'Pedidos Ativos' }),
              href: '/painel/mesas/pedidos',
              icon: Receipt,
            },
            {
              title: t('sidebar.tables.reservations', { defaultValue: 'Reservas' }),
              href: '/painel/mesas/reservas',
              icon: Calendar,
            },
          ],
        },
        {
          title: t('sidebar.productsMain', { defaultValue: 'Produtos & Receitas' }),
          icon: Package,
          href: '/painel/produtos',
          items: [
            {
              title: t('sidebar.products.menu', { defaultValue: 'Cardápio' }),
              href: '/painel/produtos/cardapio',
              icon: FileText,
            },
            {
              title: t('sidebar.products.recipes', { defaultValue: 'Receitas' }),
              href: '/painel/produtos/receitas',
              icon: ClipboardList,
            },
            {
              title: t('sidebar.products.categories', { defaultValue: 'Categorias' }),
              href: '/painel/produtos/categorias',
              icon: Tags,
            },
          ],
        },
        {
          title: t('sidebar.inventoryMain', { defaultValue: 'Estoque' }),
          icon: Warehouse,
          href: '/painel/estoque',
          items: [
            {
              title: t('sidebar.inventory.current', { defaultValue: 'Estoque Atual' }),
              href: '/painel/estoque/atual',
              icon: Package,
            },
            {
              title: t('sidebar.inventory.movements', { defaultValue: 'Movimentações' }),
              href: '/painel/estoque/movimentacoes',
              icon: FileText,
            },
            {
              title: t('sidebar.inventory.alerts', { defaultValue: 'Alertas' }),
              href: '/painel/estoque/alertas',
              icon: BellRing,
            },
          ],
        },
      ],
    },
    {
      title: t('sidebar.groups.purchasing', { defaultValue: 'Compras' }),
      items: [
        {
          title: t('sidebar.suppliersMain', { defaultValue: 'Fornecedores' }),
          icon: TruckIcon,
          href: '/painel/fornecedores',
          items: [
            {
              title: t('sidebar.suppliers.list', { defaultValue: 'Lista de Fornecedores' }),
              href: '/painel/fornecedores/lista',
              icon: Building2,
            },
            {
              title: t('sidebar.suppliers.orders', { defaultValue: 'Pedidos de Compra' }),
              href: '/painel/fornecedores/pedidos',
              icon: ShoppingCart,
            },
            {
              title: t('sidebar.suppliers.contracts', { defaultValue: 'Contratos' }),
              href: '/painel/fornecedores/contratos',
              icon: FileText,
            },
          ],
        },
      ],
    },
    {
      title: t('sidebar.groups.financial', { defaultValue: 'Financeiro' }),
      items: [
        {
          title: t('sidebar.salesMain', { defaultValue: 'Vendas' }),
          icon: CreditCard,
          href: '/painel/vendas',
          items: [
            {
              title: t('sidebar.sales.history', { defaultValue: 'Histórico' }),
              href: '/painel/vendas/historico',
              icon: FileText,
            },
            {
              title: t('sidebar.sales.payments', { defaultValue: 'Pagamentos' }),
              href: '/painel/vendas/pagamentos',
              icon: DollarSign,
            },
            {
              title: t('sidebar.sales.invoices', { defaultValue: 'Notas Fiscais' }),
              href: '/painel/vendas/notas',
              icon: Receipt,
            },
          ],
        },
        {
          title: t('sidebar.reportsMain', { defaultValue: 'Relatórios' }),
          icon: BarChart3,
          href: '/painel/relatorios',
          items: [
            {
              title: t('sidebar.reports.sales', { defaultValue: 'Vendas' }),
              href: '/painel/relatorios/vendas',
              icon: DollarSign,
            },
            {
              title: t('sidebar.reports.inventory', { defaultValue: 'Estoque' }),
              href: '/painel/relatorios/estoque',
              icon: Package,
            },
            {
              title: t('sidebar.reports.financial', { defaultValue: 'Financeiro' }),
              href: '/painel/relatorios/financeiro',
              icon: PieChart,
            },
            {
              title: t('sidebar.reports.custom', { defaultValue: 'Personalizados' }),
              href: '/painel/relatorios/personalizados',
              icon: FileText,
            },
          ],
        },
      ],
    },
    {
      title: t('sidebar.groups.management', { defaultValue: 'Gestão' }),
      items: [
        {
          title: t('sidebar.teamMain', { defaultValue: 'Equipe' }),
          icon: Users,
          href: '/painel/equipe',
          items: [
            {
              title: t('sidebar.team.members', { defaultValue: 'Membros' }),
              href: '/painel/equipe/membros',
              icon: Users,
            },
            {
              title: t('sidebar.team.roles', { defaultValue: 'Cargos & Permissões' }),
              href: '/painel/equipe/cargos',
              icon: UserCog,
            },
            {
              title: t('sidebar.team.schedule', { defaultValue: 'Escalas' }),
              href: '/painel/equipe/escalas',
              icon: Calendar,
            },
          ],
        },
        {
          title: t('sidebar.settingsMain', { defaultValue: 'Configurações' }),
          icon: Settings,
          href: '/painel/configuracoes',
          items: [
            {
              title: t('sidebar.settings.organization', { defaultValue: 'Organização' }),
              href: '/painel/configuracoes/organizacao',
              icon: Building2,
            },
            {
              title: t('sidebar.settings.integrations', { defaultValue: 'Integrações' }),
              href: '/painel/configuracoes/integracoes',
              icon: Package,
            },
            {
              title: t('sidebar.settings.promotions', { defaultValue: 'Promoções' }),
              href: '/painel/configuracoes/promocoes',
              icon: Percent,
            },
          ],
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/painel') {
      return location.pathname === '/painel';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/painel">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-boteco-primary text-boteco-primary-foreground">
                  <UtensilsCrossed className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">BotecoPro</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {t('sidebar.subtitle', { defaultValue: 'Painel de Controle' })}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const hasSubItems = item.items && item.items.length > 0;
                  const itemIsActive = isActive(item.href);

                  if (hasSubItems) {
                    return (
                      <Collapsible
                        key={itemIndex}
                        asChild
                        defaultOpen={itemIsActive}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.title}
                              isActive={itemIsActive}
                            >
                              <Icon className="size-4" />
                              <span>{item.title}</span>
                              {item.badge && state === 'expanded' && (
                                <Badge
                                  variant={item.badge === 'LIVE' ? 'destructive' : 'secondary'}
                                  className="ml-auto text-xs"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                              <ChevronDown className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items?.map((subItem, subIndex) => {
                                const SubIcon = subItem.icon;
                                return (
                                  <SidebarMenuSubItem key={subIndex}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isActive(subItem.href)}
                                    >
                                      <Link to={subItem.href}>
                                        {SubIcon && <SubIcon className="size-4" />}
                                        <span>{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  return (
                    <SidebarMenuItem key={itemIndex}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={itemIsActive}
                      >
                        <Link to={item.href}>
                          <Icon className="size-4" />
                          <span>{item.title}</span>
                          {item.badge && state === 'expanded' && (
                            <Badge
                              variant={item.badge === 'LIVE' ? 'destructive' : 'secondary'}
                              className="ml-auto text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              <a
                href="https://github.com/Monynha-Softwares/boteco.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {state === 'expanded' ? (
                  <span>© 2025 Monynha Softwares</span>
                ) : (
                  <span>©</span>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
