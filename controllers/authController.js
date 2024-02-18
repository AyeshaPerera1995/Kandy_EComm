const passport = require('passport');
const request = require('request');
const baseUrl = require('../config/key').baseUrl;

//Login Handle
exports.loginHandle = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login/1',
        failureFlash: true
    })(req, res, next);
}

exports.registerCustomer = (req, response) => {
    const { firstname, lastname, mobile, email, password, confirmpassword } = req.body;
    var error_msg = '';

    if (password != confirmpassword) {
        error_msg = 'Passwords are not matched!';
    }

    if (error_msg != '') {
        // response.redirect('/auth/register?error_msg=' + encodeURIComponent(error_msg));  
    } else {
    request({
        url: baseUrl + "/Customer",
        method: 'POST',
        body: {
            "isActive": true,
            "isDeleted": false,
            "createdBy": null,
            "createdDate": Date.now,
            "updatedBy": null,
            "updatedDate": null,
            "id": null,
            "customerCode": "",
            "title": "title",
            "firstName": firstname,
            "lastName": lastname,
            "gender": null,
            "dateOfBirth": null,
            "phone": mobile,
            "email": email,
            "address": null,
            "loyaltyPoints": null,
            "isBlacklisted": false,
            "registered_From": null,
            "isECommerceRegistered": true,
            "username": email,
            "password": password
        },
        json: true
    }, function (err, res, body) {
        //console.log(body)
        if(err) throw err;
            if (body.status =='Success') {
                response.redirect('/auth/login/1');
                // var success_msg = 'SUCCESS: Account created successfully.';
                // response.redirect('/auth/register?success_msg=' + encodeURIComponent(success_msg));
            }else{
                error_msg = 'Error! Please try again.';
                response.redirect('/auth/register?error_msg=' + encodeURIComponent(error_msg));               
            }
    });

    }
}

//------------ Logout Handle ------------//
exports.logoutHandle = (req, res) => {
    //console.log('in logout....................')
    res.clearCookie("accToken");
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
}
















// exports.createUser = (req, resp) => {
//     const { fname, lname, username, user_type, password, cpassword, accessToken } = req.body;
//     var error_msg = '';

//     //console.log(req.body);

//     //------------ Checking required fields ------------//
//     if (!fname || !lname || !username || !user_type || !password || !cpassword) {
//         error_msg = 'Please fill required fields.';
//     }

//     if (error_msg != '') {
//         resp.render('add_user', {
//             title: 'Add Information',
//             sub_title: 'New User',
//             error_msg: error_msg
//         });
//     } else {

//         request({
//             headers: {
//                 'AccessToken': accessToken
//             },
//             url: baseUrl+"/User/UserRegistration",
//             method: 'POST',
//             body:{
//                 "user_name":username,
//                 "first_name":fname,
//                 "last_name":lname,
//                 "contact_number":"",
//                 "email":"",
//                 "user_type":user_type,
//                 "password":password
//             },
//             json: true
//           }, function (err, res, body) {
//             if(err) throw err;
//             //console.log(body);
//             if (body.response.Status =='Fail') {
//                 //console.log(body.response.Details);
//                 error_msg = 'Error! Please try again.';
//                 resp.render('add_user',{error_msg: error_msg, sub_title: 'New User', title: 'Add Information'});
//             }else{
//                 //console.log('else');
//                 resp.render('add_user',{success_msg: 'User saved successfully.', sub_title: 'New User', title: 'Add Information'});
//             }
//           });

//     }
// }

