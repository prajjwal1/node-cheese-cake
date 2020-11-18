const express = require('express');
const router = express.Router();
const authUtils = require('../utils/auth');
const passport = require('passport');
const flash = require('connect-flash');


router.get('/login', (req, res, next) => {
  const messages = req.flash();
  res.render('login', { messages });
});

router.post('/login', passport.authenticate('local', 
  { failureRedirect: '/auth/login', 
    failureFlash: 'Wrong username or password'}), (req, res, next) => {
  res.redirect('/users');
});

router.get('/register', (req, res, next) => {
  const messages = req.flash();
  res.render('register', { messages });
});

router.post('/register', (req, res, next) => {
  const registrationParams = req.body;
  const users = req.app.locals.users;
  const payload = {
    name: registrationParams.name,
    username: registrationParams.username,
    email: registrationParams.email,
    password: authUtils.hashPassword(registrationParams.password),
  };

  users.insertOne(payload, (err) => {
    if (err) {
      req.flash('error', 'User account already exists.');
    } else {
      req.flash('success', 'User account registered successfully.');
    }

    res.redirect('/auth/register');
  })
});

router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;