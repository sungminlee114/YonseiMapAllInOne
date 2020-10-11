var dbs = require('./dbs');
const app = require('../app');
// let assert = require('assert');

let updateFacilityData = async (app)=> {
    var res = await queryFacilityData();
    var temp = {'sinchon': {}, 'songdo': {}}
    res.sinchon.forEach(element => {
        temp.sinchon[element.FID] = element;
    });
    res.songdo.forEach(element => {
        temp.songdo[element.FID] = element;
    });
    
    app.set('facilityData', temp)
}

let queryFacilityData = () => {
    return new Promise((resolve, reject) =>{
        
        dbs.sinchon.query(`SELECT * FROM FACILITIES`, (err, sinchonRes) => {
            if(err){
              console.log(err)
            }else{
                dbs.songdo.query(`SELECT * FROM FACILITIES `, (err, songdoRes) => {
                if(err){
                    console.log(err)
                }else{
                  resolve({'sinchon': sinchonRes, 'songdo': songdoRes});
                }
              });
            }
          });
    });
}

module.exports = updateFacilityData;
