
let buildingList, facilityList, facilityTypeIdDict, faciltiyIDDict;
let _getDatas = () => {
    let b = getBuildingList();
    let f = getFacilityList();
    Promise.all([b,  f]).then((values) => {
      buildingList =  values[0]
      facilityList = values[1]
      console.log(buildingList)
      console.log(facilityList)
      facilityTypeIdDict = getFaciltiyTypeIDDict(facilityList)
      faciltiyIDDict = getFaciltiyIDDict(facilityList)
      console.log(facilityTypeIdDict)
      console.log(faciltiyIDDict)
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
    for (const [key, el] of Object.entries(result)) {
      let area = [];
      let xy = 0;
      let tempArea = {};
      Array.from(
        el.BAREA.split("\n").join("\t").split(" ").join("\t").split("\t")
      ).forEach((e) => {
        if (xy == 0) {
          tempArea.x = parseInt(e);
        } else {
          tempArea.y = parseInt(e);
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
        on: true,
      });
    }
    resolve(_buildingList);
  });
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
