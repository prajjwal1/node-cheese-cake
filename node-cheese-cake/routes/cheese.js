var express = require('express');
var router = express.Router();
var Product = require('../models/product')

/* GET users listing. */
router.get('/', function(req, res, next) {
    Product.find(function(err, docs){
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            var tempArray = []
            docs.slice(i, i + chunkSize).forEach(row => tempArray.push(row.toObject()))
            productChunks.push(tempArray);
        }
        res.render('shop/cheese', { title: 'Cheese Shop', products: productChunks });
    });
});

module.exports = router;
