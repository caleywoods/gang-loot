// Redefine hideStrikethroughItems to implement the functionality we need.
/* Variables:
  characters = The array of objects containing characters and their wishlist

  all_wishlists = the property name of the array of objects that represents a
  raiders wishlist

  rosterTable = The jQuery datatable that renders the list of characters and
  their wishlist on the page
*/
let characterNameToDOMNodeMap = {};

function getCharacterName(element) {
    let characterNameArray = element.innerHTML.replace(/^\d* - /, '').split('\n');
    let spacePaddedCharacterName;
    let actualCharacterName;
    if (characterNameArray.length > 1) {
        spacePaddedCharacterName = characterNameArray[1].split(' ');
        actualCharacterName = spacePaddedCharacterName[spacePaddedCharacterName.length - 1];
    } else {
        spacePaddedCharacterName = characterNameArray[0];
        actualCharacterName = spacePaddedCharacterName;
    }
    actualCharacterName = actualCharacterName.toLowerCase();
    return actualCharacterName;
}

function capitalizeWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function buildCharacterNodeList() {
    // Nodelist, not an array but array-like, implements forEach which is all we need
    const characterNodes = document.querySelectorAll('#characterTable .dropdown-toggle');
    characterNodes.forEach(ele => {
        const charName = getCharacterName(ele);
        characterNameToDOMNodeMap[charName] = ele;
    });
}

function init() {
    const controlsContainer = document.createElement('div');
    const hideItemsFromSearchButton= document.createElement('button');
    const updateSKListPositionsButton = document.createElement('button');
    const searchBoxElement = document.getElementById('characterTable_filter');
    const buttonClasses = ['btn', 'btn-sm', 'btn-light'];

    // Add element IDs to our elements
    controlsContainer.id = 'gang-plugin-controls-container';
    hideItemsFromSearchButton.id = 'hide-received-from-search-btn';
    updateSKListPositionsButton.id = 'update-sk-list-positions-btn';

    // Apply standard button classes to our buttons to match their UI
    buttonClasses.forEach(klass => {
        hideItemsFromSearchButton.classList.add(klass);
        updateSKListPositionsButton.classList.add(klass);
    });

    // Add margin classes for some visual separation
    controlsContainer.classList.add('mb-2');
    hideItemsFromSearchButton.classList.add('mr-2');

    // Apply the text to our buttons
    hideItemsFromSearchButton.innerText = 'Hide Received Items From Search';
    updateSKListPositionsButton.innerHTML = 'Update SK List Positions';

    // Add the buttons to our container div
    controlsContainer.appendChild(hideItemsFromSearchButton);
    controlsContainer.appendChild(updateSKListPositionsButton);

    // Add our container div under the search box
    searchBoxElement.appendChild(controlsContainer);

    hideItemsFromSearchButton.addEventListener('click', (e) => {
        let ourCharacters = JSON.parse(JSON.stringify(window.characters));
        ourCharacters.map(char => {
            char.all_wishlists = char.all_wishlists.filter(item => {
                let item_has_not_been_received = !item.pivot.is_received;
                if (item_has_not_been_received) {
                    return item;
                }
            });
            return char;
        });
        rosterTable.clear().rows.add(ourCharacters).draw();
    });

    // TODO: Show a timestamp of the last time an update was made
    updateSKListPositionsButton.addEventListener('click', (e) => {
        console.log('fetching');
        fetch('https://docs.google.com/spreadsheets/d/15hwrsVr7HI-xi8774tT_4QaxXWJareG4oNCRMj19aQA/export?format=csv')
            .then(response => {
                return response.text();
            })
            .then(raiders => {
                raiders = raiders.split('\r\n').map(raider => {
                    return raider.split(' ')[0]
                });
                buildCharacterNodeList();
                // Spin through raidMembers, find DOM node, change innerHTML of DOM node to have the idx + 1 (their SK list pos)
                raiders.forEach((raider, pos) => {
                    raider = raider.toLowerCase();
                    const DOMNode = characterNameToDOMNodeMap[raider];
                    if (DOMNode) {
                        let actualCharacterName = getCharacterName(DOMNode);
                        actualCharacterName = (pos + 1).toString() + ' - ' + capitalizeWord(actualCharacterName);
                        DOMNode.innerHTML = actualCharacterName;
                    }
                });
            });

    });

}

init();