const express = require('express');
const router = express.Router();
const request = require('request');
const baseUrl = require('../config/key').baseUrl;

router.get('/my_cart/:id&:code&:qty', (req, response) => {
    var stock_id = req.params.id;
    var code = req.params.code;
    var quantity = req.params.qty;
    var unit_price = 0.0;
    var discount = 0.0;
    // Get current date
    const currentDate = new Date().toISOString()
        .replace(/T/, ' ') // replace T separator with a space
        .replace(/Z/, ' ') // replace Z with a space
        // .replace(/\..+/, '') // remove the milliseconds
 
    // check if the user is logged or not
    if(req.user == undefined){
        // Add Items for Session Cart ..................................................
        //console.log('add to session cart...')
        // Get data by stock id ........................................................
        request({
            url: baseUrl + "/EcomProduct/GetStockDetailsWithStockId?Id="+stock_id,
            method: 'GET',
            json: true
        }, function (err, res, stockbody) {
            unit_price = stockbody.content.unitSellingPrice;
            // check if the discount is expired or not
            if(stockbody.content.discountTo > currentDate){
                discount = (stockbody.content.discountPercentage/100)*stockbody.content.unitSellingPrice;
            }
            //console.log("currentDate: "+currentDate)
            //console.log("discount: " +discount)
            const cart = req.session.cart || {}; 

        if (cart[stock_id]) {
            //console.log('update cart')
            cart[stock_id].quantity += parseFloat(quantity);
            cart[stock_id].total_price = cart[stock_id].unit_price * cart[stock_id].quantity;
            cart[stock_id].total_discount = cart[stock_id].unit_discount * cart[stock_id].quantity;
        } else {
            cart[stock_id] = {
                stock_id: stock_id,
                unit_price: unit_price - discount,
                unit_discount: discount,
                quantity: parseFloat(quantity),
                total_price:  parseFloat(unit_price - discount) * parseFloat(quantity),
                total_discount: parseFloat(discount) * parseFloat(quantity),
                image: stockbody.content.imageURLList[0],
                name: stockbody.content.stockProductName
            };
        }
        req.session.cart = cart;       
        // //console.log(cart)
        // //console.log(Object.keys(cart).length)
        if(code.startsWith("ECAT")){   //main category
            //console.log('in main cat')
            response.redirect('/maincategory/viewMainCatProducts/'+code)  
        }else if(code.startsWith("ESB1")){  //category
            //console.log('in cat')
            response.redirect('/category/viewCatProducts/'+code)   
        }else if(code.startsWith("ESB2")){  //sub category
            //console.log('in sub cat')
            response.redirect('/subcategory/viewSubCatProducts/'+code)  
        }else if(code == 'single_prduct'){
            //console.log('in single page')
            response.redirect('/product/single_product/'+stock_id)  
        }else{
            //console.log('search results')
            response.redirect('/advance_search/result/'+code)  
        }

        });
        
    }else{
        // Add Item to User Cart ...................................................... 
        //console.log('add to normal user cart...')
        request({
            url: baseUrl + "/CartItem/Insert",
            headers: {
                'Authorization': 'Bearer ' + req.user.auth.token
            },
            method: 'POST',
            body: {
                "id": 0,
                "ecomStockId": stock_id,
                "unitPrice": 0,
                "quantity": quantity,
                "customerCode": req.user.customer.customerCode,
                "cartRecordId": "",
                "name": "",
                "status": "",
                "discount": 0,
                "image": "",
                "isDeleted": true,
                "createdDate": "",
                "updatedDate": ""
            },
            json: true
        }, function (err, res, insertCartBody) {
            if (err) throw err;
            if (insertCartBody.status == 'Success') {
                //console.log('add to cart success')
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
                var cus_code = insertCartBody.content.customerCode;
                // Get available Cart Items from customerCode
                request({
                    url: baseUrl + "/CartRecord/GetCartImformations?customerCode="+cus_code,
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + req.user.auth.token
                    },
                    json: true
                  }, function (err, res, cartBody) {
                    var userCart = undefined;
                    var cartItems = undefined;
                    //console.log("cart length: "+cartBody.content.cartItemsList.length)
                    if(cartBody.status = "Success"){
                         // Get Best Selling Products
                        request({
                            url: baseUrl + "/EcomBanner/Select/BestSelling",
                            method: 'GET',
                            json: true
                        }, function (err, res, sellingProBody) {
                        if (cartBody.status == "Success" & cartBody.message == "user don't have a cart saved") {
                            userCart = undefined;
                            cartItems = undefined;
                        } else {
                            userCart = cartBody.content;
                            cartItems = cartBody.content.cartItemsList;
                        }
                        if(code.startsWith("ECAT")){
                            //console.log('in main cat')
                // Get Category List    
                request({
                    url: baseUrl + "/EcomCategory/" + code + "/SubCategories",
                    method: 'GET',
                    json: true
                }, function (err, res, subcat1body) {
                    if (err) throw err;
                        // Get Main Category Name 
                        request({
                            url: baseUrl + "/EcomCategory/" + code,
                            method: 'GET',
                            json: true
                        }, function (err, res, mainCatDetails) {
                            if (err) throw err;
                            response.render('view_maincat_products', {
                                sub_title: mainCatDetails.content.name,
                                sub_title2: "",
                                mainList: body.content,
                                catList: subcat1body.content,
                                mainCatDetails: mainCatDetails.content,
                                bannerFour: bannerBody.content[0],
                                bestSellingProducts : sellingProBody.content,
                                userCart: userCart,
                                cartItems: cartItems,
                                success_msg: '',
                                error_msg: ''
                            });
                        });
                });
                                                  
                        }else if(code.startsWith("ESB1")){ 
                            //console.log('in cat')
                    // Get Sub Category List    
                    request({
                        url: baseUrl + "/EcomSubCategory1/" + code + "/SubCategories",
                        method: 'GET',
                        json: true
                    }, function (err, res, subcat2body) {
                        if (err) throw err;
                            request({
                                url: baseUrl + "/EcomSubCategory1/" + code,
                                method: 'GET',
                                json: true
                            }, function (err, res, catDatails) {
                                if (err) throw err;
                                response.render('view_cat_products', {
                                    sub_title: catDatails.content.Name,
                                    sub_title2: "",
                                    mainList: body.content,
                                    subCatList: subcat2body.content,
                                    catDatails: catDatails.content,
                                    bannerFour: bannerBody.content[0],
                                    bestSellingProducts : sellingProBody.content,
                                    userCart: userCart,
                                    cartItems: cartItems,
                                    success_msg: '',
                                    error_msg: ''
                                });
                            });
                    });
                            
                        }else if(code.startsWith("ESB2")){ //sub category
                            //console.log('in sub cat')
                            request({
                                url: baseUrl + "/EcomSubCategory2/" + code,
                                method: 'GET',
                                json: true
                            }, function (err, res, subCatDatails) {
                                if (err) throw err;
                                response.render('view_subcat_products', {
                                    sub_title: subCatDatails.content.Name,
                                    sub_title2: "",
                                    mainList: body.content,
                                    subCatDatails: subCatDatails.content,
                                    bannerFour: bannerBody.content[0],
                                    bestSellingProducts : sellingProBody.content,
                                    userCart: userCart,
                                    cartItems: cartItems,
                                    success_msg: '',
                                    error_msg: ''
                                });
                            });
                        }else if(code == 'single_prduct'){
                            //console.log('in single page')
                            // Get single page banner
                            request({
                                url: baseUrl + "/EcomBanner/Location/Single Product Page",
                                method: 'GET',
                                json: true
                            }, function (err, res, singleBannerBody) {
                                request({
                                    url: baseUrl + "/EcomProduct/GetStockDetailsWithStockId?Id=" + stock_id,
                                    method: 'GET',
                                    json: true
                                  }, function (err, res, probody) {
                                    if (err) throw err;

                        // Get related main category stocks 
                        request({
                            url: baseUrl + '/EcomCategory/Products?ecomCategoryCode=' + probody.content.categoryCode + '&nextPage=1&rowCount=12&onlineAvailable=1',
                            method: 'GET',
                            json: true
                        }, function (err, res, relatedProductsBody) {

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
              
              // Get Best Selling Products
              request({
                url: baseUrl + "/EcomBanner/Select/BestSelling",
                method: 'GET',
                json: true
              }, function (err, res, sellingProBody) {
                                response.render('single_product', {
                                    sub_title: "Single Product",
                                    sub_title2: "",
                                    mainList: body.content,
                                    product: probody.content,
                                    bannerFive: singleBannerBody.content[0],
                                    relatedProducts: randomProductsArray,
                                    bestSellingProducts: sellingProBody.content,
                                    userCart: userCart,
                                    cartItems: cartItems,
                                    success_msg: '',
                                    error_msg: ''
                                  });
                                })
                        })

                                })                               
                            });
                        }else{
                            response.render('advance_search', {
                                sub_title: "Search Results",
                                sub_title2: "",
                                mainList: body.content,
                                query: code,
                                bannerFour: bannerBody.content[0],
                                bestSellingProducts : sellingProBody.content,
                                userCart: userCart,
                                cartItems: cartItems,
                                success_msg: '',
                                error_msg: ''
                            }); 
                        }
                    });
                    }
                    
                  });
            });
}
});
            }else{
                //console.log(insertCartBody)
            }
        });
    
    }
})

router.get('/update_session_cart/:id&:qty', (req, response) => {
    var stock_id = req.params.id;
    var quantity = req.params.qty;
            // Get data by stock id ........................................................
            request({
                url: baseUrl + "/EcomProduct/GetStockDetailsWithStockId?Id="+stock_id,
                method: 'GET',
                json: true
            }, function (err, res, stockbody) {
                unit_price = stockbody.content.unitSellingPrice;
                const cart = req.session.cart || {}; 
    
            if (cart[stock_id]) {
                //console.log('update cart')
                cart[stock_id].quantity = parseFloat(quantity);
                cart[stock_id].total_price = cart[stock_id].unit_price * cart[stock_id].quantity;
                cart[stock_id].total_discount = cart[stock_id].unit_discount * cart[stock_id].quantity;
            } 
            req.session.cart = cart;       
            response.sendStatus(200) 
    
            });

            
})

router.get('/remove_cart_item/:id/:tag', (req, response) => {
    var tag = req.params.tag;
    var stock_id = req.params.id;

    if(tag == 'cart'){
        console.log('cart tag')
        const cart = req.session.cart || {};     
        if (cart[stock_id]) {
            delete cart[stock_id];
        } 
        req.session.cart = cart;   
        response.send(tag)    
    }
    else if(tag == 'userCart'){
        console.log('userCart tag')
        console.log(stock_id)

        request({
            url: baseUrl + "/CartItem/Delete?id=" + stock_id,
            method: 'DELETE',
            headers: {
              'Authorization': 'Bearer ' + req.user.auth.token
            },
            json: true
          }, function (err, res, cartBody) {
            console.log(cartBody)
            if (cartBody.status == "Success") {
                response.send(tag)  
            }
            
          })
    }
           
})

router.get('/get_updated_cart_data/:tag', (req, response) => {
    var tag = req.params.tag;
    var userCart;

    if(tag == 'cart'){
        response.send(JSON.stringify(req.session.cart));    
    }
    else if(tag == 'userCart'){
         request({
            url: baseUrl + "/CartRecord/GetCartImformations?customerCode=" + req.user.customer.customerCode,
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + req.user.auth.token
            },
            json: true
          }, function (err, res, cartBody) {
            userCart = cartBody.content;
            response.send(JSON.stringify(userCart)); 
          })   
    }
      
})

router.get('/clear_session_cart', (req, response) => {
    //console.log('clear cart')
    req.session.cart = {};      
    response.sendStatus(200)           
})

router.get('/wish_list/:id&:code', (req, response) => {
    var stock_id = req.params.id;
    var code = req.params.code;
    //console.log("user " +req.user);  //console.log(stock_id); //console.log(code);
    // check if the user is logged or not
    // if(req.user == undefined){
    //     // you have to pass the stock id with this url for saving the wish list item.
    //     // After adding to the wish list, that icon should be colored with red.
    //     response.redirect('/auth/login');
    // }else{

        if(code.startsWith("ECAT")){ //main category
            response.redirect('/maincategory/viewMainCatProducts/'+code)  
        }else if(code.startsWith("ESB1")){ //category
            response.redirect('/category/viewCatProducts/'+code)   
        }else if(code.startsWith("ESB2")){ //sub category
            response.redirect('/subcategory/viewSubCatProducts/'+code)  
        }else{
            response.redirect('/product/single_product/'+stock_id)  
        }
    
    // }
})

module.exports = router






// router.get('/my_cart/:id&:code', (req, response) => {
//     var id = req.params.id;
//     var code = req.params.code;
//     // Get product details by id 
//     request({
//         url: baseUrl + "/EcomProduct/" + id,
//         method: 'GET',
//         json: true
//     }, function (err, res, probody) {
//         if (err) throw err;
        
//         if(typeof req.session.cart == "undefined"){
//             req.session.cart = [];
//             req.session.cart.push(
//                 { id: id, name: probody.content.name, price: 100, qty: 1}
//             );
//         }else{
//             var cart =  req.session.cart;
//             var newItem = true;
//             for (var i = 0; i < cart.length; i++) {
//                 if(cart[i].id == id){
//                     cart[i].qty++;
//                     cart[i].price = cart[i].price * cart[i].qty
//                     newItem = false;
//                     break;
//                 }          
//             }
//             if(newItem){
//                 cart.push(
//                     { id: id, name: probody.content.name, price: 100, qty: 1}
//                 );
//             }
//         }
//         //console.log(req.session.cart)
//         response.redirect('/maincategory/viewMainCatProducts/'+code)
//     })
// })