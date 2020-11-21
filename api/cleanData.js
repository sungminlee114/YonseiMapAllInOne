var dbs = require('./dbs');
const fs = require('fs');

const parse = (element, db) => {
    let area = element.BAREA;
    let tarea = area;
    while(area.startsWith(" "))
        area = area.slice(1);
    while(area.startsWith("\t"))
        area = area.slice(1);
    while(area.startsWith("\n")){
        area = area.slice(1);      
    }

    while(area.endsWith(" ")){
        area = area.slice(0, -1);
        // console.log(area)
    }
    while(area.endsWith("\t"))
        area = area.slice(0, -1);
    while(area.endsWith("\n"))
        area = area.slice(0, -1);

    area = area.replace(/  /g, " ")
    area = area.replace(/\t\t/g, " ")

    if(tarea != area){
        // console.log("아아아아악",element.BNAME, tarea, "||", area)
        db.query(`UPDATE BUILDINGS SET BAREA = '${area}' WHERE BID = ${element.BID}`, (err, result) => {
            
        });
    }
}

const parseETC = (element, db, type) => {
    let val = (type[0] == "B") ? element.BTEC : element.FETC1; 
    let tval = val;

    // console.log(val)
    val = val.replace(/<a href="/g, "")
    val = val.replace(/".*\/a>/g, "")
    if(tval != val){
        console.log("아아아아악",element.BNAME, val)
        let id = (type[0] == "B") ? element.BID : element.FID; 
        db.query(`UPDATE ${type} SET ${type[0]}ETC${(type[0] == "B") ? '' : '1'} = '${val}' WHERE ${type[0]}ID = ${id}`, (err, result) => {
        });
    }
}

const parseBTIME = (element, db) => {
    const ls = ["BTIME_SEM_DAY", "BTIME_SEM_END", "BTIME_VAC_DAY", "BTIME_VAC_END"]
    let a = {};
    let vals = ls.map(el => {
        var str = element[el];
        if(str == ''){
            a[el] = '정보 없음';
        }
        return str;
    })
    let tr = 0;
    qur = `UPDATE BUILDINGS SET `
    for (const [key, value] of Object.entries(a)) {
        
        qur += `${key}='${value}', `
        tr += 1;
    }
    qur = qur.slice(0, -2)
    qur += ` WHERE BID=${element.BID}`
    if(tr > 0){
        console.log(qur)
        db.query(qur, (err, result) => {
            
        });
    }
}



let cleanAreaData = (res)=> {
    // var temp = {'sinchon': {}, 'songdo': {}}
    res.sinchon.map(el => parse(el, dbs.sinchon));
    res.songdo.map(el => parse(el, dbs.songdo));
}

let cleanETCData = (res, type)=> {
    // var temp = {'sinchon': {}, 'songdo': {}}
    res.sinchon.map(el => parseETC(el, dbs.sinchon, type));
    res.songdo.map(el => parseETC(el, dbs.songdo, type));
}

const cleanTimeData = res => {
    res.sinchon.map(el => parseBTIME(el, dbs.sinchon));
    res.songdo.map(el => parseBTIME(el, dbs.songdo));
}

const avFD = (element, campus, db) => {
    let bid = element.BID;
    let myPath = path.join(__dirname, `../public/images/${campus}/maps/${bid}`)
    fs.access(myPath, fs.F_OK, (err) => {
        if (!err) {
            files = fs.readdirSync(myPath + '/')
            files = files.filter((fileName) => {
                return fileName.search("안내") === -1;
            }).map((fileName) => {
                return fileName.slice(0, -4);
            })
            
            let qStr = files.join(',');
            if (element.BAVFLOOR !== qStr){
                db.query(`UPDATE BUILDINGS SET BAVFLOOR = '${files.join(',')}' WHERE BID = ${bid}`, (err, result) => {
                    console.log(campus, bid)
                });
            }

        }
    });
}

const updateAvailableFloorData = res => {
    
    

    res.sinchon.map(el => avFD(el, 'sinchon', dbs.sinchon));
    res.songdo.map(el => avFD(el, 'songdo', dbs.songdo));
}

const cleanData = async () => {
    var building = await queryBuildingData();
    // var facility = await queryFacilityData();
    updateAvailableFloorData(building);
    cleanAreaData(building);
    // cleanETCData(facility, 'FACILITIES');
    cleanTimeData(building);
    console.log("doneClean")
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

let queryFacilityData = () => {
    return new Promise((resolve, reject) =>{
        dbs.sinchon.query(`SELECT * FROM FACILITIES `, (err, sinchonRes) => {
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

module.exports = cleanData;