import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
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

// Configure Multer for Image file uploads
const imageUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    if (isImage) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP, etc.) are allowed.'));
    }
  },
});

// POST /api/v1/upload/image
// Uploads entity image to Cloudflare R2 and generates WebP full and card variants
uploadRouter.post(
  '/upload/image',
  (req: Request, res: Response, next: NextFunction) => {
    imageUpload.single('file')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
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
          detail: 'No image file provided.',
        });
      }

      const { entityType = 'hospitals', entityId = 'new_entity', alt = '', caption = '' } = req.body || {};
      const cleanEntity = sanitizeForSlug(entityType);
      const cleanId = sanitizeForSlug(entityId);
      const timestamp = Date.now();

      // Optimize image using sharp
      const fullWebp = await sharp(req.file.buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();

      const cardWebp = await sharp(req.file.buffer)
        .resize({ width: 600, withoutEnlargement: true })
        .webp({ quality: 75, effort: 4 })
        .toBuffer();

      const fullKey = `${cleanEntity}/${cleanId}/image_${timestamp}.webp`;
      const cardKey = `${cleanEntity}/${cleanId}/image_${timestamp}_card.webp`;

      // Upload full variant
      await r2Client.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: fullKey,
          Body: fullWebp,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );

      // Upload card variant
      await r2Client.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: cardKey,
          Body: cardWebp,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );

      const publicBase = env.R2_PUBLIC_URL.replace(/\/+$/, '');
      const fullUrl = `${publicBase}/${fullKey}`;
      const cardUrl = `${publicBase}/${cardKey}`;

      return res.status(201).json({
        status: 'success',
        url: fullUrl,
        card_url: cardUrl,
        alt: alt || `${cleanId} Image`,
        caption: caption || `${cleanId} Facility View`,
      });
    } catch (err: any) {
      console.error('Error uploading image to Cloudflare R2:', err);
      return res.status(500).json({
        status: 'error',
        detail: 'Cloudflare R2 image upload failed: ' + (err?.message || 'Internal error'),
      });
    }
  }
);

// POST /api/v1/upload/images
// Batch upload up to 50 entity images to Cloudflare R2
uploadRouter.post(
  '/upload/images',
  (req: Request, res: Response, next: NextFunction) => {
    imageUpload.array('files', 50)(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ status: 'error', detail: 'Maximum 50 images allowed at a time.' });
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
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ status: 'error', detail: 'No images provided.' });
      }

      if (files.length > 50) {
        return res.status(400).json({ status: 'error', detail: 'Maximum 50 images can be uploaded at once.' });
      }

      const { entityType = 'hospitals', entityId = 'new_entity' } = req.body || {};
      const cleanEntity = sanitizeForSlug(entityType);
      const cleanId = sanitizeForSlug(entityId);
      const publicBase = env.R2_PUBLIC_URL.replace(/\/+$/, '');

      // Process and upload concurrently with Promise.all
      const uploadPromises = files.map(async (file, idx) => {
        const timestamp = Date.now() + idx;
        const fullWebp = await sharp(file.buffer)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();

        const cardWebp = await sharp(file.buffer)
          .resize({ width: 600, withoutEnlargement: true })
          .webp({ quality: 75, effort: 4 })
          .toBuffer();

        const fullKey = `${cleanEntity}/${cleanId}/image_${timestamp}.webp`;
        const cardKey = `${cleanEntity}/${cleanId}/image_${timestamp}_card.webp`;

        await Promise.all([
          r2Client.send(
            new PutObjectCommand({
              Bucket: env.R2_BUCKET_NAME,
              Key: fullKey,
              Body: fullWebp,
              ContentType: 'image/webp',
              CacheControl: 'public, max-age=31536000, immutable',
            })
          ),
          r2Client.send(
            new PutObjectCommand({
              Bucket: env.R2_BUCKET_NAME,
              Key: cardKey,
              Body: cardWebp,
              ContentType: 'image/webp',
              CacheControl: 'public, max-age=31536000, immutable',
            })
          ),
        ]);

        return {
          url: `${publicBase}/${fullKey}`,
          card_url: `${publicBase}/${cardKey}`,
          alt: `${cleanId.replace(/[_-]+/g, ' ')} View ${idx + 1}`,
          caption: `${cleanId.replace(/[_-]+/g, ' ')} Facility View ${idx + 1}`,
          is_primary: idx === 0,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      return res.status(201).json({
        status: 'success',
        count: uploadedImages.length,
        images: uploadedImages,
      });
    } catch (err: any) {
      console.error('Error in batch Cloudflare R2 image upload:', err);
      return res.status(500).json({
        status: 'error',
        detail: 'Batch image upload failed: ' + (err?.message || 'Internal error'),
      });
    }
  }
);


