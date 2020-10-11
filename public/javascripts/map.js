/*
이 js파일은 index.ejs의 지도화면에 관한 함수들이 있는 파일입니다.

만든이 : 연세대학교 제55대 총학생회 Mate 사무운영국원, 공과대학 글로벌융합공학부 18학번 이성민 (starmin114@yonsei.ac.kr)
*/

/* -- [utils] -- */
let wrapFunction = function (fn, context, params) {
  return function () {
    fn.apply(context, params);
  };
};

//두 점좌표의 차이(f - i) 반환
let get2dDiff = (i, f) => {
  return { x: f.x - i.x, y: f.y - i.y };
};

const getAnimatedValue = (initial, final, index, max_index) =>{
  const func = Math.sin
  
  const ret = (final - initial) * func((index / max_index) * (Math.PI / 2)) + initial;
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

//한 건물의 area의 평균 구하기
let getAveragePointOfArea = (area) => {
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
let fillByImageVertex = (iarea, color) => {
  ctx.beginPath();
  sarea = coordIm2Canvas(iarea);
  ctx.moveTo(area[0].x, sarea[0].y);
  for (let i = 1; i < sarea.length; i++) {
    ctx.lineTo(area[i].x, sarea[i].y);
  }
  ctx.fillStyle = color;
  ctx.fill();
};

//그림좌표계상의 구역들의 선을 그림
let strokeByImageVertex = (area, color) => {
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

// draw할 것들을 저장
let pushDrawQ = (building, color, state, type, draw = true) => {
  let f;
  if (type == "stroke")
    f = wrapFunction(strokeByImageVertex, this, [building.area, color]);
  else if (type == "fill")
    f = wrapFunction(fillByImageVertex, this, [building.area, color]);
  drawQ.push({ func: f, id: building.id, state: state });
  if (draw) redrawCanvas();
  // console.log("push", building, state, Q)
};

// draw할 필요 없는것들을 제외
let deleteDrawQ = (building, state, draw = true) => {
  drawQ = drawQ.filter(function (item) {
    if (building != null && state != null)
      return item.id != building.id || item.state != state;
    else if (building == null) return item.state != state;
    else if (state == null) return item.id != building.id;
    else return false;
  });
  if (draw) redrawCanvas();
};

/* ================================ */

/* [drawing functions] */

//각 지도의 중앙좌표 상수
const mapMiddleCoord = {
  sinchon: {
    x : 1112,
    y : 2045
  }
};

let zoom = 2;

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
let drawQ = [];

let isHovering = false,
  isClicking = false;

/* -- load image -- */ 

let imgClo = new Image();
imgClo.src = "/images/sinchon_mainmap.png";

imgClo.addEventListener("load",() => {
    console.log("load img");
    imageSize.w = imgClo.width;
    imageSize.h = imgClo.height;
    resizeCanvas(true);
  },false);

 /* -- functions -- */
  
// 그림좌표계의 점좌표를 화면의 정중앙으로 이동
let alignScreenToMiddle = (m, zoomReset = false, isph = false) => {
  if (zoomReset) {
    let _zoom = Math.max(canvasSize.w / imageSize.w, canvasSize.h / imageSize.h) + 1;
    changeZoom(_zoom, { x: canvasSize.x, y: canvasSize.y }, true);
  }
  
  let a = coordIm2CanvasSingle(m),
  b = { x: canvasSize.x + canvasSize.w / 2, y: canvasSize.y + canvasSize.h / 2 };
  if(isph){
    b.y -= 95;
  }
  let c = get2dDiff(b, a);

  moveScreen(c, true);

  //redraw안에서 m 업데이트시켜줌.
  redrawCanvas();
};

//화면내에 그림을 채워줌.
let redrawCanvas = () => {
  ctx.drawImage(imgClo, screenSize.x, screenSize.y, screenSize.w, screenSize.h, canvasSize.x, canvasSize.y, canvasSize.w, canvasSize.h);
  screenMiddle.x = screenSize.x + screenSize.w / 2;
  screenMiddle.y = screenSize.y + screenSize.h / 2;
  
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
  if (first)
  zoom = Math.max(canvasSize.w / imageSize.w, canvasSize.h / imageSize.h) + 1;

  screenSize.w = Math.floor(canvasSize.w / zoom);
  screenSize.h = Math.floor(canvasSize.h / zoom);

  if (first)
    alignScreenToMiddle(mapMiddleCoord.sinchon);
  else
    alignScreenToMiddle(screenMiddle);
  }
};



//zoom하기
let changeZoom = (_zoom, cPos, smooth) => {
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
      if(smooth){
        let index = 0;
        let maxIndex = 10;
        let initialSize = screenSize;
        let __zoom = zoom;

        const inte = setInterval(() => {
          screenSize.w = getAnimatedValue(initialSize.w, rw, index, maxIndex)
          screenSize.h = getAnimatedValue(initialSize.h, rh, index, maxIndex)
          screenSize.x = getAnimatedValue(initialSize.x, rx, index, maxIndex)
          screenSize.y = getAnimatedValue(initialSize.y, ry, index, maxIndex)
          zoom = getAnimatedValue(__zoom, _zoom, index, maxIndex)
          redrawCanvas();
          if (++index === maxIndex) {
            clearInterval(inte);
            (screenSize.w = rw), (screenSize.h = rh), (screenSize.x = rx), (screenSize.y = ry), (zoom = _zoom);
            redrawCanvas();
          }
        }, 10);

      } else {
        (screenSize.w = rw), (screenSize.h = rh), (screenSize.x = rx), (screenSize.y = ry), (zoom = _zoom);
        redrawCanvas();
      }
  } 
  else console.log([rx, ry, rw, ry, _zoom]);
};

//화면 옮기기
const moveScreen = (diff, large = false) => {
  let mcx = diff.x,
    mcy = diff.y;
  let msx = mcx / zoom;
  let msy = mcy / zoom;

  //checkMove (최대범위 이상 나가지 못하게)
  let rx = screenSize.x + msx,
    ry = screenSize.y + msy;
  screenSize.x = msx >= 0 ? Math.min(rx, imageSize.w - screenSize.w - 1) : Math.max(rx, 0);
  screenSize.y = msy >= 0 ? Math.min(ry, imageSize.h - screenSize.h - 1) : Math.max(ry, 0);

  redrawCanvas();
  return true;
};

let pointingBuilding = null,
  prevClickingBuilding;

let checkHovering = (e) => {
  let pos = getPointerPosinImage(e);
  pointingBuilding = isinBuildings(pos, buildingList);
  if (inputState && pointingBuilding != null) {
    mapCanvas.style.cursor = "pointer";
    pushDrawQ(pointingBuilding, "red", "hover", "stroke", drawQ);
    isHovering = true;
  } else if (isHovering && pointingBuilding == null) {
    mapCanvas.style.cursor = "default";
    deleteDrawQ(null, "hover", "stroke", drawQ);
    isHovering = false;
  }
};

let uncheckHovering = () => {
  deleteDrawQ(null, "hover", "stroke", drawQ);
  isHovering = false;
}

//click building
let clickBuilding = (building) => {
  // 화면 맞추고 줌
  if (!sidebarIsOpened()) toggleSideBar();
  else if(isPhone()) toggleSideBar(false);

  let av = getAveragePointOfArea(building.area)
  alignScreenToMiddle(
    av, false, isPhone()
  );
  
  changeZoom(1.5, coordIm2CanvasSingle({ x: av.x, y:av.y }), true);
  

  unclickBuilding();
  pointingBuilding = building
  // if (pointingBuilding == null) pointingBuilding = building;
  // prevClickingBuilding = pointingBuilding;
  if (
    !drawQ.find((item) => {
      return item.id == pointingBuilding.id && item.state == "click";
    })
  )
    pushDrawQ(building, "red", "click", "stroke");

  isClicking = true;

  
  sidebar_loadBuildingDetail(building)
};

let unclickBuilding = (building) => {
  deleteDrawQ(building, "click");
  isClicking = false;
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

let dragEnd = (e) => {};

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