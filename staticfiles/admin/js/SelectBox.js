'use strict';
{
    const SelectBox = {
        cache: {},  // Cache object to store the data for each select box by its ID

        // Initializes the select box by saving its options into the cache
        init: function(id) {
            const box = document.getElementById(id);  // Get the select element by its ID
            SelectBox.cache[id] = [];  // Initialize an empty cache for this select box
            const cache = SelectBox.cache[id];
            for (const node of box.options) {  // Loop through each option in the select box
                cache.push({value: node.value, text: node.text, displayed: 1});  // Save the option value, text, and visibility
            }
        },

        // Repopulates the select box with the options stored in the cache
        redisplay: function(id) {
            const box = document.getElementById(id);  // Get the select box by its ID
            const scroll_value_from_top = box.scrollTop;  // Store the current scroll position
            box.innerHTML = '';  // Clear the select box options
            for (const node of SelectBox.cache[id]) {  // Loop through the cached options
                if (node.displayed) {  // Only display options that are marked as visible
                    const new_option = new Option(node.text, node.value, false, false);  // Create a new option element
                    new_option.title = node.text;  // Set the tooltip for the option
                    box.appendChild(new_option);  // Append the option to the select box
                }
            }
            box.scrollTop = scroll_value_from_top;  // Restore the scroll position
        },

        // Filters the options in the select box based on the search text
        filter: function(id, text) {
            const tokens = text.toLowerCase().split(/\s+/);  // Split the search text into tokens (words)
            for (const node of SelectBox.cache[id]) {  // Loop through the cached options
                node.displayed = 1;  // Assume the option should be displayed
                const node_text = node.text.toLowerCase();  // Convert the option text to lowercase
                for (const token of tokens) {  // Check each token against the option text
                    if (!node_text.includes(token)) {  // If the token isn't found in the text
                        node.displayed = 0;  // Hide the option
                        break;  // Exit the loop since one failed token is enough to hide the option
                    }
                }
            }
            SelectBox.redisplay(id);  // Redisplay the select box with updated visibility
        },

        // Returns the count of hidden options in the select box
        get_hidden_node_count: function(id) {
            const cache = SelectBox.cache[id] || [];  // Get the cache for the select box
            return cache.filter(node => node.displayed === 0).length;  // Count and return the hidden options
        },

        // Removes an option from the cache by its value
        delete_from_cache: function(id, value) {
            let delete_index = null;
            const cache = SelectBox.cache[id];
            for (const [i, node] of cache.entries()) {  // Loop through the cached options
                if (node.value === value) {  // If the value matches
                    delete_index = i;  // Mark the index for deletion
                    break;
                }
            }
            cache.splice(delete_index, 1);  // Remove the option from the cache
        },

        // Adds a new option to the cache
        add_to_cache: function(id, option) {
            SelectBox.cache[id].push({value: option.value, text: option.text, displayed: 1});  // Add the option to the cache
        },

        // Checks if an option with the specified value exists in the cache
        cache_contains: function(id, value) {
            for (const node of SelectBox.cache[id]) {  // Loop through the cached options
                if (node.value === value) {  // If the value matches, return true
                    return true;
                }
            }
            return false;  // Return false if the value isn't found
        },

        // Moves selected options from one select box to another
        move: function(from, to) {
            const from_box = document.getElementById(from);  // Get the source select box
            for (const option of from_box.options) {  // Loop through each option in the source box
                const option_value = option.value;
                if (option.selected && SelectBox.cache_contains(from, option_value)) {  // If the option is selected and exists in the cache
                    SelectBox.add_to_cache(to, {value: option_value, text: option.text, displayed: 1});  // Add to the target box's cache
                    SelectBox.delete_from_cache(from, option_value);  // Remove from the source box's cache
                }
            }
            SelectBox.redisplay(from);  // Redisplay both select boxes after the move
            SelectBox.redisplay(to);
        },

        // Moves all options from one select box to another
        move_all: function(from, to) {
            const from_box = document.getElementById(from);  // Get the source select box
            for (const option of from_box.options) {  // Loop through each option in the source box
                const option_value = option.value;
                if (SelectBox.cache_contains(from, option_value)) {  // If the option exists in the cache
                    SelectBox.add_to_cache(to, {value: option_value, text: option.text, displayed: 1});  // Add to the target box's cache
                    SelectBox.delete_from_cache(from, option_value);  // Remove from the source box's cache
                }
            }
            SelectBox.redisplay(from);  // Redisplay both select boxes after the move
            SelectBox.redisplay(to);
        },

        // Sorts the options in the select box alphabetically by their text
        sort: function(id) {
            SelectBox.cache[id].sort(function(a, b) {
                a = a.text.toLowerCase();
                b = b.text.toLowerCase();
                if (a > b) {  // Compare a to b
                    return 1;
                }
                if (a < b) {  // Compare b to a
                    return -1;
                }
                return 0;  // If they're the same, don't change their order
            });
        },

        // Selects all options in the select box
        select_all: function(id) {
            const box = document.getElementById(id);  // Get the select box by its ID
            for (const option of box.options) {  // Loop through each option in the select box
                option.selected = true;  // Set the option as selected
            }
        }
    };

    // Expose the SelectBox object to the global window scope
    window.SelectBox = SelectBox;
}
