const request = require('request');
const baseUrl = require('../config/key').baseUrl;

exports.getSingleProductDetails = (req, response) => {
  const id = req.params.id;
  request({
    url: baseUrl + "/EcomCategory/DashboardView",
    method: 'GET',
    json: true
  }, function (err, res, body) {
    if (err) throw err;
    if (body.status == 'Success') {
      request({
        url: baseUrl + "/EcomProduct/GetStockDetailsWithStockId?Id=" + id,
        method: 'GET',
        json: true
      }, function (err, res, probody) {
        if (err) throw err;
        if (probody.status == 'Success') {
          // Get single page banner
          request({
            url: baseUrl + "/EcomBanner/Location/Single Product Page",
            method: 'GET',
            json: true
          }, function (err, res, bannerBody) {
            var userCart = undefined;
            var cartItems = undefined;
            // Get related main category stocks 
            request({
              url: baseUrl + '/EcomCategory/Products?ecomCategoryCode=' + probody.content.categoryCode + '&nextPage=1&rowCount=12&onlineAvailable=1',
              method: 'GET',
              json: true
            }, function (err, res, relatedProductsBody) {
              // Get Best Selling Products
              request({
                url: baseUrl + "/EcomBanner/Select/BestSelling",
                method: 'GET',
                json: true
              }, function (err, res, sellingProBody) {

                // *********************** Get random six products from main category ******************************F
                var relatedProducts = relatedProductsBody.content.List;

                // New array to store 6 randomly selected items
                var randomProductsArray = [];
                // Generate 6 unique random numbers between 0 and 11
                var randomIndexes = [];

                if (relatedProducts.length > 6) {
                  //console.log('more than 6')
                  while (randomIndexes.length < 6) {
                    var randomIndex = Math.floor(Math.random() * relatedProducts.length);
                    if (randomIndexes.indexOf(randomIndex) === -1) {
                      randomIndexes.push(randomIndex);
                    }
                  }
                  // Add the corresponding items from the original array to the new array
                  for (var i = 0; i < randomIndexes.length; i++) {
                    randomProductsArray.push(relatedProducts[randomIndexes[i]]);
                  }

                } else {
                  //console.log('less than 6')
                  randomProductsArray = relatedProducts
                }
                // *********************** Get random six products from main category ******************************
                //console.log("req.user " + req.user)
                if (req.user != undefined) {
                  //console.log('have user')
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
                    response.render('single_product', {
                      sub_title: "Single Product",
                      sub_title2: "",
                      mainList: body.content,
                      product: probody.content,
                      bannerFive: bannerBody.content[0],
                      relatedProducts: randomProductsArray,
                      bestSellingProducts: sellingProBody.content,
                      userCart: userCart,
                      cartItems: cartItems,
                      success_msg: '',
                      error_msg: ''
                    });
                  })
                } else {
                  //console.log('no user')
                  // //console.log(probody.content.description)
                  
                  response.render('single_product', {
                    sub_title: "Single Product",
                    sub_title2: "",
                    mainList: body.content,
                    product: probody.content,
                    bannerFive: bannerBody.content[0],
                    relatedProducts: randomProductsArray,
                    bestSellingProducts: sellingProBody.content,
                    userCart: userCart,
                    cartItems: cartItems,
                    success_msg: '',
                    error_msg: ''
                  });
                }
              })
            })

          });
        } else {
          //console.log('error when retriving single pro data from stock id...')
          response.redirect('/')
        }
      });
    } else {
      //console.log('error dashboard view')
      response.redirect('/')
    }
  });
}