import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation('painel');

  // Generate breadcrumbs from current path
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (paths[0] === 'painel') {
      breadcrumbs.push({
        label: t('sidebar.dashboard', { defaultValue: 'Dashboard' }),
        href: '/painel',
        isLast: paths.length === 1,
      });

      if (paths.length > 1) {
        const section = paths[1];
        const sectionLabel = t(`sidebar.${section}`, { defaultValue: section });
        breadcrumbs.push({
          label: sectionLabel,
          href: `/painel/${section}`,
          isLast: paths.length === 2,
        });

        if (paths.length > 2) {
          const subsection = paths[2];
          const subsectionLabel = t(`sidebar.${section}.${subsection}`, {
            defaultValue: subsection,
          });
          breadcrumbs.push({
            label: subsectionLabel,
            href: `/painel/${section}/${subsection}`,
            isLast: true,
          });
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem className="hidden md:block">
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!crumb.isLast && index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
