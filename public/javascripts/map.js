/*
이 js파일은 index.ejs의 지도화면에 관한 함수들이 있는 파일입니다.

만든이 : 연세대학교 제55대 총학생회 Mate 사무운영국원, 공과대학 글로벌융합공학부 18학번 이성민 (starmin114@yonsei.ac.kr)
*/

/* -- load image -- */ 
let MAPS = {
  '1F':new Image(),
  'B1':new Image()
};
let drawQ = [];
let isHovering = false;
let isClicking = false;
let pointingBuilding = null;
let clickedBuilding = null;
let lastAnimating = null;
let mapBackup = null;
let imgClo = null;
let borderColorHex = "white";
let easterEggClick, easterEggWipe, eeClickOn, eeWipeOn, eeClickableBuildingList;
let drawState = false;

for (const[k, v] of Object.entries(MAPS)){
  MAPS[k].src = `./images/${CAMPUS}/maps/${k}.png`;
  MAPS[k].addEventListener("load",() => {
    console.log(`load img ${CAMPUS} ${k}`);
    if(k == FLOORCONTEXT){
      drawState = true;
      changeMap(k)
    }
  },false);
}

const waitTillImageLoad = () => {
  return new Promise((resolve, reject) => {
    if(drawState == true){
      resolve()
    } 
    const inte = setInterval(() => {
      if(drawState == true){
        clearInterval(inte)
        resolve()
      } 
    }, 50);
  })
}

const getMap = (key) => {
  return new Promise((resolve, reject) =>{
    if(!Object.keys(MAPS).includes(key)){
      let imPath;
      key = key.slice(key.indexOf("_")+1)
      imPath = `${CAMPUS}/maps/${clickedBuilding.BID}/${key}`;
      MAPS[key] = myLoadImage(`./images/${imPath}.png`)
      MAPS[key].addEventListener("load",() => {
        resolve(MAPS[key]);
      },false);
    } else {
      resolve(MAPS[key])
    }
  });
};

const saveMap = () => {
  if(imgClo !== null){
   mapBackup = [drawQ, clickedBuilding, screenSize];
  }
}

const restoreMap = () => {
  if(mapBackup !== null){
    drawQ = mapBackup[0];
    clickedBuilding = mapBackup[1];
    if(clickedBuilding !== null){
      clickBuilding(clickedBuilding, false);
      return;
    } else {
    }
    resizeCanvas(true);
  }
}
const changeMap = async (fc, restore=true) => {
  if(fc != '1F'){
    saveMap();
  }
  imgClo = await getMap(fc);
  imageSize.w = imgClo.width;
  imageSize.h = imgClo.height;
  drawQ = [];
  isHovering = false;
  isClicking = false;
  pointingBuilding = null;
  lastAnimating = null;
  borderColorHex = "white";
  
  if( fc == '1F'){
    easterEggClick = resetEggCount();
    eeClickOn = 0;
    easterEggWipe = resetEggCount();
    eeWipeOn = 0;
    eeClickableBuildingList = [];
  }

  if(fc == '1F' && restore)
    restoreMap();
  else
    resizeCanvas(true);
}

let changeFloor = async(floor, restore) => {

  if(FLOORCONTEXT == floor)
    return;

  Array.from(document.getElementsByClassName("sliderInnerFloor")).forEach(el => {
    el.classList.remove("selected");
    if(el.dataset.floor == floor)
      el.classList.add("selected");
  })

  Array.from(document.getElementsByClassName("sliderInnerBuildingFloor")).forEach(el => {
    el.classList.remove("selected");
    if(el.dataset.floor == floor)
      el.classList.add("selected");
  })
  FLOORCONTEXT = floor;
  await changeMap(FLOORCONTEXT, restore)

}

/* -- egg -- */

const resetEggCount = () => {
  return {building: null, count : 0, last : null};
}

const addEggcount = (egg, building, max, listener) => {
  if(((CAMPUS == 'sinchon'&&listener==eggWipeListener)||listener==eggClickListener) && FLOORCONTEXT == '1F'){
    if(!(egg.building == building.BID && new Date().getTime() - egg.last.getTime() < 500) || (egg.count == 0)){
      egg = resetEggCount();
      egg.building = building.BID;
    }

    if(egg.count > 0 && new Date().getTime() - egg.last.getTime() < 10){
      return egg;
    }
    egg.count += 1;
    egg.last = new Date();
    if(egg.count > max){
      listener(egg)
      return resetEggCount();
    }

    return egg;
  }
}

const clickEggData =  [
  {campus: 'sinchon', bid: 207, string:'S2S2'},
  {campus: 'sinchon', bid: 325, string:'감자공주'},
  {campus: 'sinchon', bid: 124, string:'이성미니맵'},
  {campus: 'songdo', bid: 502, string:'디총팀고인물'},
  {campus: 'sinchon', bid: 405, string:'NavigateYON'}
]

const eggClickListener = (egg) => {
  if(FLOORCONTEXT == '1F'){
    let data = clickEggData.find(el => el.bid == egg.building && el.campus == CAMPUS)
    if (data == undefined)
      return;

    eeClickOn += 1;
    let index = 0;
    let el = document.getElementById("sidebar-header-title")
      el.innerHTML = data.string;
      el.style = "font-family: 'Jal_Onuel'; color: var(--mateColor); font-size: 1.3rem;"
    const inte = setInterval(() => {
      if (index++ === 1) {
        eeClickOn -= 1;
        if(eeClickOn == 0){
          el.innerHTML = ""
          el.style = ""
          el.appendChild(icon_main_logo);
        }
        clearInterval(inte)
      }
    }, 2000);
  }
}


const eggWipeListener = (egg) => {
  if(CAMPUS == 'sinchon' && FLOORCONTEXT == '1F'){
    eeWipeOn += 1;
    let index = 0;

    let building = buildingList.filter(el => el.BID == egg.building)[0]
    
    if(eeWipeOn == 1 && !eeClickableBuildingList.includes(building)){
      pushDrawQ(building, icon_pin_blue, null, "wipe", "imageWipe", true);
    } else if(eeWipeOn == 73) {
      eeClickableBuildingList.push(building)
      deleteDrawQ(null, `wipe`, null, drawQ);
      pushDrawQ(building, icon_pin_blue, null, "wipeDone", "image", true);
      return;
    } else if(!eeClickableBuildingList.includes(building)) {
      clipByImageVertex(building.area)
      drawImageOnTheCOGOfImageVertexSwipe(building, icon_pin_blue)
    }
    // console.log(building)
    
    // eeWipeList.push(pushDrawQ(building, `rgba(226,228,100,0.05)`, 10 , `wipe`, "pad", drawQ));
    const inte = setInterval(() => {
      if (index++ === 1) {
        eeWipeOn -= 1;
        // let uid = eeWipeList.pop();
        if(eeClickableBuildingList.includes(building)){
          deleteDrawQ(null, `wipe`, null, drawQ);
          clearInterval(inte);
          return;
        } else if(eeWipeOn == 0){
          deleteDrawQ(null, `wipe`, null, drawQ);
          clipByImageVertex(building.area)
          drawImageOnTheCOGOfImageVertexSwipe(building, icon_pin_blue)
        }
        clipByImageVertex(building.area)
        drawImageOnTheCOGOfImageVertexSwipe(building, icon_pin_blue)
        clearInterval(inte)
      }
    }, 3000);
  }
}



/* -- [utils] -- */
let wrapFunction = function (fn, context, params) {
  return function () {
    fn.apply(context, params);
  };
};

function getUUID() { // UUID v4 generator in JavaScript (RFC4122 compliant)
  let uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 3 | 8);
    return v.toString(16);
  });

  // console.trace(lastAnimating, uid);
  return uid;
}

function rgbToHex(rgb) {
  console.log(rgb)
  let r = rgb[0],
  g = rgb[1],
  b = rgb[2];
  if (r > 255 || g > 255 || b > 255)
      throw "Invalid color component";
  let raw = ((r << 16) | (g << 8) | b);
  return "#" + ( "000000" + raw.toString(16)).slice(-6);
}

//두 점좌표의 차이(f - i) 반환
let get2dDiff = (i, f) => {
  return { x: f.x - i.x, y: f.y - i.y };
};

//점좌표의 n배 반환
let getCoordMult = (coord, n) => {
  if(coord.x !== undefined)
    return { x: coord.x * n, y: coord.y * n };
  else
    return { x: coord.w * n, y: coord.h * n };
};

const getAnimatedValue = (initial, final, index, max_index) =>{
  const func = Math.sin
  
  // const ret = (final - initial) * func((index / max_index) * (Math.PI / 2)) + initial;
  const ret = (final - initial) * (func(((2 * index / max_index) -1) * (Math.PI / 2)) + 1)/2 + initial;
  return ret
}

//점좌표가 구역안에 있는지 반환
let isinArea = (point, area) => {
  let x = point.x,
    y = point.y;
  let inside = false;
  for (let i = 0, j = area.length - 1; i < area.length; j = i++) {
    let xi = area[i].x,
      yi = area[i].y;
    let xj = area[j].x,
      yj = area[j].y;
    let isYBetween = yi > y != yj > y;
    let isXIntersect = x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    let intersect = isYBetween && isXIntersect;
    if (intersect) inside = !inside;
  }
  return inside;
};

// let getMiddlePointOfRect= (size) => {
//   return {x: size.x, }
// }

//한 area의 평균 구하기
let getAveragePointOfCoords = (area) => {
  let len = area.length;
  let pos = {x:0, y:0};
  for(let i = 0; i < len; i++){
    pos.x += area[i].x
    pos.y += area[i].y
  }
  pos = {
    x: pos.x / len,
    y: pos.y / len
  }
  return pos
}

const getAveragePointOfBuilding = (building) => {
  if(Object.keys(building).includes('areaAverage')){
    return building['areaAverage']
  } else {
    let av = getAveragePointOfCoords(building.area)
    let idx = buildingList.findIndex(el => el.BID == building.BID)
    buildingList[idx]['areaAverage'] = av;
    return av;
  }
}

const getMathematicalAreaOfCoords = (vertices) => {
  let total = 0;

  for (var i = 0, l = vertices.length; i < l; i++) {
    var addX = vertices[i].x;
    var addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
    var subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
    var subY = vertices[i].y;

    total += (addX * addY * 0.5);
    total -= (subX * subY * 0.5);
  }

  return Math.abs(total);
}

//무게중심 구하기
let getCoGOfCoords = (vertices) => {

  let area = getMathematicalAreaOfCoords(vertices);
  let sumX = 0, sumY = 0;
  
  for (var i = 0; i < vertices.length; i++) {
    let sumOx = vertices[i].x + vertices[i == vertices.length - 1 ? 0 : i + 1].x;
    let sumOy = vertices[i].y + vertices[i == vertices.length - 1 ? 0 : i + 1].y;
    let cross = vertices[i].x*vertices[i == vertices.length - 1 ? 0 : i + 1].y - vertices[i == vertices.length - 1 ? 0 : i + 1].x*vertices[i].y;
    
    sumX += sumOx * cross;
    sumY += sumOy * cross;
  }
  
  let area6 = 1/(6*area);

  return {x: Math.abs(area6 * sumX), y: Math.abs(area6 * sumY)}
}

const getCoGOfBuilding = (building) => {
  if(Object.keys(building).includes('areaCoG')){
    return building['areaCoG']
  } else {
    let av = getCoGOfCoords(building.area);
    let idx = buildingList.findIndex(el => el.BID == building.BID)
    buildingList[idx]['areaCoG'] = av;
    return av;
  }
}

let getSquareBoxPointOfMiddleAndSize = (middle, size) => {
  let pos = {}
  pos.x = middle.x - size.w/2
  pos.y = middle.y - size.h/2
  pos.w = size.w
  pos.h = size.h
  return pos
}

//prev 와 current로 이루어진 cache 업데이트
let updateCache = (cache, data) => {
  cache.prev = cache.current;
  cache.current = data;
  return cache;
};

//그림좌표계의 점좌표를 화면좌표계의 점좌표로 변환
let coordIm2CanvasSingle = (iPos) => {
  let rx = canvasSize.x + ((iPos.x - screenSize.x) / screenSize.w) * canvasSize.w,
    ry = canvasSize.y + ((iPos.y - screenSize.y) / screenSize.h) * canvasSize.h;
  return { x: rx, y: ry };
};

//화면좌표계의 점좌표를 그림좌표계의 점좌표로 변환
let coordCanvas2ImSingle = (cPos) => {
  let rx = screenSize.x + ((cPos.x - canvasSize.x) / canvasSize.w) * screenSize.w,
    ry = screenSize.y + ((cPos.y - canvasSize.y) / canvasSize.h) * screenSize.h;
  return { x: rx, y: ry };
};

//그림좌표계의 점좌표들을 화면좌표계의 점좌표들로 변환
let coordIm2Canvas = (imVertexs) => {
  let ret = [];
  imVertexs.forEach((imVertex) => {
    // if (rx >= canvasSize.x && rx < canvasSize.x + canvasSize.w && ry >= canvasSize.y && ry < canvasSize.y + canvasSize.h) {
    ret.push(coordIm2CanvasSingle(imVertex));
    // }
  });
  return ret;
};

//화면좌표계에서의 포인터좌표 반환
let getPointerPosinCanvas = (e) => {
  return {
    x: e.pageX - mapContainer.getBoundingClientRect().left - window.scrollX,
    y: e.pageY - mapContainer.getBoundingClientRect().top - window.scrollY,
  };
};

//그림좌표계에서의 포인터좌표 반환
let getPointerPosinImage = (e) => {
  let canvasPos = getPointerPosinCanvas(e);
  return coordCanvas2ImSingle(canvasPos);
};

//(마우스)좌표가 속한 구역의 빌딩정보 반환
let isinBuildings = (ipos, buildingList) => {
  let currentScreenBoundary = [
    {x: screenSize.x, y: screenSize.y},
    {x: screenSize.x, y: screenSize.y + screenSize.h},
    {x: screenSize.x + screenSize.w, y: screenSize.y + screenSize.h},
    {x: screenSize.x + screenSize.w, y: screenSize.y}
  ]
  let ret = null;
  try {
    buildingList.some((building) => {
      if (isinArea(ipos, building.area) && isinArea(ipos, currentScreenBoundary)) {
        ret = building;
        return true;
      } else return false;
    });
    return ret; // b is not defined, so throws an error
  } catch (err) {
      // console.error(err) // will log the error with the error stack
  }
  
};

//그림좌표계상의 구역들을 색칠
let fillByImageVertex = (iarea, color, filter = null) => {
  let tFilter = ctx.filter
  if (filter !== null){
    ctx.filter = filter
  }
  ctx.beginPath();
  
  ctx.moveTo(sarea[0].x, sarea[0].y);
  for (let i = 1; i < sarea.length; i++) {
    ctx.lineTo(sarea[i].x, sarea[i].y);
  }

  ctx.fillStyle = color;
  ctx.fill();
  sarea = coordIm2Canvas(iarea);
  if (filter !== null){
    ctx.filter = tFilter
  }
};

//그림좌표계상의 구역들을 색칠 + 그림자
let fillnShadowImageVertex = (iarea, color, blur = null) => {
  ctx.save();
  ctx.shadowColor = color
  ctx.shadowBlur = 5000;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  if (blur !== null){
    ctx.shadowBlur = blur
  }

  sarea = coordIm2Canvas(iarea);
  ctx.beginPath();
  ctx.moveTo(sarea[0].x, sarea[0].y);
  for (let i = 1; i < sarea.length; i++) {
    ctx.lineTo(sarea[i].x, sarea[i].y);
  }

  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
};

//그림좌표계상의 구역들의 선을 그림
let strokeByImageVertex = (area, color, filter = null) => {
  ctx.beginPath();
  area = coordIm2Canvas(area);
  // console.log(area)
  ctx.moveTo(area[0].x, area[0].y);
  for (let i = 1; i < area.length; i++) {
    ctx.lineTo(area[i].x, area[i].y);
  }
  ctx.lineTo(area[0].x, area[0].y);
  ctx.strokeStyle = color;
  ctx.stroke();
};

const clipByImageVertex = (area, filter = null) => {
  ctx.save();
  if (filter !== null){
    ctx.filter = filter
  }
  ctx.beginPath();
  sarea = coordIm2Canvas(area);
  ctx.moveTo(sarea[0].x, sarea[0].y);
  for (let i = 1; i < sarea.length; i++) {
    ctx.lineTo(sarea[i].x, sarea[i].y);
  }
  ctx.clip();
  ctx.drawImage(imgClo, screenSize.x, screenSize.y, screenSize.w, screenSize.h, canvasSize.x, canvasSize.y, canvasSize.w, canvasSize.h);

  ctx.restore();
};

const padByImageVertex = (area, color, blur = null) => {
  ctx.save();
  ctx.shadowBlur = 25;
  if (blur !== null){
    ctx.shadowBlur = blur
  }
  sarea = coordIm2Canvas(area);
  ctx.shadowColor = color;
  ctx.beginPath();

  ctx.moveTo(sarea[0].x, sarea[0].y);
  for (let i = 1; i < sarea.length; i++) {
    ctx.lineTo(sarea[i].x, sarea[i].y);
  }

  ctx.fillStyle = color;
  ctx.fill();
  // ctx.drawImage(imgClo, screenSize.x, screenSize.y, screenSize.w, screenSize.h, canvasSize.x, canvasSize.y, canvasSize.w, canvasSize.h);

  ctx.restore();
};

const drawImageOnTheCOGOfImageVertexSwipe = (building, image, filter = null) => {

  ctx.save()
  let eeWipeOnNew = eeWipeOn -40;
  eeWipeOnNew = eeWipeOnNew > 0 ? eeWipeOnNew : 0;
  ctx.filter = `opacity(${eeWipeOnNew * 3}%)`
  middle = getCoGOfBuilding(building); // currently ImageCoord not CanvasCoord
  cmiddle = coordIm2CanvasSingle(middle)

  resizedImageSize = {}
  resizedImageSize.w = 50;
  resizedImageSize.h = 50;

  squarePoint = getSquareBoxPointOfMiddleAndSize(cmiddle, resizedImageSize)
  

  squarePoint.y -= resizedImageSize.h/2;


  ctx.drawImage(image, 0, 0, image.width, image.height, squarePoint.x, squarePoint.y, squarePoint.w, squarePoint.h);

  ctx.restore();
};

const drawImageOnTheCOGOfImageVertex = (building, image, filter = null) => {
  if (filter !== null){
    ctx.filter = filter
  }
  middle = getCoGOfBuilding(building); // currently ImageCoord not CanvasCoord
  cmiddle = coordIm2CanvasSingle(middle)

  resizedImageSize = {}
  resizedImageSize.w = 50;
  resizedImageSize.h = 50;

  squarePoint = getSquareBoxPointOfMiddleAndSize(cmiddle, resizedImageSize)
  squarePoint.y -= resizedImageSize.h/2;
  ctx.drawImage(image, 0, 0, image.width, image.height, squarePoint.x, squarePoint.y, squarePoint.w, squarePoint.h);

  if (filter !== null){
    ctx.filter = "none"
  }
};

// draw할 것들을 저장
let pushDrawQ = (building, colorOrImage, filter, state, type, draw = true) => {
  let f;
  let uuid = getUUID();
  //이스터에그
  if ((drawQ.findIndex(el => el.state == state && el.id == building.BID && el.type == type) == -1) || (building.ee != undefined) ) {
    if (type == "stroke")
      f = wrapFunction(strokeByImageVertex, this, [building.area ,colorOrImage, filter]);
    else if (type == "fill")
      f = wrapFunction(fillByImageVertex, this, [building.area, colorOrImage, filter]);
    else if (type == "fillShadow")
      f = wrapFunction(fillnShadowImageVertex, this, [building.area, colorOrImage, filter]);
    else if (type == "clip")
      f = wrapFunction(clipByImageVertex, this, [building.area, colorOrImage, filter]);
    else if (type == "pad")
      f = wrapFunction(padByImageVertex, this, [building.area, colorOrImage, filter]);
    else if (type == ("imageWipe"))
      f = wrapFunction(drawImageOnTheCOGOfImageVertexSwipe, this, [building, colorOrImage, filter])
    else if (type.startsWith("image"))
      f = wrapFunction(drawImageOnTheCOGOfImageVertex, this, [building, colorOrImage, filter])
      drawQ.push({ func: f, id: building.BID, state: state, type: type, uid : uuid });
    if (draw) redrawCanvas();
    // console.log("push", building, state, Q)
  }

  return uuid;
};

// draw할 필요 없는것들을 제외
let deleteDrawQ = (building, state, uid = null, draw = true) => {
  drawQ = drawQ.filter(function (item) {
    if(uid != null)
      return item.uid != uid;
    else if (building != null && state != null)
      return item.id != building.BID || item.state != state;
    else if (building == null) return item.state != state;
    else if (state == null) return item.id != building.BID;
    else return false;
  });
  if (draw) redrawCanvas();
};
/* ================================ */

/* [drawing functions] */

//각 지도의 중앙좌표 상수
const mapMiddleCoord = {
  sinchon: {
    '1F' : {
      x : 1112,
      y : 2045
    },
    'B1' : {
      x : 428,
      y : 569
    },
    'defaultZoom' : 1.5
  },
  songdo: {
    '1F' : {
      x : 1730,
      y : 1050
    },
    'B1' : {
      x : 1730,
      y : 1050
    },
    'defaultZoom' : 0.4
  }
};

let zoom = 0;

//실제 캔버스의 크기 (x,y,w,h)
//x, y는 항상 0임.
let canvasSize = {
  x : 0,
  y : 0
};

//그림에서 느끼는 zoom된 캔버스의 크기 (x,y,w,h)
let screenSize = {
  x : 0,
  y : 0
};

//실제 그림크기(w,h)
let imageSize = {
};

// // 스크린의 중앙 (x, y)
let screenMiddle = {
};

let mapCanvas = document.getElementById("mapCanvas");
let ctx = mapCanvas.getContext("2d");


 /* -- functions -- */
  
// 그림좌표계의 점좌표를 화면의 정중앙으로 이동
let alignScreenToMiddle = (m, smooth = false, uid = null) => {
  // if (zoomReset) {
  //   let _zoom = Math.max(canvasSize.w / imageSize.w, canvasSize.h / imageSize.h) + 1;
  //   changeZoom(_zoom, { x: canvasSize.x, y: canvasSize.y }, true);
  // }
  
  let a = coordIm2CanvasSingle(m),
  b = { x: canvasSize.x + canvasSize.w / 2, y: canvasSize.y + canvasSize.h / 2 };
  let c = get2dDiff(b, a);
  
  moveScreen(c, smooth, uid);

  //redraw안에서 m 업데이트시켜줌.
  redrawCanvas();
};

//화면내에 그림을 채워줌.
let redrawCanvas = async (filter = null) => {

  await waitTillImageLoad();
  ctx.save();
  if(filter !== null){
    ctx.filter = filter
  }
  ctx.fillStyle = borderColorHex;
  ctx.fillRect(canvasSize.x,canvasSize.y,canvasSize.w ,canvasSize.h);
  ctx.drawImage(imgClo, screenSize.x, screenSize.y, screenSize.w, screenSize.h, canvasSize.x, canvasSize.y, canvasSize.w, canvasSize.h);
  // if(borderColorHex === "white")
  //   borderColorHex = rgbToHex(ctx.getImageData(0,0,1,1).data);
  screenMiddle.x = screenSize.x + screenSize.w / 2;
  screenMiddle.y = screenSize.y + screenSize.h / 2;
  if(filter !== null){
    ctx.filter = "none"
  }
  ctx.restore();
  //길, 건물 outline등을 모두 그려줘야함.
  drawQ.forEach((q) => {
    q.func();
  });
};

const waitTillNotNan= (arg) => {
  return new Promise((resolve, reject) => {
    
    if(!isNaN(arg)){
      resolve(arg)
    }
    const inte = setInterval(() => {
      if(!isNaN(arg)){
        clearInterval(inte)
        resolve(arg)
      } 
    }, 50);
  })
}

const waitTillContainerLoad = () => {
  return new Promise((resolve, reject) => {
    let rect = mapContainer.getBoundingClientRect();
    if(!isNaN(rect.width) && !isNaN(rect.height) && rect.width > 0 && rect.height > 0){
      resolve(rect)
    }
    const inte = setInterval(() => {
      if(!isNaN(rect.width) && !isNaN(rect.height) && rect.width > 0 && rect.height > 0){
        clearInterval(inte)
        resolve(rect)
      } 
    }, 50);
  })
}

let resizeCanvas = async (first, uid = null) => {
  //canvas
  // let rect = mapContainer.getBoundingClientRect(); 
  let rect = await waitTillContainerLoad();
  if(!isNaN(rect.width) && !isNaN(rect.height) && rect.width > 0 && rect.height > 0){
    canvasSize.w = rect.width;
    canvasSize.h = rect.height;
    ctx.canvas.width = canvasSize.w;
    ctx.canvas.height = canvasSize.h;
    // console.log("rect", rect, canvasSize)
    // console.log("mSA", "resizeCanvas", canvasSize, screenSize)
  //최적의 zoom으로 초기화
  if (first){
    screenSize.x = 0;
    screenSize.y = 0;
    if(CAMPUS == 'sinchon' && FLOORCONTEXT == '1F'){
      zoom = calcBasicZoom(imageSize, true) + 1;
    // } else if (CAMPUS == 'sinchon' && FLOORCONTEXT == 'B1'){
    //   zoom = Math.max(canvasSize.w / imageSize.w, canvasSize.h / imageSize.h) - 0.3;
    } else if(CAMPUS == 'songdo'){
      zoom = mapMiddleCoord['songdo']['defaultZoom']
    } else {
      zoom = calcBasicZoom(imageSize, true) + 0.1;
    }
  }

  zoom = await waitTillNotNan(zoom)
  
  screenSize.w = Math.floor(canvasSize.w / zoom);
  screenSize.h = Math.floor(canvasSize.h / zoom);
  if (first){
    if(mapMiddleCoord[CAMPUS][FLOORCONTEXT] !== undefined){
      alignScreenToMiddle(mapMiddleCoord[CAMPUS][FLOORCONTEXT], false, uid);
    }
    else{
      mid = {x: imageSize.w/2, y: imageSize.h/2};
      // console.log(mid)
      alignScreenToMiddle(mid, false, uid);
    }
  }
  else
    alignScreenToMiddle(screenMiddle, false, uid);
  }
};

const calcBasicZoom = (iCoords, min=false, limit = null) => {
  let ret;
  if(min==false){
    ret = Math.max(canvasSize.w / iCoords.w, canvasSize.h / iCoords.h)
  }else{
    ret = Math.min(canvasSize.w / iCoords.w, canvasSize.h / iCoords.h)
  }
  if(limit == 'default'){
    limit = [calcBasicZoom(imageSize), mapMiddleCoord[CAMPUS]['defaultZoom']]
  }

  
  if(limit !== null){
    if(ret < limit[0])
      return limit[0]
    else if (ret > limit[1])
      return limit[1]
  }

    return ret
}

//zoom하기
let changeZoom = (_zoom, cPos, uid = null) => {

  if(uid === null){
    uid = getUUID();
    lastAnimating = uid;
  }

  let iPos = coordCanvas2ImSingle(cPos);
  let l = get2dDiff(canvasSize, cPos);
  let rw = canvasSize.w / _zoom,
    rh = canvasSize.h / _zoom,
    rx = iPos.x - ( l.x / canvasSize.w) * rw,
    ry = iPos.y - ( l.y / canvasSize.h) * rh;
  
  // let boundingBool = (rx >= 0 && rx + rw < imageSize.w && ry >= 0 && ry + rh < imageSize.h) || _zoom > zoom;
  //최대범위 제약 풀음
  let boundingBool = true
  let rat = 1.3;
  if(imageSize.w > 2000)
    rat = 1.03;
  let padding = getCoordMult({x:imageSize.w, y:imageSize.h}, rat);
  let _imSize = {}
  _imSize.w = padding.x
  _imSize.h = padding.y
  if (
    (boundingBool) &&
    (_zoom < 5 || _zoom <= zoom) && //최대확대
    (_zoom > calcBasicZoom(_imSize, true) || _zoom >= zoom)    //최소확대
  ) {
      // if(smooth){
      //   let index = 0;
      //   let maxIndex = 10;
      //   let initialSize = screenSize;
      //   let __zoom = zoom;

      //   const inte = setInterval(() => {
      //     screenSize.w = getAnimatedValue(initialSize.w, rw, index, maxIndex)
      //     screenSize.h = getAnimatedValue(initialSize.h, rh, index, maxIndex)
      //     screenSize.x = getAnimatedValue(initialSize.x, rx, index, maxIndex)
      //     screenSize.y = getAnimatedValue(initialSize.y, ry, index, maxIndex)
      //     zoom = getAnimatedValue(__zoom, _zoom, index, maxIndex)
      //     redrawCanvas();
      //     if (++index === maxIndex) {
      //       clearInterval(inte);
      //       (screenSize.w = rw), (screenSize.h = rh), (screenSize.x = rx), (screenSize.y = ry), (zoom = _zoom);
      //       redrawCanvas();
      //     }
      //   }, 20);

      // } else {
        //zoom 문제 해결 : 여기서 screenSize를 ..?
        (screenSize.w = rw), (screenSize.h = rh), (screenSize.x = rx), (screenSize.y = ry), (zoom = _zoom);
        redrawCanvas();
      // }
  } 
  else console.log([rx, ry, rw, rh, _zoom]);
};

//화면 옮기기
const moveScreen = (diff, smooth = false, uid = null) => {
  if(uid === null){
    uid = getUUID();
    lastAnimating = uid;
  }
  //diff == canvas Size
  let ms = getCoordMult(diff, 1/zoom);// screen Size
  
  //checkMove (최대범위 이상 나가지 못하게)
  // let rx = screenSize.x + ms.x,
  //   ry = screenSize.y + ms.y;
  // let ttrx = ms.x >= 0 ? Math.min(rx, imageSize.w - screenSize.w - 1 + 300) : Math.max(rx, -300);
  // let ttry = ms.y >= 0 ? Math.min(ry, imageSize.h - screenSize.h - 1 + 300) : Math.max(ry, -300);
  

  //최대범위 제약 풀음
  let ttrx = screenSize.x + ms.x;
  let ttry = screenSize.y + ms.y;
  

  if(smooth){
    // const befInte = setInterval(() => {
    //   let index = 0;
    //   if (++index === 2) {
    //   clearInterval(befInte);
    //   }
    // }, 200);
    
    let index = 0;
    let maxIndex = 40;
    let initialSize = screenSize;
    
    const inte = setInterval(() => {
      screenSize.x = getAnimatedValue(initialSize.x, ttrx, index, maxIndex)
      screenSize.y = getAnimatedValue(initialSize.y, ttry, index, maxIndex)
      redrawCanvas();
      if(lastAnimating !== uid){
        clearInterval(inte)
      }
      if (++index === maxIndex) {
        (screenSize.x = ttrx), (screenSize.y = ttry);
        redrawCanvas();
        clearInterval(inte);
      }
    }, 15);

  }else {
    screenSize.x = ttrx;
    screenSize.y = ttry;
    redrawCanvas();
  }
  return true;
};



let checkHovering = (e) => {
  if(FLOORCONTEXT != '1F'){
    mapCanvas.style.cursor = "default";
    return;
  }
  let pos = getPointerPosinImage(e);
  pointingBuilding = isinBuildings(pos, buildingList);
  if(pointingBuilding != null && pointingBuilding.ee !== undefined){
    /* 4 eee */
    
    easterEggWipe = addEggcount(easterEggWipe, pointingBuilding, 2, eggWipeListener)
    isHovering = true;
    if(eeClickableBuildingList.includes(pointingBuilding))
      mapCanvas.style.cursor = "pointer"

    // console.log(easterEggWipe, eeWipeOn, drawQ)
    // pushDrawQ(pointingBuilding, "rgba(30,30,30,1)", 4, "hover", "pad", drawQ);
  }else if (inputState && pointingBuilding != null && pointingBuilding !== clickedBuilding) {
    // pushDrawQ(pointingBuilding, null, null, "hover", "clip", drawQ);
    // pushDrawQ(pointingBuilding, null, null, "hover", "clip", drawQ);
  
    mapCanvas.style.cursor = "pointer";
    // pushDrawQ(pointingBuilding, "red", "null", "hover", "stroke", drawQ);
    pushDrawQ(pointingBuilding, "gray", null, "hover", "pad", drawQ);
    pushDrawQ(pointingBuilding, null, null, "hover", "clip", drawQ);
    pushDrawQ(pointingBuilding, icon_pin_gray, null, "hover", "image", true)
    isHovering = true;
  } else if (isHovering && pointingBuilding == null) {
    mapCanvas.style.cursor = "default";
    deleteDrawQ(null, "hover", null, drawQ);
    isHovering = false;
  }
};

let uncheckHovering = () => {
  if(FLOORCONTEXT != 'B1'){
    return;
  }
  deleteDrawQ(null, "hover", null, drawQ);
  isHovering = false;
}

const zoomNmove = (m, uid = null, smooth, _zoom = mapMiddleCoord[CAMPUS]['defaultZoom']) => {
  if(uid === null){
    uid = getUUID();
    lastAnimating = uid;
  }

  let a = coordIm2CanvasSingle(m),
  b = { x: canvasSize.x + canvasSize.w / 2, y: canvasSize.y + canvasSize.h / 2 };

  let c = get2dDiff(b, a);


  if (smooth){
    let index = 0;
    let maxIndex = 25;
    let initialZoom = zoom;
    let d = c;
    d = getCoordMult(d, 1/maxIndex);
    const inte = setInterval(() => {
      moveScreen(d, false, uid);
      changeZoom(getAnimatedValue(initialZoom, _zoom, index, maxIndex), coordIm2CanvasSingle(m), uid)
      redrawCanvas();
      if(lastAnimating !== uid){
        console.log("UID LAN", lastAnimating, uid)
        clearInterval(inte);
      }
      if (++index === maxIndex) {
        redrawCanvas();
        clearInterval(inte);
      }
    }, 15);
  } else {
    moveScreen(c, false, uid);
    changeZoom(_zoom, b, uid);
  }
}

const deleteAvailableFloorsInBuilding = () => {
  toggleBuildingFloor.classList.add("hide")
  toggleBuildingFloor.innerHTML = "";
}

const checkAvailableFloorsInBuilding = building => {
  let avFloor = building.BAVFLOOR;
  if(avFloor === null){
    deleteAvailableFloorsInBuilding();
    return;
  }

  let floors = avFloor.split(",");
  let st = ""

  floors.forEach(floor => {
    st += `<div class="slider my-btn sliderInnerBuildingFloor" data-floor="${building.BID}_${floor}">${floor}</div>`
  })
  
  toggleBuildingFloor.innerHTML = st;
  toggleBuildingFloor.classList.remove("hide")

  Array.from(document.getElementsByClassName("sliderInnerBuildingFloor")).forEach((element) => {
    element.addEventListener("pointerdown", toggleFloorListener);
  });
}

//click building
let clickBuilding = async (building, smooth = true, sidebar = false, uid = null) => {
  if(FLOORCONTEXT != '1F' && !sidebar){
    return;
  } else if(FLOORCONTEXT != '1F' && sidebar) {
    await changeFloor("1F")
  }
  let ee = false;
  if(building.ee !== undefined){
    if(!eeClickableBuildingList.includes(building)){
      return;
    }
    ee =  true;

  }

  // 화면 맞추고 줌
  if(uid === null){
    uid = getUUID();
    lastAnimating = uid;
  }
  if (!sidebarIsOpened()) await toggleSideBar(uid);
  // else if(isPhone()) toggleSideBar();
  
  let av = getAveragePointOfBuilding(building)
  // changeZoom(1.5, coordIm2CanvasSingle(av), true);
  // alignScreenToMiddle(
    //   av, false, isPhone(), true, true
    //   );

  // console.trace(zoom, av, smooth, Math.abs(mapMiddleCoord[CAMPUS]['defaultZoom'] - zoom) < 0.01 && smooth == true)
  if(Math.abs(mapMiddleCoord[CAMPUS]['defaultZoom'] - zoom) < 0.01 && smooth == true)
    alignScreenToMiddle(
      av, smooth, uid
      );
  else
    zoomNmove(av, uid, smooth)
  
    // const befInte = setInterval(() => {
    //   let index = 0;
    //   if (++index W=== 2) {
      
    //   clearInterval(befInte);
    //   }
    // }, 2000);

  
  

  unclickBuilding();
  pointingBuilding = building;
  clickedBuilding = building;

  easterEggClick = addEggcount(easterEggClick, building, 10, eggClickListener)
  // if (pointingBuilding == null) pointingBuilding = building;
  // prevClickingBuilding = pointingBuilding;
  if (
    !drawQ.find((item) => {
      return item.id == pointingBuilding.BID && item.state == "click";
    })
  ) {
    pushDrawQ(building, "rgba(255,255,255,0.8)", 40, "click", "pad", true);
    pushDrawQ(building, null, null, "click", "clip", true)
    pushDrawQ(building, icon_pin_blue, null, "click", "image", true)
  }
    
    // ctx.filter = "none"
    // pushDrawQ(pointingBuilding, "red", null, "hover", "stroke", drawQ);
    // redrawCanvas("blur(5px)")
  isClicking = true;

  
  sidebar_loadBuildingDetail(building)
  if(!ee)
  checkAvailableFloorsInBuilding(building);


};

let unclickBuilding = (building) => {
  deleteDrawQ(building, "click", null, true);
  isClicking = false;
  clickedBuilding = null;
  deleteAvailableFloorsInBuilding();
  sidebar_loadMain();
};

let unclickEveryBuilding = () => {
  unclickBuilding(null);
};

/* ================================ */


/* [handle user interaction] */
let cPosCache = {
  prev: null,
  current: null,
};
let cDistCache = {
  prev: null,
  current: null,
};

/* ---- zoom ----*/
//middle wheel zoom (PC)
let scrollZoom = (e) => {
  if (e.detail) {
    dy = e.detail * -40;
  } else {
    dy = e.wheelDelta;
  }

  let _zoom = zoom;
  if (dy > 0) {
    _zoom += 0.1 * zoom;
  } else {
    _zoom -= 0.1 * zoom;
  }
  changeZoom(_zoom, getPointerPosinCanvas(e));
};

//two finger zoom (mobile)
let pinchZoom = (e) => {
  let a = getPointerPosinCanvas(e[0]),
    b = getPointerPosinCanvas(e[1]);
  updateCache(cDistCache, Math.hypot(a.x - b.x, a.y - b.y));

  let _zoom = zoom;
  if (cDistCache.prev != null) {
    let p = 0;
    let d = cDistCache.current - cDistCache.prev;
    if (d > 0) p = 1;
    else if (d < 0) p = -1;
    //   alert(d)

    _zoom += p * (0.0001 + zoom * 0.05);

    // console.log(_zoom)
    let midx = (a.x + b.x) / 2,
      midy = (a.y + b.y) / 2;
    changeZoom(_zoom, { x: midx, y: midy });
  }
};

//double click/tap zoom (PC & mobile)
let doubleClickZoom = (e) => {
  let _zoom = zoom;
  let rat = 2;
  if (zoom < 2) _zoom = rat * zoom;
  else _zoom = (1 / rat) * zoom;

  changeZoom(_zoom, getPointerPosinCanvas(e));
};

/* ---- drag ----*/
let drag = (e) => {
  // console.trace(e)
  cPosCache = updateCache(cPosCache, getPointerPosinCanvas(e));
  moveScreen(get2dDiff(cPosCache.current, cPosCache.prev));
};

// let dragEnd = (e) => {};

/* ---- click ---- */

let click = (e, check = false) => {
  let pos = getPointerPosinImage(e);
  if (check) pointingBuilding = isinBuildings(pos, buildingList);
  
  if (pointingBuilding != null) {
    clickBuilding(pointingBuilding);
  } else {
    //바닥 클릭시 취소
    unclickBuilding();
  }
};

/* ================================ */

/* [GPS] */

function getLocation() {
  if (navigator.geolocation) {
    // GPS를 지원하면
    navigator.geolocation.getCurrentPosition(
      function (position) {
        alert(position.coords.latitude + " " + position.coords.longitude);
      },
      function (error) {
        console.error(error);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 0,
        timeout: Infinity,
      }
    );
  } else {
    alert("GPS를 지원하지 않습니다");
  }
}