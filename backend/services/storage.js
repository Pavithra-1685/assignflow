const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder and resource type
    const isPDF = file.mimetype === 'application/pdf';
    return {
      folder: 'assignflow',
      resource_type: isPDF ? 'raw' : 'auto', // 'raw' for PDFs, 'auto' for images
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      format: isPDF ? 'pdf' : undefined,
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;
