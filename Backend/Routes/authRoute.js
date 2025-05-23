const express = require('express');
const { verifyToken } = require('../Utilities/verifyToken');
const userRouter = express.Router();
const multer = require('multer');
const { createUser, logIn, forgotPassword, logout, updateUser } = require('../Controller/authController');
const cloudinary = require('cloudinary').v2;

const storage = multer.memoryStorage();

const upload = multer({storage:storage});

userRouter.post('/register', createUser);
userRouter.post('/login', logIn);
userRouter.post('/reset-password', forgotPassword);
userRouter.post('/update-user', verifyToken, updateUser)
userRouter.get('/logout', logout);


userRouter.post('/uploadProfilePhoto', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  try {
    const fileBuffer = req.file.buffer;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        resource_type: 'image',
        upload_preset: 'work-wise',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 800, height: 800, crop: 'fill', gravity: 'auto' }
        ]
      }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }).end(fileBuffer);
    });

    // Just return the Cloudinary upload result
    res.status(200).json({
      secure_url: result.secure_url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).send('Upload to Cloudinary failed');
  }
});

module.exports = userRouter;