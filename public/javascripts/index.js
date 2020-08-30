/*
이 js파일은 index.ejs의 레이아웃과 유저 인터랙션등에 관한 함수들이 있는 파일입니다.

만든이 : 연세대학교 제55대 총학생회 Mate 사무운영국원, 공과대학 글로벌융합공학부 18학번 이성민 (starmin114@yonsei.ac.kr)
*/

// getLocation();

//검색

const mapContainer = document.getElementById("mapContainer");
const mapBody = document.getElementsByClassName("mapBody")[0];
const sideBar = document.getElementById("sidebar");
const sidebarCollapse = document.getElementById("sidebarCollapse");
const searchBoxDiv = document.getElementById("searchBoxDiv");
const sidebarHeader = document.getElementById("sidebar-header")
let buildingList = getBuildingList();
console.log(buildingList)
initAutocomplete(buildingList);
var data = ["화장실", "학생회관", "백주년기념관", "중앙도서관"];
var type = ["facility", "building", "building", "building"];
// -----------------------------

let cacheMediaIsPhone;
window.onload = () => {
  cacheMediaIsPhone = isPhone()
  if(!cacheMediaIsPhone)
    toggleSideBar();
  sidebar_loadMain();
  resizeAll(true);
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
    if((now && sidebarIsOpened()) || !(now || sidebarIsOpened()))
      toggleSideBar();
    resizeAll(true);
  }
};

//모든 요소의 레이아웃을 재 계산한다.
//수정할 때 media에 따른 설정을 각각 수정해주자.
var resizeAll = first => {
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
    searchBoxDiv.style.marginTop = `${
      65 -
      33 -
      document.getElementById("sidebar-header-title").getBoundingClientRect()
        .height
    }px`;

    searchBoxDiv.style.display = "flex";

    //mapContainer
    // const mapContainer = document.getElementById("mapContainer")
    // mapContainer.marginBottom = `${document.getElementsByClassName("sidebar-body")[0].getBoundingClientRect().height}px`;
    // document.getElementsByClassName("sidebar-body")[0].style.top = `${
    //   bottomMap - 230
    // }px`;

    if (sideBar.classList[0] == "closed") {
      //to close
      mapContainer.style.marginLeft = `0px`;
    } else {
      mapContainer.style.marginLeft = `${
        sideBar.getBoundingClientRect().width
      }px`;
    }

    let tops = [125, 180, 235];
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
  resizeSidebarInside()

  //canvas
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

//사이드바가 열려있는지
let sidebarIsOpened = () => {
  if (sideBar.classList[0] == "closed") return false;
  else return true;
};

//사이드바 토글
let toggleSideBar = () => {
  if(isPhone()){
    if (!sidebarIsOpened()) {
      sideBar.classList.remove("closed");
      sidebarHeader.classList.remove("opened");
    } else {
      sideBar.classList.add("closed");
      sidebarHeader.classList.add("opened");
    }
  } else {
    if (!sidebarIsOpened()) {
      sideBar.classList.remove("closed");
      sidebarCollapse.innerHTML = "◀";
    } else {
      sideBar.classList.add("closed");
      sidebarCollapse.innerHTML = "▶";
    }
  }

  resizeAll();
};

window.addEventListener("resize", () => {
  if(!isPhone()){
    resizeAll();
  }
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

  // console.log("adf")
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
  e.preventDefault();
  e.stopPropagation();

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
  }
};

mapCanvas.addEventListener("touchstart", handleTouchStart);
mapCanvas.addEventListener("touchmove", handleTouchMove, {
  passive: false,
});
mapCanvas.addEventListener("touchend", handleTouchEnd, {
  passive: false,
});

/* -- 공통 -- */

Array.from(document.getElementsByClassName("sliderBack")).forEach((element) => {
  element.addEventListener("click", toggleSlider);
  element.addEventListener("mouseenter", (e) => {
    hoverFlag = false;
  })
  element.addEventListener("mouseleave", (e) => {
    hoverFlag = true;
  })
});
sidebarCollapse.addEventListener("click", toggleSideBar);
sidebarCollapse.addEventListener("mouseenter", (e) => {
  hoverFlag = false;
})
sidebarCollapse.addEventListener("mouseleave", (e) => {
  hoverFlag = true;
})
