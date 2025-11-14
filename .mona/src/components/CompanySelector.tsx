/**
 * Company Selector Component
 * 
 * Allows users to select their active company from a dropdown.
 * Displayed in the admin header for quick company switching.
 */

import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { cn } from '@/lib/utils';

export const CompanySelector = () => {
  const { selectedCompany, setSelectedCompany, companies } = useCompany();
  const [open, setOpen] = useState(false);

  if (!companies || companies.length === 0) {
    return null;
  }

  // If only one company, show it without dropdown
  if (companies.length === 1 && selectedCompany) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{selectedCompany.name}</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">
              {selectedCompany?.name || 'Selecione uma empresa'}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Buscar empresa..." />
          <CommandList>
            <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.name}
                  onSelect={() => {
                    setSelectedCompany(company);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedCompany?.id === company.id
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{company.name}</span>
                    {company.slug && (
                      <span className="text-xs text-muted-foreground">
                        @{company.slug}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
