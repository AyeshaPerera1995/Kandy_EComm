const express = require('express');
const router = express.Router();
const request = require('request');
const { baseUrl, merchantSecret } = require('../config/key');
const md5 = require('crypto-js/md5');
const { ensureAuthenticated } = require('../config/checkAuth')

const { Storage } = require("@google-cloud/storage");
const Multer = require("multer");

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // No larger than 5mb, change as you need
    },
});

// cloud storage config -----------------------------------------------------------------------------------------
let projectId = "kandy-ecom-dev"; // Get this from Google Cloud
let keyFilename = "config/mykey.json"; // Get this from Google Cloud -> Credentials -> Service Accounts
const storage = new Storage({
    projectId,
    keyFilename,
});
const bucket = storage.bucket("prescriptions_bucket_3"); // Get this from Google Cloud -> Storage
// cloud storage config -----------------------------------------------------------------------------------------
var imgList = [];

router.post("/place_order", multer.single("imgFile"),ensureAuthenticated, (req, response) => {
    const { address, date, note, pay_method, sub_total, total_discount, shipping, order_total, order_items, imgListLength, current_element } = req.body;
    const accessToken = req.user.auth.token;
    // //console.log("edited: " + order_total)
    // upload images to cloud storage 
    try {
        if (req.file) {
            // add imgUrls 
            imgList.push(req.file.originalname);
            //console.log("File found, trying to upload...");
            const blob = bucket.file(req.file.originalname);
            const blobStream = blob.createWriteStream();
            blobStream.on("finish", () => {
                // response.status(200).send("Success");
                //console.log("Upload Img Success");
            });
            blobStream.end(req.file.buffer);
        }
    } catch (error) {
        response.status(500).send(error);
    }

    if (imgListLength == current_element) {
        //console.log("add order info...........")
        // //console.log(imgList)
        //console.log(JSON.parse(order_items))

        request({
            url: baseUrl + "/CustomerOrder/OrderInsert",
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            method: 'POST',
            body: {
                "customerCode": req.user.customer.customerCode,
                "subTotal": sub_total,
                "total": order_total,
                "totalDiscount": total_discount,
                "orderDiscount": 0,
                "paymentMethod": pay_method,
                "billingAddress": address,
                "shippingAddress": address,
                "deliveryDate": date,
                "deliveryNote": note,
                "shippingFees": shipping,
                "tax": 0,
                "prescription": imgList,
                "orderItems": JSON.parse(order_items)
            },
            json: true
        }, function (err, res, body) {
            // //console.log(body)
            if (err) throw err;
            if (body.status == 'Success') {
                //console.log('order data inserted.....')
                // //console.log(body.content)
                imgList = [];
                // //console.log("correct: " + body.content.CustomerOrder.total)

                // Generate hash value 
                let merchant_secret = merchantSecret;  
                let merchantId = '1222978';
                let orderId = body.content.CustomerOrder.orderCode;
                let amount = body.content.CustomerOrder.total;
                let hashedSecret = md5(merchant_secret).toString().toUpperCase();
                let amountFormated = parseFloat(amount).toLocaleString('en-us', { minimumFractionDigits: 2 }).replaceAll(',', '');
                let currency = 'LKR';
                let hash = md5(merchantId + orderId + amountFormated + currency + hashedSecret).toString().toUpperCase();
                //console.log('merchantSecret: ' + merchant_secret)
                //console.log('merchantId: ' + merchantId)
                //console.log('orderId: ' + orderId)
                //console.log('amount: ' + amount)
                //console.log('hashedSecret: ' + hashedSecret)
                //console.log('amountFormated: ' + amountFormated)
                //console.log('hash: ' + hash)

                // Check the order has, any out of stocks item (status) ...........................................
                if (body.content.CustomerOrder.status == "Pending") {
                    if (body.content.CustomerOrder.paymentMethod == 'card') {
                        //console.log('Pending status - card payment')
                        response.setHeader("Hash", JSON.stringify(hash))
                        response.setHeader("CustomerOrder", JSON.stringify(body.content.CustomerOrder))
                        response.sendStatus(200)

                    } else {
                        //console.log('Pending status - cash payment')
                        response.setHeader("CustomerOrder", JSON.stringify(body.content.CustomerOrder))
                        response.sendStatus(201)
                    }
                } else {
                    //console.log('Stocks not Enough status')
                    response.setHeader("Hash", JSON.stringify(hash))
                    response.setHeader("CustomerOrder", JSON.stringify(body.content.CustomerOrder))
                    response.setHeader("OrderItems", JSON.stringify(body.content.CustomerOrder.orderItems))
                    response.sendStatus(202)
                }

            } else {
                //console.log('Error.....')
                imgList = [];
                response.sendStatus(500)
            }
        });
    }
});

router.get('/delete_outOfStocks_items/:id', ensureAuthenticated, (req, response) => {
    //console.log('delete items: order id: ' + req.params.id)
    var order_code = req.params.id;
    const accessToken = req.user.auth.token;
    request({
        url: baseUrl + "/CustomerOrder/Delete/StockNotEnough/OrderItems?OrderCode=" + order_code,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        method: 'POST',
        json: true
    }, function (err, res, orderBody) {
        // //console.log(orderBody)
        if (orderBody.content.paymentMethod == 'cash') {
            //console.log('cash')
            response.redirect('/checkout/confirm_order/' + order_code)
        } else if (orderBody.content.paymentMethod == 'card') {
            //console.log('card')

            // *******************************************************************************************************
            request({
                url: baseUrl + "/EcomCategory/DashboardView",
                method: 'GET',
                json: true
            }, function (err, res, dashBody) {
                // Check if there is a logged user or not 
                if (req.user != undefined) {
                    request({
                        url: baseUrl + "/CustomerOrder/GetWithOrderCode?OrderCode=" + order_code,
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer ' + req.user.auth.token
                        },
                        json: true
                    }, function (err, res, orderBody) {
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
                                var cartArray = cartBody.content.cartItemsList;
                                var orderArray = orderBody.content.orderItems;
                                //console.log(cartArray)
                                //console.log("-----------------------------------------------------------------")
                                //console.log(orderArray)
                                //console.log("-----------------------------------------------------------------")
                                const matchingItems = cartArray.filter(cartItem => {
                                    const ecomStockId = cartItem.ecomStockId;
                                    const matchingCartItem = orderArray.find(orderItem => String(orderItem.ecomStockId) === ecomStockId);
                                    return matchingCartItem !== undefined;
                                });
                                //console.log("-----------------------------------------------------------------")
                                //console.log(matchingItems);

                                response.render('checkout_next', {
                                    sub_title: "Checkout",
                                    sub_title2: "",
                                    mainList: dashBody.content,
                                    userCart: cartBody.content,
                                    orderCart: orderBody.content,
                                    cartItems: matchingItems,
                                    customer: req.user.customer,
                                    addressList: addressBody.content,
                                    error_msg: '',
                                    success_msg: 'Your cart Updated. Check the order details.',
                                });
                            })
                        })
                    })

                } else {
                    //console.log('no looged user.')
                    // Redirect to the login page.
                    response.redirect('/auth/login/1')
                }
            })
        }
    })
})

router.get('/confirm_order/:id', ensureAuthenticated, (req, response) => {
    //console.log('confirm_order: order id: ' + req.params.id)
    var order_id = req.params.id;
    const accessToken = req.user.auth.token;
    request({
        url: baseUrl + "/CustomerOrder/PaymentConfirmInsert?order=" + order_id,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        method: 'POST',
        json: true
    }, function (err, res, body) {
        //console.log(body)
        if (err) throw err;
        response.render('confirm_order', {
            orderId: order_id
        })
    })
})

router.get('/generate_hash/:code&:total', (req, response) => {
    //console.log('generate_hash')
    var code = req.params.code;
    var total = req.params.total;
    //console.log(code, total)

    let merchant_secret = merchantSecret;                  
    let merchantId = '1222978';
    let orderId = code;
    let amount = total;
    let hashedSecret = md5(merchant_secret).toString().toUpperCase();
    let amountFormated = parseFloat(amount).toLocaleString('en-us', { minimumFractionDigits: 2 }).replaceAll(',', '');
    let currency = 'LKR';
    let hash = md5(merchantId + orderId + amountFormated + currency + hashedSecret).toString().toUpperCase();

    response.setHeader("Hash", JSON.stringify(hash))
    response.sendStatus(200)
})

router.get('/order_invoice/:id', (req, response) => {
    var order_code = req.params.id;
    const accessToken = req.user.auth.token;

    request({
        url: baseUrl + "/CustomerOrder/Invoice/Order?orderCode=" + order_code,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        json: true
    }, function (err, res, orderBody) {
        // Get Customer Info
        request({
            url: baseUrl + "/Customer/Select/CustomerCode?code=" + orderBody.content.customerCode,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            json: true
        }, function (err, res, cusBody) {
            response.render('order_invoice',{
                orderDetails : orderBody.content,
                customerDetails : cusBody.content
            });
        })
    })
})


module.exports = router