/**
 * @module validator
 * @desc validates the LSML input using a XSD schema
 *
 * @example
 * const _ = {};
 * _.validator = require('/validator/main.js');
 */

'use strict';

/*
 * =======
 * MODULES
 * =======
 */

const _ = {};
_.fs            = require('fs');
_.path          = require('path');
_.child_process = require('child_process');

// utility scripts
_.basic         = require('../.global/basic-utilities.js');
_.type          = require('../.global/type-tests.js');
_.logger        = require('../.global/logger.js');
_.xml_converter = require('../.global/xml-converter.js');



/*
 * =========
 * CONSTANTS
 * =========
 */

// path to the Xerces Java wrapper
const XJPARSE_PATH = _.path.join(__dirname, 'xjparse-app-3.0.0.jar');
// directory in which temporary files may be placed
const TEMP_DIR = _.path.join(__dirname, '.temp');



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

// default URI path of the XSD schema
let SCHEMA_PATH = _.path.join(__dirname, 'schema.xsd');



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * calls the XJParse library with a given XML file and XSD schema
 *
 * @async
 * @function
 * @alias module:validator
 * @category private
 *
 * @returns {string} file path
 * @returns {Promise.<Object>} output from the library
 *
 * @example
 * await callXJParse(xml_file_path, schema_file_path);
 * // output:
 * // {
 * //   error  : null,
 * //   stdout : '...',
 * //   stderr : '...'
 * // }
 */
const callXJParse = async(xml_file, schema) => {
        
    if (!_.basic.isFile(xml_file, '.xml')) {
        _.logger.error(`Expected a path to an existing XML file as a string, but got ${_.type.of(xml_file)} "${xml_file}"`);
        return;
    }

    if (!_.basic.isFile(schema, '.xsd')) {
        _.logger.error(`Expected a path to an existing XSD file as a string, but got ${_.type.of(schema)} "${schema}"`);
        return;
    }
            
    const command = `java -jar "${XJPARSE_PATH}" -f -S "${schema}" "${xml_file}"`;
    
    return new Promise(resolve => {
        _.child_process.exec(command, (error, stdout, stderr) => {
            resolve({
                error : error,
                stdout : stdout,
                stderr : stderr
            });
        });
    });
};



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /*
     * GETTER
     */
    
    /**
     * gets the path to the XSD schema used by the validator
     *
     * @function
     * @alias module:validator
     * @category public
     *
     * @returns {string} file path
     */
    getSchemaPath : () => {
        return SCHEMA_PATH;
    },
    
    
    
    /*
     * UTILITY
     */
    
    /**
     * clears all temporary files created by the validator that are still present
     *
     * @function
     * @alias module:validator
     * @category public
     */
    clearTemporaryFiles : () => {
        _.basic.clearDirectory(TEMP_DIR, {
            ignore_files : ['.gitignore']
        });
    },
    
    
    
    /*
     * VALIDATION
     */
    
    /**
     * validates an input LSML file
     *
     * @async
     * @function
     * @alias module:validator
     * @category public
     *
     * @param {Object} options
     * @param {string} options.xml_path - absolute path to the XML file
     * @param {boolean} [options.print_errors=true] - if set to true, will print validation errors
     * @param {boolean} [options.print_results=true] - if set to true, will print message the including validation result
     * @param {boolean} [options.keep_temp_files=false] - if set to true, will keep temporary XML files generated for validation, if the validation fails with an error
     * @returns {Promise.<boolean>} true if the LSML file is valid
     */
    validate : async(options) => {
        
        // required parameters
        
        if (!_.type.isObject(options)) {
            _.logger.error(`Expected options as an object, but got ${_.type.of(options)} "${options}"`);
            return;
        }
        
        if (!_.basic.isFile(options.xml_path, '.xml')) {
            _.logger.error(`Expected path to an existing XML file as a string, but got ${_.type.of(options.xml_path)} "${options.xml_path}"`);
            return;
        }
        
        if (!_.basic.isFile(SCHEMA_PATH, '.xsd')) {
            _.logger.error(`Path "${SCHEMA_PATH}" does not lead to an existing XSD schema file`);
            return;
        }
        
        // optional parameters
        
        const print_errors = options.print_errors === undefined ? true : options.print_errors;
        if (options.print_errors !== undefined && !_.type.isBoolean(options.print_errors)) {
            _.logger.error(`Expected options.print_errors as a boolean, but got ${_.type.of(options.print_errors)} "${options.print_errors}"`);
            return;
        }
        
        const print_results = options.print_results === undefined ? true : options.print_results;
        if (options.print_results !== undefined && !_.type.isBoolean(options.print_results)) {
            _.logger.error(`Expected options.print_results as a boolean, but got ${_.type.of(options.print_results)} "${options.print_results}"`);
            return;
        }
        
        const keep_temp_files = options.keep_temp_files === undefined ? false : options.keep_temp_files;
        if (options.keep_temp_files !== undefined && !_.type.isBoolean(options.keep_temp_files)) {
            _.logger.error(`Expected options.keep_temp_files as a boolean, but got ${_.type.of(options.keep_temp_files)} "${options.keep_temp_files}"`);
            return;
        }
        
        // ------------
        
        // convert the XML input file to JSON
        let xml = _.fs.readFileSync(options.xml_path).toString();
        let json = _.xml_converter.xml2json(xml);
        
        // get the root element of the XML
        if (!json.elements || json.elements.length === 0) {
            print_errors && _.logger.error(`Input XML file has no root element`);
            return false;
        }
        let root_tag = json.elements[0];
        
        // add attributes to the XML root element that are required for the XSD schema to work
        if (!root_tag.attributes) {
            root_tag.attributes = {};
        }
        root_tag.attributes.xmlns = `https://example.com/lecture.js`;
        root_tag.attributes['xmlns:xsi']=`http://www.w3.org/2001/XMLSchema-instance`;
        
        // write the manipulated JSON into a temporary XML file
        xml = _.xml_converter.json2xml(json);
        const temp_file_path = _.path.join(TEMP_DIR, `temp-xml-${_.basic.getUUIDv4()}.xml`);
        _.fs.writeFileSync(temp_file_path, xml);
        
        // validate the input XML
        let result = await callXJParse(temp_file_path, SCHEMA_PATH);
        
        // check for a successful validation
        let is_valid = false;
        if (!result.error || result.error.code === 0) {
            print_results && _.logger.message(result.stdout.trim());
            is_valid = true;
        }
        
        // delete the temporary XML file again on successful validation
        // (if validation failed, file may be kept depending on setting)
        if (
            _.basic.isFile(temp_file_path) &&
            (is_valid === true || !keep_temp_files) 
        ) {
            _.fs.unlinkSync(temp_file_path);
        }
        
        // return true for a successful validation
        if (is_valid) return true;
        
        // generate an error message
        if (print_errors) {
            let error = '';

            // primary error
            if (result.error) {
                if (result.error.code == 1) {
                    error = result.stdout.trim();
                }
                else {
                    error = result.error.message.trim();
                }
            }
            // secondary error
            else if (result.stderr) {
                error = result.stderr.trim();
            }
            // should not reach here, but okay
            else {
                error = `Failed validating XML file "${options.xml_path}" with schema "${SCHEMA_PATH}", because of an unknown error`;
            }

            // print error message
            _.logger.error(error);
        }
        
        return false;
    }
};

module.exports = __public;