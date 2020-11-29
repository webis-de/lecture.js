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

// array holding all tests for which validation should pass
const PASS_THIS = [];

// array holding all tests for which validation should fail
const DO_NOT_PASS_THIS = [];



/*
 * ================
 * TEST DEFINITIONS
 * ================
 */

/*
 * <image>
 */

PASS_THIS.push({
    name : `<image> attribute 'src'`,
    content : `
        <image src="image.png" />
        <image src="path/to/image.png" />
        <image src="/path/to/image.png" />
        <image src="C:/path/to/image.png" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> no 'src' attribute`,
    content : `<video />`
});

DO_NOT_PASS_THIS.push({
    name : `<image> with content`,
    content : `<image src="image.png">content</image>`
});

PASS_THIS.push({
    name : `<video> attribute 'fit'`,
    content : `
        <image src="image.png" fit="contain" />
        <image src="image.png" fit="cover" />
        <image src="image.png" fit="fill" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> invalid value for attribute 'fit'`,
    content : `
        <image src="image.png" fit="abc" />`
});



/*
 * <lang> (and LSML-custom language elements)
 */

PASS_THIS.push({
    name : `<lang> attribute 'xml:lang'`,
    content : `
        <lang xml:lang="de"></lang>
        <lang xml:lang="de-DE"></lang>
        <lang xml:lang="en"></lang>
        <lang xml:lang="en-US"></lang>`
});

DO_NOT_PASS_THIS.push({
    name : `<lang> no language defined as attribute`,
    content : `<lang></lang>`
});

DO_NOT_PASS_THIS.push({
    name : `<lang> no content`,
    content : `<lang />`
});

PASS_THIS.push({
    name : `<de>, <de-DE>, <en>, <en-US>`,
    content : `
        <de></de>
        <de-DE></de-DE>
        <en></en>
        <en-US></en-US>`
});



/*
 * <say-as>
 */

PASS_THIS.push({
    name : `<say-as> attribute 'interpret-as'`,
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

PASS_THIS.push({
    name : `<say-as> attributes 'format', 'detail'`,
    content : `
        <say-as interpret-as="date" format="ymd" detail="1">2020, November 29.</say-as>
        <say-as interpret-as="date" format="dmy">29. November, 2020</say-as>`
});

DO_NOT_PASS_THIS.push({
    name : `<say-as> no content`,
    content : `<say-as interpret-as="cardinal" />`
});

DO_NOT_PASS_THIS.push({
    name : `<say-as> no 'interpret-as' value`,
    content : `<say-as>2</say-as>`
});

DO_NOT_PASS_THIS.push({
    name : `<say-as> invalid 'interpret-as' value`,
    content : `<say-as interpret-as="abcdefg">content</say-as>`
});



/*
 * <slide>
 */

PASS_THIS.push({
    name : `<slide> attribute 'page'`,
    content : `
        <slide page="1" />
        <slide page="10" />
        <slide page="+1" />
        <slide page="+10" />
        <slide page="-1" />
        <slide page="-10" />
        <slide page="next" />
        <slide page="previous" />
        <slide page="first" />
        <slide page="last" />`
});

DO_NOT_PASS_THIS.push({
    name : `<slide> no 'src' attribute`,
    content : `<slide />`
});

DO_NOT_PASS_THIS.push({
    name : `<slide> with content`,
    content : `<slide page="1">content</slide>`
});

PASS_THIS.push({
    name : `<slide> attribute 'deck'`,
    content : `
        <slide page="1" deck="abc" />`
});

PASS_THIS.push({
    name : `<slide> attribute 'fit'`,
    content : `
        <slide page="1" fit="contain" />
        <slide page="1" fit="cover" />
        <slide page="1" fit="fill" />`
});

DO_NOT_PASS_THIS.push({
    name : `<slide> invalid value for attribute 'fit'`,
    content : `
        <slide page="1" fit="abc" />`
});



/*
 * <video>
 */

PASS_THIS.push({
    name : `<video> attribute 'src'`,
    content : `
        <video src="video.mp4" />
        <video src="path/to/video.mp4" />
        <video src="/path/to/video.mp4" />
        <video src="C:/path/to/video.mp4" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> no 'src' attribute`,
    content : `<video />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> Linux tilde-absolute path in attribute 'src'`,
    content : `
        <video src="~path/to/video.mp4" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> with content`,
    content : `<video src="video.mp4">content</video>`
});

PASS_THIS.push({
    name : `<video> attributes 'keepFrame'`,
    content : `
        <video src="video.mp4" keepFrame="true" />
        <video src="video.mp4" keepFrame="false" />`
});

PASS_THIS.push({
    name : `<video> attribute 'clipBegin', 'clipEnd'`,
    content : `
        <video src="video.mp4" clipBegin="2ms" />
        <video src="video.mp4" clipEnd="2ms" />
        <video src="video.mp4" clipBegin="4s" />
        <video src="video.mp4" clipEnd="4s" />
        <video src="video.mp4" clipBegin="00:00:04" />
        <video src="video.mp4" clipEnd="00:00:04" />
        <video src="video.mp4" clipBegin="05:01:10.500" />
        <video src="video.mp4" clipEnd="99:99:99.999" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> space character in 'clipBegin' attribute`,
    content : `<video src="video.mp4" clipBegin="5s " />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> wrong SSML-style timestamp`,
    content : `<video src="video.mp4" clipBegin="5k" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> wrong FFmpeg-style timestamp`,
    content : `<video src="video.mp4" clipBegin="00:00:000" />`
});

PASS_THIS.push({
    name : `<video> attribute 'speed'`,
    content : `
        <video src="video.mp4" speed="50%" />
        <video src="video.mp4" speed="100%" />
        <video src="video.mp4" speed="200%" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> value too high for attribute 'speed'`,
    content : `
        <video src="video.mp4" speed="201%" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> value too low for attribute 'speed'`,
    content : `
        <video src="video.mp4" speed="49%" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> invalid value for attribute 'speed'`,
    content : `
        <video src="video.mp4" speed="+100%" />`
});

PASS_THIS.push({
    name : `<video> attribute 'soundLevel'`,
    content : `
        <video src="video.mp4" soundLevel="+50dB" />
        <video src="video.mp4" soundLevel="-50dB" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> value too high for attribute 'soundLevel'`,
    content : `
        <video src="video.mp4" soundLevel="+51dB" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> value too low for attribute 'soundLevel'`,
    content : `
        <video src="video.mp4" soundLevel="-51dB" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> invalid value for attribute 'soundLevel'`,
    content : `
        <video src="video.mp4" soundLevel="50%" />`
});

PASS_THIS.push({
    name : `<video> attribute 'repeatCount'`,
    content : `
        <video src="video.mp4" repeatCount="1" />
        <video src="video.mp4" repeatCount="10" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> number '0' for attribute 'repeatCount'`,
    content : `
        <video src="video.mp4" repeatCount="0" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> invalid value for attribute 'repeatCount'`,
    content : `
        <video src="video.mp4" repeatCount="a" />`
});

PASS_THIS.push({
    name : `<video> attribute 'fit'`,
    content : `
        <video src="video.mp4" fit="contain" />
        <video src="video.mp4" fit="cover" />
        <video src="video.mp4" fit="fill" />`
});

DO_NOT_PASS_THIS.push({
    name : `<video> invalid value for attribute 'fit'`,
    content : `
        <video src="video.mp4" fit="abc" />`
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
    
    const requests = [];
    let passed = 0;
    
    _.basic.forEachAsync(PASS_THIS, async(test) => {
        
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
            }
            else {
                console.log(_.format.brightGreen + ` Successfully passed: ${test.name}`+ _.format.reset);
                passed++;
            }
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
            { max_concurrent : 10,
              max_per_second : 7 }
        );
    }
    
    return {
        total : PASS_THIS.length,
        passed : passed
    };
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
    
    const requests = [];
    let passed = 0;
    
    _.basic.forEachAsync(DO_NOT_PASS_THIS, async(test) => {
        
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
            }
            else {
                console.log(_.format.brightGreen + ` Successfully failed: ${test.name}` + _.format.reset);
                passed++;
            }
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
            { max_concurrent : 10,
              max_per_second : 7 }
        );
    }
    
    return {
        total : DO_NOT_PASS_THIS.length,
        passed : passed
    };
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
(async() => {
    
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
    
    // run the tests for code segments that are valid
    const {total, passed} = await runPassingTests();
    if (total !== passed) {
        console.log(`Failed ${(total - passed)} tests of ${total}`);
    }
    
    // run the tests for code segments that are invalid
    const {total : total2, passed : passed2} = await runFailingTests();
    if (total2 !== passed2) {
        console.log(`Failed ${(total2 - passed2)} tests of ${total2}`);
    }
    
    // print an empty line at the end
    console.log('');
})();