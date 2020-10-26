/**
 * @module timestamp
 * @desc provides functions for parsing, converting, and validating different timestamp formats
 *
 * @example
 * const _ = {};
 * _.timestamp = require('/.global/timestamp.js');
 */

'use strict';

/*
 * =======
 * MODULES
 * =======
 */

const _ = {};

// utility scripts
_.basic  = require('./basic-utilities.js');
_.type   = require('./type-tests.js');
_.logger = require('./logger.js');



/*
 * =========
 * CONSTANTS
 * =========
 */

// limited FFmpeg timestamp format, FFmpeg allows for a few more variations
const FFMPEG_TIMESTAMP_FORMAT = /^[0-9]{2,}\:[0-9]{2}\:[0-9]{2}(\.[0-9]{3})?$/;
const YOUTUBE_TIMESTAMP       = /^([0-9]{2,}\:)?[0-9]{2}\:[0-9]{2}$/;
const SSML_TIMESTAMP_FORMAT   = /^[0-9]+(ms|s)$/;



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /*
     * VALIDATION
     */
    
    /**
     * tests if a value is in a format valid on Youtube and SSML, or conforms to a (limited) FFmpeg timestamp format
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {string} n
     * @returns {boolean}
     *
     * @example
     * isValid('105s'); // output: true
     * isValid('105000ms'); // output: true
     * isValid('01:45'); // output: true
     * isValid('00:01:45'); // output: true
     * isValid('00:01:45.000'); // output: true
     * isValid('000:01:45.000'); // output: true
     */
    isValid : n => {
        
        return _.type.isString(n) && 
                ((
                    n.match(FFMPEG_TIMESTAMP_FORMAT) || 
                    n.match(YOUTUBE_TIMESTAMP) || 
                    n.match(SSML_TIMESTAMP_FORMAT)
                ) ? true : false);
    },
    
    /**
     * tests if a value conforms to a (limited) FFmpeg timestamp format
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {string} n
     * @returns {boolean}
     *
     * @example
     * isFFmpeg('00:01:45'); // output: true
     * isFFmpeg('00:01:45.000'); // output: true
     * isFFmpeg('000:01:45.000'); // output: true
     */
    isFFmpeg : n => {
        
        return _.type.isString(n) && 
               (n.match(FFMPEG_TIMESTAMP_FORMAT) ? true : false);
    },
    
    /**
     * tests if a value is a timestamp formatted for usage on Youtube
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {string} n
     * @returns {boolean}
     *
     * @example
     * isValid('01:45'); // output: true
     * isValid('00:01:45'); // output: true
     * isValid('000:01:45'); // output: true
     */
    isYoutube : n => {
        
        return _.type.isString(n) && 
               (n.match(YOUTUBE_TIMESTAMP) ? true : false);
    },
    
    /**
     * tests if a value is a timestamp formatted for usage in SSML
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {string} n
     * @returns {boolean}
     *
     * @example
     * isValid('5s'); // output: true
     * isValid('5000ms'); // output: true
     */
    isSSML : n => {
        
        return _.type.isString(n) && 
               (n.match(SSML_TIMESTAMP_FORMAT) ? true : false);
    },
    
    
    
    /*
     * PARSING
     */
    
    /**
     * parses a valid timestamp (SSML, Youtube, FFmpeg) and extracts values
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {string} timestamp
     * @returns {Object} time values
     *
     * @example
     * parse(`02:10:20.345`);
     * // ouput: {
     * //   milliseconds: 345,
     * //   seconds: 20,
     * //   minutes: 10,
     * //   hours: 2,
     * //   milliseconds_total: 7820345,
     * //   seconds_total: 7820.345,
     * //   minutes_total: 130.33908333333332,
     * //   hours_total: 2.1723180555555555
     * // }
     */
    parse : timestamp => {
        
        if (!_.type.isString(timestamp)) {
            _.logger.error(`Expected a timestamp as a string, but got ${_.type.of(timestamp)} "${timestamp}"`);
            return;
        }
        
        if (!__public.isValid(timestamp)) {
            _.logger.error(`Expected a timestamp in the format "hh:mm:ss.SSS", "hh:mm:ss", "mm:ss.SSS", "mm:ss", "5s" or "5000ms", but got "${timestamp}"`);
            return;
        }
        
        let ms = 0;
        let s = 0;
        let m = 0;
        let h = 0;
        let ms_total = 0;
        let s_total = 0;
        let m_total = 0;
        let h_total = 0;
        
        // convert SSML timestamp to FFmpeg
        if (__public.isSSML(timestamp)) {
            
            let ssml_ms = parseInt(timestamp.replace(/[a-z]+$/g, ''));
            
            // check if it's a "5s" timestamp instead of "5000ms"
            if (timestamp.match(/[^m]{1}s$/)) {
                ssml_ms *= 1000;
            }
            
            timestamp = __public.msec2ffmpeg(ssml_ms);
        }
        // convert Youtube timestamp to FFmpeg
        else if (__public.isYoutube(timestamp)) {
            timestamp = (timestamp.match(/[0-9]+\:[0-9]+\:[0-9]+/g, '') ? '' : '00:') + timestamp + '.000';
        }
        
        // get milliseconds of timestamp
        ms = timestamp.match(/\.[0-9]+$/);
        if (ms) {
            // remove milliseconds from timestamp string
            timestamp = timestamp.replace(/\.[0-9]+$/, '');
            // convert matched string to milliseconds
            ms = parseInt(ms[0].replace(/[^0-9]+/, ''));
            ms_total += ms;
            s_total += ms / 1000;
            m_total += ms / 1000 / 60;
            h_total += ms / 1000 / 60 / 60;
        }
        else {
            ms = 0;
        }
        
        // split rest of timestamp into array
        let vals = timestamp.split(':');
        // reverse values
        vals = vals.reverse();
        
        for (let i = 0, len = vals.length; i < len; i++) {
            switch (i) {
                
                case 0: {
                    s = parseInt(vals[i]);
                    ms_total += s * 1000;
                    s_total += s;
                    m_total += s / 60;
                    h_total += s / 60 / 60;
                    break;
                }
                
                case 1: {
                    m = parseInt(vals[i]);
                    ms_total += m * 60 * 1000;
                    s_total += m * 60;
                    m_total += m;
                    h_total += m / 60;
                    break;
                }
                
                case 2: {
                    h = parseInt(vals[i]);
                    ms_total += h * 60 * 60 * 1000;
                    s_total += h * 60 * 60;
                    m_total += h * 60;
                    h_total += h;
                    break;
                }
            }
        }

        return {
            milliseconds       : ms,
            seconds            : s,
            minutes            : m,
            hours              : h,
            milliseconds_total : ms_total,
            seconds_total      : s_total,
            minutes_total      : m_total,
            hours_total        : h_total
        };
    },
    
    
    
    /*
     * CONVERSION BETWEEN TIMESTAMPS
     */
    
    /**
     * converts a valid SSML or Youtube timestamp to a FFmpeg timestamp
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {string} timestamp - SSML or YouTube timestamp
     * @returns {string} FFmpeg timestamp
     *
     * @example
     * convertToFFmpeg('55s'); // output: '00:00:55.000'
     * convertToFFmpeg('00:55'); // output: '00:00:55.000'
     */
    convertToFFmpeg : timestamp => {
        
        if (__public.isYoutube(timestamp)) {
            return __public.youtube2ffmpeg(timestamp);
        }
        else if (__public.isSSML(timestamp)) {
            return __public.ssml2ffmpeg(timestamp);
        }
        else if (__public.isFFmpeg(timestamp)) {
            return timestamp;
        }
        
        _.logger.error(`Expected a timestamp in the format "hh:mm:ss.SSS", "hh:mm:ss", "mm:ss.SSS", "mm:ss", "2s" or "2000ms", but got "${timestamp}"`);
        return;
    },
    
    /**
     * converts a valid FFmpeg timestamp to a Youtube timestamp
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {string} timestamp - FFmpeg timestamp
     * @returns {string} Youtube timestamp
     *
     * @example
     * ffmpeg2youtube('00:20:59.500'); // output: '20:59'
     * ffmpeg2youtube('01:20:59.500'); // output: '01:20:59'
     */
    ffmpeg2youtube : timestamp => {
        
        if (!__public.isFFmpeg(timestamp)) {
            _.logger.error(`Expected a timestamp in the format "hh:mm:ss.SSS", "hh:mm:ss", "mm:ss.SSS" or "mm:ss", but got "${timestamp}"`);
            return;
        }
        
        // remove milliseconds, if included in the timestamp
        timestamp = timestamp.replace(/\.[0-9]+$/, '');
        
        // remove hours, if they're just zero
        if (timestamp.match(/^00\:[0-9]+\:[0-9]+$/)) {
            timestamp = timestamp.replace(/^00\:/, '');
        }
        
        return timestamp;
    },
    
    /**
     * converts a valid FFmpeg timestamp to a SSML timestamp
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {string} timestamp - FFmpeg timestamp
     * @returns {string} SSML timestamp
     *
     * @example
     * ffmpeg2ssml('00:00:02.500'); // output: '2500ms'
     */
    ffmpeg2ssml : timestamp => {
        
        if (!__public.isFFmpeg(timestamp)) {
            _.logger.error(`Expected a timestamp in the format "hh:mm:ss.SSS", "hh:mm:ss", "mm:ss.SSS" or "mm:ss", but got "${timestamp}"`);
            return;
        }
        
        // parse timestamp and get milliseconds
        let ms = __public.parse(timestamp).milliseconds_total;
        
        return __public.msec2ssml(timestamp);
    },
    
    /**
     * converts a valid Youtube timestamp to a FFmpeg timestamp
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {string} timestamp - Youtube timestamp
     * @returns {string} FFmpeg timestamp
     *
     * @example
     * youtube2ffmpeg('00:02'); // output: '00:00:02.000'
     * youtube2ffmpeg('05:00:02'); // output: '05:00:02.000'
     */
    youtube2ffmpeg : timestamp => {
        
        if (!__public.isYoutube(timestamp)) {
            _.logger.error(`Expected a timestamp in the format "hh:mm:ss" or "mm:ss", but got "${timestamp}"`);
            return;
        }
        
        // parse timestamp and get milliseconds
        let sec = __public.parse(timestamp).seconds_total;
        
        return __public.sec2ffmpeg(sec);
    },
    
    /**
     * converts a valid Youtube timestamp to a SSML timestamp
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {string} timestamp - Youtube timestamp
     * @returns {string} SSML timestamp
     *
     * @example
     * youtube2ssml('00:02'); // output: '2s'
     * youtube2ssml('05:00:02'); // output: '18002s'
     */
    youtube2ssml : timestamp => {
        
        if (!__public.isYoutube(timestamp)) {
            _.logger.error(`Expected a timestamp in the format "hh:mm:ss" or "mm:ss", but got "${timestamp}"`);
            return;
        }
        
        // parse timestamp and get milliseconds
        let sec = __public.parse(timestamp).seconds_total;
        
        return __public.sec2ssml(sec);
    },
    
    /**
     * converts a valid SSML timestamp to a FFmpeg timestamp
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {string} timestamp - SSML timestamp
     * @returns {string} FFmpeg timestamp
     *
     * @example
     * ssml2ffmpeg('2s'); // output: '00:00:02.000'
     * ssml2ffmpeg('2000ms'); // output: '00:00:02.000'
     */
    ssml2ffmpeg : timestamp => {
        
        if (!__public.isSSML(timestamp)) {
            _.logger.error(`Expected a timestamp like "2s" or "2000ms", but got "${timestamp}"`);
            return;
        }
            
        // determine the time in milliseconds
        let time = 0;
        if (timestamp.match(/ms$/)) {
            time = parseInt(timestamp.match(/^[0-9]+/)[0]);
        }
        else {
            time = parseInt(timestamp.match(/^[0-9]+/)[0]) * 1000;
        }

        timestamp = __public.msec2ffmpeg(time);
        
        return timestamp;
    },
    
    /**
     * converts a valid SSML timestamp to a Youtube timestamp
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {string} timestamp - SSML timestamp
     * @returns {string} Youtube timestamp
     *
     * @example
     * ssml2youtube('2345ms'); // output: '00:02'
     * ssml2youtube('2s'); // output: '00:02'
     * ssml2youtube('9000s'); // output: '02:30:00'
     */
    ssml2youtube : timestamp => {
        
        if (!__public.isSSML(timestamp)) {
            _.logger.error(`Expected a timestamp like "2s" or "2000ms", but got "${timestamp}"`);
            return;
        }
            
        // determine the time in milliseconds
        let time = 0;
        if (timestamp.match(/ms$/)) {
            time = parseInt(timestamp.match(/^[0-9]+/)[0]);
        }
        else {
            time = parseInt(timestamp.match(/^[0-9]+/)[0]) * 1000;
        }

        timestamp = __public.msec2youtube(time);
        
        return timestamp;
    },
    
    
    
    /*
     * CONVERSION WITH TIME VALUES
     */
    
    /**
     * converts milliseconds to a FFmpeg timestamp
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {integer} time - milliseconds
     * @returns {string} FFmpeg timestamp
     * 
     * @example
     * msec2ffmpeg(2500); // output: '00:00:02.500'
     * msec2ffmpeg(99999999); // output: '27:46:39.999'
     */
    msec2ffmpeg : time => {
        
        if (!_.type.isInteger(time)) {
            _.logger.error(`Expected milliseconds as an integer, but got ${_.type.of(time)} "${time}"`);
            return;
        }

        let ms = time % 1000;
        time = (time - ms) / 1000;
        let s = time % 60;
        time = (time - s) / 60;
        let min = time % 60;
        let hr = (time - min) / 60;

        return `${(hr+'').padStart(2,'0')}:${(min+'').padStart(2,'0')}:${(s+'').padStart(2,'0')}.${(ms+'').padStart(3,'0')}`;
    },
    
    /**
     * converts seconds to a FFmpeg timestamp
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {integer} time - seconds
     * @returns {string} FFmpeg timestamp
     *
     * @example
     * sec2ffmpeg(2); // output: '00:00:02.000'
     * sec2ffmpeg(9999); // output: '02:46:39.000'
     */
    sec2ffmpeg : time => {
        
        if (!_.type.isInteger(time)) {
            _.logger.error(`Expected seconds as an integer, but got ${_.type.of(time)} "${time}"`);
            return;
        }
        
        // convert to milliseconds
        let ms = time * 1000;
        
        return __public.msec2ffmpeg(ms);
    },
    
    /**
     * converts milliseconds to a Youtube timestamp
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {integer} time - milliseconds
     * @returns {string} Youtube timestamp
     *
     * @example
     * msec2youtube(2500); // output: '00:02'
     * msec2youtube(99999999); // output: '27:46:39'
     */
    msec2youtube : time => {
        
        if (!_.type.isInteger(time)) {
            _.logger.error(`Expected milliseconds as an integer, but got ${_.type.of(time)} "${time}"`);
            return;
        }
        
        // convert time (milliseconds) to seconds
        time = parseInt(time / 1000);
        
        let s = time % 60;
        time = (time - s) / 60;
        let min = time % 60;
        let hr = (time - min) / 60;
        
        return `${(hr > 0 ? (hr+'').padStart(2,'0')+':' : '')}${(min+'').padStart(2,'0')}:${(s+'').padStart(2,'0')}`;
    },
    
    /**
     * converts seconds to a Youtube timestamp
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {integer} time - seconds
     * @returns {string} Youtube timestamp
     *
     * @example
     * sec2youtube(2); // output: '00:02'
     * sec2youtube(9999); // output: '02:46:39'
     */
    sec2youtube : time => {
        
        if (!_.type.isInteger(time)) {
            _.logger.error(`Expected seconds as an integer, but got ${_.type.of(time)} "${time}"`);
            return;
        }
        
        // convert to milliseconds
        let ms = time * 1000;
        
        return __public.msec2youtube(ms);
    },
    
    /**
     * converts milliseconds to a SSML timestamp
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {integer} time - milliseconds
     * @returns {string} SSML timestamp
     *
     * @example
     * msec2youtube(2500); // output: '2500ms'
     * msec2youtube(99999999); // output: '99999999ms'
     */
    msec2ssml : time => {
        
        if (!_.type.isInteger(time)) {
            _.logger.error(`Expected milliseconds as an integer, but got ${_.type.of(time)} "${time}"`);
            return;
        }
        
        return `${time}ms`;
    },
    
    /**
     * converts seconds to a SSML timestamp
     *
     * @function
     * @alias module:timestamp
     * @category public
     * 
     * @param {integer} time - seconds
     * @returns {string} SSML timestamp
     *
     * @example
     * sec2youtube(2); // output: '2s'
     * sec2youtube(9999); // output: '9999s'
     */
    sec2ssml : time => {
        
        if (!_.type.isInteger(time)) {
            _.logger.error(`Expected seconds as an integer, but got ${_.type.of(time)} "${time}"`);
            return;
        }
        
        return `${time}s`;
    }
};

module.exports = __public;