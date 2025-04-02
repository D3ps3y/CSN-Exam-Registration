"use strict"; // Enforce strict mode to catch common errors and enforce safer JavaScript practices

// Fallback JavaScript for browsers that do not support the :has() CSS selector 
// used in admin/css/unusable_password_fields.css.
// This script should be removed once all supported browsers implement :has().

try {
    // Try using the :has() CSS selector in a querySelector call.
    // If the browser does not support :has(), this will throw an error.
    document.querySelector("form:has(input)");
} catch (error) {
    // Catch the error and log a message to indicate fallback JavaScript is being used.
    console.log("Defaulting to JavaScript for usable password form management: " + error);

    // JavaScript-based replacement for the missing :has() selector support.
    // Select all input elements with the name "usable_password".
    document.querySelectorAll('input[name="usable_password"]').forEach(option => {
        
        // Add a 'change' event listener to each "usable_password" input field.
        option.addEventListener('change', function() {

            // Determine whether the password fields should be usable based on the selected option.
            const usablePassword = (this.value === "true" ? this.checked : !this.checked);

            // Select the submit buttons for setting and unsetting passwords.
            const submit1 = document.querySelector('input[type="submit"].set-password');
            const submit2 = document.querySelector('input[type="submit"].unset-password');

            // Select the warning message element related to unusable passwords.
            const messages = document.querySelector('#id_unusable_warning');

            // Show or hide the password input fields based on whether a usable password is selected.
            document.getElementById('id_password1').closest('.form-row').hidden = !usablePassword;
            document.getElementById('id_password2').closest('.form-row').hidden = !usablePassword;

            // Show or hide the warning message if it exists.
            if (messages) {
                messages.hidden = usablePassword; // Hide warning if password is usable, show if not.
            }

            // Show the appropriate submit button based on password usability.
            if (submit1 && submit2) {
                submit1.hidden = !usablePassword; // Show "Set Password" button when password is usable.
                submit2.hidden = usablePassword;  // Show "Unset Password" button when password is not usable.
            }
        });

        // Trigger the 'change' event programmatically to apply the logic on page load.
        option.dispatchEvent(new Event('change'));
    });
}
