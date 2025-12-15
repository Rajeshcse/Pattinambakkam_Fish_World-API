import express from 'express';
import upload from '../middleware/upload.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/helpers/responseHelper.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

const uploadToCloudinary = (buffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `pattinambakkam-fish-world/${folder}`,
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

router.post(
  '/product-image',
  authenticateToken,
  authorizeRoles('admin'),
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }

      console.log('Uploading to Cloudinary...');
      const result = await uploadToCloudinary(req.file.buffer, 'products');
      console.log('Cloudinary upload successful:', result.secure_url);

      return sendSuccess(
        res,
        {
          url: result.secure_url,
          publicId: result.public_id,
          size: result.bytes,
          format: result.format,
          width: result.width,
          height: result.height
        },
        'Image uploaded successfully',
        201
      );
    } catch (error) {
      console.error('Upload error:', error);
      return sendError(res, error.message || 'Error uploading image', 500);
    }
  }
);

router.post(
  '/product-images',
  authenticateToken,
  authorizeRoles('admin'),
  upload.array('images', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return sendError(res, 'No files uploaded', 400);
      }

      console.log(`Uploading ${req.files.length} images to Cloudinary...`);
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, 'products'));

      const results = await Promise.all(uploadPromises);
      console.log('All images uploaded successfully');

      const uploadedImages = results.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height
      }));

      return sendSuccess(
        res,
        { images: uploadedImages },
        `${req.files.length} image(s) uploaded successfully`,
        201
      );
    } catch (error) {
      console.error('Upload error:', error);
      return sendError(res, error.message || 'Error uploading images', 500);
    }
  }
);

export default router;
