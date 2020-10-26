/**
 * @module parser
 * @desc parses the lecture.js XML input
 *
 * @example
 * const _ = {};
 * _.parser = require('/parser/main.js');
 */

'use strict';

/*
 * =======
 * MODULES
 * =======
 */

const _ = {};
_.fs   = require('fs');

// utility scripts
_.basic         = require('../.global/basic-utilities.js');
_.type          = require('../.global/type-tests.js');
_.logger        = require('../.global/logger.js');
_.xml_converter = require('../.global/xml-converter.js');

// other modules making up the parser
_.meta_parser     = require('./meta-parser.js');
_.section_creator = require('./section-creator.js');



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /*
     * PARSING
     */
    
    /**
     * parses the XML input for any meta information and settings
     *
     * @async
     * @function
     * @alias module:parser
     * @category public
     *
     * @param {string} path - absolute path to the input XML file
     * @returns {Promise.<Object>} parsed meta data
     */
    parseMeta : async(path) => {
        
        if (!_.basic.isFile(path, '.xml')) {
            _.logger.error(`Expected a path to an existing XML file, but got ${_.type.of(path)} "${path}"`);
            return;
        }
        
        // gets meta information
        let data = await _.meta_parser.parse(path);
        if (!data) {
            _.logger.error(`Failed parsing meta data`);
            return;
        }
        
        return data;
    },
    
    /**
     * parses a XML string and returns data
     *
     * @async
     * @function
     * @alias module:parser
     * @category public
     *
     * @param {Object} meta - meta data parsed using parseMeta()
     * @param {string} xml_string - XML input
     * @param {string} input_script_dir_path - path to the directory where the input file is located
     * @param {Object} configuration - configuration data
     * @returns {Promise.<Object>} parsed data
     */
    parse : async(meta, xml_string, input_script_dir_path, configuration) => {
        
        if (!_.type.isObject(meta)) {
            _.logger.error(`Expected meta data as a string, but got ${_.type.of(meta)} "${meta}"`);
            return;
        }
        
        if (!_.type.isString(xml_string) || xml_string === '') {
            _.logger.error(`Expected XML input as a string, but got ${_.type.of(xml_string)} "${xml_string}"`);
            return;
        }
        
        if (!_.basic.isDirectory(input_script_dir_path)) {
            _.logger.error(`Expected path to the directory containing the XML input script as a string, but got ${_.type.of(input_script_dir_path)} "${input_script_dir_path}"`);
            return;
        }
        
        // transform XML string into JSON
        let json = _.xml_converter.xml2json(xml_string);
        
        // get the root element
        let root_tag = json.elements[0];
        if (root_tag.name !== 'lecture') {
            _.logger.error(`Expected <lecture> as the root element, but got <${root_tag.name}>`);
            return;
        }
        
        // split the tag and its contents into SSML sections
        _.logger.info(`Defining sections...`);
        let data = await _.section_creator.getSections(
            meta, 
            // wrap the contents in a <speak> tag which is needed for the Text-to-speech API requests
            {elements : [
                {type : 'element', name : 'speak', elements : root_tag.elements}
            ]}, 
            input_script_dir_path, 
            configuration
        );
        if (!data) {
            _.logger.error(`Failed defining sections`);
            return;
        }
        
        if (data.sections.length === 0) {
            _.logger.error(`There was no valid content to be put into sections, so 0 sections were generated`);
            return;
        }
        
        return data;
    }
};

module.exports = __public;