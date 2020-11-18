/**
 * @module parser/preprocessor
 * @desc transforms XML content and applies certain changes
 *
 * @example
 * const _ = {};
 * _.preprocessor = require('/preprocessor/main.js');
 */

'use strict';

/*
 * =======
 * MODULES
 * =======
 */

const _ = {};
_.fs   = require('fs');
_.path = require('path');

// utility scripts
_.basic         = require('../.global/basic-utilities.js');
_.type          = require('../.global/type-tests.js');
_.logger        = require('../.global/logger.js');
_.xml_converter = require('../.global/xml-converter.js');

// lecture.js modules
_.tts = require('../text-to-speech/main.js');



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

const TAGS = {
    
    // language tags like <en>, <en-US>, <de>, etc.
    language : [],
    
    // valid tags that should be converted to a different names/attributes
    convert : {
        token : {
            name : 'w'
        }
    }
};



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * scans through all tags and applies changes (including removing invalid tags, converting language tags, etc.)
 *
 * @async
 * @function
 * @alias module:parser/preprocessor
 * @category private
 *
 * @param {Object} json - JSON representation of XML data
 * @param {Object} default_voice - default voice to use for sections where no other voice is defined
 * @param {Array.<Object>} lexicons - available lexicons that may be applied
 * @param {integer} break_between_slides - break time to be added after <slide/> tags in milliseconds
 * @returns {Promise.<Object>} JSON representation of XML data
 */
const preprocessTags = async(json, default_voice, lexicons, break_between_slides) => {

    // removes a tag and moves up its children into its prior position
    const removeTag = (siblings, index) => {

        let element = siblings[index];

        // if the tag has content, move the content up to after the current tag
        if (element.elements) {
            siblings = _.basic.insertArray(siblings, index+1, element.elements);
        }

        // remove the tag directly
        siblings = _.basic.removeArrayIndex(siblings, index);

        return siblings;
    };
    
    // applies lexicons to any normal text element
    // and returns an array of the XML elements it was converted into
    const applyLexicons = (element, active_lexicons) => {
        
        // create an array that will hold all generated elements
        element = _.basic.deepCopy(element);
        let elements = [element];
        
        // if no lexicons are active, return directly
        if (active_lexicons.length === 0) return elements;
        
        // if the element is not a text element, return directly
        if (element.type !== 'text') return elements;
        
        // combine active lexicons into one
        // -> for the same grapheme, only the replacement value of the most direct lexicon is used
        // -> the closer to index 0 in the active lexicons array, the more direct/important the lexicon is
        let combined_lexicon = [];
        active_lexicons.forEach(id => {
            // get data for the lexicon
            const lexicon = lexicons.find(l => l.id === id);
            lexicon.lexemes.forEach(lexeme => {
                
                // check if the grapheme is not yet defined in the lexicon
                if (!combined_lexicon.some(earlier_lexeme => {
                    return earlier_lexeme.grapheme === lexeme.grapheme;
                })) {
                    // if so, add it to the lexicon
                    combined_lexicon.push({
                        alphabet    : lexicon.alphabet,
                        grapheme    : lexeme.grapheme,
                        type        : lexeme.type,
                        replacement : lexeme.replacement
                    });
                }
            });
        });
        
        // apply all the lexeme replacements from the combined lexicon to the element's text content
        combined_lexicon.forEach(lexeme => {
            
            // go through the original and all already newly created elements
            for (let i = 0, len = elements.length; i < len; i++) {
                
                let element = elements[i];
                
                // only apply lexicon to pure text nodes
                if (element.type !== 'text') continue;
                
                // define separators at which a new word begins or ends
                const separator = `&|%|§|"|'|<|>|~|=|_|°|#|\\^|\\*|\\+|\\$|\\||\\-|\\.|!|\\?|\\[|\\]|\\(|\\)|\\{|\\}|\\\\|\\/| |\\t|\\s|\\n|\\r`;
                // generate a regular expression
                const regex = new RegExp(`([${separator}]{1})(${lexeme.grapheme})([${separator}]{1})`, 'g');
                
                // generate the replacement tag for the word
                let replacement = '$1';
                if (lexeme.type === 'alias') {
                    replacement += `<sub alias="${lexeme.replacement}">$2</sub>`;
                }
                else {
                    replacement += `<phoneme${(lexeme.alphabet ? ` alphabet="${lexeme.alphabet}"` : '')} ph="${lexeme.replacement}">$2</phoneme>`;
                }
                replacement += '$3';
                
                // replace graphemes in the text with the defined replacement
                let new_xml = element.text.replace(regex, replacement);
                
                // if nothing was replaced, go to next element
                if (new_xml === element.text) continue;
                
                // preserve a space coming before any tag
                new_xml = new_xml.replace(/^[ ]+/, '*~*');
                
                // convert the now XML string into a JSON representation
                let new_elements = _.xml_converter.xml2json(`<root>${new_xml}</root>`, true);
                
                const preserve_space = elems => {
                    elems.forEach(elem => {
                        if (elem.elements) preserve_space(elem.elements);
                        if (elem.type === 'text') elem.text = elem.text.replace(/\*~\*/, ' ');
                    });
                }
                preserve_space(new_elements.elements[0].elements);
                
                // insert the new XML sections into the place of the old text section
                elements = _.basic.insertArray(elements, i+1, new_elements.elements[0].elements);
                elements = _.basic.removeArrayIndex(elements, i);
                
                i += new_elements.elements[0].elements.length - 1;
                len = elements.length;
            }
        });
        
        return elements;
    };
    
    // loop through the JSON representation of the XML
    // takes an array of elements and the currently active voice
    const loop = async(elements, parent, active_voice, active_lexicons) => {
        
        for (let i = 0, len = elements.length; i < len; i++) {
            
            let element = elements[i];

            if (element.type === 'text') {
                
                // apply lexicons to text nodes which are not from inside a <sub> or <phoneme> tag
                if (!parent || !['sub','phoneme'].includes(parent.name)) {
                    // convert the text to new XML
                    const converted_elements = applyLexicons(element, active_lexicons);

                    // remove the original element, and insert the new XML elements
                    elements = _.basic.insertArray(elements, i+1, converted_elements);
                    elements = _.basic.removeArrayIndex(elements, i);

                    i += converted_elements.length - 1;
                    len = elements.length;
                }
                continue;
            }
            
            // insert breaks after <slide> tags, if there comes no break tag after it
            if (
                element.name == 'slide' && 
                break_between_slides > 0
            ) {
                
                // don't insert a <break> tag, if a <break> tag comes already directly after the <slide> tag in the input XML file
                if (elements.length > i+1 && elements[i+1].name === 'break') {
                    continue;
                }

                // insert a break tag
                elements = _.basic.insertArray(elements, i+1, [{
                    type : 'element',
                    name : 'break',
                    attributes : {
                        time : `${break_between_slides}ms`
                    }
                }]);

                // with a new element inserted, skip one ahead
                i++;
                len = elements.length;
                continue;
            }
            else if (element.name == 'lookup') {
                
                if (
                    !element.attributes || 
                    !element.attributes.ref || 
                    element.attributes.ref === ''
                ) {
                    _.logger.warn(`Removed tag <lookup ref=""> with no reference lexicon defined`);
                    elements = removeTag(elements, i);
                    i--;
                    len = elements.length;
                    continue;
                }
                // check if the lexicon referenced with an id exists 
                else if (!lexicons.some(lexicon => lexicon.id === element.attributes.ref)) {
                    _.logger.warn(`Removed tag <lookup ref="${element.attributes.ref}">, because no lexicon "${element.attributes.ref}" exists`);
                    elements = removeTag(elements, i);
                    i--;
                    len = elements.length;
                    continue;
                }
            } 
            else if (element.name == 'voice') {
                
                if (
                    !element.attributes || 
                    !element.attributes.name || 
                    element.attributes.name === ''
                ) {
                    _.logger.warn(`Removed tag <voice name=""> with no voice defined`);
                    elements = removeTag(elements, i);
                    i--;
                    len = elements.length;
                    continue;
                }
                else if (!(await _.tts.voiceExists(element.attributes.name))) {
                    const voice = element.attributes.name;
                    _.logger.warn(`Removed tag <voice name="${voice}">, because voice "${voice}" does not exist`);
                    elements = removeTag(elements, i);
                    i--;
                    len = elements.length;
                    continue;
                }
            }

            // recursively go into deeper levels of the tag structure
            if (element.elements) {
                
                // if the element is a <voice> tag, it must have a valid voice name defined (as tested above)
                // so, that voice should be applied to its children
                let active_voice_for_children = active_voice;
                if (element.name == 'voice') {
                    active_voice_for_children = element.attributes.name;
                }
                
                // if the element is a <lookup> tag, it must have a valid lexicon referenced (as tested above)
                let active_lexicons_for_children = active_lexicons;
                if (element.name == 'lookup') {
                    // if so, that lexicon should also be added to currently active lexicons
                    active_lexicons_for_children = _.basic.deepCopy(active_lexicons);
                    active_lexicons_for_children.unshift(element.attributes.ref);
                }
                
                // loop through all its children to preprocess them
                element.elements = await loop(
                    element.elements, 
                    element, 
                    active_voice_for_children, 
                    active_lexicons_for_children
                );

                // if no child elements remain for this tag
                if (element.elements.length === 0) {
                    // delete the child elements key
                    delete element.elements;
                }
                
                // if the element was a <lookup>, now it has no use anymore, so remove it
                if (element.name === 'lookup') {
                    elements = removeTag(elements, i);
                    i--;
                    len = elements.length;
                    continue;
                }
            }
            
            if (element.name == 'lang') {
                
                if (!element.attributes || !element.attributes['xml:lang']) {
                    _.logger.warn(`Removed <lang xml:lang="..." />, because there is no language code defined`);
                    elements = removeTag(elements, i);
                    i--;
                    len = elements.length;
                    continue;
                }
                
                if (!(await _.tts.languageCodeExists(element.attributes['xml:lang']))) {
                    _.logger.warn(`Removed <lang xml:lang="${element.attributes['xml:lang']}" />, because the language code is not valid`);
                    elements = removeTag(elements, i);
                    i--;
                    len = elements.length;
                    continue;
                }
                
                // replace <lang> tag with <voice> tag if the current voice is from the Google API
                if (await _.tts.getVoiceAPI(active_voice) === 'google-cloud') {
                    element.name = 'voice';
                    element.attributes = {
                        name : await _.tts.matchVoice(active_voice, element.attributes['xml:lang'])
                    };
                    _.logger.message(`Converted tag <lang xml:lang="${element.attributes['xml:lang']}"> to <voice name="${active_voice}">`);
                }
            }
            // convert language tags, e.g., <en>, <en-US>, <de>
            else if (TAGS.language.includes(element.name)) {
                
                if (!(await _.tts.languageCodeExists(element.name))) {
                    _.logger.error(`Language code "${element.name}" does not exist`);
                }
                
                let synthesis_api = await _.tts.getVoiceAPI(active_voice);
                
                switch (synthesis_api) {

                    // for google cloud, transform it to a voice tag
                    case 'google-cloud': {
                        let matched_voice = await _.tts.matchVoice(active_voice, element.name);
                        element.attributes = {
                            name : matched_voice
                        };
                        _.logger.message(`Converted tag <${element.name}> to <voice name="${matched_voice}">`);
                        element.name = 'voice';
                        break;
                    }

                    // for amazon polly, transform it to a language tag
                    case 'amazon-polly': {
                        
                        // the element name is the language code
                        let language_code = element.name;
                        
                        // convert pure language codes to region-specific language codes, e.g., 'en' to 'en-US'
                        language_code = await _.tts.matchRegionLanguageCode(language_code);
                        
                        element.attributes = {
                            'xml:lang' : language_code
                        };
                        _.logger.message(`Converted tag <${element.name}> to <lang xml:lang="${language_code}">`);
                        element.name = 'lang';
                        break;
                    }
                }
            }
            else if (TAGS.convert[element.name]) {
            
                let old_name = element.name;
                let new_name = TAGS.convert[old_name].name;
                let new_attributes = TAGS.convert[old_name].attributes;

                element.name = new_name;

                let print_new_tag = new_name;

                if (new_attributes) {

                    Object.keys(new_attributes).forEach(attr => {
                        print_new_tag += ` ${attr}="${new_attributes[attr]}"`;
                    });

                    element.attributes = new_attributes;
                }

                _.logger.message(`Converted tag <${old_name}> to <${print_new_tag}>`);
            }
        }
        
        return elements;
    };
    
    for (let i = 0, len = json.elements[0].elements.length; i < len; i++) {
        
        let element = json.elements[0].elements[i];
        
        // remove any <lexicon /> tags and their contents
        if (element.name === 'lexicon') {
            json.elements[0].elements = _.basic.removeArrayIndex(json.elements[0].elements, i);
            i--;
            len = json.elements[0].elements.length;
        }
    }
    
    json.elements[0].elements = await loop(json.elements[0].elements, null, default_voice, []);
    
    return json;
};

/**
 * adds <break> tags between paragraphs
 *
 * @function
 * @alias module:parser/preprocessor
 * @category private
 * 
 * @param {string} xml - XML input data
 * @param {integer} duration - break time in milliseconds
 * @returns {string} XML data
 */
const addBreaksBetweenParagraphs = (xml, duration) => {
    
    // add break tags between paragraphs
    if (duration > 0) {

        // match empty space between text paragraphs
        // regex matches one text letter at beginning and end, with whitespace and at least one new line in the middle
        xml = xml.replace(/([^\<\>\n\r\s\t ]{1})([\n\r\s\t ]*?)(\r\n|\n|\r){1}([\n\r\s\t ]*?)([^\<\>\n\r\s\t ]{1})/g, `$1$2$3<break time="${duration}ms" />$4$5`);
    }
    
    return xml;
};



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /**
     * transforms the input XML and applies certain changes
     *
     * @async
     * @function
     * @alias module:parser/preprocessor
     * @category public
     *
     * @param {Object} options
     * @param {string} options.input_file - absolute path to a XML file
     * @param {string} options.default_voice - default voice to use for sections with no other voice defined
     * @param {Array.<Object>} options.lexicons - available lexicons that may be applied
     * @param {integer} options.break_between_slides - break time to add between <slide/> tags in milliseconds
     * @param {integer} options.break_between_paragraphs - break time to add between paragraphs in milliseconds
     * @returns {Promise.<string>} processed XML data
     */
    process : async(options) => {
        
        // required parameters
        
        if (!_.type.isObject(options)) {
            _.logger.error(`Expected options as an object, but got ${_.type.of(options)} "${options}"`);
            return;
        }
        
        if (!_.basic.isFile(options.input_path, '.xml')) {
            _.logger.error(`Expected options.input_path as a path to an existing XML file, but got ${_.type.of(options.input_path)} "${options.input_path}"`);
            return;
        }
        
        if (!_.type.isString(options.default_voice)) {
            _.logger.error(`Expected options.default_voice as a string, but got ${_.type.of(options.default_voice)} "${options.default_voice}"`);
            return;
        }
        
        if (!_.tts.voiceExists(options.default_voice)) {
            _.logger.error(`Voice "${options.default_voice}" was given as the default voice, but it does not exist`);
            return;
        }
        
        if (!_.type.isInteger(options.break_between_slides)) {
            _.logger.error(`Expected options.break_between_slides as an integer, but got ${_.type.of(options.break_between_slides)} "${options.break_between_slides}"`);
            return;
        }
        
        if (!_.type.isInteger(options.break_between_paragraphs)) {
            _.logger.error(`Expected options.break_between_paragraphs as an integer, but got ${_.type.of(options.break_between_paragraphs)} "${options.break_between_paragraphs}"`);
            return;
        }
        
        // optional parameters
        
        if (
            options.lexicons !== undefined &&
            (!_.type.isArray(options.lexicons) || !options.lexicons.every(_.type.isObject))
        ) {
            _.logger.error(`Expected options.lexicons, if defined, to be an array of objects, but got ${_.type.of(options.lexicons)} "${options.lexicons}"`);
            return;
        }
        
        // load language codes that are available as tags, for later use in the processor
        let language_codes = await _.tts.getLanguages();
        if (!language_codes) {
            _.logger.error(`Failed loading language codes`);
            return;
        }
        TAGS.language = language_codes.all;

        // transform XML string into JSON
        let xml = _.fs.readFileSync(options.input_path).toString();
        let json = _.xml_converter.xml2json(xml);
        
        // process the JSON data
        json = await preprocessTags(json, options.default_voice, options.lexicons, options.break_between_slides);
        if (!json) {
            _.logger.error(`Failed preprocessing the XML input file`);
            return;
        }
        
        // tranform json representation back into xml
        xml = _.xml_converter.json2xml(json);
        
        xml = addBreaksBetweenParagraphs(xml, options.break_between_paragraphs);
        
        return xml;
    }
};

module.exports = __public;