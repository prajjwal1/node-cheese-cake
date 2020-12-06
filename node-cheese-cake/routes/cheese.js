var express = require('express');
var router = express.Router();
var Product = require('../models/product')

/* GET users listing. */
// router.get('/', function(req, res, next) {
//     var successMsg = req.flash('success')[0];
//     Product.find(function(err, docs){
//         console.log(docs.slice(0, 2)[0]);
//         var productChunks = [];
//         var chunkSize = 3;
//         for (var i = 0; i < docs.length; i += chunkSize) {
//             var tempArray = []
//             docs.slice(i, i + chunkSize).forEach(row => tempArray.push(row.toObject()))
//             productChunks.push(tempArray);
//         }
//         res.render('shop/cheese', { title: 'Cheese Shop', products: productChunks, successMsg: successMsg, noMessages: !successMsg });
//     });
// });

var pages = (req, res, next) => {

    var currentPage = parseInt(req.params.page) || 1;

    Product.count({isDeleted: false}, function (err, count) {
        res.locals.totalProducts = count;
        res.locals.currentPage = currentPage;
        res.locals.totalPages = Math.ceil(res.locals.totalProducts / res.locals.limit);
        next();
    });
}

router.get('/', pages, function (req, res, next) {

    var isAdmin = false;
    if (typeof (req.user) !== 'undefined') {
        isAdmin = req.user.isAdmin;
    }

    var successMsg = req.flash('success')[0];
    var deletedItemMsg = req.flash('deletedItemMsg')[0];
    var editItemMsg = req.flash('editItemMsg')[0];
    var limit = res.locals.limit;
    var offset = res.locals.limit * (res.locals.currentPage - 1);
    var searchedFlag = false;
    var name = "";
    var category = "";
    if (Object.keys(req.query).length === 0) {
        var query = Product.find({isDeleted: false}).limit(limit).skip(offset).lean();
    } else {
        name = req.query.searchByName;
        category = req.query.searchByCategory;
        searchedFlag = true;
        var query;
        console.log("1");
        if (name !== "" && category === "") {
            console.log("Request received to get cheese with following options:")
            console.log("Name: " + name);
            query = Product.find({
                title: {$regex: name, $options: "i"},
                isDeleted: false
            }).limit(limit).skip(offset).lean();
            Product.count({title: {$regex: name, $options: "i"}}, function (err, count) {
                res.locals.totalProducts = count;
                res.locals.totalPages = Math.ceil(res.locals.totalProducts / res.locals.limit);
            });
        } else if(name === "" && category !== "") {
            console.log("Request received to get cheese with following options:")
            console.log("Category: " + category);
            query = Product.find({category: category, isDeleted: false}).limit(limit).skip(offset).lean();
            Product.count({category: category}, function (err, count) {
                res.locals.totalProducts = count;
                res.locals.totalPages = Math.ceil(res.locals.totalProducts / res.locals.limit);
                console.log(res.locals.totalPages);
            });
        } else if(name !== "" && category !== "") {
            console.log("Request received to get cheese with following options:")
            console.log("Name: " + name + " and Category " + category);
            query = Product.find({
                category: category,
                isDeleted: false,
                title: {$regex: name, $options: "i"}
            }).limit(limit).skip(offset).lean();
            Product.count({category: category, title: {$regex: name, $options: "i"}}, function (err, count) {
                res.locals.totalProducts = count;
                res.locals.totalPages = Math.ceil(res.locals.totalProducts / res.locals.limit);
            });
        } else {
            query = Product.find({isDeleted: false}).limit(limit).skip(offset).lean();
        }
    }
    console.log("Executing query to fetch products.")
    query.exec((error, docs) => {
        console.log("4");
        if (error) return console.error(error);
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            var tempArray = []
            docs.slice(i, i + chunkSize).forEach(row => tempArray.push(row))
            productChunks.push(tempArray);
        }

        res.render('shop/cheese', {
            title: 'Cheese Shop',
            products: productChunks,
            successMsg: successMsg,
            deletedItemMsg: deletedItemMsg,
            editItemMsg: editItemMsg,
            noMessages: !successMsg && !deletedItemMsg && !editItemMsg,
            searchedFlag: searchedFlag,
            searchedName: name,
            searchedCategory: category,
            isAdmin: isAdmin
        });
    });
});

router.get('/:page', pages, function (req, res, next) {
    if (req.params.page <= 1 || req.params.page > res.locals.totalPages) {
        if (Object.keys(req.query).length === 0) {
            res.redirect('/cheese');
        } else {
            res.redirect('/cheese/?searchByName=' + req.query.searchByName + '&searchByCategory=' + req.query.searchByCategory);
        }
    } else {
        var isAdmin = false;
        if (typeof (req.user) !== 'undefined') {
            isAdmin = req.user.isAdmin;
        }
        // console.log(isAdmin);
        var successMsg = req.flash('success')[0];
        var currentPage = req.params.page;
        res.locals.currentPage = currentPage;
        var limit = res.locals.limit;
        var offset = res.locals.limit * (res.locals.currentPage - 1);
        var searchedFlag = false;
        var name = "";
        var category = "";

        if (Object.keys(req.query).length === 0) {
            var query = Product.find({isDeleted: false}).limit(limit).skip(offset).lean();
        } else {
            name = req.query.searchByName;
            category = req.query.searchByCategory;
            searchedFlag = true;
            var query;
            if (name != "" && category == "") {
                query = Product.find({
                    isDeleted: false,
                    title: {$regex: name, $options: "i"}
                }).limit(limit).skip(offset).lean();
                Product.count({title: {$regex: name, $options: "i"}}, function (err, count) {
                    res.locals.totalProducts = count;
                    res.locals.totalPages = Math.ceil(res.locals.totalProducts / res.locals.limit);
                });
            } else if (name == "" && category != "") {
                query = Product.find({isDeleted: false, category: category}).limit(limit).skip(offset).lean();
                Product.count({category: category}, function (err, count) {
                    res.locals.totalProducts = count;
                    res.locals.totalPages = Math.ceil(res.locals.totalProducts / res.locals.limit);
                    // console.log(res.locals.totalPages);
                });
            } else if (name != "" && category != "") {
                query = Product.find({
                    isDeleted: false,
                    category: category,
                    title: {$regex: name, $options: "i"}
                }).limit(limit).skip(offset).lean();
                query = Product.find({
                    isDeleted: false,
                    category: category,
                    title: {$regex: name, $options: "i"}
                }).limit(limit).skip(offset).lean();
                Product.count({category: category, title: {$regex: name, $options: "i"}}, function (err, count) {
                    res.locals.totalProducts = count;
                    res.locals.totalPages = Math.ceil(res.locals.totalProducts / res.locals.limit);
                });
            } else {
                query = Product.find({isDeleted: false}).limit(limit).skip(offset).lean();
            }
        }

        query.exec((error, docs) => {
            if (error) return console.error(error);

            var productChunks = [];
            var chunkSize = 3;
            for (var i = 0; i < docs.length; i += chunkSize) {
                var tempArray = []
                docs.slice(i, i + chunkSize).forEach(row => tempArray.push(row))
                productChunks.push(tempArray);
            }

            res.render('shop/cheese', {
                title: 'Cheese Shop',
                products: productChunks,
                successMsg: successMsg,
                noMessages: !successMsg,
                searchedFlag: searchedFlag,
                searchedName: name,
                searchedCategory: category,
                isAdmin: isAdmin
            });
        });
    }
});

module.exports = router;
