var express = require('express');
var router = express.Router();
var passport = require('passport');
var csrf = require('csurf');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function (req,res,next){
    res.render('user/profile');
});

router.get('/logout', isLoggedIn, function (req,res,next) {
    req.logout();
    res.redirect('/');
});

router.use('/', isLoggedOut, function (req, res, next) {
    next();
})

router.get('/signup', function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup', { title: 'Cheese Shop - Sign In', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
}), function (req, res, next) {
    if (req.session.oldUrl) {
        res.redirect(req.session.oldUrl);
        req.session.oldUrl = null;
    } else {
        res.redirect('/user/profile');
    }
});

router.get('/signin', function (req,res,next) {
    var messages = req.flash('error');
    res.render('user/signin', { title: 'Cheese Shop - Sign In', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
})


router.post('/signin', passport.authenticate('local-signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), function (req, res, next) {
    if (req.session.oldUrl) {
        res.redirect(req.session.oldUrl);
        req.session.oldUrl = null;
    } else {
        res.redirect('/user/profile');
    }
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function isLoggedOut(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}