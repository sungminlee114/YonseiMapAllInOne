/*
이 js파일은 index.ejs의 레이아웃과 유저 인터랙션등에 관한 함수들이 있는 파일입니다.

만든이 : 연세대학교 제55대 총학생회 Mate 사무운영국원, 공과대학 글로벌융합공학부 18학번 이성민 (starmin114@yonsei.ac.kr)
*/

// getLocation();

//검색

_getDatas();
const mapContainer = document.getElementById("mapContainer");
const mapBody = document.getElementsByClassName("mapBody")[0];
const sideBar = document.getElementById("sidebar");
const sidebarCollapse = document.getElementById("sidebarCollapse");
const searchBoxDiv = document.getElementById("searchBoxDiv");
const sidebarHeader = document.getElementById("sidebar-header");

// -----------------------------

let blockPopstateEvent;
let cacheMediaIsPhone;
window.onload = () => {
  cacheMediaIsPhone = isPhone();
  if (!cacheMediaIsPhone) _ = null;
  else {
    // toggleSideBar();
    var _body = document.documentElement;
    if (_body.requestFullscreen) {
      _body.requestFullscreen();
    } else if (_body.webkitrequestFullscreen) {
      _body.webkitrequestFullscreen();
    } else if (_body.mozrequestFullscreen) {
      _body.mozrequestFullscreen();
    } else if (_body.msrequestFullscreen) {
      _body.msrequestFullscreen();
    }
    window.scrollTo(0, 0);
  }
  sidebar_loadMain();
  resizeAll(true);

  if (isPhone()) {
    blockPopstateEvent = document.readyState != "complete";
    window.addEventListener(
      "load",
      function () {
        // The timeout ensures that popstate-events will be unblocked right
        // after the load event occured, but not in the same event-loop cycle.
        setTimeout(function () {
          blockPopstateEvent = false;
        }, 0);
      },
      false
    );
    window.addEventListener(
      "popstate",
      function (evt) {
        console.log(blockPopstateEvent);
        if (blockPopstateEvent && document.readyState == "complete") {
          evt.preventDefault();
          evt.stopImmediatePropagation();
          if (mobileSidebarOpenState > 0) {
            mobileSidebarAnimation(changeMobileSidebarState(0));
          }
          history.go(-stateStackCnt + 1);
          stateStackCnt = 0;
        }
      },
      false
    );
  }
};

/* [레이아웃] */

//현재 디바이스가 휴대폰인지 확인
let isPhone = () => {
  return window.matchMedia("screen and (max-width: 768px)").matches;
};

// resize event가 일어날 때 마다 media가 바뀐지 확인해주고, cache를 업데이트 해준다.
let mediaChanged = () => {
  let now = isPhone();
  if (now != cacheMediaIsPhone) {
    cacheMediaIsPhone = now;
    if ((now && sidebarIsOpened()) || !(now || sidebarIsOpened()))
      toggleSideBar();
    resizeAll(true);
  }
};

const sidebarFooter = document.getElementById("sidebar-type-footer");
//모든 요소의 레이아웃을 재 계산한다.
//수정할 때 media에 따른 설정을 각각 수정해주자.
const sidebarTogglerMobile = document.getElementById("sidebar-toggler-mobile");
var resizeAll = (first) => {
  let bottomMap = mapBody.getBoundingClientRect().height;
  let widthMap = mapBody.getBoundingClientRect().width;

  //휴대폰이 아닐경우
  if (isPhone() == false) {
    //sidebarheader
    searchBoxDiv.style.marginTop = `${
      95 -
      33 -
      document.getElementById("sidebar-header-title").getBoundingClientRect()
        .height
    }px`;
    searchBoxDiv.style.display = "flex";

    //sidebarCollapse
    // sidebarCollapse.style.top = `${bottomMap/2 - 33}px`;
    // sidebarCollapse.style.height = `${0}px`;

    if (sideBar.classList[0] == "closed") {
      //to close
      sidebarCollapse.style.left = `0px`;
    } else {
      sidebarCollapse.style.left = `${sideBar.getBoundingClientRect().width}px`;
    }

    //mapContainer

    if (sideBar.classList[0] == "closed") {
      //to close
      mapContainer.style.marginLeft = `0px`;
    } else {
      mapContainer.style.marginLeft = `${
        sideBar.getBoundingClientRect().width
      }px`;
    }

    let tops = [30, 100, 170];
    let i = 0;
    //sliderback
    if (first == true) {
      sidebarCollapse.style.removeProperty("height");
      sidebarBodyFrame.style.removeProperty("height");
      sideBar.style.removeProperty("bottom");
      mapContainer.style.removeProperty("margin-bottom");
      Array.from(document.getElementsByClassName("sliderBack")).forEach(
        (element) => {
          // console.log(`${parseFloat(element.style.top) + 95}px`)
          element.style.top = `${tops[i]}px`;
          i += 1;
        }
      );

      document.getElementsByClassName("sidebar-body")[0].style.top = null;
    }
  } else {
    //is phone
    //sidebarheader
    mobileSidebarOpenConst = [
      60,
      250,
      document.getElementsByTagName("body")[0].getBoundingClientRect().height -
        130,
    ];

    mobileSidebarNoAnim(changeMobileSidebarState(mobileSidebarOpenState));

    searchBoxDiv.style.marginTop = `${
      65 -
      33 -
      document.getElementById("sidebar-header-title").getBoundingClientRect()
        .height
    }px`;

    searchBoxDiv.style.display = "flex";
    // if(sidebarIsOpened()){
    // ch = document.getElementsByTagName("body")[0].getBoundingClientRect().height;
    //   mapContainer.style.marginBottom = `${
    //     mobileSidebarOpenConst[1] + 30
    //   }px`;
    // } else {
    // mapContainer.style.marginBottom = `105px`;
    // }

    let tops = [100, 155, 210];
    let i = 0;
    //sliderback
    if (first == true) {
      Array.from(document.getElementsByClassName("sliderBack")).forEach(
        (element) => {
          // console.log(`${parseFloat(element.style.top) + 95}px`)
          element.style.top = `${tops[i]}px`;
          i += 1;
        }
      );
      mapContainer.style.marginLeft = null;
    }
  }

  //slider

  //sidebar inside
  resizeSidebarInside();
  resizeCanvas(first);
  resizeCanvas(first);
};

//우상단에 있는 슬라이더 토글
let toggleSlider = (e) => {
  let context = e.target.parentNode;
  if (context.classList[1] == "right") {
    context.classList.add("left");
    context.classList.remove("right");
    context.children[0].classList.add("selected");
    context.children[1].classList.remove("selected");
  } else {
    context.classList.add("right");
    context.classList.remove("left");
    context.children[1].classList.add("selected");
    context.children[0].classList.remove("selected");
  }
};

let mobileSidebarOpenState = 0; // 0 closed 1 middle 2 top
let mobileSidebarOpenConst = [
  60,
  250,
  document.getElementsByTagName("body")[0].getBoundingClientRect().height - 130,
];

//사이드바가 열려있는지
let sidebarIsOpened = () => {
  if (
    (!isPhone() && sideBar.classList[0] == "closed") ||
    (isPhone() && mobileSidebarOpenState == 0)
  )
    return false;
  else return true;
};

const pcSidebarAnimation = (open = false) => {
  let index = 0;
  let maxIndex = 10;
  let initialSize = 250;
  let targetSize = 0;
  if (open) {
    [initialSize, targetSize] = [targetSize, initialSize];
  }

  const inte = setInterval(() => {
    let animatedValue = getAnimatedValue(
      initialSize,
      targetSize,
      index,
      maxIndex
    );
    sideBar.style.marginLeft = `${animatedValue - 250}px`;
    sidebarCollapse.style.left = `${animatedValue}px`;
    if (++index === maxIndex) {
      clearInterval(inte);
      sideBar.style.marginLeft = `${targetSize - 250}px`;
      sidebarCollapse.style.left = `${targetSize}px`;
      // redrawCanvas();
    }
  }, 10);
};

const getClosestMobileSidebarState = () => {
  if (mobileSidebarPointerDownFlag) {
    const currBottom =
      document.getElementsByTagName("body")[0].getBoundingClientRect().height -
      sidebarTogglerMobile.getBoundingClientRect().bottom;
    let distance = currBottom - mobileSidebarPointerInitPos;
    console.log(distance, mobileSidebarOpenState);
    if (distance > 30 && 200 > distance) {
      if (mobileSidebarOpenState <= 1) return mobileSidebarOpenState + 1;
      else return 0;
    } else if (distance < -30 && -200 < distance) {
      if (mobileSidebarOpenState >= 1) return mobileSidebarOpenState - 1;
      else return 0;
    }
    // if(distance)
    // let distArr = [];
    // for(let i=0; i<3; i++){
    //   distArr.push(currBottom - mobileSidebarOpenConst[i])
    // }

    // console.log(distArr)

    // for(let i=0; i<3; i++){
    //   if(Math.abs(distArr[i]) < 5 * (Math.abs(i-mobileSidebarOpenState) * 2 + 1))
    //   return i;
    // }

    // let r = Math.sign(distArr[mobileSidebarOpenState]) + mobileSidebarOpenState
    // console.log(Math.sign(distArr[mobileSidebarOpenState]), mobileSidebarOpenState)
    // if(r < 0 || r > 3)
    //   return mobileSidebarOpenState ;
    // else
    //   return r;

    // if(currBottom > mobileSidebarOpenConst[mobileSidebarOpenState]){ //up
    //   if()
    // }

    // let sm = 9999, z = -1;
    // for(let i=0; i<3; i++){
    //   if( i != mobileSidebarOpenConst && distArr[i] < sm){
    //     sm = distArr[i];
    //     z = i;
    //   }
    // }

    // return z;

    if (currBottom < 147) {
      return 0;
    } else if (
      currBottom <
      Math.round(
        (document.getElementsByTagName("body")[0].getBoundingClientRect()
          .height +
          120) /
          2
      )
    ) {
      return 1;
    } else {
      return 2;
    }
  }
};

  let stateStackCnt = 0;
const changeMobileSidebarState = (state) => {
  if(state != undefined){
    console.log(state)
    mobileSidebarOpenState = state;
    if (state > 0 && isPhone()) {
      mapSearch.blur();
      history.pushState({ state: state }, "");
      stateStackCnt++;
      blockPopstateEvent = true;
    } else {
      history.replaceState({ state: state }, "");
      blockPopstateEvent = false;
    }
  
    
    console.log(mobileSidebarOpenConst[2])
    return mobileSidebarOpenConst[state];
  }
};

const mobileSidebarNoAnim = (targetSize) => {
  sidebarTogglerMobile.style.bottom = `${targetSize}px`;
  sidebarBodyFrame.style.height = `${targetSize - 45}px`;
};

const mobileSidebarAnimation = (targetSize) => {
  let index = 0;
  let maxIndex = 10;
  let initialSize =
    document.getElementsByTagName("body")[0].getBoundingClientRect().height -
    sidebarTogglerMobile.getBoundingClientRect().bottom;
  // ch = window.innerHeight;
  // let targetSize = Math.round(ch * 0.7)
  // if(!open){
  //   [initialSize, targetSize] = [targetSize, initialSize];
  // }

  const inte = setInterval(() => {
    let animatedValue = getAnimatedValue(
      initialSize,
      targetSize,
      index,
      maxIndex
    );
    sidebarTogglerMobile.style.bottom = `${animatedValue}px`;
    sidebarBodyFrame.style.height = `${animatedValue - 45}px`;
    if (++index === maxIndex) {
      clearInterval(inte);
      sidebarTogglerMobile.style.bottom = `${targetSize}px`;
      sidebarBodyFrame.style.height = `${targetSize - 45}px`;
      // redrawCanvas();
    }
  }, 10);
};

//사이드바 토글
let toggleSideBar = (OpenAll = false) => {
  if (isPhone()) {
    console.log(OpenAll)
    if(OpenAll != undefined){
      changeMobileSidebarState(1 + 1*OpenAll)
    }
    else if (!sidebarIsOpened()) {
      mobileSidebarAnimation(changeMobileSidebarState(1));
    } else {
      mobileSidebarAnimation(changeMobileSidebarState(0));
    }
  } else {
    if (!sidebarIsOpened()) {
      sideBar.classList.remove("closed");
      pcSidebarAnimation(true);
      sidebarCollapse.innerHTML = `<span id="collapseArrow" style="color:#1F3C73">◀</span>`;
    } else {
      sideBar.classList.add("closed");
      pcSidebarAnimation(false);
      sidebarCollapse.innerHTML = `<span id="collapseArrow" style="color:#1F3C73">▶</span>`;
    }
  }
  resizeAll();
};

window.addEventListener("resize", () => {
  resizeAll();
});
window.addEventListener("resize", mediaChanged);
window.addEventListener("scroll", resizeAll);

/* [User Interaction] */

let inputState = {
  tool: null,
  action: null,
};
let dragFlag = false;
let hoverFlag = true;
let mobileSidebarPointerDownFlag = false;

/* -- handle mouse -- */
let handleMouseDown = (e) => {
  dragFlag = true;
  // document.ondragstart= () => {return false}
  // e.preventDefault();
  // e.stopPropagation();
  cPosCache = updateCache(cPosCache, getPointerPosinCanvas(e));
  inputState = {
    tool: "mouse",
    action: "mouseDown",
  };
  clickCnt += 1;
  doubleClickTime = new Date();
};

let handleMouseMove = (e) => {
  if (dragFlag) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (inputState.action == "mouseDown") {
    inputState.action = "mouseDrag";
  } else if (inputState.action != "mouseDrag") {
    inputState.action = "mouseMove";
  }

  if (
    inputState.action == "mouseDrag" &&
    new Date().getTime() - doubleClickTime.getTime() > 80
  ) {
    if (dragFlag) drag(e);
  } else if (hoverFlag) {
    checkHovering(e);
  } else {
    uncheckHovering();
  }
};

let handleMouseUp = (e) => {
  clickCnt = 0;
  // document.ondragstart= () => {return true}
  if (inputState.action == "mouseDown") {
    inputState.action = "mouseClick";
    click(e);
  } else if (inputState.action == "mouseDrag") {
    dragEnd(e);
    inputState.action = "mouseUp";
  }
};

let handleScroll = (e) => {
  e.preventDefault();
  e.stopPropagation();
  // inputState.action = "Scroll"
  scrollZoom(e);
};

mapCanvas.addEventListener("mousedown", handleMouseDown);
document.addEventListener("mousemove", handleMouseMove, {
  passive: false,
});
mapCanvas.addEventListener("mouseup", handleMouseUp);

document.addEventListener("mouseup", (e) => {
  dragFlag = false;
});

mapCanvas.addEventListener(
  "onwheel" in document
    ? "wheel"
    : "onmousewheel" in document
    ? "mousewheel"
    : "DOMMouseScroll",
  handleScroll,
  {
    passive: false,
  }
);

/* -- handle touchscreen -- */

let doubleClickTime,
  clickCnt = 0;

let handleTouchStart = (e) => {
  // e.preventDefault();
  // e.stopPropagation();
  // mapContainer.focus()
  document.getElementById("mapSearch").blur();
  e = e.changedTouches[0];
  // console.log("start", inputState.action)
  cPosCache = updateCache(cPosCache, getPointerPosinCanvas(e));
  // if (inputState.action == "touchClick" && (new Date().getTime() - doubleClickTime.getTime()) < 300) {
  //   inputState.action = "touchDoubleClick"

  // } else {

  inputState = {
    tool: "touch",
    action: "touchStart",
  };

  clickCnt += 1;
  doubleClickTime = new Date();
  // }
};

let handleTouchMove = (e) => {
  if (e.cancelable) {
    e.preventDefault();
  }
  e.stopPropagation();
  if (mobileSidebarPointerDownFlag) {
    handlePointerMoveMobileSidebar(e.changedTouches[0]);
    return;
  }

  e = e.changedTouches;
  //pinch

  if (e.length == 2) {
    pinchZoom(e);
    inputState.action = "touchPinchZoom";
  } else if (
    inputState.action == "touchStart" &&
    new Date().getTime() - doubleClickTime.getTime() > 80
  ) {
    inputState.action = "touchDrag";
  }

  if (inputState.action == "touchDrag") {
    drag(e[0]);
  }
};

let handleTouchEnd = (e) => {
  //
  // if(mobileSidebarPointerDownFlag)
  //   handlePointerUpMobileSidebar(e);
  e.preventDefault();
  e.stopPropagation();
  e = e.changedTouches[0];

  if (inputState.action == "touchStart") {
    inputState.action = "touchClick";
    // sleep
    // if(new Date().getTime() - doubleClickTime.getTime() > 80)
    if (clickCnt == 1) {
      setTimeout(() => {
        if (clickCnt >= 2) {
          doubleClickZoom(e);
        } else {
          click(e, true);
        }
        clickCnt = 0;
      }, 80);
    }
  } else if (inputState.action == "touchDrag") {
    dragEnd(e);
    clickCnt = 0;
    inputState.action = "touchEnd";
    // } else if (inputState.action == "touchDoubleClick") {
    //   doubleClickZoom(e);
  } else if (inputState.action == "touchPinchZoom") {
    updateCache(cDistCache, null);
    updateCache(cDistCache, null);
    clickCnt = 0;
  }
};

mapCanvas.addEventListener("touchstart", handleTouchStart);
mapCanvas.addEventListener("touchmove", handleTouchMove, {
  passive: false,
});
mapCanvas.addEventListener("touchend", handleTouchEnd, {
  passive: false,
});

let mobileSidebarPointerInitPos = -1;

const handlePointerDownMobileSidebar = (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log("down");
  mobileSidebarPointerDownFlag = true;
  mobileSidebarPointerInitPos =
    document.getElementsByTagName("body")[0].getBoundingClientRect().height -
    sidebarTogglerMobile.getBoundingClientRect().bottom;
};

const handlePointerUpMobileSidebar = (e) => {
  if (isPhone() && mobileSidebarPointerDownFlag) {
    if (e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation();
    // mobileSidebarPointerDownFlag = false;
    mobileSidebarAnimation(
      changeMobileSidebarState(getClosestMobileSidebarState())
    );
    mobileSidebarPointerDownFlag = false;
  }
};

const handlePointerMoveMobileSidebar = (e) => {
  if ("changedTouches" in e) {
    if (e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation();
    e = e.changedTouches[0];
  }
  if (mobileSidebarPointerDownFlag) {
    let a =
      document.getElementsByTagName("body")[0].getBoundingClientRect().bottom -
      e.clientY -
      22.5;
    sidebarTogglerMobile.style.bottom = `${a}px`;
    sidebarBodyFrame.style.height = `${a - 45}px`;
    // mapContainer.style.marginBottom = `${
    //   a + 30
    // }px`;
  }
};
sidebarTogglerMobile.addEventListener(
  "mouseenter",
  () => {
    hoverFlag = false;
  },
  {
    passive: false,
  }
);

sidebarTogglerMobile.addEventListener(
  "mouseleave",
  () => {
    hoverFlag = true;
  },
  {
    passive: false,
  }
);
sidebarTogglerMobile.addEventListener(
  "pointerdown",
  handlePointerDownMobileSidebar,
  {
    passive: false,
  }
);

document.addEventListener("pointerup", handlePointerUpMobileSidebar, {
  passive: false,
});

sidebarTogglerMobile.addEventListener(
  "touchend",
  handlePointerUpMobileSidebar,
  {
    passive: false,
  }
);

sidebarTogglerMobile.addEventListener(
  "pointermove",
  handlePointerMoveMobileSidebar,
  {
    passive: false,
  }
);

sidebarTogglerMobile.addEventListener(
  "touchmove",
  handlePointerMoveMobileSidebar,
  {
    passive: false,
  }
);

mapSearch.addEventListener("focus", (e) => {
  if (isPhone()) {
    mobileSidebarAnimation(changeMobileSidebarState(0));
  }
});

/* -- 공통 -- */

Array.from(document.getElementsByClassName("sliderBack")).forEach((element) => {
  element.addEventListener("click", toggleSlider);
  element.addEventListener("mouseenter", (e) => {
    hoverFlag = false;
  });
  element.addEventListener("mouseleave", (e) => {
    hoverFlag = true;
  });
});
sidebarCollapse.addEventListener("click", toggleSideBar);
sidebarCollapse.addEventListener("mouseenter", (e) => {
  hoverFlag = false;
});
sidebarCollapse.addEventListener("mouseleave", (e) => {
  hoverFlag = true;
});
