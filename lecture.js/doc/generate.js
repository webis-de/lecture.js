/**
 * @module documentation
 * @desc generates a documentation markdown file from the source scripts
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
_.basic  = require('../src/.global/basic-utilities.js');
_.type   = require('../src/.global/type-tests.js');
_.logger = require('../src/.global/logger.js');

// module to generate JSDoc markdown files
try {
    // install at https://www.npmjs.com/package/jsdoc-to-markdown
    _.jsdoc2md = require('jsdoc-to-markdown');
}
catch (e) {
    _.jsdoc2md = undefined;
}


/*
 * =========
 * CONSTANTS
 * =========
 */

const EOL = _.os.EOL;

// names of directories that shouldn't be scanned
const EXCLUDED_DIRECTORIES = [
    'node_modules'
];



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * scans a directory and its sub-directories for all JavaScript files
 *
 * @function
 * @alias module:documentation
 * @category private
 *
 * @param {string} dir - path to a directory
 * @returns {Object} error trace
 */
const getScriptsInDirectory = dir => {
    
    if (!_.basic.isDirectory(dir)) {
        _.logger.error(`Expected a path to an existing directory as a string, but got ${_.type.of(dir)} "${dir}"`);
        return;
    }
    
    let script_paths = [];
    
    if (EXCLUDED_DIRECTORIES.includes(_.path.basename(dir))) {
        _.logger.warn(`Ignored directory "${dir}"`)
        return [];
    }
    
    _.logger.message(`Scanning directory "${dir}"`);
    let contents = _.fs.readdirSync(dir);
    
    contents.forEach(path => {

        // make "path" absolute
        path = _.path.join(dir, path);

        // get statistics about the path
        let stat = _.fs.statSync(path);

        if (stat.isDirectory()) {
            
            // get all scripts in the sub-directory
            let sub_dir_contents = getScriptsInDirectory(path);
            
            // if the scan failed, return
            if (!sub_dir_contents) return;
            
            // merge the paths to the already and the newly collected scripts
            script_paths = script_paths.concat(sub_dir_contents);
        }
        else if (stat.isFile()) {

            // don't include any non-JavaScript scripts
            if (_.path.extname(path) !== '.js') return;

            // if a script is found, add it to the array
            _.logger.message(`Found script "${path}"`);
            script_paths.push(path);
        }
    });
    
    return script_paths;
};

/**
 * generates the documentation for a given input directory
 *
 * @async
 * @function
 * @alias module:documentation
 * @category private
 * 
 * @param {Object} options
 * @param {string} options.input_directory - path to the directory that should be scanned
 * @param {string} options.output_file - path to where the output file should be generated
 * @returns {Promise.<boolean>} true on success
 */
const generateDocumentation = async(options) => {
    
    if (!_.type.isObject(options)) {
        _.logger.error(`Expected options as an object, but got ${_.type.of(options)} "${options}"`);
        return false;
    }
    
    if (!_.basic.isDirectory(options.input_directory)) {
        _.logger.error(`Expected options.input_directory as a path to an existing directory, but got ${_.type.of(options.input_directory)} "${options.input_directory}"`);
        return false;
    }
    
    if (
        !_.type.isString(options.output_file) ||
        _.path.extname(options.output_file) !== '.md'
    ) {
        _.logger.error(`Expected options.output_file as a path to a Markdown file, but got ${_.type.of(options.output_file)} "${options.output_file}"`);
        return false;
    }
    
    if (!_.jsdoc2md) {
        _.logger.error(`Failed requiring the 'jsdoc-to-markdown' module. Install it from here first: https://www.npmjs.com/package/jsdoc-to-markdown`);
        return false;
    }
    
    _.logger.message(`Generating documentation...`);
    
    // start scanning the project code
    let script_paths = getScriptsInDirectory(options.input_directory);
    
    _.logger.info(`Found ${script_paths.length} JavaScript files`);
    
    if (script_paths.length == 0) {
        _.logger.error(`Could not generate a documentation, as 0 scripts were found`);
        return false;
    }
        
    let output = '' +
`[lecture.js](../README.md) > [Documentation](README.md) > **Module API**

---

This section documents the modules of lecture.js and their private and public functions.

# Documentation

This API documentation of the modules is automatically generated from *JSDoc* comments inside the source code. To update this documentation, install the npm module [jsdoc-to-markdown](https://www.npmjs.com/package/jsdoc-to-markdown). Then just simply run the \`generate.bat\` or \`generate.js\` file in this directory. This will update and overwrite this documentation file.

# Module Usage

The \`/lecture.js/src/pipeline/\` module is the pipeline that calls all the other modules located in \`/lecture.js/src/\` to generate a lecture.

Each module provides a set of public functions that can be included and used separately from all other modules (excluding the *pipeline*, *parser*, and *preprocessor* modules, which require other lecture.js modules to work). To use a module by itself, the following files and directories must also be present, as they are dependencies to most of the modules:
- \`/lecture.js/src/.global/\`
- \`/lecture.js/src/node_modules/\`
- \`/lecture.js/src/package.json\`
- \`/lecture.js/src/package-lock.json\`

If you want to use a module by itself, for example, the *text-to-speech* module, you only need to require the \`main.js\` script inside the module directory, e.g.:
\`\`\`javascript
const tts = require('./src/text-to-speech/main.js');
\`\`\`
The other scripts in the module directory are already required by the main script and contain "private", non-relevant functions that should not be exposed outside the module.`;
    
    _.logger.message(`Generating markdown...`);
    
    // generate markdown
    let doc = null;
    try {
        doc = await _.jsdoc2md.render({
            files : script_paths,
            'heading-depth' : 1,
            'example-lang' : 'js',
            separators : true,
            'module-index-format' : 'table',
            'global-index-format' : 'table',
            'param-list-format' : 'table',
            'property-list-format' : 'grouped',
            'member-index-format' : 'grouped'
        });
    }
    catch (err) {
        _.logger.error(`Failed generating the documentation, because: ${err}`);
        return false;
    }
    
    // format the documentation
    output = (output + EOL + EOL + doc)
            // change all line endings to \r\n
            .replace(/(?:\r\n|\r|\n)/g, "\r\n")
            // remove certain Unicode characters
            .replace(/[⏏\u23CF\uFE0F]+/g, '');
    
    // generate the output directory if it does not yet exist
    const output_directory = _.path.dirname(options.output_file);
    if (!_.fs.existsSync(output_directory)) {
        _.fs.mkdirSync(output_directory, {
            recursive : true
        });
    }

    // save the generated documentation as a markdown file
    _.fs.writeFileSync(options.output_file, output);
    _.logger.message(`Generated the documentation at "${options.output_file}"`);
    
    return true;
};

/**
 * generates the documentation for the project
 *
 * @async
 * @function
 * @alias module:documentation
 * @category private
 * 
 * @returns {Promise.<undefined>}
 */
const main = async() => {

    // try generate the documentation
    const success = await generateDocumentation({
        input_directory : _.path.join(__dirname, '..', 'src'),
        output_file     : _.path.join(__dirname, 'module-api.md')
    });
    
    // if it was not successfully generated, exit with an error code
    if (!success) {
        _.logger.fatal(`The process finished unsuccessfully`);
        process.exit(1);
    }
    
    _.logger.message(`Finished the process`);
    process.exit(0);
};

main();