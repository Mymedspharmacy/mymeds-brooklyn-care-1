import { Router, Request, Response } from 'express';
import { adminAuthMiddleware } from '../adminAuth';
import openfdaService from '../services/openfdaService';
import logger from '../utils/logger';

const router = Router();

// Search drugs using OpenFDA API - PUBLIC ROUTE (no authentication required)
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query, limit = '10' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Query parameter is required',
        code: 'MISSING_QUERY'
      });
    }

    if (query.length < 2) {
      return res.status(400).json({ 
        error: 'Query must be at least 2 characters long',
        code: 'QUERY_TOO_SHORT'
      });
    }

    const limitNum = Math.min(parseInt(limit as string), 50); // Max 50 results
    
    logger.info('OpenFDA: Public search request', { 
      query, 
      limit: limitNum,
      ip: req.ip
    });

    const results = await openfdaService.searchDrugs(query, limitNum);
    
    res.json({
      success: true,
      data: results,
      meta: {
        query,
        limit: limitNum,
        totalResults: results.meta.results.total,
        cached: false
      }
    });

  } catch (error: any) {
    logger.error('OpenFDA: Search failed', { 
      error: error.message,
      query: req.query.query
    });
    
    res.status(500).json({
      error: 'Failed to search drugs',
      message: error.message,
      code: 'SEARCH_FAILED'
    });
  }
});

// Get detailed drug information - ADMIN ONLY
router.get('/drug/:drugId', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { drugId } = req.params;
    
    if (!drugId) {
      return res.status(400).json({ 
        error: 'Drug ID is required',
        code: 'MISSING_DRUG_ID'
      });
    }

    logger.info('OpenFDA: Admin drug details request', { 
      drugId,
      userId: (req.user as any)?.userId 
    });

    const drugDetails = await openfdaService.getDrugDetails(drugId);
    
    res.json({
      success: true,
      data: drugDetails,
      meta: {
        drugId,
        cached: false
      }
    });

  } catch (error: any) {
    logger.error('OpenFDA: Drug details failed', { 
      drugId: req.params.drugId,
      error: error.message,
      userId: (req.user as any)?.userId 
    });
    
    res.status(500).json({
      error: 'Failed to fetch drug details',
      message: error.message,
      code: 'DRUG_DETAILS_FAILED'
    });
  }
});

// Get drug interactions
router.get('/drug/:drugId/interactions', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { drugId } = req.params;
    
    if (!drugId) {
      return res.status(400).json({ 
        error: 'Drug ID is required',
        code: 'MISSING_DRUG_ID'
      });
    }

    logger.info('OpenFDA: Admin drug interactions request', { 
      drugId,
      userId: (req.user as any)?.userId 
    });

    const interactions = await openfdaService.getDrugInteractions(drugId);
    
    res.json({
      success: true,
      data: interactions,
      meta: {
        drugId,
        interactionCount: interactions.length
      }
    });

  } catch (error: any) {
    logger.error('OpenFDA: Drug interactions failed', { 
      drugId: req.params.drugId,
      error: error.message,
      userId: (req.user as any)?.userId 
    });
    
    res.status(500).json({
      error: 'Failed to fetch drug interactions',
      message: error.message,
      code: 'INTERACTIONS_FAILED'
    });
  }
});

// Get adverse reactions
router.get('/drug/:drugId/reactions', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { drugId } = req.params;
    
    if (!drugId) {
      return res.status(400).json({ 
        error: 'Drug ID is required',
        code: 'MISSING_DRUG_ID'
      });
    }

    logger.info('OpenFDA: Admin adverse reactions request', { 
      drugId,
      userId: (req.user as any)?.userId 
    });

    const reactions = await openfdaService.getAdverseReactions(drugId);
    
    res.json({
      success: true,
      data: reactions,
      meta: {
        drugId,
        reactionCount: reactions.length
      }
    });

  } catch (error: any) {
    logger.error('OpenFDA: Adverse reactions failed', { 
      drugId: req.params.drugId,
      error: error.message,
      userId: (req.user as any)?.userId 
    });
    
    res.status(500).json({
      error: 'Failed to fetch adverse reactions',
      message: error.message,
      code: 'REACTIONS_FAILED'
    });
  }
});

// Get cache statistics (admin only)
router.get('/cache/stats', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const stats = openfdaService.getCacheStats();
    
    res.json({
      success: true,
      data: stats,
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    logger.error('OpenFDA: Cache stats failed', { 
      error: error.message,
      userId: (req.user as any)?.userId 
    });
    
    res.status(500).json({
      error: 'Failed to get cache statistics',
      message: error.message,
      code: 'CACHE_STATS_FAILED'
    });
  }
});

// Clear cache (admin only)
router.delete('/cache', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    openfdaService.clearCache();
    
    logger.info('OpenFDA: Cache cleared by admin', { 
      userId: (req.user as any)?.userId 
    });
    
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    logger.error('OpenFDA: Cache clear failed', { 
      error: error.message,
      userId: (req.user as any)?.userId 
    });
    
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message,
      code: 'CACHE_CLEAR_FAILED'
    });
  }
});

export default router;
