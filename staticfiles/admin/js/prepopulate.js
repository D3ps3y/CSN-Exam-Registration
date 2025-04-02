/*global URLify*/ // Declare that the global function URLify is expected to be available

'use strict'; // Enforce strict mode for cleaner code and better error handling

{ // Begin a block scope to prevent global variable pollution

    const $ = django.jQuery; // Assign Django's jQuery instance to the `$` variable for convenience

    // Extend jQuery with a custom function named 'prepopulate'
    $.fn.prepopulate = function(dependencies, maxLength, allowUnicode) {
        /*
            Function: prepopulate
            ---------------------
            - Automatically fills a field based on values from other dependent fields.
            - Uses the URLify function to create a URL-friendly version of the text.
            - Shortens the string to a given max length if necessary.
            - Allows optional Unicode support.

            Parameters:
            - dependencies: Array of dependent field IDs whose values will be used.
            - maxLength: The maximum allowed length for the generated string.
            - allowUnicode: Boolean flag for allowing Unicode characters in the output.
        */

        return this.each(function() { // Iterate over each selected field and apply the prepopulation logic
            const prepopulatedField = $(this); // Store the field that will be prepopulated

            const populate = function() {
                // Exit function if the field has been manually changed by the user
                if (prepopulatedField.data('_changed')) {
                    return;
                }

                const values = []; // Initialize an array to store values from dependent fields

                // Loop through each dependent field and collect its value
                $.each(dependencies, function(i, field) {
                    field = $(field); // Convert to jQuery object
                    if (field.val().length > 0) { // Only use non-empty values
                        values.push(field.val()); // Add field value to the array
                    }
                });

                // Set the prepopulated field's value using the URLify function
                prepopulatedField.val(URLify(values.join(' '), maxLength, allowUnicode));
            };

            // Store a flag to track whether the field has been manually changed by the user
            prepopulatedField.data('_changed', false);

            // If the field is manually changed, set the '_changed' flag to true
            prepopulatedField.on('change', function() {
                prepopulatedField.data('_changed', true);
            });

            // If the field is initially empty, listen for changes in dependent fields
            if (!prepopulatedField.val()) {
                $(dependencies.join(',')).on('keyup change focus', populate);
            }
        });
    };
}
