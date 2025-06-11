import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const ALLOWED_CDN_DIR = path.resolve(process.cwd(), 'cdn');

export const cdnRouter = express.Router();

/**
 * Retrieve a file from the CDN directory
 * Implements security checks:
 * - Validates file path is within CDN directory
 * - Prevents directory traversal
 * - Checks file existence
 */
cdnRouter.get('/:filename', (req: Request, res: Response) => {
    const { filename } = req.params;
    
    // Reject paths containing directory traversal characters or segments
    const normalizedFilename = path.normalize(filename);
    const segments = normalizedFilename.split(path.sep);
    
    if (segments.includes('..') || path.isAbsolute(normalizedFilename)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    const filePath = path.resolve(ALLOWED_CDN_DIR, normalizedFilename);

    // Security: Validate that the resolved path is within the CDN directory
    if (!filePath.startsWith(ALLOWED_CDN_DIR)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    // Retrieve file and send
    try {
        res.sendFile(filePath);
    } catch (error) {
        console.error('File retrieval error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});