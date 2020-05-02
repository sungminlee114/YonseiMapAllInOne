var express = require('express');
var router = express.Router();

console.log("api.js");

var dbs = require('../api/dbs')

router.delete('/:campus/building/:BID', (req, res, next)=>{
    //delete
    if(req.cookies.loggedIn == validateCookie){
      var postReq = req.body
      var db;
      if(req.params.campus == 'sinchon'){
          db = dbs.sinchon
      } else if (req.params.campus == 'songdo'){
          db = dbs.songdo
      } else{
          res.send('wrong campus');
          return;
      }
      db.query(`DELETE FROM BUILDINGS WHERE BID = ${req.params.BID} `, (err, result) => {
          if(err){
            console.log(err)
            res.statusCode = 400
            res.send(err)
          }else{
            db.query(`DELETE FROM FACILITIES WHERE FBID = ${req.params.BID} `, (err, result) => {
                if(err){
                  console.log(err)
                  res.statusCode = 400
                  res.send(err)
                }else{
                    require('../api/updateBuildngData')(req.app)
                    res.send('success')
                }
              });
              
          }
        });
    } else {
        res.statusCode = 403
      res.send('비정상적인 접근')
    }
  })
router.post('/:campus/building', (req, res, next)=>{
    //add
  if(req.cookies.loggedIn == validateCookie){
    var postReq = req.body
    var db;
    if(req.params.campus == 'sinchon'){
        db = dbs.sinchon
    } else if (req.params.campus == 'songdo'){
        db = dbs.songdo
    } else{
        res.send('wrong campus');
        return;
    }
    db.query(`INSERT INTO BUILDINGS(BID, BNAME, BOPENTIME, BAREA) VALUES(${postReq.BID}, '${postReq.BNAME}', '${postReq.BOPENTIME}', '${postReq.BAREA}') `, (err, result) => {
        if(err){
          console.log(err)
          res.statusCode = 400
          res.send(err)
        }else{
            require('../api/updateBuildngData')(req.app)
            res.send('success')
        }
      });
  } else {
    res.send('비정상적인 접근')
  }
})

router.put('/:campus/building/:BID', (req, res, next)=>{
    //modify
  if(req.cookies.loggedIn == validateCookie){
    var postReq = req.body
    var db;
    if(req.params.campus == 'sinchon'){
        db = dbs.sinchon
    } else if (req.params.campus == 'songdo'){
        db = dbs.songdo
    } else{
        res.send('wrong campus');
        return;
    }
    db.query(`UPDATE BUILDINGS SET BNAME = '${postReq.BNAME}', BOPENTIME = '${postReq.BOPENTIME}', BAREA = '${postReq.BAREA}' WHERE BID = ${postReq.BID}`, (err, result) => {
        if(err){
          console.log(err)
          res.statusCode = 400
          res.send(err)
        }else{
            require('../api/updateBuildngData')(req.app)
            res.send('success')
        }
      });
  } else {
    res.send('비정상적인 접근')
  }
})

//Facility

router.get('/:campus/facility/:BID', (req, res, next)=>{
    //show
    if(req.cookies.loggedIn == validateCookie){
      var db;
      if(req.params.campus == 'sinchon'){
          db = dbs.sinchon
      } else if (req.params.campus == 'songdo'){
          db = dbs.songdo
      } else{
          res.send('wrong campus');
          return;
      }
      db.query(`SELECT * FROM FACILITIES WHERE FBID = ${req.params.BID}`, (err, result) => {
          if(err){
            console.log(err)
            res.statusCode = 400
            res.send(err)
          }else{
              res.send(result)
          }
        });
    } else {
        res.statusCode = 403
      res.send('비정상적인 접근')
    }
  })

router.delete('/:campus/facility/:FID', (req, res, next)=>{
    //delete
    if(req.cookies.loggedIn == validateCookie){
      var postReq = req.body
      var db;
      if(req.params.campus == 'sinchon'){
          db = dbs.sinchon
      } else if (req.params.campus == 'songdo'){
          db = dbs.songdo
      } else{
          res.send('wrong campus');
          return;
      }
      db.query(`DELETE FROM FACILITIES WHERE FID = ${req.params.FID} `, (err, result) => {
          if(err){
            console.log(err)
            res.statusCode = 400
            res.send(err)
          }else{
              res.send('success')
          }
        });
    } else {
        res.statusCode = 403
      res.send('비정상적인 접근')
    }
  })

router.post('/:campus/facility', (req, res, next)=>{
    //add
  if(req.cookies.loggedIn == validateCookie){
    var postReq = req.body
    var db;
    if(req.params.campus == 'sinchon'){
        db = dbs.sinchon
    } else if (req.params.campus == 'songdo'){
        db = dbs.songdo
    } else{
        res.send('wrong campus');
        return;
    }
    db.query(`INSERT INTO FACILITIES(FTYPE, FNAME, FBID, FOPENTIME, FLOCATION) VALUES('${postReq.FTYPE}', '${postReq.FNAME}', ${postReq.FBID}, '${postReq.FOPENTIME}', '${postReq.FLOCATION}') `, (err, result) => {
        if(err){
          console.log(err)
          res.statusCode = 400
          res.send(err)
        }else{
            res.send('success')
        }
      });
  } else {
    res.send('비정상적인 접근')
  }
})

router.put('/:campus/facility/:FID', (req, res, next)=>{
    //modify
  if(req.cookies.loggedIn == validateCookie){
    var postReq = req.body
    var db;
    if(req.params.campus == 'sinchon'){
        db = dbs.sinchon
    } else if (req.params.campus == 'songdo'){
        db = dbs.songdo
    } else{
        res.send('wrong campus');
        return;
    }
    db.query(`UPDATE FACILITIES SET FTYPE = '${postReq.FTYPE}', FNAME = '${postReq.FNAME}', FOPENTIME = '${postReq.FOPENTIME}', FLOCATION = '${postReq.FLOCATION}' WHERE FID = ${postReq.FID}`, (err, result) => {
        if(err){
          console.log(err)
          res.statusCode = 400
          res.send(err)
        }else{
            
            res.send('success')
        }
      });
  } else {
    res.send('비정상적인 접근')
  }
})






module.exports = router;
