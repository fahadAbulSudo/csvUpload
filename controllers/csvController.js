const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const Csv = require('../models/csv');

// Controller function to read and display CSV file data
exports.readCsvFile = async (req, res) => {
  try {
    const csvId = req.params.csvId;

    // Find the CSV document by ID in the database
    const csv = await Csv.findById(csvId);

    if (!csv) {
      return res.status(404).json({ error: 'CSV file not found' });
    }

    const filePath = csv.filePath;
    const fileStream = fs.createReadStream(filePath);

    const results = [];
    const headers = []; // Array to store column headers

    fileStream
      .pipe(csvParser())
      .on('headers', (csvHeaders) => {
        // Extract and store column headers when available
        csvHeaders.forEach((header) => {
          headers.push(header);
        });
      })
      .on('data', (data) => {
        // Process each row of CSV data and push it to the results array
        results.push(data);
      })
      .on('end', () => {
        // Render the 'csv.ejs' template with the parsed data and headers
        res.render('csv', { csvData: results, csvHeaders: headers, pageTitle: 'CSV' });
      });
  } catch (error) {
    console.error('Error reading CSV file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
