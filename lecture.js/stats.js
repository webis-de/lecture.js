/**
 * @module stats
 * @desc collects and displays statistical information about the project
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
_.basic  = require('./src/.global/basic-utilities.js');
_.type   = require('./src/.global/type-tests.js');
_.logger = require('./src/.global/logger.js');
_.format = require('./src/.global/formatting-codes.js');


/*
 * =========
 * CONSTANTS
 * =========
 */

let CODE_DIRECTORY = _.path.join(__dirname, 'src');

// names of directories that shouldn't be scanned
let EXCLUDED_DIRECTORIES = [
    'node_modules',
    'lib'
];



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

let FILES = [];

// lines
let TOTAL_LINES = 0;
let LINES_WITHOUT_COMMENTS = 0;
let COMMENT_LINES = 0;
let CONSTRUCTIVE_LINES = 0;
let EMPTY_LINES = 0;

// characters
let TOTAL_CHARACTERS = 0;
let TOTAL_LETTERS = 0;
let TOTAL_NUMBERS = 0;



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * counts the different lines in a text, and adds the values to the global variables
 *
 * @function
 * @alias module:stats
 * @category private
 *
 * @param {string} str - text
 */
const addLineNumbers = str => {
    
    if (!_.type.isString(str)) {
        _.logger.error(`Expected text as a string, but got ${_.type.of(str)} "${str}"`);
        return;
    }
    
    const total_lines = _.basic.countLines(str);
    TOTAL_LINES += total_lines;
    
    // remove all lines that only contain comments from the original string
    const commentless_string = str.replace(/(\r\n|\r|\n)[\t ]*(\/\*.*?\*\/|\/\/.*)/g,'');
    const commentless_lines = _.basic.countLines(commentless_string);
    LINES_WITHOUT_COMMENTS += commentless_lines;
    
    COMMENT_LINES += total_lines - commentless_lines;

    // remove all lines that are empty from the original string
    const constructive_string = str.replace(/^\s*[\r\n]/gm, '');
    const constructive_lines = _.basic.countLines(constructive_string);
    CONSTRUCTIVE_LINES += constructive_lines;
    
    EMPTY_LINES += total_lines - constructive_lines;
};

/**
 * counts the different characters in a text, and adds the values to the global variables
 *
 * @function
 * @alias module:stats
 * @category private
 *
 * @param {string} str - text
 */
const addCharacterNumbers = str => {
    
    if (!_.type.isString(str)) {
        _.logger.error(`Expected text as a string, but got ${_.type.of(str)} "${str}"`);
        return;
    }
    
    TOTAL_CHARACTERS += str.length;

    // remove all characters that aren't letters from the original string
    const letters_string = str.replace(/[^a-z]+/gi, '');
    TOTAL_LETTERS += letters_string.length;

    // remove all characters that aren't numbers from the original string
    const numbers_string = str.replace(/[^0-9]+/gi, '');
    TOTAL_NUMBERS += numbers_string.length;
};

/**
 * scans a directory and sub-directories, and generates statistics for the scripts inside
 *
 * @function
 * @alias module:stats
 * @category private
 *
 * @param {string} dir - path to a directory
 */
const scanDirectory = dir => {
    
    if (!_.basic.isDirectory(dir)) {
        _.logger.error(`Expected a path to an existing directory as a string, but got ${_.type.of(dir)} "${dir}"`);
        return;
    }
    
    if (EXCLUDED_DIRECTORIES.includes(_.path.basename(dir))) {
        return;
    }
                
    // shorten the printed file path from being absolute
    // to being relative to this script
    let regex_dirname = new RegExp('^'+_.basic.escapeRegex(CODE_DIRECTORY)+'(\\\\|\\\/)?');
    let dir_from_root = dir.replace(regex_dirname, '');
    
    _.logger.message(`Scanning directory "${dir_from_root}"`);
    
    _.fs
        .readdirSync(dir)
        .forEach(path => {
        
            // create relative path from this script to "path"
            let path_from_root = _.path.join(dir_from_root, path);
        
            // make "path" absolute
            path = _.path.join(dir, path);
                
            // get statistics about the path
            let stat = _.fs.statSync(path);

            if (stat.isDirectory()) {
                scanDirectory(path);
            }
            else if (stat.isFile()) {
                
                if (_.path.extname(path) != '.js') {
                    return;
                }
                
                _.logger.message(`Found script "${path_from_root}"`);
                let file_content = _.fs.readFileSync(path).toString();
                
                // collect statistics
                addLineNumbers(file_content);
                addCharacterNumbers(file_content);
            }
        });
};

/**
 * runs the complete statistical program
 *
 * @function
 * @alias module:stats
 * @category private
 */
const main = () => {

    // start scanning the project code
    scanDirectory(CODE_DIRECTORY);

    console.log('');

    console.info(`${_.format.cyan}LINES${_.format.brightCyan}
      TOTAL: ${TOTAL_LINES}
      COMMENT: ${COMMENT_LINES}
      EMPTY: ${EMPTY_LINES}
      CONSTRUCTIVE: ${CONSTRUCTIVE_LINES} (total minus empty lines)
    ${_.format.reset}`);

    console.info(`${_.format.cyan}CHARACTERS${_.format.brightCyan}
      TOTAL: ${TOTAL_CHARACTERS}
      LETTERS: ${TOTAL_LETTERS}
      NUMBERS: ${TOTAL_NUMBERS}
    ${_.format.reset}`);
};

main();
process.exit(0);