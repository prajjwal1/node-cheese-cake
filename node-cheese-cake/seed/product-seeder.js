var Product = require('../models/product');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/wpl-project', {useNewUrlParser: true});

var products = [
    new Product({
        imagePath: "../images/mozarella.jpeg",
        title: "Mozarella",
        description: "Mozarella",
        category: "Slices",
        price: 50,
        stock: 10,
        isDeleted: false
    }),
    new Product({
        imagePath: '../images/parmesan.jpeg',
        title: 'Parmesan',
        description: 'Parmesan',
        category: "Grated",
        price: 45,
        stock: 10,
        isDeleted: false
    }),
    new Product({
        imagePath: '../images/creamcheese.jpg',
        title: 'Cream Cheese',
        description: 'Cream Cheese',
        category: "Creamy",
        price: 60,
        stock: 10,
        isDeleted: false
    }),
    new Product({
        imagePath: '../images/Gruyere.jpg',
        title: 'Gruyere',
        description: 'Gruyere',
        category: "Small Cubes",
        price: 60,
        stock: 10,
        isDeleted: false
    }),
    new Product({
        imagePath: '../images/Sliced Cheddar.jpeg',
        title: 'Sliced Cheddar',
        description: 'Sliced Cheddar',
        category: "Slices",
        price: 60,
        stock: 10,
        isDeleted: false
    }),
    new Product({
        imagePath: '../images/cheddar.jpeg',
        title: 'Cheddar',
        description: 'Cheddar',
        category: "Small Cubes",
        price: 60,
        stock: 10,
        isDeleted: false
    }),
    new Product({
        imagePath: '../images/WhippingCreamCheese.jpeg',
        title: 'Whipping Cream Cheese',
        description: 'Whipping Cream Cheese',
        category: "Creamy",
        price: 60,
        stock: 10,
        isDeleted: false
    }),
    new Product({
        imagePath: '../images/MexicanMildCheese.jpeg',
        title: 'Mexican Mild Cheese.',
        description: 'Mexican Mild Cheese.',
        category: "Small Cubes",
        price: 60,
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
