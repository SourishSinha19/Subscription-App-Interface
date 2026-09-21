import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  Subscription,
  SubscriptionStatus,
  CancellationStrategy,
  StatusFilterOption,
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
  TerminateSubscriptionPayload,
} from './src/types';

// In-Memory Data Store (Seeded with initial telemetry data)
const initialSubscriptions: Subscription[] = [
  {
    id: 'sub-884x',
    name: 'MasterClass',
    code: 'MSC-990-DEL',
    cost: 15.0,
    billingCycle: 'month',
    spentToDate: 180.0,
    monthsActive: 12,
    renewalDate: 'Oct 18, 2024',
    status: 'flagged_inactive',
    inactivityDays: 45,
    usageScore: 12,
    usageRating: 'Very Low',
    costPerSession: 15.0,
    sessionsTotal: 1,
    annualizedSavings: 180.0,
    category: 'Education & Streaming',
    selectedStrategy: 'concierge',
    pauseMonths: 2,
    restartPreventionAlert: true,
    logoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB3_t6OBQ_BqabMEFgZd26yjDNrZ4PROEw0cD28OEuuRE4z7uTX4l1F6aIuv5lo5Jq-y51TNsXxuy-ILsK7vDDCDVmiL5zaJGuR7IVAjeta3rK84Ac_9hoT7L3H4k_UfwHCJwtDxSlFUE3G9BWArFRpwjSncrYOiLNU457DTiFgjEyLxFXXjQeGPIo7df31N-0I0J8YiYvuLx0GkbvhEU-5UmgARrlwleBxjWIjzKoQfnzED-s9iQUx',
    notes: 'Zero login activity detected in the last 45 days. High priority target for termination.',
    createdAt: '2023-10-18T00:00:00.000Z',
    updatedAt: '2024-09-21T15:30:00.000Z',
  },
  {
    id: 'sub-912a',
    name: 'Adobe Creative Cloud',
    code: 'ADB-441-DEL',
    cost: 54.99,
    billingCycle: 'month',
    spentToDate: 659.88,
    monthsActive: 12,
    renewalDate: 'Nov 02, 2024',
    status: 'flagged_inactive',
    inactivityDays: 62,
    usageScore: 8,
    usageRating: 'Very Low',
    costPerSession: 54.99,
    sessionsTotal: 1,
    annualizedSavings: 659.88,
    category: 'Creative Software',
    selectedStrategy: 'concierge',
    pauseMonths: 3,
    restartPreventionAlert: true,
    notes: 'Photoshop and Premiere Pro unused since June.',
    createdAt: '2023-11-02T00:00:00.000Z',
    updatedAt: '2024-09-20T10:15:00.000Z',
  },
  {
    id: 'sub-743k',
    name: 'HBO Max',
    code: 'HBO-320-ACT',
    cost: 16.99,
    billingCycle: 'month',
    spentToDate: 101.94,
    monthsActive: 6,
    renewalDate: 'Oct 28, 2024',
    status: 'active',
    inactivityDays: 3,
    usageScore: 78,
    usageRating: 'High',
    costPerSession: 1.41,
    sessionsTotal: 12,
    annualizedSavings: 203.88,
    category: 'Entertainment',
    selectedStrategy: 'concierge',
    pauseMonths: 1,
    restartPreventionAlert: false,
    notes: 'Regular usage on weekends.',
    createdAt: '2024-04-28T00:00:00.000Z',
    updatedAt: '2024-09-21T08:00:00.000Z',
  },
  {
    id: 'sub-618m',
    name: 'Strava Summit',
    code: 'STR-104-PSZ',
    cost: 11.99,
    billingCycle: 'month',
    spentToDate: 143.88,
    monthsActive: 12,
    renewalDate: 'Dec 15, 2024',
    status: 'paused',
    inactivityDays: 20,
    usageScore: 35,
    usageRating: 'Low',
    costPerSession: 5.99,
    sessionsTotal: 2,
    annualizedSavings: 143.88,
    category: 'Health & Fitness',
    selectedStrategy: 'pause',
    pauseMonths: 2,
    restartPreventionAlert: true,
    notes: 'Membership frozen for winter recovery.',
    createdAt: '2023-12-15T00:00:00.000Z',
    updatedAt: '2024-09-15T12:00:00.000Z',
  },
  {
    id: 'sub-529p',
    name: 'Audible Premium Plus',
    code: 'AUD-882-TRM',
    cost: 14.95,
    billingCycle: 'month',
    spentToDate: 89.7,
    monthsActive: 6,
    renewalDate: 'Terminated',
    status: 'cancelled',
    inactivityDays: 95,
    usageScore: 4,
    usageRating: 'Very Low',
    costPerSession: 14.95,
    sessionsTotal: 0,
    annualizedSavings: 179.4,
    category: 'Audiobooks',
    selectedStrategy: 'concierge',
    pauseMonths: 1,
    restartPreventionAlert: true,
    legalNoticeRef: '#SP-88211',
    terminatedAt: '2024-09-10T14:22:10.000Z',
    notes: 'Successfully revoked by SubPulse Concierge under FTC Negative Option rule.',
    createdAt: '2024-03-10T00:00:00.000Z',
    updatedAt: '2024-09-10T14:22:10.000Z',
  },
];

let subscriptions: Subscription[] = JSON.parse(JSON.stringify(initialSubscriptions));

function calculateSummary(list: Subscription[]) {
  const flagged = list.filter((s) => s.status === 'flagged_inactive');
  const active = list.filter((s) => s.status === 'active');
  const paused = list.filter((s) => s.status === 'paused');
  const cancelled = list.filter((s) => s.status === 'cancelled');

  const totalMonthlyWaste = flagged.reduce((acc, curr) => acc + curr.cost, 0);
  const totalAnnualSavings = flagged.reduce((acc, curr) => acc + curr.annualizedSavings, 0);

  return {
    totalCount: list.length,
    flaggedCount: flagged.length,
    activeCount: active.length,
    pausedCount: paused.length,
    cancelledCount: cancelled.length,
    totalMonthlyWaste: Number(totalMonthlyWaste.toFixed(2)),
    totalAnnualSavings: Number(totalAnnualSavings.toFixed(2)),
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser Middleware
  app.use(express.json());

  // Request logger for API debugging and visibility
  app.use('/api', (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const elapsed = Date.now() - start;
      console.log(`[API ${req.method}] ${req.originalUrl} -> ${res.statusCode} (${elapsed}ms)`);
    });
    next();
  });

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'SubPulse Cyber API', timestamp: new Date().toISOString() });
  });

  // GET /api/subscriptions
  // Query parameters:
  // - status: 'all' | 'flagged_inactive' | 'active' | 'paused' | 'cancelled'
  // - q: search string
  app.get('/api/subscriptions', (req: Request, res: Response) => {
    try {
      const statusFilter = (req.query.status as StatusFilterOption) || 'all';
      const search = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';

      let filtered = [...subscriptions];

      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter((sub) => sub.status === statusFilter);
      }

      if (search) {
        filtered = filtered.filter(
          (sub) =>
            sub.name.toLowerCase().includes(search) ||
            sub.code.toLowerCase().includes(search) ||
            sub.category.toLowerCase().includes(search)
        );
      }

      const summary = calculateSummary(subscriptions);

      res.status(200).json({
        success: true,
        subscriptions: filtered,
        total: filtered.length,
        filter: statusFilter,
        summary,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error while fetching subscriptions',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // GET /api/subscriptions/:id
  app.get('/api/subscriptions/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const sub = subscriptions.find((item) => item.id === id);

      if (!sub) {
        return res.status(404).json({
          success: false,
          error: `Subscription record not found for ID: ${id}`,
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json({
        success: true,
        subscription: sub,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching subscription by ID:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error while fetching subscription',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // POST /api/subscriptions
  // Validates payload: name, cost required
  app.post('/api/subscriptions', (req: Request, res: Response) => {
    try {
      const body = req.body as CreateSubscriptionPayload;

      // Validation
      const errors: string[] = [];
      if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
        errors.push("Field 'name' is required and must be a non-empty string");
      }
      if (typeof body.cost !== 'number' || isNaN(body.cost) || body.cost < 0) {
        errors.push("Field 'cost' is required and must be a non-negative number");
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors,
          timestamp: new Date().toISOString(),
        });
      }

      const id = `sub-${Math.random().toString(36).substring(2, 6)}${Date.now().toString(36).slice(-2)}`;
      const prefix = body.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'SYS';
      const code = body.code || `${prefix}-${Math.floor(100 + Math.random() * 900)}-TRM`;
      const inactivity = body.inactivityDays !== undefined ? body.inactivityDays : 30;
      const usageScore = body.usageScore !== undefined ? body.usageScore : 15;
      const sessions = body.sessionsTotal !== undefined ? body.sessionsTotal : 1;
      const cost = Number(body.cost.toFixed(2));
      const annualizedSavings = Number((cost * 12).toFixed(2));
      const costPerSession = sessions > 0 ? Number((cost / sessions).toFixed(2)) : cost;

      const newSub: Subscription = {
        id,
        name: body.name.trim(),
        code,
        cost,
        billingCycle: body.billingCycle || 'month',
        spentToDate: cost,
        monthsActive: 1,
        renewalDate: body.renewalDate || 'Next month',
        status: inactivity > 30 ? 'flagged_inactive' : 'active',
        inactivityDays: inactivity,
        usageScore,
        usageRating: usageScore < 20 ? 'Very Low' : usageScore < 50 ? 'Low' : usageScore < 80 ? 'Moderate' : 'High',
        costPerSession,
        sessionsTotal: sessions,
        annualizedSavings,
        category: body.category || 'General SaaS',
        selectedStrategy: body.selectedStrategy || 'concierge',
        pauseMonths: 2,
        restartPreventionAlert: body.restartPreventionAlert !== undefined ? body.restartPreventionAlert : true,
        notes: `Created via SubPulse API on ${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      subscriptions.unshift(newSub);

      return res.status(201).json({
        success: true,
        subscription: newSub,
        message: 'Subscription successfully created and registered into HUD telemetry',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error while creating subscription',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // PUT /api/subscriptions/:id
  // Updates subscription record fields
  app.put('/api/subscriptions/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = req.body as UpdateSubscriptionPayload;

      const index = subscriptions.findIndex((item) => item.id === id);
      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: `Subscription record not found for ID: ${id}`,
          timestamp: new Date().toISOString(),
        });
      }

      // Validations
      if (body.cost !== undefined && (typeof body.cost !== 'number' || isNaN(body.cost) || body.cost < 0)) {
        return res.status(400).json({
          success: false,
          error: "Field 'cost' must be a non-negative number",
          timestamp: new Date().toISOString(),
        });
      }

      const existing = subscriptions[index];
      const updatedCost = body.cost !== undefined ? Number(body.cost.toFixed(2)) : existing.cost;
      const updatedAnnualSavings = Number((updatedCost * 12).toFixed(2));

      const updatedSub: Subscription = {
        ...existing,
        name: body.name !== undefined ? body.name.trim() : existing.name,
        cost: updatedCost,
        billingCycle: body.billingCycle || existing.billingCycle,
        status: body.status || existing.status,
        selectedStrategy: body.selectedStrategy || existing.selectedStrategy,
        pauseMonths: body.pauseMonths !== undefined ? body.pauseMonths : existing.pauseMonths,
        restartPreventionAlert:
          body.restartPreventionAlert !== undefined
            ? Boolean(body.restartPreventionAlert)
            : existing.restartPreventionAlert,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        annualizedSavings: updatedAnnualSavings,
        updatedAt: new Date().toISOString(),
      };

      subscriptions[index] = updatedSub;

      return res.status(200).json({
        success: true,
        subscription: updatedSub,
        message: 'Subscription record successfully updated',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error while updating subscription',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // PUT /api/subscriptions/:id/terminate
  // Action endpoint to execute plasma laser cancellation or pause freeze
  app.put('/api/subscriptions/:id/terminate', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const body = (req.body || {}) as TerminateSubscriptionPayload;

      const index = subscriptions.findIndex((item) => item.id === id);
      if (index === -1) {
        return res.status(404).json({
          success: false,
          error: `Subscription record not found for ID: ${id}`,
          timestamp: new Date().toISOString(),
        });
      }

      const existing = subscriptions[index];
      const strategy = body.strategy || existing.selectedStrategy;
      const noticeRef = `#SP-${Math.floor(10000 + Math.random() * 90000)}`;

      let nextStatus: SubscriptionStatus = 'cancelled';
      let renewalMsg = 'Terminated';
      if (strategy === 'pause') {
        nextStatus = 'paused';
        const months = body.pauseMonths || existing.pauseMonths || 2;
        renewalMsg = `Paused for ${months} mo (Resumes in ${months * 30} days)`;
      }

      const updatedSub: Subscription = {
        ...existing,
        status: nextStatus,
        selectedStrategy: strategy,
        pauseMonths: body.pauseMonths || existing.pauseMonths,
        legalNoticeRef: noticeRef,
        renewalDate: renewalMsg,
        terminatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      subscriptions[index] = updatedSub;

      return res.status(200).json({
        success: true,
        subscription: updatedSub,
        receipt: {
          noticeRef,
          strategy,
          timestamp: new Date().toISOString(),
          annualizedSavings: existing.annualizedSavings,
          status: nextStatus,
        },
        message:
          strategy === 'pause'
            ? `Membership freeze active for ${updatedSub.pauseMonths} months.`
            : `SubPulse Concierge legal notice dispatched (${noticeRef}). Subscription terminated.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error terminating subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error while executing termination',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // POST /api/subscriptions/reset
  // Resets in-memory subscriptions to pristine initial sample data
  app.post('/api/subscriptions/reset', (_req: Request, res: Response) => {
    subscriptions = JSON.parse(JSON.stringify(initialSubscriptions));
    const summary = calculateSummary(subscriptions);
    res.status(200).json({
      success: true,
      message: 'Subscription database reset to original telemetry test records',
      subscriptions,
      summary,
      timestamp: new Date().toISOString(),
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ SubPulse Cyber Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
