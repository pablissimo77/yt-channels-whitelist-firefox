var storage = chrome.storage.sync;
// var storage = chrome.storage.local;

var element_security = document.getElementById('security');
var element_password = document.getElementById('password');

var element_notchannel = document.getElementById('notchannel');

var element_channel = document.getElementById('channel');
var element_active = document.getElementById('active');
var element_channel_name = document.getElementById('channel_name');
var element_channel_id = document.getElementById('channel_id');
var element_in_wlist = document.getElementById('in_wlist');

element_channel.style.display = "none";
element_security.style.display = "none";


var wlist = [];
var password_in_storage = null;
var extension_is_active = false;

storage.get(['password', 'active', 'wlist'], function (result) {
  wlist = result.wlist;
  password_in_storage = result.password;
  extension_is_active = result.active;
});



function in_whitelist(id) {
  if (!id) {
    return true;
  } else {
    var result = false;
    wlist.forEach(element => {
      if (element.id == id) {
        result = true;
      };
    });
    return result;
  }
};


chrome.tabs.query({
  active: true,
  currentWindow: true
}, function (tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {
    type: ["channel"]
  }, function (response) {
    console.debug('CHANNEL', response)
    if (response) {
      element_security.style.display = "";
      element_password.focus();
      // storage.get(['password', 'active', 'wlist'], function (result) {
        // wlist = result.wlist;
        // password_in_storage = result.password;
        // element_active.checked = result.active;
        element_active.checked = extension_is_active;
        if (response.id) {
          element_notchannel.style.display = "none";
          element_channel_name.textContent = response.name;
          element_channel_id.textContent = response.id;
          element_in_wlist.checked = in_whitelist(response.id);
        }
      // });

    }
  });
});

function wlist_append(item) {
  wlist.push(item);
  storage.set({
    wlist: wlist
  });
}


function wlist_remove(item) {
  var new_wlist = []
  for (idx in wlist) {
    if (item['id'] != wlist[idx]['id']) {
      new_wlist.push(wlist[idx])
    }

  }
  wlist = new_wlist;
  storage.set({
    wlist: wlist
  });
}


element_in_wlist.addEventListener('change', function () {

  if (this.checked) {

    wlist_append({
      'id': element_channel_id.textContent,
      'name': element_channel_name.textContent
    });

  } else {

    wlist_remove({
      'id': element_channel_id.textContent,
      'name': element_channel_name.textContent
    })

  }

  // send message to content.js
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "changes"
    }, function (response) {
      console.log('element_in_wlist() send changes, resived: ', response);
    });
  });


});


element_password.addEventListener('input', function (event) {
  console.debug('element_password', password_in_storage)
  if (element_password.value == password_in_storage) {
    element_channel.style.display = "";
    element_security.style.display = "none";
  }
});


element_active.addEventListener('change', function () {
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
      console.log('Extension "active" send changes, resived: ', response);
    });
  });


});