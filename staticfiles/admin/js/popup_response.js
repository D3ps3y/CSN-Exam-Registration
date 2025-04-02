'use strict'; // Enforce strict mode for better error handling and cleaner code

{ // Begin a block scope to avoid polluting the global scope

    // Retrieve and parse JSON data from an element with ID 'django-admin-popup-response-constants'
    // This element's dataset attribute contains a 'popupResponse' key with the required data
    const initData = JSON.parse(document.getElementById('django-admin-popup-response-constants').dataset.popupResponse);

    // Use a switch statement to determine the action to take based on initData.action
    switch(initData.action) {

        // Case when an existing related object is being changed
        case 'change':
            // Call the opener (parent window) function to update the changed related object
            // Pass the window reference, the object's value, its object data, and the new value
            opener.dismissChangeRelatedObjectPopup(window, initData.value, initData.obj, initData.new_value);
            break;

        // Case when a related object is deleted
        case 'delete':
            // Call the opener function to handle deletion of the related object
            // Pass the window reference and the object's value
            opener.dismissDeleteRelatedObjectPopup(window, initData.value);
            break;

        // Default case for when a new related object is added
        default:
            // Call the opener function to handle adding a new related object
            // Pass the window reference, the object's value, and its object data
            opener.dismissAddRelatedObjectPopup(window, initData.value, initData.obj);
            break;
    }
}
