var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('user/signup', { title: 'Cheese Shop - Sign Up' });
});

module.exports = router;
