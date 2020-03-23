var searchKey = (e, _key) => {
    var key = _key
    if (key == null)
      key = $("#mapSearch").val();
    var index = data.findIndex(val => val == key);
    console.log(key)
    if (index != -1) {
      if (type[index] == "building") {
        clickBuilding(key);
      }
    }
  }
  $(function () {
    // <!-- This part is to use API -->

    // 한글초성
    // https://programmer93.tistory.com/16 참고
    let source = $.map(data, function (item) {
      chosung = "";

      // full = Hangul.disassemble(item).join("").replace(/ /gi, "");

      Hangul.d(item, true).forEach(function (strItem, index) {
        if (strItem[0] != " ") {	//띄어 쓰기가 아니면
          chosung += strItem[0];//초성 추가
        }
      });
      return {
        label: chosung + "|" + item,
        value: item, //김치 볶음밥
        chosung: chosung, //ㄱㅊㅂㅇㅂ

      }
    });

    $("#mapSearch").autocomplete({
      source: source,
      select: function (event, ui) {
        searchKey(event, ui.item.value)
      },
      focus: function (event, ui) {
        return false;
        //event.preventDefault();
      },
    }).autocomplete("instance")._renderItem = function (ul, item) {
      //.autocomplete( "instance" )._renderItem 설절 부분이 핵심
      return $("<li>")	//기본 tag가 li로 되어 있음 
        .append("<div>" + item.value + "</div>")	//여기에다가 원하는 모양의 HTML을 만들면 UI가 원하는 모양으로 변함.
        .appendTo(ul);
    };

    $('#mapSearch').keypress(function (event) {
      var keycode = (event.keyCode ? event.keyCode : event.which);
      if (keycode == '13') {
        searchKey(event)
      }
    });

  });