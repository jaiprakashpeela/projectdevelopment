// import all the modules you need
const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const bodyParser = require('body-parser')
const {check, validationResult} = require('express-validator');
const { Console } = require("console");
const { match } = require('assert');

// database conection with database name assignment4
mongoose.connect("mongodb://localhost:27017/assignment4", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// set up the model for one Order
const Order = mongoose.model("Order", {
  Name: String,
  Email: String,
  Phone: Number,
  Address: String,
  Iphone12: Number,
  MacBookM2 : Number, 
  AirpodGen2 : Number, 
  Tax: Number ,
  Totalcost: Number
 });
var myApp = express();

// set up default location for files 
myApp.use(express.urlencoded({extended:false}));
myApp.set('view engine', 'ejs');
myApp.set('views', path.join(__dirname, 'views')); // set a value for express
myApp.use(express.static(__dirname + '/public')); // set up a middleware to server static files
myApp.get('/',function(req, res){
    res.render('form')
})

// handle post
myApp.post('/', [
    check('name', 'Name is required').notEmpty(),
    check('address','Address cannot be blank').notEmpty(),
    check('city','Enter a City').notEmpty(),
    check('province','Select a Province').notEmpty(),
    check('phone', 'InValid Phone Number')
    .notEmpty()
    .matches(/^\d{10}$/),
    check('email', 'InValid Email Format').isEmail()

], function(req, res){

    const errors = validationResult(req);
    if(errors.isEmpty()){ // if no errors are there
        var iphoneqty = req.body.iphoneqty;
        var macbookqty = req.body.macbookqty;
        var airpodqty = req.body.airpodqty;
        var province = req.body.province;
        const onatrioTax = 0.13 ;
        const britishColumbiaTax = 0.05;
        const quebecTax= 0.05;
        const newBrunswickTax=0.15;
        var totalCost = iphoneqty * 500 + macbookqty * 1000 + airpodqty * 100;
        var tax=0;
        // tax calculations
        switch (province)
        {
            case "ON" :
                tax = totalCost*onatrioTax;
                totalCost+= tax;
                break;
            case "BC":
                tax = totalCost*britishColumbiaTax;
                totalCost+= tax;
                break;  
            case "NB":
                tax = totalCost*newBrunswickTax;
                totalCost+= tax;
                break;
            case "QU":
                tax = totalCost*quebecTax;
                totalCost+= tax;
                break;
            default :
                totalCost+= totalCost*0;
            }
        if(totalCost == 0){
            var itemsList ={
                'recipt' : false     
            }
            res.render('form', { itemsList})
        }
        else
        {
            // prepare data to send to the view
            
            var pageData = {
                'recipt': true,
                'totalCost' : totalCost,
                'tax' : tax
            }
            if(iphoneqty>0)
            {
                pageData.iphone = iphoneqty * 500;
            }
            else{pageData.iphone = 0;}
            if(macbookqty>0)
            {
                pageData.macbook = macbookqty * 1000;
            }else{pageData.macbook = 0;}
            if(airpodqty>0)
            {
                pageData.airpod = airpodqty * 100;
            }else{pageData.airpod = 0;}
            res.render('form', {
                userdata : req.body,
                itemsList : pageData
            });
        }
        var dbdata= 
        {
            Name: req.body.name, 
            Email: req.body.email ,
            Phone: req.body.phone ,
            Address: (req.body.address +", "+ req.body.city +", " +req.body.province ),
            Iphone12:  pageData.iphone, 
            MacBookM2 : pageData.macbook, 
            AirpodGen2 : pageData.airpod, 
            Tax: pageData.tax ,
            Totalcost: pageData.totalCost 
        }
        var allOrder = new Order(dbdata);
      allOrder.save();
    }
    else{ // errors display
        console.log(errors.array());
        res.render('form', {errors: errors.array()})
    }

})

// define the route for all orders  page "/"
myApp.get("/orders", function (req, res) 
{
    Order.find({}, function (err, orders) 
    {
      res.render("allOrders", { orders: orders });
    });
  });

// start the server (listen at a port)
myApp.listen(8080);
console.log('Everything executed, open http://localhost:8080/ in the browser.')