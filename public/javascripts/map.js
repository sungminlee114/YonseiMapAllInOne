/*
이 js파일은 index.ejs의 지도화면에 관한 함수들이 있는 파일입니다.

만든이 : 연세대학교 제55대 총학생회 Mate 사무운영국원, 공과대학 글로벌융합공학부 18학번 이성민 (starmin114@yonsei.ac.kr)
*/

/* -- load image -- */ 
let MAPS = {
  '1F':new Image(),
  'B1F':new Image()
};
let drawQ = [];
let isHovering = false;
let isClicking = false;
let pointingBuilding = null;
let clickedBuilding = null;
let lastAnimating = null;
let mapBackup = null;
let imgClo = null;

for (const[k, v] of Object.entries(MAPS)){
  MAPS[k].src = `./images/${CAMPUS}/maps/${k}.png`;
  MAPS[k].addEventListener("load",() => {
    console.log(`load img ${CAMPUS} ${k}`);
    if(k == FLOORCONTEXT){
      changeMap(k)
    }
  },false);
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
   mapBackup = [drawQ, clickedBuilding];
  }
}

const restoreMap = () => {
  if(mapBackup !== null){
    drawQ = mapBackup[0];
    clickedBuilding = mapBackup[1];
    if(clickedBuilding !== null){
      clickBuilding(clickedBuilding);
      return;
    }
    resizeCanvas(true);
  }
}
const changeMap = async (fc) => {
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
  if(fc == '1F')
    restoreMap();
  else
    resizeCanvas(true);
}


/* -- [utils] -- */
let wrapFunction = function (fn, context, params) {
  return function () {
    fn.apply(context, params);
  };
};

function getUUID() { // UUID v4 generator in JavaScript (RFC4122 compliant)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 3 | 8);
    return v.toString(16);
  });
}

//두 점좌표의 차이(f - i) 반환
let get2dDiff = (i, f) => {
  return { x: f.x - i.x, y: f.y - i.y };
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
  buildingList.some((building) => {
    if (isinArea(ipos, building.area) && isinArea(ipos, currentScreenBoundary)) {
      ret = building;
      return true;
    } else return false;
  });
  return ret;
};

//그림좌표계상의 구역들을 색칠
let fillByImageVertex = (iarea, color, filter = null) => {
  let tFilter = ctx.filter
  if (filter !== null){
    ctx.filter = filter
  }
  ctx.beginPath();
  sarea = coordIm2Canvas(iarea);
  ctx.moveTo(sarea[0].x, sarea[0].y);
  for (let i = 1; i < sarea.length; i++) {
    ctx.lineTo(sarea[i].x, sarea[i].y);
  }

  ctx.fillStyle = color;
  ctx.fill();
  if (filter !== null){
    ctx.filter = tFilter
  }
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

const padByImageVertex = (area, color, filter = null) => {
  ctx.save();
  if (filter !== null){
    ctx.filter = filter
  }
  sarea = coordIm2Canvas(area);
  ctx.shadowColor = color;
  ctx.shadowBlur = 25;
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
  //이스터에그
  if (drawQ.findIndex(el => el.state == state && el.id == building.BID && el.type == type) == -1) {
    if (type == "stroke")
      f = wrapFunction(strokeByImageVertex, this, [building.area, colorOrImage, filter]);
    else if (type == "fill")
      f = wrapFunction(fillByImageVertex, this, [building.area, colorOrImage, filter]);
    else if (type == "clip")
      f = wrapFunction(clipByImageVertex, this, [building.area, colorOrImage, filter]);
    else if (type == "pad")
      f = wrapFunction(padByImageVertex, this, [building.area, colorOrImage, filter]);
    else if (type.startsWith("image"))
      f = wrapFunction(drawImageOnTheCOGOfImageVertex, this, [building, colorOrImage, filter])
    
      drawQ.push({ func: f, id: building.BID, state: state, type: type });
    if (draw) redrawCanvas();
    // console.log("push", building, state, Q)
  }
};

// draw할 필요 없는것들을 제외
let deleteDrawQ = (building, state, draw = true) => {
  drawQ = drawQ.filter(function (item) {
    if (building != null && state != null)
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
    'B1F' : {
      x : 1112,
      y : 2045
    },
  },
  songdo: {
    '1F' : {
      x : 500,
      y : 300
    },
    'B1F' : {
      x : 500,
      y : 300
    },
  }
};

const mapInitialZoomVal = {
  sinchon: 2,
  songdo: 1.3
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
let alignScreenToMiddle = (m, isph = false, smooth = false) => {
  // if (zoomReset) {
  //   let _zoom = Math.max(canvasSize.w / imageSize.w, canvasSize.h / imageSize.h) + 1;
  //   changeZoom(_zoom, { x: canvasSize.x, y: canvasSize.y }, true);
  // }
  
  let a = coordIm2CanvasSingle(m),
  b = { x: canvasSize.x + canvasSize.w / 2, y: canvasSize.y + canvasSize.h / 2 };
  if(isph){
    b.y -= 95;
  }
  let c = get2dDiff(b, a);
  
  console.log(m, a, b, screenSize)
  moveScreen(c, smooth);

  //redraw안에서 m 업데이트시켜줌.
  redrawCanvas();
};

//화면내에 그림을 채워줌.
let redrawCanvas = (filter = null) => {
  if(filter !== null){
    ctx.filter = filter
  }
  ctx.clearRect(canvasSize.x,canvasSize.y,canvasSize.w ,canvasSize.h );
  ctx.drawImage(imgClo, screenSize.x, screenSize.y, screenSize.w, screenSize.h, canvasSize.x, canvasSize.y, canvasSize.w, canvasSize.h);
  screenMiddle.x = screenSize.x + screenSize.w / 2;
  screenMiddle.y = screenSize.y + screenSize.h / 2;
  if(filter !== null){
    ctx.filter = "none"
  }
  //길, 건물 outline등을 모두 그려줘야함.
  drawQ.forEach((q) => {
    q.func();
  });
};

let resizeCanvas = first => {
  //canvas
  let rect = mapContainer.getBoundingClientRect();
  if(!isNaN(rect.width) && !isNaN(rect.height) && rect.width > 0 && rect.height > 0){
  canvasSize.w = rect.width;
  canvasSize.h = rect.height;
  ctx.canvas.width = canvasSize.w;
  ctx.canvas.height = canvasSize.h;

  //최적의 zoom으로 초기화
  if (first){
    if(CAMPUS == 'sinchon' && FLOORCONTEXT == '1F'){
      zoom = Math.max(canvasSize.w / imageSize.w, canvasSize.h / imageSize.h) + 1;
    // } else if (CAMPUS == 'sinchon' && FLOORCONTEXT == 'B1F'){
    //   zoom = Math.max(canvasSize.w / imageSize.w, canvasSize.h / imageSize.h) - 0.3;
    } else if(CAMPUS == 'songdo'){
      zoom = Math.max(canvasSize.w / imageSize.w, canvasSize.h / imageSize.h);
    } else {
      zoom = Math.max(canvasSize.w / imageSize.w, canvasSize.h / imageSize.h);
    }
  }

  screenSize.w = Math.floor(canvasSize.w / zoom);
  screenSize.h = Math.floor(canvasSize.h / zoom);

  if (first){
    if(mapMiddleCoord[CAMPUS][FLOORCONTEXT] !== undefined)
      alignScreenToMiddle(mapMiddleCoord[CAMPUS][FLOORCONTEXT]);
    else
      alignScreenToMiddle({x: screenSize.x/2, y: screenSize.y/2});
  }
  else
    alignScreenToMiddle(screenMiddle);
  }
};



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
  if (
    ((rx >= 0 && rx + rw < imageSize.w && ry >= 0 && ry + rh < imageSize.h) || _zoom > zoom) &&
    _zoom < 5 &&
    _zoom > 0
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
        (screenSize.w = rw), (screenSize.h = rh), (screenSize.x = rx), (screenSize.y = ry), (zoom = _zoom);
        redrawCanvas();
      // }
  } 
  else console.log([rx, ry, rw, rh, _zoom]);
};

//화면 옮기기
const moveScreen = (diff, smooth = false, uid = null) => {
  let mcx = diff.x,
  mcy = diff.y;
  let msx = mcx / zoom;
  let msy = mcy / zoom;
  
  //checkMove (최대범위 이상 나가지 못하게)
  let rx = screenSize.x + msx,
    ry = screenSize.y + msy;
  let ttrx = msx >= 0 ? Math.min(rx, imageSize.w - screenSize.w - 1) : Math.max(rx, 0);
  let ttry = msy >= 0 ? Math.min(ry, imageSize.h - screenSize.h - 1) : Math.max(ry, 0);
    
  if(smooth){
    if(uid === null){
      uid = getUUID();
      lastAnimating = uid;
    }
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
  if (inputState && pointingBuilding != null) {
    mapCanvas.style.cursor = "pointer";
    pushDrawQ(pointingBuilding, "red", "null", "hover", "stroke", drawQ);
    // pushDrawQ(pointingBuilding, "white", null, "hover", "pad", drawQ);
    // pushDrawQ(pointingBuilding, null, null, "hover", "clip", drawQ);
    isHovering = true;
  } else if (isHovering && pointingBuilding == null) {
    mapCanvas.style.cursor = "default";
    deleteDrawQ(null, "hover", drawQ);
    isHovering = false;
  }
};

let uncheckHovering = () => {
  if(FLOORCONTEXT != 'B1F'){
    return;
  }
  deleteDrawQ(null, "hover", drawQ);
  isHovering = false;
}

const zoomNmove = (m, isph, uid = null) => {
  if(uid === null){
    uid = getUUID();
    lastAnimating = uid;
  }

  let a = coordIm2CanvasSingle(m),
  b = { x: canvasSize.x + canvasSize.w / 2, y: canvasSize.y + canvasSize.h / 2 };
  if(isph){
    b.y -= 95;
  }
  let c = get2dDiff(b, a);

  let index = 0;
  let maxIndex = 25;
  let initialZoom = zoom;
  let d = c;
  d.x = d.x / maxIndex;
  d.y = d.y / maxIndex;
  const inte = setInterval(() => {
    moveScreen(d, false, uid);
    changeZoom(getAnimatedValue(initialZoom, 1.5, index, maxIndex), coordIm2CanvasSingle(m), uid = uid)
    redrawCanvas();
    if(lastAnimating !== uid){
      clearInterval(inte);
    }
    if (++index === maxIndex) {
      redrawCanvas();
      clearInterval(inte);
    }
  }, 15);

}

let toggleBuildingFloorListener = (e) => {
  e.preventDefault();
  e.stopPropagation();
  let currBut = e.target;
  if(FLOORCONTEXT == currBut.dataset.floor){
    return;
  }
  let context = currBut.parentNode;
  
  Array.from(document.getElementsByClassName("sliderInnerFloor")).forEach(el => {
    el.classList.remove("selected");
  })

  Array.from(document.getElementsByClassName("sliderInnerBuildingFloor")).forEach(el => {
    el.classList.remove("selected");
  })

  currBut.classList.add("selected");
  FLOORCONTEXT = currBut.dataset.floor;
  changeMap(FLOORCONTEXT)

  return false;
};

const checkAvailableFloorsInBuilding = building => {
  let avFloor = building.BAVFLOOR;
  if(avFloor === null){
    toggleBuildingFloor.classList.add("hide")
    toggleBuildingFloor.innerHTML = "";
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
    element.addEventListener("pointerdown", toggleBuildingFloorListener);
  });
}

//click building
let clickBuilding = (building) => {
  if(FLOORCONTEXT != '1F'){
    return;
  }
  console.log(building.name, building.area)
  // 화면 맞추고 줌
  if (!sidebarIsOpened()) toggleSideBar();
  else if(isPhone()) toggleSideBar(false);

  let av = getAveragePointOfBuilding(building)
  // changeZoom(1.5, coordIm2CanvasSingle(av), true);
  // alignScreenToMiddle(
  //   av, false, isPhone(), true, true
  //   );
  if(Math.abs(1.5 - zoom) < 0.01)
    alignScreenToMiddle(
      av, isPhone(), true
      );
  else
    zoomNmove(av, isPhone())
  
    // const befInte = setInterval(() => {
    //   let index = 0;
    //   if (++index === 2) {
      
    //   clearInterval(befInte);
    //   }
    // }, 2000);

  
  

  unclickBuilding();
  pointingBuilding = building;
  clickedBuilding = building;
  // if (pointingBuilding == null) pointingBuilding = building;
  // prevClickingBuilding = pointingBuilding;
  if (
    !drawQ.find((item) => {
      return item.id == pointingBuilding.BID && item.state == "click";
    })
  )
    
    // ctx.filter = "none"
    // pushDrawQ(pointingBuilding, "red", null, "hover", "stroke", drawQ);
    pushDrawQ(building, "gray", null, "click", "pad", true);
    pushDrawQ(building, "rgba(255,0,0,0.0)", null, "click", "clip", true)
    pushDrawQ(building, icon_pin_blue, null, "click", "image", true)
    // redrawCanvas("blur(5px)")
  isClicking = true;

  
  sidebar_loadBuildingDetail(building)
  checkAvailableFloorsInBuilding(building);


};

let unclickBuilding = (building) => {
  deleteDrawQ(building, "click", true);
  isClicking = false;
  clickedBuilding = null;
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
    _zoom += 0.1;
  } else {
    _zoom -= 0.1;
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