const express = require('express');
const router = express.Router();
const request = require('request');
const baseUrl = require('../config/key').baseUrl;
const { ensureAuthenticated } = require('../config/checkAuth')

const indexController = require('../controllers/indexController')

router.get('/', (req, response) => {
  // Get main cats 
  request({
    url: baseUrl + "/EcomCategory/DashboardView",
    method: 'GET',
    json: true
  }, function (err, res, body) {
    if (err) throw err;
    var mainList = ""
    if (body.status == 'Success') {
      mainList = body.content
    }else{
      mainList = body.content
    }
      // Get home banner one
      request({
        url: baseUrl + "/EcomBanner/Location/Home Page One",
        method: 'GET',
        json: true
      }, function (err, res, bobody) {
        // Get home banner two
        request({
          url: baseUrl + "/EcomBanner/Location/Home Page Two",
          method: 'GET',
          json: true
        }, function (err, res, bwbody) {
          // Get home banner three
          request({
            url: baseUrl + "/EcomBanner/Location/Home Page Three",
            method: 'GET',
            json: true
          }, function (err, res, btbody) {
            // Get available Cart Items from customerCode
            var userCart = undefined;
            var cartItems = undefined;

            // Get Best Selling Products
          request({
            url: baseUrl + "/EcomBanner/Select/BestSelling",
            method: 'GET',
            json: true
          }, function (err, res, sellingProBody) {
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
                if (cartBody.status == "Success") {
                  if(cartBody.status == "Success" & cartBody.message == "user don't have a cart saved"){
                    userCart = undefined;
                    cartItems = undefined;
                  }else{
                    userCart = cartBody.content;
                    cartItems = cartBody.content.cartItemsList;
                  }
                  response.render('index', {
                    sub_title: "Dashboard",
                    sub_title2: "",
                    mainList: mainList,
                    bannerOne: bobody.content[0],
                    bannerTwo: bwbody.content[0],
                    bannerThree: btbody.content[0],
                    bestSellingProducts : sellingProBody.content,
                    userCart: userCart,
                    cartItems: cartItems,
                    success_msg: '',
                    error_msg: ''
                  });
                }

              });
            } else {
              response.render('index', {
                sub_title: "Dashboard",
                sub_title2: "",
                mainList: mainList,
                bannerOne: bobody.content[0],
                bannerTwo: bwbody.content[0],
                bannerThree: btbody.content[0],
                bestSellingProducts : sellingProBody.content,
                userCart: userCart,
                cartItems: cartItems,
                success_msg: '',
                error_msg: ''
              });
            }
          })

          });
        });
      });
  });
});

router.get('/advance_search/result/:query', indexController.getAllSearchResults);


// Need to verify if there is any current user logged or not..... If not redirect to Login page
router.get('/add_prescription', (req, response) => {
  request({
    url: baseUrl + "/EcomCategory/DashboardView",
    method: 'GET',
    json: true
  }, function (err, res, body) {
    // response.render('upload_prescription', {
    //   sub_title: "Upload Prescription",
    //   mainList: body.content,
    //   error_msg: '',
    //   success_msg: '',
    // });
  })
})

// router.post('/add', indexController.addPrescription);

router.get('/cart', (req, response) => {
  request({
    url: baseUrl + "/EcomCategory/DashboardView",
    method: 'GET',
    json: true
  }, function (err, res, body) {
    if (req.user != undefined) {
      //console.log(req.user.customer.customerCode)
      request({
        url: baseUrl + "/CartRecord/GetCartImformations?customerCode=" + req.user.customer.customerCode,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + req.user.auth.token
        },
        json: true
      }, function (err, res, cartBody) {
        if (cartBody.status = "Success") {
          // //console.log(cartBody.content)
          if (cartBody.content == null) {
            response.render('cart', {
              sub_title: "Shopping Cart",
              sub_title2: "",
              mainList: body.content,
              cartItems: undefined,
              userCart: undefined,
              authToken: req.user.auth.token,
              sessionCart: undefined,
              error_msg: '',
              success_msg: '',
            });
          } else {
            response.render('cart', {
              sub_title: "Shopping Cart",
              sub_title2: "",
              mainList: body.content,
              cartItems: cartBody.content.cartItemsList,
              userCart: cartBody.content,
              authToken: req.user.auth.token,
              sessionCart: undefined,
              error_msg: '',
              success_msg: '',
            });
          }

        }
      });

    } else {
      //console.log(req.session.cart)
      response.render('cart', {
        sub_title: "Shopping Cart",
        sub_title2: "",
        mainList: body.content,
        userCart: undefined,
        authToken: undefined,
        sessionCart: req.session.cart,
        error_msg: '',
        success_msg: '',
      });
    }
  });
})

router.get('/checkout_page', (req, response) => {
  //console.log('call /checkout_page')
  request({
    url: baseUrl + "/EcomCategory/DashboardView",
    method: 'GET',
    json: true
  }, function (err, res, dashBody) {
    // Check if there is a logged user or not 
    // //console.log(req.user)
    if (req.user != undefined) {
      request({
        url: baseUrl + "/CartRecord/GetCartImformations?customerCode=" + req.user.customer.customerCode,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + req.user.auth.token
        },
        json: true
      }, function (err, res, cartBody) {
        // Get available addresses of current customer
        request({
          url: baseUrl + "/CustomerAddress/Select?CustomerCode=" + req.user.customer.customerCode,
          method: 'GET',
          json: true
        }, function (err, res, addressBody) {
        //check if there any item with -not enough stock- status....
        // cartBody.content.cartItemsList.forEach(item => {
        //     if(item.status == "Stocks not Enough"){
        //       //console.log('cart cart ............')
              // response.redirect('/cart')
        //     }
        // });
          response.render('checkout', {
            sub_title: "Checkout",
            sub_title2: "",
            mainList: dashBody.content,
            userCart: cartBody.content,
            cartItems: cartBody.content.cartItemsList,
            customer: req.user.customer,
            addressList: addressBody.content,
            error_msg: '',
            success_msg: '',
          });

        })

      })

    } else {
      //console.log('no looged user.We can go with a guest user as well.')
      // Redirect to the login page.
      response.redirect('/auth/login/1')
    }

  })
})

module.exports = router;