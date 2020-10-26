/**
 * @module install
 * @desc installs all necessary npm modules for the project
 */

'use strict';

/*
 * =======
 * MODULES
 * =======
 */

const _ = {};
_.os   = require('os');
_.path = require('path');
_.child_process = require('child_process');



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

const EOL = _.os.EOL;



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * installs npm modules in the /src/ directory
 *
 * @function
 * @alias module:install
 * @category private
 */
const installModules = async() => {
    
    console.log(`Installing all required node modules...`);
    console.log(`${EOL}THIS MAY TAKE A WHILE! DO NOT CLOSE THE WINDOW!${EOL}`);
    
    // await the finished installation process
    await new Promise(resolve => {

        // called after the process is terminated
        const callback = (error, stdout, stderr) => {

            if (stderr) {
                console.log(`stderr: ${stderr}`);
            }
                
            if (error !== null) {
                console.log(`${EOL}Failed to finish the installation process${EOL + EOL}Error: ${error}`);
            }
            else {
                console.log(`${EOL}Successfully finished the installation process`);
            }
            
            console.log(`${EOL}You can close the window now!${EOL}`);
            
            resolve();
        };

        // execute npm installation as a separate process
        let child = _.child_process.exec(`npm install`, {
            cwd : _.path.join(__dirname, 'src')
        }, callback);

        // prints any stdout data received from the process as soon as it begins
        child.stdout.on('data', data => {
            console.log(data.toString());
        });
    });

    process.exit(0);
};

installModules();
