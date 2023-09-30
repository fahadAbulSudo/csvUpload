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
        res.render('csv', { csvData: results, csvHeaders: headers, pageTitle: 'CSV', csvId: csvId  });
      });
  } catch (error) {
    console.error('Error reading CSV file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to calculate the visualization of numeric data
function calculateNumericVisualizationData(columnData) {
  // Calculate min and max values
  const minValue = Math.min(...columnData);
  const maxValue = Math.max(...columnData);

  // Calculate the range size
  const rangeSize = (maxValue - minValue) / 6;

  // Initialize an array to store counts for each range
  const rangeCounts = [0, 0, 0, 0, 0, 0];

  // Initialize an array to store range labels
  const rangeLabels = [];

  // Generate range labels and initialize rangeCounts
  for (let i = 0; i < 6; i++) {
    const rangeStart = (minValue + i * rangeSize).toFixed(1);
    const rangeEnd = (minValue + (i + 1) * rangeSize).toFixed(1);
    rangeLabels.push(`${rangeStart}-${rangeEnd}`);
  }

  // Iterate through the column data and count values in each range
  columnData.forEach((value) => {
    for (let i = 0; i < 6; i++) {
      const rangeStart = minValue + i * rangeSize;
      const rangeEnd = minValue + (i + 1) * rangeSize;
      if (value >= rangeStart && value < rangeEnd) {
        rangeCounts[i]++;
        break; // Exit the loop when the range is found
      }
    }
  });

  // Calculate the total count
  const totalCount = rangeCounts.reduce((sum, count) => sum + count, 0);

  // Calculate the percentage distribution
  const percentageDistribution = rangeCounts.map((count) => (count / totalCount) * 100);
  
  // Create an object with range labels as keys and percentages as values
  const result = {};
  for (let i = 0; i < 6; i++) {
    result[rangeLabels[i]] = percentageDistribution[i];
  }

  return { percentageDistribution: result };
}

// Function to calculate the visualization of catedorical data
const calculateCategoricalVisualizationData = (csvData) => {
  // Initialize an object to store the count of each category in the selected column
  const categoryCount = {};

  // Iterate through the CSV data, starting from the second row (index 1)
  for (let i = 0; i < csvData.length; i++) {
    const row = csvData[i];
    
    // Get the value of the selected column for the current row
    const category = row;

    // Update the count for the category
    if (category) {
      if (categoryCount[category]) {
        categoryCount[category]++;
      } else {
        categoryCount[category] = 1;
      }
    }
  }

  // Calculate the total count of categories
  const totalCount = Object.values(categoryCount).reduce((sum, count) => sum + count, 0);

  // Calculate the percentage distribution
  const percentageDistribution = {};
  for (const category in categoryCount) {
    percentageDistribution[category] = (categoryCount[category] / totalCount) * 100;
  }

  return { percentageDistribution: percentageDistribution };
};

// Function to check if a value is numeric
const isNumericData = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Controller function to visualize the selected column
exports.visualizeColumn = async (req, res) => {
  try {
    const csvId = req.params.csvId;
    const columnName = req.params.columnName;

    // Find the CSV document by ID in the database
    const csv = await Csv.findById(csvId);

    if (!csv) {
      return res.status(404).json({ error: 'CSV file not found' });
    }

    const filePath = csv.filePath;
    const fileStream = fs.createReadStream(filePath);
    const csvData = [];
    const headers = []; // Array to store column headers

    // Create a flag to track if the column exists
    let columnExists = false;

    // Create a flag to track if the column is numeric
    let isNumericColumn = true;

    fileStream
      .pipe(csvParser())
      .on('headers', (csvHeaders) => {
        // Extract and store column headers when available
        csvHeaders.forEach((header) => {
          headers.push(header);
        });
      })
      .on('data', (data) => {
        // Check if the column exists in the headers (case-insensitive)
        const columnIndex = headers.findIndex((header) => header.toLowerCase() === columnName.toLowerCase());

        if (columnIndex !== -1) {
          columnExists = true;
          column = headers[columnIndex];

          // Check if the column is numeric
          if (!isNumericData(data[column])) {
            isNumericColumn = false;
          }

          // Push the value of the selected column for the current row into csvData
          csvData.push(data[column]);
        }

        // Process the rest of the data if needed
      })
      .on('end', () => {
        // Check if the column exists
        if (columnExists) {
          if (isNumericColumn) {
            // Process the data for a numeric column
            const numericVisualizationData = calculateNumericVisualizationData(csvData);
            res.status(200).json(numericVisualizationData);
          } else {
            // Process the data for a categorical column
            const categoricalVisualizationData = calculateCategoricalVisualizationData(csvData);
            res.status(200).json(categoricalVisualizationData);
          }
        } else {
          // Handle the case when the column doesn't exist
          console.error('Column not found in CSV headers.');
          // Respond with an appropriate message or status
          res.status(400).json({ error: 'Column not found in CSV headers' });
        }
      });
  } catch (error) {
    console.error('Error processing visualization request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
