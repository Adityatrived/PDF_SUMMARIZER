//24-05-2025 11am

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

    const summary_length = req.body.size || 'short';
    const output_language = req.body.lang || 'en';

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    form.append('summary_length', summary_length);
    form.append('output_language', output_language);

    // Make request to APYHUB API
    const response = await axios.post(
      'https://api.apyhub.com/ai/summarize-documents/file',
      form,
      {
        headers: {
          'apy-token': process.env.APYHUB_API_KEY,
          ...form.getHeaders(),
        },
      }
    );

    res.json({ summary: response.data.data.summary });
  } catch (err) {
    // If APYHUB API returns a rate limit error (usually 429)
    if (err.response && err.response.status === 429) {
      return res.status(429).json({ error: 'Daily limit exceeded. Try again tomorrow.' });
    }
    // If APYHUB returns a specific message about quota/limit
    if (err.response && err.response.data && typeof err.response.data.message === 'string') {
      if (err.response.data.message.toLowerCase().includes('limit')) {
        return res.status(429).json({ error: 'Daily limit exceeded. Try again tomorrow.' });
      }
      return res.status(err.response.status).json({ error: err.response.data.message });
    }
    // Generic error fallback
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

