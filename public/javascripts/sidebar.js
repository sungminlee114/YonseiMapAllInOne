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

let searchKey = (_key, _type = undefined) => {
  document.getElementById("mapSearch").blur()
  let key = _key;
  //검색일 경우..?
  console.log(key, _type)
  if (key == null || key ==""){
    if(mapSearch.value == "")
      return;
    else
      key = mapSearch.value;
  }
  
  // if(!_type){
  //   if(facilityTypeIdDict[key] == undefined)
  //     _type = "빌딩";
  // }

  if(_type == "건물"){
    //확실히 하나만 있으면
    //이때 type이 정의되었다는건 자동완성을 눌렀다는 뜻

    // let index = buildingList.find((el) => el.name == key)
    // if (index != -1) {
      clickBuilding(buildingList.find((el) => el.name == key));
    // }
    return;
  }

    // if (index == -1){
    //   filterRes = buildingList.filter((el) => el.name.includes(key));
    //   showSearchList(filterRes, _type)
    // }

  // } else { //'시설'
  buildingFilter = buildingList.filter((el) => el.name.includes(key));
  facilityFilter = facilityList.filter((el) => (el.FTYPE.includes(key) || el.FNAME.includes(key)));
  showSearchList(buildingFilter, facilityFilter)
  // }
};

const showSearchList = (buildingFilter, facilityFilter) => {
  document.getElementById("mapSearch").blur()
  sidebar_loadsearchResult(buildingFilter, facilityFilter)
  if (!sidebarIsOpened()) toggleSideBar(true);
}

// <!-- This part is to use API -->

// 한글초성
// https://programmer93.tistory.com/16 참고
let initAutocomplete = (_buildingList, _facilityTypeIdDict, _facilitesList, _facilityIdDict) => {
  source = $.map( _buildingList , function (item) {
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
      type: '건물'
    };
  });

  source = source.concat(($.map( _facilityTypeIdDict , function (item, key) {
    chosung = "";
    // full = Hangul.disassemble(item).join("").replace(/ /gi, "");
    
    Hangul.d(key, true).forEach(function (strItem, index) {
      if (strItem[0] != " ") {
        //띄어 쓰기가 아니면
        chosung += strItem[0]; //초성 추가
      }
    });
    return {
      label: chosung + "|" + key,
      value: key, //김치 볶음밥
      chosung: chosung, //ㄱㅊㅂㅇㅂ
      type: '시설'
    };
  })))

  source = source.concat(($.map( _facilityIdDict , function (item, key) {
    chosung = "";
    // full = Hangul.disassemble(item).join("").replace(/ /gi, "");
    Hangul.d(key, true).forEach(function (strItem, index) {
      if (strItem[0] != " ") {
        //띄어 쓰기가 아니면
        chosung += strItem[0]; //초성 추가
      }
    });
    
    if(Object.keys(_facilityTypeIdDict).findIndex(el => el == item.FNAME) != -1){
      return null;
    }
    return {
      label: chosung + "|" + key,
      value: key, //김치 볶음밥
      chosung: chosung, //ㄱㅊㅂㅇㅂ
      type: '시설'
    };
  })));

  console.log(source)
  

  $("#mapSearch")
    .autocomplete({
      source: source,
      select: function (event, ui) {
        document.getElementById("mapSearch").blur()
        searchKey(ui.item.value, ui.item.type);
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
      .append(`<span class="dropdown-span"> ${item.type} </span>`)
      .append(`<button class="dropdown-item" type="button"> ${item.value} </button>`) //여기에다가 원하는 모양의 HTML을 만들면 UI가 원하는 모양으로 변함.
      .appendTo(ul);
  };

  $("#mapSearch").keypress(function (event) {
    let keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode == "13") {
      document.getElementById("mapSearch").blur()
      //enter?
      searchKey(mapSearch.value);
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

    loading: 'sidebar-building-loading',

    searchResult: 'sidebar-searchResult'
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
      <div class="icon-div col-3 d-flex sidebar-facility-IconSearch my-btn">
        <img src="/images/식당.png" alt="식당">
      </div>
      <div class="icon-div col-3 d-flex sidebar-facility-IconSearch my-btn">
        <img src="/images/화장실.png" alt="화장실">
      </div>
      <div class="icon-div col-3 d-flex sidebar-facility-IconSearch my-btn">
        <img src="/images/자판기.png" alt="자판기">
      </div>
      <div class="icon-div col-3 d-flex sidebar-facility-IconSearch my-btn">
        <img src="/images/카페.png" alt="카페">
      </div>
    </div>
  </div>
  `

  // <div class="sidebar-body no-after" id="sidebar-main-direction">
  //   <h2> 이동시간 </h2>
  //   <div class="row sidebar-main-direction-row">
  //     <div class="col-12">
  //       <div id="direction_start" class="input-group ui-widget form-control dir-searchbox-div">
  //         <input type="text" class="" id="directionStartSearch" placeholder="출발지를 입력하세요."
  //           style="height: 100%; font-size: 0.7em; border: none; outline: none; width: 88%;">
  //       </div>
  //       <div id="direction_end" class="input-group ui-widget form-control dir-searchbox-div">
  //         <input type="text" class="" id="directionEndSearch" placeholder="도착지를 입력하세요."
  //           style="height: 100%; font-size: 0.7em; border: none; outline: none; width: 88%;">
  //       </div>
  //     </div>
  //     <div class="col-12" style="margin-top: 10px;">
  //       <div id="direction_search" class="my-btn">찾기</div>
  //     </div>
  //   </div>
  // </div>

  Array.from(document.getElementsByClassName("sidebar-facility-IconSearch")).forEach((element) => {
    element.addEventListener("click", (e) => {
      let alt = e.target.getAttribute('alt')
      searchKey(alt)
    });
  });
}

let sidebar_loadBuilding = (_building) => {
  return new Promise((resolve, reject) => {
    if((sidebarDataState === sidebarDataStateEnum.buildingDetail || sidebarDataState === sidebarDataStateEnum.buildingFacilities) && sidebarDataArgs.building === _building)
      resolve();

    sidebarBodyFrame.id = sidebarDataStateEnum.building

    //정보 가져오기
    

    sidebarBodyFrame.innerHTML = `
    <div class="sidebar-body row" id="sidebar-building-buildingDetail">
      <div style="width: 30px;">
        <img src="/images/icon_home.png" class="my-btn" style="border:0.5px solid black; width:inherit" id="sidebar-building-home" onclick="sidebar_toHome();">
        <!-- <i class="material-icons my-btn" id="sidebar-building-home" style="font-size:0.75rem;" onclick="sidebar_toHome();">home</i> --!>
      </div>
      <div style="justify-content:center; width:calc(100% - 60px)">
        <h2 class="no-after" style="margin-bottom:0; font-size:1rem"> ${_building.name} </h3>
      </div>
      <div style="width: 30px;">
      </div>
    </div>
    <div class="sidebar-body no-after">
      <div class="row" id="sidebar-building-tab">
        <div class="col-6">
          <h2 id="sidebar-tab-detail" type="button" onclick="sidebar_loadBuildingDetailOnclick(this)" data-BID="${_building.id}"> 건물 정보 </h2>
        </div>
        <div class="col-6">
          <h2 id="sidebar-tab-facilities" type="button" onclick="sidebar_loadBuildingFacilitiesOnclick(this)" data-BID="${_building.id}"> 시설 정보 </h2>
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
  <p> 학기중 평일 : ${_building.BTIME_SEM_DAY} </p>
  <p> 학기중 주말 : ${_building.BTIME_SEM_END} </p>
  <p> 방학중 평일 : ${_building.BTIME_VAC_DAY} </p>
  <p> 방학중 주말 : ${_building.BTIME_VAC_END} </p>
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

let sidebar_loadBuildingDetailOnclick = (e) =>{
  sidebar_loadBuildingDetail(buildingList.find(el=>el.id === parseInt(e.dataset.bid)));
}

let sidebar_loadBuildingFacilitiesOnclick = (e) =>{
  sidebar_loadBuildingFacilities(buildingList.find(el=>el.id === parseInt(e.dataset.bid)));
}

function sidebar_loadBuildingFacilities(_building) {
  
  return new Promise(async (resolve, reject) => {
  if(sidebarDataState === sidebarDataStateEnum.buildingFacilities && (sidebarDataArgs.building === _building || _building === null))
    resolve();

    if(_building != null){
      await sidebar_loadBuilding(_building)
    }

  document.getElementById("sidebar-tab-detail").classList.remove("mytab-selected")
  document.getElementById("sidebar-tab-facilities").classList.add("mytab-selected")

  const sidebarTabBody = document.getElementsByClassName("sidebar-body-tabBody")[0];
  sidebarTabBody.id = sidebarDataStateEnum.buildingFacilities
  res = []
  // console.log(_building, facilityList['14'].FBID, typeof(facilityList['14'].FBID), _building.id, typeof(_building.id))
  res = facilityList.filter(el => el.FBID === _building.id)

  let resHTML = `
  <div class="dropdown" id="sidebar-buildingFacilities-dropdownOuter">
    <div class="dropdown-toggle my-dropdown" type="button" id="sidebar-buildingFacilities-dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-flip="false" data-display="static">
      시설을 선택해 주세요.
    </div>
    <div class="dropdown-menu my-dropdownBody" id="sidebar-buildingFacilities-dropdownBody" aria-labelledby="sidebar-buildingFacilities-dropdown">
    `
  let ftypes = {}


  res.forEach((el, i) =>{
    if(!(el.FTYPE in ftypes)){
      ftypes[el.FTYPE] = []
      resHTML += `<button class="dropdown-item facilities-dropdown" type="button" data-ftype="${el.FTYPE}" onclick="sidebar_handle_facilities_dropdown(this)">${el.FTYPE}</button>`
    }
    ftypes[el.FTYPE].push(el)
  });

  resHTML += `
    </div>
  </div>
  <div id="sidebar-buildingFacilites-InfoBody">
  </div>
  `

  if(res.length == 0){
    resHTML = `<p style="text-align: center">시설이 없습니다.<p>`
  }

  sidebarTabBody.innerHTML = resHTML;

  sidebarDataState = sidebarDataStateEnum.buildingFacilities
  if(_building != null){
    sidebarDataArgs.building = _building
  }

  resolve()
  });
}

const sidebar_handle_facilities_dropdown = (e, ftype=undefined)=>{
    if(ftype == undefined)
      ftype = e.dataset.ftype;
    let resHTML = '';
    let floc = {};

    document.getElementById("sidebar-buildingFacilities-dropdown").innerText = ftype

    facilityTypeIdDict[ftype].forEach(el => {
      if(!(el.FLOCATION in floc)){
        floc[el.FLOCATION] = [];
      }

      floc[el.FLOCATION].push(el)
    })

    for (const [k, v] of Object.entries(floc)) {
      resHTML += `
        <h5> ${k} </h5>
        `
      v.forEach(el => {
        resHTML += `
        <p style="font-weight:bold; font-size: 0.9rem"> [${el.FNAME}] </p>
        <p> 학기중 평일 : ${el.FTIME_SEM_DAY} </p>
        <p> 학기중 주말 : ${el.FTIME_SEM_END} </p>
        <p> 방학중 평일 : ${el.FTIME_VAC_DAY} </p>
        <p> 방학중 주말 : ${el.FTIME_VAC_END} </p>
        <span class="my-line"></span>
      `
      })
    }

    let infoBody = document.getElementById("sidebar-buildingFacilites-InfoBody");
    infoBody.innerHTML = "";
    infoBody.innerHTML = resHTML;

    
}

const sidebar_loadsearchResult = (buildingFilter, facilityFilter)=>{
  console.log(buildingFilter, facilityFilter)
  return new Promise((resolve, reject) => {
  sidebarDataState = sidebarDataStateEnum.searchResult;
  sidebarBodyFrame.id = sidebarDataState;
  // let typeEn = 'building'
  // if(typeEn == '시설')
  //   typeEn = 'facility'

  st = `
  <div class="sidebar-body" id="sidebar-searchResult-header">
    <h2 class="no-after"> 검색결과 </h2>
  </div>
  <div class="sidebar-body no-after" id="sidebar-searchResult-tabs">
    <div class="row" id="sidebar-building-tab">
      <div class="col-6">
        <h2 id="sidebar-searchResultTab-building" type="button" onclick="sidebar_loadSearchResultBuildingOnClick(this)" class="mytab-selected"> 건물 </h2>
      </div>
      <div class="col-6">
        <h2 id="sidebar-searchResultTab-facilities" type="button" onclick="sidebar_loadSearchResultFacilitiesOnClick(this)"> 시설 </h2>
      </div>
    </div>
    <div id="sidebar-searchResult-building" class="sidebar-body-tabBody">`

    if(buildingFilter.length == 0){
      st += `<p style="text-align: center"> 검색 결과가 없습니다. </p>`
    } else {
    
      buildingFilter.forEach(el=>{
        st += 
        `
        <p class="searchResultBuildingEl my-btn" style="font-weight:bold; font-size: 0.9rem" data="${el.id}">${el.name}</p>
        `
      });
    }

    st += 
    `</div>
    <div id="sidebar-searchResult-facilities" class="sidebar-body-tabBody hide">`

    if(facilityFilter.length == 0){
      st += `<p style="text-align: center"> 검색 결과가 없습니다. </p>`
    } else {
      facilityFilter.forEach(el=>{
        st += 
        `
        <p class="searchResultFacilityEl my-btn" style="font-weight:bold; font-size: 0.9rem" building="${el.FBID}" facility="${el.FID}" >${el.FNAME} (${buildingList.find(e => e.id == el.FBID).name})</p>
        `
      });
    }
    st += `  
    </div>
  </div>
  `

  sidebarBodyFrame.innerHTML = st
  
  if(buildingFilter.length == 0 && facilityFilter.length != 0)
    sidebar_loadSearchResultFacilites()

  Array.from(document.getElementsByClassName("searchResultBuildingEl")).forEach((element) => {
    element.addEventListener("click", (e) => {
      let bid = parseInt(e.target.getAttribute('data'))
      console.log(e.target, bid)
      clickBuilding(buildingList.find((el) => el.id == bid))
    });
  });

  Array.from(document.getElementsByClassName("searchResultFacilityEl")).forEach((element) => {
    element.addEventListener("click",async (e) => {
      let target = e.target
      let bid = target.getAttribute('building')
      let fid = target.getAttribute('facility')
      clickBuilding(buildingList.find((el) => el.id == bid))
      await sidebar_loadBuildingFacilities(buildingList.find((el) => el.id == bid));
      sidebar_handle_facilities_dropdown(null, facilityList.find(el => el.FID == fid).FTYPE)
    });
  });
  resolve()
  })
}



async function sidebar_loadSearchResultBuilding(_building = null){
  document.getElementById("sidebar-searchResultTab-building").classList.add("mytab-selected")
  document.getElementById("sidebar-searchResultTab-facilities").classList.remove("mytab-selected")
  document.getElementById("sidebar-searchResult-building").classList.remove("hide")
  document.getElementById("sidebar-searchResult-facilities").classList.add("hide")
}

async function sidebar_loadSearchResultFacilites(_building = null){
  document.getElementById("sidebar-searchResultTab-building").classList.remove("mytab-selected")
  document.getElementById("sidebar-searchResultTab-facilities").classList.add("mytab-selected")
  document.getElementById("sidebar-searchResult-building").classList.add("hide")
  document.getElementById("sidebar-searchResult-facilities").classList.remove("hide")
}

let sidebar_loadSearchResultBuildingOnClick = (e) =>{
  sidebar_loadSearchResultBuilding();
}

let sidebar_loadSearchResultFacilitiesOnClick = (e) =>{
  sidebar_loadSearchResultFacilites();
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