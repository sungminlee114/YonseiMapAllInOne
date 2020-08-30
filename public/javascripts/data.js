let getBuildingList = () => {
  let _buildingList = [];
    $.ajax({
      type: "get",
      url: "api/sinchon/building",
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
          id: el.BID,
          name: el.BNAME,
          on: true,
        });
      }
      initAutocomplete(_buildingList)
    });
    return _buildingList
  };