window.processPayment = function (orderCode, orderTotal, hash) {
    // alert('in payhere')
    //console.log("***************************************************************************************")
    //console.log(orderCode)
    //console.log(orderTotal)
    //console.log(hash)
    var mobile = $('#delivery-mobile').text();
    //console.log(mobile)

        // call payhere 
        // PayHere ********************************************************************************************
        // Payment completed. It can be a successful failure.
        payhere.onCompleted = function onCompleted(orderId) {
            // alert('complete')
            //console.log("Payment completed. OrderID:" + orderId);
            // Note: validate the payment and show success or failure page to the customer
            window.location.href = "http://estore-dev.kandypharmacy.com/checkout/confirm_order/" + orderId;
        };

        // Payment window closed
        payhere.onDismissed = function onDismissed() {
            // alert('dismiss')
            // Note: Prompt user to pay again or show an error page
            //console.log("Payment dismissed");
        };

        // Error occurred
        payhere.onError = function onError(error) {
            // alert('error')
            // Note: show an error page
            //console.log("Error:" + error);
        };

        // Put the payment variables here
        var payment = {
            "sandbox": true,
            "merchant_id": "1222978",    // Replace your Merchant ID
            "return_url": "http://estore-dev.kandypharmacy.com/checkout/confirm_order/" + orderCode,     // Important
            "cancel_url": "http://estore-dev.kandypharmacy.com/auth/login/cancel",     // Important
            "notify_url": "http://estore-dev.kandypharmacy.com/auth/login/notify",
            "order_id": orderCode,
            "items": "",
            "amount": orderTotal,
            "currency": "LKR",
            "hash": hash, // *Replace with generated hash retrieved from backend
            "first_name": "",
            "last_name": "",
            "email": "",
            "phone": mobile,
            "address": "",
            "city": "",
            "country": "Sri Lanka",
            "delivery_address": "",
            "delivery_city": "",
            "delivery_country": "Sri Lanka",
            "custom_1": "",
            "custom_2": ""
        };
        // PayHere ********************************************************************************************

        // Show the payhere.js popup, when "PayHere Pay" is clicked
        payhere.startPayment(payment);

}