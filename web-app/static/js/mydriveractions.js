function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = jQuery.trim(cookies[i]);
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function search_available_rides() {
  // http request
  var csrftoken = getCookie('csrftoken');
  var xhttp = new XMLHttpRequest();
  xhttp.open('POST', '/rideapp/driver/search', true);
  xhttp.setRequestHeader("X-CSRFToken", csrftoken);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var that = this;
      layui.use('layer', function () {
        var layer = layui.layer;
        var obj = null;
        var resText = that.responseText;
        if (!resText) {
          obj = { "content": {} };
        } else {
          obj = JSON.parse(resText);
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
            hiscode += '<a onclick="confirm(' + id_num + ', layer)">confirm</a>';
            hiscode += '</td>';
            hiscode += '</tr>';
          }
          hiscode += lastcode + '</div>';
        }

        var index1 = layer.open({
          type: 1
          , title: 'Available Rides'
          , btn: ['Close']
          , btn1: function () {
            layer.closeAll();
          }
          , area: ['820px', '500px']
          , id: 'layerDemo1' 
          , content: hiscode
          , btnAlign: 'c' 
          , shade: 0.8 
        });
      });
    }
  };
}

function editInfo() {
  var csrftoken = getCookie('csrftoken');
  var xhttp = new XMLHttpRequest();
  var api = '/rideapp/driver/info';
  xhttp.open('POST', api, true);
  xhttp.setRequestHeader("X-CSRFToken", csrftoken);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var obj = JSON.parse(this.responseText);
      var driver_id = obj['driver_id'];
      var name = obj['name'];
      var vehicle_type = obj['vehicle_type'];
      var plate_num = obj['plate_num'];
      var max_capacity = obj['max_capacity'];
      var other_info = obj['other_info'];
      var htmlcode = '<div class="info-container">' +
        '<div class="display-section"><p>Driver ID</p><p>' + driver_id + '</p></div>' +
        '<div class="display-section"><p>Name</p><p>' + name + '</p></div>' +
        '<div class="display-section"><p>Vehicle Type</p><p>' + vehicle_type + '</p></div>' +
        '<div class="display-section"><p>Plate Number</p><p>' + plate_num + '</p></div>' +
        '<div class="display-section"><p>Maximum Capacity</p><p>' + max_capacity + '</p></div>' +
        '<div class="display-section"><p>Other Information</p><p>' + other_info + '</p></div>' +
        '</div>'

      layui.use('layer', function () {
        var layer = layui.layer;

        var index = layer.open({
          type: 1
          , title: 'My Information'
          , btn: ['Edit', 'Close']
          , btn1: function () {
            var editcode = '<form action="" method="post" id="editInfo">' +
              '<div class="show-container">' +
              '<div class="info-section"><p class="req-title">Name</p><input type="text" name="name" id="name" value=\'' + name + '\'/></div>' +
              '<div class="info-section"><p class="req-title">Vehicle Type</p><input type="text" name="vehicle" id="vehicle" value= \'' + vehicle_type + '\' /></div>' +
              '<div class="info-section"><p class="req-title">Vehicle Plate Number</p><input type="text" name="platenum" id="platenum"  value= \'' + plate_num + '\'/></div>' +
              '<div class="info-section num-pass"><p class="req-title">Maximum capacity</p><select name="num" id="numpeople"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option></select></div>' +
              '</div>';

            var index = layer.open({
              type: 1
              , title: 'Edit My Information'
              , btn: ['OK', 'Close']
              , btn1: function () {
                var name = document.getElementById("name");
                var vehicle = document.getElementById("vehicle");
                var platenum = document.getElementById("platenum");
                var numpeople = document.getElementById("numpeople");

                var xhttp1 = new XMLHttpRequest();
                var api = '/rideapp/driver/edit';
                xhttp1.open('POST', api, true);
                xhttp1.setRequestHeader("X-CSRFToken", csrftoken);
                xhttp1.setRequestHeader('Content-Type', 'application/json');
                xhttp1.send(JSON.stringify({
                  'name': name.value,
                  'vehicle': vehicle.value,
                  'plate_num': platenum.value,
                  'num_people': numpeople.value,
                }));
                xhttp1.onreadystatechange = function () {
                  if (this.readyState == 4 && this.status == 200) {
                    alert('Edit successfully');
                    layer.closeAll();
                  }
                };
              }
              , btn2: function () {
                layer.close(index);
              }
              , area: ['325px', '500px']
              , id: 'layerDemo1' 
              , content: editcode
              , btnAlign: 'c' 
              , shade: 0.8 
            });
          }
          , btn2: function () {
            layer.closeAll();
          }
          , area: ['325px', '300px']
          , id: 'layerDemo' 
          , content: htmlcode
          , btnAlign: 'c' 
          , shade: 0.8 
        });
      });
    }
  }
}

function showStatus() {
  var csrftoken = getCookie('csrftoken');
  var xhttp = new XMLHttpRequest();
  xhttp.open('POST', '/rideapp/driver/history', true);
  xhttp.setRequestHeader("X-CSRFToken", csrftoken);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // history
      var obj = JSON.parse(this.responseText);
      var prevres = obj["history"];
      var lenObj = Object.keys(prevres).length;
      var hiscode = '<p class="his-title">Completed Rides</p>';
      var lastcode = '</table>';
      if (lenObj == 0) {
        hiscode += '<p>No completed Rides</p>'
      } else {
        hiscode += '<div class="frame"><table><tr><th>Order ID</th><th>Owner ID</th><th>Driver ID</th><th>Destination</th><th>Arrival Date Time</th><th>Passenger Number</th><th>Vehicle Type</th><th>Other Requirement</th><th>Status</th><th>Can be Shared</th><th>Created Time</th><th>Updated Time</th></tr>';
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
      hiscode += '<p class="his-title">Confirmed Rides</p>'
      var futureres = obj["future"];
      lenObj = Object.keys(futureres).length;
      if (lenObj == 0) {
        hiscode += '<p>No rides in progress</p>'
      } else {
        hiscode += '<div class="frame"><table><tr><th>Order ID</th><th>Owner ID</th><th>Driver ID</th><th>Destination</th><th>Arrival Date Time</th><th>Passenger Number</th><th>Vehicle Type</th><th>Other Requirement</th><th>Status</th><th>Can be Shared</th><th>Created Time</th><th>Updated Time</th></tr>';
        var futureres = obj["future"];
        for (var element of futureres) {
          hiscode += '<tr>';
          var id_num = element['order_id'];
          for (var attr in element) {
            hiscode += '<td>';
            hiscode += element[attr];
            hiscode += '</td>';
          }
          hiscode += '<td>';
          hiscode += '<a onclick="complete(' + id_num + ', layer,)">Complete</a>';
          hiscode += '</td>';
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
          , area: ['910px', '500px']
          , id: 'layerDemo1' 
          , content: hiscode
          , btnAlign: 'c' 
          , shade: 0.8 
        });
      });
    }
  };
}

function confirm(id, layer) {
  var csrftoken = getCookie('csrftoken');
  var xhttp = new XMLHttpRequest();
  var api = '/rideapp/driver/confirm';
  xhttp.open('POST', api, true);
  xhttp.setRequestHeader("X-CSRFToken", csrftoken);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send(JSON.stringify({
    order_id: id
  }));
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      alert("Confirm successfully");
      layer.closeAll();
    }
  }
}

function complete(order_id, layer) {
  layer.confirm('Are you sure to complete this order?', {
    btn: ['Yes', 'No']
  }, function () {
    var csrftoken = getCookie('csrftoken');
    var xhttp = new XMLHttpRequest();
    var api = '/rideapp/driver/complete';
    xhttp.open('POST', api, true);
    xhttp.setRequestHeader("X-CSRFToken", csrftoken);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify({
      'order_id': order_id,
    }));
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        alert("Complete successfully");
        layer.closeAll();
      }
    }
  }, function () {
  });
}