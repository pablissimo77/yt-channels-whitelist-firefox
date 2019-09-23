var storage = chrome.storage.sync;
// var storage = chrome.storage.local;

var password = document.getElementById('password');
var submitButton = document.getElementById('save');
var ext_active = document.getElementById('ext_active')
var checkbox_label = document.getElementById('checkbox_label')
var textarea_wlist = document.getElementById('wlist')

loadOptions();

ext_active.addEventListener('change', function () {
  if (this.checked) {
    checkbox_label.textContent = "ON";
    storage.set({
      'active': true
    });

  } else {
    checkbox_label.textContent = "OFF";
    storage.set({
      'active': false
    });
  }

  // send message to content.js
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "changes"
    }, function (response) {
      console.log('resived: ', response);
    });
  });
});

submitButton.addEventListener('click', saveOptions);

function saveOptions() {
  wlist
  var lines = textarea_wlist.value.split('\n');
  var wlist = [];
  for (idx in lines) {
    var line = lines[idx]
    if (line.includes("|")) {
      record = line.split('|');
      wlist.push({
        'id': record[0],
        'name': record[1]
      });
    }
  }

  storage.set({
    'wlist': wlist
  });

  // active
  storage.set({
    'active': ext_active.checked
  });

  // password
  storage.set({
    'password': password.value
  });

}

function loadOptions() {
  storage.get('active', function (item) {
    ext_active.checked = item.active;
  });

  storage.get('password', function (item) {
    password.value = item.password;
  });

  storage.get('wlist', function (result) {
    textarea_wlist.value = ''
    if (result.wlist) {
      var idx;
      for (idx in result.wlist) {
        textarea_wlist.value += result.wlist[idx]['id'] + '|' + result.wlist[idx]['name'] + '\n';
      }
    }
  });
}