const LocalStrategy = require('passport-local').Strategy;
const request = require('request');

//------------ API Configuration ------------//
const baseUrl = require('../config/key').baseUrl;

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true }, function (req, email, password, done) {
            //console.log('in passport route..............................');
            var log_type = req.body.log_type;
            var sessionCart = req.session.cart;
            var cartItems = []
            //console.log(log_type);
            if (sessionCart != undefined) {
                // Have items in session cart. You need to pass that items to user cart.
                for (let key in sessionCart) {
                    let item = sessionCart[key];
                    let newItem = {
                        "EcomStockId": item.stock_id,
                        "unitPrice": item.unit_price,
                        "Quantity": item.quantity
                    };
                    cartItems.push(newItem);
                }
                //console.log(cartItems)
            }

            if (log_type == 1) {
                //console.log("with password : " + email + " : " +password);
                request({
                    url: baseUrl + '/Customer/Login?filter=' + log_type,
                    method: 'POST',
                    body: {
                        "userName": "string",
                        "password": password,
                        "employeeBarcode": "string",
                        "phone": email,
                        "otpCode": "string",
                        "cartItems": cartItems
                    },
                    json: true
                }, function (err, res, body) {
                    if (err) {
                        return done(null, false, { message: 'Login Error!' });
                    }
                    if (body.status == 'Success') {
                        return done(null, body.content);
                    } else {
                        return done(null, false, { message: `Invalid Login! ${body.message}` });
                    }
                });
            } else {
                //console.log("with otp");
                request({
                    url: baseUrl + '/Customer/MobileNumerVerificationForLogin',
                    method: 'POST',
                    body: {
                        "userName": "string",
                        "password": "string",
                        "employeeBarcode": "string",
                        "phone": email,
                        "otpCode": password,
                        "cartItems": cartItems
                    },
                    json: true
                }, function (err, res, body) {
                    if (err) {
                        return done(null, false, { message: 'Login Error!' });
                    }
                    if (body.status == 'Success') {
                        return done(null, body.content);
                    } else {
                        return done(null, false, { message: 'Invalid Login!' });
                    }
                });
            }
        })
    );

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });
};