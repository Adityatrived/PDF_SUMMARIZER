// 24-05-2025 11am
const express = require('express');
const path = require('path');
require('dotenv').config();

const summarizeRouter = require('./routes/summarize');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// PDF summarization API route
app.use('/api/summarize', summarizeRouter);

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
