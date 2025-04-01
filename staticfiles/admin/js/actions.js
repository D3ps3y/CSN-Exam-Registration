/*global gettext, interpolate, ngettext, Actions*/  
'use strict';  
{  
    // Function to show elements matching the selector  
    function show(selector) {  
        document.querySelectorAll(selector).forEach(function(el) {  
            el.classList.remove('hidden');  
        });  
    }  

    // Function to hide elements matching the selector  
    function hide(selector) {  
        document.querySelectorAll(selector).forEach(function(el) {  
            el.classList.add('hidden');  
        });  
    }  

    // Function to show the "Are you sure?" question when selecting across multiple items  
    function showQuestion(options) {  
        hide(options.acrossClears); // Hide the clear button  
        show(options.acrossQuestions); // Show the question prompt  
        hide(options.allContainer); // Hide the "all selected" container  
    }  

    // Function to show the clear selection option  
    function showClear(options) {  
        show(options.acrossClears); // Show the clear button  
        hide(options.acrossQuestions); // Hide the question prompt  
        document.querySelector(options.actionContainer).classList.remove(options.selectedClass); // Remove selection highlight  
        show(options.allContainer); // Show the "all selected" container  
        hide(options.counterContainer); // Hide the counter display  
    }  

    // Function to reset selection UI to its initial state  
    function reset(options) {  
        hide(options.acrossClears);  
        hide(options.acrossQuestions);  
        hide(options.allContainer);  
        show(options.counterContainer); // Show the counter again  
    }  

    // Function to clear across selection  
    function clearAcross(options) {  
        reset(options); // Reset the UI  
        const acrossInputs = document.querySelectorAll(options.acrossInput);  
        acrossInputs.forEach(function(acrossInput) {  
            acrossInput.value = 0; // Reset selection input  
        });  
        document.querySelector(options.actionContainer).classList.remove(options.selectedClass); // Remove selected highlight  
    }  

    // Function to check/uncheck checkboxes and update UI  
    function checker(actionCheckboxes, options, checked) {  
        if (checked) {  
            showQuestion(options); // Show the confirmation question  
        } else {  
            reset(options); // Reset UI if unchecked  
        }  
        actionCheckboxes.forEach(function(el) {  
            el.checked = checked; // Set checkbox state  
            el.closest('tr').classList.toggle(options.selectedClass, checked); // Highlight row if checked  
        });  
    }  

    // Function to update the counter for selected items  
    function updateCounter(actionCheckboxes, options) {  
        const sel = Array.from(actionCheckboxes).filter(function(el) {  
            return el.checked;  
        }).length; // Count checked boxes  

        const counter = document.querySelector(options.counterContainer);  
        const actions_icnt = Number(counter.dataset.actionsIcnt); // Get total count from HTML dataset  

        // Update counter text with the selected count  
        counter.textContent = interpolate(  
            ngettext('%(sel)s of %(cnt)s selected', '%(sel)s of %(cnt)s selected', sel), {  
                sel: sel,  
                cnt: actions_icnt  
            }, true  
        );  

        const allToggle = document.getElementById(options.allToggleId);  
        allToggle.checked = sel === actionCheckboxes.length; // Check "select all" if everything is selected  

        if (allToggle.checked) {  
            showQuestion(options); // Show confirmation if everything is selected  
        } else {  
            clearAcross(options); // Otherwise, clear across selection  
        }  
    }  

    // Default configuration options  
    const defaults = {  
        actionContainer: "div.actions",  
        counterContainer: "span.action-counter",  
        allContainer: "div.actions span.all",  
        acrossInput: "div.actions input.select-across",  
        acrossQuestions: "div.actions span.question",  
        acrossClears: "div.actions span.clear",  
        allToggleId: "action-toggle",  
        selectedClass: "selected"  
    };  

    // Main Actions function  
    window.Actions = function(actionCheckboxes, options) {  
        options = Object.assign({}, defaults, options); // Merge options with defaults  
        let list_editable_changed = false; // Track if list was edited  
        let lastChecked = null; // Track the last checked checkbox  
        let shiftPressed = false; // Track if Shift key is pressed  

        // Listen for key events to track Shift key status  
        document.addEventListener('keydown', (event) => {  
            shiftPressed = event.shiftKey;  
        });  

        document.addEventListener('keyup', (event) => {  
            shiftPressed = event.shiftKey;  
        });  

        // Event listener for "Select All" checkbox  
        document.getElementById(options.allToggleId).addEventListener('click', function(event) {  
            checker(actionCheckboxes, options, this.checked);  
            updateCounter(actionCheckboxes, options);  
        });  

        // Event listener for "Select Across" confirmation link  
        document.querySelectorAll(options.acrossQuestions + " a").forEach(function(el) {  
            el.addEventListener('click', function(event) {  
                event.preventDefault();  
                const acrossInputs = document.querySelectorAll(options.acrossInput);  
                acrossInputs.forEach(function(acrossInput) {  
                    acrossInput.value = 1;  
                });  
                showClear(options); // Show the clear option  
            });  
        });  

        // Event listener for "Clear Selection" link  
        document.querySelectorAll(options.acrossClears + " a").forEach(function(el) {  
            el.addEventListener('click', function(event) {  
                event.preventDefault();  
                document.getElementById(options.allToggleId).checked = false; // Uncheck select all  
                clearAcross(options);  
                checker(actionCheckboxes, options, false);  
                updateCounter(actionCheckboxes, options);  
            });  
        });  

        // Function to determine affected checkboxes for shift-selecting  
        function affectedCheckboxes(target, withModifier) {  
            const multiSelect = (lastChecked && withModifier && lastChecked !== target);  
            if (!multiSelect) {  
                return [target]; // If no multi-select, return just the target checkbox  
            }  
            const checkboxes = Array.from(actionCheckboxes);  
            const targetIndex = checkboxes.findIndex(el => el === target);  
            const lastCheckedIndex = checkboxes.findIndex(el => el === lastChecked);  
            const startIndex = Math.min(targetIndex, lastCheckedIndex);  
            const endIndex = Math.max(targetIndex, lastCheckedIndex);  
            return checkboxes.filter((el, index) => (startIndex <= index) && (index <= endIndex));  
        };  

        // Event listener for changes in checkboxes  
        Array.from(document.getElementById('result_list').tBodies).forEach(function(el) {  
            el.addEventListener('change', function(event) {  
                const target = event.target;  
                if (target.classList.contains('action-select')) {  
                    const checkboxes = affectedCheckboxes(target, shiftPressed);  
                    checker(checkboxes, options, target.checked);  
                    updateCounter(actionCheckboxes, options);  
                    lastChecked = target;  
                } else {  
                    list_editable_changed = true; // Mark as edited  
                }  
            });  
        });  

        // Event listener for the "Run action" button  
        document.querySelector('#changelist-form button[name=index]').addEventListener('click', function(event) {  
            if (list_editable_changed) {  
                const confirmed = confirm(gettext("You have unsaved changes on individual editable fields. If you run an action, your unsaved changes will be lost."));  
                if (!confirmed) {  
                    event.preventDefault();  
                }  
            }  
        });  

        // Event listener for the "Save" button  
        const el = document.querySelector('#changelist-form input[name=_save]');  
        if (el) {  
            el.addEventListener('click', function(event) {  
                if (document.querySelector('[name=action]').value) {  
                    const text = list_editable_changed  
                        ? gettext("You have selected an action, but you haven’t saved your changes to individual fields yet. Please click OK to save. You’ll need to re-run the action.")  
                        : gettext("You have selected an action, and you haven’t made any changes on individual fields. You’re probably looking for the Go button rather than the Save button.");  
                    if (!confirm(text)) {  
                        event.preventDefault();  
                    }  
                }  
            });  
        }  

        // Update counter when navigating back to the page  
        window.addEventListener('pageshow', (event) => updateCounter(actionCheckboxes, options));  
    };  
}
