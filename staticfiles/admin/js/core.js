'use strict'; // Enforces strict mode for better error handling and security

// quickElement(tagType, parentReference [, textInChildNode, attribute, attributeValue ...]);
function quickElement() {
    const obj = document.createElement(arguments[0]); // Create an element of the given tag type
    if (arguments[2]) { // If a text node is provided
        const textNode = document.createTextNode(arguments[2]); // Create a text node
        obj.appendChild(textNode); // Append text node to the element
    }
    const len = arguments.length; // Get the number of arguments passed
    for (let i = 3; i < len; i += 2) { // Loop through attributes (key-value pairs)
        obj.setAttribute(arguments[i], arguments[i + 1]); // Set attributes for the element
    }
    arguments[1].appendChild(obj); // Append the element to the specified parent
    return obj; // Return the created element
}

// Remove all child elements of a given element
function removeChildren(a) {
    while (a.hasChildNodes()) { // Loop while there are child nodes
        a.removeChild(a.lastChild); // Remove the last child node
    }
}

// ----------------------------------------------------------------------------
// Find-position functions by PPK
// See https://www.quirksmode.org/js/findpos.html
// ----------------------------------------------------------------------------

// Find the horizontal position (X) of an element
function findPosX(obj) {
    let curleft = 0; // Initialize left position
    if (obj.offsetParent) { // Check if offsetParent exists
        while (obj.offsetParent) { // Traverse up the offset parent tree
            curleft += obj.offsetLeft - obj.scrollLeft; // Add the element's offset left position
            obj = obj.offsetParent; // Move to the next offset parent
        }
    } else if (obj.x) { // If x property exists, use it
        curleft += obj.x;
    }
    return curleft; // Return the calculated X position
}

// Find the vertical position (Y) of an element
function findPosY(obj) {
    let curtop = 0; // Initialize top position
    if (obj.offsetParent) { // Check if offsetParent exists
        while (obj.offsetParent) { // Traverse up the offset parent tree
            curtop += obj.offsetTop - obj.scrollTop; // Add the element's offset top position
            obj = obj.offsetParent; // Move to the next offset parent
        }
    } else if (obj.y) { // If y property exists, use it
        curtop += obj.y;
    }
    return curtop; // Return the calculated Y position
}

//-----------------------------------------------------------------------------
// Date object extensions
// ----------------------------------------------------------------------------
{
    // Returns the 12-hour format hour
    Date.prototype.getTwelveHours = function() {
        return this.getHours() % 12 || 12; // Convert 24-hour format to 12-hour format
    };

    // Returns the month in two-digit format (01-12)
    Date.prototype.getTwoDigitMonth = function() {
        return (this.getMonth() < 9) ? '0' + (this.getMonth() + 1) : (this.getMonth() + 1);
    };

    // Returns the date in two-digit format (01-31)
    Date.prototype.getTwoDigitDate = function() {
        return (this.getDate() < 10) ? '0' + this.getDate() : this.getDate();
    };

    // Returns the 12-hour format hour in two-digit format
    Date.prototype.getTwoDigitTwelveHour = function() {
        return (this.getTwelveHours() < 10) ? '0' + this.getTwelveHours() : this.getTwelveHours();
    };

    // Returns the hour in two-digit format (00-23)
    Date.prototype.getTwoDigitHour = function() {
        return (this.getHours() < 10) ? '0' + this.getHours() : this.getHours();
    };

    // Returns the minutes in two-digit format (00-59)
    Date.prototype.getTwoDigitMinute = function() {
        return (this.getMinutes() < 10) ? '0' + this.getMinutes() : this.getMinutes();
    };

    // Returns the seconds in two-digit format (00-59)
    Date.prototype.getTwoDigitSecond = function() {
        return (this.getSeconds() < 10) ? '0' + this.getSeconds() : this.getSeconds();
    };

    // Returns the abbreviated name of the day
    Date.prototype.getAbbrevDayName = function() {
        return typeof window.CalendarNamespace === "undefined"
            ? '0' + this.getDay() // Default numeric day if CalendarNamespace is unavailable
            : window.CalendarNamespace.daysOfWeekAbbrev[this.getDay()];
    };

    // Returns the full name of the day
    Date.prototype.getFullDayName = function() {
        return typeof window.CalendarNamespace === "undefined"
            ? '0' + this.getDay()
            : window.CalendarNamespace.daysOfWeek[this.getDay()];
    };

    // Returns the abbreviated name of the month
    Date.prototype.getAbbrevMonthName = function() {
        return typeof window.CalendarNamespace === "undefined"
            ? this.getTwoDigitMonth()
            : window.CalendarNamespace.monthsOfYearAbbrev[this.getMonth()];
    };

    // Returns the full name of the month
    Date.prototype.getFullMonthName = function() {
        return typeof window.CalendarNamespace === "undefined"
            ? this.getTwoDigitMonth()
            : window.CalendarNamespace.monthsOfYear[this.getMonth()];
    };

    // Formats a date according to the provided format string
    Date.prototype.strftime = function(format) {
        const fields = {
            a: this.getAbbrevDayName(),
            A: this.getFullDayName(),
            b: this.getAbbrevMonthName(),
            B: this.getFullMonthName(),
            c: this.toString(),
            d: this.getTwoDigitDate(),
            H: this.getTwoDigitHour(),
            I: this.getTwoDigitTwelveHour(),
            m: this.getTwoDigitMonth(),
            M: this.getTwoDigitMinute(),
            p: (this.getHours() >= 12) ? 'PM' : 'AM',
            S: this.getTwoDigitSecond(),
            w: '0' + this.getDay(),
            x: this.toLocaleDateString(),
            X: this.toLocaleTimeString(),
            y: ('' + this.getFullYear()).substr(2, 4),
            Y: '' + this.getFullYear(),
            '%': '%'
        };
        let result = '', i = 0;
        while (i < format.length) { // Loop through the format string
            if (format.charAt(i) === '%') { // Replace placeholders with actual values
                result += fields[format.charAt(i + 1)];
                ++i;
            } else {
                result += format.charAt(i);
            }
            ++i;
        }
        return result; // Return formatted date string
    };

    // ----------------------------------------------------------------------------
    // String object extensions
    // ----------------------------------------------------------------------------
    // Parses a date string based on the provided format
    String.prototype.strptime = function(format) {
        const split_format = format.split(/[.\-/]/); // Split format on date delimiters
        const date = this.split(/[.\-/]/); // Split input date on delimiters
        let i = 0;
        let day, month, year;
        while (i < split_format.length) { // Loop through format parts
            switch (split_format[i]) {
            case "%d":
                day = date[i];
                break;
            case "%m":
                month = date[i] - 1; // Convert to zero-based month index
                break;
            case "%Y":
                year = date[i];
                break;
            case "%y":
                if (parseInt(date[i], 10) >= 69) { // If year is 69 or greater, assume 1900s
                    year = date[i];
                } else {
                    year = (new Date(Date.UTC(date[i], 0))).getUTCFullYear() + 100; // Assume 2000s
                }
                break;
            }
            ++i;
        }
        return new Date(Date.UTC(year, month, day)); // Return parsed date object
    };
}
