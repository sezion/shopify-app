var app         = require('../shopify_app');
var url         = require('url');
var request     = require('request');
var shopifyAPI  = require('shopify-node-api');

// Get /
// 
// if we already have an access token then redirect to render the app, otherwise
// redirect to app authorisation.

exports.index = function (req, res){
  if (!req.session.oauth_access_token) {
    var parsedUrl = url.parse(req.originalUrl, true);
    if (parsedUrl.query && parsedUrl.query.shop) {
      req.session.shopUrl = 'https://' + parsedUrl.query.shop;
    }

    res.redirect('/auth_app');
  }
  else {
    res.redirect('/sezion_app');
  }
};


// Get /sezion_app
// 
// render the main app view

exports.renderApp = function (req, res){
  var parsedUrl = url.parse(req.originalUrl, true);
  console.log("REQ PARAMS: ", parsedUrl.query);
  
  //In case server stops and starts again, check if we need the auth token again
  if (!req.session.oauth_access_token) {
    if (parsedUrl.query && parsedUrl.query.shop) {
      req.session.shopUrl = 'https://' + parsedUrl.query.shop;
    }

    res.redirect('/auth_app');
  }
  else {
    //Using the shopify node.js library to make the calls to Shopify. This var is the configuration object.
    var Shopify = new shopifyAPI({
                    shop: req.session.shopUrl.split('//')[1],
                    shopify_api_key: app.nconf.get('oauth:api_key'),
                    shopify_shared_secret: app.nconf.get('oauth:client_secret'),
                    access_token: req.session.oauth_access_token,
                    verbose: false
                });
    
    //If the user enters the app by the app's menu, then 'app_view' is rendered.
    //If the user enters directly from Products view in their shop admin, then 'from_product' is rendered.
    
    if (parsedUrl.query.ids) {
      //Send the product to the view, getting it using it's ID
      Shopify.get("/admin/products/"+parsedUrl.query.ids+".json", function (err, data, headers) {
        var products = new Array();
        products.push(data.product);
        console.log("GET: ", JSON.stringify(products));
        
        res.render('from_product', {
          apiKey: app.nconf.get('oauth:api_key'),
          shopUrl: req.session.shopUrl,
          products: products
        });
      });
    }
    else if (parsedUrl.query['ids[]']){
      //More than one product was selected. Get all the products and search for the ones I have their ID
      var n_products = parsedUrl.query['ids[]'].length;
      var products = new Array();
      Shopify.get("/admin/products.json", function (err, data, headers) {
        if (err) console.log("IDS[] ERR: ", err);
        //Search for the products I received
        for (var i=0; i<n_products; i++) {
          var prod = parsedUrl.query['ids[]'][i];
          var find = false;
          var j=0;
          while (!find &&  j<data.products.length) {
            if (data.products[j].id == prod) {
              products.push(data.products[j]);
              find = true;
            }
            j++;
          }
        }
        
        console.log("GET: ", JSON.stringify(products));
        res.render('from_product', {
          apiKey: app.nconf.get('oauth:api_key'),
          shopUrl: req.session.shopUrl,
          products: products
        });
      });
    }
    else {
      //Get all products to show them in a multiple select
      Shopify.get("/admin/products.json", function (err, data, headers) {
        console.log("GET: ", JSON.stringify(data));
        res.render('app_view', {
          title: 'Configuration',
          apiKey: app.nconf.get('oauth:api_key'),
          shopUrl: req.session.shopUrl,
          products: data.products
        });
      });
    }
  }
};