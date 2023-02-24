// Saves options to chrome.storage
function save_options() {
    const spreadsheetURL = document.getElementById('spreadsheet-url').value;
    const textSize = document.getElementById('font-size-select').value;
    const textColor = document.getElementById('font-color-select').value;
    const prefsObject = {
        url: spreadsheetURL,
        textsize: textSize,
        textcolor: textColor
    };
    chrome.storage.sync.set(prefsObject, function () {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 1200);
    });
}

// Restores select box and checkbox state using the preferences
function restore_options() {
    chrome.storage.sync.get([
        'url',
        'textsize',
        'textcolor'
    ], function (items) {
        if (!items) {
            chrome.storage.sync.set({
                url: '',
                textsize: 'text-4',
                textcolor: 'text-horde'
            });
        }
        document.getElementById('spreadsheet-url').value = items.url;
        document.getElementById('font-size-select').value = items.textsize;
        document.getElementById('font-color-select').value = items.textcolor;
    });
}

document.addEventListener('DOMContentLoaded', _ => {
    document.getElementById('save').addEventListener('click', save_options);
    restore_options();
});