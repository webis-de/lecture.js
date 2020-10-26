/**
 * @module environment
 * @desc checks if certain programs are available in the user's environment
 *
 * @example
 * const _ = {};
 * _.environment = require('/.global/environment.js');
 */

'use strict';

/*
 * =======
 * MODULES
 * =======
 */

const _ = {};
_.child_process = require('child_process');

// utility scripts
_.logger = require('./logger.js');



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /* 
     * PROGRAM CHECKS
     */
    
    /**
     * checks if Java is installed on the machine
     *
     * @async
     * @function
     * @alias module:environment
     * @category public
     *
     * @returns {Promise.<boolean>} true, if Java is installed
     */
    javaIsInstalled : async() => {
        
        let java_version = __public.getJavaVersion();
        
        // if no Java version could be retrieved, it must be not installed
        if (!java_version) {
            return false;
        }
        
        return true;
    },
    
    /**
     * returns the version of Java currently installed on the system
     *
     * @async
     * @function
     * @alias module:environment
     * @category public
     *
     * @returns {Promise.<string>} Java version
     */
    getJavaVersion : async() => {
        
        return new Promise(resolve => {
        
            let spawn = _.child_process.spawn('java', ['-version']);

            spawn.on('error', err => {
                _.logger.error(`Failed retrieving the Java version, because: ${err}`);
                return resolve();
            });
            
            spawn.stderr.on('data', data => {
                
                data = data.toString().split('\n')[0];
                
                // test if a version exists
                if (!(new RegExp('java version').test(data))) {
                    return resolve();
                }
                
                // return Java version
                let version = data.split(' ')[2].replace(/"/g, '');
                
                return resolve(version);
            });
        });
    }
};

module.exports = __public;