/**
 * @module validator/tests
 * @desc testing suite for the validator
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
_.basic     = require('../.global/basic-utilities.js');
_.format    = require('../.global/formatting-codes.js');
_.requester = require('../.global/requester.js');

// lecture.js modules
_.validator = require('./main.js');



/*
 * =========
 * CONSTANTS
 * =========
 */

const EOL = _.os.EOL;

// location at which temporary XML test files are created
const TEST_FOLDER = _.path.join(__dirname, '.tests');



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

// number of total requests opened until this point 
// (includes already-closed-again requests)
let COUNTER = 0;

// tests with XML for which validation should pass
const PASS_TEST = [];

// tests with XML for which validation should fail
const FAIL_TEST = [];



/*
 * =====
 * TESTS
 * =====
 */

/*
 * <say-as>
 */

PASS_TEST.push({
    name : `<say-as>`,
    content : `
        <say-as interpret-as="cardinal">a</say-as>
        <say-as interpret-as="ordinal">a</say-as>
        <say-as interpret-as="characters">a</say-as>
        <say-as interpret-as="spell-out">a</say-as>
        <say-as interpret-as="fraction">a</say-as>
        <say-as interpret-as="expletive">a</say-as>
        <say-as interpret-as="unit">a</say-as>
        <say-as interpret-as="date">a</say-as>
        <say-as interpret-as="time">a</say-as>
        <say-as interpret-as="telephone">a</say-as>`
});

FAIL_TEST.push({
    name : `<say-as> no content`,
    content : `<say-as interpret-as="cardinal" />`
});

FAIL_TEST.push({
    name : `<say-as> no 'interpret-as' value`,
    content : `<say-as>2</say-as>`
});

FAIL_TEST.push({
    name : `<say-as> invalid 'interpret-as' value`,
    content : `<say-as interpret-as="abcdefg" />`
});

/*
 * <video>
 */

PASS_TEST.push({
    name : `<video>`,
    content : `
        <video src="video.mp4" keepFrame="true" />
        <video src="video.mp4" clipBegin="00:00:04" />
        <video src="video.mp4" clipEnd="00:00:04" />
        <video src="video.mp4" clipBegin="05:01:10.500" />
        <video src="video.mp4" clipEnd="99:99:99.999" />`
});

FAIL_TEST.push({
    name : `<video> no source`,
    content : `<video />`
});

FAIL_TEST.push({
    name : `<video> wrong timestamp`,
    content : `<video src="video.mp4" clipBegin="00:00:000" />`
});



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * adds a valid <lecture>, <info />, <settings /> and <deck /> element to an XML string
 *
 * @async
 * @function
 * @alias module:validator/tests
 * @category private
 *
 * @returns {string} xml - input XML string
 * @returns {string} output XML string
 */
const addAllTags = xml => {
    xml = addDeckTag(xml);
    xml = addSettingsTag(xml);
    xml = addInfoTag(xml);
    xml = addLectureTag(xml);
    return xml;
};

/**
 * wraps the given XML into a valid <lecture> element
 *
 * @async
 * @function
 * @alias module:validator/tests
 * @category private
 *
 * @returns {string} xml - input XML string
 * @returns {string} output XML string
 */
const addLectureTag = xml => {
    return `<lecture>${xml}</lecture>`;
};

/**
 * adds a valid <info /> element to an XML string
 *
 * @async
 * @function
 * @alias module:validator/tests
 * @category private
 *
 * @returns {string} xml - input XML string
 * @returns {string} output XML string
 */
const addInfoTag = xml => {
    return `
<info 
  title="An example lecture name"
/>

${xml}`;
};

/**
 * adds a valid <settings /> element to an XML string
 *
 * @async
 * @function
 * @alias module:validator/tests
 * @category private
 *
 * @returns {string} xml - input XML string
 * @returns {string} output XML string
 */
const addSettingsTag = xml => {
    return `
<settings 
  voice="google-de-de-wavenet-b"
  resolution="1920x1080"
  fps="60"
/>

${xml}`;
};

/**
 * adds a valid <deck /> element to an XML string
 *
 * @async
 * @function
 * @alias module:validator/tests
 * @category private
 *
 * @returns {string} xml - input XML string
 * @returns {string} output XML string
 */
const addDeckTag = xml => {
    return `
<deck id="slides1" src="slides1.pdf" active="true" />

${xml}`;
};

/**
 * runs all defined tests that should pass
 *
 * @async
 * @function
 * @alias module:validator/tests
 * @category private
 *
 * @returns {Promise.<undefined>}
 */
const runPassingTests = async() => {
    
    let requests = [];
    
    _.basic.forEachAsync(PASS_TEST, async(test) => {
        
        COUNTER++;
        
        let xml = test.content;
        
        if (test.addAll === undefined || test.addAll) {
            xml = addAllTags(xml);
        }
        else {
            if (test.addLecture)  xml = addLectureTag(xml);
            if (test.addSettings) xml = addSettingsTag(xml);
            if (test.addInfo)     xml = addInfoTag(xml);
            if (test.addDeck)     xml = addDeckTag(xml);
        }
        
        // create a test file with the XML
        const test_file_path = _.path.join(TEST_FOLDER, COUNTER+'.xml');
        _.fs.writeFileSync(test_file_path, xml);
        
        // function called once request is over
        const callback = output => {
            if (!output) {
                console.log(_.format.brightRed + ` Failed: ${test.name}` + _.format.reset);
                return;
            }
            console.log(_.format.brightGreen + ` Successfully passed: ${test.name}`+ _.format.reset);
        };

        const options = {
            xml_path        : test_file_path,
            print_errors    : true,
            print_results   : false,
            keep_temp_files : false
        };
        
        // generate the validation request
        requests.push({
            function : _.validator.validate,
            parameters : [options],
            callback : callback,
            callback_parameters : []
        });
    });
    
    // run all volume adjusting requests in parallel
    if (requests.length > 0) {
        console.info(EOL + `Running tests that should pass...`);
        
        // run the requests in parallel
        await _.requester.run(
            requests,
            { max_concurrent : 7,
              max_per_second : 5 }
        );
    }
};

/**
 * runs all defined tests that should fail
 *
 * @async
 * @function
 * @alias module:validator/tests
 * @category private
 *
 * @returns {Promise.<undefined>}
 */
const runFailingTests = async() => {
    
    let requests = [];
    
    _.basic.forEachAsync(FAIL_TEST, async(test) => {
        
        COUNTER++;
        
        let xml = test.content;
        
        if (test.addAll === undefined || test.addAll) {
            xml = addAllTags(xml);
        }
        else {
            if (test.addLecture)  xml = addLectureTag(xml);
            if (test.addSettings) xml = addSettingsTag(xml);
            if (test.addInfo)     xml = addInfoTag(xml);
            if (test.addDeck)     xml = addDeckTag(xml);
        }
        
        // create a test file with the XML
        const test_file_path = _.path.join(TEST_FOLDER, COUNTER+'.xml');
        _.fs.writeFileSync(test_file_path, xml);
        
        // function called once request is over
        const callback = output => {
            if (output) {
                console.log(_.format.brightRed + ` Wrongly passed: ${test.name}`+ _.format.reset);
                return;
            }
            console.log(_.format.brightGreen + ` Successfully failed: ${test.name}` + _.format.reset);
        };
        
        const options = {
            xml_path        : test_file_path,
            print_errors    : false,
            print_results   : false,
            keep_temp_files : false
        };
        
        // generate the validation request
        requests.push({
            function : _.validator.validate,
            parameters : [options],
            callback : callback,
            callback_parameters : []
        });
    });
    
    // run all volume adjusting requests in parallel
    if (requests.length > 0) {
        console.info(EOL + `Running tests that should fail...`);
        
        // run the requests in parallel
        await _.requester.run(
            requests,
            { max_concurrent : 7,
              max_per_second : 5 }
        );
    }
};


/**
 * runs all defined tests
 *
 * @async
 * @function
 * @alias module:validator/tests
 * @category private
 *
 * @returns {Promise.<undefined>}
 */
const runTests = async() => {
    
    // create a folder holding the test files, if not yet existant
    if (!_.fs.existsSync(TEST_FOLDER)) {
        _.fs.mkdirSync(TEST_FOLDER);
    }
    
    // clear folder with test files
    _.basic.clearDirectory(TEST_FOLDER, {
        ignore_files : ['.gitignore']
    });
    
    console.log(
        EOL + EOL +
        `=====================` + EOL +
        `=== TESTING SUITE ===` + EOL +
        `=====================`    
    );
    
    // start running the tests
    await runPassingTests();
    await runFailingTests();
    
    console.log('');
};

runTests();