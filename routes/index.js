const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController'); // Import the HomeController
const CsvController = require('../controllers/csvController'); // Import the CsvController
const { isAuthenticated } = require('../config/middleware');
const AuthController = require('../controllers/authController');
const { isAdmin, isDeveloper, isAdminOrBelongsToGroup, authorize } = require('../config/roleCheck');
const passport = require('../config/passport');

// Handle file upload
router.post('/dashboard/:groupId/upload', isAuthenticated, DashboardController.uploadFile, DashboardController.handleFileUpload);

// Delete CSV file by ID
router.delete('/dashboard/:groupId/delete/:csvId', isAuthenticated, DashboardController.deleteFile);

// List uploaded CSV files
router.get('/dashboard/:groupId', isAuthenticated, DashboardController.listUploadedFiles);

// View a specific CSV file by ID
router.get('/view/:csvId', isAuthenticated, CsvController.readCsvFile);

// View columns of a specific CSV file by ID
router.get('/column/:csvId', isAuthenticated, CsvController.getColumns);

// View descriptive statistics for a specific column in a CSV file by ID
router.get('/describe/:csvId/:columnName', isAuthenticated, CsvController.describeColumn);

// Visualize a specific CSV data column by CSV ID and column name
router.get('/visualize/:csvId/:columnName', isAuthenticated, CsvController.visualizeColumn);

// Route to render signup page
router.get('/signup', (req, res) => {
  res.render('signup', {
    pageTitle: 'sign up Page'
  });
});

// Admin Sign-Up Route
router.post('/signup', AuthController.adminSignUp);

// Route to render login page
router.get('/login', (req, res) => {
  res.render('login', {
    pageTitle: 'login Page', // You can pass additional data to the view here
});
});

// Custom login route to handle redirection to dashboard/groupId
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error', 'Login failed!');
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) {
        req.flash('error', 'Login failed!');
        return next(err);
      }

    req.flash('success', 'Login successfully!');
      // Redirect to the user's dashboard based on group ID
      return res.redirect(`/dashboard/${user.group}`);
    });
  })(req, res, next);
});

// Admin generates a token for a group
router.post('/generate-token', isAdmin, AuthController.generateToken);

// Developer registers using a token
router.post('/register', AuthController.registerDeveloper);

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
        return next(err);
    }
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        res.clearCookie('csvUpload');
        res.redirect('/');  // Redirect to the home page
    });
});
});

router.get('/', (req, res) => {
  // Pass the user object to the view
  res.render('home', {
    pageTitle: 'Home Page',
    user: req.user // Pass the user object
  });
});

module.exports = router;
