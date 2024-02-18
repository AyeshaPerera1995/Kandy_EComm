const request = require('request');
const baseUrl = require('../config/key').baseUrl;

exports.getAllSearchResults = (req, response) => {
    const query = req.params.query;
    // //console.log(query)
    // Get Dropdown Main Category List 
    request({
        url: baseUrl + "/EcomCategory/DashboardView",
        method: 'GET',
        json: true
    }, function (err, res, body) {
        if (err) throw err;
        if (body.status == 'Success') {
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
                                response.render('advance_search', {
                                    sub_title: "Search Results",
                                    sub_title2: "",
                                    mainList: body.content,
                                    query: query,
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
                        response.render('advance_search', {
                            sub_title: "Search Results",
                            sub_title2: "",
                            mainList: body.content,
                            query: query,
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
            
        }
    });
}

// exports.addPrescription = (req, response) => {
//     const { main_category_name, accessToken, emp_code } = req.body;

    // request({
    //     url: baseUrl + "/EcomCategory",
    //     headers: {
    //         'Authorization': 'Bearer ' + accessToken
    //     },
    //     method: 'POST',
    //     body: {
    //         "id": null,
    //         "code": null,
    //         "name": main_category_name,
    //         "isActive": true,
    //         "isDeleted": false,
    //         "createdBy": emp_code,
    //         "createdDate": currentDateTime,
    //         "updatedBy": null,
    //         "updatedDate": null
    //     },
    //     json: true
    // }, function (err, res, body) {
    //     if (err) throw err;
    //     if (body.status == 'Success') {
    //         var success_msg = 'SUCCESS: Main category added successfully.';
    //         response.redirect('/maincategory/add?success_msg=' + encodeURIComponent(success_msg));
    //     } else {
    //         error_msg = 'Error! Please try again.';
    //         response.redirect('/maincategory/add?error_msg=' + encodeURIComponent(error_msg));
    //     }
    // });
// }