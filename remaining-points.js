// web.js
var express = require("express");
var logfmt = require("logfmt");
var multipart = require('connect-multiparty');
var request = require('request');
var app = express();

var currentPoints = 0;

var currentSprint = 753; 

app.use(logfmt.requestLogger());

app
.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', 'http://localhost');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
})
.options('*', function(req, res, next){
    res.end();
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

var multipartMiddleware = multipart();
app.use(multipartMiddleware);

app.get('/', function(req, res) {
  res.send('ok');
});

function getJQLString() {
   return 'https://jira.lbi.co.uk/rest/api/2/search?jql=project+%3D+PH+AND+issuetype+%3D+Story+AND+status+in+%28Open%2C+%22In+Progress%22%2C+Reopened%2C+%22Ready+for+Test%22%29+AND+labels+%3D+Pre-Sales+AND+sprint%3D' + currentSprint;
}

function checkForUpdates() {
  request.get(getJQLString(),
    {
     'auth': {
      'user': '[username]',
      'pass': '[password]',
      'sendImmediately': true
     }
  }, function (error, response, body) {

    var objBody = JSON.parse(body);
      
    var totalPoints = 0;
    for (var issue in objBody.issues) {
      var point = objBody.issues[issue].fields.customfield_10042;
      console.log(point);
     
      totalPoints += point;
    }

    if (error) {
      console.log('error');
      console.log(error);
    } else {
      console.log('total left:');
      console.log(totalPoints);
      currentPoints = totalPoints;
    }
    
  });
}

checkForUpdates();

// set to 1800000 = 30 mins for production
//setInterval(checkForUpdates, 1800000);

// set to 5 secs for development
setInterval(checkForUpdates, 5000);


app.get('/points_remaining', function(req, res) {

    res.send('points_remaining=' + currentPoints);  

});

app.post('/', function(req, res) {
  var stat = req.query.sprint;
  
  if (stat) {
    currentSprint = parseInt(stat);
    res.send('thanks for the update, the current sprint is now ' + currentSprint);
  } else {
    res.send('Sprint number not updated');
  }

});


