
let buildingList, facilityList, facilityTypeIdDict, faciltiyIDDict;
let _getDatas = () => {
    let b = getBuildingList();
    let f = getFacilityList();
    Promise.all([b,  f]).then((values) => {
      buildingList =  values[0]
      facilityList = values[1]
      // console.log(buildingList)
      // console.log(facilityList)
      facilityTypeIdDict = getFaciltiyTypeIDDict(facilityList)
      faciltiyIDDict = getFaciltiyIDDict(facilityList)
      // console.log(facilityTypeIdDict)
      // console.log(faciltiyIDDict)
      initAutocomplete(values[0], facilityTypeIdDict, values[1], faciltiyIDDict)
    });
    
};

const convertLinks = ( input ) => {

  let text = input;
  const linksFound = text.match( /(?:www|https?)[^\s]+/g );
  const aLink = [];
  
  if ( linksFound != null ) {

    for ( let i=0; i<linksFound.length; i++ ) {
      let replace = linksFound[i];
      if ( !( linksFound[i].match( /(http(s?)):\/\// ) ) ) { replace = 'http://' + linksFound[i] }
      let linkText = replace.split( '/' )[2];
      if ( linkText.substring( 0, 3 ) == 'www' ) { linkText = linkText.replace( 'www.', '' ) }
      // if ( linkText.match( /youtu/ ) ) {

      //   let youtubeID = replace.split( '/' ).slice(-1)[0];
      //   aLink.push( '<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/' + youtubeID + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>' )
      // }
      // else if ( linkText.match( /vimeo/ ) ) {
      //   let vimeoID = replace.split( '/' ).slice(-1)[0];
      //   aLink.push( '<div class="video-wrapper"><iframe src="https://player.vimeo.com/video/' + vimeoID + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>' )
      // }
      // else {
        aLink.push( '<a href="' + replace + '" target="_blank">' + linkText + '</a>' );
      // }

      text = text.split( linksFound[i] )
      text = text.map(item => { return aLink[i].includes('iframe') ? item.trim() : item } ).join( aLink[i] );

    }
    return text;

  }
  else {
    return input;
  }
}

const getFaciltiyTypeIDDict = (_facilityList) => {
  let ftypes = {}
  _facilityList.forEach((el, i) =>{
    if(!(el.FTYPE in ftypes)){
      ftypes[el.FTYPE] = []
      // resHTML += `<button class="dropdown-item facilities-dropdown" type="button" data-ftype="${el.FTYPE}" onclick="sidebar_handle_facilities_dropdown(this)">${el.FTYPE}</button>`
    }
    ftypes[el.FTYPE].push(el)
  });

  return ftypes
}

const getFaciltiyIDDict = (_facilityList) => {
  let ftypes = {}
  _facilityList.forEach((el, i) =>{
    if(!(el.FNAME in ftypes)){
      ftypes[el.FNAME] = []
      // resHTML += `<button class="dropdown-item facilities-dropdown" type="button" data-ftype="${el.FTYPE}" onclick="sidebar_handle_facilities_dropdown(this)">${el.FTYPE}</button>`
    }
    ftypes[el.FNAME].push(el)
  });

  return ftypes
}

let getBuildingList = () => {
  return new Promise((resolve, reject) => {
  let _buildingList = [];
  $.ajax({
    type: "get",
    url: `api/${CAMPUS}/building`,
  }).done((result) => {
    
    // let ratio = CAMPUS == 'sinchon'? 1 : 1.002;
    let ratio = 1
    for (const [key, el] of Object.entries(result)) {
      // let ratio = el.BNAME != '송도학사A~C'? 1 : 0.995;
      let area = [];
      let xy = 0;
      let tempArea = {};

      Array.from(
        el.BAREA.split("\n").join("\t").split(" ").join("\t").split("\t")
      ).forEach((e) => {
        if (xy == 0) {
          tempArea.x = Math.ceil(parseInt(e) * ratio);
        } else {
          tempArea.y = Math.ceil(parseInt(e) * ratio);
          area.push(tempArea);
          tempArea = {};
        }
        xy = (xy + 1) % 2;
      });

      _buildingList.push({
        area: area,
        BID: el.BID,
        name: el.BNAME,
        BTIME_SEM_DAY: el.BTIME_SEM_DAY,
        BTIME_SEM_END: el.BTIME_SEM_END,
        BTIME_VAC_DAY: el.BTIME_VAC_DAY,
        BTIME_VAC_END: el.BTIME_VAC_END,
        BETC: convertLinks(el.BETC),
        BAVFLOOR: el.BAVFLOOR !== '' ? el.BAVFLOOR : null,
        on: true,
      });
    }
    /*4 eee */
    if(CAMPUS == 'sinchon'){
      _buildingList.push({
        area : [
          {x: 826, y: 2069.4540581789656},
          {x: 833.0468369109548, y: 2099.285603821149},
          {x: 816.0541843299642, y: 2102.3065198355475},
          {x: 781.6912646661833, y: 2157.060622596517},
          {x: 753.7477915329989, y: 2114.3901838931406},
          {x: 818.3198713407629, y: 2072.852588695164},
        ],
        name: '라이프 아카데미',
        ee: true,
        BETC: convertLinks("<strong>이스터에그 발견!</strong><br>발견하신 이스터에그는 혼자만 알고있는 센스~ 꼭 지켜주실거죠?<br><br>생띵대의 건물 증축을 응원합니다.<br>https://docs.google.com/forms/d/1x2qvGjVrbrMMMUmf5X9H86QZmWfMaUUusYWOJKEPZv0/edit?usp=sharing<br>"),
        BID: 825825
      })

      _buildingList.push({
          area : [
            {x: 698.3420035156511, y: 1653.569414777132},
            {x: 712.8060530428959, y: 1641.8005569325774},
            {x: 715.0380778065182, y: 1652.9606807506893},
            {x: 719.7050386759105, y: 1656.4101735671966},
            {x: 716.8642798858457, y: 1660.0625777258515},
            {x: 709.153648884241, y: 1659.2509323572615},
          ],
          name: '구관이 명관',
          ee: true,
          BETC: convertLinks("<strong>이스터에그 발견!</strong><br>발견하신 이스터에그는 혼자만 알고있는 센스~ 꼭 지켜주실거죠?<br><br>연희전문학교를 설립하신 언더우드 선교사님을 기립니다.<br>https://docs.google.com/forms/d/1twOan3wijq4pQqRNNVd6-keTM_gCvZBT4j7DMEhj2KI/edit?usp=sharing<br>"),
          BID: 1885
        });
      }
    });
    resolve(_buildingList);
});
  
};

let getFacilityList = () => {
  return new Promise((resolve, reject) => {
    let _facilityList = [];
    $.ajax({
      type: "get",
      url: `api/${CAMPUS}/facility`,
    }).done((result) => {
      for (const [key, el] of Object.entries(result)) {
        el.FETC1 = convertLinks(el.FETC1)
        _facilityList.push(el);
      }
      resolve(_facilityList);
    });
  });
};
