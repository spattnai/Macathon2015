var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
//get EBAY API to work
var ebay = require('ebay-api');

//get Best Buy API to work
var bby = require('./node_modules/bestbuy/index').init('heqqmenhew4q38ea8xwmkgdp');

//routes

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//EBAY params and authentication
var params = {};
params.keywords = [ "Apple Macbook Pro" ];
params['paginationInput.entriesPerPage'] = 10;
ebay.ebayApiGetRequest({
    serviceName: 'FindingService',
    opType: 'findItemsByKeywords',
    appId: 'Shivangi-70f0-4acf-bf10-b50b7524aa6a',      // FILL IN YOUR OWN APP KEY, GET ONE HERE: https://publisher.ebaypartnernetwork.com/PublisherToolsAPI
    params: params,
    //filters: filters,
    parser: ebay.parseItemsFromResponse    // (default)
  },
  // gets all the items together in a merged array
  function itemsCallback(error, items) {
    if (error) throw error;
    //console.log(items);

    console.log('Found', items.length, 'items');
    
    for (var i = 0; i < items.length; i++) {
      console.log(items[i].topRatedListing);
      console.log('- ' + items[i].title+'-'+items[i].galleryURL+'-'+items[i].viewItemURL+'-'+items[i].shippingInfo.shippingType+'-'+items[i].sellingStatus.currentPrice.USD+items[i].listingInfo.listingType);

    }  
  }
);

//Best Buy queries and JSON response
//Product search for all top rated items, show name + sale price + customer review avg + imageURL
bby.products('search=macbook&search=pro&customerTopRated=true', {
    show: 'name,salePrice,customerReviewAverage,image'
}, function(err, data) {
    console.log('Product Search result number one:');
    for (var i = data.products.length - 1; i >= 0; i--) {
        console.log(data.products[i]);
    };
    // console.log(data.products[0]);
    //console.log('Not Found');
});

http.get("http://api.walmartlabs.com/v1/search?apiKey=53aggp3twp6f2e7eb98xghwq&query=Apple%20Macbook%20Pro&count=5&sort=relevance", function(res,body) {
  console.log("Got response: " + res.statusCode);
    var body='';
    //console.log(res.on("data"));
    res.on('data', function(d){
        body+= d;
    });
    res.on('end', function() {
        var parsed = JSON.parse(body);
        var item=parsed.items;
        console.log("Response from Walmart");
        for(var i in item){
            console.log(item[i].name+'-'+item[i].salePrice+'-'+item[i].sellerInfo+'-'+item[i].productTrackingUrl);
        }

        });
    
    
    /*
    console.log(res.parser);
    var arrg = JSON.parse(res.body);
    var item=arrg.res;
    console.log("Top results on Walmart");
    for(var i in item){
        console.log(item[i].name+'-'+item[i].salePrice+'-'+item[i].sellerInfo+'-'+item[i].productTrackingUrl);
    }
  }*/
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});

module.exports = app;


