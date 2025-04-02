'use strict'; // Enforce strict mode for better error handling and cleaner code

{ // Begin a block scope to avoid polluting the global scope

    // Get the button that toggles the navigation sidebar
    const toggleNavSidebar = document.getElementById('toggle-nav-sidebar');

    // Check if the button exists in the document
    if (toggleNavSidebar !== null) {
        // Get the sidebar navigation element
        const navSidebar = document.getElementById('nav-sidebar');

        // Get the main content area
        const main = document.getElementById('main');

        // Retrieve the sidebar state from local storage
        let navSidebarIsOpen = localStorage.getItem('django.admin.navSidebarIsOpen');

        // If no state is stored, default to 'true' (sidebar open)
        if (navSidebarIsOpen === null) {
            navSidebarIsOpen = 'true';
        }

        // Apply the 'shifted' class to move the main content based on sidebar state
        main.classList.toggle('shifted', navSidebarIsOpen === 'true');

        // Set the aria-expanded attribute on the sidebar for accessibility
        navSidebar.setAttribute('aria-expanded', navSidebarIsOpen);

        // Add a click event listener to the toggle button
        toggleNavSidebar.addEventListener('click', function() {
            // Toggle between 'true' and 'false' when clicked
            if (navSidebarIsOpen === 'true') {
                navSidebarIsOpen = 'false';
            } else {
                navSidebarIsOpen = 'true';
            }

            // Save the new state in local storage
            localStorage.setItem('django.admin.navSidebarIsOpen', navSidebarIsOpen);

            // Toggle the 'shifted' class on the main content area
            main.classList.toggle('shifted');

            // Update the aria-expanded attribute on the sidebar
            navSidebar.setAttribute('aria-expanded', navSidebarIsOpen);
        });
    }

    /**
     * Function to initialize the sidebar quick filter
     * It allows filtering of sidebar elements dynamically
     */
    function initSidebarQuickFilter() {
        const options = []; // Array to store sidebar filterable options

        // Get the sidebar navigation element
        const navSidebar = document.getElementById('nav-sidebar');

        // If sidebar does not exist, exit the function
        if (!navSidebar) {
            return;
        }

        // Find all table header links (assuming these are filterable items)
        navSidebar.querySelectorAll('th[scope=row] a').forEach((container) => {
            // Store the link text and reference in the options array
            options.push({title: container.innerHTML, node: container});
        });

        /**
         * Function to filter sidebar items based on user input
         * @param {Event} event - The input event from the filter field
         */
        function checkValue(event) {
            let filterValue = event.target.value; // Get the input field's value

            // Convert input to lowercase for case-insensitive matching
            if (filterValue) {
                filterValue = filterValue.toLowerCase();
            }

            // If the user presses Escape, clear the filter
            if (event.key === 'Escape') {
                filterValue = '';
                event.target.value = ''; // Clear the input field
            }

            let matches = false; // Track if any results match

            // Loop through all sidebar filterable options
            for (const o of options) {
                let displayValue = ''; // Default: show item

                // If a filter is applied, check if the item matches
                if (filterValue) {
                    if (o.title.toLowerCase().indexOf(filterValue) === -1) {
                        displayValue = 'none'; // Hide items that do not match
                    } else {
                        matches = true; // At least one match found
                    }
                }

                // Show/hide the entire table row (assuming links are inside <tr> elements)
                o.node.parentNode.parentNode.style.display = displayValue;
            }

            // Add or remove "no-results" class based on filter results
            if (!filterValue || matches) {
                event.target.classList.remove('no-results');
            } else {
                event.target.classList.add('no-results');
            }

            // Store the filter value in session storage for persistence
            sessionStorage.setItem('django.admin.navSidebarFilterValue', filterValue);
        }

        // Get the input field for filtering (assumed to have ID 'nav-filter')
        const nav = document.getElementById('nav-filter');

        // Attach event listeners to detect user input changes
        nav.addEventListener('change', checkValue, false);
        nav.addEventListener('input', checkValue, false);
        nav.addEventListener('keyup', checkValue, false);

        // Restore previous filter value from session storage (if any)
        const storedValue = sessionStorage.getItem('django.admin.navSidebarFilterValue');

        // If a value was stored, apply the filter on page load
        if (storedValue) {
            nav.value = storedValue;
            checkValue({target: nav, key: ''}); // Simulate a filtering event
        }
    }

    // Expose the filtering function globally so it can be called elsewhere
    window.initSidebarQuickFilter = initSidebarQuickFilter;

    // Call the function to initialize the sidebar filter on page load
    initSidebarQuickFilter();
}
