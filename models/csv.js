const mongoose = require('mongoose');

// Define the schema for CSV documents
const csvSchema = new mongoose.Schema({
  fileName: {
    type: String,
  },
  filePath: {
    type: String,
  },
  file: {
    type: String,
  },
}, {
  timestamps: {
    options: { timeZone: 'Asia/Kolkata' } // Set the time zone for timestamps
  }
});

// Create a model named 'Csv' based on the schema
const Csv = mongoose.model("Csv", csvSchema);

// Export the 'Csv' model
module.exports = Csv;
