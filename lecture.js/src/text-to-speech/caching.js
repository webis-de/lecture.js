/**
 * @module text_to_speech/cache
 * @desc caches generated audio files
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
_.basic  = require('../.global/basic-utilities.js');
_.type   = require('../.global/type-tests.js');
_.logger = require('../.global/logger.js');



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

const EOL = _.os.EOL;



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

// object that holds all identifiers of cached audio files
let IDENTIFIERS = null;

// cache settings
let EXPIRE_IN_DAYS = 1;
let CACHE_DIR = null;
let CACHE_INDEX_FILE = null;



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * reads the cache into memory
 *
 * @function
 * @alias module:text_to_speech/cache
 * @category private
 */
const readCache = () => {
    
    if (IDENTIFIERS !== null) {
        return;
    }
        
    if (!CACHE_DIR) {
        _.logger.warn(`Failed to access cache, because no cache directory is set`);
        return;
    }
    
    // reset the object holding all available identifiers
    IDENTIFIERS = {};
    
    // if cache directory does not exist
    if (!_.fs.existsSync(CACHE_DIR)) {
        // create the directory
        _.fs.mkdirSync(CACHE_DIR, {
            recursive : true
        });
        // add gitignore file
        _.fs.writeFileSync(
            _.path.join(CACHE_DIR, '.gitignore'), 
            '# ignore all cached files' + EOL +
            '*' + EOL +
            '!.gitignore'
        );
    }
    
    // if no cache index file exists
    if (!_.fs.existsSync(CACHE_INDEX_FILE)) {
        // clear cache directory
        _.basic.clearDirectory(CACHE_DIR, {
            ignore_files : ['.gitignore']
        });
        // create empty index file
        _.fs.writeFileSync(CACHE_INDEX_FILE, '{}');
    }
    
    IDENTIFIERS = _.fs.readFileSync(CACHE_INDEX_FILE).toString();
    
    try {
        IDENTIFIERS = JSON.parse(IDENTIFIERS);
    }
    catch (err) {
        _.logger(`Failed to stringify cache index file as JSON, so will delete index file`);
        _.fs.unlinkSync(CACHE_INDEX_FILE);
        IDENTIFIERS = null;
        return;
    }
    
    // cleans the cache and saves it
    saveCache();
};

/**
 * cleans faulty cache entries and then
 * overwrites the existing cache files with the cleaned cache from memory
 *
 * @function
 * @alias module:text_to_speech/cache
 * @category private
 */
const saveCache = () => {
    
    if (IDENTIFIERS === null) {
        _.logger.error(`Failed to write cache, as no cache was loaded yet to be written down`);
        return;
    }
        
    if (!CACHE_DIR) {
        _.logger.warn(`Failed to access cache, because no cache directory is set`);
        return;
    }
    
    removeIndexedNoncachedFiles();
    removeNonindexedCachedFiles();
    removeOldFiles();
    
    _.fs.writeFileSync(CACHE_INDEX_FILE, JSON.stringify(IDENTIFIERS));
};

/**
 * removes entries from index file if the file does not exist in the cache directory
 *
 * @function
 * @alias module:text_to_speech/cache
 * @category private
 */
const removeIndexedNoncachedFiles = () => {
    
    // check if all cached files still exist, if not, remove them from cache
    Object.keys(IDENTIFIERS).forEach(id => {
        const path = IDENTIFIERS[id].path;
        if (!_.fs.existsSync(path)) {
            // remove the cached item from the index
            delete IDENTIFIERS[id];
        }
    });
};

/**
 * overwrites the existing cache files with the current cache from memory
 *
 * @function
 * @alias module:text_to_speech/cache
 * @category private
 */
const removeNonindexedCachedFiles = () => {
    
    // scan cache directory for all cached files
    const files = _.fs.readdirSync(CACHE_DIR);
    const identifier_keys = Object.keys(IDENTIFIERS);
    
    // check if all files in cache folder exist in the index
    files.forEach(base => {
        
        // ignore certain files
        if (['.gitignore', _.path.basename(CACHE_INDEX_FILE)].includes(base)) {
            return;
        }
        
        const path = _.path.join(CACHE_DIR, base);
        
        // check if a file with this path is indexed in the index file
        let audio_is_indexed = false;
        for (let i = 0, len = identifier_keys.length; i < len; i++) {
            const id = identifier_keys[i];
            const audio = IDENTIFIERS[id];
            if (audio.path === path) {
                audio_is_indexed = true;
                break;
            }
        }
        
        // remove the file, if it's not indexed in the index file
        if (!audio_is_indexed) {
            _.fs.unlinkSync(path);
        }
    });
};

/**
 * removes cached files that are too old
 *
 * @function
 * @alias module:text_to_speech/cache
 * @category private
 */
const removeOldFiles = () => {
    
    // check if all cached files still exist, if not, remove them from cache
    Object.keys(IDENTIFIERS).forEach(id => {
        
        const path = IDENTIFIERS[id].path;
        const date = IDENTIFIERS[id].date;
        const current_date = Date.now();
        
        // get difference in days
        const diff_time = Math.abs(current_date - date);
        const diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));
        
        // remove the file if it was cached a while ago
        if (diff_days > EXPIRE_IN_DAYS) {
            _.fs.unlinkSync(path);
        }
    });
};



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /*
     * SETTER
     */
    
    /**
     * sets the directoy in which the cache directory will be created, and creates a cache index file
     *
     * @function
     * @alias module:text_to_speech/cache
     * @category public
     * 
     * @param {string} dir - path to an existing directory
     * @returns {boolean} true if the assignment was successful
     */
    setDirectory : dir => {
        if (!_.basic.isDirectory(dir)) {
            return false;
        }
        CACHE_DIR = _.path.join(dir, '.cache');
        CACHE_INDEX_FILE = _.path.join(CACHE_DIR, 'cache-index.json');
        return true;
    },
    
    /**
     * sets the number of days after which an audio file will be removed from the cache
     *
     * @function
     * @alias module:text_to_speech/cache
     * @category public
     * 
     * @param {integer} days
     * @returns {boolean} true if the assignment was successful
     */
    setExpiry : days => {
        if (!_.type.isInteger(days) || days < 1) {
            return false;
        }
        EXPIRE_IN_DAYS = days;
        return true;
    },
    
    /**
     * checks a cache mode is valid
     *
     * @function
     * @alias module:text_to_speech/cache
     * @category public
     * 
     * @param {string} mode - cache mode
     * @returns {boolean} true if the cache mode is valid
     */
    isValidMode : mode => {
        return ['on','off','saveonly','readonly'].includes(mode);
    },
    
    
    
    /*
     * MANAGEMENT
     */
    
    /**
     * removes all cached audio files
     *
     * @function
     * @alias module:text_to_speech/cache
     * @category public
     */
    clearCache : () => {
        
        if (!CACHE_DIR) {
            _.logger.warn(`Failed to access cache, because no cache directory is set`);
            return;
        }
        
        IDENTIFIERS = {};
        
        if (_.fs.existsSync(CACHE_DIR)) {
            _.basic.clearDirectory(CACHE_DIR, {
                ignore_files : ['.gitignore']
            });
        }
        
        if (_.fs.existsSync(CACHE_INDEX_FILE)) {
            _.fs.unlinkSync(CACHE_INDEX_FILE);
        }
    },
    
    /**
     * checks if a cached audio file exists for the given identifier
     *
     * @function
     * @alias module:text_to_speech/cache
     * @category public
     * 
     * @param {Object} id - text to uniquely identify the audio file
     * @returns {boolean} true on success
     */
    isCached : id => {
        
        if (!CACHE_DIR) {
            _.logger.warn(`Failed to access cache, because no cache directory is set`);
            return;
        }
        
        readCache();
        return IDENTIFIERS[id] ? true : false;
    },
    
    /**
     * reads and returns the data of a cached audio file
     *
     * @function
     * @alias module:text_to_speech/cache
     * @category public
     * 
     * @param {Object} id - text to uniquely identify the audio file
     * @returns {Object} MP3 binary data
     */
    getData : id => {
        
        if (!_.type.isString(id) || id === '') {
            _.logger.error(`Expected id as a string, but got ${_.type.of(id)} "${id}"`);
            return;
        }
        
        if (!CACHE_DIR) {
            _.logger.warn(`Failed to access cache, because no cache directory is set`);
            return;
        }
        
        readCache();
        
        if (!__public.isCached(id)) {
            _.logger.error(`Audio with the following id does not exist: "${id}"`);
            return;
        }
        
        return _.fs.readFileSync(IDENTIFIERS[id].path);
    },
    
    /**
     * caches an audio file
     *
     * @function
     * @alias module:text_to_speech/cache
     * @category public
     * 
     * @param {string} id - text to uniquely identify the audio file
     * @param {Object} data - MP3 binary data
     * @returns {string} MP3 binary data
     */
    cacheData : (id, data) => {
        
        // required parameters
        
        if (!_.type.isString(id) || id === '') {
            _.logger.error(`Expected id as a string, but got ${_.type.of(id)} "${id}"`);
            return;
        }
        
        if (!_.type.isObject(data)) {
            _.logger.error(`Expected MP3 binary data as an object, but got ${_.type.of(data)} "${data.toString().substr(0,15)}..."`);
            return;
        }
        
        // ------------
        
        if (!CACHE_DIR) {
            _.logger.warn(`Failed to access cache, because no cache directory is set`);
            return;
        }
        
        readCache();
        
        // generate a file path
        const basename = (_.basic.getRandomInt(1,9) + Date.now()).toString(36) + _.basic.getUUIDv4();
        const path = _.path.join(CACHE_DIR, basename + '.mp3');
        
        const audio = {
            path : path,
            date : Date.now()
        };
        
        IDENTIFIERS[id] = audio;
        _.fs.writeFileSync(path, data, 'binary');
        saveCache();
    }
};

module.exports = __public;