const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuthenticated } = require('../config/checkAuth')
const request = require('request');
const baseUrl = require('../config/key').baseUrl;

const authController = require('../controllers/authController');

//Login
router.get('/login/:mobile', (req, response) => {
    var mobile = "";
    if(req.params.mobile != 1){
        mobile = req.params.mobile
    }
    
    // Get main cats 
    request({
        url: baseUrl + "/EcomCategory/DashboardView",
        method: 'GET',
        json: true
    }, function (err, res, body) {
        // Get available Cart Items from customerCode
        var userCart = undefined;
        var cartItems = undefined;
        if (req.user != undefined) {
            //console.log('have user cart here')
            request({
                url: baseUrl + "/CartRecord/GetCartImformations?customerCode=" + req.user.customer.customerCode,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + req.user.auth.token
                },
                json: true
            }, function (err, res, cartBody) {
                if (cartBody.status = "Success") {
                    if (cartBody.status == "Success" & cartBody.message == "user don't have a cart saved") {
                        userCart = undefined;
                        cartItems = undefined;
                    } else {
                        userCart = cartBody.content;
                        cartItems = cartBody.content.cartItemsList;
                    }
                    response.render('login', {
                        sub_title: "Login",
                        sub_title2: "",
                        mainList: body.content,
                        userCart: userCart,
                        cartItems: cartItems,
                        mobile: mobile,
                        error_msg: '',
                        success_msg: '',
                    });
                }

            });
        } else {
            response.render('login', {
                sub_title: "Login",
                sub_title2: "",
                mainList: body.content,
                userCart: userCart,
                cartItems: undefined,
                mobile: mobile,
                error_msg: '',
                success_msg: '',
            });
        }
    })
});

router.post('/login', authController.loginHandle);


// Register
router.get('/register', (req, response) => {
    // Get main cats 
    request({
        url: baseUrl + "/EcomCategory/DashboardView",
        method: 'GET',
        json: true
    }, function (err, res, body) {
        var userCart = undefined;
        var cartItems = undefined;
        if (req.user != undefined) {
            request({
                url: baseUrl + "/CartRecord/GetCartImformations?customerCode=" + req.user.customer.customerCode,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + req.user.auth.token
                },
                json: true
            }, function (err, res, cartBody) {
                if (cartBody.status == "Success" & cartBody.message == "user don't have a cart saved") {
                    userCart = undefined;
                    cartItems = undefined;
                } else {
                    userCart = cartBody.content;
                    cartItems = cartBody.content.cartItemsList;
                }
                response.render('register', {
                    sub_title: "Register",
                    sub_title2: "",
                    mainList: body.content,
                    userCart: userCart,
                    cartItems: cartItems,
                    error_msg: '',
                    success_msg: '',
                });
            })
        } else {
            response.render('register', {
                sub_title: "Register",
                sub_title2: "",
                mainList: body.content,
                userCart: userCart,
                cartItems: cartItems,
                error_msg: '',
                success_msg: '',
            });
        }

    })
});

router.post('/register', authController.registerCustomer);


// Forgot Password 
router.get('/forgot_password', (req, response) => {
    // Get main cats 
    request({
        url: baseUrl + "/EcomCategory/DashboardView",
        method: 'GET',
        json: true
    }, function (err, res, body) {
        var userCart = undefined;
        var cartItems = undefined;
        if (req.user != undefined) {
            request({
                url: baseUrl + "/CartRecord/GetCartImformations?customerCode=" + req.user.customer.customerCode,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + req.user.auth.token
                },
                json: true
            }, function (err, res, cartBody) {
                if (cartBody.status == "Success" & cartBody.message == "user don't have a cart saved") {
                    userCart = undefined;
                    cartItems = undefined;
                } else {
                    userCart = cartBody.content;
                    cartItems = cartBody.content.cartItemsList;
                }
                response.render('forgot', {
                    sub_title: "Forgot Password",
                    sub_title2: "",
                    mainList: body.content,
                    userCart: userCart,
                    cartItems: cartItems,
                    error_msg: '',
                    success_msg: '',
                });
            })
        } else {
            response.render('forgot', {
                sub_title: "Forgot Password",
                sub_title2: "",
                mainList: body.content,
                userCart: userCart,
                cartItems: cartItems,
                error_msg: '',
                success_msg: '',
            });
        }

    })
});

// router.get('/send_code/:mobile', (req, response) => {
//     //console.log('send code...')
//     var mobile = req.params.mobile;
//     request({
//         url: baseUrl + "/MobileVarificationMaster/"+mobile,
//         method: 'GET',
//         json: true
//     }, function (err, res, body) {
//         if(body.status == "Success"){
//             //console.log(body.content)
//         }else{
//             response.redirect("/auth/login")
//         }
//     })
// })


//------------ Logout GET Handle ------------//
router.get('/logout', authController.logoutHandle);

module.exports = router;