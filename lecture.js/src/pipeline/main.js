/**
 * @module pipeline
 * @desc accesses all modules to generate a video lecture from input files
 *
 * @example
 * const _ = {};
 * _.pipeline = require('/pipeline/main.js');
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
_.basic         = require('../.global/basic-utilities.js');
_.type          = require('../.global/type-tests.js');
_.logger        = require('../.global/logger.js');
_.ffmpeg        = require('../.global/ffmpeg-worker.js');
_.pdf_worker    = require('../.global/pdf-worker.js');
_.timestamp     = require('../.global/timestamp.js');
_.requester     = require('../.global/requester.js');
_.environment   = require('../.global/environment.js');
_.xml_converter = require('../.global/xml-converter.js');

// configuration scripts
_.configurator = require('./configurator.js');
_.cli_worker   = require('./cli-worker.js');

// modules of the pipeline
_.validator    = require('../validator/main.js');
_.preprocessor = require('../preprocessor/main.js');
_.parser       = require('../parser/main.js');
_.tts          = require('../text-to-speech/main.js');
_.tts_cache    = require('../text-to-speech/caching.js');
_.video        = require('../video-manager/main.js');
_.uploader     = require('../uploader/main.js');

// npm modules
_.is_online = require('is-online');



/*
 * =========
 * CONSTANTS
 * =========
 */

const VERSION = '1.0.1';



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

// object holding the command line arguments
let ARGS = {};
// objects holding values loaded from the config file
let CONFIGURATION = {};
// data parsed from the input XML file
let DATA = {};
// cache mode to use for all Text-to-Speech requests
let CACHE_MODE = null;

// directory paths
let FRAMES_DIRECTORY = '';
let AUDIO_DIRECTORY = '';
let CLIPS_DIRECTORY = '';



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * generates a file with all logs from the run-time and 
 * a file with the internal data in the output directory
 *
 * @async
 * @function
 * @alias module:pipeline
 * @category private
 */
const createOutputLog = () => {
    
    // check if to output a log file with all logs from runtime
    if (CONFIGURATION.generic.outputLogFile) {
        const file_path = _.path.join(ARGS.output, 'log.txt');
        _.logger.writeLogsToFile(file_path);
    }
    
    // check if the data should also be outputted as a JSON file
    if (CONFIGURATION.generic.outputData) {
        const file_path = _.path.join(ARGS.output, 'data.json');
        _.fs.writeFileSync(file_path, JSON.stringify(DATA, null, 4));
    }
};

/**
 * generates an audio sample
 *
 * @async
 * @function
 * @alias module:pipeline
 * @category private
 * 
 * @param {string} voice - voice used to render the text
 * @param {string} text - text content to be rendered as speech
 * @param {ssml|text} type - type of the content: either SSML or plaintext
 * @returns {boolean} true on success
 */
const generateSample = async(voice, text, type) => {
    
    _.logger.message(`Trying to generated an MP3 audio sample...`);

    // detect errors with the input parameters
    let errors = [];
    
    if (!_.type.isString(voice)) {
        _.logger.warn(`--voice: No voice to use is defined, so it'll use the defaultVoice "${CONFIGURATION.audio.defaultVoice}" defined in configuration file`);
        voice = CONFIGURATION.audio.defaultVoice;
    }
    
    if (!(await _.tts.voiceExists(voice))) {
        errors.push(`--voice: Voice "${voice}" does not exist`);
    }
    
    if (!_.type.isString(text)) {
        errors.push(`--text: No text defined to render`);
    }
    else if (text.length === 0) {
        errors.push(`--text: Must be at least 1 character long`);
    }
    else if (type === 'ssml') {
        if (!_.xml_converter.isValidXML(text)) {
            errors.push(`--text: Failed to be parsed as SSML content`);
        }
        else {
            let parsed = _.xml_converter.xml2json(text);
            if (parsed && parsed.elements[0].name !== 'speak') { 
                errors.push(`--text: Expected <speak> as the root element`);
            }
        }
    }
    
    if (errors.length > 0) {
        _.logger.errorMultiple(errors);
        _.logger.fatal(`Failed creating the MP3 audio sample`);
        return false;
    }
    
    const dir_path = _.path.join(__dirname, '..', '..', '.sample');
    if (!_.fs.existsSync(dir_path)) {
        _.fs.mkdirSync(dir_path);
    }
    
    const file_path = _.path.join(dir_path, `${voice}-${
        text
            .replace(/(^[ \s\n\r\t]*<speak>)|(<\/speak>[ \s\n\r\t]*$)/gi, '')
            .replace(/[^a-z0-9]{1}/gi, '')
            .replace(/[\s\n\r\t]+/g, '-')
            .substr(0,14)
    }-${Date.now()}.mp3`);
    
    const success = await _.tts.createMP3Strictly({
        output_path   : file_path,
        voice_name    : voice,
        content       : text,
        type          : type,
        save_in_cache : false
    });
    
    if (!success) {
        _.logger.fatal(`Failed creating the MP3 audio sample`);
        return false;
    }
    
    _.logger.message(`Created the MP3 audio sample at "${file_path}"`);
    
    return true;
};

/**
 * creates directories for the output files
 *
 * @async
 * @function
 * @alias module:pipeline
 * @category private
 * 
 * @param {Object} path - absolute path to the input XML file
 */
const validateInput = async(path) => {

    // check if validator is enabled
    if (!CONFIGURATION.generic.enableValidator) {
        return;
    }

    // check if Java is installed
    if (!(await _.environment.javaIsInstalled())) {
        _.logger.fatal(`Failed to validate input XML, because Java is not installed. Disable the validator in the configuration file to prevent this error.`);
        process.exit(1);
    }
    
    // clears any remaining temporary files created by the validator
    _.validator.clearTemporaryFiles();

    // validate the input XML file for LSML syntax
    _.logger.message(`Validating the input file using a XSD schema...`);
    let is_valid = await _.validator.validate({
        xml_path        : path,
        print_errors    : true,
        print_results   : true,
        keep_temp_files : true
    });

    // exit with error, if the input file is not valid
    if (!is_valid) {
        let schema_path = _.validator.getSchemaPath();
        _.logger.fatal(`Input file failed validation`);
        process.exit(1);
    }
    
    _.logger.message(`Successfully validated the input file`);
};

/**
 * parses the input file
 *
 * @async
 * @function
 * @alias module:pipeline
 * @category private
 * 
 * @returns {Object} data
 */
const parseInput = async() => {

    // parse meta information in input XML file
    _.logger.message(`Parsing meta information...`);
    let meta = await _.parser.parseMeta(ARGS.input);
    if (!meta) {
        _.logger.fatal(`Failed to parse the meta data from the input file`);
        process.exit(1);
    }
    meta.settings.defaultKeepFrame = CONFIGURATION.video.defaultKeepFrame;
    
    // convert resolution string into an object
    if (meta.settings.resolution) {
        meta.settings.resolution = _.video.parseResolutionString(meta.settings.resolution);
    }
    else {
        meta.settings.resolution = {
            width : undefined,
            height : undefined
        };
    }
        
    // determine video settings from the input XML file or the configuration
    const defaultResolution = _.video.parseResolutionString(CONFIGURATION.video.defaultResolution);
    // and check if a valid video resolution is available
    let invalid_resolution = false;
    
    if (!_.video.isValidWidth(meta.settings.resolution.width)) {
        _.logger.message(`Video width "${meta.settings.resolution.width}" is not valid`);
        invalid_resolution = true;
    }
    
    if (!_.video.isValidHeight(meta.settings.resolution.height)) {
        _.logger.message(`Video height "${meta.settings.resolution.width}" is not valid`);
        invalid_resolution = true;
    }
    
    if (invalid_resolution) {   
        _.logger.info(`Set resolution to default resolution in configuration "${defaultResolution.width}x${defaultResolution.height}"`);
        meta.settings.resolution.width = defaultResolution.width;
        meta.settings.resolution.height = defaultResolution.height;
    }
    
    if (!_.video.isValidFPS(meta.settings.fps)) {
        _.logger.message(`Video FPS "${meta.settings.fps}" is not valid`);
        _.logger.info(`Set FPS to default value in configuration "${CONFIGURATION.video.defaultFPS}"`);
        meta.settings.fps = CONFIGURATION.video.defaultFPS;
    }
    
    _.logger.info(`Output video will have the resolution "${meta.settings.resolution.width}x${meta.settings.resolution.height}" at ${meta.settings.fps} FPS`);
    
    // apply google effects profile is defined in the input XML
    if (meta.settings.googleEffectProfile) {
        const success = _.tts.setGoogleEffectProfile(meta.settings.googleEffectProfile);
        if (!success) {
            _.logger.warn(`Ignored <settings googleEffectProfile="${meta.settings.googleEffectProfile}" /> attribute, because the profile is invalid`);
        }
    }

    // generate identifying information
    meta.uuid = _.basic.getUUIDv4();
    meta.date = _.basic.stringifyFullDate(new Date());

    // get settings for the preprocessor
    let break_between_slides = CONFIGURATION.audio.defaultBreakAfterSlide;
    if (meta.settings.breakAfterSlide) {
        if (_.type.isInteger(meta.settings.breakAfterSlide) && meta.settings.breakAfterSlide >= 0) {
            break_between_slides = meta.settings.breakAfterSlide;
        }
        else {
            _.logger.warn(`Ignored <settings breakAfterSlide="${meta.settings.breakAfterSlide}" /> attribute, because the value is not a positive integer`);
        }
    }
    let break_between_paragraphs = CONFIGURATION.audio.defaultBreakAfterParagraph;
    if (meta.settings.breakAfterParagraph) {
        if (_.type.isInteger(meta.settings.breakAfterParagraph) && meta.settings.breakAfterParagraph >= 0) {
            break_between_paragraphs = meta.settings.breakAfterParagraph;
        }
        else {
            _.logger.warn(`Ignored <settings breakAfterParagraph="${meta.settings.breakAfterParagraph}" /> attribute, because the value is not a positive integer`);
        }
    }
    
    // preprocess the input XML file
    _.logger.message(`Preprocessing input XML...`);
    const preprocessed_xml = await _.preprocessor.process({
        input_path               : ARGS.input,
        lexicons                 : meta.lexicons,
        default_voice            : meta.settings.voice ? meta.settings.voice : CONFIGURATION.audio.defaultVoice,
        break_between_slides     : break_between_slides,
        break_between_paragraphs : break_between_paragraphs
    });
    if (!preprocessed_xml) {
        _.logger.fatal(`Failed preprocessing the XML input`);
        process.exit(1);
    }

    // parse the input XML file
    const data = await _.parser.parse(
        meta, 
        preprocessed_xml, 
        _.path.dirname(ARGS.input),
        CONFIGURATION
    );
    if (!data) {
        _.logger.fatal(`Failed parsing the input file`);
        process.exit(1);
    }
    
    // merge data and meta objects
    meta.marks.content = data.marks;
    meta.resources = {
        video : data.video_resources,
        image : data.image_resources,
        audio : data.audio_resources
    };
    meta.chapters = data.chapters;
    meta.sections = data.sections;
    
    return {
        parsed_data      : meta,
        preprocessed_xml : preprocessed_xml
    };
};

/**
 * creates directories for the output files
 *
 * @async
 * @function
 * @alias module:pipeline
 * @category private
 * 
 * @returns {Promise.<undefined>}
 */
const createDirectories = async() => {
            
    if (!ARGS.nowrap) {
        
        // wrap the output files in an extra folder inside the user-defined output folder
        ARGS.output = _.path.join(
            ARGS.output,
            (
                DATA.date.replace(/[^a-z0-9]{1}/gi, '') + '-' +
                encodeURIComponent(
                    DATA.info.title.replace(/[\s\n\r\t]+/g, '-').substring(0, 30)
                )
            ).toLowerCase()
        );

        // if directory already exists, append an increasing number to the end of its name
        // until it gets to a directory name that does not yet exist
        let counter = 0;
        let output_dir = ARGS.output;
        while (_.fs.existsSync(output_dir)) {
            counter++;
            output_dir = `${ARGS.output}-${counter}`;
        }
        ARGS.output = output_dir;
    }

    // create the output directory, if it not already exists
    _.basic.createDirectory(ARGS.output);

    // create a sub-directory for the image files
    FRAMES_DIRECTORY = _.path.join(ARGS.output, 'frames');
    if (!_.fs.existsSync(FRAMES_DIRECTORY)) {
        _.fs.mkdirSync(FRAMES_DIRECTORY);
    }
    else {
        _.logger.warn(`Frames directory "${FRAMES_DIRECTORY}" could not be created as it already exists. The output directory is not empty, so files may be overwritten!`);
    }

    // create a sub-directory for the audio files
    AUDIO_DIRECTORY = _.path.join(ARGS.output, 'audio');
    if (!_.fs.existsSync(AUDIO_DIRECTORY)) {
        _.fs.mkdirSync(AUDIO_DIRECTORY);
    }
    else {
        _.logger.warn(`Audio directory "${AUDIO_DIRECTORY}" could not be created as it already exists. The output directory is not empty, so files may be overwritten!`);
    }

    // create a sub-directory for the image files
    CLIPS_DIRECTORY = _.path.join(ARGS.output, 'clips');
    if (!_.fs.existsSync(CLIPS_DIRECTORY)) {
        _.fs.mkdirSync(CLIPS_DIRECTORY);
    }
    else {
        _.logger.warn(`Clips directory "${CLIPS_DIRECTORY}" could not be created as it already exists. The output directory is not empty, so files may be overwritten!`);
    }
};

/**
 * converts all embedded video clips to the right codecs and settings
 *
 * @async
 * @function
 * @alias module:pipeline
 * @category private
 *
 * @returns {Promise.<undefined>}
 */
const convertVideoClips = async() => {
    
    // generate all requests to convert embedded video resources
    let counter = 0;
    let requests = [];
    DATA.resources.video.forEach(video => {
        
        counter++;
        
        // convert all variants
        Object.keys(video.variants).forEach(variant_key => {
            
            const variant = video.variants[variant_key];

            // create and save the output path for the converted video
            const output_path = _.path.join(CLIPS_DIRECTORY, 'resource-' + (counter+'').padStart(3, '0') + '-' + variant_key.replace(/[^a-z0-9\-]+/gi, '_') + '.mp4');
            video.variants[variant_key].path = output_path;

            // generate a log file at this path
            let log_path = _.basic.replaceFileExtension(output_path, 'txt');
            log_path = _.basic.appendToFilename(log_path, '.log');

            // create the conversion options object
            const options = {
                input_path  : video.path,
                output_path : output_path,
                width       : DATA.settings.resolution.width,
                height      : DATA.settings.resolution.height,
                fps         : DATA.settings.fps,
                fit         : variant.fit,
                log_path    : CONFIGURATION.generic.outputFFmpegLogs ? log_path : undefined
            };
            
            // determine if and how to trim the video
            if (variant.clipBegin !== 'START') options.begin_time = variant.clipBegin;
            if (variant.clipEnd !== 'END') options.end_time = variant.clipEnd;

            // generate a conversion request
            requests.push({
                function : _.ffmpeg.convertVideo,
                parameters : [options],
                callback : (output, original_path, converted_path) => {
                    if (!output || !output.success) {
                        _.logger.fatal(`Failed converting/trimming "${original_path}"`);
                        createOutputLog();
                        process.exit(1);
                    }
                    _.logger.message(`Converted/trimmed "${original_path}" to "${_.path.basename(converted_path)}"`);
                },
                callback_parameters : [video.path, output_path]
            });
        });
    });
    
    // if no conversions are needed, no trimming will be needed either
    if (requests.length == 0) return;
    
    // run the conversion requests in parallel
    _.logger.info(`Converting/trimming embedded video clips...`);
    await _.requester.run(
        requests,
        { max_concurrent : 3,
          max_per_second : 2 }
    );
    
    // generate all requests for setting the volume of embedded video resources
    requests = [];
    DATA.sections.forEach(section => {
        
        if (
            section.type !== 'video' || 
            section.soundLevel === undefined
        ) {
            return;
        }
        
        // generate a new file
        const input_path = DATA.resources.video[section.video_id].variants[section.video_variant].path;
        const new_variant_key = `${section.video_variant}-${section.soundLevel}`;
        const output_path = _.basic.appendToFilename(input_path, `-${section.soundLevel}`);
        
        // don't generate the file again, if a file with the same soundLevel already exists
        section.video_variant = new_variant_key;
        if (DATA.resources.video[section.video_id].variants[new_variant_key]) return;
        DATA.resources.video[section.video_id].variants[new_variant_key] = {
            path : output_path
        };
        
        // generate a log file at this path
        let log_path = _.basic.replaceFileExtension(output_path, 'txt');
        log_path = _.basic.appendToFilename(log_path, '.log');
        
        // generate options object
        const options = {
            input_path  : input_path,
            output_path : output_path,
            volume      : section.soundLevel,
            log_path    : CONFIGURATION.generic.outputFFmpegLogs ? log_path : undefined
        };
        
        // function called once the request is completed
        const callback = (output, input_path, output_path, soundLevel) => {
            if (!output || !output.success) {
                _.logger.fatal(`Failed setting sound level (volume) of video "${input_path}" to ${soundLevel}`);
                createOutputLog();
                process.exit(1);
            }
            _.logger.message(`Set sound level (volume) of "${input_path}" to ${soundLevel} at "${_.path.basename(output_path)}"`);
        };

        // add a new request for trimming an embedded video clip
        requests.push({
            function : _.ffmpeg.changeVolume,
            parameters : [options],
            callback : callback,
            callback_parameters : [input_path, output_path, section.soundLevel]
        });
    });
    
    // run all volume adjusting requests in parallel
    if (requests.length > 0) {
        _.logger.info(`Changing sound level (volume) of embedded video clips...`);
        
        // run the requests in parallel
        await _.requester.run(
            requests,
            { max_concurrent : 3,
              max_per_second : 2 }
        );
    }
    
    // generate all requests for setting the speed of embedded video resources
    requests = [];
    DATA.sections.forEach(section => {
        
        if (
            section.type !== 'video' || 
            section.speed === undefined
        ) {
            return;
        }
        
        // generate a new file
        const input_path = DATA.resources.video[section.video_id].variants[section.video_variant].path;
        const new_variant_key = `${section.video_variant}-${section.speed}%`;
        const output_path = _.basic.appendToFilename(input_path, `-${section.speed}%`);
        
        // don't generate the file again, if a file with the same speed already exists
        section.video_variant = new_variant_key;
        if (DATA.resources.video[section.video_id].variants[new_variant_key]) return;
        DATA.resources.video[section.video_id].variants[new_variant_key] = {
            path : output_path
        };
        
        // generate a log file at this path
        let log_path = _.basic.replaceFileExtension(output_path, 'txt');
        log_path = _.basic.appendToFilename(log_path, '.log');
        
        // generate options object
        const options = {
            input_path  : input_path,
            output_path : output_path,
            speed       : section.speed,
            log_path    : CONFIGURATION.generic.outputFFmpegLogs ? log_path : undefined
        };
        
        // function called once the request is completed
        const callback = (output, input_path, output_path, speed) => {
            if (!output || !output.success) {
                _.logger.fatal(`Failed setting speed of video "${input_path}" to ${speed}%`);
                createOutputLog();
                process.exit(1);
            }
            _.logger.message(`Set speed of "${input_path}" to ${speed}% at "${_.path.basename(output_path)}"`);
        };

        // add a new request for trimming an embedded video clip
        requests.push({
            function : _.ffmpeg.changeVideoSpeed,
            parameters : [options],
            callback : callback,
            callback_parameters : [input_path, output_path, section.speed]
        });
    });
    
    // run all volume adjusting requests in parallel
    if (requests.length > 0) {
        _.logger.info(`Changing speed of embedded video clips...`);
        
        // run the requests in parallel
        await _.requester.run(
            requests,
            { max_concurrent : 3,
              max_per_second : 2 }
        );
    }
    
    // for each video section add the path to the final converted video file
    DATA.sections.forEach(section => {
        if (section.type !== 'video') return;
        section.video_file_path = DATA.resources.video[section.video_id].variants[section.video_variant].path;
    });
};

/**
 * trims audio clips if needed
 *
 * @async
 * @function
 * @alias module:pipeline
 * @category private
 *
 * @returns {Promise.<undefined>}
 */
const convertAudioClips = async() => {
    
    // generate all requests to trim embedded audio resources
    let counter = 0;
    let requests = [];
    DATA.resources.audio.forEach(audio => {
        
        counter++;
        
        // go through the different video trims and generate requests
        Object.keys(audio.variants).forEach(variant_key => {
            
            const variant = audio.variants[variant_key];
            
            // create output path for the converted video
            const output_path = _.path.join(AUDIO_DIRECTORY, 'resource-' + (counter+'').padStart(3, '0') + '-' + variant_key.replace(/[\:\.]{1}/g, '_') + _.path.extname(audio.path));
            variant.path = output_path;
        
            // generate a log file at this path
            let log_path = _.basic.replaceFileExtension(output_path, 'txt');
            log_path = _.basic.appendToFilename(log_path, '.log');
            
            // generate trimming options object
            const options = {
                input_path  : audio.path,
                output_path : output_path,
                log_path    : CONFIGURATION.generic.outputFFmpegLogs ? log_path : undefined
            };
            
            // determine trim times
            if (variant.clipBegin !== 'START') options.begin_time = variant.clipBegin;
            if (variant.clipEnd !== 'END') options.end_time = variant.clipEnd;
            
            // if no trimming times are defined, don't trim, but copy the file instead
            if (!options.begin_time && !options.end_time) {
                requests.push({
                    function : _.fs.copyFileSync,
                    parameters : [audio.path, output_path],
                    callback : (output, input_path, output_path) => {
                        _.logger.message(`Copied audio "${input_path}" to "${_.path.basename(output_path)}"`);
                    },
                    callback_parameters : [audio.path, output_path]
                });
                return;
            }
        
            // function called once the request is completed
            const callback = (output, input_path, output_path, trim) => {
                if (!output || !output.success) {
                    _.logger.fatal(`Failed trimming audio "${input_path}" to ${trim}`);
                    createOutputLog();
                    process.exit(1);
                }
                _.logger.message(`Trimmed audio "${input_path}" to ${trim} at "${_.path.basename(output_path)}"`);
            };

            // add a new request for trimming an embedded audio clip
            requests.push({
                function : _.ffmpeg.trim,
                parameters : [options],
                callback : callback,
                callback_parameters : [audio.path, output_path, `${variant.clipBegin}-${variant.clipEnd}`]
            });
        })
    });
    
    // run all trimming requests in parallel
    if (requests.length > 0) {
        _.logger.info(`Copying/trimming embedded audio clips...`);
        
        // run the requests in parallel
        await _.requester.run(
            requests,
            { max_concurrent : 3,
              max_per_second : 2 }
        );
    }
    
    // generate all requests for setting the volume of embedded audio resources
    requests = [];
    DATA.sections.forEach(section => {
        
        if (
            section.type !== 'audio' || 
            section.soundLevel === undefined
        ) {
            return;
        }
        
        // generate a new file
        const input_path = DATA.resources.audio[section.audio_id].variants[section.audio_variant].path;
        const new_variant_key = `${section.audio_variant}-${section.soundLevel}`;
        const output_path = _.basic.appendToFilename(input_path, `-${section.soundLevel}`);
        
        // don't generate the file again, if a file with the same soundLevel already exists
        section.audio_variant = new_variant_key;
        if (DATA.resources.audio[section.audio_id].variants[new_variant_key]) return;
        DATA.resources.audio[section.audio_id].variants[new_variant_key] = {
            path : output_path
        };
        
        // generate a log file at this path
        let log_path = _.basic.replaceFileExtension(output_path, 'txt');
        log_path = _.basic.appendToFilename(log_path, '.log');
        
        // generate options object
        const options = {
            input_path  : input_path,
            output_path : output_path,
            volume      : section.soundLevel,
            log_path    : CONFIGURATION.generic.outputFFmpegLogs ? log_path : undefined
        };
        
        // function called once the request is completed
        const callback = (output, input_path, output_path, soundLevel) => {
            if (!output || !output.success) {
                _.logger.fatal(`Failed setting sound level (volume) of audio "${input_path}" to ${soundLevel}`);
                createOutputLog();
                process.exit(1);
            }
            _.logger.message(`Set sound level (volume) of "${input_path}" to ${soundLevel} at "${_.path.basename(output_path)}"`);
        };

        // add a new request for trimming an embedded audio clip
        requests.push({
            function : _.ffmpeg.changeVolume,
            parameters : [options],
            callback : callback,
            callback_parameters : [input_path, output_path, section.soundLevel]
        });
    });
    
    // run all volume adjusting requests in parallel
    if (requests.length > 0) {
        _.logger.info(`Changing sound level (volume) of embedded audio clips...`);
        
        // run the requests in parallel
        await _.requester.run(
            requests,
            { max_concurrent : 3,
              max_per_second : 2 }
        );
    }
    
    // generate all requests for setting the speed of embedded audio resources
    requests = [];
    DATA.sections.forEach(section => {
        
        if (
            section.type !== 'audio' || 
            section.speed === undefined
        ) {
            return;
        }
        
        // generate a new file
        const input_path = DATA.resources.audio[section.audio_id].variants[section.audio_variant].path;
        const new_variant_key = `${section.audio_variant}-${section.speed}`;
        const output_path = _.basic.appendToFilename(input_path, `-${section.speed}%`);
        
        // don't generate the file again, if a file with the same speed already exists
        section.audio_variant = new_variant_key;
        if (DATA.resources.audio[section.audio_id].variants[new_variant_key]) return;
        DATA.resources.audio[section.audio_id].variants[new_variant_key] = {
            path : output_path
        };
        
        // generate a log file at this path
        let log_path = _.basic.replaceFileExtension(output_path, 'txt');
        log_path = _.basic.appendToFilename(log_path, '.log');
        
        // generate options object
        const options = {
            input_path  : input_path,
            output_path : output_path,
            speed       : section.speed,
            log_path    : CONFIGURATION.generic.outputFFmpegLogs ? log_path : undefined
        };
        
        // function called once the request is completed
        const callback = (output, input_path, output_path, speed) => {
            if (!output || !output.success) {
                _.logger.fatal(`Failed setting speed of audio "${input_path}" to ${speed}%`);
                createOutputLog();
                process.exit(1);
            }
            _.logger.message(`Set speed of "${input_path}" to ${speed}% at "${_.path.basename(output_path)}"`);
        };

        // add a new request for trimming an embedded audio clip
        requests.push({
            function : _.ffmpeg.changeAudioSpeed,
            parameters : [options],
            callback : callback,
            callback_parameters : [input_path, output_path, section.speed]
        });
    });
    
    // run all volume adjusting requests in parallel
    if (requests.length > 0) {
        _.logger.info(`Changing speed of embedded audio clips...`);
        
        // run the requests in parallel
        await _.requester.run(
            requests,
            { max_concurrent : 3,
              max_per_second : 2 }
        );
    }
    
    // for each audio section add the path to the final converted video file
    DATA.sections.forEach(section => {
        if (section.type !== 'audio') return;
        section.audio_file_path = DATA.resources.audio[section.audio_id].variants[section.audio_variant].path;
    });
};

/**
 * creates image files needed for the sections
 *
 * @async
 * @function
 * @alias module:pipeline
 * @category private
 * 
 * @returns {Promise.<undefined>}
 */
const createFrames = async() => {
    
    _.logger.info(`Creating video frames...`);
    
    // hold requests that should be executed
    let requests = [];
    // saves all the paths to the frames to be generated
    let frame_paths = [];

    // generate frame image files 
    // and add paths to the files to the DATA
    let last_frame_file_path = '';
    for (let i = 0, len = DATA.sections.length; i < len; i++) {
        
        let section = DATA.sections[i];
        
        // if a previous frame exists, reuse them for <audio> tags
        if (
            section.type === 'audio' && 
            last_frame_file_path != ''
        ) {
            section.frame_file_path = last_frame_file_path;
            continue;
        }
        
        // don't generate a frame for a pure video section
        if (section.type === 'video') {
            continue;
        }
        
        // otherwise, generate the frame of the current slide or the last frame of an embedded video
        let frame_file_path = '';

        switch (section.frame.type) {
            
            case 'slide': {
                frame_file_path = _.path.join(
                    FRAMES_DIRECTORY,
                    // frame file name
                    `${section.frame.deck}_${section.frame.page}.png`
                );
                break;
            }
        
            case 'video': {

                let video_file_path = DATA.resources.video[section.frame.video_id].variants[section.frame.video_variant].path;
                let parsed_path = _.path.parse(video_file_path);

                frame_file_path = _.path.join(
                    FRAMES_DIRECTORY,
                    // frame file name
                    `${parsed_path.name}.${parsed_path.ext}.png`
                );
                break;
            }
        
            case 'image': {
                const id = section.frame.id;
                const image_path = DATA.resources.image[id].path;
                frame_file_path = _.path.join(FRAMES_DIRECTORY, _.path.basename(image_path));
                break;
            }
                
            default: {
                _.logger.fatal(`Frame type "${section.frame.type}" is not valid`);
                process.exit(1);
            }
        }

        section.frame_file_path = frame_file_path;
        last_frame_file_path = frame_file_path;

        // don't generate a new frame, if the frame is already scheduled to be generated
        let ignore_frame = frame_paths.some(path => {
            return path === frame_file_path;
        });
        if (ignore_frame) continue;
        
        // save file path in an array
        frame_paths.push(frame_file_path);

        // create the frame depending on the frame type
        if (section.frame.type === 'slide') {

            const options = {
                input_path  : DATA.decks[section.frame.deck].file_path, 
                output_path : frame_file_path,
                page        : section.frame.page,
                width       : DATA.settings.resolution.width,
                height      : DATA.settings.resolution.height
            };
            
            const callback = (success, frame_file_path) => {
                if (success) {
                    _.logger.message(`Created frame "${_.path.basename(frame_file_path)}"`);
                }
                else {
                    _.logger.fatal(`Failed creating frame "${_.path.basename(frame_file_path)}"`);
                    createOutputLog();
                    process.exit(1);
                }
            };
            
            // add a request for extracting the page from the PDF slide as an image frame
            requests.push({
                function : _.pdf_worker.renderPage,
                parameters : [options],
                callback : callback,
                callback_parameters : [frame_file_path]
            });
        }
        else if (section.frame.type === 'video') {
            
            // generate a log file
            let log_path = _.basic.replaceFileExtension(frame_file_path, 'txt');
            log_path = _.basic.appendToFilename(log_path, '.frame-extraction.log');
            
            const input_path = DATA.resources.video[section.frame.video_id].variants[section.frame.video_variant].path;

            // generate extraction options object
            const options = {
                input_path  : input_path,
                output_path : frame_file_path,
                log_path    : CONFIGURATION.generic.outputFFmpegLogs ? log_path : undefined
            };
            
            // add a request for extracting the last frame of the video as an image
            requests.push({
                function : _.ffmpeg.extractLastFrame,
                parameters : [options],
                callback : (output, frame_file_path) => {
                    if (!output || !output.success) {
                        _.logger.fatal(`Failed creating frame "${_.path.basename(frame_file_path)}"`);
                        createOutputLog();
                        process.exit(1);
                    }
                    _.logger.message(`Created frame "${_.path.basename(frame_file_path)}"`);
                },
                callback_parameters : [frame_file_path]
            });
        }
        else if (section.frame.type === 'image') {
            // make a copy of the image
            requests.push({
                function : _.fs.copyFileSync,
                parameters : [DATA.resources.image[section.frame.id].path, frame_file_path],
                callback : (error, frame_file_path) => {
                    if (error) {
                        _.logger.fatal(`Failed copying image "${_.path.basename(frame_file_path)}", because: "${err}"`);
                        createOutputLog();
                        process.exit(1);
                    }
                    _.logger.message(`Copied image "${_.path.basename(frame_file_path)}"`);
                },
                callback_parameters : [frame_file_path]
            });
        }
    }
    
    // run the requests in parallel
    await _.requester.run(
        requests,
        { max_concurrent : 10,
          max_per_second : 5 }
    );
};

/**
 * creates audio for each SSML section
 *
 * @async
 * @function
 * @alias module:pipeline
 * @category private
 *
 * @returns {Promise.<undefined>}
 */
const createAudio = async() => {
    
    _.logger.info(`Converting text to speech...`);
    
    // hold requests that should be executed
    let requests = [];
    
    // go through all sections to create audio file
    DATA.sections.forEach(section => {
        
        // no Text-to-speech audio files need to be created for non-SSML sections
        if (section.type !== 'ssml') return;
        
        // define audio file paths for SSML sections
        const file_path = _.path.join(AUDIO_DIRECTORY, (section.id+'').padStart(3, '0') + '.mp3');
        section.audio_file_path = file_path;
        
        // generate MP3 options object
        const options = {
            output_path   : section.audio_file_path,
            voice_name    : section.voice,
            content       : section.content,
            type          : 'ssml',
            save_in_cache : ['on','saveonly'].includes(CACHE_MODE)
        };
        
        // add request for generating audio for the section using Text-to-speech
        requests.push({
            // check if reading from cache is allowed, or if a new audio file should be strictly generated
            function : ['on','readonly'].includes(CACHE_MODE) ? _.tts.createMP3 : _.tts.createMP3Strictly,
            parameters : [options],
            callback : (success, file_name) => {
                switch (success) {
                    case 0: {
                        _.logger.fatal(`Failed creating MP3 audio file "${file_name}"`);
                        createOutputLog();
                        process.exit(1);
                    }
                    case 1: {
                        _.logger.message(`Created MP3 audio file "${file_name}"`);
                        return;
                    }
                    case 2: {
                        _.logger.message(`Loaded MP3 audio file "${file_name}" from cache`);
                        return;
                    }
                    default: {
                        _.logger.error(`Failed to recognize "success === ${success}" response`);
                        process.exit(1);
                    }
                }
            },
            callback_parameters : [_.path.basename(section.audio_file_path)]
        });
    });
    
    // run the MP3 creation requests in parallel
    await _.requester.run(
        requests,
        { max_concurrent : 6,
          max_per_second : 4 }
    );
};

/**
 * creates video for each SSML section
 *
 * @async
 * @function
 * @alias module:pipeline
 * @category private
 *
 * @returns {Promise.<undefined>}
 */
const createClips = async() => {
    
    _.logger.info(`Combining frames and audio...`);
    
    // hold requests that should be executed
    let requests = [];
    
    // create requests for generating the clips
    DATA.sections.forEach(section => {
        
        // no video clip needs to be created, if the section is an embedded video clip already
        if (section.type == 'video') return;
        
        // create output path for the clip
        const output_path = _.path.join(CLIPS_DIRECTORY, (section.id+'').padStart(3, '0') + '.mp4');
        section.video_file_path = output_path;
        
        // generate a log file at this path
        let log_path = _.basic.replaceFileExtension(output_path, 'txt');
        log_path = _.basic.appendToFilename(log_path, '.creation.log');
        
        // create options object
        const options = {
            frame_path  : section.frame_file_path,
            audio_path  : section.audio_file_path,
            output_path : output_path,
            width       : DATA.settings.resolution.width,
            height      : DATA.settings.resolution.height,
            fps         : DATA.settings.fps,
            fit         : section.frame.fit ? section.frame.fit : undefined,
            log_path    : CONFIGURATION.generic.outputFFmpegLogs ? log_path : undefined
        };
        
        // generate a new request for combining image and audio to a video
        requests.push({
            function : _.ffmpeg.createMP4fromImageAudio,
            parameters : [options],
            callback : (output, file_name) => {
                if (!output || !output.success) {
                    _.logger.fatal(`Failed creating video clip "${file_name}"`);
                    createOutputLog();
                    process.exit(1);
                }
                _.logger.message(`Created video clip "${file_name}"`);
            },
            callback_parameters : [_.path.basename(output_path)]
        });
    });
    
    // run the video creation requests in parallel
    await _.requester.run(
        requests,
        { max_concurrent : 4,
          max_per_second : 2 }
    );
};

/**
 * goes through all sections and chapters to generate timestamps at which sections begin
 *
 * @async
 * @function
 * @alias module:pipeline
 * @category private
 *
 * @returns {Promise.<undefined>}
 */
const createTimestamps = async() => {
    
    _.logger.message(`Calculating timestamps...`);
    
    // total duration of all clips in seconds
    let total_duration = 0;

    // create timestamps for each section
    await _.basic.forEachAsync(DATA.sections, async(section) => {
        
        // get the duration of the generated clip
        let output = await _.ffmpeg.getDuration(section.video_file_path);
        let duration = '';
        
        if (!output || !output.success) {
            _.logger.error(`Failed to get video duration of "${section.video_file_path}" for section "${section.id}", set it to "0ms"`);
            duration = '00:00:00.000';
        }
        else {
            duration = output.duration;
        }

        // convert duration to seconds
        duration = _.timestamp.parse(duration).milliseconds_total;
        
        section.start_time = _.timestamp.msec2ffmpeg(total_duration);
        section.duration = _.timestamp.msec2ffmpeg(duration);
        
        // mind repeating embedded resource files
        total_duration += section.repeatCount ? (duration * section.repeatCount) : duration;
        
        section.end_time = _.timestamp.msec2ffmpeg(total_duration);
    });
    
    // add total duration of the lecture
    DATA.duration = _.timestamp.msec2ffmpeg(total_duration);
    
    // create timestamp for each chapter
    DATA.chapters.forEach(chapter => {
        // find the section where the chapter begins
        const section = DATA.sections.find(section => section.id === chapter.section);
        if (!section) {
            _.logger.warn(`Failed to set the start time for chapter "${chapter.title}", because section ${chapter.section} is missing`);
            chapter.start_time = '23:59:59.999';
            return;
        }
        chapter.start_time = section.start_time;
    });
    
    _.logger.info(`Lecture will have a duration of "${DATA.duration}"`);
};

/**
 * combines the section video clips and resources into one video
 *
 * @async
 * @function
 * @alias module:pipeline
 * @category private
 *
 * @returns {Promise.<undefined>}
 */
const createLecture = async() => {
    
    _.logger.info(`Combining video clips...`);
    
    // collect all paths to video clips
    let input_paths = [];
    DATA.sections.forEach(section => {
        
        // if no repeat count is found, only include the video file once
        if (!section.repeatCount) {
            input_paths.push(section.video_file_path);
            return;
        }
        
        // if there's a repeat count found, include it as often as is defined
        for (let i = 0; i < section.repeatCount; i++) {
            input_paths.push(section.video_file_path);
        }
    });
    
    // generate path for output file and log file
    const output_path = _.path.join(ARGS.output, 'lecture.mp4');
    let log_path = _.basic.replaceFileExtension(output_path, 'txt');
    log_path = _.basic.appendToFilename(log_path, '.creation.log');
    
    // generate options object
    const options = {
        input_paths : input_paths,
        output_path : output_path,
        log_path    : CONFIGURATION.generic.outputFFmpegLogs ? log_path : undefined
    };
    
    // combine video clips and generate video
    _.logger.message(`Combining ${input_paths.length} video clips...`);
    const output = await _.ffmpeg.concatenateMP4s(options);
    
    if (!output || !output.success) {
        _.logger.fatal(`Failed to create video lecture`);
        createOutputLog();
        process.exit(1);
    }
    
    // save the path to the lecture video file
    DATA.lecture_file_path = output_path;
    
    _.logger.info(`Created video lecture "${_.path.basename(output_path)}"`);
};

/**
 * uploads the video to YouTube
 *
 * @async
 * @function
 * @alias module:pipeline
 * @category private
 *
 * @returns {Promise.<undefined>}
 */
const uploadToYoutube = async() => {
            
    // generated a YouTube description
    const description = _.uploader.generateDescription({
        description : DATA.info.description ? DATA.info.description : 'No Description',
        copyright   : DATA.info.copyright   ? DATA.info.copyright : undefined,
        authors     : DATA.info.authors     ? DATA.info.authors : undefined,
        chapters    : DATA.chapters         ? DATA.chapters : undefined
    });
    
    // write the YouTube description to a file
    if (CONFIGURATION.upload.generateYoutubeDescription) {
        const file_path = _.path.join(ARGS.output, 'youtube-description.txt');
        _.logger.message(`Generated Youtube description at "${file_path}"`);
        _.fs.writeFileSync(file_path, description);
    }
    
    if (!_.basic.isFile(CONFIGURATION.credentials.youtube, '.json')) {
        _.logger.warn(`YouTube credentials file "${CONFIGURATION.credentials.youtube}" does not exist, so uploading to YouTube is not possible`);
        return;
    }
    
    // ask for user confirmation to upload the video
    if (!(await _.logger.confirm(`Do you want to upload the video to YouTube?`))) {
        return;
    }
    
    // get the privacy status of the video
    let privacy_status = 'unlisted';
    if (
        DATA.settings.youtubePrivacyStatus &&
        _.uploader.isValidPrivacyStatus(DATA.settings.youtubePrivacyStatus+'')
    ) {
        privacy_status = DATA.settings.youtubePrivacyStatus;
    }
    else if (_.uploader.isValidPrivacyStatus(CONFIGURATION.upload.defaultYoutubePrivacyStatus)) {
        privacy_status = CONFIGURATION.upload.defaultYoutubePrivacyStatus;
    }
    else {
        _.logger.warn(`Configuration value upload.defaultYoutubePrivacyStatus "${CONFIGURATION.upload.defaultYoutubePrivacyStatus}" is not a valid privacy status type. Privacy status for video was set to 'unlisted'`);
    }
    
    _.logger.message(`Uploading lecture as a video with the privacy status "${privacy_status}"`);

    // upload the video to YouTube
    const video_id = await _.uploader.uploadToYoutube({
        credential_file : CONFIGURATION.credentials.youtube,
        input_path      : DATA.lecture_file_path,
        title           : DATA.info.title,
        description     : description,
        privacy_status  : privacy_status
    });

    // method above returns a video id if the upload was successful
    if (!video_id) {
        _.logger.error(`Failed uploading the video to YouTube`);
        return;
    }
    
    _.logger.info(`Successfully uploaded the video to "https://www.youtube.com/watch?v=${video_id}"`);
    
    // check if to insert the video into a playlist
    let playlist_id = ''; // youtubePlaylistId
    if (DATA.settings.youtubePlaylistId === 'none') {
        playlist_id = 'none';
    }
    else if (await _.uploader.isUsersPlaylist(
        CONFIGURATION.credentials.youtube, 
        (DATA.settings.youtubePlaylistId ? DATA.settings.youtubePlaylistId.toString() : '')
    )) {
        playlist_id = DATA.settings.youtubePlaylistId;
    }
    else if (await _.uploader.isUsersPlaylist(
        CONFIGURATION.credentials.youtube,
        CONFIGURATION.upload.defaultYoutubePlaylistId
    )) {
        playlist_id = CONFIGURATION.upload.defaultYoutubePlaylistId;
    }
    else {
        _.logger.message(`Configuration value upload.youtubePlaylistId "${CONFIGURATION.upload.youtubePlaylistId}" is not an existing playlist, so video will not be inserted in any playlist`);
        playlist_id = 'none';
    }
    
    if (playlist_id !== 'none') {
        
        _.logger.message(`Inserting video "${video_id}" into playlist "${playlist_id}"`);
        
        const success = await _.uploader.insertIntoPlaylist({
            credential_file : CONFIGURATION.credentials.youtube,
            video_id        : video_id,
            playlist_id     : playlist_id
        });
        
        if (!success) {
            _.logger.error(`Failed inserting the video "${video_id}" into playlist "${playlist_id}"`);
            return;
        }
        
        _.logger.info(`Successfully inserted the video "${video_id}" into playlist "${playlist_id}"`);
    }
};



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /**
     * scans the command line arguments, and converts the input to a video lecture
     *
     * @async
     * @function
     * @alias module:pipeline
     * @category public
     *
     * @returns {Promise.<undefined>}
     */
    start : async() => {
        
        // handle parameters from command line arguments
        const {args, args_errors} = _.cli_worker.getArguments();
        ARGS = args;

        // if no CLI arguments were provided, print the start screen
        if (_.basic.getLength(ARGS) === 0) {
            _.cli_worker.printStart();
            process.exit(0);
        }

        // print the version of the tools and exit
        if (ARGS.version) {
            console.log(`v${VERSION}`);
            process.exit(0);
        }

        // print a help menu and exit
        if (ARGS.help) {
            _.cli_worker.printHelp();
            process.exit(0);
        }

        _.logger.info(`Started lecture.js v${VERSION}`);
        
        if (await _.is_online()) {
            _.logger.message(`Successfully established an internet connection`)
        }
        else {
            _.logger.fatal(`You must be online to run the pipeline. Check your internet connection!`);
            process.exit(1);
        }

        // parse configuration data and applies values to other scripts
        CONFIGURATION = await _.configurator.getData();
        if (!CONFIGURATION) {
            _.logger.fatal(`Failed parsing the configuration file`);
            process.exit(1);
        }
        
        if (ARGS.clearcache) {
            _.logger.message(`Removing cached text-to-speech audio files...`);
            _.tts_cache.clearCache();
            _.logger.message(`Finished clearing cache.`);
            process.exit(0);
        }
        
        // print available voices and exit
        if (ARGS.voices) {
            const success = await _.cli_worker.printVoices();
            process.exit(success ? 0 : 1);
        }

        // print available languages and exit
        if (ARGS.languages) {
            const success = await _.cli_worker.printLanguages();
            process.exit(success ? 0 : 1);
        }
        
        // generate sample with default sample voice if the user only provided one string as an argument 
        if (ARGS._.length === 1) {
            const success = await generateSample(undefined, ARGS._[0], 'text');
            process.exit(success ? 0 : 1);
        }
        
        // check if the required arguments are available
        if (!ARGS.sample && (ARGS.voice || ARGS.voice === '' || ARGS.ssml || ARGS.text || ARGS.text === '')) {
            _.logger.fatal(`Add the -s flag to your command if you want to create an audio sample`);
            process.exit(1);
        }
        
        // generate an audio sample using the given voice and SSML content
        if (ARGS.sample) {
            const success = await generateSample(ARGS.voice, ARGS.text, ARGS.ssml ? 'ssml' : 'text');
            process.exit(success ? 0 : 1);
        }
        
        if (args_errors.length > 0) {
            _.logger.errorMultiple(args_errors);
            _.logger.fatal(`Failed parsing the command line arguments`);
            process.exit(1);
        }
        
        // set the cache mode to use for Text-to-Speech requests
        CACHE_MODE = CONFIGURATION.cache.defaultMode;
        if (ARGS.cache) {
            CACHE_MODE = ARGS.cache;
        }
        _.logger.message(`Set cache mode for Text-to-Speech requests to "${CACHE_MODE}"`);
        
        // validate and parse the input
        await validateInput(ARGS.input);
        let {parsed_data, preprocessed_xml} = await parseInput();
        DATA = parsed_data;

        // create the output directories and save preprocessed input as a file
        await createDirectories();
        _.fs.writeFileSync(_.path.join(ARGS.output, 'input_preprocessed.xml'), preprocessed_xml);
        
        // convert and trim embedded resources
        await convertVideoClips();
        await convertAudioClips();
        
        // create video parts
        await createFrames();
        await createAudio();
        await createClips();
        
        // finalize the lecture
        await createTimestamps();
        await createLecture();
        
        await uploadToYoutube();
        
        // exit without error
        _.logger.message(`Successfully finished`);
        createOutputLog();
        process.exit(0);
    }
};

module.exports = __public;