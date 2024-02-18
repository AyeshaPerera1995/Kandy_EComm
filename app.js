const flash = require('connect-flash');
const passport = require('passport');
var path = require('path');

const express = require('express');
const session = require('express-session');
const cookieParser = require("cookie-parser");
// const cors = require('cors');
// const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

//------------ Passport Configuration ------------//
require('./config/passport')(passport);

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//------------ Express session Configuration ------------//
const time = 1000 * 60 * 60 * 12; //12 hours
app.use(
  session({
    secret: 'secretkeyboarddogfhrgfgrfrty84fwir7679',
    saveUninitialized:true,
    cookie: { maxAge: time },
    resave: false
  })
);

// cookie parser middleware
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static((__dirname + '/public')));

//------------ Passport Middlewares ------------//
app.use(passport.initialize());
app.use(passport.session()); 

//------------ Connecting flash ------------//
app.use(flash());

//------------ Global variables ------------//
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.current_user = req.user;
  res.locals.cart = req.session.cart
  next();
});

//------------ Routes ------------//
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/maincategory', require('./routes/maincategory'));
app.use('/product', require('./routes/product'));
app.use('/category', require('./routes/category'));
app.use('/subcategory', require('./routes/subcategory'));
app.use('/user', require('./routes/user'));
app.use('/cart', require('./routes/cart'));
app.use('/checkout', require('./routes/checkout'));


// 404 Error Page handling 
app.get('*', (req, res) =>{
  res.sendFile(__dirname+'/views/404.html');
});

// app.get('*', (req, res, next) =>{
//   res.locals.cart = req.session.cart;
//   next();
// });

const PORT = process.env.PORT || 5100;
app.listen(PORT, console.log(`Server running on PORT ${PORT}`));