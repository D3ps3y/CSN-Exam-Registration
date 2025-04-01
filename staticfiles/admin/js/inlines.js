/*global DateTimeShortcuts, SelectFilter*/
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

'use strict'; // Enforce strict mode for better error handling and cleaner code

{
    const $ = django.jQuery; // Alias for Django's jQuery

    // Define a jQuery plugin named "formset"
    $.fn.formset = function(opts) {
        // Merge user-provided options with the default options
        const options = $.extend({}, $.fn.formset.defaults, opts);
        
        // Get the current jQuery object (the elements on which the plugin is called)
        const $this = $(this);
        const $parent = $this.parent(); // Get the parent element

        // Function to update the index of form elements (IDs, names, etc.)
        const updateElementIndex = function(el, prefix, ndx) {
            const id_regex = new RegExp("(" + prefix + "-(\\d+|__prefix__))"); // Regex for replacing form indices
            const replacement = prefix + "-" + ndx; // New index replacement string
            
            if ($(el).prop("for")) {
                $(el).prop("for", $(el).prop("for").replace(id_regex, replacement));
            }
            if (el.id) {
                el.id = el.id.replace(id_regex, replacement);
            }
            if (el.name) {
                el.name = el.name.replace(id_regex, replacement);
            }
        };

        // Get the total number of forms and disable autocomplete on its field
        const totalForms = $("#id_" + options.prefix + "-TOTAL_FORMS").prop("autocomplete", "off");
        let nextIndex = parseInt(totalForms.val(), 10); // Convert total forms count to an integer
        const maxForms = $("#id_" + options.prefix + "-MAX_NUM_FORMS").prop("autocomplete", "off");
        const minForms = $("#id_" + options.prefix + "-MIN_NUM_FORMS").prop("autocomplete", "off");
        let addButton; // Variable to store the "Add" button

        /**
         * Function to add the "Add another" button.
         */
        const addInlineAddButton = function() {
            if (addButton === null) {
                if ($this.prop("tagName") === "TR") {
                    // If the forms are in a table row format, insert an "Add" button in a new row
                    const numCols = $this.eq(-1).children().length; // Get number of columns
                    $parent.append('<tr class="' + options.addCssClass + '"><td colspan="' + numCols + '"><a href="#">' + options.addText + "</a></tr>");
                    addButton = $parent.find("tr:last a"); // Select the newly added button
                } else {
                    // Otherwise, insert the "Add" button after the last form
                    $this.filter(":last").after('<div class="' + options.addCssClass + '"><a href="#">' + options.addText + "</a></div>");
                    addButton = $this.filter(":last").next().find("a");
                }
            }
            addButton.on('click', addInlineClickHandler); // Attach click event to "Add" button
        };

        /**
         * Function to handle click event for the "Add" button
         */
        const addInlineClickHandler = function(e) {
            e.preventDefault(); // Prevent default link behavior
            
            const template = $("#" + options.prefix + "-empty"); // Get the empty form template
            const row = template.clone(true); // Clone the empty form

            // Update the cloned form to be part of the formset
            row.removeClass(options.emptyCssClass)
                .addClass(options.formCssClass)
                .attr("id", options.prefix + "-" + nextIndex);

            addInlineDeleteButton(row); // Add a delete button to the new row
            
            row.find("*").each(function() {
                updateElementIndex(this, options.prefix, totalForms.val()); // Update indices of all elements
            });

            row.insertBefore($(template)); // Insert the new form before the empty template

            $(totalForms).val(parseInt(totalForms.val(), 10) + 1); // Increment total forms count
            nextIndex += 1; // Increase index counter

            // Hide "Add" button if max limit reached
            if ((maxForms.val() !== '') && (maxForms.val() - totalForms.val()) <= 0) {
                addButton.parent().hide();
            }

            toggleDeleteButtonVisibility(row.closest('.inline-group')); // Toggle delete button visibility

            // Call user-defined callback function if provided
            if (options.added) {
                options.added(row);
            }

            row.get(0).dispatchEvent(new CustomEvent("formset:added", {
                bubbles: true,
                detail: { formsetName: options.prefix }
            }));
        };

        /**
         * Function to add delete buttons to each row
         */
        const addInlineDeleteButton = function(row) {
            if (row.is("tr")) {
                row.children(":last").append('<div><a class="' + options.deleteCssClass + '" href="#">' + options.deleteText + "</a></div>");
            } else if (row.is("ul") || row.is("ol")) {
                row.append('<li><a class="' + options.deleteCssClass + '" href="#">' + options.deleteText + "</a></li>");
            } else {
                row.children(":first").append('<span><a class="' + options.deleteCssClass + '" href="#">' + options.deleteText + "</a></span>");
            }

            row.find("a." + options.deleteCssClass).on('click', inlineDeleteHandler.bind(this));
        };

        /**
         * Function to handle inline form deletion
         */
        const inlineDeleteHandler = function(e1) {
            e1.preventDefault();

            const deleteButton = $(e1.target);
            const row = deleteButton.closest('.' + options.formCssClass);
            const inlineGroup = row.closest('.inline-group');

            // Remove the row and update form count
            row.remove();
            nextIndex -= 1;

            // Trigger custom event for form removal
            document.dispatchEvent(new CustomEvent("formset:removed", {
                detail: { formsetName: options.prefix }
            }));

            // Update total form count
            const forms = $("." + options.formCssClass);
            $("#id_" + options.prefix + "-TOTAL_FORMS").val(forms.length);

            // Show add button again if below max limit
            if ((maxForms.val() === '') || (maxForms.val() - forms.length) > 0) {
                addButton.parent().show();
            }

            toggleDeleteButtonVisibility(inlineGroup); // Toggle delete button visibility

            // Update indices for remaining forms
            let i, formCount;
            for (i = 0, formCount = forms.length; i < formCount; i++) {
                updateElementIndex($(forms).get(i), options.prefix, i);
            }
        };

        // Setup defaults for the plugin
        $.fn.formset.defaults = {
            prefix: "form",
            addText: "add another",
            deleteText: "remove",
            addCssClass: "add-row",
            deleteCssClass: "delete-row",
            emptyCssClass: "empty-row",
            formCssClass: "dynamic-form",
            added: null,
            removed: null,
            addButton: null
        };

        // Initialize formset
        $this.each(function() {
            $(this).not("." + options.emptyCssClass).addClass(options.formCssClass);
        });

        addInlineAddButton(); // Create the add button
        return this;
    };

    // Initialize formsets on page load
    $(document).ready(function() {
        $(".js-inline-admin-formset").each(function() {
            const data = $(this).data(),
                inlineOptions = data.inlineFormset;
            let selector;
            switch(data.inlineType) {
            case "stacked":
                selector = inlineOptions.name + "-group .inline-related";
                $(selector).stackedFormset(selector, inlineOptions.options);
                break;
            case "tabular":
                selector = inlineOptions.name + "-group .tabular.inline-related tbody:first > tr.form-row";
                $(selector).tabularFormset(selector, inlineOptions.options);
                break;
            }
        });
    });
}
