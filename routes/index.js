const express = require('express');
const router = express.Router();
const HomeController = require('../controllers/homeController'); // Import the HomeController
const CsvController = require('../controllers/csvController'); // Import the CsvController

// Handle file upload
router.post('/upload', HomeController.uploadFile, HomeController.handleFileUpload);

// Delete CSV file by ID
router.delete('/delete/:csvId', HomeController.deleteFile);

// List uploaded CSV files
router.get('/', HomeController.listUploadedFiles);

// View a specific CSV file by ID
router.get('/view/:csvId', CsvController.readCsvFile);

// Visualize a specific CSV data column by CSV ID and column name
router.get('/visualize/:csvId/:columnName', CsvController.visualizeColumn);

module.exports = router;
