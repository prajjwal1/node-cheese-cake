var express = require('express');
var router = express.Router();
var Cart = require('../models/cart')

////
const path = require('path');
const multer  = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
      console.log(file);
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
      cb(null, true);
  } else {
      cb(null, false);
  }
}
const upload = multer({ storage: storage, fileFilter: fileFilter });
/////

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/wpl-project', {useNewUrlParser: true});

var Product = require('../models/product')
var Order = require('../models/order');
const { Console } = require('console');

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
  var products = [];
  var cnt = 0;
  Product.find({}, function(err, items) {
    items.forEach(function(item) {
      if (item.title.length > 0 && item.isDeleted == false){
        products[cnt] = item;
        cnt ++;
      }
    })

    console.log(products);
    res.render('shop/admin-list', { products : products }) 
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

router.get('/shop/admin-update', function(req, res, next){
  var items_map = new Array();
  var cnt = 0;
  Product.find({}, function(err, items){
    items.forEach(function(item) {
      if (item.title.length > 0 && item.isDeleted == false) {
        items_map[cnt] = item;
        cnt += 1;
      }
    })
  })
  res.render('shop/admin-update', {
    items: items_map
  });
})

router.post('/cheese', upload.single('image'), function(req, res, next) {
  
  var title = req.body.title;
  var stock = req.body.stock;
  var imagePath = ""; 
  var description = req.body.description;
  var category = req.body.category;
  var price = req.body.price;
  if(title == "") {
    title = "Default Cheese";
  }
  if(stock == "") {
    stock = 10;
  }

  if (!req.file || Object.keys(req.file).length === 0) {
    imagePath = "../images/cheesenavbar.png";
    // return res.status(400).send('No files were uploaded.');
  }

  else {
    imagePath = req.file.path;
    temp = imagePath.split('/');
    imagePath = '../'+'images'+'/'+temp[temp.length-1];
  }

  if(description == "") {
    imagePath = "Type of Cheese";
  }

  if(category == "") {
    imagePath = "vegetarian";
  }

  if(price == "") {
    imagePath = 20;
  }

  data = [
    {
      title: title,
      stock: stock,
      imagePath: imagePath,
      description: description,
      category: category,
      price: price,
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
  res.redirect('/cheese'); 
})

router.post('/shop/item-update/:id', function(req, res, next) {
  Product.findOne({_id: req.params.id}, function(err, item) {
    res.render('shop/update-product', item); 
  });
  
})

router.post('/shop/item-update-values/:id', upload.single('image'), function(req, res, next) {
  
  var imagePath = "";
  var query = {};

  if (req.file && Object.keys(req.file).length != 0) {
    imagePath = req.file.path;
    temp = imagePath.split('/');
    imagePath = '../'+'images'+'/'+temp[temp.length-1];
    query = {
      title: req.body.title,
      category: req.body.category,
      stock: req.body.stock,
      price: req.body.price,
      description: req.body.description,
      imagePath: imagePath,
    }
  }
  
  else {
    query = {
      title: req.body.title,
      category: req.body.category,
      stock: req.body.stock,
      price: req.body.price,
      description: req.body.description,
    }
  }

  Product.findOneAndUpdate (
    {_id: req.params.id},
    query, function (err, result) {
      console.log("Successfully Updated");
    }  
  );

  res.redirect('/cheese'); 
})

router.get('/increase/:id', function(req, res, next) {
  var productId = req.params.id;
  Product.findOne({_id: productId}, function(err, item) {
    var stock = item.stock;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    var updated = cart.increaseByOne(productId, stock);
    console.log("stock: " + stock);
    console.log("updated: " + updated);
    if(updated == true) {
      req.session.cart = cart;
      res.redirect('/shopping-cart');
    }
    else {
      res.redirect('/shopping-cart');
    }
  });

});

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