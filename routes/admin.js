var express = require('express');
var router = express.Router();

// var session = require('express-session');
// router.use(session({
//   secret: 'asadlfkj!@#!@#dfgasdg',
//   resave: false,
//   saveUninitialized: true,
//   store:new FileStore()
// }))

/* GET users listing. */
console.log("admin.js");

// var dbs = require('../api/dbs')

// var ID = 'admin@yonsei.ac.kr'
var ID = 'admin'
var PW = 'admin'
// var ID = '1'
// var PW = '1'
var validateCookie = 'bqweqeqDFQW12'

router.use('/:campus/main', (req, res, next)=>{

// console.log(sinchonDB)
//cookie로 로그인체크, vulnerable
    if(req.cookies.loggedIn == validateCookie){
        console.log("asdfa")
    var buildingData = req.app.get('buildingData')
    // buildingData.sinchonBuildings[401] = 'afads'
    // console.log(buildingData['sinchon']['301'])
    // console.log(buildingData)
    res.render('admin', {buildingData:buildingData, campus: req.params.campus, building: 'main' });

    } else {
    res.redirect('/admin')
    }
})

router.use('/:campus/settings', (req, res, next)=>{

      if(req.cookies.loggedIn == validateCookie){
          console.log("asdfa")
        var buildingData = req.app.get('buildingData')
        // buildingData.sinchonBuildings[401] = 'afads'
        // console.log(buildingData['sinchon']['301'])
        // console.log(buildingData)
        res.render('admin_campusSetting', {buildingData:buildingData, campus: req.params.campus, building: 'main' });
  
      } else {
      res.redirect('/admin')
      }
  })

router.use('/:campus/:building', (req, res, next)=>{
  
// console.log(sinchonDB)
//cookie로 로그인체크, vulnerable
  if(req.cookies.loggedIn == validateCookie){
    var buildingData = req.app.get('buildingData')
    // buildingData.sinchonBuildings[401] = 'afads'
    // console.log(buildingData['sinchon']['301'])
    res.render('admin_building', {buildingData:buildingData, campus: req.params.campus, building:req.params.building });

  } else {
    res.redirect('/admin')
  }
})

router.post('/login', (req, res, next) =>{
  //login Validate
  
  if(req.body.id == ID && req.body.pw == PW){
    res.cookie('loggedIn', validateCookie, {
          maxAge: 6000000
    });
    res.redirect('/admin/sinchon/main');
  } else {
    res.cookie('loggedIn', false, {
      maxAge: 5000
    });
    res.redirect('/admin')
  }
  
})

router.use('/', function(req, res, next) {
  //show Login Page

  if( ( req.cookies.loggedIn === undefined)){
    res.render('adminLogin', { retry : false});
  } else if ( req.cookies.loggedIn == 'false') {
    res.render('adminLogin', { retry : true});
  } else if ( req.cookies.loggedIn == 'bqweqeqDFQW12'){
    res.redirect('/admin/sinchon/main');
  } else {
    res.render('adminLogin', { retry : null});
  }
  
});




module.exports = router;
