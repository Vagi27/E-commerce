const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
const session = require('express-session');


const multer = require('multer')
const upload = multer({ dest: 'uploads/products' })
const sendEmail = require("./methods/sendEmail");

// const url = 'mongodb://localhost:27017';
const mongoose = require("mongoose");

async function init() {

    console.log("inside");
    await mongoose.connect('mongodb://127.0.0.1:27017/E-Commerce')
    console.log("mongoo db connected");

}
init();

let userSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    mobile: Number,
    isverified: Boolean
})
const UserModel = mongoose.model("users", userSchema);


let productSchema = new mongoose.Schema({
    name: String,
    description: String,
    prize: String,
    filename: String,
    path: String
})
const productModel = mongoose.model("products", productSchema);

let usercartSchema = new mongoose.Schema({
    username: String,
    cartitems: Array
});
const usercartModel = mongoose.model("usercartmodel", usercartSchema);


let cartSchema = new mongoose.Schema({
    name: String,
    description: String,
    prize: String,
    filename: String,
    path: String,
    quantity: Number

});

const carttest = mongoose.model("carttest", cartSchema);

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(express.static("uploads"));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

app.get('/', (req, res) => {

    productModel.find({}, function (err, result) {
        let productlist;
        productlist = result;
        // console.log(result);

        let totalcount = productlist.length;
        let isEndOfList = false;

        let reducedProductList;

        // console.log(req.session.count + 5);

        if (typeof req.session.count === Number) {
            req.session.count += 5;
            reducedProductList = productlist.splice(0, req.session.count);
        } else {
            reducedProductList = productlist.splice(0, 5);
            req.session.count = 5;
        }

        if (totalcount == reducedProductList.length ) {
            isEndOfList = true;
        }
        // console.log(reducedProductList);

        if (req.session.user != undefined) {
            // console.log("if condition");
            console.log(req.session.user);
            
            res.render("home", { user: req.session.user, productList: reducedProductList, totalCount: isEndOfList });
        }
        else {
            // console.log("else condition");
            // console.log(req.session);
            res.render("home", { user: false, productList: reducedProductList, totalCount: isEndOfList });
        }
        // }
        // else {
        //     res.render("signup", { user: false });
        // }

    });

});

app.route("/signup").get(function (req, res) {
    if (req.session.isAuthorized === true) {
        res.redirect('/');
    }
    else {
        res.render("signup", { error: "", user: false });
    }
})
    .post(function (req, res) {

        let obj = new UserModel();
        obj.name = req.body.name;
        obj.username = req.body.username;
        obj.email = req.body.email;
        obj.password = req.body.password;
        obj.mobile = req.body.mobile;
        obj.isverified = false;

        UserModel.find({ username: req.body.username }, function (err, result) {
            if (result.length == 0) {
                UserModel.find({ email: req.body.email }, function (err, result1) {
                    if (result1.length == 0) {
                        obj.save();
                        res.render("login", { error: "Account successfully created!" });
                    }
                    else {
                        res.render("login", { error: "This account already exists, Kindly login" });
                    }
                });
            }
            else {
                res.render("signup", { error: "Same username exists!!" })
            }
        });

    })
// })

// app.get("/verify", function (req, res) {
//     // console.log("in verify");
//     res.sendFile("/verification.html");

// })

app.route("/login").get(function (req, res) {
    if (req.session.isAuthorized === true) {
        // res.render("home", { user: req.session.user.username });
        // count=5;
        res.redirect('/');
    }
    else {
        res.render("login", { error: "", user: false });
    }

}).post(function (req, res) {
    // let flag;
    UserModel.find({ username: req.body.username, password: req.body.password }, function (err, result) {
        if (result.length == 0) {
            UserModel.find({ email: req.body.email, password: req.body.password }, function (err, result1) {
                if (result1.length == 0) {
                    res.render("login", { error: "Wrong Credentials!", user: false });
                }
                else {
                    req.session.isAuthorized = true;
                    req.session.user = result1[0];
                    // req.session.count = 5;
                    // req.session.count = req.session.count ||5;
                    req.session.initial = 0;
                    res.redirect("/");
                    // flag = 1;
                }
            })
        }
        else {
            req.session.isAuthorized = true;
            req.session.user = result[0];
            req.session.count = 5;
            req.session.initial = 0;
            res.redirect("/");
            // flag = 1;
        }
    });
})

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

// app.get("/admin", function (req, res) {
//     res.sendFile(__dirname + "/admin.html");
// });
// app.post("/admin", upload.single("productimage"), function (req, res) {
//     let products;
//     fs.readFile("./products.txt", "utf-8", function (err, data) {
//         if (data.length === 0) {
//             products = [];
//         }
//         else {
//             products = JSON.parse(data);
//         }
//         let obj = {
//             name: req.body.name,
//             description: req.body.description,
//             prize: req.body.prize,
//             filename: req.file.filename,
//             path: req.file.path,
//         }
//         products.push(obj);

//         fs.writeFile("./products.txt", JSON.stringify(products), function (err, data) {
//             if (err) {
//                 res.send("error occured!");
//             }
//         })
//         // console.log(req.body);
//         // console.log(req.file);

//         res.redirect("/admin");
//     })
// })

app.get("/loadmore", function (req, res) {

    productModel.find({}, function (err, result) {
        let products = result;
        // console.log("product len", products.length);

        // console.log("count", req.session.count);
        req.session.count += 5;
        // console.log("count", req.session.count);
        if (products.length >= req.session.count) {
            // console.log("inside if");
            req.session.initial += 5;
            // console.log(req.session.initial);
            products = products.splice(0, req.session.count);
            // console.log("all products", products);
            res.json(products);
        }
        else {
            res.end("0");
        }
    });

});

app.post("/dialog", function (req, res) {
    // console.log(req.body);
    productModel.find({ filename: req.body.key }, function (err, result) {
        res.json(result[0]);
    });
});

app.get("/profile", function (req, res) {
    res.render("profile.ejs", { user: req.session.user })

});

app.post("/profile", function (req, res) {
    // console.log(req.body);
    // console.log(req.session.user.email);
    UserModel.updateOne({ username: req.session.user.username }, { password: req.body.password }, function (err, result) {
        res.redirect("/");
    })

})

app.get("/cart", function (req, res) {
    if (req.session.user) {
        usercartModel.find({ username: req.session.user.username }, function (err, result) {
            if (result.length == 0) {
                res.render("cart", { user: req.session.user.username, items: false })
            }
            else {
                let cartitems = result;
                // console.log("username", req.session.user);
                res.render("cart", { user: req.session.user, items: result[0].cartitems });

            }
        });
    }
    else {
        res.redirect("/");
    }
});

app.post("/cart", function (req, res) {
    // console.log(req.body);
    let sign;
    if (req.body.sign) {
        sign = req.body.sign;
    }
    // console.log("sign=", sign);
    let item = req.body.filename;
    let product;

    let itemdetail = new usercartModel();
    itemdetail.username = req.session.user.username;

    productModel.findOne({ filename: item }, function (err, result) {
        product = result;


        usercartModel.find({ username: req.session.user.username }, function (err, result) {
            if (result.length == 0) {
                let obj = new carttest();
                obj.name = product.name;
                obj.description = product.description;
                obj.prize = product.prize;
                obj.filename = product.filename;
                obj.path = product.path;
                obj.quantity = 1;

                itemdetail.cartitems.push(obj);
                itemdetail.save();
                res.send("ok");

            }
            else {
                usercartModel.find({ username: req.session.user.username }, function (err, result) {


                    if (sign) {
                        for (let i = 0; i < result[0].cartitems.length; i++) {
                            if (result[0].cartitems[i].filename == item) {

                                if (sign && sign == "-") {
                                    result[0].cartitems[i].quantity--;
                                    res.json(result[0].cartitems[i]);
                                    if (result[0].cartitems[i].quantity == 0) {
                                        result[0].cartitems.splice(i, 1);
                                        // return;
                                    }
                                }
                                if (sign && sign == "+") {
                                    result[0].cartitems[i].quantity++;
                                    res.json(result[0].cartitems[i]);
                                }
                                usercartModel.updateOne({ username: req.session.user.username }, { cartitems: result[0].cartitems }, function (err, result) {
                                    if (!sign) {
                                        res.end("0");
                                    }
                                    return;
                                })
                                return;
                            }
                        }
                    }
                    else {
                        let obj = new carttest();
                        obj.name = product.name;
                        obj.description = product.description;
                        obj.prize = product.prize;
                        obj.filename = product.filename;
                        obj.path = product.path;
                        obj.quantity = 1;


                        for (let i = 0; i < result[0].cartitems.length; i++) {
                            if (result[0].cartitems[i].filename == item) {
                                res.send("exist");
                                return;
                            }
                        }


                        result[0].cartitems.push(obj);
                        let entry = result[0].cartitems;
                        usercartModel.updateOne({ username: req.session.user.username }, { cartitems: entry }, function (err, result) {
                            // console.log(result);
                            res.send("else ok");
                        })

                    }

                });
            }

        });

    });


});

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
})

