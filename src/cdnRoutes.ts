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
cdnRouter.get('*', (req: Request, res: Response) => {
    // Remove leading /cdn/ from the path
    const filename = req.path.replace(/^\/cdn\//, '');
    
    // Reject paths containing directory traversal characters
    if (filename.includes('../') || path.isAbsolute(filename)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    const filePath = path.resolve(ALLOWED_CDN_DIR, filename);

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