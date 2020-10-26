/**
 * @module video_manager
 * @desc manages acceptable parameters for video file generation
 *
 * @example
 * const _ = {};
 * _.video = require('/video-manager/main.js');
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



/*
 * =========
 * CONSTANTS
 * =========
 */

// limits for FPS
const UPPER_LIMIT_FPS = 120;
const LOWER_LIMIT_FPS = 10;

// limits for video resolution
const UPPER_LIMIT_WIDTH = 3840;
const LOWER_LIMIT_WIDTH = 128;
const UPPER_LIMIT_HEIGHT = 2160;
const LOWER_LIMIT_HEIGHT = 72;



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
     * checks if a given value is a valid video width
     *
     * @function
     * @alias module:video_manager
     * @category public
     * 
     * @param {integer} value
     * @returns {boolean} true if the value is a valid width
     */
    isValidWidth : value => {
        
        return _.type.isInteger(value) && 
               value % 2 === 0 &&
               value >= LOWER_LIMIT_WIDTH && 
               value <= UPPER_LIMIT_WIDTH;
    },
    
    /**
     * checks if a given value is a valid video height
     *
     * @function
     * @alias module:video_manager
     * @category public
     *
     * @param {integer} value
     * @returns {boolean} true if the value is a valid height
     */
    isValidHeight : value => {
        
        return _.type.isInteger(value) && 
               value % 2 === 0 &&
               value >= LOWER_LIMIT_HEIGHT && 
               value <= UPPER_LIMIT_HEIGHT;
    },
    
    /**
     * checks if a given value is a valid resolution
     *
     * @function
     * @alias module:video_manager
     * @category public
     *
     * @param {string} value - resolution, e.g., "1280x720"
     * @returns {boolean} true if the value is a valid resolution
     */
    isValidResolution : value => {
        
        if (!_.type.isString(value) || !value.match(/^[0-9]+x[0-9]+$/)) {
            return false;
        }
        
        const resolution = __public.parseResolutionString(value);
        
        return __public.isValidWidth(resolution.width) && 
               __public.isValidHeight(resolution.height);
    },
    
    /**
     * checks if a given value is a valid FPS value
     *
     * @function
     * @alias module:video_manager
     * @category public
     *
     * @param {integer} value
     * @returns {boolean} true if the value is a valid FPS value
     */
    isValidFPS : value => {
        
        return _.type.isInteger(value) && 
               value >= LOWER_LIMIT_FPS && 
               value <= UPPER_LIMIT_FPS;
    },
    
    
    
    /*
     * PARSING
     */

    /**
     * parses a resolution string and returns width and height as an object
     *
     * @function
     * @alias module:video_manager
     * @category public
     *
     * @param {string} resolution - resolution string, e.g., "1280x720" or "1920x1080"
     * @returns {Object} parsed resolution
     *
     * @example
     * parseResolutionString("1280x720");
     * // output:
     * // {
     * //   width : 1280,
     * //   height : 720
     * // }
     */
    parseResolutionString : resolution => {

        if (
            !_.type.isString(resolution) || 
            !resolution.match(/^[0-9]+x[0-9]+$/)
        ) {
            _.logger.error(`Expected resolution as a string in the format "{width}x{height}", but got ${_.type.of(resolution)} "${resolution}"`);
            return;
        }

        return {
            width  : parseInt(resolution.match(/^[0-9]+/)[0]),
            height : parseInt(resolution.match(/[0-9]+$/)[0])
        };
    }
};

module.exports = __public;