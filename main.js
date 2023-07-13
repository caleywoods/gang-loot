window.addEventListener('settings-update', evt => {
    window.settings = evt.detail;
}, false);

function quickSort(array) {

    if (array.length < 2) {
        return array;
    }

    const pivotIndex = array.length - 1;
    const pivot = array[pivotIndex];
    const left = [];
    const right = [];

    for (let i = 0; i < pivotIndex; i++) {
        const pivotVal = pivot.querySelector('span a span:first-child').innerText.split(' ')[0];
        const currentItem = array[i];
        const currentItemVal = currentItem.querySelector('span a span:first-child').innerText.split(' ')[0];
        +currentItemVal < +pivotVal
            ? left.push(currentItem)
            : right.push(currentItem)
    }

    const result = [
        ...quickSort(left),
        pivot,
        ...quickSort(right)
    ]

    return result

}

function init() {
    // Get initial plugin settings
    const evt = new CustomEvent('settings-request', { detail: { update: true } });
    window.dispatchEvent(evt);

    const controlsContainer = document.createElement('div');
    const updateSKListPositionsButton = document.createElement('button');
    const searchBoxElement = document.getElementById('itemTable_filter');

    // Add element IDs to our elements
    controlsContainer.id = 'gang-plugin-controls-container';
    updateSKListPositionsButton.id = 'update-sk-list-positions-btn';

    updateSKListPositionsButton.classList.add('btn', 'btn-sm', 'btn-light');
    updateSKListPositionsButton.style.cssText = 'position:fixed;top:50px;right:10px;z-index:999';

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
                    const emptyRow = raider === '' || raider === ',,';
                    if (emptyRow) return;
                    const raiderName = raider.replace(/\s*/g, '').replace(/\+\d*/, '').split(',')[0].toLowerCase();
                    return raiderName;
                });
                const allItemTableRaiderEntries = document.querySelectorAll('.js-item-wishlist-character');

                // // For every raider name in the wishlist column, replace the loot priority position with their SK list position
                allItemTableRaiderEntries.forEach(entry => {
                    let innerTextArr = entry.innerText.split(/\W+/);
                    let lootPrioNumber = innerTextArr[0];
                    // If the raider adds a note about a particular piece of loot, the word "note" appears next to their name and causes issues so we remove the word "note" from the end of the string
                    let raiderName = entry.innerText.replace(/^\d*/g, '').replace(/\d+(h|d)/, '').replace(/\s*/g, '').replace(/note$/g,'');
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

                // All rows where more than one raider has the item on their list
                const lootEntries = document.querySelectorAll('table tr:not(:first-child):has(td:nth-child(4) ul li:not(:only-child)');

                lootEntries.forEach(entry => {
                    const wishlistULElement = entry.querySelector('td:nth-child(4) ul');
                    const wishlistArray = wishlistULElement.querySelectorAll('li');
                    const skPositionSortedList = quickSort(wishlistArray);

                    // Clear the UL so we can insert our new list
                    while (wishlistULElement.firstChild) {
                        wishlistULElement.removeChild(wishlistULElement.firstChild);
                    }

                    skPositionSortedList.forEach(raiderElement => {
                        wishlistULElement.appendChild(raiderElement);
                    });
                });
            });
    });

}

init();