var express = require('express');
var router = express.Router();
var Cart = require('../models/cart')

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/wpl-project', {useNewUrlParser: true});

var Product = require('../models/product')
var Order = require('../models/order')

router.get('/', function(req, res, next) {
  res.render('shop/index', { title: 'Cheese Cake Shop' });
});

router.get('/add-to-cart/:id', function (req,res,next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function (err, product) {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, productId);
    req.session.cart = cart;
    res.redirect('/cheese');
  });
});

router.get('/shop/admin-list', function (req, res, next){
  var items_map = {};
  var cnt = 0;
  Product.find({}, function(err, items){
    items.forEach(function(item){
      if (item.title.length>0 && item.isDeleted == false){
        items_map[cnt] = item;
        cnt += 1;
      }
    })
  })
  console.log(items_map);
  res.render('shop/admin-list', {
    items: items_map
  })  
})

router.get('/shop/admin-delete', function (req, res, next){
  var items_map = new Array();
  var cnt = 0;
  Product.find({}, function(err, items){
    items.forEach(function(item){
      if (item.title.length>0 && item.isDeleted == false){
        items_map[cnt] = item;
        cnt += 1;
      }
    })
  })
  res.render('shop/admin-delete', {
    items: items_map
  });
})

router.get('/shop/admin-add', function(req, res, next){
  res.render('shop/admin-add');
})

router.post('/cheese', function(req, res, next){
  data = [
    {
      title: req.body.title,
      stock: req.body.stock,
      imagePath: req.body.imagePath,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      isDeleted: false
    }
  ]
  Product.insertMany(data, function(err, data){
    if (err) throw err;
    res.redirect('cheese');
  })
})

router.post('/shop/item-delete/:id', function(req, res, next) {
  Product.findOneAndUpdate(
    {_id: req.params.id},
    {isDeleted: true}, function (err, result) {
      console.log("Successfully Deleted");
    }
);
    res.render('cheese');
})

router.get('/reduce/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function (req,res,next) {
  var errorMsg = req.flash('error')[0];
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', {
      products: null,
      errorMsg: errorMsg,
      noMsg: !errorMsg
    });
  }
  var cart = new Cart(req.session.cart);
  var errorMsg = req.flash('error')[0];
  console.log("here");
  console.log(errorMsg);
  res.render('shop/shopping-cart', {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    errorMsg: errorMsg,
    noMsg: !errorMsg
  });
});

router.get('/checkout', isLoggedIn, function (req,res,next) {
  if (!req.session.cart) {
    return res.redirect('shop/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/checkout', {total: cart.totalPrice})
});

router.post('/checkout', isLoggedIn, function (req,res,next) {
  if (!req.session.cart) {
    return res.redirect('shop/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var current_date = new Date();
  var order = new Order({
    user: req.user,
    cart: cart,
    address: req.body.address,
    name: req.body.name,
    order_date: current_date
  });

  var storedItems = cart.items;
  for (var items in storedItems) {
    var productId = storedItems[items].item._id;
    var stock = storedItems[items].item.stock;
    var productQty = storedItems[items].qty;
    var flashMsgFlag = false;
    var errorMessages = "";
    if (stock - productQty < 0) {
      flashMsgFlag = true;
      errorMessages += 'We cannot place the order since we only have ' + stock + ' pieces of ' + storedItems[items].item.title + ' left.';
    }
  }
  console.log(flashMsgFlag);
  if (flashMsgFlag) {
    req.flash('error', errorMessages);
    return res.redirect('/shopping-cart');
  }

  for (var items in storedItems) {
    var productId = storedItems[items].item._id;
    var stock = storedItems[items].item.stock;
    var productQty = storedItems[items].qty;
    stock = stock - productQty;

    Product.findOneAndUpdate(
        {_id: productId},
        {stock: stock}, function (err, result) {
          console.log("Successfully updated");
        }
    );
    order.save(function (err, result) {
      req.flash('success', 'Successfully bought products!');
      req.session.cart = null;
      res.redirect('/cheese');
    });
  }
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}