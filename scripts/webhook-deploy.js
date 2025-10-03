#!/usr/bin/env node

/**
 * Webhook-based Deployment Server
 * Listens for GitHub webhooks and triggers incremental deployments
 */

const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
const DEPLOY_SCRIPT = path.join(__dirname, 'incremental-deploy.sh');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.raw({ type: 'application/json' }));

// Logging function
const log = (message, level = 'INFO') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
};

// Verify GitHub webhook signature
function verifySignature(payload, signature) {
    if (!signature) {
        return false;
    }
    
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(payload);
    const expectedSignature = 'sha256=' + hmac.digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

// Determine deployment type based on changed files
function determineDeploymentType(changedFiles) {
    const frontendFiles = changedFiles.filter(file => 
        file.startsWith('src/') || 
        file.startsWith('public/') || 
        file.endsWith('.tsx') || 
        file.endsWith('.ts') || 
        file.endsWith('.css') ||
        file === 'package.json' ||
        file === 'vite.config.ts' ||
        file === 'tailwind.config.ts'
    );
    
    const backendFiles = changedFiles.filter(file => 
        file.startsWith('backend/') ||
        file.endsWith('.js') ||
        file.endsWith('.ts') ||
        file === 'backend/package.json' ||
        file === 'backend/prisma/schema.prisma'
    );
    
    if (frontendFiles.length > 0 && backendFiles.length > 0) {
        return 'full';
    } else if (frontendFiles.length > 0) {
        return 'frontend';
    } else if (backendFiles.length > 0) {
        return 'backend';
    } else {
        return 'none';
    }
}

// Execute deployment script
function executeDeployment(deploymentType) {
    return new Promise((resolve, reject) => {
        log(`Starting ${deploymentType} deployment...`);
        
        const command = `bash ${DEPLOY_SCRIPT} deploy ${deploymentType}`;
        
        exec(command, { 
            cwd: process.cwd(),
            env: { ...process.env }
        }, (error, stdout, stderr) => {
            if (error) {
                log(`Deployment failed: ${error.message}`, 'ERROR');
                log(`STDERR: ${stderr}`, 'ERROR');
                reject(error);
                return;
            }
            
            log(`Deployment completed successfully`);
            log(`STDOUT: ${stdout}`);
            if (stderr) {
                log(`STDERR: ${stderr}`, 'WARN');
            }
            
            resolve(stdout);
        });
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const payload = req.body;
    
    // Verify webhook signature
    if (!verifySignature(payload, signature)) {
        log('Invalid webhook signature', 'ERROR');
        return res.status(401).json({ error: 'Invalid signature' });
    }
    
    try {
        const event = JSON.parse(payload.toString());
        
        // Only process push events to main/latest branches
        if (event.ref !== 'refs/heads/main' && event.ref !== 'refs/heads/latest') {
            log(`Ignoring push to ${event.ref}`);
            return res.status(200).json({ message: 'Ignored' });
        }
        
        // Get changed files
        const changedFiles = event.commits.flatMap(commit => 
            [...commit.added, ...commit.modified, ...commit.removed]
        );
        
        log(`Changed files: ${changedFiles.join(', ')}`);
        
        // Determine deployment type
        const deploymentType = determineDeploymentType(changedFiles);
        
        if (deploymentType === 'none') {
            log('No deployment needed');
            return res.status(200).json({ message: 'No deployment needed' });
        }
        
        // Execute deployment asynchronously
        executeDeployment(deploymentType)
            .then(() => {
                log(`Deployment completed successfully: ${deploymentType}`);
            })
            .catch((error) => {
                log(`Deployment failed: ${error.message}`, 'ERROR');
                
                // Attempt rollback
                exec(`bash ${DEPLOY_SCRIPT} rollback`, (rollbackError, rollbackStdout, rollbackStderr) => {
                    if (rollbackError) {
                        log(`Rollback failed: ${rollbackError.message}`, 'ERROR');
                    } else {
                        log('Rollback completed successfully');
                    }
                });
            });
        
        res.status(200).json({ 
            message: `Deployment triggered: ${deploymentType}`,
            changedFiles: changedFiles,
            deploymentType: deploymentType
        });
        
    } catch (error) {
        log(`Error processing webhook: ${error.message}`, 'ERROR');
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Manual deployment trigger
app.post('/deploy/:type', (req, res) => {
    const deploymentType = req.params.type;
    const validTypes = ['frontend', 'backend', 'full'];
    
    if (!validTypes.includes(deploymentType)) {
        return res.status(400).json({ 
            error: 'Invalid deployment type', 
            validTypes: validTypes 
        });
    }
    
    executeDeployment(deploymentType)
        .then(() => {
            res.json({ 
                message: `Deployment completed: ${deploymentType}`,
                timestamp: new Date().toISOString()
            });
        })
        .catch((error) => {
            res.status(500).json({ 
                error: 'Deployment failed',
                message: error.message
            });
        });
});

// Get deployment status
app.get('/status', (req, res) => {
    exec(`bash ${DEPLOY_SCRIPT} status`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ 
                error: 'Failed to get status',
                message: error.message
            });
        }
        
        res.json({
            status: 'success',
            output: stdout,
            timestamp: new Date().toISOString()
        });
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    log(`Unhandled error: ${error.message}`, 'ERROR');
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
app.listen(PORT, () => {
    log(`Webhook deployment server running on port ${PORT}`);
    log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
    log(`Health check: http://localhost:${PORT}/health`);
    log(`Manual deploy: http://localhost:${PORT}/deploy/[frontend|backend|full]`);
    log(`Status: http://localhost:${PORT}/status`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    log('Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    log('Received SIGINT, shutting down gracefully');
    process.exit(0);
});
