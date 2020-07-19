// getLocation();

//검색



var ui = $("#UI");
var mapContainer = $("#mapContainer");
var UiCloseBtn = $("#UICloseBtn");
const mapBody = document.getElementsByClassName("mapBody")[0];
const sideBar = document.getElementById("sidebar");
const sidebarCollapse = document.getElementById("sidebarCollapse");
const searchBoxDiv = document.getElementById("searchBoxDiv");
const vmapContainer = document.getElementById("mapContainer");

let buildingList;

var data = ["화장실", "학생회관", "백주년기념관", "중앙도서관"];
var type = ["facility", "building", "building", "building"]
    // -----------------------------
    
let getBuildingList = () =>{
    let _buildingList = [];
    $.ajax({
        type: "get",
        url: "api/sinchon/building",
    }).done((result) =>{
        for (const [key, el] of Object.entries(result)) {
            let area = [];
            let xy = 0;
            let tempArea = {};
            Array.from(el.BAREA.split('\n').join('\t').split(' ').join('\t').split('\t')).forEach((e)=>{
                if(xy == 0){
                    tempArea.x = parseInt(e);
                }else{
                    tempArea.y = parseInt(e);
                    area.push(tempArea)
                    tempArea = {};
                }
                xy = (xy+1) % 2;
            })
            _buildingList.push({
                area : area,
                id : el.BID,
                name : el.BNAME,
                on : true
            })
        }
    })
    buildingList = _buildingList;
};

getBuildingList();

window.onload = () => {
    resizeAll(true);
    
}

let cacheMedia

let isPhone = () => {  
    return window.matchMedia("screen and (max-width: 768px)").matches
}

let mediaChanged = () => {
    let t = cacheMedia;
    cacheMedia = isPhone()
    let b = (t != cacheMedia);
    if(b){
        resizeAll(true)
    }
}

var resizeAll = (first) => {
    let bottomMap = mapBody.getBoundingClientRect().height;
    let widthMap = mapBody.getBoundingClientRect().width;
    if (isPhone() == false) {
        
        // sideBar.style.height = `${bottomMap}px`;
        if (sideBar.classList[0] == "closed") {
            //to close
            sideBar.style.marginLeft = `${-1300}px`;
        } else {
            sideBar.style.marginLeft = `0px`;
        }
        
        //sidebarheader
        searchBoxDiv.style.marginTop =
        `${95 - 33 - document.getElementById("sidebar-header-title").getBoundingClientRect().height}px`;
        searchBoxDiv.style.display = "flex";
        
        
        //sidebarCollapse
        // sidebarCollapse.style.top = `${bottomMap/2 - 33}px`;
        // sidebarCollapse.style.height = `${0}px`;
        
        
        if (sideBar.classList[0] == "closed") {
            //to close
            sidebarCollapse.style.left = `0px`
        } else {
            sidebarCollapse.style.left = `${sideBar.getBoundingClientRect().width}px`;
        }
        
        //mapContainer
        
        if (sideBar.classList[0] == "closed") {
            //to close
            vmapContainer.style.marginLeft = `0px`;
            
        } else {
            vmapContainer.style.marginLeft = `${sideBar.getBoundingClientRect().width}px`;
        }
        
        let tops = [30, 100, 170];
        let i = 0
        //sliderback
        if (first == true) {
            Array.from(document.getElementsByClassName("sliderBack")).forEach(element => {
                
                // console.log(`${parseFloat(element.style.top) + 95}px`)
                element.style.top = `${tops[i]}px`
        i += 1
      });
      
      document.getElementsByClassName("sidebar-body")[0].style.top = null
    }
    
} else {
    //is phone
    //sidebarheader
    searchBoxDiv.style.marginTop =
    `${65 - 33 - document.getElementById("sidebar-header-title").getBoundingClientRect().height}px`;
    
    searchBoxDiv.style.display = "flex";
    
    //mapContainer
    // const vmapContainer = document.getElementById("mapContainer")
    // vmapContainer.marginBottom = `${document.getElementsByClassName("sidebar-body")[0].getBoundingClientRect().height}px`;
    document.getElementsByClassName("sidebar-body")[0].style.top = `${bottomMap - 230}px`
    
    let tops = [125, 180, 235];
    let i = 0
    //sliderback
    if (first == true) {
        Array.from(document.getElementsByClassName("sliderBack")).forEach(element => {
            // console.log(`${parseFloat(element.style.top) + 95}px`)
            element.style.top = `${tops[i]}px`
            i += 1
        });
        vmapContainer.style.marginLeft = null
    }
}


//slider



//canvas
resizeCanvas(first == true)

}

let toggleSlider = (e) => {
    let context = e.target.parentNode;
    if (context.classList[1] == "right") {
        context.classList.add("left")
        context.classList.remove("right")
        context.children[0].classList.add("selected")
        context.children[1].classList.remove("selected")
    } else {
        context.classList.add("right")
        context.classList.remove("left")
        context.children[1].classList.add("selected")
        context.children[0].classList.remove("selected")
    }
}

let toggleSideBar = () => {
    if (sideBar.classList[0] == "closed") {
        sideBar.classList.remove("closed")
        sidebarCollapse.innerHTML = "◀"
    } else {
        sideBar.classList.add("closed")
        sidebarCollapse.innerHTML = "▶"
    }
    
    resizeAll()
}

var resizeUI = () => {
    //body
    var bottomMap = mapContainer[0].getBoundingClientRect().top + mapContainer[0].getBoundingClientRect().height -
    ui[0].getBoundingClientRect().height + window.scrollY;;
    var leftMap = mapContainer[0].getBoundingClientRect().left;
    ui.css("top", bottomMap);
    ui.css("width", mapContainer[0].getBoundingClientRect().width);
    ui.css("left", leftMap);
    
    //closeBtn
    // UiCloseBtn.css("left", mapContainer[0].getBoundingClientRect().width - 50);
    // UiCloseBtn.css("top", 20)
}



let openUI = (building) => {
    ui.css("display", "inline");
  $("#UITitle").text(building.name);
  resizeUI();
}

var closeUI = () => {
    ui.css("display", "none");
}

// document.getElementById("UICloseBtn").addEventListener('click',(e) => {
    //   unclickBuilding(prevClickingBuilding);
    // });
    

    
// let buildingList = [{
//   area: [{
//     x: 1158,
//     y: 2047
//   }, {
//     x: 1158 + 46,
//     y: 2047
//   }, {
//     x: 1158 + 46,
//     y: 2047 + 39
//   }, {
//     x: 1158,
//     y: 2047 + 39
//   }],
//   id: 1,
//   name: "백주년기념관",
//   on: false
// }, {
//   area: [{
//       x: 1149,
//       y: 1815
//     },
//     {
//       x: 1193,
//       y: 1815
//     }, {
//       x: 1193,
//       y: 1953
//     }, {
//       x: 1149,
//       y: 1953
//     }
//   ],
//   id: 2,
//   name: "학생회관",
//   on: true
// }, {
//   area: [{
//       x: 982,
//       y: 1843
//     },
//     {
//       x: 1033,
//       y: 1843
//     }, {
//       x: 1033,
//       y: 1934
//     }, {
//       x: 982,
//       y: 1934
//     }
//   ],
//   id: 3,
//   name: "중앙도서관",
//   on: false
// }]


var inputState = {
  tool: null,
  action: null
};

//handle mouse
let handleMouseDown = (e) => {
  dragFlag = true;
  // document.ondragstart= () => {return false}
  // e.preventDefault();
  // e.stopPropagation();
  cPosCache = updateCache(cPosCache, getPointerPosinCanvas(e));
  inputState = {
    tool: 'mouse',
    action: 'mouseDown'
  }
  clickCnt += 1;
  doubleClickTime = new Date();
}
let dragFlag = false
let handleMouseMove = (e) => {

  if (dragFlag) {
    e.preventDefault();
    e.stopPropagation();
  }


  if (inputState.action == 'mouseDown') {
    inputState.action = 'mouseDrag'
  } else if (inputState.action != 'mouseDrag') {
    inputState.action = 'mouseMove'
  }

  if (inputState.action == 'mouseDrag' && (new Date().getTime() - doubleClickTime.getTime() > 80)) {
    if (dragFlag)
      drag(e)
  } else {
    checkHovering(e)
  }
}

let handleMouseUp = (e) => {
  clickCnt = 0;
  // document.ondragstart= () => {return true}
  if (inputState.action == 'mouseDown') {
    inputState.action = 'mouseClick'
    click(e);
  } else if (inputState.action == 'mouseDrag') {
    dragEnd(e);
    inputState.action = 'mouseUp'
  }
}

//handle mouseScroll
let handleScroll = (e) => {
  e.preventDefault();
  e.stopPropagation();
  // inputState.action = "Scroll"
  zoomScroll(e)
}

//handle touch

let doubleClickTime, clickCnt = 0;

let handleTouchStart = (e) => {
  // e.preventDefault();
  // e.stopPropagation();
  // mapContainer.focus()

  // console.log("adf")
  document.getElementById("mapSearch").blur()
  e = e.changedTouches[0]
  // console.log("start", inputState.action)
  cPosCache = updateCache(cPosCache, getPointerPosinCanvas(e));
  // if (inputState.action == "touchClick" && (new Date().getTime() - doubleClickTime.getTime()) < 300) {
  //   inputState.action = "touchDoubleClick"

  // } else {

  inputState = {
    tool: 'touch',
    action: 'touchStart'
  }

  clickCnt += 1;
  doubleClickTime = new Date();
  // }
}

let handleTouchMove = (e) => {
  e.preventDefault();
  e.stopPropagation();

  e = e.changedTouches;
  //pinch

  if (e.length == 2) {

    pinchZoom(e)
    inputState.action = 'touchPinchZoom'
  } else if (inputState.action == 'touchStart' && (new Date().getTime() - doubleClickTime.getTime() > 80)) {
    inputState.action = 'touchDrag'
  }

  if (inputState.action == 'touchDrag') {
    drag(e[0])
  }
}

let handleTouchEnd = (e) => {
  e.preventDefault();
  e.stopPropagation();
  e = e.changedTouches[0]
  if (inputState.action == 'touchStart') {
    inputState.action = 'touchClick'
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
      }, 80)
    }

  } else if (inputState.action == 'touchDrag') {
    dragEnd(e);
    clickCnt = 0;
    inputState.action = 'touchEnd'
    // } else if (inputState.action == "touchDoubleClick") {
    //   doubleClickZoom(e);
  } else if (inputState.action == "touchPinchZoom") {
    updateCache(cDistCache, null)
    updateCache(cDistCache, null)
  }
}

//add MouseListener
mapCanvas.addEventListener('mousedown', handleMouseDown);
document.addEventListener("mousemove", handleMouseMove, {
  passive: false
});
mapCanvas.addEventListener("mouseup", handleMouseUp)

// document.addEventListener("mousemove", (e =>{
//   // console.log(dragFlag)
//   if(dragFlag){
//     e.preventDefault()
//     e.stopPropagation()
//   }
// }),{passive:false})

document.addEventListener("mouseup", (e => {
  dragFlag = false;
}))

mapCanvas.addEventListener(
  "onwheel" in document ?
  "wheel" :
  "onmousewheel" in document ?
  "mousewheel" :
  "DOMMouseScroll",
  handleScroll, {
    passive: false
  }
);

//add TouchListener
mapCanvas.addEventListener("touchstart", handleTouchStart, );
mapCanvas.addEventListener("touchmove", handleTouchMove, {
  passive: false
});
mapCanvas.addEventListener("touchend", handleTouchEnd, {
  passive: false
});

// document.addEventListener("mousemove", (e) =>{

// })


Array.from(document.getElementsByClassName("sliderBack")).forEach(element => {
  element.addEventListener("click", toggleSlider);
});
sidebarCollapse.addEventListener("click", toggleSideBar);

window.addEventListener("resize", resizeAll);
window.addEventListener("resize", mediaChanged);
window.addEventListener("scroll", resizeAll);
// window.addEventListener("resize", resizeUI);
// window.addEventListener("resize", resizeCanvas);