import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { isValidationError } from '../core/utils/typeGuards';
import rateLimit from 'express-rate-limit';

const router = Router();
const prisma = new PrismaClient();

// Rate limiting for location operations
const locationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Location schema validation
const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(100, 'Name must be less than 100 characters'),
  address: z.string().min(1, 'Address is required').max(200, 'Address must be less than 200 characters'),
  city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
  state: z.string().min(2, 'State is required').max(50, 'State must be less than 50 characters'),
  zipCode: z.string().min(5, 'ZIP code is required').max(10, 'ZIP code must be less than 10 characters'),
  country: z.string().max(50, 'Country must be less than 50 characters').default('USA'),
  phone: z.string().optional(),
  email: z.string().email('Valid email is required').optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  businessHours: z.string().optional(),
  coordinates: z.string().nullable().transform(val => val === null ? '' : val).optional(),
  services: z.string().nullable().transform(val => val === null ? '' : val).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  isPrimary: z.boolean().default(false)
});

// Get all locations
router.get('/', locationLimiter, async (req: Request, res: Response) => {
  try {
    const { active, primary } = req.query;
    
    const where: Record<string, unknown> = {};
    if (active !== undefined) {
      where.isActive = active === 'true';
    }
    if (primary !== undefined) {
      where.isPrimary = primary === 'true';
    }

    const locations = await prisma.location.findMany({
      where,
      orderBy: [
        { isPrimary: 'desc' },
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      locations
    });
  } catch (error: unknown) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      error: 'Failed to fetch locations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get single location by ID
router.get('/:id', locationLimiter, async (req: Request, res: Response) => {
  try {
    const locationId = parseInt(req.params.id);
    
    if (isNaN(locationId)) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({
      success: true,
      location
    });
  } catch (error: unknown) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      error: 'Failed to fetch location',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new location
router.post('/', locationLimiter, async (req: Request, res: Response) => {
  try {
    const validatedData = locationSchema.parse(req.body);

    // If this is being set as primary, unset other primary locations
    if (validatedData.isPrimary) {
      await prisma.location.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false }
      });
    }

    // Parse services if provided
    let services = null;

    if (validatedData.services) {
      try {
        services = JSON.parse(validatedData.services);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid services JSON format' });
      }
    }

    const location = await prisma.location.create({
      data: {
        name: validatedData.name,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        country: validatedData.country || 'USA',
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        latitude: validatedData.latitude || null,
        longitude: validatedData.longitude || null,
        businessHours: validatedData.businessHours || null,
        coordinates: validatedData.coordinates || null,
        services: services && typeof services === 'string' ? services : (services ? JSON.stringify(services) : null),
        description: validatedData.description || null,
        imageUrl: validatedData.imageUrl || null,
        notes: validatedData.notes || null,
        isActive: validatedData.isActive,
        isPrimary: validatedData.isPrimary
      }
    });

    console.log(`New location created: ${location.name} (ID: ${location.id})`);

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      location
    });
  } catch (error: unknown) {
    console.error('Error creating location:', error);
    
    if ((error as any).name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: (error as any).errors
      });
    }

    res.status(500).json({
      error: 'Failed to create location',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update location
router.put('/:id', locationLimiter, async (req: Request, res: Response) => {
  try {
    const locationId = parseInt(req.params.id);
    
    if (isNaN(locationId)) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }

    const validatedData = locationSchema.partial().parse(req.body);

    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!existingLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // If this is being set as primary, unset other primary locations
    if (validatedData.isPrimary) {
      await prisma.location.updateMany({
        where: { 
          isPrimary: true,
          id: { not: locationId }
        },
        data: { isPrimary: false }
      });
    }

    // Parse services if provided
    let services = validatedData.services;

    if (validatedData.services) {
      try {
        const parsed = JSON.parse(validatedData.services);
        services = JSON.stringify(parsed);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid services JSON format' });
      }
    }

    const location = await prisma.location.update({
      where: { id: locationId },
      data: {
        ...validatedData,
        services
      }
    });

    console.log(`Location updated: ${location.name} (ID: ${location.id})`);

    res.json({
      success: true,
      message: 'Location updated successfully',
      location
    });
  } catch (error: unknown) {
    console.error('Error updating location:', error);
    
    if ((error as any).name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: (error as any).errors
      });
    }

    res.status(500).json({
      error: 'Failed to update location',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete location
router.delete('/:id', locationLimiter, async (req: Request, res: Response) => {
  try {
    const locationId = parseInt(req.params.id);
    
    if (isNaN(locationId)) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }

    // Check if location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Note: In a real application, you would check for associated data
    // For now, we'll allow deletion without checking relations

    await prisma.location.delete({
      where: { id: locationId }
    });

    console.log(`Location deleted: ${location.name} (ID: ${locationId})`);

    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error: unknown) {
    console.error('Error deleting location:', error);
    res.status(500).json({
      error: 'Failed to delete location',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Toggle location active status
router.patch('/:id/toggle-active', locationLimiter, async (req: Request, res: Response) => {
  try {
    const locationId = parseInt(req.params.id);
    
    if (isNaN(locationId)) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: { isActive: !location.isActive }
    });

    res.json({
      success: true,
      message: `Location ${updatedLocation.isActive ? 'activated' : 'deactivated'} successfully`,
      location: updatedLocation
    });
  } catch (error: unknown) {
    console.error('Error toggling location status:', error);
    res.status(500).json({
      error: 'Failed to toggle location status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Set location as primary
router.patch('/:id/set-primary', locationLimiter, async (req: Request, res: Response) => {
  try {
    const locationId = parseInt(req.params.id);
    
    if (isNaN(locationId)) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Unset other primary locations
    await prisma.location.updateMany({
      where: { isPrimary: true },
      data: { isPrimary: false }
    });

    // Set this location as primary
    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: { isPrimary: true }
    });

    res.json({
      success: true,
      message: 'Location set as primary successfully',
      location: updatedLocation
    });
  } catch (error: unknown) {
    console.error('Error setting primary location:', error);
    res.status(500).json({
      error: 'Failed to set primary location',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
