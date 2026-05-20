import { Request, Response } from 'express';
import { storage } from '../config/firebase';
import { asyncHandler } from '../middlewares/errorMiddleware';

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const bucket = storage.bucket();
  console.log(`[Upload] Attempting to upload to bucket: ${bucket.name}`);

  const blob = bucket.file(`menu/${Date.now()}_${req.file.originalname}`);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
    resumable: false
  });

  blobStream.on('error', (err) => {
    console.error('Upload Error:', err);
    res.status(500).json({ message: 'Upload failed' });
  });

  blobStream.on('finish', async () => {
    // Make the file public
    await blob.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    
    res.status(200).json({ 
      message: 'Upload successful',
      url: publicUrl 
    });
  });

  blobStream.end(req.file.buffer);
});
