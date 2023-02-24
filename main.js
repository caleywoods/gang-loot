window.addEventListener('settings-update', evt => {
    window.settings = evt.detail;
}, false);

function init() {
    // Get initial plugin settings
    const evt = new CustomEvent('settings-request', { detail: {update: true} });
    window.dispatchEvent(evt);

    const controlsContainer = document.createElement('div');
    const updateSKListPositionsButton = document.createElement('button');
    const searchBoxElement = document.getElementById('itemTable_filter');

    // Add element IDs to our elements
    controlsContainer.id = 'gang-plugin-controls-container';
    updateSKListPositionsButton.id = 'update-sk-list-positions-btn';

    updateSKListPositionsButton.classList.add('btn', 'btn-sm', 'btn-light');

    // Add margin classes for some visual separation
    controlsContainer.classList.add('mb-2');

    // Apply the text to our buttons
    updateSKListPositionsButton.innerHTML = 'Update SK List Positions';

    // Add the buttons to our container div
    controlsContainer.appendChild(updateSKListPositionsButton);

    // Add our container div under the search box
    searchBoxElement.appendChild(controlsContainer);

    // TODO: Show a timestamp of the last time an update was made
    updateSKListPositionsButton.addEventListener('click', (e) => {
        const evt = new CustomEvent('settings-request', { detail: { update: true } });
        window.dispatchEvent(evt);
        fetch(window.settings.url)
            .then(response => {
                return response.text();
            })
            .then(raiders => {
                raiders = raiders.split('\r\n').map(raider => {
                    if (raider === '') return;
                    const raiderName = raider.replace(/\s*/g, '').replace(/\+\d*/,'').toLowerCase();
                    return raiderName;
                });
                const allItemTableRaiderEntries = document.querySelectorAll('.js-item-wishlist-character');

                // // For every raider name in the wishlist column, replace the loot priority position with their SK list position
                allItemTableRaiderEntries.forEach(entry => {
                    let innerTextArr = entry.innerText.split(/\W+/);
                    let lootPrioNumber = innerTextArr[0];
                    let raiderName = entry.innerText.replace(/^\d*/g,'').replace(/\d+(h|d)/,'').replace(/\s*/g,'');
                    raiderName = raiderName.toLowerCase();
                    lootPrioNumber = raiders.indexOf(raiderName) + 1;

                    // Nobody is zero, must mean their entry wasn't found in the raider list. Give them a ?
                    if (lootPrioNumber == 0) {
                        lootPrioNumber = '??';
                    }
                    // The first span element under the anchor is the loot priority number, adjust it to be our SK list pos
                    const lootPrioElement = entry.querySelector('a span');
                    lootPrioElement.innerHTML = lootPrioNumber;
                    lootPrioElement.classList = [];
                    if (window.settings) {
                        lootPrioElement.classList.add(window.settings.textsize, window.settings.textcolor);
                    } else {
                        lootPrioElement.classList.add('text-4', 'text-gold');
                    }
                });
            });
    });

}

init();