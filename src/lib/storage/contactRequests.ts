import { differenceInHours, isAfter, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export type ContactRequestStatus = 'new' | 'contacted' | 'qualified';

export interface ContactRequestInput {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}

export interface ContactRequest extends ContactRequestInput {
  id: string;
  createdAt: string;
  channel: string;
  status: ContactRequestStatus;
  respondedAt?: string;
  tags?: string[];
  estimatedValue?: number;
}

export interface ContactRequestMetrics {
  totalLeads: number;
  leadsThisWeek: number;
  qualifiedLeads: number;
  responseRate24h: number;
  averageResponseTimeHours: number | null;
  channelBreakdown: Record<string, number>;
  statusBreakdown: Record<ContactRequestStatus, number>;
}

const CONTACT_REQUESTS_LOCAL_STORAGE_KEY = 'boteco.contactRequests';

export const CONTACT_REQUESTS_QUERY_KEY = ['contactRequests'] as const;

const isBrowser = () => typeof window !== 'undefined';

const getLocalStorage = () => {
  if (!isBrowser()) {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn('LocalStorage is not accessible, continuing without persistence.', error);
    return undefined;
  }
};

const readFromLocalStorage = (): ContactRequest[] => {
  const storage = getLocalStorage();
  if (!storage) {
    return [];
  }

  const raw = storage.getItem(CONTACT_REQUESTS_LOCAL_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeRequests(parsed);
  } catch (error) {
    console.warn('Failed to parse cached contact requests from localStorage.', error);
    return [];
  }
};

const writeToLocalStorage = (requests: ContactRequest[]) => {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(CONTACT_REQUESTS_LOCAL_STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.warn('Failed to persist contact requests to localStorage.', error);
  }
};

const normalizeRequests = (data: unknown): ContactRequest[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter((item): item is ContactRequest => {
      if (typeof item !== 'object' || item === null) {
        return false;
      }

      const candidate = item as Record<string, unknown>;
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.name === 'string' &&
        typeof candidate.email === 'string' &&
        typeof candidate.createdAt === 'string' &&
        typeof candidate.channel === 'string' &&
        typeof candidate.status === 'string'
      );
    })
    .map((item) => ({
      ...item,
      respondedAt: item.respondedAt ?? undefined,
      tags: Array.isArray(item.tags) ? item.tags : undefined,
      estimatedValue: typeof item.estimatedValue === 'number' ? item.estimatedValue : undefined,
    }));
};

const sortRequestsByDate = (requests: ContactRequest[]): ContactRequest[] =>
  [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const getContactRequests = async (): Promise<ContactRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact requests from Supabase:', error);
      throw error;
    }

    const normalizedData = normalizeRequests(data);
    writeToLocalStorage(normalizedData); // Cache to local storage
    return normalizedData;
  } catch (error) {
    console.warn('Failed to fetch contact requests from Supabase, falling back to localStorage.', error);
    const fallback = readFromLocalStorage();
    if (fallback.length > 0) {
      return fallback;
    }
    throw error;
  }
};

export const createContactRequest = async (
  payload: ContactRequestInput,
): Promise<ContactRequest> => {
  const newRequest = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone?.trim() || null,
    message: payload.message.trim(),
    channel: 'web-form',
    status: 'new',
    created_at: new Date().toISOString(), // Supabase will use this
  };

  const { data, error } = await supabase
    .from('contact_requests')
    .insert(newRequest)
    .select()
    .single();

  if (error) {
    console.error('Error inserting new contact request into Supabase:', error);
    throw error;
  }

  // Invalidate cache to refetch latest data
  // This will be handled by the mutation's onSuccess in Contact.tsx
  return data as ContactRequest;
};

export const calculateContactRequestMetrics = (
  requests: ContactRequest[],
): ContactRequestMetrics => {
  if (!requests.length) {
    return {
      totalLeads: 0,
      leadsThisWeek: 0,
      qualifiedLeads: 0,
      responseRate24h: 0,
      averageResponseTimeHours: null,
      channelBreakdown: {},
      statusBreakdown: {
        new: 0,
        contacted: 0,
        qualified: 0,
      },
    };
  }

  const now = new Date();
  const weekThreshold = subDays(now, 7);

  const leadsThisWeek = requests.filter((request) =>
    isAfter(new Date(request.createdAt), weekThreshold),
  ).length;

  const qualifiedLeads = requests.filter((request) => request.status === 'qualified').length;

  const responded = requests.filter((request) => request.respondedAt);
  const respondedWithin24h = responded.filter((request) => {
    if (!request.respondedAt) {
      return false;
    }

    const diff = differenceInHours(new Date(request.respondedAt), new Date(request.createdAt));
    return diff <= 24;
  });

  const totalResponseHours = responded.reduce((accumulator, request) => {
    if (!request.respondedAt) {
      return accumulator;
    }

    return accumulator + differenceInHours(new Date(request.respondedAt), new Date(request.createdAt));
  }, 0);

  const channelBreakdown = requests.reduce<Record<string, number>>((accumulator, request) => {
    accumulator[request.channel] = (accumulator[request.channel] ?? 0) + 1;
    return accumulator;
  }, {});

  const statusBreakdown = requests.reduce<Record<ContactRequestStatus, number>>((accumulator, request) => {
    accumulator[request.status] = (accumulator[request.status] ?? 0) + 1;
    return accumulator;
  }, {
    new: 0,
    contacted: 0,
    qualified: 0,
  });

  return {
    totalLeads: requests.length,
    leadsThisWeek,
    qualifiedLeads,
    responseRate24h: responded.length ? (respondedWithin24h.length / responded.length) * 100 : 0,
    averageResponseTimeHours: responded.length ? totalResponseHours / responded.length : null,
    channelBreakdown,
    statusBreakdown,
  };
};