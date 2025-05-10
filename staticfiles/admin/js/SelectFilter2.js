/*global SelectBox, gettext, ngettext, interpolate, quickElement, SelectFilter*/
/*
SelectFilter2 - Turns a multiple-select box into a filter interface.

Requires core.js and SelectBox.js.
*/
'use strict';
{
    window.SelectFilter = {
        // Initializes the SelectFilter for a given field
        init: function(field_id, field_name, is_stacked) {
            if (field_id.match(/__prefix__/)) {
                // Don't initialize on empty forms.
                return;
            }
            const from_box = document.getElementById(field_id); // Get the select box by its ID
            from_box.id += '_from'; // change its ID
            from_box.className = 'filtered'; // Set the class of the select box to 'filtered'

            // Loop through all <p> elements in the parent node of the select box
            for (const p of from_box.parentNode.getElementsByTagName('p')) {
                if (p.classList.contains("info")) {
                    // Remove <p class="info">, because it just gets in the way.
                    from_box.parentNode.removeChild(p);
                } else if (p.classList.contains("help")) {
                    // Move help text up to the top so it isn't below the select
                    // boxes or wrapped off on the side to the right of the add
                    // button:
                    from_box.parentNode.insertBefore(p, from_box.parentNode.firstChild);
                }
            }

            // <div class="selector"> or <div class="selector stacked">
            const selector_div = quickElement('div', from_box.parentNode); // Create a new <div> element
            // Make sure the selector div is at the beginning so that the
            // add link would be displayed to the right of the widget.
            from_box.parentNode.prepend(selector_div); // Prepend the selector_div to the parent node of the select box
            selector_div.className = is_stacked ? 'selector stacked' : 'selector'; // Set class based on whether it's stacked

            // <div class="selector-available">
            const selector_available = quickElement('div', selector_div); // Create another <div> for available items
            selector_available.className = 'selector-available'; // Set class for available selector
            const title_available = quickElement('h2', selector_available, interpolate(gettext('Available %s') + ' ', [field_name])); // Create title for available selector
            quickElement(
                'span', title_available, '',
                'class', 'help help-tooltip help-icon',
                'title', interpolate(
                    gettext(
                        'This is the list of available %s. You may choose some by ' +
                        'selecting them in the box below and then clicking the ' +
                        '"Choose" arrow between the two boxes.'
                    ),
                    [field_name]
                )
            ); // Add tooltip to the available selector title

            const filter_p = quickElement('p', selector_available, '', 'id', field_id + '_filter'); // Create a filter paragraph for available items
            filter_p.className = 'selector-filter'; // Set class for filter paragraph

            const search_filter_label = quickElement('label', filter_p, '', 'for', field_id + '_input'); // Create a label for filter input

            quickElement(
                'span', search_filter_label, '',
                'class', 'help-tooltip search-label-icon',
                'title', interpolate(gettext("Type into this box to filter down the list of available %s."), [field_name])
            ); // Add tooltip to the filter label

            filter_p.appendChild(document.createTextNode(' ')); // Add a space after the label

            const filter_input = quickElement('input', filter_p, '', 'type', 'text', 'placeholder', gettext("Filter")); // Create the filter input field
            filter_input.id = field_id + '_input'; // Set the ID of the filter input field

            selector_available.appendChild(from_box); // Append the original select box to the available selector div
            const choose_all = quickElement('a', selector_available, gettext('Choose all'), 'title', interpolate(gettext('Click to choose all %s at once.'), [field_name]), 'href', '#', 'id', field_id + '_add_all_link'); // Create the 'Choose all' link
            choose_all.className = 'selector-chooseall'; // Set class for 'Choose all' link

            // <ul class="selector-chooser">
            const selector_chooser = quickElement('ul', selector_div); // Create a <ul> element for the chooser
            selector_chooser.className = 'selector-chooser'; // Set class for the chooser
            const add_link = quickElement('a', quickElement('li', selector_chooser), gettext('Choose'), 'title', gettext('Choose'), 'href', '#', 'id', field_id + '_add_link'); // Create the 'Choose' link
            add_link.className = 'selector-add'; // Set class for 'Choose' link
            const remove_link = quickElement('a', quickElement('li', selector_chooser), gettext('Remove'), 'title', gettext('Remove'), 'href', '#', 'id', field_id + '_remove_link'); // Create the 'Remove' link
            remove_link.className = 'selector-remove'; // Set class for 'Remove' link

            // <div class="selector-chosen">
            const selector_chosen = quickElement('div', selector_div, '', 'id', field_id + '_selector_chosen'); // Create a div for the chosen items
            selector_chosen.className = 'selector-chosen'; // Set class for chosen items
            const title_chosen = quickElement('h2', selector_chosen, interpolate(gettext('Chosen %s') + ' ', [field_name])); // Create title for chosen selector
            quickElement(
                'span', title_chosen, '',
                'class', 'help help-tooltip help-icon',
                'title', interpolate(
                    gettext(
                        'This is the list of chosen %s. You may remove some by ' +
                        'selecting them in the box below and then clicking the ' +
                        '"Remove" arrow between the two boxes.'
                    ),
                    [field_name]
                )
            ); // Add tooltip to the chosen selector title
            
            const filter_selected_p = quickElement('p', selector_chosen, '', 'id', field_id + '_filter_selected'); // Create a filter paragraph for chosen items
            filter_selected_p.className = 'selector-filter'; // Set class for filter paragraph

            const search_filter_selected_label = quickElement('label', filter_selected_p, '', 'for', field_id + '_selected_input'); // Create a label for selected filter input

            quickElement(
                'span', search_filter_selected_label, '',
                'class', 'help-tooltip search-label-icon',
                'title', interpolate(gettext("Type into this box to filter down the list of selected %s."), [field_name])
            ); // Add tooltip to the selected filter label

            filter_selected_p.appendChild(document.createTextNode(' ')); // Add a space after the label

            const filter_selected_input = quickElement('input', filter_selected_p, '', 'type', 'text', 'placeholder', gettext("Filter")); // Create the filter input field for selected items
            filter_selected_input.id = field_id + '_selected_input'; // Set the ID of the selected filter input field

            const to_box = quickElement('select', selector_chosen, '', 'id', field_id + '_to', 'multiple', '', 'size', from_box.size, 'name', from_box.name); // Create the 'to' select box for chosen items
            to_box.className = 'filtered'; // Set the class of the 'to' box

            const warning_footer = quickElement('div', selector_chosen, '', 'class', 'list-footer-display'); // Create the footer for warning display
            quickElement('span', warning_footer, '', 'id', field_id + '_list-footer-display-text'); // Add text span to footer
            quickElement('span', warning_footer, ' (click to clear)', 'class', 'list-footer-display__clear'); // Add clear text to footer
            
            const clear_all = quickElement('a', selector_chosen, gettext('Remove all'), 'title', interpolate(gettext('Click to remove all chosen %s at once.'), [field_name]), 'href', '#', 'id', field_id + '_remove_all_link'); // Create the 'Remove all' link
            clear_all.className = 'selector-clearall'; // Set class for 'Remove all' link

            from_box.name = from_box.name + '_old'; // Modify the name of the original select box

            // Set up the JavaScript event handlers for the select box filter interface
            const move_selection = function(e, elem, move_func, from, to) {
                if (elem.classList.contains('active')) {
                    move_func(from, to);
                    SelectFilter.refresh_icons(field_id);
                    SelectFilter.refresh_filtered_selects(field_id);
                    SelectFilter.refresh_filtered_warning(field_id);
                }
                e.preventDefault();
            };
            choose_all.addEventListener('click', function(e) {
                move_selection(e, this, SelectBox.move_all, field_id + '_from', field_id + '_to');
            });
            add_link.addEventListener('click', function(e) {
                move_selection(e, this, SelectBox.move, field_id + '_from', field_id + '_to');
            });
            remove_link.addEventListener('click', function(e) {
                move_selection(e, this, SelectBox.move, field_id + '_to', field_id + '_from');
            });
            clear_all.addEventListener('click', function(e) {
                move_selection(e, this, SelectBox.move_all, field_id + '_to', field_id + '_from');
            });

            // Add event listeners to filter input elements
            filter_input.addEventListener('keyup', function(e) {
                SelectFilter.filter_key_up(e, field_id, from_box);
            });
            filter_selected_input.addEventListener('keyup', function(e) {
                SelectFilter.filter_key_up(e, field_id, to_box);
            });
            filter_input.addEventListener('keydown', function(e) {
                SelectFilter.filter_key_down(e, field_id, from_box);
            });
            filter_selected_input.addEventListener('keydown', function(e) {
                SelectFilter.filter_key_down(e, field_id, to_box);
            });

            // Re-populate options based on selected filter input
            SelectFilter.refresh_filtered_warning(field_id);
            SelectFilter.refresh_filtered_selects(field_id);
            SelectFilter.refresh_icons(field_id);
        },
