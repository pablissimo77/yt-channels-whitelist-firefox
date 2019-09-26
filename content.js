var storage = chrome.storage.sync;

var wlist = [];
var extension_is_active = false;

var CHANNEL = {
    'type': 'channel',
    'name': '',
    'id': null,
    'source': ''
};

function worker(source) {

    console.log('YTWL worker start. source: ', source, CHANNEL)

    storage.get(['wlist', 'active'], function (result) {

        wlist = result.wlist;
        extension_is_active = result.active;

        HideVideo();
    });
}


function HideVideo() {
    var player = document.querySelector(".html5-video-player");
    // console.debug('HideVideo', player)
    if (player) {

        player.style.display = "";

        if (extension_is_active && !in_whitelist(CHANNEL['id'], wlist)) {
            // hide
            player.style.display = "none";


            var video = document.querySelector('.video-stream.html5-main-video');

            //mute video
            try {
                video.muted = true;
            } catch (e) {
                console.log('HideVideo video mute', e)
            }
            //pause video
            try {
                video.pause();
            } catch (e) {
                console.log('HideVideo video pause', e)
            }
            //pause player
            try {
                player.pauseVideo();
            } catch (e) {
                console.log('HideVideo player pause', e)
            }
            //mute player
            try {
                player.mute();
            } catch (e) {
                console.log('HideVideo player mute', e)
            }




        }
    }
};


function update_channel(varNode) {

    // console.debug('update_channel start', varNode)

    CHANNEL = {
        'type': 'channel',
        'name': '',
        'id': null,
        'source': ''
    };
    if (varNode && varNode.getAttribute('href')) {
        CHANNEL['name'] = varNode.innerText;
        CHANNEL['id'] = varNode.getAttribute('href').replace('/channel/', '')
        CHANNEL['source'] = 'targetNode'
    }
    // else {

    //     update_channel_from_channel_page()

    // }
}

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length) {
            if (mutation.type == 'childList') {

                update_channel(mutation.target);
                worker('observer');

            }
        }
    })
})


function checkNode() {

    // var xpath_string = '//div[@id="upload-info"]//yt-formatted-string/a|//div[@id="channel-header"]//yt-formatted-string[@class="style-scope ytd-channel-name"]'
    // var xpath_string = '//div[@id="meta"]|//div[@id="metadata-container"]'
    // var xpath_string = '//div[@id="continuations"]|//yt-formatted-string[@class="style-scope ytd-channel-name"]/a[@class="yt-simple-endpoint style-scope yt-formatted-string"]'
    var xpath_string = '//yt-formatted-string[@class="style-scope ytd-channel-name"]/a[@class="yt-simple-endpoint style-scope yt-formatted-string"]'
    var targetNode = document.evaluate(xpath_string, document, null, XPathResult.ANY_TYPE, null).iterateNext();

    // var targetNode = document.querySelector("yt-formatted-string.style-scope.ytd-channel-name > a.yt-simple-endpoint.style-scope.yt-formatted-string");


    if (!targetNode) {
        window.setTimeout(checkNode, 500);
        return;
    }

    update_channel(targetNode);
    worker('checkNode');

    var config = {
        childList: true,
        subtree: true
    }

    observer.observe(targetNode, config)
}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    // console.debug('message', request, sender);

    if (request.type == 'channel') {

        // console.debug('message channel', CHANNEL);
        sendResponse(CHANNEL);

    } else if (request.type == 'changes') {

        worker('changes');
        sendResponse({
            'type': 'changes apply'
        });

    } else if (request.type == 'hide-video') {

        worker('tabs.updated');

    } else if (request.type == 'channel-update') {

        CHANNEL['id'] = request.id;
        CHANNEL['name'] = request.name
        CHANNEL['source'] = request.source

    } else {

        sendResponse({
            'type': null
        });

    }

    return true;

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

checkNode();