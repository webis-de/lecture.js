/**
 * @module xml_converter
 * @desc works with XML and can convert it to a JSON representation and vice versa
 *
 * @example
 * const _ = {};
 * _.xml_converter = require('/.global/xml-converter.js');
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
_.type   = require('../.global/type-tests.js');
_.logger = require('../.global/logger.js');

// npm modules
_.xml_parser = require('xml-js');



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /*
     * VALIDATION
     */
    
    /**
     * checks if a string is valid XML content
     * 
     * @function
     * @alias module:xml_converter
     * @category public
     * 
     * @param {string} xml - valid XML file contents
     * @returns {Object} JSON representation
     *
     * @example
     * isValidXML(`<a>test</a>`); // output: true
     * isValidXML(`test`); // output: false
     */
    isValidXML : xml => {
        
        if (!_.type.isString(xml)) {
            return false;
        }
        
        try {
            const parsed = __public.xml2json(xml);
        }
        catch (err) {
            return false;
        }
        
        return true;
    },
    
    
    
    /*
     * TESTING
     */
    
    /**
     * counts the characters taken by XML elements in an XML string
     * 
     * @function
     * @alias module:xml_converter
     * @category public
     * 
     * @param {string} xml - valid XML file contents
     * @returns {Object} JSON representation
     *
     * @example
     * countXMLCharacters(`<a>test</a>`); // output: 7
     * countXMLCharacters(`<ab c="d">test<b></b>test</a>`); // output: 21
     */
    countXMLCharacters : xml => {
        
        if (!_.type.isString(xml)) {
            _.logger.error(`Expected XML as a string, but got ${_.type.of(xml)} "${xml}"`);
            return;
        }
        
        const no_tags = xml.replace(/<.*?>/g, '');
        return xml.length - no_tags.length;
    },
    
    
    
    /*
     * CONVERSION
     */

    /**
     * converts XML to a JSON representation
     * 
     * @function
     * @alias module:xml_converter
     * @category public
     * 
     * @param {string} xml - valid XML file contents
     * @returns {Object} JSON representation
     */
    xml2json : xml => {
        
        if (!_.type.isString(xml) || xml === '') {
            _.logger.error(`Expected XML as a string, but got ${_.type.of(xml)} "${xml}"`);
            return;
        }
        
        let json = _.xml_parser.xml2json(xml, {
            // documentation: 
            //   https://www.npmjs.com/package/xml-js#user-content-convert-xml-%E2%86%92-js-object--json
            compact           : false,
            ignoreDeclaration : true,
            ignoreInstruction : true,
            ignoreComment     : true,
            ignoreCdata       : true,
            ignoreDoctype     : true,
            spaces            : 2
        });
        
        return JSON.parse(json);
    },

    /**
     * converts a valid JSON representation back to XML data
     *
     * @function
     * @alias module:xml_converter
     * @category public
     *
     * @param {Object} json - valid JSON representation of an XML file
     * @param {boolean} [raw=false] - if set to true, directly uses library to convert - if set to false, will make additional small adjustments
     * @returns {string} XML content
     */
    json2xml : (json, raw = false) => {
        
        if (!_.type.isObject(json)) {
            _.logger.error(`Expected JSON representation as an object, but got ${_.type.of(json)} "${json}"`);
            return;
        }
        
        let xml = _.xml_parser.json2xml(json, {
            // documentation: 
            //   https://www.npmjs.com/package/xml-js#user-content-convert-js-object--json-%E2%86%92-xml
            compact : false,
            spaces  : 0
        });
        
        // fix newlines being added in front of certain tags
        if (!raw) {
            xml = xml.replace(/([\n\r\s\t]+)(<(mark|s|token|w|emphasis|break|prosody|say-as|sub|lang|phoneme|amazon:domain|amazon:effect|amazon:emotion)>)/g, ' $2');
        }
        
        return xml;
    }
};

module.exports = __public;