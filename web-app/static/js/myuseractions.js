function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = jQuery.trim(cookies[i]);
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function difPage() {
  var index = parent.layer.getFrameIndex(window.name);
  parent.layer.close(index);
}

function showStatus() {
  // http request
  var csrftoken = getCookie('csrftoken');
  var xhttp = new XMLHttpRequest();
  xhttp.open('POST', '/rideapp/user/history', true);
  xhttp.setRequestHeader("X-CSRFToken", csrftoken);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // history
      var obj = null;
      if (!this.responseText) {
        obj = { "history": {}, "future": {} };
      } else {
        obj = JSON.parse(this.responseText);
      }
      var prevres = obj["history"];
      var lenObj = Object.keys(prevres).length;
      var hiscode = '<p class="his-title">Rides history</p>';
      var lastcode = '</table>';
      if (lenObj == 0) {
        hiscode += '<p>No rides history</p>'
      } else {
        hiscode += '<div class="frame"><table><tr><th>Order ID</th><th>Owner ID</th><th>Driver ID</th><th>Destination</th><th>Arrival Date Time</th><th>Passenger Number</th><th>Vehicle Type</th><th>Other Requirement</th><th>Status</th><th>Can be Shared</th><th>Created Time</th><th>Updated Time</th><th>Identity</th></tr>';
        for (var element of prevres) {
          hiscode += '<tr>';
          for (var attr in element) {
            hiscode += '<td>';
            hiscode += element[attr];
            hiscode += '</td>';
          }
          hiscode += '</tr>';
        }
        hiscode += lastcode + '</div>';
      }

      // Future
      hiscode += '<p class="his-title">Future Rides</p>'
      var futureres = obj["future"];
      lenObj = Object.keys(futureres).length;
      if (lenObj == 0) {
        hiscode += '<p>No rides in progress</p>'
      } else {
        hiscode += '<div class="frame"><table><tr><th>Order ID</th><th>Owner ID</th><th>Driver ID</th><th>Destination</th><th>Arrival Date Time</th><th>Passenger Number</th><th>Vehicle Type</th><th>Other Requirement</th><th>Status</th><th>Can be Shared</th><th>Created Time</th><th>Updated Time</th><th>Identity</th></tr>';
        var futureres = obj["future"];
        for (var element of futureres) {
          hiscode += '<tr>';
          var order_id = element['order_id'];
          var destination_info = element['destination'];
          var arrival_time = element['arr_date_time'];
          var vehicle_info = element['vehicle_type'];
          for (var attr in element) {
            hiscode += '<td>';
            hiscode += element[attr];
            hiscode += '</td>';
          }
          if (element['status'] == 'OPEN') {
            hiscode += '<td>';
            if (element['role'] == 'owner') {
              hiscode += '<a onclick="edit(' + order_id + ', layer, \'' + destination_info + '\', \'' + arrival_time + '\', \'' + vehicle_info + '\')">Edit</a>';
            } else {
              hiscode += '<a onclick="edit_passenger(' + order_id + ', layer)">Edit</a>';
            }
            hiscode += '</td>';
            hiscode += '<td>';
            hiscode += '<a onclick="cancel(' + order_id + ', layer,)">Cancel</a>';
            hiscode += '</td>';
          }
          hiscode += '</tr>';
        }
        hiscode += lastcode + '</div>';
      }

      layui.use('layer', function () {
        var layer = layui.layer;
        var index1 = layer.open({
          type: 1
          , title: 'My Rides'
          , btn: ['Close']
          , btn1: function () {
            layer.closeAll();
          }
          , area: ['900px', '700px']
          , id: 'layerDemo1'
          , content: hiscode
          , btnAlign: 'c'
          , shade: 0.8
        });
      });
    }
  };
}

function getCurrentDate() {
  var date = new Date();
  var month = zeroFill(date.getMonth() + 1);
  var day = zeroFill(date.getDate());
  var curTime = date.getFullYear() + "-" + month + "-" + day;
  return curTime;
}

function getCurrentTime() {
  var date = new Date();
  var hour = zeroFill(date.getHours());
  var minute = zeroFill(date.getMinutes());
  var curTime = hour + ":" + minute;
  return curTime;
}

function zeroFill(i) {
  if (i >= 0 && i <= 9) {
    return "0" + i;
  } else {
    return i;
  }
}

function requestRide() {
  var cur_date = getCurrentDate();
  var cur_time = getCurrentTime();
  var htmlcode = '<form action="" method="post" id="rideSelect">' +
    '<div class="show-container">' +
    '<div class="info-section"><p class="req-title">Destination:</p><input type="text" name="enddes" id="destination" /></div>' +
    '<div class="info-section"><p class="req-title">Arrival Time</p><div class="time-section"><input type="date" id="startDate" class="start" name="trip-start" value="' + cur_date + '" min="' + cur_date + '" max="2023-01-25" onclick="disableStart()"><input id="startTime" class="start" type="time" value="' + cur_time + '"></div></div>' +
    '<div class="info-section num-pass"><p class="req-title">Number of Passengers</p><select name="num" id="numpeople"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option></select></div>' +
    '<div class="info-section"><p class="req-title">Vehicle Type</p><input type="text" name="vehicle" id="vehicle" /></div>' +
    '<div class="info-section"><p class="req-title">Sharable</p><input type="checkbox" name="share" id="share" /></div>' +
    '</div>';

  layui.use('layer', function () {
    var layer = layui.layer;

    var index = layer.open({
      type: 1
      , title: 'Request a Ride'
      , btn: ['OK', 'Close']
      , btn1: function () {
        var csrftoken = getCookie('csrftoken');
        // 如果为空 不发送
        var destination = document.getElementById("destination");
        var startDate = document.getElementById("startDate");
        var startTime = document.getElementById("startTime");
        var numpeople = document.getElementById("numpeople");
        var vehicle = document.getElementById("vehicle");
        var share = document.getElementById("share");

        var csrftoken = getCookie('csrftoken');
        var xhttp = new XMLHttpRequest();
        xhttp.open('POST', '/rideapp/user/request', true);
        xhttp.setRequestHeader("X-CSRFToken", csrftoken);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify({
          'destination': destination.value,
          'arrival_date': startDate.value,
          'arrival_time': startTime.value,
          'num_people': numpeople.value,
          'vehicle': vehicle.value,
          'share': share.checked
        }));
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            alert('Request successfully');
            layer.closeAll();
          }
        };
      }
      , btn2: function () {
        layer.closeAll();
      }
      , area: ['325px', '500px']
      , id: 'layerDemo'
      , content: htmlcode
      , btnAlign: 'c'
      , shade: 0.8
    });
  });

}

function shareRide() {
  var cur_date = getCurrentDate();
  var cur_time = getCurrentTime();
  var htmlcode = '<form action="" method="post" id="rideSelect">' +
    '<div class="show-container">' +
    '<div class="info-section"><p class="req-title">Destination:</p><input type="text" name="enddes" id="destination" /></div>' +
    '<div class="info-section"><p class="req-title">Earliest Arrival Time</p><div class="time-section"><input type="date" id="startDate" class="start" name="trip-start" value="' + cur_date + '" min="' + cur_date + '" max="2023-01-25" onclick="disableStart()"><input id="startTime" class="start" type="time" value="' + cur_time + '"></div></div>' +
    '<div class="info-section"><p class="req-title">Latest Arrival Time</p><div class="time-section"><input type="date" id="endDate" class="end" name="trip-end" value="' + cur_date + '" min="' + cur_date + '" max="2023-01-25" onclick="disableEnd()"><input id="endTime" class="end" type="time" value="' + cur_time + '"></div></div>' +
    '<div class="info-section num-pass"><p class="req-title">Number of Passengers</p><select name="num" id="numpeople"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option></select></div>' +
    '<div class="info-section"><p class="req-title">Vehicle Type</p><input type="text" name="vehicle" id="vehicle" /></div>' +
    '</div>';
  var res = [
    { "id": "1", "arr_date": '2021-1-10', "arr_time": '15:20' },
    { "id": "5", "arr_date": '2021-1-10', "arr_time": '16:20' },
    { "id": "9", "arr_date": '2021-1-10', "arr_time": '17:20' }
  ];
  var searchcode = '<table><tr><th>Ride id</th><th>Arrival Date</th><th>Arrival Time</th></tr>';
  var lastcode = '</table>';
  for (var element of res) {
    searchcode += '<tr>';
    for (var attr in element) {
      searchcode += '<td>';
      searchcode += element[attr];
      searchcode += '</td>';
    }
    searchcode += '</tr>';
  }
  searchcode += lastcode;
  layui.use('layer', function () {
    var layer = layui.layer;

    var index = layer.open({
      type: 1
      , title: 'Share a Ride'
      , btn: ['OK', 'Close']
      , btn1: function () {
        var destination = document.getElementById("destination");
        var startDate = document.getElementById("startDate");
        var startTime = document.getElementById("startTime");
        var endDate = document.getElementById("endDate");
        var endTime = document.getElementById("endTime");
        var numpeople = document.getElementById("numpeople");
        var vehicle = document.getElementById("vehicle");

        var csrftoken = getCookie('csrftoken');
        var xhttp = new XMLHttpRequest();
        var api = '/rideapp/user/share';
        xhttp.open('POST', api, true);
        xhttp.setRequestHeader("X-CSRFToken", csrftoken);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify({
          'destination': destination.value,
          'earliest_date': startDate.value,
          'earliest_time': startTime.value,
          'latest_date': endDate.value,
          'latest_time': endTime.value,
          'num_people': numpeople.value,
          'vehicle': vehicle.value,
        }));
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            var obj = null;
            if (this.responseText == null) {
              obj = { "content": {} };
            } else {
              obj = JSON.parse(this.responseText);
            }
            var prevres = obj["content"];
            var lenObj = Object.keys(prevres).length;
            var hiscode = '';
            if (lenObj == 0) {
              hiscode += '<p>No available rides</p>'
            } else {
              hiscode += '<div class="frame"><table><tr><th>Order ID</th><th>Owner ID</th><th>Driver ID</th><th>Destination</th><th>Arrival Date Time</th><th>Passenger Number</th><th>Vehicle Type</th><th>Other Requirement</th><th>Status</th><th>Can be Shared</th><th>Created Time</th><th>Updated Time</th></tr>';
              var lastcode = '</table>';
              for (var element of prevres) {
                hiscode += '<tr>';
                var id_num = element['order_id'];
                for (var attr in element) {
                  hiscode += '<td>';
                  hiscode += element[attr];
                  hiscode += '</td>';
                }
                hiscode += '<td>';
                hiscode += '<a onclick="join(' + id_num + ', layer, numpeople.value)">join</a>';
                hiscode += '</td>';
                hiscode += '</tr>';
              }
              hiscode += lastcode + '</div>';
            }
            var index1 = layer.open({
              type: 1
              , title: 'Available Rides to Join'
              , btn: ['Close']
              , btn1: function () {
                layer.closeAll();
              }
              , area: ['820px', '600px']
              , id: 'layerDemo1'
              , content: hiscode
              , btnAlign: 'c'
              , shade: 0.8
            });
          }
        };
      }
      , btn2: function () {
        layer.closeAll();
      }
      , area: ['325px', '500px']
      , id: 'layerDemo'
      , content: htmlcode
      , btnAlign: 'c'
      , shade: 0.8
    });
  });
}

function join(id, layer, numpeople) {
  var csrftoken = getCookie('csrftoken');
  var xhttp = new XMLHttpRequest();
  var api = '/rideapp/user/join';
  xhttp.open('POST', api, true);
  xhttp.setRequestHeader("X-CSRFToken", csrftoken);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send(JSON.stringify({
    order_id: id,
    number_of_sharers: numpeople
  }));
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var obj = JSON.parse(this.responseText);
      if (obj["status"] === "Success") {
        alert("Joined successfully");
      } else {
        alert("Data outdated. Redirecting to previous page...");
      }
      layer.closeAll();
    }
  }
}

function edit(order_id, layer, destination_info, arrival_time, vehicle_info) {
  var layer = layui.layer;
  var date = arrival_time.substring(0, 10);
  var time = arrival_time.substring(11, 16);
  var editcode = '<form action="" method="post" id="editInfo">' +
    '<div class="show-container">' +
    '<div class="info-section"><p class="req-title">Destination</p><input type="text" name="destination" id="destination" value="' + destination_info + '"/></div>' +
    '<div class="info-section"><p class="req-title">Arrival Time</p><div class="time-section1"><input type="date" id="startDate" class="start" name="trip-start" value="' + date + '" min="2022-01-25" max="2023-01-25" onclick="disableStart()"><input id="startTime" class="start" type="time" value="' + time + '"></div></div>' +
    '<div class="info-section num-pass"><p class="req-title">Number of Passengers</p><select name="num" id="numpeople" ><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option></select></div>' +
    '<div class="info-section"><p class="req-title">Vehicle Type</p><input type="text" name="vehicle" id="vehicle"  value="' + vehicle_info + '"/></div>' +
    '</div>';
  var index1 = layer.open({
    type: 1
    , title: 'Edit Rides Information'
    , btn: ['OK', 'Close']
    , btn1: function () {
      var destination = document.getElementById("destination");
      var startDate = document.getElementById("startDate");
      var startTime = document.getElementById("startTime");
      var numpeople = document.getElementById("numpeople");
      var vehicle = document.getElementById("vehicle");
      var csrftoken = getCookie('csrftoken');
      var xhttp = new XMLHttpRequest();
      var api = '/rideapp/user/edit';
      xhttp.open('POST', api, true);
      xhttp.setRequestHeader("X-CSRFToken", csrftoken);
      xhttp.setRequestHeader('Content-Type', 'application/json');
      xhttp.send(JSON.stringify({
        'order_id': order_id,
        'destination': destination.value,
        'arrival_date': startDate.value,
        'arrival_time': startTime.value,
        'num_people': numpeople.value,
        'vehicle': vehicle.value,
      }));
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          var obj = JSON.parse(this.responseText);
          if (obj['status'] == 'Success') {
            alert('Edit Successfully');
            layer.closeAll();
          } else {
            alert(obj['error_msg']);
            layer.close(index1);
          }
        }
      }
    }
    , btn2: function () {
      layer.close(index1);
    }
    , area: ['500px', '500px']
    , id: 'layerDemo5'
    , content: editcode
    , btnAlign: 'c'
    , shade: 0.8
  });
}

function edit_passenger(order_id, layer) {
  var editcode = '<form action="" method="post" id="editInfo">' +
    '<div class="show-container">' +
    '<div class="info-section num-pass"><p class="req-title">Number of Passengers</p><select name="num" id="numpeople" ><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option></select></div>' +
    '</div>';
  var index1 = layer.open({
    type: 1
    , title: 'Edit Passenger Number'
    , btn: ['OK', 'Close']
    , btn1: function () {
      var numpeople = document.getElementById("numpeople");
      var csrftoken = getCookie('csrftoken');
      var xhttp = new XMLHttpRequest();
      var api = '/rideapp/user/edit';
      xhttp.open('POST', api, true);
      xhttp.setRequestHeader("X-CSRFToken", csrftoken);
      xhttp.setRequestHeader('Content-Type', 'application/json');
      xhttp.send(JSON.stringify({
        'order_id': order_id,
        'num_people': numpeople.value,
      }));
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          var obj = JSON.parse(this.responseText);
          if (obj['status'] == 'Success') {
            alert('Edit Successfully');
            layer.closeAll();
          } else {
            alert(obj['error_msg']);
            layer.close(index1);
          }
        }
      }
    }
    , btn2: function () {
      layer.close(index1);
    }
    , area: ['500px', '500px']
    , id: 'layerDemo5'
    , content: editcode
    , btnAlign: 'c'
    , shade: 0.8
  });
}

function cancel(order_id, layer) {
  layer.confirm('Are you sure to cancel this order?', {
    btn: ['Yes', 'No']
  }, function () {
    var csrftoken = getCookie('csrftoken');
    var xhttp = new XMLHttpRequest();
    var api = '/rideapp/user/cancel';
    xhttp.open('POST', api, true);
    xhttp.setRequestHeader("X-CSRFToken", csrftoken);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify({
      'order_id': order_id,
    }));
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        alert("Cancel successfully");
        layer.closeAll();
      }
    }
  }, function () {
  });
}

function disableStart() {
  var inputdate = document.getElementById("startDate");
  inputdate.onkeydown = function (e) {
    return false;
  }
}

function disableEnd() {
  var inputdate = document.getElementById("endDate");
  inputdate.onkeydown = function (e) {
    return false;
  }
}