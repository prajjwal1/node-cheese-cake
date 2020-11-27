var Product = require('../models/product');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/wpl-project', {useNewUrlParser: true});

var products = [
    new Product({
        imagePath: "./images/cheesenavbar.png",
        title: "Cheedar",
        description: "Cheese Type 1",
        category: "vegetarian",
        price: 10,
        stock: 10,
        isDeleted: false
    }),
    new Product({
        imagePath: './images/cheesenavbar.png',
        title: 'Yellow',
        description: 'Cheese Type 2',
        category: "vegetarian",
        price: 12,
        stock: 10,
        isDeleted: false
    }),
    new Product({
        imagePath: './images/cheesenavbar.png',
        title: 'White',
        description: 'Cheese Type 3',
        category: "vegetarian",
        price: 15,
        stock: 10,
        isDeleted: false
    })
];

var done = 0;

for (var i = 0; i < products.length; i++) {
    products[i].save()
        .then(result => {
            done++;
            if(done === products.length){
                exit();
            }
        })
        .catch(error => console.error(error))
}

function exit() {
    mongoose.disconnect()
}
