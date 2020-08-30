/* [layout] */
let resizeSidebarInside = () => {
  if (isPhone() == false) {
    //PC

    //sidebar building tabBtn edge
    // document.getElementById("sidebar-building-buildingDetail").style.marginTop 
    // = `${document.getElementById("sidebar-building-tabButtonDiv").getBoundingClientRect().height}px`
  }
}


/* [search] */

const mapSearch = document.getElementById("mapSearch");

let searchKey = (e, _key) => {
  // document.getElementById("mapSearch").blur()
  let key = _key;
  //검색일 경우..?
  console.log(key)
  if (key == null || key =="") return;
  let index = buildingList.findIndex((el) => el.name == key)
  if (index == -1)
    index = buildingList.findIndex((el) => el.name.includes(key));

  if (index != -1) {
    clickBuilding(buildingList[index]);
  }
};

// <!-- This part is to use API -->

// 한글초성
// https://programmer93.tistory.com/16 참고
let initAutocomplete = (_buildingList) => {
  let source = $.map( _buildingList , function (item) {
    chosung = "";
    // full = Hangul.disassemble(item).join("").replace(/ /gi, "");

    Hangul.d(item.name, true).forEach(function (strItem, index) {
      if (strItem[0] != " ") {
        //띄어 쓰기가 아니면
        chosung += strItem[0]; //초성 추가
      }
    });

    return {
      label: chosung + "|" + item.name,
      value: item.name, //김치 볶음밥
      chosung: chosung, //ㄱㅊㅂㅇㅂ
    };
  });

  $("#mapSearch")
    .autocomplete({
      source: source,
      select: function (event, ui) {
        document.getElementById("mapSearch").blur()
        searchKey(event, ui.item.value);
      },
      focus: function (event, ui) {
        event.preventDefault();
        return false;
      },
      open: (e, ui) => {
        const dropdownMenu = document.getElementsByClassName("ui-menu")[0]
        dropdownMenu.classList.add("dropdown-menu")
        dropdownMenu.style.fontSize = "0.7rem"
        dropdownMenu.style.left = `${searchBoxDiv.getBoundingClientRect().left}px`
        dropdownMenu.style.top = `${searchBoxDiv.getBoundingClientRect().top + searchBoxDiv.getBoundingClientRect().height}px`
        dropdownMenu.style.width = `${searchBoxDiv.getBoundingClientRect().width}px`
      }
    })
    .autocomplete("instance")._renderItem = function (ul, item) {
    //.autocomplete( "instance" )._renderItem 설절 부분이 핵심
    return $("<li>") //기본 tag가 li로 되어 있음
      .append(`<button class="dropdown-item" type="button"> ${item.value} </button>`) //여기에다가 원하는 모양의 HTML을 만들면 UI가 원하는 모양으로 변함.
      .appendTo(ul);
  };

  $("#mapSearch").keypress(function (event) {
    let keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode == "13") {
      //enter?
      searchKey(event, mapSearch.value);
      event.preventDefault();
    }
  });
};


/* ================================ */
/* [nav] */


let sidebar_toHome = (e) => {
  unclickBuilding();
}


/* ================================ */


/* [load data] */

let sidebarDataStateEnum = {
    frame: 'sidebar-body-frame',

    main: 'sidebar-type-main',
    building: 'sidebar-type-building',

    buildingDetail: 'sidebar-building-buildingDetail',
    buildingFacilities: 'sidebar-building-buildingFacilities',

    loading: 'sidebar-building-loading'
}

let sidebarDataState = [sidebarDataStateEnum.main]

let sidebarDataArgs = {
  building : null
}

let compareSidebarDataState = (a, b) => {
  // return JSON.stringify(a) === JSON.stringify(b)

  let i
  for(i = 0; i < Math.max(a.length, b.length); i++){
    if (a[i] === b[i])
      return i
  }
  return -1
}

let compareArgs = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b)
}

const sidebarBodyFrame = document.getElementsByClassName(sidebarDataStateEnum.frame)[0]

let sidebar_loadMain = () => {
  if(sidebarDataState === sidebarDataStateEnum.main)
    return;

  sidebarDataState = sidebarDataStateEnum.main
  sidebarBodyFrame.id = sidebarDataStateEnum.main
  sidebarBodyFrame.innerHTML = `
  <div class="sidebar-body" id="sidebar-main-facilitys">
    <h2> 시설 안내 </h2>
    <div class="row icons">
      <div class="icon-div col-3 d-flex">
        <object type="image/svg+xml" data="images/icon_toilet.svg" title="toilet">현재 브라우저는 iframe을 지원하지
          않습니다.</object>
      </div>
      <div class="icon-div col-3 d-flex">
        <object type="image/svg+xml" data="images/icon_elevator.svg" title="elevator">현재 브라우저는 iframe을 지원하지
          않습니다.</object>
      </div>
      <div class="icon-div col-3 d-flex">
        <object type="image/svg+xml" data="images/icon_water.svg" title="water">현재 브라우저는 iframe을 지원하지
          않습니다.</object>
      </div>
      <div class="icon-div col-3 d-flex">
        <object type="image/svg+xml" data="images/icon_vending_machine.svg" title="vending_machine">현재 브라우저는
          iframe을 지원하지 않습니다.</object>
      </div>
    </div>
  </div>
  <div class="sidebar-body no-after" id="sidebar-main-direction">
    <h2> 이동시간 </h2>
    <div class="row sidebar-main-direction-row">
      <div class="col-12">
        <div id="direction_start" class="input-group ui-widget form-control dir-searchbox-div">
          <input type="text" class="" id="directionStartSearch" placeholder="출발지를 입력하세요."
            style="height: 100%; font-size: 0.7em; border: none; outline: none; width: 88%;">
        </div>
        <div id="direction_end" class="input-group ui-widget form-control dir-searchbox-div">
          <input type="text" class="" id="directionEndSearch" placeholder="도착지를 입력하세요."
            style="height: 100%; font-size: 0.7em; border: none; outline: none; width: 88%;">
        </div>
      </div>
      <div class="col-12" style="margin-top: 10px;">
        <div id="direction_search" class="my-btn">찾기</div>
      </div>
    </div>
  </div>
  `
}

let sidebar_loadBuilding = (_building) => {
  return new Promise((resolve, reject) => {
    if((sidebarDataState === sidebarDataStateEnum.buildingDetail || sidebarDataState === sidebarDataStateEnum.buildingFacilities) && sidebarDataArgs.building === _building)
      resolve();

    sidebarBodyFrame.id = sidebarDataStateEnum.building
    sidebarBodyFrame.innerHTML = `
    <div class="sidebar-body row" id="sidebar-building-buildingDetail">
      <div style="width: 30px;">
        <i class="material-icons my-btn" id="sidebar-building-home" style="font-size:0.75rem;" onclick="sidebar_toHome();">home</i>
      </div>
      <div style="justify-content:center; width:150px">
        <h2 class="no-after" style="margin-bottom:0; font-size:1.2rem"> 백양관 </h3>
      </div>
      <div style="width: 30px;">
      </div>
    </div>
    <div class="sidebar-body no-after">
      <div class="row" id="sidebar-building-tab">
        <div class="col-6">
          <h2 id="sidebar-tab-detail" type="button" onclick="sidebar_loadBuildingDetail()"> 건물 정보 </h2>
        </div>
        <div class="col-6">
          <h2 id="sidebar-tab-facilities" type="button" onclick="sidebar_loadBuildingFacilities()"> 시설 정보 </h2>
        </div>
      </div>
      <div class="sidebar-body-tabBody">
      </div>
    </div>
    `
    resolve()
  })
}

async function sidebar_loadBuildingDetail(_building = null){
  if(sidebarDataState === sidebarDataStateEnum.buildingDetail && (sidebarDataArgs.building === _building || _building === null))
    return;

  if(_building != null){
    await sidebar_loadBuilding(_building)
  }
  

  document.getElementById("sidebar-tab-detail").classList.add("mytab-selected")
  document.getElementById("sidebar-tab-facilities").classList.remove("mytab-selected")
  
  const sidebarTabBody = document.getElementsByClassName("sidebar-body-tabBody")[0];
  sidebarTabBody.id = sidebarDataStateEnum.buildingDetail
  sidebarTabBody.innerHTML = `
  <h5> 사진 </h5>
  <img src="/images/buildings/sinchon/baekyang.png" id="sidebar-building-picture"/>
  <h5> 운영 시간 </h5>
  <p> 00:00 ~ 00:00</p>
  <h5> 건물 정보</h5>
  <p> Lorem Ipsum </p>
  <h5> 연락처 </h5>
  <p> 02-1234-5678 </p>
  `

  sidebarDataState = sidebarDataStateEnum.buildingDetail
  if(_building != null){
    sidebarDataArgs.building = _building
  }
  
}

async function sidebar_loadBuildingFacilities(_building) {
  if(sidebarDataState === sidebarDataStateEnum.buildingFacilities && (sidebarDataArgs.building === _building || _building === null))
    return;

    if(_building != null){
      await sidebar_loadBuilding(_building)
    }

  document.getElementById("sidebar-tab-detail").classList.remove("mytab-selected")
  document.getElementById("sidebar-tab-facilities").classList.add("mytab-selected")

  const sidebarTabBody = document.getElementsByClassName("sidebar-body-tabBody")[0];
  sidebarTabBody.id = sidebarDataStateEnum.buildingFacilities
  sidebarTabBody.innerHTML = `
  <div class="dropdown">
    <div class="dropdown-toggle my-dropdown" type="button" id="sidebar-buildingFacilities-dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-flip="false" data-display="static">
      시설을 선택해 주세요.
    </div>
    <div class="dropdown-menu my-dropdownBody" id="sidebar-buildingFacilities-dropdownBody" aria-labelledby="sidebar-buildingFacilities-dropdown">
      <button class="dropdown-item" type="button">화장실</button>
      <div class="dropdown-item" type="button">정수기</div>
      <div class="dropdown-item" type="button">엘리베이터</div>
    </div>
  </div>

  <h5> 1층 </h5>
  <p> 114호 앞 </p>
  <h5> 2층</h5>
  <p> 214호 앞 </p>
  <h5> 3층 </h5>
  <p> 314호 앞 </p>
  `

  sidebarDataState = sidebarDataStateEnum.buildingFacilities
  if(_building != null){
    sidebarDataArgs.building = _building
  }
}

// let sidebar_loadMain = () => {
//   loadSidebarDataState([
//     sidebarDataStateEnum.main
//   ])
// }

// let sidebar_changeBuilding = (_building) => {
//   sidebarDataArgs.building = _building
//   sidebar_loadBuildingDetail()
// }

// let sidebar_loadBuildingDetail = () => {
//   loadSidebarDataState([
//     sidebarDataStateEnum.building,
//     sidebarDataStateEnum.buildingDetail
//   ])
// }

// let sidebar_loadBuildingFacilities = () => {
//   loadSidebarDataState([
//     sidebarDataStateEnum.building,
//     sidebarDataStateEnum.buildingFacilities
//   ])
// }

// let sidebar_building_loadDetail = () => {
//   if (sidebarDataState[0] !== sidebarDataStateEnum.main)
//     return;
  
//   sidebarDataState[2] = sidebarDataStateEnum.buildingDetail
//   loadSide
// }



//core
let loadSidebarDataState = (changingIndex, nextState) => {
  let i = compareSidebarDataState(sidebarDataState, nextState)
  if (i == -1)
    return;
  else {
    unloadSidebarDataState(sidebarDataState[i])
  }
  // update state
  sidebarDataState = nextState

  switch(sidebarDataState.phase) {
    case sidebarDataStateEnum.main:
      _loadMain()
      break;

    case sidebarDataStateEnum.building:
      _loadBuilding(sidebarDataState.building)
      break;
  }

  resizeSidebarInside()

}

let unloadSidebarDataState = (state) => {
  document.getElementById(state).style.display = "none"
}

let _loadMain = () => {
  document.getElementById(sidebarDataStateEnum.main).style.display = "block"
}

let _loadBuilding = (currentBuilding) => {
  document.getElementById(sidebarDataStateEnum.building).style.display = "block"
}

let _building_loadDetail = (currentBuilding) => {
  document.getElementById(sidebarDataStateEnum.building).style.display = "block"
}