import { z } from 'zod';

// User related schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Task related schemas
export const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  dueDate: z.string().datetime({ message: 'Invalid date format' }).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']),
  assignedTo: z.string().uuid('Invalid user ID').optional(),
});

// Job related schemas
export const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  }),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  compensation: z.object({
    amount: z.number().positive('Compensation must be positive'),
    currency: z.string().length(3, 'Currency must be a 3-letter code'),
    type: z.enum(['hourly', 'fixed', 'commission']),
  }),
  startDate: z.string().datetime({ message: 'Invalid date format' }),
  endDate: z.string().datetime({ message: 'Invalid date format' }).optional(),
  status: z.enum(['draft', 'published', 'in_progress', 'completed', 'cancelled']),
});

// Analytics filter schema
export const analyticsFilterSchema = z.object({
  startDate: z.string().datetime({ message: 'Invalid start date' }),
  endDate: z.string().datetime({ message: 'Invalid end date' }),
  jobTypes: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  ambassadors: z.array(z.string()).optional(),
  metrics: z.array(z.enum(['earnings', 'tasks', 'hours', 'satisfaction'])),
});

// Widget preferences schema
export const widgetPreferencesSchema = z.object({
  layout: z.array(z.object({
    id: z.string(),
    x: z.number().min(0),
    y: z.number().min(0),
    w: z.number().min(1),
    h: z.number().min(1),
  })),
  visibleWidgets: z.array(z.string()),
  refreshIntervals: z.record(z.string(), z.number().min(5000)),
  customization: z.record(z.string(), z.any()),
});
