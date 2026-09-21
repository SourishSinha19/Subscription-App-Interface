import {
  Subscription,
  StatusFilterOption,
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
  TerminateSubscriptionPayload,
  SubscriptionsApiResponse,
  SingleSubscriptionApiResponse,
  HttpTelemetryEntry,
} from '../types';

type TelemetryListener = (entry: HttpTelemetryEntry) => void;
const telemetryListeners: Set<TelemetryListener> = new Set();

export function subscribeToHttpTelemetry(listener: TelemetryListener): () => void {
  telemetryListeners.add(listener);
  return () => {
    telemetryListeners.delete(listener);
  };
}

function broadcastTelemetry(entry: HttpTelemetryEntry) {
  telemetryListeners.forEach((listener) => {
    try {
      listener(entry);
    } catch (err) {
      console.error('Error in telemetry listener:', err);
    }
  });
}

async function requestWrapper<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  payload?: unknown
): Promise<T> {
  const startTime = performance.now();
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  if (payload && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(payload);
  }

  let statusCode = 0;
  let statusText = '';
  let responseData: any = null;

  try {
    const res = await fetch(endpoint, options);
    statusCode = res.status;
    statusText = res.statusText || (res.ok ? 'OK' : 'Error');

    const text = await res.text();
    try {
      responseData = text ? JSON.parse(text) : {};
    } catch {
      responseData = { raw: text };
    }

    const durationMs = Math.round(performance.now() - startTime);

    broadcastTelemetry({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString(),
      method,
      endpoint,
      statusCode,
      statusText,
      durationMs,
      requestPayload: payload,
      responsePayload: responseData,
    });

    if (!res.ok) {
      const errorMsg =
        responseData?.error ||
        responseData?.message ||
        `HTTP Error ${statusCode}: ${statusText}`;
      const err: any = new Error(errorMsg);
      err.statusCode = statusCode;
      err.details = responseData?.details;
      throw err;
    }

    return responseData as T;
  } catch (err: any) {
    if (statusCode === 0) {
      // Network failure
      const durationMs = Math.round(performance.now() - startTime);
      broadcastTelemetry({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString(),
        method,
        endpoint,
        statusCode: 500,
        statusText: 'Network / Connection Failed',
        durationMs,
        requestPayload: payload,
        responsePayload: { error: err.message },
      });
    }
    throw err;
  }
}

export const api = {
  // GET /api/subscriptions?status=...&q=...
  async getSubscriptions(
    status: StatusFilterOption = 'all',
    searchQuery: string = ''
  ): Promise<SubscriptionsApiResponse> {
    const params = new URLSearchParams();
    if (status && status !== 'all') {
      params.set('status', status);
    }
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return requestWrapper<SubscriptionsApiResponse>('GET', `/api/subscriptions${query}`);
  },

  // GET /api/subscriptions/:id
  async getSubscriptionById(id: string): Promise<SingleSubscriptionApiResponse> {
    return requestWrapper<SingleSubscriptionApiResponse>('GET', `/api/subscriptions/${id}`);
  },

  // POST /api/subscriptions
  async createSubscription(
    payload: CreateSubscriptionPayload
  ): Promise<SingleSubscriptionApiResponse> {
    return requestWrapper<SingleSubscriptionApiResponse>('POST', '/api/subscriptions', payload);
  },

  // PUT /api/subscriptions/:id
  async updateSubscription(
    id: string,
    payload: UpdateSubscriptionPayload
  ): Promise<SingleSubscriptionApiResponse> {
    return requestWrapper<SingleSubscriptionApiResponse>(
      'PUT',
      `/api/subscriptions/${id}`,
      payload
    );
  },

  // PUT /api/subscriptions/:id/terminate
  async terminateSubscription(
    id: string,
    payload: TerminateSubscriptionPayload
  ): Promise<{
    success: boolean;
    subscription: Subscription;
    receipt: {
      noticeRef: string;
      strategy: string;
      timestamp: string;
      annualizedSavings: number;
      status: string;
    };
    message: string;
  }> {
    return requestWrapper('PUT', `/api/subscriptions/${id}/terminate`, payload);
  },

  // POST /api/subscriptions/reset
  async resetDatabase(): Promise<{ success: boolean; message: string; subscriptions: Subscription[] }> {
    return requestWrapper('POST', '/api/subscriptions/reset');
  },
};
