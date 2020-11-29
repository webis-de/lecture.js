/**
 * @module pipeline/cli-worker
 * @desc parses command line arguments and manages certain terminal-printing options
 *
 * @example
 * const _ = {};
 * _.cli_worker = require('/pipeline/cli-worker.js');
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
_.basic = require('../.global/basic-utilities.js');

// npm modules
_.mri  = require('mri');

// lecture.js modules
_.tts = require('../text-to-speech/main.js');



/*
 * =========
 * CONSTANTS
 * =========
 */

const EOL = _.os.EOL;

const START_MENU_STRING = `
    Lecture.js turns your scripts into spoken lectures!
    Run "node lecture -h" to open the help menu.
`;

const HELP_MENU_STRING = `

 -----------------------
 | 1. Generate a video |
 -----------------------
 
  > node lecture -i="input/example.xml" -o="output/"

    -i, --input: Define path to the input XML file

    -o, --output: Defines path to the output directory

    --nowrap: if set, tells the pipeline to output files directly into the output directory, 
              instead of creating a sub directory inside the output directory

    --cache: sets the cache mode for Text-to-Speech audio REQUEST_BATCHES
        = "on"       : enables all caching
        = "off"      : disables all caching
        = "readonly" : Text-to-Speech audio generated at run-time won't be saved in the cache,
                       but will still be loaded from the cache if available
        = "saveonly" : Text-to-Speech audio generated at run-time will be saved in the cache,
                       but files can't be loaded from the cache even if available

 -----------------------------------
 | 2. Generate an MP3 audio sample |
 -----------------------------------

  > node lecture -s --voice="amazon-en-gb-amy" --text="This is a sentence."
  > node lecture -s --ssml --voice="amazon-en-gb-amy" --text="<speak>This is a <break time=\\"1s\\"/> sentence.</speak>"

    -s, --sample: tells the pipeline that a sample should be generated

        --voice: defines the name of the voice to use

        --text: defines the text to be spoken

        --ssml: flag that tells the pipeline to render the text sample as SSML content

 ----------------------
 | 3. Other functions |
 ----------------------

    --clearcache: removes the cached text-to-speech audio files

 -------------------------------
 | 4. Get software information |
 -------------------------------

    -h, --help: Print the help menu

    -v, --version: Print the version of the program

    --voices: Print the available voices

    --languages: Print the available languages
`;



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

// cached CLI arguments
let ARGS = {};



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /*
     * PRINT TO TERMINAL
     */
    
    /**
     * prints the start screen with information to the terminal
     * 
     * @function
     * @alias module:pipeline/cli-worker
     * @category public
     */
    printStart : () => {
        console.log(START_MENU_STRING);
    },
    
    /**
     * prints a help menu to the terminal
     *
     * @function
     * @alias module:pipeline/cli-worker
     * @category public
     */
    printHelp : () => {
        console.log(HELP_MENU_STRING);
    },
    
    /**
     * prints all the available Text-to-Speech voices to the terminal
     *
     * @async
     * @function
     * @alias module:pipeline/cli-worker
     * @category public
     *
     * @returns {Promise.<boolean>} true on success
     */
    printVoices : async() => {
        
        const voices = await _.tts.getVoices();
        
        if (!voices) {
            console.error(`Failed obtaining voice data`);
            return false;
        }
        
        // print all available voices
        console.log(`${EOL}Available voices:`);
        
        let current_language = null;
        
        // go through all voice names
        Object.keys(voices).forEach(voice_name => {
            let voice = voices[voice_name];
            
            if (voice.language != current_language) {
                console.log(`${EOL} ${voice.language}:`);
                current_language = voice.language;
            }
            
            console.log(`   ${voice_name} (${voice.gender.toLowerCase()})`);
        });
        
        return true;
    },
    
    /**
     * prints all the available Text-to-Speech languages to the terminal
     *
     * @async
     * @function
     * @alias module:pipeline/cli-worker
     * @category public
     *
     * @returns {Promise.<boolean>} true on success
     */
    printLanguages : async() => {
        
        const languages = await _.tts.getLanguages();
        
        if (!languages) {
            console.error(`Failed obtaining language data`);
            return false;
        }
        
        // print all available languages
        console.log(`${EOL}Available languages:${EOL}`);
        
        let last_prefix = '';
        let line = '';
        let counter = 0;
        
        languages.all.forEach(lang => {
            
            let current_prefix = lang.match(/^[^\-]+/)[0];
            
            if (last_prefix === '') {
                last_prefix = current_prefix;
            }
                
            if (current_prefix !== last_prefix) {
                console.log(` ${line}`);
                last_prefix = current_prefix;
                line = '';
                counter = 0;
            }
            
            counter++;
            
            line += `${(counter > 1 ? ', ' : '')}${lang}`;
        });
        
        return true;
    },
    
    
    
    /*
     * GETTER
     */

    /**
     * returns parsed command line arguments
     * 
     * @function
     * @alias module:pipeline/cli-worker
     * @category public
     *
     * @returns {Object} CLI arguments
     */
    getArguments : () => {
        
        // if arguments were already parsed and cached, 
        // return a copy of the cached version
        if (_.basic.getLength(ARGS) !== 0) {
            return {
                args : _.basic.deepCopy(ARGS),
                errors : 0
            };
        }

        // get command line arguments
        const argv = process.argv.slice(2);

        // return empty object if no CLI arguments provided
        if (argv.length == 0) {
            return {
                args : {},
                errors : 0
            };
        }

        // parse arguments
        ARGS = _.mri(argv, {
            // arguments to be parsed as string values
            string : ['i', 'input', 'o', 'output', 'voice', 'text', 'cache'],
            // arguments to be parsed as boolean values
            boolean : ['s', 'sample', 'nowrap', 'clearcache', 'h', 'help', 'v', 'version', 'voices', 'languages', 'ssml'],
            // different names for the same arguments (synonyms)
            alias : {
                v : 'version',
                h : 'help',
                i : 'input',
                o : 'output',
                s : 'sample'
            }
        });
        
        // transform input path to an absolute path
        if (ARGS.input) {
            const relative_to = _.path.join(__dirname, '..', '..');
            ARGS.input = _.basic.normalizePath(ARGS.input, relative_to);
        }
        
        // transform output path to an absolute path
        if (ARGS.output) {
            const relative_to = _.path.join(__dirname, '..', '..');
            ARGS.output = _.basic.normalizePath(ARGS.output, relative_to);
        }
        
        // check for any errors
        let errors = [];

        // check for input argument errors
        if (!ARGS.input) {
            errors.push(`-i: No input file defined`);
        }
        else if (ARGS.input.match(/^~/)) {
            errors.push(`-i: Linux absolute paths using '~' are not supported`);
        }
        else if (!_.basic.isFile(ARGS.input, '.xml')) {
            errors.push(`-i: Input requires an existing XML file, but "${ARGS.input}" is not`);
        }

        // check for output argument errors
        if (!ARGS.output) {
            errors.push(`-o: No output directory defined`);
        }
        else if (ARGS.output.match(/^~/)) {
            errors.push(`-o: Linux absolute paths using '~' are not supported`);
        }
        else if (!_.basic.isDirectory(ARGS.output)) {
            errors.push(`-o: Output "${ARGS.output}" is not an exiting directory`);
        }
        
        // check for valid cache mode
        if (ARGS.cache && !_.tts.isValidCacheMode(ARGS.cache)) {
            errors.push(`--cache: Got cache mode "${ARGS.cache}", but expected one of the following: on, off, saveonly, readonly`);
        }
        
        return {
            args        : _.basic.deepCopy(ARGS),
            args_errors : errors
        };
    }
};

module.exports = __public;