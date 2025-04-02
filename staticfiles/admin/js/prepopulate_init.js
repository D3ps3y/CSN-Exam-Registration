'use strict'; // Enforce strict mode to prevent errors and enforce safer JavaScript coding practices

{ // Start a block scope to avoid polluting the global namespace

    const $ = django.jQuery; // Assign Django's jQuery instance to the `$` variable for easier use

    // Get the prepopulated fields configuration from a data attribute
    const fields = $('#django-admin-prepopulated-fields-constants').data('prepopulatedFields');

    // Iterate over each field in the prepopulated fields list
    $.each(fields, function(index, field) {

        // Select empty form rows that contain the specific field and add the 'prepopulated_field' class
        $(
            '.empty-form .form-row .field-' + field.name + // Matches standard empty form row fields
            ', .empty-form.form-row .field-' + field.name + // Matches inline form row fields
            ', .empty-form .form-row.field-' + field.name // Matches fields directly inside a row
        ).addClass('prepopulated_field'); // Add a CSS class for styling or identification

        // Set up prepopulation for the field, passing its dependencies, max length, and Unicode support flag
        $(field.id) // Select the field using its ID
            .data('dependency_list', field.dependency_list) // Store dependency list data for reference
            .prepopulate(field.dependency_ids, field.maxLength, field.allowUnicode); // Call the prepopulate function
    });

} // End of block scope
