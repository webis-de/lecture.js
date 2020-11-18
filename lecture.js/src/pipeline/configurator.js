/**
 * @module pipeline/configure
 * @desc parses the configuration file and applies settings
 *
 * @example
 * const _ = {};
 * _.configurator = require('/pipeline/configurator.js');
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

// npm modules
_.ini = require('ini');

// utility scripts
_.basic  = require('../.global/basic-utilities.js');
_.type   = require('../.global/type-tests.js');
_.logger = require('../.global/logger.js');

// lecture.js modules
_.parser   = require('../parser/main.js');
_.tts      = require('../text-to-speech/main.js');
_.video    = require('../video-manager/main.js');
_.uploader = require('../uploader/main.js');



/*
 * =========
 * CONSTANTS
 * =========
 */

const CONFIG_FILE_PATH = _.path.join(__dirname, 'config.ini');



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

let DATA = {};



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * parses the configuration file and caches the results
 *
 * @function
 * @alias module:pipeline/configure
 * @category private
 *
 * @returns {boolean} true on success
 */
const loadData = () => {
    
    // return if config data was already loaded
    if (_.basic.getLength(DATA) != 0) return false;
    
    // check if the config file exists
    if (!_.fs.existsSync(CONFIG_FILE_PATH)) {
        _.logger.error(`Pipeline configuration file is missing at path "${CONFIG_FILE_PATH}"`);
        return false;
    }
    
    // read config.ini file
    let data = _.fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
    
    // parse and process values
    data = _.ini.parse(data);
    DATA = processData(data);
    
    return true;
};

/**
 * transforms certain configuration values for easier usage
 *
 * @function
 * @alias module:pipeline/configure
 * @category private
 * 
 * @param {Object} data - configuration data
 * @returns {Object} configuration data
 */
const processData = data => {
    
    if (!_.type.isObject(data)) {
        _.logger.error(`Expected data as an object, but got ${_.type.of(data)} "${data}"`);
        return;
    }

    // transform the path to the Google credentials file to an absolute path
    if (_.basic.isRelativePath(data.credentials.aws)) {
        data.credentials.aws = _.path.join(__dirname, data.credentials.aws);
    }

    // transform the path to the Google credentials file to an absolute path
    if (_.basic.isRelativePath(data.credentials.google)) {
        data.credentials.google = _.path.join(__dirname, data.credentials.google);
    }

    // transform the path to the YouTube credentials file to an absolute path
    if (_.basic.isRelativePath(data.credentials.youtube)) {
        data.credentials.youtube = _.path.join(__dirname, data.credentials.youtube);
    }

    // transform the path to the cache directory to an absolute path
    if (_.basic.isRelativePath(data.cache.directory)) {
        data.cache.directory = _.path.join(__dirname, data.cache.directory);
    }

    // go through the whole object and parse pure number values as integers, e.g., '12' -> 12
    // but keep number strings beginning with 0 as a string, e.g., '012' -> '012'
    const parseIntegers = obj => {
        Object.keys(obj).forEach(key => {
            let value = obj[key];
            if (_.type.isObject(value)) {
                parseIntegers(value);
            }
            else if (_.type.isString(value) && value.match(/^[1-9]{1}[0-9]*$/)) {
                obj[key] = parseInt(value);
            }
        });
    };
    parseIntegers(data);
    
    return data;
};



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {

    /**
     * gets the data from the configuration file
     *
     * @function
     * @alias module:pipeline/configure
     * @category public
     * 
     * @returns {Object} configuration data
     */
    getData : async() => {
        
        // loads the config data into cache, if it's not yet loaded
        let success = loadData();
        if (!success) {
            _.logger.error(`Failed to load configuration data`);
            return;
        }

        // check values for correctness
        let errors = [];
        let warnings = [];
        
        
        
        /*
         * Generic
         */

        if (!_.type.isBoolean(DATA.generic.enableValidator)) {
            errors.push({
                setting : 'generic.enableValidator',
                value   : DATA.generic.enableValidator,
                expect  : 'Boolean'
            });
        }
        
        if (!_.type.isBoolean(DATA.generic.outputData)) {
            errors.push({
                setting : 'generic.outputData',
                value   : DATA.generic.outputData,
                expect  : 'Boolean'
            });
        }
        
        if (!_.type.isBoolean(DATA.generic.outputLogFile)) {
            errors.push({
                setting : 'generic.outputLogFile',
                value   : DATA.generic.outputLogFile,
                expect  : 'Boolean'
            });
        }

        if (!_.type.isBoolean(DATA.generic.outputFFmpegLogs)) {
            errors.push({
                setting : 'generic.outputFFmpegLogs',
                value   : DATA.generic.outputFFmpegLogs,
                expect  : 'Boolean'
            });
        }
        
        
        
        /*
         * Logs
         */

        success = _.logger.setOption('colored_logs', DATA.log.colored);
        if (!success) {
            errors.push({
                setting : 'log.colored',
                value   : DATA.log.colored,
                expect  : 'Boolean'
            });
        }

        success = _.logger.setOption('max_logs_amount', DATA.log.maxCount);
        if (!success) {
            errors.push({
                setting : 'log.maxCount',
                value   : DATA.log.maxCount,
                expect  : 'Integer'
            });
        }
        
        
        
        /*
         * Credentials
         */
       
        let aws_cred_added = _.tts.setAmazonCredentials(DATA.credentials.aws);
        if (!aws_cred_added) {
            warnings.push({
                setting : 'credentials.aws',
                value   : DATA.credentials.aws,
                expect  : 'Path to an existing JSON file'
            });
        }

        let google_cred_added = _.tts.setGoogleCredentials(DATA.credentials.google);
        if (!google_cred_added) {
            warnings.push({
                setting : 'credentials.google',
                value   : DATA.credentials.google,
                expect  : 'Path to an existing JSON file'
            });
        }
        
        if (!aws_cred_added && !google_cred_added) {
            errors.push(`At least one credentials file of AWS or Google Cloud must be provided`);
        }
        
        
        
        /*
         * Cache
         */

        if (!_.tts.setCacheDirectory(DATA.cache.directory)) {
            errors.push({
                setting : 'cache.directory',
                value   : DATA.cache.directory,
                expect  : 'Path to a valid directory' 
            });
        }

        if (!_.tts.setCacheExpiry(DATA.cache.expiresInDays)) {
            errors.push({
                setting : 'cache.expiresInDays',
                value   : DATA.cache.expiresInDays,
                expect  : 'Positive integer' 
            });
        }

        if (!_.tts.isValidCacheMode(DATA.cache.defaultMode)) {
            errors.push({
                setting : 'cache.defaultMode',
                value   : DATA.cache.defaultMode,
                expect  : 'Valid cache mode' 
            });
        }
        
        
        
        /*
         * Audio
         */

        if (!(await _.tts.voiceExists(DATA.audio.defaultVoice))) {
            errors.push({
                setting : 'audio.defaultVoice',
                value   : DATA.audio.defaultVoice,
                expect  : 'Valid lecture.js voice ID' 
            });
        }

        success = _.tts.setGoogleEffectProfile(DATA.audio.defaultGoogleEffectProfile);
        if (!success) {
            errors.push({
                setting : 'audio.defaultGoogleEffectProfile',
                value   : DATA.audio.defaultGoogleEffectProfile,
                expect  : 'Valid Google effects profile' 
            });
        }

        if (!_.type.isInteger(DATA.audio.defaultBreakAfterSlide) || DATA.audio.defaultBreakAfterSlide < 0) {
            errors.push({
                setting : 'audio.defaultBreakAfterSlide',
                value   : DATA.audio.defaultBreakAfterSlide,
                expect  : 'Integer >= 0'
            });
        }

        if (!_.type.isInteger(DATA.audio.defaultBreakAfterParagraph) || DATA.audio.defaultBreakAfterParagraph < 0) {
            errors.push({
                setting : 'audio.defaultBreakAfterParagraph',
                value   : DATA.audio.defaultBreakAfterParagraph,
                expect  : 'Integer >= 0'
            });
        }
        
        
        
        /*
         * Video
         */

        if (!_.video.isValidResolution(DATA.video.defaultResolution)) {
            errors.push({
                setting : 'video.defaultResolution',
                value   : DATA.video.defaultResolution,
                expect  : 'String formatted as "{width}x{height}"'
            });
        }

        if (!_.video.isValidFPS(DATA.video.defaultFPS)) {
            errors.push({
                setting : 'video.defaultFPS',
                value   : DATA.video.defaultFPS,
                expect  : 'Valid FPS as integer'
            });
        }

        if (!_.type.isBoolean(DATA.video.defaultKeepFrame)) {
            errors.push({
                setting : 'video.defaultKeepFrame',
                value   : DATA.video.defaultKeepFrame,
                expect  : 'Boolean'
            });
        }
        
        
        
        /*
         * Upload
         */
        
        if (_.basic.isFile(DATA.credentials.youtube, '.json')) {

            success = _.uploader.isValidPrivacyStatus(DATA.upload.defaultYoutubePrivacyStatus);
            if (!success) {
                errors.push({
                    setting : 'upload.defaultYoutubePrivacyStatus',
                    value   : DATA.upload.defaultYoutubePrivacyStatus,
                    expect  : 'Valid YouTube privacy status'
                });
            }

            success = DATA.upload.defaultYoutubePlaylistId === 'none' || await _.uploader.isUsersPlaylist(DATA.credentials.youtube, DATA.upload.defaultYoutubePlaylistId);
            if (!success) {
                errors.push({
                    setting : 'upload.defaultYoutubePlaylistId',
                    value   : DATA.upload.defaultYoutubePlaylistId,
                    expect  : 'ID of playlist owned by authenticated user'
                });
            }
        }
        
        if (!_.type.isBoolean(DATA.upload.generateYoutubeDescription)) {
            errors.push({
                setting : 'upload.generateYoutubeDescription',
                value   : DATA.upload.generateYoutubeDescription,
                expect  : 'Boolean'
            });
        }
        
        
        
        
        
        // print warnings and errors
        
        const printMessage = (msg, type) => {
            if (_.type.isObject(msg)) {
                _.logger[type](`Configuration setting "${msg.setting}" was set to an unexpected value: "${msg.value}". Expected value: "${msg.expect}"`);
            }
            else {
                _.logger[type](msg);
            }
        };
        
        if (warnings.length > 0) {
            warnings.forEach(msg => {
                printMessage(msg, 'warn');
            });
        }
        
        if (errors.length > 0) {
            errors.forEach(msg => {
                printMessage(msg, 'error');
            });
            return;
        }
        
        return _.basic.deepCopy(DATA);
    }
};

module.exports = __public;