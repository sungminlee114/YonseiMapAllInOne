var express = require('express');
var router = express.Router();
fs = require('fs');
path = require('path')
console.log("api.js");

var dbs = require('../api/dbs');
const updateFacilityData = require('../api/updateFacilityData');
const app = require('../app');

var validateCookie = 'pbwb1235epbn@'

//Campus Setting

router.put('/:campus/settings/photo/:photoName', (req, res, next)=>{
  //modify
  
  if(req.cookies.loggedIn == validateCookie){
    
    if (req.params.campus != 'sinchon' && req.params.campus != 'songdo'){
      res.send('wrong campus');
      return;
    }

    let fileData = req.body.val;
    let fileName = req.body.name;
    
    fs.writeFile(path.join(__dirname, `../public/images/${req.params.campus}/maps/${req.params.photoName}.png`), fileData, 'base64', function (err) {
      if (err) return console.log(err);
      console.log(`Saved ${fileName} as ${req.params.campus}/maps/${req.params.photoName}.png .`)
      res.send("ok")
    });
    return;
  
} else {
  res.statusCode = 403
  res.send('비정상적인 접근')
}
})

//Building

router.get('/:campus/building', (req, res, next) =>{
  
  if(req.params.campus == 'sinchon'){
    res.send((req.app.get('buildingData').sinchon))
  } else if (req.params.campus == 'songdo'){
    res.send(req.app.get('buildingData').songdo)
  } else{
    return "wrong campus"
  }
})

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
            db.query(`DELETE FROM FACILITIES WHERE FBID = ${req.params.BID} `, async (err, result) => {
                if(err){
                  console.log(err)
                  res.statusCode = 400
                  res.send(err)
                }else{
                    await require('../api/cleanData')()
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

    console.log(postReq)

    
    db.query(`INSERT INTO BUILDINGS(BID, BNAME, BTIME_SEM_DAY, BTIME_SEM_END, BTIME_VAC_DAY, BTIME_VAC_END, BAREA, BETC, BAVFLOOR)
     VALUES(${postReq.BID}, '${postReq.BNAME}', '${postReq.BTIME_SEM_DAY}', '${postReq.BTIME_SEM_END}', '${postReq.BTIME_VAC_DAY}', '${postReq.BTIME_VAC_END}', '${postReq.BAREA}', '${postReq.BETC}', '${postReq.BAVFLOOR}') `, async (err, result) => {
        if(err){
          console.log(err)
          res.statusCode = 400
          res.send(err)
        }else{
            await require('../api/cleanData')()
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
    db.query(`UPDATE BUILDINGS SET BNAME = '${postReq.BNAME}', BTIME_SEM_DAY = '${postReq.BTIME_SEM_DAY}', BTIME_SEM_END = '${postReq.BTIME_SEM_END}', BTIME_VAC_DAY = '${postReq.BTIME_VAC_DAY}', BTIME_VAC_END = '${postReq.BTIME_VAC_END}', BAREA = '${postReq.BAREA}', BETC = '${postReq.BETC}', BAVFLOOR = '${postReq.BAVFLOOR}' WHERE BID = ${postReq.BID}`, async (err, result) => {
        if(err){
          console.log(err)
          res.statusCode = 400
          res.send(err)
        }else{
            await require('../api/cleanData')()
            require('../api/updateBuildngData')(req.app)

            res.send('success')
        }
      });
  } else {
    res.statusCode = 403
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

router.get('/:campus/facility', (req, res, next)=>{
  if(req.params.campus == 'sinchon'){
    res.send((req.app.get('facilityData').sinchon))
  } else if (req.params.campus == 'songdo'){
    res.send(req.app.get('facilityData').songdo)
  } else{
    return "wrong campus"
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
    db.query(`INSERT INTO FACILITIES(FTYPE, FNAME, FBID, FTIME_SEM_DAY, FTIME_SEM_END, FTIME_VAC_DAY, FTIME_VAC_END, FLOCATION, FETC1) 
    VALUES('${postReq.FTYPE}', '${postReq.FNAME}', ${postReq.FBID}, '${postReq.FTIME_SEM_DAY}', '${postReq.FTIME_SEM_END}', '${postReq.FTIME_VAC_DAY}', '${postReq.FTIME_VAC_END}', '${postReq.FLOCATION}', '${postReq.FETC1}') `, async (err, result) => {
        if(err){
          console.log(err)
          res.statusCode = 400
          res.send(err)
        }else{
            await require('../api/cleanData')()
            require('../api/updateFacilityData')(req.app)
            res.send('success')
        }
      });
  } else {
    res.statusCode = 403
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
    db.query(`UPDATE FACILITIES SET FTYPE = '${postReq.FTYPE}', FNAME = '${postReq.FNAME}', 
    FTIME_SEM_DAY = '${postReq.FTIME_SEM_DAY}',
    FTIME_SEM_END = '${postReq.FTIME_SEM_END}',
    FTIME_VAC_DAY = '${postReq.FTIME_VAC_DAY}',
    FTIME_VAC_END = '${postReq.FTIME_VAC_END}', FLOCATION = '${postReq.FLOCATION}',
    FETC1 = '${postReq.FETC1}' WHERE FID = ${postReq.FID}`, async (err, result) => {
        if(err){
          console.log(err)
          res.statusCode = 400
          res.send(err)
        }else{
          await require('../api/cleanData')()
          require('../api/updateFacilityData')(req.app)
            res.send('success')
        }
      });
  } else {
    res.statusCode = 403
  res.send('비정상적인 접근')
  }
})






module.exports = router;
