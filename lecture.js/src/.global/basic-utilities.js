/**
 * @module basic_utilities
 * @desc provides basic utility functions
 *
 * @example
 * const _ = {};
 * _.basic = require('/.global/basic-utilities.js');
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
_.v8   = require('v8');

// utility scripts
_.type   = require('./type-tests.js');
_.logger = require('./logger.js');



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /* 
     * OPERATING SYSTEM
     */
    
    /**
     * returns the type of operating system Node.js is running on
     *
     * @async
     * @function
     * @alias module:basic_utilities
     * @category public
     *
     * @returns {string} operating system
     */
    getOS : () => {
        return process.platform;
    },
    
    /**
     * checks if Node.js is currently running on Windows
     *
     * @async
     * @function
     * @alias module:basic_utilities
     * @category public
     *
     * @returns {string} true, if the OS is Windows
     */
    isWindows : () => {
        // runs on 32-bit and 64-bit systems
        return process.platform === 'win32';
    },
    
    /**
     * checks if Node.js is currently running on Linux
     *
     * @async
     * @function
     * @alias module:basic_utilities
     * @category public
     *
     * @returns {string} true, if the OS is Linux
     */
    isLinux : () => {
        return process.platform === 'linux';
    },
    
    
    
    /* 
     * DIRECTORIES
     */
    
    /**
     * checks if the given path is a relative path
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} path - path to a file or a directory
     * @returns {boolean} true if the path is relative
     */
    isRelativePath : path => {
        
        if (!_.type.isString(path) || path === '') {
            _.logger.error(`Expected a path as a string, but got ${_.type.of(path)} "${path}"`);
            return;
        }
        
        return !__public.isAbsolutePath(path);
    },
    
    /**
     * checks if the given path is an absolute path
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} path - path to a file or a directory
     * @returns {boolean} true if the path is absolute
     */
    isAbsolutePath : path => {
        
        if (!_.type.isString(path) || path === '') {
            _.logger.error(`Expected a path as a string, but got ${_.type.of(path)} "${path}"`);
            return;
        }
        
        // check for an absolute file path
        return __public.isWindows() ? 
                    // Windows
                    /^([a-z]?:(\/|\\)|[a-z]+:(\/\/|\\\\))/i.test(path) :
                    // Linux
                    path.charAt(0) === '/' || path.charAt(0) === '~';
    },
    
    /**
     * normalizes a file path and transforms it to an absolute path if it's relative
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} path - any file or directory path
     * @param {string} relative_to_path - if the "path" is relative, it should be relative to "relative_to_path"
     * @returns {string} path
     */
    normalizePath : (path, relative_to_path) => {
        
        if (!_.type.isString(path) || path === '') {
            _.logger.error(`Expected a path as a string, but got ${_.type.of(path)} "${path}"`);
            return;
        }
        
        if (!_.type.isString(relative_to_path) || relative_to_path === '') {
            _.logger.error(`Expected a relative path as a string, but got ${_.type.of(relative_to_path)} "${relative_to_path}"`);
            return;
        }
        
        // normalize the path, which replace '..', and '.'
        path = _.path.normalize(path);
        
        // check for an absolute file path
        return __public.isAbsolutePath(path) ? path : _.path.join(relative_to_path, path);
    },
    
    /**
     * checks if a path points to an existing directory
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {*} path - absolute path to a file or a directory
     * @returns {boolean} true if the path points to a directory
     */
    isDirectory : path => {
        
        return _.type.isString(path) &&
                path !== '' &&
               _.fs.existsSync(path) && 
               _.fs.statSync(path).isDirectory();
    },
    
    /**
     * checks if a path points to an existing file
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {*} path - absolute path to a file or a directory
     * @param {string} [extension=null] - file can be optionally checked for this file extension, e.g. '.xml'
     * @returns {boolean} true if the path points to a file
     */
    isFile : (path, extension = null) => {
        
        return _.type.isString(path) &&
                path !== '' &&
               // if an extension is defined, check if the path has that extension
               (!_.type.isString(extension) ? true : _.path.extname(path) === extension) &&
               // check if the file exists
               _.fs.existsSync(path) &&
               _.fs.statSync(path).isFile();
    },
    
    /**
     * returns the size of a file in bytes
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} path - absolute path to a file
     * @returns {integer} size of the file in bytes
     */
    getFileSize : path => {
        
        if (!_.type.isString(path)) {
            _.logger.error(`Expected a path as a string, but got ${_.type.of(path)} "${path}"`);
            return 0;
        }
        
        if (
            !_.fs.existsSync(path) ||
            !_.fs.statSync(path)
        ) {
            _.logger.error(`File "${path}" does not exist`);
            return 0;
        }
        
        return _.fs.statSync(path)['size'];
    },
    
    /**
     * creates a directory at the given path
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} path - absolute path to a non-existing directory
     * @returns {boolean} true if a new directory was created (false if a directory already exists at the path)
     */
    createDirectory : path => {
        
        if (!_.type.isString(path)) {
            _.logger.error(`Expected a path as a string, but got ${_.type.of(path)} "${path}"`);
            return false;
        }
        
        if (!_.fs.existsSync(path)) {
            _.fs.mkdirSync(path);
            return true;
        }
        
        return false;
    },
    
    /**
     * deletes the directory at the given path
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} path - absolute path to an existing or non-existing directory
     */
    deleteDirectory : path => {
        
        if (!_.type.isString(path)) {
            _.logger.error(`Expected a path as a string, but got ${_.type.of(path)} "${path}"`);
            return;
        }
        
        // only do something, if it's an existing directory
        if (__public.isDirectory(path)) {
            
            // remove contents of given directory
            __public.clearDirectory(path);
            
            // remove given directory
            _.fs.rmdirSync(path);
        }
    },

    /**
     * deletes the contents of the directory at the given path
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} path - absolute path to an existing or non-existing directory
     * @param {Object} options
     * @param {Array.<string>} [options.ignore_dirs] - base names of child directories that should not be deleted
     * @param {Array.<string>} [options.ignore_files] - base names of child files that should not be deleted
     */
    clearDirectory : (path, options) => {
        
        // required parameters
        
        if (!_.type.isString(path)) {
            _.logger.error(`Expected a path as a string, but got ${_.type.of(path)} "${path}"`);
            return;
        }
        
        // optional parameters
        
        let ignore_dirs = [];
        let ignore_files = [];
        
        if (options !== undefined) {
            
            if (!_.type.isObject(options)) {
                _.logger.error(`Expected options as an object, but got ${_.type.of(options)} "${options}"`);
                return;
            }

            if (options.ignore_dirs !== undefined) {
                if (
                    !_.type.isArray(options.ignore_dirs) || 
                    !options.ignore_dirs.every(_.type.isString)
                ) {
                    _.logger.error(`Expected options.ignore_dirs as an array of directory base names (strings), but got ${_.type.of(options.ignore_dirs)} "${options.ignore_dirs}"`);
                    return;
                }
                ignore_dirs = options.ignore_dirs;
            }

            if (options.ignore_files !== undefined) {
                if (
                    !_.type.isArray(options.ignore_files) || 
                    !options.ignore_files.every(_.type.isString)
                ) {
                    _.logger.error(`Expected options.ignore_files as an array of file base names (strings), but got ${_.type.of(options.ignore_files)} "${options.ignore_files}"`);
                    return;
                }
                ignore_files = options.ignore_files;
            }
        }
        
        // only do something, if it's an existing directory
        if (__public.isDirectory(path)) {
            
            _.fs
                .readdirSync(path)
                .forEach(base => {
                
                    const this_path = _.path.join(path, base);
                
                    // delete this directory
                    if (
                        _.fs.statSync(this_path).isDirectory() &&
                        !ignore_dirs.includes(base)
                    ) {
                        __public.clearDirectory(this_path, options);
                        // try to remove the directory,
                        // which will deliberately fail, if there is still any content left inside
                        // that was set to be ignored by clearDirectory()
                        try {_.fs.rmdirSync(this_path);}
                        catch (e) {}
                    } 
                    // delete this file
                    else if (
                        _.fs.statSync(this_path).isFile() &&
                        !ignore_files.includes(base)
                    ) {
                        _.fs.unlinkSync(this_path);
                    }
                });
        }
    },
    
    /**
     * replaces the file extension of a path
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} path - absolute or relative file path
     * @param {string} extension - file extension; must be without a dot, e.g., "txt" instead of ".txt")
     * @returns {string} file path with replaced file extension
     *
     * @example
     * replaceFileExtension('here/is/a/log.txt', 'log');
     * // output: 'here/is/a/log.log'
     */
    replaceFileExtension : (path, extension) => {
        
        if (!_.type.isString(path)) {
            _.logger.error(`Expected a path as a string, but got ${_.type.of(path)} "${path}"`);
            return;
        }
        
        if (!_.type.isString(extension)) {
            _.logger.error(`Expected an extension as a string, but got ${_.type.of(extension)} "${extension}"`);
            return;
        }
        
        if (extension.match(/^\./)) {
            _.logger.error(`File extension must be given without the dot, e.g., "txt" instead of ".txt"`);
            return;    
        }
        
        // get the index of the last point of the path
        let pos = path.lastIndexOf('.');
        let path_without_extension = path.substr(0, pos < 0 ? path.length : pos);
        
        return `${path_without_extension}.${extension}`;
    },
    
    /**
     * appends a string to the file name of a file path
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} path - absolute or relative file path
     * @param {string} append - text that will be appended to the file name
     * @returns {string} new path
     *
     * @example
     * appendToFilename('here/is/a/log.txt', '_123');
     * // output: 'here/is/a/log_123.txt'
     */
    appendToFilename : (path, append) => {
        
        if (!_.type.isString(path)) {
            _.logger.error(`Expected a path as a string, but got ${_.type.of(path)} "${path}"`);
            return;
        }
        
        if (!_.type.isString(append)) {
            _.logger.error(`Expected a string to append, but got ${_.type.of(append)} "${append}"`);
            return;
        }
        
        // parse into a path object
        path = _.path.parse(path);
        
        // create the new file name
        let new_file_name = path.name + append;
        
        // apply the file name to the path object
        path.base = path.base.replace(new RegExp(`^${__public.escapeRegex(path.name)}`), new_file_name);
        path.name = new_file_name;
        
        // change the path object back into a string and return
        return _.path.format(path);
    },
    
    
    
    /* 
     * OBJECTS
     */
    
    /**
     * makes a deep copy of an object or an array
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {Object|Array} obj - an object or array to make a deep copy of
     * @returns {Object|Array} deep copy
     */
    deepCopy : obj => {
        
        if (
            !_.type.isObject(obj) && 
            !_.type.isArray(obj)
        ) {
            _.logger.error(`Expected an object or an array, but got ${_.type.of(obj)} "${obj}"`);
            return;
        }
        
        // https://stackoverflow.com/a/10916838
        return _.v8.deserialize(_.v8.serialize(obj));
    },
    
    /**
     * compares two values (or objects) deeply
     *  supported types: integer, string, boolean, null, undefined, array, object(, floats somewhat)
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {*} val1
     * @param {*} val2
     * @returns {boolean} true, if the values match
     */
    isEqual : (val1, val2) => {
        
        // both values must have the same type
        if (_.type.of(val1) !== _.type.of(val2)) {
            return false;
        }
        
        // first compare simple values
        let type = _.type.of(val1);
        if (['integer', 'string', 'boolean', 'null', 'undefined'].includes(type)) {
            return val1 === val2;
        }
        
        // float comparisons are a little tricky
        if (type === 'float') {
            return Math.abs(val1 - val2) < Number.EPSILON;
        }
        
        // if both are arrays, compare all values
        if (type === 'array') {
            if (val1.length !== val2.length) {
                return false;
            }
            for (let i = 0, len = val1.length; i < len; i++) {
                if (!__public.isEqual(val1[i], val2[i])) {
                    return false;
                }
            }
        }
        
        // if both are objects, compare all key-value pairs
        if (type === 'object') {
            // compare amount of keys
            let keys1 = Object.keys(val1);
            let keys2 = Object.keys(val2);
            if (keys1.length !== keys2.length) {
                return false;
            }
            // compare key values
            for (let i = 0, len = keys1.length; i < len; i++) {
                let key = keys1[i];
                if (!__public.isEqual(val1[key], val2[key])) {
                    return false;
                }
            }
        }
            
        return true;
    },
    
    /**
     * checks if a given key-value pair exists in a nested object
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {Object} obj - nested object
     * @param {string} find_key
     * @param {*} find_value
     * @returns {boolean} true if a key-value pair was found
     *
     * @example
     * let obj = {
     *      a : 1,
     *      b : 2,
     *      c : [{
     *          d : 4
     *      }],
     *      e : {
     *          f : 5
     *      }
     * };
     * hasKeyValuePair(obj, 'b', 2); // output: true
     * hasKeyValuePair(obj, 'c', 3); // output: false
     * hasKeyValuePair(obj, 'd', 4); // output: true
     * hasKeyValuePair(obj, 'f', 5); // output: true
     * hasKeyValuePair(obj, 'g', 6); // output: false
     */
    hasKeyValuePair : (obj_or_array, find_key, find_value) => {
        
        if (
            !_.type.isObject(obj_or_array) && 
            !_.type.isArray(obj_or_array)
        ) {
            _.logger.error(`Expected an object or array, but got ${_.type.of(obj)} "${obj}"`);
            return;
        }
        
        if (!_.type.isString(find_key)) {
            _.logger.error(`Expected a key as a string, but got ${_.type.of(find_key)} "${find_key}"`);
            return;
        }
        
        if (
            _.type.isObject(find_value) ||
            _.type.isArray(find_value)
        ) {
            _.logger.error(`Expected a non-object, non-array value to find, but got ${_.type.of(find_value)} "${find_value}"`);
            return;
        }
        
        if (_.type.isObject(obj_or_array)) {
        
            let keys = Object.keys(obj_or_array);

            for (let i = 0, len = keys.length; i < len; i++) {

                let key = keys[i];

                if (
                    key == find_key && 
                    obj_or_array[key] == find_value
                ) {
                    return true;
                }

                if (
                    !_.type.isObject(obj_or_array[key]) &&
                    !_.type.isArray(obj_or_array[key])
                ) {
                    continue;
                }
                
                let found = __public.hasKeyValuePair(obj_or_array[key], find_key, find_value);
                // if found a first pair, return
                if (found) {
                    return true;
                }
            }
        }
        else if (_.type.isArray(obj_or_array)) {

            for (let i = 0, len = obj_or_array.length; i < len; i++) {
            
                let val = obj_or_array[i];

                if (
                    !_.type.isObject(val) &&
                    !_.type.isArray(val)
                ) {
                    return;
                }
                
                let found = __public.hasKeyValuePair(val, find_key, find_value);
                
                // if found a first pair, return
                if (found) {
                    return true;
                }
            }
        }
        
        return false;
    },
    
    /**
     * counts the number of keys in an object or the amount of indexes in an array
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {Object|Array.<*>} obj - object or array
     * @returns {integer} size
     *
     * @example
     * let obj = {
     *      a:1,
     *      b:2
     * };
     * getLength(obj); // output: 2
     * let obj2 = [1,'a',2];
     * getLength(obj2); // output: 3
     */
    getLength : obj => {
        
        if (!_.type.isObject(obj) && !_.type.isArray(obj)) {
            _.logger.error(`Expected an object or array, but got ${_.type.of(obj)} "${obj}"`);
            return;
        }
        
        if (_.type.isObject(obj)) {
            return Object.keys(obj).length;
        }
        
        return obj.length;
    },
    
    
    
    /* 
     * ARRAYS
     */
    
    /**
     * checks if a value is inside an array
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {Array} arr - array to check
     * @param {*} val - value to search for in the array
     * @returns {boolean} true if the array is contained within the array
     *
     * @example
     * let arr = [1,2,3];
     * inArray(arr, 2); // output: true
     * inArray(arr, 4); // output: false
     */
    inArray : (arr, val) => {
        
        if (!_.type.isArray(arr)) {
            _.logger.error(`Expected an array, but got ${_.type.of(arr)} "${arr}"`);
            return;
        }
        
        for (var i = arr.length; i--;) {
            if (arr[i] == val) {
                return true;
            }
        }
        
        return false;
    },
    
    /**
     * inserts multiple items at a given index into an array
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {Array} arr - array to insert the items into
     * @param {integer} index - index at which to insert
     * @param {Array} items - array of one or more items to insert into the main array
     * @returns {Array} new array including the inserted items
     *
     * @example
     * let arr = [1,2,5,6];
     * let items = [3,4];
     * insertArray(arr, 2, items); 
     * // output: [1,2,3,4,5,6]
     */
    insertArray : (arr, index, items) => {
        
        if (!_.type.isArray(arr)) {
            _.logger.error(`Expected a base array in which to insert items, but got ${_.type.of(arr)} "${arr}"`);
            return;
        }
        
        if (!_.type.isInteger(index)) {
            _.logger.error(`Expected an index as an integer at which to insert the items, but got ${_.type.of(index)} "${index}"`);
            return;
        }
        
        if (!_.type.isArray(items)) {
            _.logger.error(`Expected an array of items to insert, but got ${_.type.of(items)} "${items}"`);
            return;
        }
        
        if (index === 0) {
            items.reverse().forEach(item => {
                arr.unshift(items);
            });
            return arr;
        }
        
        if (arr.length <= index) {
            items.forEach(item => {
                arr.push(item);
            });
            return arr;
        }
        
        return [
            ...arr.slice(0, index), 
            ...items, 
            ...arr.slice(index)
        ];
    },
    
    /**
     * removes an entry from an array and shifts later entries to fill the empty index
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {Array} arr - array to insert the items into
     * @param {integer} index - index of the entry which is to be removed
     * @returns {Array} new array without the removed index
     *
     * @example
     * let arr = [1,2,3,4];
     * removeArrayIndex(arr, 2); 
     * // output: [1,2,4]
     */
    removeArrayIndex : (arr, index) => {
        
        if (!_.type.isArray(arr)) {
            _.logger.error(`Expected an array, but got ${_.type.of(arr)} "${arr}"`);
            return;
        }
        
        if (!_.type.isInteger(index)) {
            _.logger.error(`Expected an index as an integer, but got ${_.type.of(index)} "${index}"`);
            return;
        }
        
        if (arr.length <= index) {
            _.logger.error(`Expected an index lower than the length of the array, but got "${index}" and the array is only "${arr.length}" entries long`);
            return;
        }
        
        var len = arr.length;
        
        // remove index
        for (var i = index; i < len - 1; i++) {
            arr[i] = arr[i+1];
        }
        
        // remove last value
        arr.pop();
        
        return arr;
    },
    
    /**
     * simulates a forEach loop asynchronously (but the requests are still in synchronous orders)
     *
     * @async
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {Array} arr - array to insert the items into
     * @param {Function} func - function to be run
     * @returns {Promise.<Array.<*>>} new array without the removed index
     *
     * @example
     * await forEachAsync([1,2,3], async(nr) => {
     *      return new Promise((resolve, reject) => {
     *          let random_time = Math.floor(Math.random() * 100);
     *          setTimeout(() => {
     *              console.log(nr);
     *              resolve();
     *          }, random_time);
     *      });
     * });
     * // output:
     * // 1
     * // 2
     * // 3
     */
    forEachAsync : async(arr, func) => {
        
        if (!_.type.isArray(arr)) {
            _.logger.error(`Expected an array, but got ${_.type.of(arr)} "${arr}"`);
            return;
        }
        
        if (!_.type.isFunction(func)) {
            _.logger.error(`Expected a function, but got ${_.type.of(func)} "${func}"`);
            return;
        }
        
        for (var i = 0, len = arr.length; i < len; i++) {
            await func(arr[i], i, arr);
        }
    },
    
    
    
    /* 
     * STRINGS
     */
    
    /**
     * checks how similar two strings are
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} s1
     * @param {string} s2
     * @returns {number} float between 0 and 1, where 1 is most similar
     *
     * @example
     * getStringSimilarity('hallo', 'hllo'); // output: 0.8
     */
    getStringSimilarity : (s1, s2) => {
        
        if (!_.type.isString(s1)) {
            _.logger.error(`Expected a string, but got ${_.type.of(s1)} "${s1}"`);
            return;
        }
        
        if (!_.type.isString(s2)) {
            _.logger.error(`Expected a second string, but got ${_.type.of(s2)} "${s2}"`);
            return;
        }
        
        // algorithm by https://stackoverflow.com/a/36566052
        
        // determine which string is longer
        let longer = s1;
        let shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        
        let longerLength = longer.length;
        if (longerLength == 0) {
            return 1.0;
        }

        const editDistance = (s1, s2) => {
            
            s1 = s1.toLowerCase();
            s2 = s2.toLowerCase();

            let costs = new Array();
            for (var i = 0; i <= s1.length; i++) {
                let lastValue = i;
                for (var j = 0; j <= s2.length; j++) {
                    if (i == 0) {
                        costs[j] = j;
                    }
                    else {
                        if (j > 0) {
                            let newValue = costs[j - 1];
                            if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
                                newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                            }
                            costs[j - 1] = lastValue;
                            lastValue = newValue;
                        }
                    }
                }
                if (i > 0)
                    costs[s2.length] = lastValue;
                }
            return costs[s2.length];
        }
        
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    },
    
    
    
    /* 
     * FORMATTING
     */
    
    /**
     * removes the spaces and tab characters after newlines
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} str - input text
     * @returns {string} output text
     *
     * @example
     * let str = `
     *    hello
     * `;
     * removeSpacesAfterNewlines(str);
     * // output: '\nhello\n'
     */
    removeSpacesAfterNewlines : str => {
        
        if (!_.type.isString(str)) {
            _.logger.error(`Expected a string, but got ${_.type.of(str)} "${str}"`);
            return;
        }
        
        return str.replace(/([\n\r]+)([ \t]+)/g, '$1');
    },

    /**
     * returns a string split into lines
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     *  
     * @param {string} str - input text
     * @returns {Array.<String>} array of strings
     *
     * @example
     * let str = `
     *   hello
     * `;
     * getLines(str);
     * // output: ['','  hello','']
     */
    getLines : str => {
        
        if (!_.type.isString(str)) {
            _.logger.error(`Expected a string, but got ${_.type.of(str)} "${str}"`);
            return;
        }
        
        return str.split(/\r\n|\r|\n/);
    },
    
    /**
     * counts the number of lines a string has
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} str - input text
     * @returns {integer} number of lines
     *
     * @example
     * let str = `
     *   hello
     * `;
     * countLines(str);
     * // output: 3
     */
    countLines : str => {
        
        if (!_.type.isString(str)) {
            _.logger.error(`Expected a string, but got ${_.type.of(str)} "${str}"`);
            return;
        }
        
        return (str.match(/\r\n|\r|\n/g) || '').length + 1;
    },
    
    
    
    /* 
     * ENCODING
     */
    
    /**
     * encodes a string using Base64
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} str - input text
     * @returns {string} Base64-encoded string
     *
     * @example
     * encodeBase64('hallo 123 -.;');
     * // output: 'aGFsbG8gMTIzIC0uOw=='
     */
    encodeBase64 : str => {
        
        if (!_.type.isString(str)) {
            _.logger.error(`Expected a string, but got ${_.type.of(str)} "${str}"`);
            return;
        }
        
        return Buffer.from(str).toString('base64');
    },
    
    /**
     * decodes a Base64 string
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} str - Base64-encoded text
     * @returns {string} decoded text
     *
     * @example
     * decodeBase64('aGFsbG8gMTIzIC0uOw==');
     * // output: 'hallo 123 -.;'
     */
    decodeBase64 : str => {
        
        if (!_.type.isString(str)) {
            _.logger.error(`Expected a string, but got ${_.type.of(str)} "${str}"`);
            return;
        }
        
        return Buffer.from(str, 'base64').toString('ascii');
    },
    
    
    
    /*
     * ESCAPING
     */
    
    /**
     * escapes a string to be usable in a regular expression
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {string} str - input text
     * @returns {string} escaped text
     *
     * @example
     * escapeRegex('Match [this text].');
     * // output: 'Match \[this text\]\.'
     */
    escapeRegex : str => {
        
        if (!_.type.isString(str)) {
            _.logger.error(`Expected a string, but got ${_.type.of(str)} "${str}"`);
            return;
        }
        
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    },
    
    
    
    /* 
     * GENERATION
     */
    
    /**
     * formats a Date object to a string in the format of `yyyy/mm/dd hh:mm:ss.SSS`
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {Object} date - date object
     * @returns {string} formatted date string
     *
     * @example
     * stringifyFullDate(new Date());
     * // output: '2020/07/16 15:59:12.306'
     */
    stringifyFullDate : date => {
        
        if (!_.type.isDate(date)) {
            _.logger.error(`Expected a valid date, but got ${_.type.of(date)} "${date}"`);
            return;
        }
        
        return '' +
            // date
            date.getFullYear() + '/' +
            (date.getMonth() + 1).toString().padStart(2, '0') + '/' +
            date.getDate().toString().padStart(2, '0') + ' ' +
            // time
            date.getHours().toString().padStart(2, '0') + ':' +
            date.getMinutes().toString().padStart(2, '0') + ':' +
            date.getSeconds().toString().padStart(2, '0') + '.' +
            date.getMilliseconds().toString().padStart(3, '0');
    },
    
    /**
     * generates an universally unique identifier, version 4
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @returns {string} UUID v4
     *
     * @example
     * getUUIDv4();
     * // output: 'd9171d3c-bbd5-4ea6-a676-8c3ed01a9dea'
     */
    getUUIDv4 : () => {
        
        // code by https://stackoverflow.com/a/2117523
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    /**
     * generates a random float between min and max (min included)
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {number} min - smallest possible value
     * @param {number} max - greatest possible value
     * @returns {number} floating point value inbetween min and max
     *
     * @example
     * getRandomFloat(5, 100);
     * // output: 95.9096168949175
     * getRandomFloat(1, 2);
     * // output: 1.854652212731835
     * getRandomFloat(5.2, 5.3);
     * // output: 5.287019333987489
     */
    getRandomFloat : (min, max) => {
        
        if (!_.type.isNumber(min)) {
            _.logger.error(`Expected a number as a minimum, but got ${_.type.of(min)} "${min}"`);
            return;
        }
        
        if (!_.type.isNumber(max)) {
            _.logger.error(`Expected a number as a maximum, but got ${_.type.of(max)} "${max}"`);
            return;
        }
        
        if (min > max) {
            _.logger.error(`Minimum value must be equal or smaller than maximum value, but got ${min} > ${max}`);
            return;
        }
        
        return Math.random() * (max - min) + min;
    },
    
    /**
     * generates a random integer between min and max (min and max included)
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {integer} min - smallest possible value
     * @param {integer} max - greatest possible value
     * @returns {integer} integer inbetween min and max
     *
     * @example
     * getRandomInt(5, 100);
     * // output: 32
     * getRandomInt(1, 2);
     * // output: 2
     * getRandomInt(5, 6);
     * // output: 5
     */
    getRandomInt : (min, max) => {
        
        if (!_.type.isInteger(min)) {
            _.logger.error(`Expected a number as a minimum, but got ${_.type.of(min)} "${min}"`);
            return;
        }
        
        if (!_.type.isInteger(max)) {
            _.logger.error(`Expected a number as a maximum, but got ${_.type.of(max)} "${max}"`);
            return;
        }
        
        if (min > max) {
            _.logger.error(`Minimum value must be equal or smaller than maximum value, but got ${min} > ${max}`);
            return;
        }
        
        return Math.floor(Math.random() * (max + 1 - min)) + min;
    },
    
    /**
     * transforms a value from one number range to another number range
     *
     * @function
     * @alias module:basic_utilities
     * @category public
     * 
     * @param {number} val - value to transform
     * @param {Object} original - original range in which the value fits
     * @param {number} original.min - lower end of the range
     * @param {number} original.max - upper end of the range
     * @param {Object} new_range
     * @param {number} new_range.min - lower end of the range
     * @param {number} new_range.max - upper end of the range
     * @returns {float} transformed value
     *
     * @example
     * transformRange(2, {min:1,max:2}, {min:1,max:6}); // output: 6
     * transformRange(2, {min:1,max:3}, {min:1,max:6}); // output: 3.5
     * transformRange(3, {min:0,max:6}, {min:0,max:12}); // output: 6
     */
    transformRange : function (val, original, new_range) {
        const percent = (val - original.min) / (original.max - original.min);
        return percent * (new_range.max - new_range.min) + new_range.min;
    }
};

module.exports = __public;