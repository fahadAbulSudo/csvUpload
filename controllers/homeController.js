const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Csv = require('../models/csv');
const mongoose = require('mongoose');

// Function to check if the uploaded file has a valid file type (CSV or text)
const isValidFileType = (file) => {
    const allowedMimeTypes = ['text/csv', 'text/plain'];
    return allowedMimeTypes.includes(file.mimetype);
};

// Configure Multer storage and file filter
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/files'); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFilename); // Set a unique filename for the uploaded file
  },
});

// Initialize Multer with custom storage and file filter
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (isValidFileType(file)) {
        cb(null, true); // Accept the file
      } else {
        cb(new Error('Invalid file type. Only CSV or text files are allowed.'));
      }
    },
  });

// Middleware for handling file uploads
exports.uploadFile = upload.single('csvFile');

// Handle uploaded files and save them to the database
exports.handleFileUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, path: filePath } = req.file;

    // Create a new Csv document with file information and save it to the database
    const newCsv = new Csv({
      fileName: originalname,
      filePath: filePath,
      file: req.file.filename,
    });

    await newCsv.save();
    req.flash('success', 'CSV Uploaded!');
    return res.status(200).redirect('/');
  } catch (error) {
    req.flash('error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a CSV file from both the database and the file system
exports.deleteFile = (req, res) => {
  const csvId = req.params.csvId;
  console.log(csvId)
  Csv.findById(csvId).then((csv) => { 
    if (!csv) {
      return res.status(404).json({ error: 'CSV file not found' });
    }

    if (fs.existsSync(csv.filePath)) {
      fs.unlinkSync(csv.filePath); // Delete the file from the file system
    }
    
    csv.deleteOne(); // Delete the Csv document from the database
    req.flash('success', 'CSV Deleted!');
    return res.status(200).json({ message:'worked fine'})})
    .catch((err) => {req.flash('error', err);
    res.status(500).json({ error: 'Internal server error' });
    });
};

// List uploaded CSV files and render the home page
exports.listUploadedFiles = async (req, res) => {
  try {
    const csvFiles = await Csv.find().sort({ createdAt: 'desc' });
    
    // Render the home page with a list of uploaded CSV files
    res.render('home', { csvFiles, pageTitle: 'CSV File Upload and List' });
  } catch (error) {
    console.error('Error fetching CSV files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



