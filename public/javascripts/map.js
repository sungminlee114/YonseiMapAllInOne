// utils
var wrapFunction = function(fn, context, params) {
  return function() {
    fn.apply(context, params);
  };
};

var alignViewToMiddle = (m, zoomReset = false) => {
  mx = m.x;
  my = m.y;
  if(zoomReset){
    var _zoom = Math.max(cw / iw, ch / ih) + 1;
    changeZoom(_zoom, ({x:cx, y:cy}))
  }
    
  var a = coordIm2CanvasSingle(m),
    b = { x: cx + cw / 2, y: cy + ch / 2 };
  var c = get2dDiff(b, a);
  // var aa = Math.abs(c.x), ab = Math.abs(c.y);
  // for(var i = 0; i < Math.min(aa, ab); i++){
  //     if(moveView() == false)
  //         break;

  // }
  // console.log(m)
  moveView(c, true);
  redrawCanvas();
};

let coordIm2CanvasSingle = pos => {
  var rx = cx + ((pos.x - sx) / sw) * cw,
    ry = cy + ((pos.y - sy) / sh) * ch;
  return { x: rx, y: ry };
};

let coordIm2Canvas = imVertexs => {
  var ret = [];
  imVertexs.forEach(imVertex => {
    // if (rx >= cx && rx < cx + cw && ry >= cy && ry < cy + ch) {
    ret.push(coordIm2CanvasSingle(imVertex));
    // }
  });
  return ret;
};

let getPointerPosinCanvas = e => {
  return {
    x: e.pageX - mapContainer[0].getBoundingClientRect().left - window.scrollX,
    y: e.pageY - mapContainer[0].getBoundingClientRect().top - window.scrollY
  };
};

let getPointerPosinImage = e => {
  let canvasPos = getPointerPosinCanvas(e);

  var rx = sx + (canvasPos.x / cw) * sw,
    ry = sy + (canvasPos.y / ch) * sh;

  return { x: rx, y: ry };
};

let updateCache = (cache, data) => {
  cache.prev = cache.current;
  cache.current = data;
  // console.log("updateCache1",cache.prev)
  return cache;
};

let get2dDiff = (i, f) => {
  // console.log("diff",i,f)
  return { x: f.x - i.x, y: f.y - i.y };
};

let isinArea = (pos, area) => {
  //send +x ray, even number intersect : outside
  var cnt = false;
  for (var i = 0; i < area.length; i++) {
    var j = i + 1;
    if (j == area.length) {
      j = 0;
    }

    //between y
    if ((area[i].y - pos.y) * (area[j].y - pos.y) < 0) {
      var a =
        ((pos.y - area[j].y) / (area[i].y - area[j].y)) *
          (area[i].x - area[j].x) +
        area[j].x;
      if (a == pos.x) {
        return true;
      } else if (a > pos.x) {
        cnt = !cnt;
      }
    }
  }
  return cnt;
};

let isinBuildings = (pos, buildingList) => {
  var ret = null;
  buildingList.some(building => {
    if (isinArea(pos, building.area)) {
      ret = building;
      return true;
    } else return false;
  });
  return ret;
};

let fillByImageVertex = (area, color) => {
  ctx.beginPath();
  area = coordIm2Canvas(area);
  ctx.moveTo(area[0].x, area[0].y);
  for (var i = 1; i < area.length; i++) {
    ctx.lineTo(area[i].x, area[i].y);
  }
  ctx.fillStyle = color;
  ctx.fill();
};

let strokeByImageVertex = (area, color) => {
  ctx.beginPath();
  area = coordIm2Canvas(area);
  // console.log(area)
  ctx.moveTo(area[0].x, area[0].y);
  for (var i = 1; i < area.length; i++) {
    ctx.lineTo(area[i].x, area[i].y);
  }
  ctx.lineTo(area[0].x, area[0].y);
  ctx.strokeStyle = color;
  ctx.stroke();
};

let pushDrawQ = (building, color, state, type, draw = true) => {
  var f;
  if (type == "stroke")
    f = wrapFunction(strokeByImageVertex, this, [building.area, color]);
  else if (type == "fill")
    f = wrapFunction(fillByImageVertex, this, [building.area, color]);
  drawQ.push({ func: f, id: building.id, state: state });
  if (draw) redrawCanvas();
  // console.log("push", building, state, Q)
};

let deleteDrawQ = (building, state, draw = true) => {
  drawQ = drawQ.filter(function(item) {
    // console.log(item.id, building.id, item.state, state)
    if (building != null && state != null)
      return item.id != building.id || item.state != state;
    else if (building == null) return item.state != state;
    else if (state == null) return item.id != building.id;
    else return false;
  });
  // console.log("delete", building, state, drawQ)
  if (draw) redrawCanvas();
};

// method

var changeZoom = (_zoom, o) => {
  // if(_zoom != null)
  var l1x = o.x - cx,
    l1y = o.y - cy,
    osx = sx + (l1x / cw) * sw,
    osy = sy + (l1y / ch) * sh;

  var rw = cw / _zoom,
    rh = ch / _zoom,
    rx = osx - (l1x / cw) * rw,
    ry = osy - (l1y / ch) * rh;

  // console.log([ox, oy, rx, ry, rw, ry, _zoom]);

  if (
    ((rx >= 0 && rx + rw < iw && ry >= 0 && ry + rh < ih) || _zoom > zoom) &&
    _zoom < 5 &&
    _zoom > 0
  ) {
    (sw = rw), (sh = rh), (sx = rx), (sy = ry), (zoom = _zoom);
    mx = sx + sw / 2;
    my = sy + sh / 2;
    // redrawCanvas();
    //
  } else console.log([rx, ry, rw, ry, _zoom]);
  // console.log(_zoom, ox, oy, l1x/cw, l1y/cw, "/n", (l1x+l2x)/cw,  osx, osy, sx, sy);
  redrawCanvas();
};

var moveView = (diff, large = false) => {
  var mcx = diff.x,
    mcy = diff.y;
  var msx = mcx / zoom;
  var msy = mcy / zoom;

  //checkMove
  var rx = sx + msx,
    ry = sy + msy;
    sx = msx >= 0 ? Math.min(rx, iw - sw - 1) : Math.max(rx, 0);
    sy = msy >= 0 ? Math.min(ry, ih - sh - 1) : Math.max(ry, 0);

    // sx = rx;
    // sy = ry;
    // console.log(msx)
    redrawCanvas();
    return true;
    //   mx =

  //   console.log([mcx, mcy])
//   else {
//     if (
//       (rx >= 0 && rx + sw < iw && ry >= 0 && ry + sh < ih) ||
//       (rx < 0 && msx > 0) ||
//       (rx + sw >= iw && msx < 0) ||
//       (ry < 0 && msy > 0) ||
//       (ry + sh >= ih && msy < 0)
//     ) {
//       sx += msx;
//       sy += msy;
//       mx += msx;
//       my += msy;
//       if (!large) redrawCanvas();
//       return true;
//     } else console.log([rx, rx + sw, iw, sy, ry + sh, ih]);
//   }
//   return false;
};

var click = (e, check = false) => {
  let pos = getPointerPosinImage(e);
  if (check) pointingBuilding = isinBuildings(pos, buildingList);
  if (pointingBuilding != null) {
    clickBuilding(pointingBuilding);
  } else if (isClicking && pointingBuilding == null) {
    unclickBuilding(prevClickingBuilding);
  }
};

var pointingBuilding = null,
  prevClickingBuilding;

let checkHovering = e => {
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

var cPosCache = {
  prev: null,
  current: null
};

var cDistCache = {
  prev: null,
  current: null
};

// let click = (e) =>{

// };

// drag and Mobile zoom
// var startX, startY;
// var isDrag = false;
// var prevDiff = -1;
// var dragStart = e => {
//   if (e.touches != undefined) {
//     e.preventDefault();
//     e.stopPropagation();
//   }
//   startX = e.pageX;
//   startY = e.pageY;
//   if (isDrag == false) {
//     //check click building
//     if (true) {
//       isDrag = true;
//     }
//   }
// };

let drag = e => {
  cPosCache = updateCache(cPosCache, getPointerPosinCanvas(e));
  // console.log("drag1",e)
  // console.log("drag2",cPosCache.prev)
  // console.log("drag2",cPosCache)
  moveView(get2dDiff(cPosCache.current, cPosCache.prev));
};

var dragEnd = e => {};

// mapCanvas.addEventListener("touchcancel", dragStop, { passive: false });

// PC zoom

var zoomScroll = e => {
  //   if ($("#mapCanvas:hover").length != 0) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //   }

  if (e.detail) {
    dy = e.detail * -40;
  } else {
    dy = e.wheelDelta;
  }

  var _zoom = zoom;
  if (dy > 0) {
    _zoom += 0.1;
  } else {
    _zoom -= 0.1;
  }
  changeZoom(_zoom, getPointerPosinCanvas(e));
};

let pinchZoom = e => {
  var a = getPointerPosinCanvas(e[0]),
    b = getPointerPosinCanvas(e[1]);
  updateCache(cDistCache, Math.hypot(a.x - b.x, a.y - b.y));

  var _zoom = zoom;
  if (cDistCache.prev != null) {
    var p = 0;
    var d = cDistCache.current - cDistCache.prev;
    if (d > 0) p = 1;
    else if (d < 0) p = -1;
    //   alert(d)

    _zoom += p * (0.0001 + zoom * 0.05);

    // console.log(_zoom)
    var midx = (a.x + b.x) / 2,
      midy = (a.y + b.y) / 2;
    changeZoom(_zoom, { x: midx, y: midy });
  }
};

let doubleClickZoom = e => {
  var _zoom = zoom;
  // console.log(zoom)
  var rat = 2;
  if (zoom < 2) _zoom = rat * zoom;
  else _zoom = (1 / rat) * zoom;

  changeZoom(_zoom, getPointerPosinCanvas(e));
};

var zoom = 2;
var pixelRatio;
var sx,
  sy,
  sw,
  sh,
  cx = 0,
  cy = 0,
  cw,
  ch,
  mx,
  my;

var iw, ih;

var mapCanvas = document.getElementById("mapCanvas");
var ctx = mapCanvas.getContext("2d");
var imgClo = new Image();
    imgClo.src = "/images/sinchon_mainmap.png";

    imgClo.addEventListener("load",
    function() {
      console.log("load img")
      initCanvas();
    }, false)

var drawQ = [];

var redrawCanvas = () => {
  ctx.drawImage(imgClo, sx, sy, sw, sh, cx, cy, cw, ch);
  // console.log("redraw", drawQ)
  drawQ.forEach(q => {
    q.func();
  });
};

var resizeCanvas = () => {
  //canvas
  cw = mapContainer[0].getBoundingClientRect().width;
  ch = mapContainer[0].getBoundingClientRect().height;
  ctx.canvas.width = cw;
  ctx.canvas.height = ch;
  sw = Math.floor(cw / zoom);
  sh = Math.floor(ch / zoom);
  alignViewToMiddle({ x: mx, y: my });
  // redrawCanvas();
};

var initCanvas = () => {
  console.log("initCanvas")
  // imgClo = new Image();

  cw = mapContainer[0].getBoundingClientRect().width;
  ch = mapContainer[0].getBoundingClientRect().height;
  ctx.canvas.width = cw;
  ctx.canvas.height = ch;
  //페이지 로드후 이미지가 로드 되었을 때 이미지 출력
  // imgClo.addEventListener(
  //   "load",
  //   function() {
      // console.log("load")
      //canvas.drawImage() 함수를 사용하여 이미지 출력
      //drawImage ( image, x, y )
      //drawImage ( image, x, y, width, height )
      //drawImage ( image, sx, sy, sWidth, sHeight, x, y, Width, Height )
      iw = imgClo.width;
      ih = imgClo.height;
      zoom = Math.max(cw / iw, ch / ih) + 1;

      sw = Math.floor(cw / zoom);
      sh = Math.floor(ch / zoom);
      mx = 1112;
      my = 2045;
      sx = 0;
      sy = 0;
      alignViewToMiddle({ x: mx, y: my });
      ctx.drawImage(imgClo, sx, sy, sw, sh, cx, cy, cw, ch);
      // drawQ.push(wrapDrawImage, this, []);
  //   },
  //   false
  // );

  //이미지 경로 설정
  // imgClo.src = "/images/sinchon_mainmap.png";
};
var isHovering = false,
  isClicking = false;

//click building
var clickBuilding = building => {
  unclickBuilding(prevClickingBuilding);
  if (pointingBuilding == null) pointingBuilding = building;
  prevClickingBuilding = pointingBuilding;
  if (
    !drawQ.find(item => {
      return item.id == pointingBuilding.id && item.state == "click";
    })
  )
    pushDrawQ(building, "red", "click", "stroke");
  openUI(building);
  isClicking = true;
};

let unclickBuilding = building => {
  deleteDrawQ(building, "click");
  closeUI();
  isClicking = false;
};

function getLocation() {
  if (navigator.geolocation) { // GPS를 지원하면
    navigator.geolocation.getCurrentPosition(function(position) {
      alert(position.coords.latitude + ' ' + position.coords.longitude);
    }, function(error) {
      console.error(error);
    }, {
      enableHighAccuracy: false,
      maximumAge: 0,
      timeout: Infinity
    });
  } else {
    alert('GPS를 지원하지 않습니다');
  }
}

