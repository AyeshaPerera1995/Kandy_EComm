const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/checkAuth')
const request = require('request');
const baseUrl = require('../config/key').baseUrl;

// const authController = require('../controllers/authController');

// My Account
router.get('/profile', ensureAuthenticated, (req, response) => {
    if (req.user == undefined) {
        // Get main cats 
        request({
            url: baseUrl + "/EcomCategory/DashboardView",
            method: 'GET',
            json: true
        }, function (err, res, body) {
            response.render('login', {
                sub_title: "Login",
                sub_title2: "",
                mainList: body.content,
                userCart: undefined,
                cartItems: undefined,
                error_msg: '',
                success_msg: '',
            });
        })
    } else {
        // Get main cats 
        request({
            url: baseUrl + "/EcomCategory/DashboardView",
            method: 'GET',
            json: true
        }, function (err, res, body) {
            var userCart = undefined;
            var cartItems = undefined;
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

                // Get address List
                var addressList = []
                request({
                    url: baseUrl + "/CustomerAddress/Select?CustomerCode=" + req.user.customer.customerCode,
                    method: 'GET',
                    json: true
                }, function (err, res, addressBody) {
                    // //console.log(addressBody)
                    if(addressBody.content != null){
                        addressList = addressBody.content
                    }

                    // Get all orders 
                    request({
                        url: baseUrl + "/CustomerOrder/Select/All/Customer?phone="+req.user.customer.phone+"&nextPage=1&rowCount=12",
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + req.user.auth.token
                        },
                        json: true
                    }, function (err, res, ordersBody) {
                        var orderList = undefined;
                        // //console.log(ordersBody.content)
                        if(ordersBody.content != null){
                            orderList = ordersBody.content.List;
                        }

                        // Get Customer Details
                    request({
                        url: baseUrl + "/Customer/Select/CustomerCode?code="+req.user.customer.customerCode,
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + req.user.auth.token
                        },
                        json: true
                    }, function (err, res, cusBody) {
                        response.render('my_account', {
                            sub_title: "My Account",
                            sub_title2: "",
                            mainList: body.content,
                            userCart: userCart,
                            addressList: addressList,
                            orderList: orderList,
                            customer: cusBody.content,
                            cartItems: cartItems,
                            error_msg: '',
                            success_msg: '',
                        });

                    })

                    })
                })
            })

        })
    }
});

module.exports = router;