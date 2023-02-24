const s = document.createElement('script');
s.setAttribute('src', 'chrome-extension://ggbjpkibpljjlhekdoljnlhmedpfpfpm/main.js');
s.async = false;
document.documentElement.appendChild(s);

window.addEventListener('settings-request', evt => {
    chrome.storage.sync.get([
        'url',
        'textsize',
        'textcolor'
    ], function (items) {
        const evt = new CustomEvent('settings-update', { detail: items });
        window.dispatchEvent(evt);
    });
}, false);
