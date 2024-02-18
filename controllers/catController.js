const request = require('request');
const baseUrl = require('../config/key').baseUrl;

exports.getAllCatProducts = (req, response) => {
  const code = req.params.code;
  // Get Dropdown Main Category List 
  request({
    url: baseUrl + "/EcomCategory/DashboardView",
    method: 'GET',
    json: true
  }, function (err, res, body) {
    if (err) throw err;
    if (body.status == 'Success') {
      // Get Sub Category List    
      request({
        url: baseUrl + "/EcomSubCategory1/" + code + "/SubCategories",
        method: 'GET',
        json: true
      }, function (err, res, subcatbody) {
        if (err) throw err;
        // Get Category Name 
        request({
          url: baseUrl + "/EcomSubCategory1/" + code,
          method: 'GET',
          json: true
        }, function (err, res, catDatails) {
          if (err) throw err;
          // Get banner four
          request({
            url: baseUrl + "/EcomBanner/Location/Products Page",
            method: 'GET',
            json: true
          }, function (err, res, bannerBody) {

          // Get Best Selling Products
          request({
            url: baseUrl + "/EcomBanner/Select/BestSelling",
            method: 'GET',
            json: true
          }, function (err, res, sellingProBody) {

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
                  response.render('view_cat_products', {
                    sub_title: catDatails.content.Name,
                    sub_title2: catDatails.content.EcomCategoryName,
                    mainList: body.content,
                    subCatList: subcatbody.content,
                    catDatails: catDatails.content,
                    bannerFour: bannerBody.content[0],
                    bestSellingProducts : sellingProBody.content,
                    userCart: userCart,
                    cartItems: cartItems,
                    success_msg: '',
                    error_msg: ''
                  });
                }

              });
            } else {
              response.render('view_cat_products', {
                sub_title: catDatails.content.Name,
                sub_title2: catDatails.content.EcomCategoryName,
                mainList: body.content,
                subCatList: subcatbody.content,
                catDatails: catDatails.content,
                bannerFour: bannerBody.content[0],
                bestSellingProducts : sellingProBody.content,
                userCart: userCart,
                cartItems: cartItems,
                success_msg: '',
                error_msg: ''
              });
            }
          })
        })

        });

      });
    }
  });
}