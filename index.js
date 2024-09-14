document.addEventListener('DOMContentLoaded', function() {
    let missionCount = 1;

    // Function to add a new mission
    document.getElementById('addMission').addEventListener('click', function() {
        const missionDiv = document.querySelector('.mission-group');
        if (missionDiv) {
            const newMissionDiv = missionDiv.cloneNode(true);

            newMissionDiv.querySelectorAll('select').forEach(select => {
                select.value = ""; // reset to default (unselected)
            });
            newMissionDiv.querySelectorAll('.selected-brawlers, .selected-modes').forEach(span => {
                span.textContent = 'None selected'; // Reset the display text
            });

            const clearButton = newMissionDiv.querySelector('.clear-selection');
            if (clearButton) {
                clearButton.addEventListener('click', function() {
                    newMissionDiv.querySelectorAll('select').forEach(select => {
                        select.value = ""; // Clear selection
                        newMissionDiv.querySelector('.selected-brawlers').textContent = 'None selected';
                        newMissionDiv.querySelector('.selected-modes').textContent = 'None selected';
                    });
                });
            }

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-mission');
            deleteButton.type = 'button';
            newMissionDiv.appendChild(deleteButton);

            document.getElementById('missionForm').insertBefore(newMissionDiv, document.getElementById('addMission'));
            missionCount++;
            updateMissionHeadings();
            document.getElementById('missionCount').textContent = `Total Quests: ${missionCount}`;
            attachBrawlerSelectListener(newMissionDiv.querySelector('.brawler'), newMissionDiv.querySelector('.selected-brawlers'));
            attachModeSelectListener(newMissionDiv.querySelector('.mode'), newMissionDiv.querySelector('.selected-modes'));

            deleteButton.addEventListener('click', function() {
                deleteMission(newMissionDiv);
            });
        } else {
            console.error("Mission element not found to clone.");
        }
    });

    // Handle form submission
    document.getElementById('missionForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Collect quests, brawlers, and modes from form
        const quests = Array.from(document.querySelectorAll('select[name="quest[]"]')).map(select => select.options[select.selectedIndex].text);
        const brawlers = Array.from(document.querySelectorAll('select[name="brawler[]"]')).map(select =>
            Array.from(select.selectedOptions).map(option => option.text)
        );
        const modes = Array.from(document.querySelectorAll('select[name="mode[]"]')).map(select =>
            Array.from(select.selectedOptions).map(option => option.text)
        );

        // Find common aspects
        const commonQuests = findCommonQuestsWithConditions(quests, modes, brawlers);
        const commonBrawlers = findItemsInMultiple(brawlers.flat(), 2); // Flatten the arrays first
        const commonModes = findItemsInMultiple(modes.flat(), 2); // Filter out empty selections

        // Display common aspects
        const commonAspectsDiv = document.getElementById('commonAspects');
        commonAspectsDiv.innerHTML = `
            <p><strong>Common Quests:</strong> ${commonQuests.length > 0 ? commonQuests.join(', ') : 'None'}</p>
            <p><strong>Common Brawlers:</strong> ${commonBrawlers.length > 0 ? commonBrawlers.join(', ') : 'None'}</p>
            <p><strong>Common Modes:</strong> ${commonModes.length > 0 ? commonModes.join(', ') : 'None'}</p>
        `;
    });

    function updateMissionHeadings() {
        document.querySelectorAll('.mission-heading').forEach((heading, index) => {
            heading.textContent = `Quest #${index + 1}`;
        });
    }

    function deleteMission(missionDiv) {
        missionDiv.remove(); // Remove the mission from the DOM
        missionCount--;
        updateMissionHeadings();
        document.getElementById('missionCount').textContent = `Total Quests: ${missionCount}`;
    }

    updateMissionHeadings();

    // Function to find common quests only if modes and brawlers allow
    function findCommonQuestsWithConditions(quests, brawlers, modes) {
        const commonQuests = [];

        for (let i = 0; i < quests.length; i++) {
            for (let j = i + 1; j < quests.length; j++) {
                const quest1 = quests[i];
                const quest2 = quests[j];

                // Check if tasks overlap (ignoring numbers)
                const task1 = removeNumbers(quest1);
                const task2 = removeNumbers(quest2);
                const questOverlap = task1 === task2;

                // Check if modes allow overlap (either same or empty mode in one)
                const modeOverlap = (modes[i].toString() === modes[j].toString()) || (!modes[i] && modes[j]) || (!modes[j] && modes[i]);

                // Check if brawlers allow overlap (either same or one is empty)
                const brawlerOverlap = findCommonMultiple([brawlers[i], brawlers[j]]).length > 0 || brawlers[i].length === 0 || brawlers[j].length === 0;

                // Overlap only if all conditions are met
                if (questOverlap && modeOverlap && brawlerOverlap) {
                    if (!commonQuests.includes(quest1)) {
                        commonQuests.push(quest1);
                    }
                }
            }
        }

        return commonQuests;
    }

    // Function to remove numbers and focus on task
    function removeNumbers(quest) {
        return quest.replace(/\d+/g, '').trim(); // Remove all numbers and trim extra spaces
    }

    // Function to find items (quests, brawlers, or modes) appearing in at least 'minCount' missions
    function findItemsInMultiple(arr, minCount) {
        const itemCount = {};

        // Count occurrences of each item
        arr.forEach(item => {
            if (item) {
                itemCount[item] = (itemCount[item] || 0) + 1;
            }
        });

        // Return items that appear in at least 'minCount' missions
        return Object.keys(itemCount).filter(item => itemCount[item] >= minCount);
    }

    // Function to find common items in two arrays
    function findCommonMultiple(arrays) {
        if (arrays.length === 0) return [];
        return arrays.reduce((acc, current) => acc.filter(item => current.includes(item)));
    }

    attachBrawlerSelectListener(document.querySelector('.brawler'), document.querySelector('.selected-brawlers'));
    attachModeSelectListener(document.querySelector('.mode'), document.querySelector('.selected-modes'));

    function attachBrawlerSelectListener(brawlerSelect, displayElement) {
        brawlerSelect.addEventListener('change', function() {
            const selectedBrawlers = Array.from(brawlerSelect.selectedOptions).map(option => option.text).join(', ');
            displayElement.textContent = selectedBrawlers.length > 0 ? selectedBrawlers : 'None selected';
        });
    }

    function attachModeSelectListener(modeSelect, displayElement) {
        modeSelect.addEventListener('change', function() {
            const selectedModes = Array.from(modeSelect.selectedOptions).map(option => option.text).join(', ');
            displayElement.textContent = selectedModes.length > 0 ? selectedModes : 'None selected';
        });
    }

    document.querySelectorAll('.clear-selection').forEach(clearButton => {
        clearButton.addEventListener('click', function() {
            const missionDiv = clearButton.closest('.mission-group');
            if (missionDiv) {
                missionDiv.querySelectorAll('select').forEach(select => {
                    select.value = ""; // Clear selection
                    missionDiv.querySelector('.selected-brawlers').textContent = 'None selected';
                    missionDiv.querySelector('.selected-modes').textContent = 'None selected';
                });
            }
        });
    });
});
