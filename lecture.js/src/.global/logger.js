/**
 * @module logger
 * @desc provides methods for logging to the terminal or a file
 *
 * @example
 * const _ = {};
 * _.logger = require('/.global/logger.js');
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
_.readline = require('readline');

// utility scripts
_.type   = require('./type-tests.js');
_.format = require('./formatting-codes.js');



/*
 * =========
 * CONSTANTS
 * =========
 */

// holds log objects
const LOGS = [];

// end of line character
const EOL = _.os.EOL;



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

const SETTING = {
    // by default, color logs when printed in terminal
    colored_logs : true,
    // by default, use this as the maximum number of logs that can appear in a log file
    // older logs are discarded
    max_logs_amount : 2000
};



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * formats a Date object to a string in the format of `yy/mm/dd hh:mm:ss.SSS`
 *
 * @function
 * @alias module:logger
 * @category private
 * 
 * @param {Object} date - date object
 * @returns {string} formatted date string
 *
 * @example
 * stringifyDate(new Date());
 * // output: '20/08/22 00:03:10.234'
 */
const stringifyDate = date => {

    if (!_.type.isDate(date)) {
        console.error(`Expected a valid date, but got ${_.type.of(date)} "${date}"`);
        return;
    }

    return '' +
        // date
        date.getFullYear().toString().substr(2,2) + '/' +
        (date.getMonth() + 1).toString().padStart(2, '0') + '/' +
        date.getDate().toString().padStart(2, '0') + ' ' +
        // time
        date.getHours().toString().padStart(2, '0') + ':' +
        date.getMinutes().toString().padStart(2, '0') + ':' +
        date.getSeconds().toString().padStart(2, '0') + '.' +
        date.getMilliseconds().toString().padStart(3, '0');
};

/**
 * creates a silent error and reads trace information from the error stack
 *
 * @function
 * @alias module:logger
 * @category private
 * 
 * @returns {Object} error trace
 */
const getTrace = () => {
    
    let error_stack = new Error().stack;
    
    let file_name = '';
    let file_path = '';
    let line = '';
    
    try {
        // "getting a trace line" code by https://stackoverflow.com/a/39684350
        let trace_line = error_stack.split('at ')[5];
        
        // if the logs were called by "processMultipleLogs" instead of "processLogs", the relevant trace is on a different line
        if (trace_line.match(/^Array\.forEach/)) {
            trace_line = error_stack.split('at ')[8];
        }
        
        let trace_line_shortened = trace_line.trim().replace(/^(.*[\/\\]+)([^\/\\]+)\)$/, '$2');

        // get the basename
        file_name = trace_line_shortened.replace(/(^[^\:]+)(\:.*)/, '$1');

        // get the file path enclosed in parenthesis, e.g., (C:\Users\Name\script.js:10:7) 
        let file_path_parenthesis = trace_line.match(/(\(.*\))/);
        if (file_path_parenthesis) {
            file_path_parenthesis = file_path_parenthesis[0];
        }
        else {
            file_name = trace_line.trim()
                            .replace(/^.*(\/|\\)/, '')
                            .replace(/(\:[^\:\/\\]*)*$/, '');
            
            file_path_parenthesis = '('+trace_line.trim()+')';
        }
        
        // get the file path up to directory /src/
        file_path = file_path_parenthesis.replace(/^(\(.*)(src[\/\\]+[^:]*)(.*\))/, '$2');
        
        // if the above fails, just set file path to file name
        if (file_path == file_path_parenthesis) {
            file_path = file_name;
        }

        // get the file line where the log was invoked 
        line = trace_line_shortened.match(/[0-9\:]+$/)[0].replace(/^\:/, '');
    }
    catch (err) {
        console.error('Failed retrieving the log trace information for:', error_stack, EOL, 'because: ', err);
    }
    
    let trace = {
        file_name : file_name,
        file_path : file_path,
        line      : line
    };
    
    return trace;
};

/**
 * creates a log object of the given type and content
 *
 * @function
 * @alias module:logger
 * @category private
 * 
 * @param {string} type
 * @param {...*} content
 * @returns {Object} log
 */
const createLog = (type, ...content) => {
        
    if (!_.type.isString(type) || type === '') {
        console.error(`Expected a log type as a string, but got ${_.type.of(type)} "${type}"`);
        return;
    }
    
    let trace = getTrace();
    
    return {
        type      : type,
        date      : (new Date()).toISOString(),
        content   : [...content].join(' '),
        file_name : trace.file_name,
        file_path : trace.file_path,
        line      : trace.line
    };
};

/**
 * saves a log object in the logs array
 *
 * @function
 * @alias module:logger
 * @category private
 * 
 * @param {Object} log
 */
const saveLog = log => {
        
    if (!_.type.isObject(log)) {
        console.error(`Expected a log as an object, but got ${_.type.of(log)} "${log}"`);
        return;
    }
    
    // if the logs object is full, remove the first entry
    if (LOGS.length >= SETTING.max_logs_amount) {
        LOGS.shift();
    }
    
    // push the new log inside
    LOGS.push(log);
};

/**
 * writes a log object into a file
 *
 * @function
 * @alias module:logger
 * @category private
 * 
 * @param {string} file_path
 * @param {Object} log
 */
const writeLog = (file_path, log) => {
        
    if (!_.type.isString(file_path) || file_path === '') {
        console.error(`Expected a file path as a string, but got ${_.type.of(file_path)} "${file_path}"`);
        return;
    }
        
    if (!_.type.isObject(log)) {
        console.error(`Expected a log as an object, but got ${_.type.of(log)} "${log}"`);
        return;
    }

    // convert the log object to a string
    let date_string = stringifyDate(new Date(log.date));
    let log_type = (log.type == 'message' ? 'LOG' : log.type.toUpperCase());
    let log_string = `${date_string} [${log_type}] ${log.content} (${log.file_path}:${log.line})`;
    
    // if the defined log file does not exist, 
    // create it with the log as the first entry
    if (!_.fs.existsSync(file_path)) {
        _.fs.writeFileSync(file_path, log_string);
        return;
    }
    
    // get the number of lines in the current .log file
    let current_logs = _.fs.readFileSync(file_path).toString();
    let lines = current_logs.split(/\r\n|\r|\n/);

    // if current log file already reached the maximum number of logs, remove older logs
    if (lines.length >= SETTING.max_logs_amount) {
        let output = '';
        // loop from the back
        for (let i = SETTING.max_logs_amount - 1; i > 0; i--) {
            output = (i > 1 ? EOL : '') + lines[i] + output;
        }
        _.fs.writeFileSync(file_path, output + EOL + log_string);
    }
    else {
        _.fs.writeFileSync(file_path, current_logs + EOL + log_string);
    }
};

/**
 * writes a log object (of the logs array at a given index) into a file
 *
 * @function
 * @alias module:logger
 * @category private
 * 
 * @param {string} file_path
 * @param {integer} index
 */
const writeIndex = (file_path, index) => {
        
    if (!_.type.isString(file_path) || file_path === '') {
        console.error(`Expected a file path as a string, but got ${_.type.of(file_path)} "${file_path}"`);
        return;
    }
        
    if (!_.type.isInteger(index)) {
        console.error(`Expected an index as an integer, but got ${_.type.of(index)} "${index}"`);
        return;
    }
    
    writeLog(file_path, LOGS[index]);
};

/**
 * prints a log object
 *
 * @function
 * @alias module:logger
 * @category private
 * 
 * @param {Object} log
 */
const printLog = log => {
        
    if (!_.type.isObject(log)) {
        console.error(`Expected a log as an object, but got ${_.type.of(log)} "${log}"`);
        return;
    }

    // get a custom date/time string
    let time = stringifyDate(new Date(log.date));
    
    // create a string with the trace information of the log
    let trace = '(' + log.file_path + ':' + log.line + ')';

    switch (log.type) {

        case 'fatal' : {
            let formatting = '';
            if (SETTING.colored_logs) {
                formatting = _.format.bold + _.format.brightWhite + _.format.bgRed;
            }
            console.error(formatting + `${time} [FATAL] ${log.content} ${trace}` + _.format.reset);
            break;
        }

        case 'error': {
            let formatting = '';
            if (SETTING.colored_logs) {
                formatting = _.format.bold + _.format.brightRed;
            }
            console.error(formatting + `${time} [ERROR] ${log.content} ${trace}` + _.format.reset);
            break;
        }

        case 'warn': {
            let formatting = '';
            if (SETTING.colored_logs) {
                formatting = _.format.bold + _.format.brightYellow;
            }
            console.warn(formatting + `${time} [WARN] ${log.content} ${trace}` + _.format.reset);
            break;
        }

        case 'info': {
            let formatting = '';
            if (SETTING.colored_logs) {
                formatting = _.format.brightCyan;
            }
            console.info(formatting + `${time} [INFO] ${log.content} ${trace}` + _.format.reset);
            break;
        }

        case 'message': {
            let formatting = '';
            if (SETTING.colored_logs) {
                formatting = _.format.white;
            }
            console.log(formatting + `${time} [LOG] ${log.content}` + _.format.reset);
            break;
        }

        case 'question': {
            let formatting = _.format.bold + _.format.brightMagenta;
            console.log(formatting + `${time} [QUESTION] ${log.content}` + _.format.reset);
            break;
        }
            
        default: {
            console.error(`Given log type ${log.type} does not exist`);
            break;
        }
    }
};
    
/**
 * prints a log object found in the logs array by a given index
 *
 * @function
 * @alias module:logger
 * @category private
 * 
 * @param {integer} index
 */
const printIndex = index => {
        
    if (!_.type.isInteger(index)) {
        console.error(`Expected an index as an integer, but got ${_.type.of(index)} "${index}"`);
        return;
    }
    
    printLog(LOGS[index]);
};
    
/**
 * creates, saves and prints a single log
 *
 * @function
 * @alias module:logger
 * @category private
 * 
 * @param {string} type - type of the logs
 * @param {...*} content - variable number of arguments that will be combined into one log
 *
 * @example
 * processLog('fatal', 'log', 1 'test');
 * // output: [FATAL] log 1 test
 */
const processLog = (type, ...content) => {
        
    if (!_.type.isString(type) || type === '') {
        console.error(`Expected a log type as a string, but got ${_.type.of(type)} "${type}"`);
        return;
    }
    
    // create a log object
    const log = createLog(type, ...content);
    
    // save the log in the logs object
    saveLog(log);
    
    // print the log in the terminal
    printLog(log);
};
    
/**
 * creates, saves and prints multiple logs of the same type
 *
 * @function
 * @alias module:logger
 * @category private
 * 
 * @param {string} type - type of the logs
 * @param {Array.<*>} contentArray - each index of which (can be an array also) will be treated as its own log
 *
 * @example
 * let logs = [
 *   'log1',
 *   'log2',
 *   ['log3', 'test']
 * ];
 * processMultipleLogs('fatal', logs);
 * // output:
 * // [FATAL] log1
 * // [FATAL] log2
 * // [FATAL] log3 test
 */
const processMultipleLogs = (type, contentArray) => {
        
    if (!_.type.isString(type) || type === '') {
        console.error(`Expected a log type as a string, but got ${_.type.of(type)} "${type}"`);
        return;
    }

    if (!_.type.isArray(contentArray)) {
        console.error(`Expected content as an array, but got ${_.type.of(contentArray)} "${contentArray}"`);
        return;
    }
    
    // each entry of the content array is a new log
    contentArray.forEach(content => {
        if (_.type.isArray(content)) {
            processLog(type, ...content);
        }
        else {
            processLog(type, content);
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
     * sets an internal option with a value
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {('max_logs_amount'|'colored_logs')} key - name of the option
     * @param {*} value - value of the option
     * @returns {boolean} true on success
     *
     * @example
     * // set maximum number of logs that is held by the logs object (older ones are discarded)
     * setOption('max_logs_amount', 500);
     * // set if logs printed in the terminal should be formatted with color
     * setOption('colored_logs', true);
     */
    setOption : (key, value) => {
        
        if (!_.type.isString(key) || key === '') {
            console.error(`Expected a key as a string, but got ${_.type.of(key)} "${key}"`);
            return;
        }
        
        // check if the value has the correct type
        switch (key) {
                
            case 'max_logs_amount': {
                if (!_.type.isInteger(value) || value < 1) {
                    return false;
                }
                break;
            }
                
            case 'colored_logs': {
                if (!_.type.isBoolean(value)) {
                    return false;
                }
                break;
            }
                
            default: {
                return false;
            }
        }
        
        // apply the setting
        SETTING[key] = value;
        return true;
    },
    
    
    
    /*
     * LOGGING COMMANDS
     */
    
    /**
     * prints a fatal error and saves it as a log
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {...*} content - variable number of arguments that will be combined into one log
     *
     * @example
     * fatal('log',1,'test');
     * // output: [FATAL] log 1 test
     */
    fatal : (...content) => {
        processLog('fatal', ...content);
    },
    
    /**
     * prints multiple fatal errors and saves them in logs
     * 
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {Array.<*>} contentArray - each index of which (can be an array also) will be treated as its own log
     *
     * @example
     * let logs = [
     *   'log1',
     *   'log2',
     *   ['log3', 'test']
     * ];
     * fatalMultiple(logs);
     * // output:
     * // [FATAL] log1
     * // [FATAL] log2
     * // [FATAL] log3 test
     */
    fatalMultiple : contentArray => {
        
        if (!_.type.isArray(contentArray)) {
            console.error(`Expected an array, but got ${_.type.of(contentArray)} "${contentArray}"`);
            return;
        }
        
        processMultipleLogs('fatal', contentArray);
    },
    
    /**
     * prints an error and saves it as a log
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {...*} content - variable number of arguments that will be combined into one log
     *
     * @example
     * error('log',1,'test');
     * // output: [ERROR] log 1 test
     */
    error : (...content) => {
        processLog('error', ...content);
    },
    
    /**
     * prints multiple errors and saves them in logs
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {Array.<*>} contentArray - each index of which (can be an array also) will be treated as its own log
     *
     * @example
     * let logs = [
     *   'log1',
     *   'log2',
     *   ['log3', 'test']
     * ];
     * errorMultiple(logs);
     * // output:
     * // [ERROR] log1
     * // [ERROR] log2
     * // [ERROR] log3 test
     */
    errorMultiple : contentArray => {
        
        if (!_.type.isArray(contentArray)) {
            console.error(`Expected an array, but got ${_.type.of(contentArray)} "${contentArray}"`);
            return;
        }
        
        processMultipleLogs('error', contentArray);
    },
    
    /**
     * prints a warning and saves it as a log
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {...*} content - variable number of arguments that will be combined into one log
     *
     * @example
     * warn('log',1,'test');
     * // output: [WARN] log 1 test
     */
    warn : (...content) => {
        processLog('warn', ...content);
    },
    
    /**
     * prints multiple warnings and saves them in logs
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {Array.<*>} contentArray - each index of which (can be an array also) will be treated as its own log
     *
     * @example
     * let logs = [
     *   'log1',
     *   'log2',
     *   ['log3', 'test']
     * ];
     * warnMultiple(logs);
     * // output:
     * // [WARN] log1
     * // [WARN] log2
     * // [WARN] log3 test
     */
    warnMultiple : contentArray => {
        
        if (!_.type.isArray(contentArray)) {
            console.error(`Expected an array, but got ${_.type.of(contentArray)} "${contentArray}"`);
            return;
        }
        
        processMultipleLogs('warn', contentArray);
    },
    
    /**
     * prints an info and saves it as a log
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {...*} content - variable number of arguments that will be combined into one log
     *
     * @example
     * info('log',1,'test');
     * // output: [INFO] log 1 test
     */
    info : (...content) => {
        processLog('info', ...content);
    },
    
    /**
     * prints multiple infos and saves them in logs
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {Array.<*>} contentArray - each index of which (can be an array also) will be treated as its own log
     *
     * @example
     * let logs = [
     *   'log1',
     *   'log2',
     *   ['log3', 'test']
     * ];
     * infoMultiple(logs);
     * // output:
     * // [INFO] log1
     * // [INFO] log2
     * // [INFO] log3 test
     */
    infoMultiple : contentArray => {
        
        if (!_.type.isArray(contentArray)) {
            console.error(`Expected an array, but got ${_.type.of(contentArray)} "${contentArray}"`);
            return;
        }
        
        processMultipleLogs('info', contentArray);
    },
    
    /**
     * prints a message and saves it as a log
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {...*} content - variable number of arguments that will be combined into one log
     *
     * @example
     * message('log',1,'test');
     * // output: [LOG] log 1 test
     */
    message : (...content) => {
        processLog('message', ...content);
    },
    
    /**
     * prints multiple messages and saves them in logs
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {Array.<*>} contentArray - each index of which (can be an array also) will be treated as its own log
     *
     * @example
     * let logs = [
     *   'log1',
     *   'log2',
     *   ['log3', 'test']
     * ];
     * messageMultiple(logs);
     * // output:
     * // [LOG] log1
     * // [LOG] log2
     * // [LOG] log3 test
     */
    messageMultiple : contentArray => {
        
        if (!_.type.isArray(contentArray)) {
            console.error(`Expected an array, but got ${_.type.of(contentArray)} "${contentArray}"`);
            return;
        }
        
        processMultipleLogs('message', contentArray);
    },
    
    /**
     * asks a question and receives a user answer via the terminal
     *
     * @async
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {...*} content - variable number of arguments that will be combined into one question
     * @returns {Promise.<string>} answer entered by the user
     */
    question : async(...content) => {
        
        let readline = _.readline.createInterface({
            input  : process.stdin,
            output : process.stdout
        });
        
        const log = createLog('question', ...content);
        
        printLog(log);
        
        return new Promise((resolve, reject) => {
            try {
                readline.question('> ', answer => {
                    resolve(answer);
                    readline.close();
                });
            }
            catch (err) {
                reject(err);
            }
        });
    },
    
    /**
     * asks a question and returns true, if the user entered 'y' or 'Y'
     *
     * @async
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {...*} content - variable number of arguments that will be combined into one question
     * @returns {Promise.<boolean>} true, if the user confirmed it
     */
    confirm : async(...content) => {
        let answer = await __public.question(...content, `[y/n]`);
        return answer.toLowerCase() === 'y';
    },
    
    /**
     * prints all logs created since the start of the program and that are still saved
     *
     * @function
     * @alias module:logger
     * @category public
     */
    printAll : () => {
        LOGS.forEach(printIndex);
    },
    
    
    
    /*
     * QUERIES
     */
    
    /**
     * returns the number of logs in the logs array
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @returns {integer} amount of logs
     */
    countLogs : () => {
        return LOGS.length;
    },
    
    /**
     * returns all log objects
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @returns {Array.<Object>} array with copies of all log objects
     */
    getAll : () => {
        // returns a deep copy of the logs object
        return _.v8.deserialize(_.v8.serialize(LOGS));
    },
    
    /**
     * returns all log objects with a specific type
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {string} type - types include: message, info, warn, error, fatal
     * @returns {Array.<Object>} array with copies of log objects
     */
    getWithType : type => {
        
        if (!_.type.isString(type) || type === '') {
            console.error(`Expected a log type as a string, but got ${_.type.of(type)} "${type}"`);
            return;
        }
        
        let response = [];
        
        LOGS.forEach(log => {
            if (log.type === type) {
                // create a deep copy
                let copy = _.v8.deserialize(_.v8.serialize(log));
                response.push(copy);
            }
        });
        
        return response;
    },
    
    /**
     * returns the latest log object
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @returns {Object} copy of the last log object
     */
    getLast : () => {
        // return a deep copy
        let last_log = LOGS[LOGS.length - 1];
        return _.v8.deserialize(_.v8.serialize(last_log));
    },
    
    
    
    /*
     * OUTPUT
     */
    
    /**
     * writes the current contents of the logs object into a file
     *
     * @function
     * @alias module:logger
     * @category public
     * 
     * @param {string} file_path - path at where to write the file
     */
    writeLogsToFile : file_path => {
        
        if (!_.type.isString(file_path) || file_path === '') {
            console.error(`Expected a file path as a string, but got ${_.type.of(file_path)} "${file_path}"`);
            return;
        }
        
        // check if the given path is not for a file
        let extension = _.path.extname(file_path);
        if (['.',''].includes(extension)) {
            console.error(`Could not create log file at path "${file_path}", because the given path does not include a file name`);
            return;
        }
        
        // check if the given directory exists
        if (!_.fs.existsSync(_.path.dirname(file_path))) {
            console.error(`Could not create log file at path "${file_path}", because the given directory does not exist`);
            return;
        }
        
        LOGS.forEach(log => {
            writeLog(file_path, log);
        });
    }
};

module.exports = __public;