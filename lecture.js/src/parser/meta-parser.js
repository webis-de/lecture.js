/**
 * @module parser/meta-parser
 * @desc gets meta information from given XML
 *
 * @example
 * const _ = {};
 * _.meta_parser = require('/parser/meta-parser.js');
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
_.logger        = require('../.global/logger.js');
_.pdf_worker    = require('../.global/pdf-worker.js');
_.xml_converter = require('../.global/xml-converter.js');



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

// object holding the current meta information
let META = null;



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * handles a <info /> tag and its attributes
 *
 * @function
 * @alias module:parser/meta-parser
 * @category private
 * 
 * @param {Object} tag - element
 */
const handleInfo = tag => {
    
    if (!tag.attributes || tag.attributes.length === 0) {
        _.logger.warn(`Ignored tag <info /> with no attributes`);
        return;
    }
    
    // copy all properties from the element
    Object.keys(tag.attributes).forEach(key => {
        META.info[key] = tag.attributes[key];
    });
};

/**
 * handles a <settings /> tag and its attributes
 *
 * @function
 * @alias module:parser/meta-parser
 * @category private
 * 
 * @param {Object} tag - element
 * @returns {boolean} true, if the <info> tag was valid
 */
const handleSettings = tag => {
    
    if (!tag.attributes || tag.attributes.length === 0) {
        _.logger.warn(`Ignored tag <settings /> with no attributes`);
        return;
    }
    
    // copy all properties from the element
    Object.keys(tag.attributes).forEach(key => {
        
        let value = tag.attributes[key];
        
        // if a value is a string with only numbers, parse it as an integer for easier usage later
        if (value.match(/^\-?[0-9]+$/)) {
            value = parseInt(value);
        }
        
        META.settings[key] = value;
    });
};

/**
 * handles a <deck /> tag and its attributes
 *
 * @async
 * @function
 * @alias module:parser/meta-parser
 * @category private
 * 
 * @param {Object} tag - element
 * @param {string} input_directory - directory where the input LSML file is located
 * @returns {Promise.<Object>} information if the slide deck is valid and active
 */
const handleDeck = async(tag, input_directory) => {
    
    // data to be returned for an invalid slide deck
    const invalid_deck = {
        is_valid : false,
        is_active : false
    };
    
    if (!tag.attributes) {
        _.logger.warn(`Ignored a <deck /> tag with no attributes`);
        return invalid_deck;
    }
    
    // create the slide deck object
    let deck = {};
    
    // check for a valid id
    const id = tag.attributes.id;
    if (!id || id === '') {
        _.logger.warn(`Ignored a <deck id="" /> tag with no defined id`);
        return invalid_deck;
    }
    deck.id = id;
    
    // check for a defined source file
    const source = tag.attributes.src;
    if (!source || source === '') {
        _.logger.warn(`Ignored tag <deck id="${id}" src="" /> with no defined source file`);
        return invalid_deck;
    }
    
    // check if the file is valid
    if (_.path.extname(source) !== '.pdf') {
        _.logger.warn(`Ignored tag <deck id="${id}" src="${source}" /> with a non-PDF file as source`);
        return invalid_deck;
    }
    
    // generate an absolute file path to the deck source file
    deck.file = source;
    deck.file_path = _.basic.normalizePath(source, input_directory);

    // filter out non-existant slides
    if (!_.basic.isFile(deck.file_path)) {
        _.logger.warn(`Ignored tag <deck id="${id}" src="${source}" /> as the file that does not exist`);
        return invalid_deck;
    }
    
    // check if the slide deck should be set as the active slide deck
    const is_active = tag.attributes.active === 'true' ? true : false;
    if (is_active) META.active_deck = id;

    // count the number of pages in the PDF
    deck.pages = await _.pdf_worker.countPages(deck.file_path);
    
    // determine how to fit the images generated from the deck
    deck.fit = ['cover','contain','fill'].includes(tag.attributes.fit) ? tag.attributes.fit : 'contain';

    // assign deck object to meta
    META.decks[id] = deck;
    _.logger.message(`Initialised slide deck "${source}" (${deck.pages} pages) with the id "${id}"`);
    
    return {
        is_valid : true,
        is_active : is_active
    };
};

/**
 * handles a <lexicon> tag, its attributes and contents
 *
 * @async
 * @function
 * @alias module:parser/meta-parser
 * @category private
 * 
 * @param {Object} tag - element
 */
const handleLexicon = async(tag) => {
    
    if (!tag.attributes) {
        _.logger.warn(`Ignored a <lexicon> tag with no attributes`);
        return;
    }
    
    if (!tag.elements || tag.elements.length === 0) {
        _.logger.warn(`Ignored a <lexicon> tag with no content`);
        return;
    }
    
    // check if an id is defined
    const id = tag.attributes['xml:id'];
    if (!id || id === '') {
        _.logger.warn(`Ignored a <lexicon xml:id="" /> tag with no defined id`);
        return;
    }
    
    // create a lexicon element
    let lexicon = {
        id : id
    };
    
    // assign the alphabet if defined
    if (tag.attributes.alphabet) {
        lexicon.alphabet = tag.attributes.alphabet;
    }
    
    // go through children to find valid lexemes
    lexicon.lexemes = [];
    tag.elements.forEach(element => {
        
        // ignore any direct children that are not lexemes
        if (element.name !== 'lexeme') return;
        
        // ignore any lexemes with no content
        if (!element.elements || element.elements.length !== 2) {
            _.logger.warn(`Ignored a <lexeme> tag that has not exactly two child tags`);
            return;
        }
        
        // go through the children of the lexeme element
        let lexeme = {};
        element.elements.forEach(content => {
            
            // ignore non-lexicon tags
            if (!['grapheme','phoneme','alias'].includes(content.name)) {
                _.logger.warn(`Ignored tag <${content.name}> as it is not a valid lexicon element`);
                return;
            }
            
            if (!content.elements || content.elements.length === 0) {
                _.logger.warn(`Ignored tag <${content.name}> with no child tags`);
                return;
            }
            
            if (content.elements.length !== 1 || content.elements[0].type !== 'text') {
                _.logger.warn(`Ignored tag <${content.name}> because it can only contain text`);
                return;
            }
            
            if (content.name === 'grapheme') {
                lexeme.grapheme = content.elements[0].text;
            }
            
            if (['phoneme','alias'].includes(content.name)) {
                lexeme.type = content.name;
                lexeme.replacement = content.elements[0].text;
            }
        });
        
        // check if the lexeme is valid and complete
        if (lexeme.grapheme && lexeme.type && lexeme.replacement) {
            
            // look, if a lexeme with the same grapheme already exists in the same lexicon
            // and if so, replace it
            let already_lexeme = lexicon.lexemes.find(lex => lex.grapheme === lexeme.grapheme);
            if (already_lexeme) {
                already_lexeme.type = lexeme.type;
                already_lexeme.replacement = lexeme.replacement;
            }
            // otherwise, push it as a new lexeme
            else {
                lexicon.lexemes.push(lexeme);
            }
        }
        // otherwise, produce a warning
        else {
            _.logger.warn(`Ignored a <lexeme> tag because its content is not valid`);
        }
    });

    if (lexicon.lexemes.length === 0) {
        _.logger.warn(`Ignored tag <lexicon xml:id="${id}"> with no valid lexemes`);
        return;
    }
    
    // assign lexicon object to meta
    META.lexicons.push(lexicon);
    _.logger.message(`Initialised lexicon "${id}" with ${lexicon.lexemes.length} lexemes`);
};



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /**
     * detects the meta information inside the <lecture> element
     *
     * @async
     * @function
     * @alias module:parser/meta-parser
     * @category public
     *
     * @param {string} path - absolute path to a XML file
     * @returns {Promise.<Object>} parsed meta information
     */
    parse : async(path) => {
        
        if (!_.basic.isFile(path, '.xml')) {
            _.logger.error(`Expected a path to an existing XML file, but got ${_.type.of(path)} "${path}"`);
            return;
        }
        
        // get the directory where the input XML file is located
        const input_directory = _.path.dirname(path);
        
        // transform XML string into JSON
        const xml_string = _.fs.readFileSync(path).toString();
        const json = _.xml_converter.xml2json(xml_string);

        // get the XML root element
        const root_tag = json.elements[0];
        if (root_tag.name !== 'lecture') {
            _.logger.error(`Expected <lecture> as the root element, but got <${root_tag.name}>`);
            return;
        }
        
        // reset the META object
        META = {};
        META.info = {
            title : 'No Title'
        };
        META.settings = {};
        META.marks = {};
        META.decks = {};
        META.lexicons = [];
    
        // get specific attributes from <lecture> and save them in the META object
        if (root_tag.attributes) {
            Object.keys(root_tag.attributes)
                .filter(name => ['startmark', 'endmark'].includes(name))
                .forEach(name => {
                    META.marks[name] = root_tag.attributes[name];
                });
        }

        // count certain XML elements
        let info_tags     = 0;
        let settings_tags = 0;
        let deck_elements = 0;
        let active_decks  = 0;

        // go through JSON representation of XML and assigns values to the META object
        await _.basic.forEachAsync(root_tag.elements, async(tag) => {

            // check the name of the tag e.g. "info" = "<info />"
            switch (tag.name) {

                case 'info': {
                    handleInfo(tag);
                    info_tags++;
                    break;
                }

                case 'settings': {
                    handleSettings(tag);
                    settings_tags++;
                    break;
                }

                case 'deck': {
                    const {is_valid, is_active} = await handleDeck(tag, input_directory);
                    if (is_valid) deck_elements++;
                    if (is_active) active_decks++;
                    break;
                }
                    
                case 'lexicon': {
                    // no need to count these, as they may appear in any number
                    handleLexicon(tag);
                    break;
                }
            }
        });

        let errors = [];

        if (info_tags > 1) {
            errors.push(`At most one <info/> tag is allowed inside <lecture>`);
        }

        if (settings_tags > 1) {
            errors.push(`At most one <settings /> tag is allowed inside <lecture>`);
        }

        // test for how many deck elements there are
        if (deck_elements == 0) {
            errors.push(`At least one <deck /> tag is required inside <lecture>`);
        }
        // test for how many active slide decks there are
        else if (active_decks == 0) {
            errors.push(`At least one <deck active="true" /> tag must be set to active`);
        }
        else if (active_decks > 1) {
            errors.push(`Multiple <deck /> tags can't be set as active`);
        }

        // if errors were thrown, don't return data and print them to terminal
        if (errors.length > 0) {
            _.logger.errorMultiple(errors);
            return;
        }
        
        return _.basic.deepCopy(META);
    }
};

module.exports = __public;