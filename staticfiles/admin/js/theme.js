'use strict'; // Enforce strict mode to catch common coding errors and enforce safer JavaScript practices

{ // Start a block scope to avoid polluting the global namespace

    function setTheme(mode) {
        // Ensure the theme mode is valid; if not, reset to "auto"
        if (mode !== "light" && mode !== "dark" && mode !== "auto") {
            console.error(`Got invalid theme mode: ${mode}. Resetting to auto.`);
            mode = "auto"; // Default to "auto" mode if an invalid mode is passed
        }

        // Apply the selected theme mode to the HTML root element using a data attribute
        document.documentElement.dataset.theme = mode;

        // Store the selected theme mode in localStorage for persistence
        localStorage.setItem("theme", mode);
    }

    function cycleTheme() {
        // Retrieve the current theme from localStorage, defaulting to "auto" if not set
        const currentTheme = localStorage.getItem("theme") || "auto";

        // Check if the user's system prefers dark mode using the `matchMedia` API
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (prefersDark) {
            // If system prefers dark mode:
            // Auto (dark) -> Light -> Dark -> Auto (loop cycle)
            if (currentTheme === "auto") {
                setTheme("light"); // Switch to light mode
            } else if (currentTheme === "light") {
                setTheme("dark"); // Switch to dark mode
            } else {
                setTheme("auto"); // Reset to auto mode
            }
        } else {
            // If system prefers light mode:
            // Auto (light) -> Dark -> Light -> Auto (loop cycle)
            if (currentTheme === "auto") {
                setTheme("dark"); // Switch to dark mode
            } else if (currentTheme === "dark") {
                setTheme("light"); // Switch to light mode
            } else {
                setTheme("auto"); // Reset to auto mode
            }
        }
    }

    function initTheme() {
        // Get the saved theme from localStorage
        const currentTheme = localStorage.getItem("theme");

        // If a theme is stored, apply it; otherwise, default to "auto"
        currentTheme ? setTheme(currentTheme) : setTheme("auto");
    }

    // When the page loads, add event listeners to all elements with the "theme-toggle" class
    window.addEventListener('load', function(_) {
        const buttons = document.getElementsByClassName("theme-toggle"); // Select all theme toggle buttons

        // Convert HTMLCollection to an array and loop through each button
        Array.from(buttons).forEach((btn) => {
            btn.addEventListener("click", cycleTheme); // Attach a click event listener to toggle the theme
        });
    });

    initTheme(); // Initialize the theme when the script runs

} // End of block scope
