import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import {
	getTables,
	createTable,
	updateTable,
	deleteTable,
	checkTableNumberAvailable,
	type Table,
} from '@/lib/api/tables';
import { supabase } from '@/lib/supabase';
import type { TableInsert } from '@/lib/api/tables';
import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2 } from 'lucide-react';

type FormState = {
	id?: string;
	name: string;
	number: number | '';
	capacity?: number | '';
	location?: string;
	notes?: string;
	status: Table['status'];
};

const emptyForm: FormState = {
	name: '',
	number: '',
	capacity: '',
	location: '',
	notes: '',
	status: 'available',
};

const statusBadge = (status: Table['status']) => {
	const map: Record<Table['status'], string> = {
		available: 'default',
		occupied: 'destructive',
		reserved: 'secondary',
		maintenance: 'outline',
	} as const;
	return map[status] ?? 'default';
};

const TablesAdmin: React.FC = () => {
	const { t, i18n } = useTranslation('tables');
	const { selectedCompany } = useCompany();
	const companyId = selectedCompany?.id;
	const qc = useQueryClient();

	const [open, setOpen] = React.useState(false);
	const [confirmOpen, setConfirmOpen] = React.useState<null | string>(null);
	const [form, setForm] = React.useState<FormState>(emptyForm);
	const [error, setError] = React.useState<string | null>(null);

	const { data: tables = [], isLoading, refetch } = useQuery({
		queryKey: ['tables', 'admin', companyId],
		queryFn: () => getTables(companyId!, true),
		enabled: !!companyId,
		staleTime: 15_000,
	});

	React.useEffect(() => {
		if (!companyId) return;
		const channel = supabase
			.channel(`tables-admin-${companyId}`)
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'tables', filter: `company_id=eq.${companyId}` },
				() => qc.invalidateQueries({ queryKey: ['tables', 'admin', companyId] })
			)
			.subscribe();
		return () => void supabase.removeChannel(channel);
	}, [companyId, qc]);

		interface CreatePayload {
			name: string;
			number: number;
			capacity: number | null;
			location: string | null;
			notes: string | null;
			status: Table['status'];
			company_id: string;
		}

			const createMut = useMutation<Table, Error, CreatePayload>({
				mutationFn: async (payload) => {
					const available = await checkTableNumberAvailable(companyId!, payload.number);
					if (!available) throw new Error(t('validation.uniqueNumber'));
					// Narrow to TableInsert shape
							const insertPayload: TableInsert = {
								company_id: payload.company_id,
								name: payload.name,
								number: payload.number,
								capacity: payload.capacity ?? null,
								location: payload.location ?? null,
								notes: payload.notes ?? null,
								status: payload.status,
							};
							return createTable(insertPayload);
				},
			onSuccess: () => {
				setOpen(false);
				setForm(emptyForm);
				qc.invalidateQueries({ queryKey: ['tables', 'admin', companyId] });
			},
			onError: (e) => setError(e.message),
		});

		interface UpdateArgs { id: string; patch: Partial<Omit<Table, 'id' | 'company_id' | 'created_at' | 'updated_at'>> & { number?: number } }
		const updateMut = useMutation<Table, Error, UpdateArgs>({
			mutationFn: async ({ id, patch }) => {
				if (typeof patch.number === 'number') {
					const available = await checkTableNumberAvailable(companyId!, patch.number, id);
					if (!available) throw new Error(t('validation.uniqueNumber'));
				}
				return updateTable(id, companyId!, patch);
			},
			onSuccess: () => {
				setOpen(false);
				setForm(emptyForm);
				qc.invalidateQueries({ queryKey: ['tables', 'admin', companyId] });
			},
			onError: (e) => setError(e.message),
		});

		const deleteMut = useMutation<void, Error, Table>({
			mutationFn: async (table) => {
				if (table.current_order_id) throw new Error(t('actions.confirmDeleteBody'));
				return deleteTable(table.id, companyId!);
			},
			onSuccess: () => {
				setConfirmOpen(null);
				qc.invalidateQueries({ queryKey: ['tables', 'admin', companyId] });
			},
			onError: (e) => setError(e.message),
		});

	const openCreate = () => {
		setError(null);
		setForm(emptyForm);
		setOpen(true);
	};

	const openEdit = (table: Table) => {
		setError(null);
		setForm({
			id: table.id,
			name: table.name,
			number: table.number,
			capacity: table.capacity ?? '',
			location: table.location ?? '',
			notes: table.notes ?? '',
			status: table.status,
		});
		setOpen(true);
	};

	const submitForm = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!companyId) return;
		setError(null);
			const payload: CreatePayload = {
				name: form.name.trim(),
				number: typeof form.number === 'string' ? parseInt(form.number) : form.number,
				capacity: form.capacity === '' ? null : Number(form.capacity),
				location: form.location?.trim() || null,
				notes: form.notes?.trim() || null,
				status: form.status,
				company_id: companyId,
			};
		if (!payload.name) return setError(t('validation.requiredName'));
		if (!payload.number || Number.isNaN(payload.number)) return setError(t('validation.requiredNumber'));
		if (payload.capacity !== null && payload.capacity <= 0) return setError(t('validation.positiveCapacity'));

		if (form.id) {
					await updateMut.mutateAsync({ id: form.id, patch: payload });
		} else {
			await createMut.mutateAsync(payload);
		}
	};

	const StatusBadge = ({ value }: { value: Table['status'] }) => (
		<Badge variant={statusBadge(value)} className="capitalize">{t(`status.${value}`)}</Badge>
	);

	return (
		<>
			<Seo title={t('title')} description={t('subtitle')} locale={i18n.language} />
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-boteco-primary">{t('title')}</h1>
					<p className="text-boteco-neutral/80">{t('subtitle')}</p>
				</div>
				<Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {t('actions.new')}</Button>
			</div>

			<Card depth="surface" className="mt-6">
				<CardHeader>
					<CardTitle>
						{t('title')} ({tables.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<p className="text-sm text-boteco-neutral/70">Loading…</p>
					) : tables.length === 0 ? (
						<p className="text-boteco-neutral/60">{t('empty')}</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="text-left text-boteco-neutral/70">
									<tr>
										<th className="py-2 pr-4">#</th>
										<th className="py-2 pr-4">{t('fields.name')}</th>
										<th className="py-2 pr-4">{t('fields.capacity')}</th>
										<th className="py-2 pr-4">{t('fields.location')}</th>
										<th className="py-2 pr-4">{t('fields.status')}</th>
										<th className="py-2 pr-4"></th>
									</tr>
								</thead>
								<tbody>
									{tables.map((table) => (
										<tr key={table.id} className="border-t border-border">
											<td className="py-2 pr-4">{table.number}</td>
											<td className="py-2 pr-4">{table.name}</td>
											<td className="py-2 pr-4">{table.capacity ?? '-'}</td>
											<td className="py-2 pr-4">{table.location ?? '-'}</td>
											<td className="py-2 pr-4"><StatusBadge value={table.status} /></td>
											<td className="py-2 pr-0 text-right">
												<div className="flex justify-end gap-2">
													<Button variant="outline" size="sm" onClick={() => openEdit(table)}>
														<Pencil className="h-4 w-4 mr-1" /> {t('actions.edit')}
													</Button>
													<Button variant="destructive" size="sm" onClick={() => setConfirmOpen(table.id)}>
														<Trash2 className="h-4 w-4 mr-1" /> {t('actions.delete')}
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{form.id ? t('modal.editTitle') : t('modal.createTitle')}
						</DialogTitle>
						<DialogDescription>{t('subtitle')}</DialogDescription>
					</DialogHeader>
					{error && <p className="text-sm text-red-600">{error}</p>}
					<form onSubmit={submitForm} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="name">{t('fields.name')}</Label>
								<Input id="name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
							</div>
							<div>
								<Label htmlFor="number">{t('fields.number')}</Label>
								<Input id="number" type="number" value={form.number} onChange={(e) => setForm(f => ({ ...f, number: e.target.value === '' ? '' : Number(e.target.value) }))} />
							</div>
							<div>
								<Label htmlFor="capacity">{t('fields.capacity')}</Label>
								<Input id="capacity" type="number" value={form.capacity} onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value === '' ? '' : Number(e.target.value) }))} />
							</div>
							<div>
								<Label htmlFor="location">{t('fields.location')}</Label>
								<Input id="location" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} />
							</div>
							<div className="md:col-span-2">
								<Label htmlFor="notes">{t('fields.notes')}</Label>
								<Textarea id="notes" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
							</div>
							<div className="md:col-span-2">
								<Label>{t('fields.status')}</Label>
								<Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as Table['status'] }))}>
									<SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value="available">{t('status.available')}</SelectItem>
										<SelectItem value="occupied">{t('status.occupied')}</SelectItem>
										<SelectItem value="reserved">{t('status.reserved')}</SelectItem>
										<SelectItem value="maintenance">{t('status.maintenance')}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setOpen(false)}>
								{t('actions.cancel')}
							</Button>
							<Button type="submit">{t('actions.save')}</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog open={!!confirmOpen} onOpenChange={(v) => !v && setConfirmOpen(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('actions.confirmDeleteTitle')}</DialogTitle>
						<DialogDescription>{t('actions.confirmDeleteBody')}</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmOpen(null)}>{t('actions.cancel')}</Button>
						<Button variant="destructive" onClick={() => {
							const table = tables.find(x => x.id === confirmOpen);
							if (table) deleteMut.mutate(table);
						}}>{t('actions.delete')}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default TablesAdmin;
