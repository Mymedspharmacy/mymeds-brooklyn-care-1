import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AnyZodObject } from 'zod';

// Generic validation middleware
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      return res.status(500).json({ error: 'Internal validation error' });
    }
  };
};

// User input validation schemas
export const userSchemas = {
  register: z.object({
    body: z.object({
      email: z.string()
        .email('Invalid email format')
        .min(5, 'Email too short')
        .max(100, 'Email too long')
        .transform(val => val.toLowerCase().trim()),
      password: z.string()
        .min(12, 'Password must be at least 12 characters')
        .max(128, 'Password too long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
               'Password must contain uppercase, lowercase, number, and special character'),
      name: z.string()
        .min(2, 'Name too short')
        .max(100, 'Name too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
        .transform(val => val.trim()),
      phone: z.string()
        .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
        .optional(),
      dateOfBirth: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
        .optional()
    })
  }),

  login: z.object({
    body: z.object({
      email: z.string()
        .email('Invalid email format')
        .transform(val => val.toLowerCase().trim()),
      password: z.string()
        .min(1, 'Password is required')
    })
  }),

  updateProfile: z.object({
    body: z.object({
      name: z.string()
        .min(2, 'Name too short')
        .max(100, 'Name too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
        .transform(val => val.trim())
        .optional(),
      phone: z.string()
        .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
        .optional(),
      address: z.object({
        street: z.string().min(5).max(200).optional(),
        city: z.string().min(2).max(100).optional(),
        state: z.string().min(2).max(50).optional(),
        zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format').optional(),
        country: z.string().min(2).max(100).optional()
      }).optional()
    })
  })
};

// Product validation schemas
export const productSchemas = {
  create: z.object({
    body: z.object({
      name: z.string()
        .min(3, 'Product name too short')
        .max(200, 'Product name too long')
        .transform(val => val.trim()),
      description: z.string()
        .min(10, 'Description too short')
        .max(2000, 'Description too long')
        .optional(),
      price: z.number()
        .positive('Price must be positive')
        .max(999999.99, 'Price too high'),
      category: z.string()
        .min(2, 'Category too short')
        .max(100, 'Category too long'),
      stockQuantity: z.number()
        .int('Stock must be a whole number')
        .min(0, 'Stock cannot be negative'),
      requiresPrescription: z.boolean().optional(),
      activeIngredients: z.array(z.string()).optional(),
      dosageForm: z.string().optional(),
      strength: z.string().optional()
    })
  }),

  update: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/, 'Invalid product ID')
    }),
    body: z.object({
      name: z.string()
        .min(3, 'Product name too short')
        .max(200, 'Product name too long')
        .transform(val => val.trim())
        .optional(),
      description: z.string()
        .min(10, 'Description too short')
        .max(2000, 'Description too long')
        .optional(),
      price: z.number()
        .positive('Price must be positive')
        .max(999999.99, 'Price too high')
        .optional(),
      category: z.string()
        .min(2, 'Category too short')
        .max(100, 'Category too long')
        .optional(),
      stockQuantity: z.number()
        .int('Stock must be a whole number')
        .min(0, 'Stock cannot be negative')
        .optional(),
      requiresPrescription: z.boolean().optional(),
      activeIngredients: z.array(z.string()).optional(),
      dosageForm: z.string().optional(),
      strength: z.string().optional()
    })
  })
};

// Order validation schemas
export const orderSchemas = {
  create: z.object({
    body: z.object({
      items: z.array(z.object({
        productId: z.number().positive('Invalid product ID'),
        quantity: z.number().int().positive('Quantity must be positive'),
        price: z.number().positive('Price must be positive')
      })).min(1, 'Order must contain at least one item'),
      shippingAddress: z.object({
        street: z.string().min(5, 'Street address too short').max(200, 'Street address too long'),
        city: z.string().min(2, 'City too short').max(100, 'City too long'),
        state: z.string().min(2, 'State too short').max(50, 'State too long'),
        zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
        country: z.string().min(2, 'Country too short').max(100, 'Country too long')
      }),
      billingAddress: z.object({
        street: z.string().min(5, 'Street address too short').max(200, 'Street address too long'),
        city: z.string().min(2, 'City too short').max(100, 'City too long'),
        state: z.string().min(2, 'State too short').max(50, 'State too long'),
        zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
        country: z.string().min(2, 'Country too short').max(100, 'Country too long')
      }).optional(),
      paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'woocommerce']),
      customerNotes: z.string().max(500, 'Customer notes too long').optional()
    })
  })
};

// Contact form validation
export const contactSchemas = {
  submit: z.object({
    body: z.object({
      name: z.string()
        .min(2, 'Name too short')
        .max(100, 'Name too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
        .transform(val => val.trim()),
      email: z.string()
        .email('Invalid email format')
        .transform(val => val.toLowerCase().trim()),
      phone: z.string()
        .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
        .optional(),
      subject: z.string()
        .min(5, 'Subject too short')
        .max(200, 'Subject too long')
        .transform(val => val.trim()),
      message: z.string()
        .min(10, 'Message too short')
        .max(2000, 'Message too long')
        .transform(val => val.trim())
    })
  })
};

// Admin validation schemas
export const adminSchemas = {
  createUser: z.object({
    body: z.object({
      email: z.string()
        .email('Invalid email format')
        .transform(val => val.toLowerCase().trim()),
      password: z.string()
        .min(12, 'Password must be at least 12 characters')
        .max(128, 'Password too long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
               'Password must contain uppercase, lowercase, number, and special character'),
      name: z.string()
        .min(2, 'Name too short')
        .max(100, 'Name too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
        .transform(val => val.trim()),
      role: z.enum(['USER', 'ADMIN', 'PHARMACIST']).default('USER'),
      isActive: z.boolean().default(true)
    })
  })
};

// Sanitization helper
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

// Rate limiting validation
export const rateLimitSchemas = {
  config: z.object({
    windowMs: z.number().positive('Window must be positive'),
    max: z.number().positive('Max requests must be positive'),
    message: z.string().optional(),
    standardHeaders: z.boolean().optional(),
    legacyHeaders: z.boolean().optional(),
    skipSuccessfulRequests: z.boolean().optional()
  })
};
