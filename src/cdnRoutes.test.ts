import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { cdnRouter } from './cdnRoutes';
import path from 'path';
import fs from 'fs';

const app = express();
app.use('/cdn', cdnRouter);

describe('CDN Route Handler', () => {
  const testFilePath = path.resolve(process.cwd(), 'cdn/sample.txt');

  // Ensure test file exists
  it('test file should exist', () => {
    expect(fs.existsSync(testFilePath)).toBeTruthy();
  });

  it('should retrieve existing file successfully', async () => {
    const response = await request(app).get('/cdn/sample.txt');
    expect(response.status).toBe(200);
    expect(response.text).toContain('sample text file');
  });

  it('should return 404 for non-existent file', async () => {
    const response = await request(app).get('/cdn/nonexistent.txt');
    expect(response.status).toBe(404);
  });

  it('should prevent directory traversal with ../', async () => {
    const response = await request(app).get('/cdn/../sensitive-file.txt');
    expect(response.status).toBe(403);
  });

  it('should prevent directory traversal with absolute path', async () => {
    const response = await request(app).get('/cdn/absolute/path/outside');
    expect(response.status).toBe(403);
  });
});