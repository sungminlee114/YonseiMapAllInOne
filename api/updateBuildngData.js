var dbs = require('./dbs');

let updateBuildingData = async (app)=> {
    var res = await queryBuildingData();
    var temp = {'sinchon': {}, 'songdo': {}}
    res.sinchon.forEach(element => {
        temp.sinchon[element.BID] = element;
    });
    res.songdo.forEach(element => {
        temp.songdo[element.BID] = element;
    });
    console.log(temp)
    app.set('buildingData' ,temp)
}

let queryBuildingData = () => {
    return new Promise((resolve, reject) =>{
        dbs.sinchon.query(`SELECT * FROM BUILDINGS `, (err, sinchonRes) => {
            if(err){
              console.log(err)
            }else{
                dbs.songdo.query(`SELECT * FROM BUILDINGS `, (err, songdoRes) => {
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

module.exports = updateBuildingData;
