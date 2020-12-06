var User = require('../models/user');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/wpl-project', {useNewUrlParser: true});

// Admin password is FirstAdmin1234*
var users = [
    new User({
        name: "Admin",
        email: "admin@admin.com",
        password: "$2a$05$KHi63z1PfBgKpDEgCsjf/.LhTpLErftpzOT0mO5dw1mLhvbfZsXHK",
        isAdmin: true
    })
];

var done = 0;

for (var i = 0; i < users.length; i++) {
    users[i].save()
        .then(result => {
            done++;
            if(done === users.length){
                exit();
            }
        })
        .catch(error => console.error(error))
}

function exit() {
    mongoose.disconnect()
}