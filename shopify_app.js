var express     = require ('express');
var routes      = require ('./routes');
var shopifyAuth = require ('./routes/shopify_auth');
var nconf       = require ('nconf');
var path        = require ('path');
var fs          = require('fs');
var https       = require ('https');

var confFile;

/*
 * The skeleton of this app was created following this tutorial: http://blog.codezuki.com/blog/2014/02/10/shopify-nodejs
 * There are the steps needed to authenticate the user (the difficult part)
 * 
 * To execute: $ node shopify_app.js -c etc/shopify_app.conf
 * 
 * Because the app uses HTTPS and is self-signed, before using it inside Shopify you need to open https://localhost:3000 in the browser and accept the "risk" - the SSL Error
 */

//load settings
nconf.env();
nconf.argv({
  "c": {
    alias: 'config',
    describe: 'Path to configuration file',
    demand: true
  }
});

confFile = nconf.get('c');
nconf.file({ file: confFile });

//configure express
var app = express();

//log all requests
app.use(express.logger('dev'));

//support json and url encoded requests
app.use(express.json());
app.use(express.urlencoded());

app.use(express.cookieParser());
app.use(express.session({
  secret: "--express-session-encryption-key--"
}));

//statically serve from the 'public' folder
app.use(express.static (path.join (__dirname, 'public')));

//use ejs for view rendering
app.set('view engine', 'ejs');

//use the environment's port if specified
app.set('port', process.env.PORT || nconf.get('http_port'));

var appAuth = new shopifyAuth.AppAuth();

//configure routes
app.get('/', routes.index);
app.get('/auth_app', appAuth.initAuth);
app.get('/escape_iframe', appAuth.escapeIframe);
app.get('/auth_code', appAuth.getCode);
app.get('/auth_token', appAuth.getAccessToken);
app.get('/sezion_app', routes.renderApp);

var options = {
  key:  fs.readFileSync(nconf.get('https_key')).toString(),
  cert: fs.readFileSync(nconf.get('https_cert')).toString(),
  ca:   fs.readFileSync(nconf.get('https_ca')).toString(),
  requestCert: true,
  rejectUnauthorized: false
};

https.createServer(options, app).listen(app.get('port'), function() {
  console.log('Listening on port ' + app.get('port'));
});

exports.nconf = nconf;