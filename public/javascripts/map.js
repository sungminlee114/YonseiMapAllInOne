// utils
var getXYfromWHnMid = (w, h, mx, my) => {
    x = mx - Math.floor(w / 2);
    y = my - Math.floor(h / 2);
    return [x, y];
}

// method

var changeZoom = (_zoom, ox, oy) => {

    // if(_zoom != null)
    var l1x = ox - cx - mapCanvas.getBoundingClientRect().left,
        l1y = oy - cy - mapCanvas.getBoundingClientRect().top - window.pageYOffset,

        osx = (sx + (l1x / cw) * sw),
        osy = (sy + (l1y / ch) * sh);

    var rw = Math.floor(cw / _zoom),
        rh = Math.floor(ch / _zoom),
        rx = Math.floor((osx - (l1x / cw) * rw)),
        ry = Math.floor((osy - (l1y / ch) * rh));

    if (((rx >= 0 && rx + rw < iw && ry >= 0 && ry + rh < ih) || (_zoom > zoom)) && _zoom < 5 && _zoom > 0) {

        sw = rw, sh = rh, sx = rx, sy = ry, zoom = _zoom;
        mx = sx + Math.floor(sw / 2);
        my = sy + Math.floor(sh / 2);
        redrawCanvas();
        // console.log([ox, oy, rx, ry, rw, ry, _zoom]);
    } else console.log([rx, ry, rw, ry, _zoom]);
    // console.log(_zoom, ox, oy, l1x/cw, l1y/cw, "/n", (l1x+l2x)/cw,  osx, osy, sx, sy);
    redrawCanvas();
}

var moveView = (mcx, mcy) => {
    var msx = Math.floor(mcx / zoom);
    var msy = Math.floor(mcy / zoom);

    //checkMove
    var rx = sx + msx,
        ry = sy + msy;

    // console.log([sx, rx, iw, sy, ry, ih])

    if (rx >= 0 && rx + sw < iw && ry >= 0 && ry + sh < ih ||
        (rx < 0 && msx > 0) || (rx + sw >= iw && msx < 0) || (ry < 0 && msy > 0) || (ry + sh >= ih && msy < 0)) {

        sx += msx; sy += msy;
        mx += msx; my += msy;
        redrawCanvas();
    } else console.log([rx, rx + sw, iw, sy, ry + sh, ih]);
}

// drag and Mobile zoom
var startX, startY;
var isDrag = false;
var prevDiff = -1;
var dragStart = (e) => {
    if (e.touches != undefined) {
        e.preventDefault();
        e.stopPropagation();
    }
    startX = e.clientX
    startY = e.clientY
    if (isDrag == false) {
        //check click building
        if (true) {
            isDrag = true;
        }
    }
}

var dragging = (e) => {

    //zoom
    if (e.touches != undefined && e.touches.length == 2) {
        e.preventDefault();
        e.stopPropagation();
        e = e.touches
        isDrag = false;
        var curDiff = Math.hypot(e[0].pageX - e[1].pageX, e[0].pageY - e[1].pageY);

        var _zoom = zoom;
        if (prevDiff > 0) {
            if (curDiff > prevDiff) {
                //zoom속도 맞추기
                _zoom += 0.05 + zoom * 0.001;
            } else if (curDiff < prevDiff) {
                _zoom -= 0.05 + zoom * 0.001;
            }

            var midx = (e[0].pageX + e[1].pageX) / 2,
                midy = (e[0].pageY + e[1].pageY) / 2;
            changeZoom(_zoom, midx, midy)
        }

        prevDiff = curDiff;
    } else if (isDrag) { //drag
        e.preventDefault();
        e.stopPropagation();
        if (e.touches != undefined) {
            e = e.touches[0]
        }
        moveView(startX - e.clientX, startY - e.clientY);
        startX = e.clientX;
        startY = e.clientY;
    }
}

var dragStop = (e) => {
    //zoom
    if (e.touches != undefined && e.touches.length < 2) {
        prevDiff = -1;
    } else if (isDrag) { //drag
        e.preventDefault();
        e.stopPropagation();
        if (e.touches == undefined) {
            moveView(startX - e.clientX, startY - e.clientY);
        }
    }
    isDrag = false;
}


mapCanvas.addEventListener("mousedown", dragStart, { passive: false });
document.addEventListener("mousemove", dragging, { passive: false });
document.addEventListener("mouseup", dragStop, { passive: false });

mapCanvas.addEventListener("touchstart", dragStart, { passive: false });
mapCanvas.addEventListener("touchmove", dragging, { passive: false });
mapCanvas.addEventListener("touchend", dragStop, { passive: false });
mapCanvas.addEventListener("touchcancel", dragStop, { passive: false });

// PC zoom

var zoomScroll = (e) => {
    if ($('#mapCanvas:hover').length != 0) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (e.detail) {
        dy = e.detail * -40;
    } else {
        dy = e.wheelDelta;
    };

    var _zoom = zoom;
    if (dy > 0) {
        _zoom += 0.1;
    } else {
        _zoom -= 0.1;
    }
    changeZoom(_zoom, e.pageX, e.pageY);
};

mapCanvas.addEventListener('onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll', zoomScroll, { passive: false });
