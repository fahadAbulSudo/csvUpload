// Middleware to set flash messages in response locals
function setFlash(req, res, next) {
    res.locals.flash = {
        success: req.flash('success'),
        error: req.flash('error')
    };
    next();
}

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Export both middleware functions
module.exports = {
    setFlash,
    isAuthenticated
};


