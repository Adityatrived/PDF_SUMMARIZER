// 24-05-2025 11am
// public/app.js
const form = document.getElementById('upload-form');
const messageDiv = document.getElementById('message');
const summaryDiv = document.getElementById('summary');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  messageDiv.textContent = '';
  summaryDiv.textContent = '';

  const pdfInput = document.getElementById('pdf-input');
  const lang = document.getElementById('lang-select').value;
  const size = document.getElementById('size-select').value;

  if (!pdfInput.files.length) {
    messageDiv.textContent = 'Please select a PDF file.';
    messageDiv.className = 'text-red-500 mb-4';
    return;
  }

  const formData = new FormData();
  formData.append('pdf', pdfInput.files[0]);
  formData.append('lang', lang);
  formData.append('size', size);

  try {
    messageDiv.textContent = 'Uploading and summarizing...';
    messageDiv.className = 'text-blue-600 mb-4';

    const response = await fetch('/api/summarize', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      summaryDiv.textContent = data.summary;
      messageDiv.textContent = 'Summary generated successfully!';
      messageDiv.className = 'text-green-600 mb-4';
    } else {

      // If daily limit is exceeded, show message and disable submit
      if (response.status === 429 && data.error && data.error.toLowerCase().includes('limit')) {
        messageDiv.textContent = 'Today’s summary limit has been reached, New summaries will be available tomorrow.';
        messageDiv.className = 'text-red-500 mb-4';
        submitBtn.disabled = true;
      } else {
        summaryDiv.textContent = '';
        messageDiv.textContent = data.error || 'An error occurred.';
        messageDiv.className = 'text-red-500 mb-4';
      }
    }
  } catch (err) {
    summaryDiv.textContent = '';
    messageDiv.textContent = 'Failed to connect to server.';
    messageDiv.className = 'text-red-500 mb-4';
  }
});

// COPY BUTTON
copyBtn.addEventListener('click', () => {
  const text = summaryDiv.textContent;
  if (text) {
    navigator.clipboard.writeText(text);
    messageDiv.textContent = 'Summary copied to clipboard!';
    messageDiv.className = 'text-green-600 mb-4';
  }
});


// DOWNLOAD BUTTON
downloadBtn.addEventListener('click', () => {
  const text = summaryDiv.textContent;
  if (text) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    a.click();
    URL.revokeObjectURL(url);
    messageDiv.textContent = 'Summary downloaded!';
    messageDiv.className = 'text-green-600 mb-4';
  }
});
