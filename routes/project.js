/////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Aaron Lu 2015 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////////////////

var express = require('express');
var router = express.Router();
var request = require('request');
var crypto = require('crypto');
var credentials = require('../credentials');

router.get('/', function(req, res, next) {
  try{
    var api_key = credentials.api_key;
    var api_secret = credentials.api_secret;
    var company_id = credentials.company_id;
    var timestamp = Math.floor((new Date).getTime()/1000);
    var identityString = api_key + api_secret + timestamp;
    var sig = crypto.createHash('md5').update(identityString).digest("hex");
    var auth_token = req.query.auth_token;
    var url =
        'https://b4.autodesk.com/api/model/v1/list.json?pretty=1'+
        '&company_id='+ company_id +
        '&api_key='+ api_key +
        '&timestamp='+ timestamp +
        '&sig='+ sig +
        '&auth_token='+ auth_token +
        '&project_id='+ req.query.pid;
    console.log("[info] access " + url);
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var obj = eval("("+body+")");
        res.json(obj);
      } else {
        res.json(response.body);
      }
    });
  } catch(err){
    console.log("Error!");
    console.log(err);
  }
});

module.exports = router;
