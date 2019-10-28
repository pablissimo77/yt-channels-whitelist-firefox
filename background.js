var storage = chrome.storage.sync;

chrome.runtime.onInstalled.addListener(function () {
    console.log('onInstalled');
    wlist = [{
            id: 'UCHS2LM1n3f5cyL-ebgkqyLw',
            name: 'Союзмультфильм'
        },
        {
            id: 'UCCdRHbJEGEppCJ-pL7qMl1g',
            name: 'Уроки Тётушки Совы'
        }
    ]
    storage.set({
        'active': true
    });
    storage.set({
        'wlist': wlist
    });
    storage.set({
        'password': '1'
    });

});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    // 
    if (tabInfo.url.includes('https://www.youtube.com/channel/') && changeInfo.hasOwnProperty('title')) {
        chrome.tabs.sendMessage(tabId, {
            type: "channel-update",
            id: tabInfo.url.replace('https://www.youtube.com/channel/', ''),
            name: tabInfo.title.substring(0, tabInfo.title.indexOf(" - YouTube")),
            source: "tabs.onUpdated"
        });
    }

    // check when video is playing
    if (
        changeInfo.hasOwnProperty('audible') &&
        changeInfo.audible &&
        tabInfo.url.includes('https://www.youtube.com/')
    ) {
        chrome.tabs.sendMessage(tabId, {
            type: "hide-video"
        });
    }
});

