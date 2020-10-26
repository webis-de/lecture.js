/**
 * @module ffmpeg_worker
 * @desc provides methods to communicate with the FFmpeg and FFprobe libraries
 *
 * @example
 * const _ = {};
 * _.ffmpeg = require('/.global/ffmpeg-worker.js');
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
_.child_process = require('child_process');

// utility scripts
_.basic     = require('./basic-utilities.js');
_.type      = require('./type-tests.js');
_.logger    = require('./logger.js');
_.timestamp = require('./timestamp.js');

// npm modules
_.ffmpeg_static = require(`ffmpeg-static`);
_.ffprobe_static = require(`ffprobe-static`);



/*
 * =========
 * CONSTANTS
 * =========
 */

const EOL = _.os.EOL;



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * gets the scaling filter for the given scaling mode
 * 
 * @function
 * @alias module:ffmpeg_worker
 * @category private
 *
 * @param {contain|cover|fill} mode - scaling mode
 * @param {integer} width - width in pixels
 * @param {integer} height - height in pixels
 * @returns {string} scaling filter
 */
const getScalingFilter = (mode, width, height) => {
        
    if (!_.type.isString(mode)) {
        _.logger.error(`Expected scaling mode as a string, but got ${_.type.of(mode)} "${mode}"`);
        return;
    }

    if (!_.type.isInteger(width)) {
        _.logger.error(`Expected width as an integer, but got ${_.type.of(width)} "${width}"`);
        return;
    }

    if (!_.type.isInteger(height)) {
        _.logger.error(`Expected height as an integer, but got ${_.type.of(height)} "${height}"`);
        return;
    }

    // ------------
    
    // return a filter script depending on the scaling mode
    switch (mode) {
        
        case 'cover': {
            // https://superuser.com/a/1136305
            return `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
        }
        
        case 'fill': {
            return `scale=${width}:${height}`;
        }
        
        // mode 'contain'
        default: {
            return `scale=w=${width}:h=${height}:force_original_aspect_ratio=1,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`;
        }
    }
};

/**
 * generates a log file
 * 
 * @function
 * @alias module:ffmpeg_worker
 * @category private
 *
 * @param {string} path - absolute path at which to generate the log file
 * @param {string} command - FFmpeg command
 * @param {string} response - FFmpeg response from the command
 */
const createLogFile = (path, command, response) => {
        
    if (!_.type.isString(path) || path === '') {
        _.logger.error(`Expected file path as a string, but got ${_.type.of(path)} "${path}"`);
        return;
    }

    if (!_.type.isString(command) || command === '') {
        _.logger.error(`Expected command as a string, but got ${_.type.of(command)} "${command}"`);
        return;
    }

    if (!_.type.isString(response)) {
        _.logger.error(`Expected response as a string, but got ${_.type.of(response)} "${response}"`);
        return;
    }
        
    // ------------
    
    const output = `>>>INPUT` + EOL + command + EOL + EOL +
                   `>>>OUTPUT` + EOL + response;
    
    // output the log file
    _.fs.writeFileSync(path, output);
};



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /*
     * LIBRARY COMMUNICATION
     */
    
    /**
     * runs FFmpeg library with parameters or a command
     *
     * @async
     * @function
     * @alias module:ffmpeg_worker
     * @category public
     * 
     * @param {string} command - FFmpeg command
     * @param {string} [log_path] - path where a FFmpeg log file will be generated
     * @returns {Promise.<Object>} response from FFmpeg
     *
     * @example
     * await call(`-i "path/to/file.mp4" ...`);
     * // ouput: {
     * //   command : '', // command by which the library was called
     * //   success : true, // true, if successful, false if not, null if the process failed to execute the command
     * //   error   : {}, // object containing more information about an error that occured
     * //   stdout  : '', // what the library returned as stdout after the command was executed
     * //   stderr  : '' // what the library returned as stderr after the command was executed
     * // }
     */
    call : async(command, log_path) => {
        
        if (!_.type.isString(command) || command === '') {
            _.logger.error(`Expected a FFmpeg command as a string, but got ${_.type.of(command)} "${command}"`);
            return;
        }
        
        // ------------
        
        // check if the user's command already has "ffmpeg" as a prefix
        if (!command.match(/^ffmpeg[ ]+/)) {
            // append path to the FFmpeg library to the command
            command = `"${_.ffmpeg_static}" ${command}`;
        }
        
        // generate a response template
        let response = {
            command : command,
            success : null,
            error   : null,
            stdout  : '',
            stderr  : ''
        };
        
        // run FFmpeg with the command
        const output = await new Promise(resolve => {
            
                _.child_process.exec(command, (error, stdout, stderr) => {
                    
                    response.success = !error || error.code === '0';
                    response.error   = error;
                    response.stdout  = stdout;
                    // FFmpeg outputs logs at stderr, where normally errors are put
                    response.stderr  = stderr;
                    
                    return resolve(response);
                });
            })
            .catch(err => {
            
                _.logger.error(err);
            
                response.error = {
                    code    : '1',
                    message : err
                };
                
                return response;
            });
        
        // create a FFmpeg log file
        if (_.type.isString(log_path) && log_path !== '') {
            createLogFile(log_path, output.command, output.stderr);
        }
        
        return output;
    },
    
    /**
     * runs FFprobe library with parameters or a command
     *
     * @async
     * @function
     * @alias module:ffmpeg_worker
     * @category public
     * 
     * @param {string} command - FFprobe command
     * @param {string} [log_path] - path where a FFmpeg log file will be generated
     * @returns {Promise.<Object>} response from FFprobe
     *
     * @example
     * await probe(`-i "path/to/file.mp4" ...`);
     * // ouput: {
     * //   command : '', // command by which the library was called
     * //   success : true, // true, if successful, false if not, null if the process failed to execute the command
     * //   error   : {}, // object containing more information about an error that occured
     * //   stdout  : '', // what the library returned as stdout after the command was executed
     * //   stderr  : '' // what the library returned as stderr after the command was executed
     * // }
     */
    probe : async(command, log_path) => {
        
        if (!_.type.isString(command) || command === '') {
            _.logger.error(`Expected a FFprobe command as a string, but got ${_.type.of(command)} "${command}"`);
            return;
        }
        
        // ------------
        
        // check if the user's command already has "ffmpeg" as a prefix
        if (!command.match(/^ffprobe[ ]+/)) {
            // append path to the FFmpeg library to the command
            command = `"${_.ffprobe_static.path}" ${command}`;
        }
        
        // generate a response template
        let response = {
            command : command,
            success : null,
            error   : null,
            stdout  : '',
            stderr  : ''
        };

        // run FFprobe with the command
        const output = await new Promise(resolve => {
            
                _.child_process.exec(command, (error, stdout, stderr) => {
                    
                    response.success = !error || error.code == '0';
                    response.error   = error;
                    response.stdout  = stdout;
                    // FFprobe outputs logs at stderr, where normally errors are put
                    response.stderr  = stderr;
                    
                    return resolve(response);
                });
            })
            .catch(err => {
                
                _.logger.error(err);
            
                response.error = {
                    code    : '1',
                    message : err
                };
                
                return response;
            });
        
        // create a FFprobe log file
        if (_.type.isString(log_path) && log_path !== '') {
            createLogFile(log_path, output.command, output.stderr);
        }
        
        return output;
    },
    
    
    
    /*
     * STREAM ANALYSIS
     */
    
    /**
     * returns the duration of a video or audio clip
     *
     * @async
     * @function
     * @alias module:ffmpeg_worker
     * @category public
     * 
     * @param {string} path - absolute path to a video or audio file
     * @param {string} [log_path] - path where a FFprobe log file will be generated
     * @returns {Promise.<Object>} FFprobe output and duration as a timestamp in the format "hh:mm:ss.SSS"
     *
     * @example
     * await getResolution('video.mp4');
     * // output: {
     * //   duration : '00:00:00.000', // video duration
     * //   command  : '', // command by which the library was called
     * //   success  : true, // true, if successful, false if not, null if the process failed to execute the command
     * //   error    : {}, // object containing more information about an error that occured
     * //   stdout   : '', // what the library returned as stdout after the command was executed
     * //   stderr   : '' // what the library returned as stderr after the command was executed
     * // }
     */
    getDuration : async(path, log_path) => {
        
        // required parameters
        
        if (!_.basic.isFile(path)) {
            _.logger.error(`Expected a path to an existing video or audio file, but got ${_.type.of(path)} "${path}"`);
            return;
        }
        
        // optional parameters
        
        if (
            log_path !== undefined && 
            (!_.type.isString(log_path) || log_path === '')
        ) {
            _.logger.error(`Expected log path as a string, but got ${_.type.of(log_path)} "${log_path}"`);
            return;
        }
        
        // ------------
        
        // run FFprobe using the command
        //  https://stackoverflow.com/a/22243834
        const command = `-i "${path}" -show_entries format=duration -sexagesimal -pretty -v quiet -of csv="p=0"`;
        const output = await __public.probe(command, log_path);
        
        output.duration = '';
        
        if (!output.success) {
            _.logger.error(`Failed getting duration of "${path}", because: ${output.error.message}`);
            return output;
        }
        
        // if command execution was successful, parse the duration string from output
        try {
            // remove trailing whitespace from the returned timestamp
            let timestamp = output.stdout.trim();
            
            // format from "h:mm:ss:SSSSSS..." to "hh:mm:ss.SSS"
            let ms = timestamp.match(/[0-9]+$/)[0];
            ms = ms.substring(0, ms.length < 3 ? ms.length : 3);
            output.duration = (timestamp.match(/^[0-9]{1}\:/) ? '0' : '') + timestamp.replace(/[0-9]+$/, ms);
        }
        catch (err) {
            output.success = false;
            _.logger.error(`Failed parsing the timestamp string generated by FFprobe "${output.stdout}", because: ${err}`);
        }
        
        return output;
    },
    
    /**
     * returns the resolution of a video in pixels
     *
     * @async
     * @function
     * @alias module:ffmpeg_worker
     * @category public
     * 
     * @param {string} path - absolute path to a video file
     * @param {string} [log_path] - path where a FFprobe log file will be generated
     * @returns {Promise.<Object>} object with resolution data and FFprobe response
     *
     * @example
     * await getResolution('video.mp4');
     * // output: {
     * //   width   : 1280, // width in pixels
     * //   height  : 720, // height in pixels
     * //   command : '', // command by which the library was called
     * //   success : true, // true, if successful, false if not, null if the process failed to execute the command
     * //   error   : {}, // object containing more information about an error that occured
     * //   stdout  : '', // what the library returned as stdout after the command was executed
     * //   stderr  : '' // what the library returned as stderr after the command was executed
     * // }
     */
    getResolution : async(path, log_path) => {
        
        // required parameters
        
        if (!_.basic.isFile(path)) {
            _.logger.error(`Expected a path to an existing video file, but got ${_.type.of(path)} "${path}"`);
            return;
        }
        
        // optional parameters
        
        if (
            log_path !== undefined && 
            (!_.type.isString(log_path) || log_path === '')
        ) {
            _.logger.error(`Expected log path as a string, but got ${_.type.of(log_path)} "${log_path}"`);
            return;
        }
        
        // ------------
        
        // run FFprobe using the command
        //  https://stackoverflow.com/a/22243834
        const command = `-v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${path}`;
        const output = await __public.probe(command, log_path);
        
        output.width = 0;
        output.height = 0;
        
        if (!output.success) {
            _.logger.error(`Failed getting resolution of "${path}", because: ${output.error.message}`);
            return output;
        }
        
        // if command execution was successful, parse the resolution from output
        try {
            const resolution = output.stdout.trim();
            output.width = parseInt(resolution.match(/^[0-9]+/)[0]);
            output.height = parseInt(resolution.match(/[0-9]+$/)[0]);
        }
        catch (err) {
            output.success = false;
            _.logger.error(`Failed parsing the resolution string generated by FFprobe "${output.stdout}", because: ${err}`);
        }
        
        return output;
    },
    
    /**
     * counts the frames of a video file
     *
     * @async
     * @function
     * @alias module:ffmpeg_worker
     * @category public
     * 
     * @param {string} path - path to a video file
     * @param {string} [log_path] - path where a FFprobe log file will be generated
     * @returns {Promise.<Object>} FFprobe response with number of frames in the video
     *
     * @example
     * await getResolution('video.mp4');
     * // output: {
     * //   frames  : 0, // amount of frames
     * //   command : '', // command by which the library was called
     * //   success : true, // true, if successful, false if not, null if the process failed to execute the command
     * //   error   : {}, // object containing more information about an error that occured
     * //   stdout  : '', // what the library returned as stdout after the command was executed
     * //   stderr  : '' // what the library returned as stderr after the command was executed
     * // }
     */
    countFrames : async(path, log_path) => {
        
        // required parameters
        
        if (!_.basic.isFile(path)) {
            _.logger.error(`Expected a path to an existing video file, but got ${_.type.of(path)} "${path}"`);
            return;
        }
        
        // optional parameters
        
        if (
            log_path !== undefined && 
            (!_.type.isString(log_path) || log_path === '')
        ) {
            _.logger.error(`Expected log path as a string, but got ${_.type.of(log_path)} "${log_path}"`);
            return;
        }
        
        // ------------

        // count the frames using FFprobe
        //  https://stackoverflow.com/a/54802700
        const command = `-v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of default=nokey=1:noprint_wrappers=1 "${path}"`;
        const output = await __public.probe(command, log_path);
        
        output.frames = 0;
        
        if (!output.success) {
            _.logger.error(`Failed counting the frames of video "${path}", because: ${output.error.message}`);
            return output;
        }
        
        // if command execution was successful, parse the response from output
        let frames = output.stdout.trim();
        // convert the output to an integer
        frames = parseInt(frames.match(/^[0-9]+/));

        if (_.type.isInteger(frames)) {
            output.frames = frames;
        }
        else {
            output.success = false;
            _.logger.error(`Failed parsing the response string containing the number of frames generated by FFprobe ${JSON.stringify(output.stdout)}, because it's not an integer`);
        }
        
        return output;
    },
    
    
    
    /*
     * STREAM CONVERSION
     */
    
    /**
     * converts a video file to an MP4 file with a lecture.js-compatible codec
     *
     * @async
     * @function
     * @alias module:ffmpeg_worker
     * @category public
     *
     * @param {Object} options
     * @param {string} options.input_path - path to the input video file
     * @param {string} options.output_path - path to the where the output file should be generated
     * @param {integer} options.width - width of the output video (if undefined, uses default value)
     * @param {integer} options.height - height of the output video (if undefined, uses default value)
     * @param {integer} options.fps - frames per second of the output video (if undefined, uses default value)
     * @param {contain|cover|fill} [options.fit=contain] - defines how to fit the video to the output resolution
     * @param {integer} [options.begin_time] - time as a SSML or FFmpeg timestamp at where the clip should should start
     * @param {integer} [options.end_time] - time as a SSML or FFmpeg timestamp at where the clip should should end
     * @param {string} [options.log_path] - path where a FFmpeg log file will be generated
     * @returns {Promise.<Object>} response from FFmpeg
     */
    convertVideo : async(options) => {
        
        // required parameters
        
        if (!_.type.isObject(options)) {
            _.logger.error(`Expected options as an object, but got ${_.type.of(options)} "${options}"`);
            return;
        }
        
        if (!_.type.isString(options.input_path)) {
            _.logger.error(`Expected options.input_path as a string, but got ${_.type.of(options.input_path)} "${options.input_path}"`);
            return;
        }
        
        if (!_.type.isString(options.output_path)) {
            _.logger.error(`Expected options.output_path as a string, but got ${_.type.of(options.output_path)} "${options.output_path}"`);
            return;
        }
        
        const output_ext = _.path.extname(options.output_path);
        if (output_ext !== '.mp4') {
            _.logger.error(`Expected file extension of output path to be ".mp4", but got "${output_ext}"`);
            return;
        }
        
        const output_dir = _.path.dirname(options.output_path);
        if (!_.basic.isDirectory(output_dir)) {
            _.logger.error(`Output directory "${output_dir}" does not exist`);
            return;
        }
        
        if (!_.type.isInteger(options.width) || options.width < 50) {
            _.logger.error(`Expected options.width as an integer above or equal 50, but got ${_.type.of(options.width)} "${options.width}"`);
            return;
        }
        
        if (!_.type.isInteger(options.height) || options.height < 50) {
            _.logger.error(`Expected options.height as an integer above or equal to 50, but got ${_.type.of(options.height)} "${options.height}"`);
            return;
        }
        
        if (!_.type.isInteger(options.fps) || options.fps < 10) {
            _.logger.error(`Expected options.fps as an integer above or equal to 10, but got ${_.type.of(options.fps)} "${options.fps}"`);
            return;
        }
        
        // optional parameters
        
        const valid_fits = ['contain','cover','fill'];
        if (
            options.fit !== undefined && 
            (!_.type.isString(options.fit) || !valid_fits.includes(options.fit))
        ) {
            _.logger.error(`Expected options.fit to be one of "${valid_fits}", but got ${_.type.of(options.fit)} "${options.fit}"`);
            return;
        }
        options.fit = options.fit ? options.fit : 'contain';
        
        if (options.begin_time !== undefined && !_.type.isString(options.begin_time)) {
            _.logger.error(`Expected begin time as a string, but got ${_.type.of(options.begin_time)} "${options.begin_time}"`);
            return;
        }
        
        if (options.end_time !== undefined && !_.type.isString(options.end_time)) {
            _.logger.error(`Expected end time as a string, but got ${_.type.of(options.end_time)} "${options.end_time}"`);
            return;
        }
        
        // set the beginning and end timestamps
        let begin_time = _.timestamp.isValid(options.begin_time) ? options.begin_time : null;
        let end_time   = _.timestamp.isValid(options.end_time) ? options.end_time : null;
        
        if (
            options.log_path !== undefined && 
            (!_.type.isString(options.log_path) || options.log_path === '')
        ) {
            _.logger.error(`Expected log path as a string, but got ${_.type.of(options.log_path)} "${options.log_path}"`);
            return;
        }
        
        // ------------
        
        // remove any file already present at the output path
        if (_.fs.existsSync(options.output_path)) {
            _.fs.unlinkSync(options.output_path);
        }
        
        // convert SSML timestamps to FFmpeg timestamps, if needed
        if (_.timestamp.isSSML(begin_time)) {
            begin_time = _.timestamp.ssml2ffmpeg(begin_time);
        }
        if (_.timestamp.isSSML(end_time)) {
            if (!begin_time) begin_time = '00:00:00';
            end_time = _.timestamp.ssml2ffmpeg(end_time);
        }
        
        // determine the scaling mode to use for the defined frame 'fit'
        const scaling = getScalingFilter(options.fit, options.width, options.height);
        
        // generates a command that:
        //  changes to MP4 video and AAC audio codec
        //  changes frame rate
        //  scales to a new resolution with original aspect ratio (may pad sides):
        //      https://superuser.com/a/99141
        //  trims a video to a given start and/or end time
        //      https://stackoverflow.com/a/52916510
        const command = (end_time ? `-to ${end_time} ` : '') + `-i "${options.input_path}" -c:v "libx264" -c:a "aac" -preset slow -crf 21 -pix_fmt yuv420p -r ${options.fps} -vf "${scaling},setsar=sar=1:1" -max_muxing_queue_size 9999 -strict experimental${(begin_time ? ' -ss '+begin_time : '')} -y "${options.output_path}"`;
        
        // run FFmpeg using the command
        const output = await __public.call(command, options.log_path);
        
        if (!output.success) {
            _.logger.error(`Failed converting video "${options.output_path}", because: ${output.error.message}`);
            return output;
        }
        
        return output;
    },
    
    /**
     * trims a media file to a given start and/or end time 
     * 
     * @async
     * @function
     * @alias module:ffmpeg_worker
     * @category public
     *
     * @param {Object} options
     * @param {string} options.input_path - path to the input video or audio file
     * @param {string} options.output_path - path to the where the output file should be generated
     * @param {integer} [options.begin_time] - time as a SSML or FFmpeg timestamp at where the clip should should start
     * @param {integer} [options.end_time] - time as a SSML or FFmpeg timestamp at where the clip should should end
     * @param {string} [options.log_path] - path where a FFmpeg log file will be generated
     * @returns {Promise.<Object>} response from FFmpeg
     */
    trim : async(options) => {
        
        // required parameters
        
        if (!_.type.isObject(options)) {
            _.logger.error(`Expected options as an object, but got ${_.type.of(options)} "${options}"`);
            return;
        }
        
        if (!_.type.isString(options.input_path)) {
            _.logger.error(`Expected options.input_path as a string, but got ${_.type.of(options.input_path)} "${options.input_path}"`);
            return;
        }
        
        if (!_.type.isString(options.output_path)) {
            _.logger.error(`Expected options.output_path as a string, but got ${_.type.of(options.output_path)} "${options.output_path}"`);
            return;
        }
        
        const output_dir = _.path.dirname(options.output_path);
        if (!_.basic.isDirectory(output_dir)) {
            _.logger.error(`Output directory "${output_dir}" does not exist`);
            return;
        }
        
        // optional parameters
        
        if (options.begin_time !== undefined && !_.type.isString(options.begin_time)) {
            _.logger.error(`Expected begin time as a string, but got ${_.type.of(options.begin_time)} "${options.begin_time}"`);
            return;
        }
        
        if (options.end_time !== undefined && !_.type.isString(options.end_time)) {
            _.logger.error(`Expected end time as a string, but got ${_.type.of(options.end_time)} "${options.end_time}"`);
            return;
        }
        
        // set the beginning and end timestamps
        let begin_time = _.timestamp.isValid(options.begin_time) ? options.begin_time : null;
        let end_time   = _.timestamp.isValid(options.end_time) ? options.end_time : null;
        
        if (!begin_time && !end_time) {
            _.logger.error(`Could not trim the video as no valid FFmpeg or SSML timestamps for options.begin_time or options.end_time were given`);
            return;
        }
        
        if (
            options.log_path !== undefined && 
            (!_.type.isString(options.log_path) || options.log_path === '')
        ) {
            _.logger.error(`Expected log path as a string, but got ${_.type.of(options.log_path)} "${options.log_path}"`);
            return;
        }
        
        // ------------
        
        // delete file at output if it already exists
        if (_.basic.isFile(options.output_path)) {
            _.fs.unlinkSync(options.output_path);
        }
        
        // convert SSML timestamps to FFmpeg timestamps, if needed
        if (_.timestamp.isSSML(begin_time)) {
            begin_time = _.timestamp.ssml2ffmpeg(begin_time);
        }
        if (_.timestamp.isSSML(end_time)) {
            end_time = _.timestamp.ssml2ffmpeg(end_time);
        }
        
        // generate a trimming FFmpeg command
        //  https://stackoverflow.com/a/52916510
        const command = `${(end_time ? `-to ${end_time} ` : '')}-i "${options.input_path}" -ss ${(begin_time ? begin_time : '00:00:00')} -y "${options.output_path}"`;
        
        // run FFmpeg with the given parameters
        const output = await __public.call(command, options.log_path);
        
        if (!output.success) {
            _.logger.error(`Failed trimming video "${options.input_path}" from "${begin_time}" to "${end_time}", because: ${output.error.message}`);
            return output;
        }
        
        return output;
    },
    
    /**
     * changes the volume of an audio or video clip by a relative decibel amount
     * 
     * @async
     * @function
     * @alias module:ffmpeg_worker
     * @category public
     *
     * @param {Object} options
     * @param {string} options.input_path - path to the input video or audio file
     * @param {string} options.output_path - path to the where the output file should be generated
     * @param {string} options.volume - defines by how much to change the volume in relative dB values, e.g., +5dB or -10dB
     * @param {string} [options.log_path] - path where a FFmpeg log file will be generated
     * @returns {Promise.<Object>} response from FFmpeg
     *
     * @example
     * // increases volume by 5dB
     * await changeVolume({
     *      input_path  : 'test.m4a',
     *      output_path : 'output.m4a',
     *      volume      : '+5dB' // to decrease it by e.g. 2dB. write '-2dB'
     * });
     */
    changeVolume : async(options) => {
        
        // required parameters
        
        if (!_.type.isObject(options)) {
            _.logger.error(`Expected options as an object, but got ${_.type.of(options)} "${options}"`);
            return;
        }
        
        if (!_.type.isString(options.input_path)) {
            _.logger.error(`Expected options.input_path as a string, but got ${_.type.of(options.input_path)} "${options.input_path}"`);
            return;
        }
        
        if (!_.type.isString(options.output_path)) {
            _.logger.error(`Expected options.output_path as a string, but got ${_.type.of(options.output_path)} "${options.output_path}"`);
            return;
        }
        
        const output_dir = _.path.dirname(options.output_path);
        if (!_.basic.isDirectory(output_dir)) {
            _.logger.error(`Output directory "${output_dir}" does not exist`);
            return;
        }
        
        if (!_.type.isString(options.volume)) {
            _.logger.error(`Expected options.volume as a string, but got ${_.type.of(options.volume)} "${options.volume}"`);
            return;
        }
        
        const volume_regex = new RegExp('^(\\-|\\+)[0-9]+(\\.[0-9]+)?dB$');
        if (!options.volume.match(volume_regex)) {
            _.logger.error(`Expected options.volume to be in the format "${volume_regex}", but got "${options.volume}"`);
            return;
        }
        
        const volume = parseInt(options.volume.match(/(-)?[0-9]+/)[0]);
        if (volume < -50 || volume > 50) {
            _.logger.error(`Expected options.volume to be greater or equal to -50dB, and smaller or equal to 50dB, but got "${volume}dB"`);
            return;
        }
        
        // optional parameters
        
        if (options.begin_time !== undefined && !_.type.isString(options.begin_time)) {
            _.logger.error(`Expected begin time as a string, but got ${_.type.of(options.begin_time)} "${options.begin_time}"`);
            return;
        }
        
        if (options.end_time !== undefined && !_.type.isString(options.end_time)) {
            _.logger.error(`Expected end time as a string, but got ${_.type.of(options.end_time)} "${options.end_time}"`);
            return;
        }
        
        if (
            options.log_path !== undefined && 
            (!_.type.isString(options.log_path) || options.log_path === '')
        ) {
            _.logger.error(`Expected log path as a string, but got ${_.type.of(options.log_path)} "${options.log_path}"`);
            return;
        }
        
        // ------------
        
        // delete file at output if it already exists
        if (_.basic.isFile(options.output_path)) {
            _.fs.unlinkSync(options.output_path);
        }
        
        // run FFmpeg to create a new file
        //  https://trac.ffmpeg.org/wiki/AudioVolume
        const command = `-i "${options.input_path}" -filter:a "volume=${options.volume}" -y "${options.output_path}"`;
        const output = await __public.call(command, options.log_path);
        
        if (!output.success) {
            _.logger.error(`Failed changing audio for video "${options.input_path}" by "${options.volume}", because: ${output.error.message}`);
        }
        
        return output;
    },
    
    /**
     * changes the speed of a video clip
     * 
     * @async
     * @function
     * @alias module:ffmpeg_worker
     * @category public
     *
     * @param {Object} options
     * @param {string} options.input_path - path to the input video or audio file
     * @param {string} options.output_path - path to the where the output file should be generated
     * @param {integer} options.speed - defines to what to change the speed in percentage
     * @param {string} [options.log_path] - path where a FFmpeg log file will be generated
     * @returns {Promise.<Object>} response from FFmpeg
     *
     * @example
     * // sets the speed to 200%, meaning that it doubles it
     * await changeVideoSpeed({
     *      input_path  : 'test.mp4',
     *      output_path : 'output.mp4',
     *      speed       : 200
     * });
     */
    changeVideoSpeed : async(options) => {
        
        // required parameters
        
        if (!_.type.isObject(options)) {
            _.logger.error(`Expected options as an object, but got ${_.type.of(options)} "${options}"`);
            return;
        }
        
        if (!_.type.isString(options.input_path)) {
            _.logger.error(`Expected options.input_path as a string, but got ${_.type.of(options.input_path)} "${options.input_path}"`);
            return;
        }
        
        if (!_.type.isString(options.output_path)) {
            _.logger.error(`Expected options.output_path as a string, but got ${_.type.of(options.output_path)} "${options.output_path}"`);
            return;
        }
        
        const output_dir = _.path.dirname(options.output_path);
        if (!_.basic.isDirectory(output_dir)) {
            _.logger.error(`Output directory "${output_dir}" does not exist`);
            return;
        }
        
        if (
            !_.type.isInteger(options.speed) || 
            options.speed < 50 || 
            options.speed > 200
        ) {
            _.logger.error(`Expected options.speed as an integer between 50 and 200, but got ${_.type.of(options.speed)} "${options.speed}"`);
            return;
        }
        
        // optional parameters
        
        if (
            options.log_path !== undefined && 
            (!_.type.isString(options.log_path) || options.log_path === '')
        ) {
            _.logger.error(`Expected log path as a string, but got ${_.type.of(options.log_path)} "${options.log_path}"`);
            return;
        }
        
        // ------------
        
        // delete file at output if it already exists
        if (_.basic.isFile(options.output_path)) {
            _.fs.unlinkSync(options.output_path);
        }
        
        // calculate speed of the video and audio stream
        //  https://trac.ffmpeg.org/wiki/How%20to%20speed%20up%20/%20slow%20down%20a%20video
        const video_speed = 100 / options.speed;
        const audio_speed = options.speed / 100;
        
        // run FFmpeg to create a new file
        const command = `-i "${options.input_path}" -filter_complex "[0:v]setpts=${video_speed}*PTS[v];[0:a]atempo=${audio_speed}[a]" -map "[v]" -map "[a]" -y "${options.output_path}"`;
        const output = await __public.call(command, options.log_path);
        
        if (!output.success) {
            _.logger.error(`Failed changing speed for video clip "${options.input_path}" to "${options.speed}%", because: ${output.error.message}`);
        }
        
        return output;
    },
    
    /**
     * changes the speed of an audio clip
     * 
     * @async
     * @function
     * @alias module:ffmpeg_worker
     * @category public
     *
     * @param {Object} options
     * @param {string} options.input_path - path to the input video or audio file
     * @param {string} options.output_path - path to the where the output file should be generated
     * @param {integer} options.speed - defines to what to change the speed in percentage
     * @param {string} [options.log_path] - path where a FFmpeg log file will be generated
     * @returns {Promise.<Object>} response from FFmpeg
     *
     * @example
     * // sets the speed to 50%, meaning that it halves it
     * await changeAudioSpeed({
     *      input_path  : 'test.m4a',
     *      output_path : 'output.m4a',
     *      speed       : 200
     * });
     */
    changeAudioSpeed : async(options) => {
        
        // required parameters
        
        if (!_.type.isObject(options)) {
            _.logger.error(`Expected options as an object, but got ${_.type.of(options)} "${options}"`);
            return;
        }
        
        if (!_.type.isString(options.input_path)) {
            _.logger.error(`Expected options.input_path as a string, but got ${_.type.of(options.input_path)} "${options.input_path}"`);
            return;
        }
        
        if (!_.type.isString(options.output_path)) {
            _.logger.error(`Expected options.output_path as a string, but got ${_.type.of(options.output_path)} "${options.output_path}"`);
            return;
        }
        
        const output_dir = _.path.dirname(options.output_path);
        if (!_.basic.isDirectory(output_dir)) {
            _.logger.error(`Output directory "${output_dir}" does not exist`);
            return;
        }
        
        if (
            !_.type.isInteger(options.speed) || 
            options.speed < 50 || 
            options.speed > 200
        ) {
            _.logger.error(`Expected options.speed as an integer between 50 and 200, but got ${_.type.of(options.speed)} "${options.speed}"`);
            return;
        }
        
        // optional parameters
        
        if (
            options.log_path !== undefined && 
            (!_.type.isString(options.log_path) || options.log_path === '')
        ) {
            _.logger.error(`Expected log path as a string, but got ${_.type.of(options.log_path)} "${options.log_path}"`);
            return;
        }
        
        // ------------
        
        // delete file at output if it already exists
        if (_.basic.isFile(options.output_path)) {
            _.fs.unlinkSync(options.output_path);
        }
        
        // calculate speed of the video and audio stream
        //  https://trac.ffmpeg.org/wiki/How%20to%20speed%20up%20/%20slow%20down%20a%20video
        const audio_speed = options.speed / 100;
        
        // run FFmpeg to create a new file
        const command = `-i "${options.input_path}" -filter:a "atempo=${audio_speed}" -vn -y "${options.output_path}"`;
        const output = await __public.call(command, options.log_path);
        
        if (!output.success) {
            _.logger.error(`Failed changing speed for audio clip "${options.input_path}" to "${options.speed}%", because: ${output.error.message}`);
        }
        
        return output;
    },
    
    
    
    /*
     * STREAM EXTRACTION
     */
    
    /**
     * extracts the last frame from a video file as an image
     *
     * @async
     * @function
     * @alias module:ffmpeg_worker
     * @category public
     * 
     * @param {Object} options
     * @param {string} options.input_path - absolute path to a video file
     * @param {string} options.output_path - output location of a PNG file
     * @param {string} [options.log_path] - path where a FFmpeg log file will be generated
     * @returns {Promise.<Object>} response from FFmpeg
     *
     * @example
     * await extractLastFrame({
     *      input_path  : 'here/clip.mp4', 
     *      output_path : 'there/output.png'
     * });
     */
    extractLastFrame : async(options) => {
        
        // required parameters
        
        if (!_.basic.isFile(options.input_path)) {
            _.logger.error(`Expected input path to an existing video file, but got ${_.type.of(options.input_path)} "${options.input_path}"`);
            return;
        }
        
        if (!_.type.isString(options.output_path) || _.path.extname(options.output_path) !== '.png') {
            _.logger.error(`Expected output path to a PNG file as a string, but got ${_.type.of(options.output_path)} "${output_path}"`);
            return;
        }
        
        const output_dir = _.path.dirname(options.output_path);
        if (!_.basic.isDirectory(output_dir)) {
            _.logger.error(`Output directory "${output_dir}" does not exist`);
            return;
        }
        
        // optional parameters
        
        if (
            options.log_path !== undefined && 
            (!_.type.isString(options.log_path) || options.log_path === '')
        ) {
            _.logger.error(`Expected options.log_path as a string, but got ${_.type.of(options.log_path)} "${log_path}"`);
            return;
        }
        
        // ------------
        
        // remove any file already present at the output path
        if (_.fs.existsSync(options.output_path)) {
            _.fs.unlinkSync(options.output_path);
        }
        
        // count the frames in the video to determine the last one
        const frame_counter = await __public.countFrames(options.input_path);
        
        if (!frame_counter || !frame_counter.success) {
            _.logger.error(`Failed counting frames of video "${options.input_path}"`);
            return frame_counter;
        }
        
        // extract the frame using FFmpeg
        const command = `-i "${options.input_path}" -vf "select='eq(n,${frame_counter.frames}-1)'" -vframes 1 "${options.output_path}"`;
        const output = await __public.call(command, options.log_path);
        
        if (!output.success) {
            _.logger.error(`Failed creating the frame image at "${options.input_path}", because: ${output.error.message}`);
        }
        
        return output;
    },
    
    
    
    /*
     * VIDEO CREATION
     */
    
    /**
     * combines an image and audio into an MP4 file
     *
     * @async
     * @function
     * @alias module:ffmpeg_worker
     * @category public
     *
     * @param {Object} options
     * @param {string} options.frame_path - path to an image file
     * @param {string} options.audio_path - path to an audio file
     * @param {string} options.output_path - path where to put the MP4 output video file
     * @param {integer} options.width - width of the output video in pixels
     * @param {integer} options.height - height of the output video in pixels
     * @param {integer} options.fps - frames per second of the output video
     * @param {contain|cover|fill} [options.fit=contain] - defines how to fit the image to the output resolution
     * @param {string} [options.log_path] - path where a FFmpeg log file will be generated
     * @returns {Promise.<Object>} response from FFmpeg
     */
    createMP4fromImageAudio : async(options) => {
        
        // required parameters
        
        if (!_.type.isObject(options)) {
            _.logger.error(`Expected options as an object, but got ${_.type.of(options)} "${options}"`);
            return;
        }
        
        if (!_.basic.isFile(options.frame_path)) {
            _.logger.error(`Expected options.frame_path as a path to an existing file, but got ${_.type.of(options.frame_path)} "${options.frame_path}"`);
            return;
        }
        
        if (!_.basic.isFile(options.audio_path)) {
            _.logger.error(`Expected options.audio_path as a path to an existing file, but got ${_.type.of(options.audio_path)} "${options.audio_path}"`);
            return;
        }
        
        if (
            !_.type.isString(options.output_path)|| 
            _.path.extname(options.output_path) !== '.mp4'
        ) {
            _.logger.error(`Expected options.output_path as a path to an MP4 file, but got ${_.type.of(options.output_path)} "${options.output_path}"`);
            return;
        }
        
        const output_dir = _.path.dirname(options.output_path);
        if (!_.basic.isDirectory(output_dir)) {
            _.logger.error(`Output directory "${output_dir}" does not exist`);
            return;
        }
        
        if (!_.type.isInteger(options.width) || options.width < 50) {
            _.logger.error(`Expected options.width as an integer above or equal to 50, but got ${_.type.of(options.width)} "${options.width}"`);
            return;
        }
        
        if (!_.type.isInteger(options.height) || options.height < 50) {
            _.logger.error(`Expected options.height as an integer above or equal to 50, but got ${_.type.of(options.height)} "${options.height}"`);
            return;
        }
        
        if (!_.type.isInteger(options.fps) || options.fps < 10) {
            _.logger.error(`Expected options.fps as an integer above or equal to 10, but got ${_.type.of(options.fps)} "${options.fps}"`);
            return;
        }
        
        // optional parameters
        
        const valid_fits = ['contain','cover','fill'];
        if (
            options.fit !== undefined && 
            (!_.type.isString(options.fit) || !valid_fits.includes(options.fit))
        ) {
            _.logger.error(`Expected options.fit to be one of "${valid_fits}", but got ${_.type.of(options.fit)} "${options.fit}"`);
            return;
        }
        options.fit = options.fit ? options.fit : 'contain';
        
        if (
            options.log_path !== undefined && 
            (!_.type.isString(options.log_path) || options.log_path === '')
        ) {
            _.logger.error(`Expected options.log_path as a string, but got ${_.type.of(options.log_path)} "${options.log_path}"`);
            return;
        }
        
        // ------------
        
        // remove any file already present at the output path
        if (_.fs.existsSync(options.output_path)) {
            _.fs.unlinkSync(options.output_path);
        }
        
        // determine the scaling mode to use for the defined frame 'fit'
        const scaling = getScalingFilter(options.fit, options.width, options.height);
        
        // construct a FFmpeg command
        //    -fflags +shortest -max_interleave_delta 100M: fixes 1s of silence added to clips
        //     https://stackoverflow.com/a/55804507
        const command = `-loop 1 -i "${options.frame_path}" -i "${options.audio_path}" -c:v libx264 -tune stillimage -c:a aac -crf 21 -pix_fmt yuv420p -vf "${scaling},setsar=sar=1:1" -r ${options.fps} -preset slow -max_muxing_queue_size 9999 -shortest -fflags +shortest -max_interleave_delta 100M -y "${options.output_path}"`
        
        // run FFmpeg with the given command
        const output = await __public.call(command, options.log_path);
        
        if (!output.success) {
            _.logger.error(`Failed creating a video at "${options.output_path}", because: ${output.error.message}`);
        }
        
        return output;
    },
    
    /**
     * combines multiple similar MP4 files (codec, fps, resolution, ...) into a single MP4 file
     *
     * @async
     * @function
     * @alias module:ffmpeg_worker
     * @category public
     *
     * @param {Object} options
     * @param {Array.<string>} options.input_paths - array of file paths to existing MP4 video files
     * @param {string} options.output_path - path where to put the output MP4 video file
     * @param {string} [options.log_path] - path where a FFmpeg log file will be generated
     * @returns {Promise.<Object>} response from FFmpeg
     */
    concatenateMP4s : async(options) => {
        
        // required parameters
        
        if (
            !_.type.isArray(options.input_paths) ||
            !options.input_paths.every(_.type.isString)
        ) {
            _.logger.error(`Expected options.input_paths as an array of file paths, but got ${_.type.of(options.input_paths)} "${options.input_paths}"`);
            return;
        }
        
        // find non-existant or non-MP4 files
        const invalid_files = options.input_paths.filter(path => !_.basic.isFile(path, '.mp4'));
        if (invalid_files.length > 0) {
            _.logger.error(`Expected all input file paths to lead to a valid MP4 video file, but the following paths are either invalid or the MP4 files does not exist: "${invalid_files}"`);
            return;
        }
        
        if (!_.type.isString(options.output_path)) {
            _.logger.error(`Expected output path as a string, but got ${_.type.of(options.output_path)} "${options.output_path}"`);
            return;
        }
        
        const output_dir = _.path.dirname(options.output_path);
        if (!_.basic.isDirectory(output_dir)) {
            _.logger.error(`Output directory "${output_dir}" does not exist`);
            return;
        }
        
        // optional parameters
        
        if (
            options.log_path !== undefined && 
            (!_.type.isString(options.log_path) || options.log_path === '')
        ) {
            _.logger.error(`Expected options.log_path as a string, but got ${_.type.of(options.log_path)} "${log_path}"`);
            return;
        }
        
        // ------------
        
        // remove any file already present at the output path
        if (_.fs.existsSync(options.output_path)) {
            _.fs.unlinkSync(options.output_path);
        }
        
        // process batches of videos in groups of 15 files
        const max_group_size = 20;
        let group_files = [];
        if (options.input_paths.length > max_group_size) {
            let temp_counter = 0;
            let new_paths = [];
            while (options.input_paths.length > 0) {
                
                // empty input paths if there's only one video file to "merge"
                if (options.input_paths.length === 1) {
                    new_paths.push(options.input_paths[0]);
                    options.input_paths = [];
                }
                
                if (options.input_paths.length === 0) {
                    // if there are still above 15 new file paths, loop another round
                    if (new_paths > max_group_size) {
                        options.input_paths = new_paths;
                        new_paths = [];
                    }
                    else {
                        break;
                    }
                }
            
                // get the first (up to) 15 video file paths
                let group = [];
                for (let i = 1; i <= max_group_size; i++) {
                    if (options.input_paths.length === 0) break;
                    group.push(options.input_paths[0]);
                    options.input_paths.shift();
                }

                // create the path for the merged video file
                const combined_file_path = _.basic.appendToFilename(options.output_path, `.temp${temp_counter}`);
                new_paths.push(combined_file_path);
                group_files.push(combined_file_path);

                await __public.concatenateMP4s({
                    input_paths : group,
                    output_path : combined_file_path
                });
                
                temp_counter++;
            }
            options.input_paths = new_paths;
        }
        
        let command = '';
        
        // generate a filter script for combining video and audio streams
        //   https://stackoverflow.com/a/62404369
        let filter_script = '';
        for (let i = 0, len = options.input_paths.length; i < len; i++) {
            command += `-i "${options.input_paths[i]}" `;
            filter_script += `[${i}:v] [${i}:a] `;
        }
        filter_script += `concat=n=${options.input_paths.length}:v=1:a=1 [v] [a]`;
        
        // create a file with the filter script
        const filter_script_path = _.path.join(_.path.dirname(options.output_path), 'filter-script.txt');
        _.fs.writeFileSync(filter_script_path, filter_script);
        
        // generate a FFmpeg command
        command += `-filter_complex_script "${filter_script_path}" -map [v] -map [a] -y "${options.output_path}"`;
        
        // run FFmpeg with the command
        const output = await __public.call(command, options.log_path);
                        
        // remove the filter script file again
        _.fs.unlinkSync(filter_script_path);
            
        // remove all temporary group files that were created
        group_files.forEach(_.fs.unlinkSync);
        
        if (!output.success) {
            _.logger.error(`Failed creating video "${options.output_path}", because: ${output.error.message}`);
        }
        
        return output;
    }
};

module.exports = __public;