/*global XRegExp*/ // Declare XRegExp as a global variable to avoid linting warnings.
'use strict'; // Enable strict mode to enforce better coding practices.

{
    // Maps for transliterating special characters into basic Latin characters.
    
    // Latin character transliteration map
    const LATIN_MAP = {
        'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'AE',
        'Ç': 'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I',
        'Î': 'I', 'Ï': 'I', 'Ð': 'D', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O',
        'Õ': 'O', 'Ö': 'O', 'Ő': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U',
        'Ü': 'U', 'Ű': 'U', 'Ý': 'Y', 'Þ': 'TH', 'Ÿ': 'Y', 'ß': 'ss', 'à': 'a',
        'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae', 'ç': 'c',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ì': 'i', 'í': 'i', 'î': 'i',
        'ï': 'i', 'ð': 'd', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o',
        'ö': 'o', 'ő': 'o', 'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
        'ű': 'u', 'ý': 'y', 'þ': 'th', 'ÿ': 'y'
    };

    // Additional transliteration maps for various languages and symbols
    const LATIN_SYMBOLS_MAP = { '©': '(c)' };
    const GREEK_MAP = { 'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', /*...*/ };
    const TURKISH_MAP = { 'ş': 's', 'Ş': 'S', 'ı': 'i', 'İ': 'I', /*...*/ };
    const ROMANIAN_MAP = { 'ă': 'a', 'î': 'i', 'ș': 's', 'ț': 't', /*...*/ };
    const RUSSIAN_MAP = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', /*...*/ };
    const UKRAINIAN_MAP = { 'Є': 'Ye', 'І': 'I', 'Ї': 'Yi', 'Ґ': 'G', /*...*/ };
    const CZECH_MAP = { 'č': 'c', 'ď': 'd', 'ě': 'e', 'ň': 'n', /*...*/ };
    const SLOVAK_MAP = { 'á': 'a', 'ä': 'a', 'č': 'c', 'ď': 'd', /*...*/ };
    const POLISH_MAP = { 'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', /*...*/ };
    const LATVIAN_MAP = { 'ā': 'a', 'č': 'c', 'ē': 'e', 'ģ': 'g', /*...*/ };
    const ARABIC_MAP = { 'أ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', /*...*/ };
    const LITHUANIAN_MAP = { 'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', /*...*/ };
    const SERBIAN_MAP = { 'ђ': 'dj', 'ј': 'j', 'љ': 'lj', 'њ': 'nj', /*...*/ };
    const AZERBAIJANI_MAP = { 'ç': 'c', 'ə': 'e', 'ğ': 'g', 'ı': 'i', /*...*/ };
    const GEORGIAN_MAP = { 'ა': 'a', 'ბ': 'b', 'გ': 'g', 'დ': 'd', /*...*/ };

    // Aggregating all the character maps into one array for easier processing.
    const ALL_DOWNCODE_MAPS = [
        LATIN_MAP,
        LATIN_SYMBOLS_MAP,
        GREEK_MAP,
        TURKISH_MAP,
        ROMANIAN_MAP,
        RUSSIAN_MAP,
        UKRAINIAN_MAP,
        CZECH_MAP,
        SLOVAK_MAP,
        POLISH_MAP,
        LATVIAN_MAP,
        ARABIC_MAP,
        LITHUANIAN_MAP,
        SERBIAN_MAP,
        AZERBAIJANI_MAP,
        GEORGIAN_MAP
    ];

    // Downcoder object that initializes the mapping and provides a regex for replacements.
    const Downcoder = {
        'Initialize': function() {
            if (Downcoder.map) { // If already initialized, return early.
                return;
            }
            Downcoder.map = {}; // Object to store all character replacements.

            // Merge all maps into a single lookup map.
            for (const lookup of ALL_DOWNCODE_MAPS) {
                Object.assign(Downcoder.map, lookup);
            }

            // Create a regex pattern matching all keys in the map.
            Downcoder.regex = new RegExp(Object.keys(Downcoder.map).join('|'), 'g');
        }
    };

    // Function to transliterate a given string using the Downcoder map.
    function downcode(slug) {
        Downcoder.Initialize(); // Ensure Downcoder is initialized.
        
        // Replace matched characters in the string using the map.
        return slug.replace(Downcoder.regex, function(m) {
            return Downcoder.map[m];
        });
    }

    // Function to generate a URL-friendly string (slugify)
    function URLify(s, num_chars, allowUnicode) {
        // Example: Converts "Petty theft" to "petty-theft"

        if (!allowUnicode) {
            s = downcode(s); // Convert non-ASCII characters if Unicode isn't allowed.
        }

        s = s.toLowerCase(); // Convert to lowercase.

        if (allowUnicode) {
            // Remove all non-alphanumeric characters except dashes and underscores.
            s = XRegExp.replace(s, XRegExp('[^-_\\p{L}\\p{N}\\s]', 'g'), '');
        } else {
            // Remove all characters except alphanumerics, dashes, and spaces.
            s = s.replace(/[^-\w\s]/g, '');
        }

        s = s.replace(/^\s+|\s+$/g, ''); // Trim spaces at the beginning and end.
        s = s.replace(/[-\s]+/g, '-'); // Replace spaces with hyphens.
        s = s.substring(0, num_chars); // Limit to specified length.
        return s.replace(/-+$/g, ''); // Remove trailing hyphens.
    }

    // Expose the function globally to be used outside the script block.
    window.URLify = URLify;
}
