var express = require('express');
var router = express.Router();
var passport = require('passport');
var csrf = require('csurf');
var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user')

var csrfProtection = csrf();
router.use(csrfProtection);

router.post('/verification', function (req, res, next) {
    User.findOne({email: req.body.email}, function (error, result) {
        if (error) console.log(error);
        if (result == null) {
            res.send(false);
        } else {
            res.send(true);
        }
    })
});

router.get('/profile', isLoggedIn, function (req, res, next) {
    Order.find({user: req.user}, function(err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile', { orders: orders });
    }).lean();
});

router.get('/logout', isLoggedIn, function (req,res,next) {
    req.logout();
    req.session.name = "Guest";
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
    req.session.name = req.body.name;
    if (req.session.oldUrl) {
        var url = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(url);

    } else {
        res.redirect('/cheese');
    }
});

router.get('/signin', function (req,res,next) {
    var messages = req.flash('error');
    res.render('user/signin', { title: 'Cheese Shop - Sign In', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signin', passport.authenticate('local-signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), function (req, res, next) {
    req.session.name = req.user.name;
    if (req.session.oldUrl) {
        var url = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(url);
    } else {
        res.redirect('/cheese');
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