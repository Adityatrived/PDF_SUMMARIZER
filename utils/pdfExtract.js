const pdfParse = require('pdf-parse');

module.exports = async function(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
};