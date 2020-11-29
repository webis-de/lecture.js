/**
 * @module parser/section-creator
 * @desc splits the LSML content into sections that can be sent to the Text-to-speech APIs
 *
 * @example
 * const _ = {};
 * _.section_creator = require('/parser/section-creator.js');
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
_.os   = require('os');

// utility scripts
_.basic         = require('../.global/basic-utilities.js');
_.type          = require('../.global/type-tests.js');
_.logger        = require('../.global/logger.js');
_.timestamp     = require('../.global/timestamp.js');
_.xml_converter = require('../.global/xml-converter.js');

// lecture.js modules
_.tts = require('../text-to-speech/main.js');



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

const EOL = _.os.EOL;

// defines the character limits for each API
// https://cloud.google.com/speech-to-text/quotas
const GOOGLE_CHAR_LIMIT = 5000;
// https://aws.amazon.com/about-aws/whats-new/2018/03/amazon-polly-increases-character-limits/
// 3000 billed (text) chars max, + 3000 further non-billed (ssml) characters 
const AMAZON_TEXT_CHAR_LIMIT = 3000;
const AMAZON_SSML_CHAR_LIMIT = 3000;




/*
 * ===========
 * DEFINITIONS
 * ===========
 */

// path to the directory where the input script (XML) is
let INPUT_SCRIPT_DIR_PATH = '';
        
// tags at which to split the LSML into sections
let SPLIT_TAGS = [
    'voice',
    'slide',
    'video',
    'image',
    'audio',
    'mark'
];

// holds all generated sections
let SECTIONS = [];
// holds references to all video resources
let VIDEO_RESOURCES = [];
// holds references to all image resources
let IMAGE_RESOURCES = [];
// holds references to all audio resources
let AUDIO_RESOURCES = [];
// holds references to all marks
let MARKS = {};
// holds references to all chapters
let CHAPTERS = [];

// object that holds information about the section that is currently being created
// it's a state object which means the data it holds is updated while the LSML code is processed
const CURRENT = {
    // numbering of the sections
    id : 1,
    // holds the name of the currently active voice 
    voice : '',
    // information about the frame of the current section
    frame_type : '', // possible types: slide, video, image
    frame_fit : '', // how to fit the current frame to the video resolution
    // file path to the currently active image (only from <image> tags)
    image_id : '',
    // if CURRENT.frame_type is set to 'slide', the current frame of the section is taken from a slide deck (PDF document)
    slide_deck : '', // id of current slide deck
    page : 0,
    // if CURRENT.frame_type is set to 'video' the last frame of it
    // remains after the video stopped playing as the next active frame
    video : '', // path to the video out of which the current frame is taken
    // contains the SSML tags and text that should be included in the currently processed section
    content : {
        elements : []
    }
};



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * returns the data about the current frame that should be rendered the given section
 *
 * @function
 * @alias module:parser/section-creator
 * @category private
 *
 * @returns {Object} image frame information
 */
const getFrame = () => {
    
    let frame = {
        type : CURRENT.frame_type
    };
    
    switch (CURRENT.frame_type) {
            
        case 'slide': {
            frame.deck = CURRENT.slide_deck;
            frame.page = CURRENT.page;
            frame.fit  = CURRENT.frame_fit;
            break;
        }
            
        case 'image': {
            frame.id  = CURRENT.image_id;
            frame.fit = CURRENT.frame_fit;
            break;
        }
            
        case 'video': {
            frame.video_id = CURRENT.video_id;
            frame.video_variant = CURRENT.video_variant;
            break;
        }
    }
    
    return frame;
};

/**
 * adds a new SSML section with the given 'current' parameters to the sections array
 *
 * @function
 * @alias module:parser/section-creator
 * @category private
 */
const addSSMLsection = () => {
    
    // search the nested JSON for at least one occurence of a type=text key value pair
    if (!_.basic.hasKeyValuePair(CURRENT.content, 'type', 'text')) return;
    
    // generate section content
    const section = {
        id      : CURRENT.id,
        type    : 'ssml',
        frame   : getFrame(),
        voice   : CURRENT.voice,
        content : _.basic.removeSpacesAfterNewlines(_.xml_converter.json2xml(CURRENT.content))
    };
    
    // add section to array
    _.logger.message(`Defined section ${CURRENT.id} with voice "${CURRENT.voice}" and frame type "${section.frame.type}"`);
    SECTIONS.push(section);
    
    // prepare new section
    CURRENT.id++;
    clearCurrentContent();
};

/**
 * adds a new (audio, image or video) resource section to the sections array
 *
 * @function
 * @alias module:parser/section-creator
 * @category private
 * 
 * @param {Object} tag - either a <video>, <image> or <audio> element
 */
const addResourceSection = (meta, tag) => {
    
    let file = tag.attributes.src;
    
    if (!file || file == '') {
        _.logger.warn(`Ignored a <${tag.name} src="" /> tag with no defined file`);
        return;
    }
    
    // transform the file path to be absolute
    const resource_path = _.basic.normalizePath(file, INPUT_SCRIPT_DIR_PATH);
    
    if (!_.basic.isFile(resource_path)) {
        _.logger.warn(`Ignored tag <${tag.name} src="${file}" /> as the file does not exist at "${resource_path}"`);
        return;
    }
    
    let section = {
        // set id, increase it by 1 for every section
        id : CURRENT.id,
        // type is either 'video' or 'audio'
        type  : tag.name
    };
    
    // set a reference to the array holding the resource, 
    // depending on the type of resource
    let resource_array = [];
    switch (tag.name) {
        case 'video': resource_array = VIDEO_RESOURCES; break;
        case 'audio': resource_array = AUDIO_RESOURCES; break;
        default: {
            _.logger.error(`Resource type "${tag.name}" does not exist`);
            return;
        }
    }
    
    // check if the resource was not already used previously in the script
    let resource = resource_array.find(resource => resource.path === resource_path);
    
    // if it does not yet exist, create one
    if (!resource) {
        resource = {
            id : resource_array.length,
            path : resource_path,
            variants : {}
        };
        resource_array.push(resource);
    }
    
    // check if the timestamp attributes on the element are valid
    const validBeginTimestamp = _.timestamp.isValid(tag.attributes.clipBegin);
    const validEndTimestamp = _.timestamp.isValid(tag.attributes.clipEnd);
    
    // convert the timestamp to total milliseconds 
    const beginTimestampMs = validBeginTimestamp ? _.timestamp.parse(tag.attributes.clipBegin).milliseconds_total : 0;
    const endTimestampMs = validEndTimestamp ? _.timestamp.parse(tag.attributes.clipEnd).milliseconds_total : 0;

    // cancel if clipEnd timestamp is greater than clipBegin
    if (
        validBeginTimestamp && validEndTimestamp &&
        (beginTimestampMs >= endTimestampMs)
    ) {
        _.logger.warn(`Ignored tag <${tag.name} src="${file} clipBegin="${tag.attributes.clipBegin}" clipEnd="${tag.attributes.clipEnd}" />, because the start time stamp is equal or greater than the end time stamp`);
        return;
    }
    
    // default trim values, correspond to the beginning and end timestamp of the resource
    // may be replaced with fixed timestamps in the sections below
    let clipBegin = 'START';
    let clipEnd = 'END';
    
    // set clipBegin time, if the attribute is provided with at least at 1 millisecond or later
    if (validBeginTimestamp && beginTimestampMs > 0) {
        clipBegin = _.timestamp.convertToFFmpeg(tag.attributes.clipBegin);
    }

    // set clipEnd time, if an end time is provided on the tag
    if (endTimestampMs && validEndTimestamp > 0) {
        clipEnd = _.timestamp.convertToFFmpeg(tag.attributes.clipEnd);
    }

    // generate an ID for the video variant
    const variant = `${clipBegin}-${clipEnd}` + (tag.name === 'video' ? `-`+(tag.attributes.fit ? tag.attributes.fit : 'contain') : '');
    
    // save a reference to the variant
    const resource_ref = {
        path : null,
        clipBegin : clipBegin,
        clipEnd : clipEnd
    };
    if (tag.name === 'video') {
        resource_ref.fit = tag.attributes.fit ? tag.attributes.fit : 'contain';
    }
    resource.variants[variant] = resource_ref;
    
    // if the resource is a video
    if (tag.name == 'video') {
        
        // last frame of a video may stay visible as the active frame for the coming sections
        if (tag.attributes.keepFrame === 'true' || 
            (tag.attributes.keepFrame === undefined && meta.settings.defaultKeepFrame)
        ) {
            // set the video end frame as the active frame
            CURRENT.frame_type = 'video';
            CURRENT.video_id = resource.id;
            CURRENT.video_variant = variant;
        }
        
        // reference the resource in the section
        section.video_id = resource.id;
        section.video_variant = variant;
    }
    // otherwise, it must be an audio resource
    else {
        // get information about the frame that should be displayed while the audio is playing
        section.frame = getFrame();
        
        // define the (possibly) trimmed resource in the section
        section.audio_id = resource.id;
        section.audio_variant = variant;
    }

    // set the speed for the resource
    if (
        _.type.isString(tag.attributes.speed) && 
        tag.attributes.speed.match(/^([5-9][0-9]|1[0-9][0-9]|200)%$/)
    ) {
        // get only the number without the unit
        section.speed = parseInt(tag.attributes.speed.match(/^[0-9]+/)[0]);
    }

    // set the sound level/volume for the resource
    if (
        _.type.isString(tag.attributes.soundLevel) && 
        tag.attributes.soundLevel.match(/^(\+|\-)[0-9]{1,2}dB$/)
    ) {
        section.soundLevel = tag.attributes.soundLevel;
    }

    // set the repeat count for the resource
    const repeatCount = parseInt(tag.attributes.repeatCount)
    if (
        _.type.isInteger(tag.attributes.repeatCount) &&
        !isNaN(repeatCount) &&
        repeatCount > 0
    ) {
        section.repeatCount = repeatCount;
    }
    
    // add section to array
    _.logger.message(`Defined section ${CURRENT.id} playing ${tag.name} file "${_.path.basename(file)}"`);
    SECTIONS.push(section);
    
    // prepare new section
    CURRENT.id++;
    clearCurrentContent();
};

/**
 * clears the current content array of all SSML elements and text nodes from the previous section (except for all parent elements needed for the next section)
 *
 * @function
 * @alias module:parser/section-creator
 * @category private
 */
const clearCurrentContent = () => {
    
    let current = CURRENT.content.elements[CURRENT.content.elements.length - 1];
    
    while (true) {
        // go to the last element of the current layer of the tree
        if (
            current.elements && current.elements.length > 0 &&
            current.elements[current.elements.length-1].elements && current.elements[current.elements.length-1].elements.length > 0
        ) {
            // only keep the immediate parent and remove all other elements from the layer
            current.elements = [
                current.elements[current.elements.length-1]
            ];
            current = current.elements[0];
        }
        else {
            current.elements = [];
            return;
        }
    }
};

/**
 * adds an SSML element or text node to CURRENT.content array
 *
 * @function
 * @alias module:parser/section-creator
 * @category private
 * 
 * @param {Object} tag - SSML element or text node to insert
 * @param {Object} depth - depth at which to insert the element into the multi-layered 'current content' array
 */
const addElementToContent = (tag, depth) => {
    
    // create shallow copy of the element
    let copy_elem = Object.assign({}, tag);
    if (copy_elem.elements) {
        copy_elem.elements = [];
    }
    
    // if current content is currently empty, just push the element inside
    if (CURRENT.content.elements.length == 0) {
        CURRENT.content.elements.push(copy_elem);
        return;
    }
    
    // loop through content until you find the last entry
    let current = CURRENT.content.elements[CURRENT.content.elements.length - 1];
    while (depth > 1) {
        depth--;
        current = current.elements[current.elements.length - 1];
    }
    
    // append element copy to last entry
    current.elements.push(copy_elem);
};

/**
 * goes recursively through the JSON and splits it into sections at specific tags
 *
 * @async
 * @function
 * @alias module:parser/section-creator
 * 
 * @param {Object} meta - meta information
 * @param {Object} json - JSON representation of the XML data
 */
const startLoop = async(meta, json) => {
 
    // loops through a layer of the nested JSON
    const loopElements = async(json, depth) => {

        if (depth == undefined) {
            depth = 0;
        }
        
        // if a mark tag with the id referenced in the endmark attribute is reached
        // don't continue adding any new sections
        let endmark_reached = false;

        await _.basic.forEachAsync(json.elements, async(tag) => {
            
            // ignore everything after the text mark
            if (endmark_reached) {
                return;
            }
            
            // ignore meta tags
            if (
                tag.type === 'element' && 
                ['info','settings','deck','lexicon'].includes(tag.name)
            ) {
                return;
            }

            if (tag.type == 'text') {
                addElementToContent(tag, depth);
                return;
            }
            else if (tag.type !== 'element') {
                return;
            }

            let split_at_tag = SPLIT_TAGS.includes(tag.name);

            let voice = CURRENT.voice;

            if (split_at_tag) {

                addSSMLsection();

                switch (tag.name) {
                        
                    case 'video':
                    case 'audio': {
                        addResourceSection(meta, tag);
                        return;
                    }
                    
                    case 'mark': {
                        
                        if (!tag.attributes || !tag.attributes.name || tag.attributes.name == '') {
                            _.logger.warn(`Ignored a <mark name=""> tag with no defined name`);
                            break;
                        }
                        
                        if (MARKS[tag.attributes.name]) {
                            _.logger.warn(`Ignored <mark name="${tag.attributes.name}"> tag because a mark with the same name already exists`);
                            break;
                        }
                        
                        // if the given mark is a startmark, reset sections created beforehand
                        if (tag.attributes.name == meta.marks.startmark) {
                            SECTIONS = [];
                            CHAPTERS = [];
                            MARKS = {};
                            CURRENT.id = 1;
                            
                            _.logger.info(`Resetting sections as the referenced start mark <mark name="${meta.marks.startmark}"> was encountered...`);
                        }
                        
                        // save a reference to the mark
                        MARKS[tag.attributes.name] = {
                            section : CURRENT.id
                        };

                        // if a chapter name is defined
                        if (tag.attributes.chapter) {
                            // save reference to the chapter
                            CHAPTERS.push({
                                title   : tag.attributes.chapter,
                                mark    : tag.attributes.name,
                                section : CURRENT.id
                            });
                        }

                        // if the given mark is an endmark, ignore all sections after it
                        if (tag.attributes.name == meta.marks.endmark) {
                            endmark_reached = true;
                            
                            _.logger.info(`End mark <mark name="${meta.marks.endmark}"> was reached`);
                        }
                        
                        break;
                    }
                        
                    case 'voice': {
                        
                        if (!tag.attributes.name || tag.attributes.name == '') {
                            _.logger.warn(`Ignored a <voice name=""> tag with no defined voice name`);
                            break;
                        }
                        
                        if (!(await _.tts.voiceExists(tag.attributes.name))) {
                            _.logger.warn(`Ignored tag <voice name="${tag.attributes.name}">, because voice "${tag.attributes.name}" does not exist`);
                            break;
                        }
                        
                        CURRENT.voice = tag.attributes.name;
                        break;
                    }
                        
                    case 'image': {
                        
                        if (!tag.attributes || !tag.attributes.src) {
                            _.logger.warn(`Ignored an <image src=""> tag with no defined image file`);
                            break;
                        }
    
                        // transform the file path to be absolute
                        const image_path = _.basic.normalizePath(tag.attributes.src, INPUT_SCRIPT_DIR_PATH);
                        
                        if (!_.basic.isFile(image_path)) {
                            _.logger.warn(`Ignored an <image src="${tag.attributes.src}"> tag because the image file does not exist`);
                            break;
                        }
                        
                        // add a new image resource, if the same image file was not yet used previously
                        let resource = IMAGE_RESOURCES.find(image => image.path === image_path);
                        if (!resource) {
                            resource = {
                                id : IMAGE_RESOURCES.length,
                                path : image_path
                            };
                            IMAGE_RESOURCES.push(resource);
                        }
                        
                        CURRENT.frame_type = 'image';
                        CURRENT.image_id = resource.id;
                        CURRENT.frame_fit = ['cover','contain','fill'].includes(tag.attributes.fit) ? tag.attributes.fit : 'contain';
                        break;
                    }
                        
                    case 'slide': {
                        
                        if (!tag.attributes) {
                            _.logger.warn(`Ignored a <slide/> tag with no attributes`);
                            break;
                        }
                        
                        // set the new page on the given slide deck
                        if (!tag.attributes.page || tag.attributes.page == '') {
                            _.logger.warn(`Ignored a <slide page="..." /> element without a defined page`);
                            break;
                        }
                        
                        // set the new active slide deck
                        if (tag.attributes.deck && tag.attributes.deck !== '') {
                            if (!meta.decks[tag.attributes.deck]) {
                                _.logger.warn(`Ignored change to slide deck "${tag.attributes.deck}" as it was not initialised inside <lecture>`);
                                break;
                            }
                            CURRENT.slide_deck = tag.attributes.deck;
                        }
                        
                        // set frame type to slide
                        CURRENT.frame_type = 'slide';
                        CURRENT.frame_fit = ['cover','contain','fill'].includes(tag.attributes.fit) ? 
                                    tag.attributes.fit : 
                                    (tag.attributes.deck ? 
                                        meta.decks[tag.attributes.deck].fit :
                                        meta.decks[CURRENT.slide_deck].fit
                                    );
                            
                        // get the total number of pages the PDF has
                        let max_pages = meta.decks[CURRENT.slide_deck].pages;

                        // go through the types of page values
                        switch (tag.attributes.page) {

                            case 'next': {
                                // increase the page number, if the current slide deck has enough pages
                                CURRENT.page = CURRENT.page+1 >= max_pages ? max_pages : CURRENT.page+1;
                                break;
                            }

                            case 'previous': {
                                // reduce to at most page 1
                                CURRENT.page = CURRENT.page > 1 ? CURRENT.page - 1 : CURRENT.page;
                                // if only the slide deck changed,
                                // check if the current slide has enough pages
                                CURRENT.page = CURRENT.page > max_pages ? max_pages : CURRENT.page;
                                break;
                            }

                            case 'current': {
                                // if only the slide changed, 
                                // check if the current slide has enough pages
                                CURRENT.page = CURRENT.page > max_pages ? max_pages : CURRENT.page;
                                break;
                            }

                            case 'first': {
                                CURRENT.page = 1;
                                break;
                            }

                            case 'last': {
                                CURRENT.page = max_pages;
                                break;
                            }

                            default: {
                                
                                // check if page is defined as an integer
                                if (tag.attributes.page.match(/^[0-9]+$/)) {
                                    CURRENT.page = parseInt(tag.attributes.page);
                                    // check if the current slide has enough pages
                                    CURRENT.page = CURRENT.page > max_pages ? max_pages : CURRENT.page;
                                }
                                // check if page is defined relatively, e.g., "+3" or "-2"
                                else if (tag.attributes.page.match(/^(\+|\-)[0-9]+$/)) {
                                    CURRENT.page += parseInt(tag.attributes.page);

                                    // fix bad additions and multiplications
                                    if (CURRENT.page <= 1) {
                                        CURRENT.page = 1;
                                    }
                                    else if (CURRENT.page > max_pages) {
                                        CURRENT.page = max_pages;
                                    }
                                }
                                // if it does not match, give warning
                                else {
                                    _.logger.warn(`Ignored <slide page="${tag.attributes.page}"/> change as the page value is not valid`);
                                }
                                break;
                            }
                        }
                            
                        break;
                    }
                }
            }
            else {
                addElementToContent(tag, depth);
            }

            if (tag.elements) {
                await loopElements(tag, (tag.name == 'voice' ? depth : depth+1));
            }

            // reset values after leaving the inner elements
            if (split_at_tag && tag.elements) {

                addSSMLsection();

                // reset voice to original voice set before the current <voice> tag
                if (tag.name == 'voice') {
                    CURRENT.voice = voice;
                }
            }
        });
    }
    
    await loopElements(json, 0);
    addSSMLsection();
};



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /**
     * parses a string of XML
     *
     * @async
     * @function
     * @alias module:parser/section-creator
     * @category public
     * 
     * @param {Object} meta - meta information
     * @param {Object} json - JSON representation of the XML data
     * @param {string} input_script_dir_path - path to the directory where the input file is located
     * @param {Object} configuration - configuration data
     * @returns {Promise.<Object>} parsed data
     */
    getSections : async(meta, json, input_script_dir_path, configuration) => {
        
        // globally save path to the directory where the input XML file is located
        INPUT_SCRIPT_DIR_PATH = input_script_dir_path;

        // reset temporary values
        SECTIONS             = [];
        CURRENT.id           = 1;
        CURRENT.voice        = meta.settings.voice ? meta.settings.voice : configuration.audio.defaultVoice;
        CURRENT.frame_type   = 'slide';
        CURRENT.frame_fit    = meta.decks[meta.active_deck].fit;
        CURRENT.image_id     = '';
        CURRENT.slide_deck   = meta.active_deck;
        CURRENT.page         = 1;
        CURRENT.video_id     = '';
        CURRENT.video_variant = '';
        CURRENT.content      = {elements:[]};
        
        // start parsing loop
        await startLoop(meta, json);
        
        // go through chapters and remove those added for sections that don't exist
        // (this may happen if the chapter is defined as the last tag with no content following it)
        for (let i = 0, len = CHAPTERS.length; i < len; i++) {
            let chapter = CHAPTERS[i];
            let keep_chapter = false;
            SECTIONS.forEach(section => {
                if (chapter.section === section.id) keep_chapter = true;
            });
            // if chapter belongs to a non-existant section
            if (!keep_chapter) {
                // remote it
                CHAPTERS = _.basic.removeArrayIndex(CHAPTERS, i);
                i--;
                len = CHAPTERS.length;
            }
        }
        
        _.logger.message(`Checking if all sections conform to character limits set by the text-to-speech APIs`);
        
        // check if all sections obey the character limit of the APIs
        let failed_sections = 0;
        await _.basic.forEachAsync(SECTIONS, async(section) => {
            
            // only need to check sections with SSML content
            if (section.type !== 'ssml') return;
            
            // from the voice, get which API will be used to render the SSML content
            const voice_api = await _.tts.getVoiceAPI(section.voice);
            
            // check for Google character limits
            if (
                voice_api === 'google-cloud' &&
                section.content.length > GOOGLE_CHAR_LIMIT
            ) {
                failed_sections++;
                _.logger.message(`Section ${section.id}:` + EOL + section.content);
                _.logger.error(`Section ${section.id} is too long for Google Cloud TTS' API: ${section.content.length} > ${GOOGLE_CHAR_LIMIT} (limit) | ${(section.content.length - GOOGLE_CHAR_LIMIT)} (difference)`
                );
        
                return;
            }
            
            // check for Amazon character limits
            const ssml_characters = _.xml_converter.countXMLCharacters(section.content);
            const text_characters = section.content.length - ssml_characters;
            if (
                voice_api === 'amazon-polly' &&
                (
                    ssml_characters > AMAZON_SSML_CHAR_LIMIT ||
                    text_characters > AMAZON_TEXT_CHAR_LIMIT
                )
            ) {
                failed_sections++;
                
                // generate an error message
                let error_message = `Section ${section.id} is too long for Amazon Polly's API!`;
                
                if (ssml_characters > AMAZON_SSML_CHAR_LIMIT) {
                    error_message += EOL + `Cause: Too many SSML tags. ${ssml_characters} > ${AMAZON_SSML_CHAR_LIMIT} (SSML character limit) | ${(ssml_characters - AMAZON_SSML_CHAR_LIMIT)} (difference)`;
                }
                
                if (text_characters > AMAZON_TEXT_CHAR_LIMIT) {
                    error_message += EOL + `Cause: Too much text. ${text_characters} > ${AMAZON_TEXT_CHAR_LIMIT} (Text character limit, excluding SSML characters) | ${(text_characters - AMAZON_TEXT_CHAR_LIMIT)} (difference)`;
                }
                
                _.logger.message(`Section ${section.id}:` + EOL + section.content);
                _.logger.error(error_message);
                return;
            }
        });
        
        // if any generated section is too long, print a warning and exit
        if (failed_sections === 0) {
            _.logger.message(`All generated sections are within character limits set by the APIs`);
        }
        else {
            _.logger.info(`HOW TO FIX: Please shorten ` + (failed_sections === 1 ? 'the section' : `these ${failed_sections} sections`) + ` of text listed above because ` + (failed_sections === 1 ? 'it is' : `they are`) + ` TOO LONG! Instead, you can also just easily split sections up! Just put one or more <mark name="..."> elements in your input script at the location of the section. At each <mark> element, the section will be split into two new sections!`);
            return;
        }
        
        // return section information
        return {
            sections        : SECTIONS,
            video_resources : VIDEO_RESOURCES,
            image_resources : IMAGE_RESOURCES,
            audio_resources : AUDIO_RESOURCES,
            marks           : MARKS,
            chapters        : CHAPTERS
        };
    }
};

module.exports = __public;