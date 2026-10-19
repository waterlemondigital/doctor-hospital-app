import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';

export const uploadRouter = Router();

// Configure R2 S3 Client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

// Configure Multer for PDF file memory buffer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB strictly
  },
  fileFilter: (_req, file, cb) => {
    const isPdfMime = file.mimetype === 'application/pdf';
    const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');

    if (isPdfMime || isPdfExt) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are allowed. Please upload a valid .pdf file.'));
    }
  },
});

function sanitizeForSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50) || 'entity';
}

function sanitizeFilename(originalName: string): string {
  return originalName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_\-\.]/g, '')
    .slice(0, 80);
}

// POST /api/v1/upload/document
// Expects multipart form data with:
// - file: PDF file
// - entityType: 'hospital' | 'laboratory' | 'wellness' | 'doctor'
// - docType: 'registration_cert' | 'operating_licence' | 'address_proof' | 'general'
// - entityName: string
uploadRouter.post(
  '/upload/document',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'error',
            detail: 'File exceeds maximum size limit of 5MB. Please upload a PDF below 5MB.',
          });
        }
        return res.status(400).json({ status: 'error', detail: err.message });
      } else if (err) {
        return res.status(400).json({ status: 'error', detail: err.message });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          detail: 'No file provided. Please attach a valid PDF document.',
        });
      }

      const { entityType = 'hospital', docType = 'registration_cert', entityName = 'organization' } = req.body || {};

      // Determine R2 routing path structure
      // Structure: documents/{entity_category}/{slug}/{doc_role}_{timestamp}_{cleanFilename}
      // This strictly segregates documents from images/photos in R2 bucket
      const entityCategoryMap: Record<string, string> = {
        hospital: 'hospitals',
        laboratory: 'laboratories',
        lab: 'laboratories',
        wellness: 'wellness',
        doctor: 'doctors',
      };

      const entityFolder = entityCategoryMap[entityType.toLowerCase()] || 'other';
      const cleanSlug = sanitizeForSlug(entityName);
      const cleanDocType = sanitizeForSlug(docType);
      const cleanFilename = sanitizeFilename(req.file.originalname);
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 9000 + 1000);

      // Clean, deterministic, collision-free R2 Key
      const r2Key = `documents/${entityFolder}/${cleanSlug}/${cleanDocType}_${timestamp}_${randomSuffix}_${cleanFilename}`;

      // Upload directly to Cloudflare R2
      await r2Client.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: r2Key,
          Body: req.file.buffer,
          ContentType: 'application/pdf',
          ContentDisposition: `inline; filename="${req.file.originalname}"`,
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );

      const publicBase = env.R2_PUBLIC_URL.replace(/\/+$/, '');
      const publicUrl = `${publicBase}/${r2Key}`;

      return res.status(201).json({
        status: 'success',
        url: publicUrl,
        key: r2Key,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        entityType,
        docType,
      });
    } catch (err: any) {
      console.error('Error uploading document to Cloudflare R2:', err);
      return res.status(500).json({
        status: 'error',
        detail: 'Cloudflare R2 document storage failed: ' + (err?.message || 'Internal error'),
      });
    }
  }
);
