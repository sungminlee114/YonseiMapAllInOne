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
  allFilteredList = source.filter(el => el.label.includes(key));
  buildingFilter = buildingList.filter(el => allFilteredList.filter(el => el.type == '건물').map(el => el.value).includes(el.name))
  facilityFilter = facilityList.filter(el => {let a = allFilteredList.filter(el => el.type == '시설').map(el => el.value); return a.includes(el.FTYPE) || a.includes(el.FNAME)});
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
  
  source = source.filter((item, index) => source.map(el=> el.value).indexOf(item.value) === index);

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
    <h2 class="no-after" style="margin-bottom:20px"> 시설 안내 </h2>
    <div class="row icons">
      <div id="icon-div-cafeteria" class="icon-div col-2 col-md-4 d-flex sidebar-facility-IconSearch my-btn2 no-border">
        
      </div>
      <div id="icon-div-toilet" class="icon-div col-2 col-md-4 d-flex sidebar-facility-IconSearch my-btn2 no-border">
        
      </div>
      <div id="icon-div-venderMachine" class="icon-div col-2 col-md-4 d-flex sidebar-facility-IconSearch my-btn2 no-border">
        
      </div>
      <div id="icon-div-cafe" class="icon-div col-2 col-md-4 d-flex sidebar-facility-IconSearch my-btn2 no-border">
        
      </div>

      <div id="icon-div-copyCenter" class="icon-div col-2 col-md-4 d-flex sidebar-facility-IconSearch my-btn2 no-border">
        
      </div>

      <div id="icon-div-cvs" class="icon-div col-2 col-md-4 d-flex sidebar-facility-IconSearch my-btn2 no-border">
        
      </div>
    </div>
  </div>

  <div class="sidebar-body" id="sidebar-main-report" style="margin-top:20px; text-align:center;">
    <h2 class="no-after" style="margin-bottom:20px"> 지도 정보 제보 </h2>
    <p> 오류나 새로운 정보를 <a href="/report" target="_blank">여기</a>서 제보해 주세요.
    <br/>
    사소한 관심이 큰 변화를 만듭니다 :) </p>
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
  let i = 0;
  Array.from(document.getElementsByClassName("sidebar-facility-IconSearch")).forEach((element) => {
    element.appendChild(icon_facilties[i++])
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
    sidebarBodyFrame.dataset.bid = _building.BID

    //정보 가져오기
    

    sidebarBodyFrame.innerHTML = `
    <div class="sidebar-body sidebar-body-header row" id="sidebar-building-buildingDetail">
      <div style="width: 28.5px;" id="sidebar-header-leftBox">
      
        <!-- <i class="material-icons my-btn" id="sidebar-building-home" style="font-size:0.75rem;" onclick="sidebar_toHome();">home</i> --!>
      </div>
      <div style="justify-content:center; width:calc(100% - 60px); display:flex; align-items:center">
        <h2 class="no-after" style="margin-bottom:0; font-size:1rem"> ${_building.name} </h3>
      </div>
      <div style="width: 28.5px;" id="sidebar-header-rightBox">
      </div>
    </div>
    <div class="sidebar-body no-after sidebar-body-scrY">
      <div class="row" id="sidebar-building-tab">
        <div class="col-6">
          <h2 id="sidebar-tab-detail" class="sidebar-tab" type="button" onclick="sidebar_loadBuildingDetailOnclick(this)" data-BID="${_building.BID}"> 건물 정보 </h2>
        </div>
        <div class="col-6">
          <h2 id="sidebar-tab-facilities" class="sidebar-tab" type="button" onclick="sidebar_loadBuildingFacilitiesOnclick(this)" data-BID="${_building.BID}"> 시설 정보 </h2>
        </div>
      </div>
      <div class="sidebar-body-tabBody">
      </div>
    </div>
    `

    document.getElementById("sidebar-header-leftBox").appendChild(icon_home)
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
  st = `
  <h5> 사진 </h5>
  <img src="./images/buildings/${CAMPUS}/${_building.BID}.jpg" id="sidebar-building-picture"/>
  <h5> 운영 시간 </h5>
  <p> 학기중 평일 : ${_building.BTIME_SEM_DAY} </p>
  <p> 학기중 주말 : ${_building.BTIME_SEM_END} </p>
  <p> 방학중 평일 : ${_building.BTIME_VAC_DAY} </p>
  <p> 방학중 주말 : ${_building.BTIME_VAC_END} </p>
  `
  if(_building.BETC !== ''){
    st += 
    `<h5> 건물 정보</h5>
    <p> ${_building.BETC} </p>
    `
  }

  sidebarTabBody.innerHTML = st;
  

  document.getElementById("sidebar-building-picture").addEventListener("error", (e) => {
    e.target.src='./images/no_image.gif';
    e.target.setAttribute("onclick", "location.href ='/report'")
    e.target.setAttribute("style", "cursor:pointer")
  })

  sidebarDataState = sidebarDataStateEnum.buildingDetail
  if(_building != null){
    sidebarDataArgs.building = _building
  }
  
}

let sidebar_loadBuildingDetailOnclick = (e) =>{
  sidebar_loadBuildingDetail(buildingList.find(el=>el.BID === parseInt(e.dataset.bid)));
}

let sidebar_loadBuildingFacilitiesOnclick = (e) =>{
  sidebar_loadBuildingFacilities(buildingList.find(el=>el.BID === parseInt(e.dataset.bid)));
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
  res = facilityList.filter(el => el.FBID === _building.BID)

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
    if(ftype == undefined){
      ftype = e.dataset.ftype;
    }
    bid = document.getElementById(sidebarDataStateEnum.building).dataset.bid;
    let resHTML = '';
    let floc = {};

    document.getElementById("sidebar-buildingFacilities-dropdown").innerText = ftype

    let arr = facilityTypeIdDict[ftype];
    if(bid !== null){
      arr = arr.filter(el => el.FBID == bid)
    }

    arr.forEach(el => {
      if(!(el.FLOCATION in floc)){
        floc[el.FLOCATION] = [];
      }
      
      floc[el.FLOCATION].push(el)
    })

    for (const [k, v] of Object.entries(floc)) {
      resHTML += `
        <h5> ${k} </h5>
        <span class="my-line"></span>
        `
      let top = 0
      v.forEach((el,index) => {
        console.log(el, index)
        if(index == 1)
          top = 2
        resHTML += `
        <p style="font-weight:bold; font-size: 1rem; margin-top:${top}rem"> ${el.FNAME} </p>
        <p> 학기중 평일 : ${el.FTIME_SEM_DAY} </p>
        <p> 학기중 주말 : ${el.FTIME_SEM_END} </p>
        <p> 방학중 평일 : ${el.FTIME_VAC_DAY} </p>
        <p> 방학중 주말 : ${el.FTIME_VAC_END} </p>
        <p> 시설 정보 : ${el.FETC1} </p>
      `
      })
    }

    let infoBody = document.getElementById("sidebar-buildingFacilites-InfoBody");
    infoBody.innerHTML = "";
    infoBody.innerHTML = resHTML;

    
}

const sidebar_loadsearchResult = (buildingFilter, facilityFilter)=>{
  return new Promise((resolve, reject) => {
  sidebarDataState = sidebarDataStateEnum.searchResult;
  sidebarBodyFrame.id = sidebarDataState;
  // let typeEn = 'building'
  // if(typeEn == '시설')
  //   typeEn = 'facility'

  st = `
  <div class="sidebar-body sidebar-body-header row" id="sidebar-searchResult-header">
    <h2 class="no-after" style="font-size:1rem; padding-top:1px"> 검색결과 </h2>
  </div>
  <div class="sidebar-body sidebar-body-scrY no-after" id="sidebar-searchResult-tabs">
    <div class="row" id="sidebar-building-tab">
      <div class="col-6">
        <h2 id="sidebar-searchResultTab-building" class="sidebar-tab" type="button" onclick="sidebar_loadSearchResultBuildingOnClick(this)" class="mytab-selected"> 건물 </h2>
      </div>
      <div class="col-6">
        <h2 id="sidebar-searchResultTab-facilities" class="sidebar-tab" type="button" onclick="sidebar_loadSearchResultFacilitiesOnClick(this)"> 시설 </h2>
      </div>
    </div>
    <div id="sidebar-searchResult-building" class="sidebar-body-tabBody">`

    if(buildingFilter.length == 0){
      st += `<p style="text-align: center"> 검색 결과가 없습니다. </p>`
    } else {
    
      buildingFilter.forEach(el=>{
        let b = [];
        for (const [key, value] of Object.entries(facilityList.filter(facility => facility.FBID == el.BID))) {
          b.push(value.FTYPE)
        }
        let a = "";
        console.log(b)
        if(b === []){
          a = ""
        }else {
          b = b.filter((item, index) => b.indexOf(item) === index);
          a = b.join(', ')
        }
        st += 
        `
        <div class="searchResultElWrap searchResultBuildingEl" style="font-weight:bold; font-size: 0.9rem" building="${el.BID}" >
          <div class="searchResultBar">
          </div>
          <div class="searchResultEl">
            <p class="searchResultElHead">${el.name}</p>
            <p class="searchResultElBody">${a}</p>
          </div>
        </div>
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
        <div class="searchResultElWrap searchResultFacilityEl" style="font-weight:bold; font-size: 0.9rem" building="${el.FBID}" facility="${el.FID}" >
          <div class="searchResultBar">
          </div>
          <div class="searchResultEl" >
            <p style="font-weight:bold; font-size:1rem; margin-bottom:0.5rem">${el.FNAME}</p>
            <p style="font-size:0.7rem; color:gray">${buildingList.find(e => e.BID == el.FBID).name}</p>
          </div>
        </div>
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
  else
    sidebar_loadSearchResultBuilding()


  Array.from(document.getElementsByClassName("searchResultBuildingEl")).forEach((element) => {
    element.addEventListener("click", (e) => {
      let target = element
      let bid = parseInt(target.getAttribute('building'))
      clickBuilding(buildingList.find((el) => el.BID == bid))
    });
  });

  Array.from(document.getElementsByClassName("searchResultFacilityEl")).forEach((element) => {
    element.addEventListener("click",async (e) => {
      let target = element
      let bid = target.getAttribute('building')
      let fid = target.getAttribute('facility')
      clickBuilding(buildingList.find((el) => el.BID == bid))
      await sidebar_loadBuildingFacilities(buildingList.find((el) => el.BID == bid));
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