var map,centerPoint,
    cityCircle,marker,
    z=0,
    z1=0;
var path,data;
var resultDiv,latlngDiv;
var theLat=1,theLng=1;

var SpeciesID;

//Result Array
var A_i35_1,
    A_i35_2 = [];
var canDoing = true;
var imgNum = 0;

function initialize(theSpeciesID) {
  SpeciesID = theSpeciesID;
  centerPoint = new google.maps.LatLng(23.828677,120.80148);
  var mapOptions = {
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.SATELLITE ,
    center: centerPoint
  };
  map = new google.maps.Map(document.getElementById('map_canvas'),mapOptions);

  google.maps.event.addListener(map,'click',function(event) {
  point = event.latLng;
  console.log('經度:' + point.lng() + ' 緯度:' + point.lat());

  if(event.latLng) {
    mark(point.lat(),point.lng());
    placeMarker(point.lat(),point.lng());
    //執行ajax
    AjaxPost(theSpeciesID,point.lat(),point.lng());
  }
 });
  resultDiv = document.getElementById("result");
  latlngDiv = document.getElementById("latlng");
  //新增方向感測聆聽者
  window.addEventListener("deviceorientation", Change_Sensor_Deviceorientation, true);
}

function mark(lat, lng){ //標註座標函式
  if(z1 === 1){
    marker.setMap(null);
    z1=0;
  }
  var m = new google.maps.LatLng(lat, lng);
  marker = new google.maps.Marker({
    map:map,
    draggable:true,
    position: m
  });
  z1=1;
}

function centerAt(lat, lng) {
    var m = new google.maps.LatLng(lat,lng);
    map.panTo(m);
}

function placeMarker(lat, lng) {
  if(z === 1) {
    cityCircle.setMap(null);
    z=0;
  }
  var m = new google.maps.LatLng(lat, lng);
  map.setCenter(m);
  map.setZoom(14);

  var populationOptions = {
    strokeColor: "#ffff00",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
    map: map,
    center: m,
    radius: 2000
  };
  
  cityCircle = new google.maps.Circle(populationOptions);
  cityCircle.setMap(map);
  z=1;

  google.maps.event.addListener(cityCircle,'click',function(event) {
    point = event.latLng;
    console.log('經度:' + point.lng() + ' 緯度:' + point.lat());
    if(event.latLng) {
      mark(point.lat(),point.lng());
      placeMarker(point.lat(),point.lng());
      //執行ajax
      AjaxPost(SpeciesID,point.lat(),point.lng());
    }
  });
}

function AjaxPost(theSpeciesID,LocationLat,LocationLng) {
  $.ajax({
    type:"GET",
    url:"http://bio.vexp.idv.tw/~rys/open/wetmap/s_adv.php?type="+theSpeciesID+"&x="+LocationLng+"&y="+LocationLat+"&m=5",
    cache:false,
    dataType:"text",
    success:function(data){
      //latlngDiv.innerHTML = '搜尋經度：'+LocationLng+'搜尋緯度：'+LocationLat;
      if(data === ''){
        resultDiv.innerHTML = '<h3 style="color:red;">查無生物。</h3>';
        return;
      }
      A_i35_1 = data.split(";");
      for(var i = 0, len = A_i35_1.length; i < len-1 ; i++) {
        A_i35_2[i] = (A_i35_1[i].trim()).split(",");
      }
      if(theSpeciesID==1){
        resultDiv.innerHTML = "<img style=\"width:100%;\" src=\"http://www.i35.club.tw/tools/picture.php?pid=" + A_i35_2[0][1] + "\" />" + "<br />中文學名：" + A_i35_2[0][2] + "<br />中文科名：" + A_i35_2[0][3] + "<br/>採集者：" + A_i35_2[0][4] + "<br/>採集日期：" + A_i35_2[0][5] + "<br/>距離：" + A_i35_2[0][6]+"<br/>其他資訊：<a href=\"http://zh.wikipedia.org/wiki/%E8%9D%B4%E8%9D%B6\">維基</a> <a href=\"https://www.google.com.tw/#q=%E8%9D%B4%E8%9D%B6\">Google</a>";
      } else if(theSpeciesID==2) { //生物名稱："+A_i35_2[0][5]+"<br />
        resultDiv.innerHTML = "<img style=\"width:100%;\" src=\"http://"+A_i35_2[0][4]+"\" />距離："+A_i35_2[0][6]+"公尺<br />採集日期："+A_i35_2[0][2]+"<br />採集者："+A_i35_2[0][3]+"<br/>其他資訊：<a href=\"http://zh.wikipedia.org/wiki/%E9%9D%92%E8%9B%99\">維基</a> <a href=\"https://www.google.com.tw/#q=%E9%9D%92%E8%9B%99\">Google</a>";
      } else if(theSpeciesID==3) {
        resultDiv.innerHTML = "<img style=\"width:100%;\" src=\"\" />距離："+A_i35_2[0][5]+"公尺<br />生物名稱："+A_i35_2[0][1]+"<br />科名："+A_i35_2[0][2]+"<br />採集者："+A_i35_2[0][3]+"<br />採集時間："+A_i35_2[0][4]+"<br/>其他資訊：<a href=\"http://zh.wikipedia.org/wiki/%E8%9B%BE\">維基</a> <a href=\"https://www.google.com.tw/#q=%E8%9B%BE\">Google</a>";
      }
    },
    error:function(data){
      resultDiv.innerHTML = '讀取失敗';
    }
  });
}

function Change_Sensor_Deviceorientation(event) {
  var ax = "Acceleration X value- " + event.beta,
      ay = "Acceleration Y value- " + event.gamma,
      e = event || window.event;
  if(e.gamma <= -20 && canDoing && A_i35_1.length != 0) { //向左
    imgNum--;
    if(imgNum <= 0) imgNum = 0;
    canDoing = false;
    if(SpeciesID==1) {
      resultDiv.innerHTML = "<img style=\"width:100%;\" src=\"http://www.i35.club.tw/tools/picture.php?pid=" + A_i35_2[imgNum][1] + "\" />" + "<br />中文學名：" + A_i35_2[imgNum][2] + "<br />中文科名：" + A_i35_2[imgNum][3] + "<br/>採集者：" + A_i35_2[imgNum][4] + "<br/>採集日期：" + A_i35_2[imgNum][5] + "<br/>距離：" + A_i35_2[imgNum][6]+"<br/>其他資訊：<a href=\"http://zh.wikipedia.org/wiki/%E8%9D%B4%E8%9D%B6\">維基</a> <a href=\"https://www.google.com.tw/#q=%E8%9D%B4%E8%9D%B6\">Google</a>";
    } else if(SpeciesID==2) { //生物名稱："+A_i35_2[imgNum][5]+"<br />
      resultDiv.innerHTML = "<img style=\"width:100%;\" src=\"http://"+A_i35_2[imgNum][4]+"\" />距離："+A_i35_2[imgNum][6]+"公尺<br />採集日期："+A_i35_2[imgNum][2]+"<br />採集者："+A_i35_2[imgNum][3]+"<br/>其他資訊：<a href=\"http://zh.wikipedia.org/wiki/%E9%9D%92%E8%9B%99\">維基</a> <a href=\"https://www.google.com.tw/#q=%E9%9D%92%E8%9B%99\">Google</a>";
    } else if(SpeciesID==3) {
      resultDiv.innerHTML = "<img style=\"width:100%;\" src=\"\" />距離："+A_i35_2[imgNum][5]+"公尺<br />生物名稱："+A_i35_2[imgNum][1]+"<br />科名："+A_i35_2[imgNum][2]+"<br />採集者："+A_i35_2[imgNum][3]+"<br />採集時間："+A_i35_2[imgNum][4]+"<br/>其他資訊：<a href=\"http://zh.wikipedia.org/wiki/%E8%9B%BE\">維基</a> <a href=\"https://www.google.com.tw/#q=%E8%9B%BE\">Google</a>";
    }
    setTimeout(function() {
      canDoing = true;
    }, 1000);
  }
  if(e.gamma >= 20 && canDoing && A_i35_1.length != 0) { //向右
    imgNum++;
    if(imgNum >= 3) imgNum = 3;
    canDoing = false;
    if(SpeciesID==1) {
      resultDiv.innerHTML = "<img style=\"width:100%;\" src=\"http://www.i35.club.tw/tools/picture.php?pid=" + A_i35_2[imgNum][1] + "\" />" + "<br />中文學名：" + A_i35_2[imgNum][2] + "<br />中文科名：" + A_i35_2[imgNum][3] + "<br/>採集者：" + A_i35_2[imgNum][4] + "<br/>採集日期：" + A_i35_2[imgNum][5] + "<br/>距離：" + A_i35_2[imgNum][6]+"<br/>其他資訊：<a href=\"http://zh.wikipedia.org/wiki/%E8%9D%B4%E8%9D%B6\">維基</a> <a href=\"https://www.google.com.tw/#q=%E8%9D%B4%E8%9D%B6\">Google</a>";
    } else if(SpeciesID==2) { //生物名稱："+A_i35_2[imgNum][5]+"<br />
      resultDiv.innerHTML = "<img style=\"width:100%;\" src=\"http://"+A_i35_2[imgNum][4]+"\" />距離："+A_i35_2[imgNum][6]+"公尺<br />採集日期："+A_i35_2[imgNum][2]+"<br />採集者："+A_i35_2[imgNum][3]+"<br/>其他資訊：<a href=\"http://zh.wikipedia.org/wiki/%E9%9D%92%E8%9B%99\">維基</a> <a href=\"https://www.google.com.tw/#q=%E9%9D%92%E8%9B%99\">Google</a>";
    } else if(SpeciesID==3) {
      resultDiv.innerHTML = "<img style=\"width:100%;\" src=\"\" />距離："+A_i35_2[imgNum][5]+"公尺<br />生物名稱："+A_i35_2[imgNum][1]+"<br />科名："+A_i35_2[imgNum][2]+"<br />採集者："+A_i35_2[imgNum][3]+"<br />採集時間："+A_i35_2[imgNum][4]+"<br/>其他資訊：<a href=\"http://zh.wikipedia.org/wiki/%E8%9B%BE\">維基</a> <a href=\"https://www.google.com.tw/#q=%E8%9B%BE\">Google</a>";
    }
    setTimeout(function() {
      canDoing = true;
    }, 1000);
  }
  
}

function GetLocationAndSelect(theSpeciesID) {
  theLng = window.inwcall.GetLocationLng();
  theLat = window.inwcall.GetLocationLat();
  
  if(theLng==0 || theLat==0){ //如果沒有取得經緯度
    resultDiv.innerHTML='<font color="red">尚未取得經緯度，請等待。</font>';
  } else { //有取得經緯度
    mark(theLat,theLng);
    placeMarker(theLat,theLng);
    AjaxPost(theSpeciesID,theLat,theLng);
    SpeciesID = theSpeciesID;
  }
}

function ExitApp() {
  inwcall.ExitApp();
}