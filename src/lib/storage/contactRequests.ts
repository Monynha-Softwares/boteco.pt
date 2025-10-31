import { differenceInHours, isAfter, subDays } from 'date-fns';

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

const CONTACT_REQUESTS_ENDPOINT = '/data/contact-requests.json';
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

const fetchRemoteRequests = async (): Promise<ContactRequest[]> => {
  const response = await fetch(CONTACT_REQUESTS_ENDPOINT, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch contact requests: ${response.status}`);
  }

  const data = await response.json();
  return sortRequestsByDate(normalizeRequests(data));
};

const persistRemotely = async (requests: ContactRequest[]) => {
  if (!import.meta.env.DEV) {
    return false;
  }

  try {
    const response = await fetch(CONTACT_REQUESTS_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requests, null, 2),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to persist contact requests: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.warn('Failed to persist contact requests via fetch PUT, falling back to localStorage.', error);
    return false;
  }
};

export const getContactRequests = async (): Promise<ContactRequest[]> => {
  try {
    const remote = await fetchRemoteRequests();
    writeToLocalStorage(remote);
    return remote;
  } catch (error) {
    const fallback = readFromLocalStorage();
    if (fallback.length > 0) {
      return fallback;
    }

    throw error;
  }
};

const persistRequests = async (requests: ContactRequest[]) => {
  const didPersistRemotely = await persistRemotely(requests);
  if (!didPersistRemotely) {
    writeToLocalStorage(requests);
  }
};

const createRequestId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `req-${Date.now()}-${Math.floor(Math.random() * 1_000)}`;
};

export const createContactRequest = async (
  payload: ContactRequestInput,
): Promise<ContactRequest> => {
  let existing: ContactRequest[] = [];
  try {
    existing = await getContactRequests();
  } catch (error) {
    console.warn('Falling back to cached contact requests before creating a new entry.', error);
    existing = readFromLocalStorage();
  }

  const newRequest: ContactRequest = {
    id: createRequestId(),
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone?.trim() || undefined,
    message: payload.message.trim(),
    createdAt: new Date().toISOString(),
    channel: 'web-form',
    status: 'new',
  };

  const updated = sortRequestsByDate([...existing, newRequest]);
  await persistRequests(updated);
  return newRequest;
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
