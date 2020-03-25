let timeFilterSwitch = document.getElementById("switch1");

// console.log(timeFilterSwitch)

$('#switch1').change(function() {
    if($(this).prop('checked')){
        buildingList.forEach((item)=>{
            if(item.on == false)
                pushDrawQ(item, "rgba(0, 0, 0, 0.6)", "on", "fill", false);
        })
    } else {
        deleteDrawQ(null, "on", false);

    }
    
    redrawCanvas();
})
