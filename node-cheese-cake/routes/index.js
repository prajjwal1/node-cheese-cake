var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/cheese-users');

// redirect to /videos 
router.get('/', function(req, res, next) {
  res.redirect('/products');
});

/* GET home page. */
router.get('/products', function(req, res) {
  var collection = db.get('products');
	collection.find({}, function(err, products){
    if (err) throw err;
    // renders user view
    // res.render('shop/index', { title: 'Cheese Shop' , products : products });
    // renders admin view
    res.render('admin/adminview', { title: 'Cheese Shop - Admin' , products : products });
	});
});

// render new product page 
router.get('/products/new', function(req, res) {
	res.render('admin/new');
});

// render single video page with id 
router.get('/products/:id', function(req, res) {
	var collection = db.get('cheese-users');
	collection.findOne({ _id: req.params.id }, function(err, product){
    if (err) throw err;
	  	res.render('admin/show', { product : product });
	});
});

// delete product and redirect 
router.delete('/products/:id', function(req, res){
	var collection = db.get('products');
    collection.remove({ _id: req.params.id}, function(err, product){
        if (err) throw err;
        res.redirect('/');
    });
});

// create new product and redirect 
router.post('/products', function(req, res) {
	var collection = db.get('products');
	collection.insert({
		title: req.body.title,
		image: req.body.image, 
		description: req.body.desc
	}, function(err, video) {
		if (err) throw err;

		res.redirect('/products');
	});
});

module.exports = router;
