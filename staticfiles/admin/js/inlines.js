/*global DateTimeShortcuts, SelectFilter*/ // Declare global variables for Django's date and select filter utilities

/**
 * Django admin inlines
 *
 * Based on jQuery Formset 1.1
 * @author Stanislaus Madueke (stan DOT madueke AT gmail DOT com)
 * @requires jQuery 1.2.6 or later
 *
 * Copyright (c) 2009, Stanislaus Madueke
 * All rights reserved.
 *
 * Spiced up with Code from Zain Memon's GSoC project 2009
 * and modified for Django by Jannis Leidel, Travis Swicegood, and Julien Phalip.
 *
 * Licensed under the New BSD License
 * See: https://opensource.org/licenses/bsd-license.php
 */

'use strict'; // Enforce strict mode to catch common JavaScript mistakes

{
    const $ = django.jQuery; // Use Django's bundled jQuery instance

    $.fn.formset = function(opts) { // Define a jQuery plugin for formset functionality
        const options = $.extend({}, $.fn.formset.defaults, opts); // Merge user-provided options with defaults
        const $this = $(this); // Store the jQuery object reference to the current selection
        const $parent = $this.parent(); // Get the parent element of the formset

        const updateElementIndex = function(el, prefix, ndx) { // Function to update the index in form field names and IDs
            const id_regex = new RegExp("(" + prefix + "-(\\d+|__prefix__))"); // Regex to match formset indexes
            const replacement = prefix + "-" + ndx; // Construct the new index

            if ($(el).prop("for")) { // Update 'for' attributes in labels
                $(el).prop("for", $(el).prop("for").replace(id_regex, replacement));
            }
            if (el.id) { // Update element IDs
                el.id = el.id.replace(id_regex, replacement);
            }
            if (el.name) { // Update element names
                el.name = el.name.replace(id_regex, replacement);
            }
        };

        const totalForms = $("#id_" + options.prefix + "-TOTAL_FORMS").prop("autocomplete", "off"); // Store and disable autocomplete for total form count
        let nextIndex = parseInt(totalForms.val(), 10); // Get the current count of forms and parse it as an integer
        const maxForms = $("#id_" + options.prefix + "-MAX_NUM_FORMS").prop("autocomplete", "off"); // Store max form count, if any
        const minForms = $("#id_" + options.prefix + "-MIN_NUM_FORMS").prop("autocomplete", "off"); // Store min form count, if any
        let addButton; // Placeholder for the "Add" button

        /**
         * Function to add the "Add another" button for inline forms.
         */
        const addInlineAddButton = function() {
            if (addButton === null) { // Check if the add button exists
                if ($this.prop("tagName") === "TR") { // If forms are in a table row
                    const numCols = $this.eq(-1).children().length; // Get number of columns
                    $parent.append('<tr class="' + options.addCssClass + '"><td colspan="' + numCols + '"><a href="#">' + options.addText + "</a></tr>");
                    addButton = $parent.find("tr:last a"); // Select the new button
                } else { // If forms are in a different container (e.g., div)
                    $this.filter(":last").after('<div class="' + options.addCssClass + '"><a href="#">' + options.addText + "</a></div>");
                    addButton = $this.filter(":last").next().find("a"); // Select the new button
                }
            }
            addButton.on('click', addInlineClickHandler); // Attach click event
        };

        /**
         * Function to handle the "Add" button click event.
         */
        const addInlineClickHandler = function(e) {
            e.preventDefault(); // Prevent default anchor behavior
            const template = $("#" + options.prefix + "-empty"); // Get the empty form template
            const row = template.clone(true); // Clone the template

            row.removeClass(options.emptyCssClass) // Remove the empty class
                .addClass(options.formCssClass) // Add dynamic form class
                .attr("id", options.prefix + "-" + nextIndex); // Update the row ID

            addInlineDeleteButton(row); // Add delete button to the new row

            row.find("*").each(function() { // Update element indices for all elements in the row
                updateElementIndex(this, options.prefix, totalForms.val());
            });

            row.insertBefore($(template)); // Insert the new form before the template

            $(totalForms).val(parseInt(totalForms.val(), 10) + 1); // Increment total forms count
            nextIndex += 1; // Increment index for next form

            if ((maxForms.val() !== '') && (maxForms.val() - totalForms.val()) <= 0) { // Hide add button if max limit is reached
                addButton.parent().hide();
            }

            toggleDeleteButtonVisibility(row.closest('.inline-group')); // Toggle delete buttons visibility

            if (options.added) { // Call custom callback function if defined
                options.added(row);
            }

            row.get(0).dispatchEvent(new CustomEvent("formset:added", { // Dispatch custom event
                bubbles: true,
                detail: {
                    formsetName: options.prefix
                }
            }));
        };

        /**
         * Function to add the delete button to each inline form.
         */
        const addInlineDeleteButton = function(row) {
            if (row.is("tr")) { // If forms are table rows
                row.children(":last").append('<div><a class="' + options.deleteCssClass + '" href="#">' + options.deleteText + "</a></div>");
            } else if (row.is("ul") || row.is("ol")) { // If forms are in an unordered/ordered list
                row.append('<li><a class="' + options.deleteCssClass + '" href="#">' + options.deleteText + "</a></li>");
            } else { // Default case (e.g., div)
                row.children(":first").append('<span><a class="' + options.deleteCssClass + '" href="#">' + options.deleteText + "</a></span>");
            }

            row.find("a." + options.deleteCssClass).on('click', inlineDeleteHandler.bind(this)); // Attach delete event handler
        };

        /**
         * Function to handle the delete button click event.
         */
        const inlineDeleteHandler = function(e1) {
            e1.preventDefault(); // Prevent default link behavior
            const deleteButton = $(e1.target); // Get clicked button
            const row = deleteButton.closest('.' + options.formCssClass); // Get the parent form row
            const inlineGroup = row.closest('.inline-group'); // Get the inline group

            const prevRow = row.prev(); // Get previous row
            if (prevRow.length && prevRow.hasClass('row-form-errors')) { // Remove error row if present
                prevRow.remove();
            }

            row.remove(); // Remove the form row
            nextIndex -= 1; // Decrease form index

            if (options.removed) { // Call custom callback function if defined
                options.removed(row);
            }

            document.dispatchEvent(new CustomEvent("formset:removed", { // Dispatch custom event
                detail: {
                    formsetName: options.prefix
                }
            }));

            const forms = $("." + options.formCssClass); // Get all form instances
            $("#id_" + options.prefix + "-TOTAL_FORMS").val(forms.length); // Update total forms count

            if ((maxForms.val() === '') || (maxForms.val() - forms.length) > 0) { // Show add button if below max limit
                addButton.parent().show();
            }

            toggleDeleteButtonVisibility(inlineGroup); // Update delete button visibility

            let i, formCount;
            for (i = 0, formCount = forms.length; i < formCount; i++) { // Update remaining forms
                updateElementIndex($(forms).get(i), options.prefix, i);
                $(forms.get(i)).find("*").each(function() {
                    updateElementIndex(this, options.prefix, i);
                });
            }
        };

        // Initialize formset by adding delete buttons, add button, and handling visibility.
        addInlineAddButton();
        return this;
    };
}
