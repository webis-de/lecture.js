
/**
 * @module requests
 * @desc runs batches of requests asynchronously with specific limits
 *
 * @example
 * const _ = {};
 * _.requester = require('/.global/requester.js');
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

// holding current open requests
const REQUEST_BATCHES = {};



/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
	
	/**
     * runs a batch of requests in parallel with defined limits
     *
	 * @async
     * @function
     * @alias module:requests
     * @category public
     *
     * @param {Array.<{function: Function, parameters: Array.<*>, callback: Function, callback_parameters: Array.<*>}>} requests - requests to be run
     * @param {Object} options - set of options
	 * @param {integer} options.max_concurrent - maximum requests that may run concurrently
	 * @param {integer} options.max_per_second - maximum requests that may be started in any second
     * @returns {Promise.<undefined>}
     *
	 * @example
	 * let reqs = [
     *     {
     *         // the function is run with the given parameters
     *         function : function1,
     *         parameters : ['hello', 12.56],
     *         // after the function ran, the callback function is called
     *         callback : (output, param1, param2) => {
     *              console.log('This is the output from function1:', output);
     *              console.log('This will spell "abc":', param1);
     *              console.log('This will spell 12345:', param2);
     *         },
     *         callback_parameters : ['abc', 12345]
     *     },{
     *         function : function2,
     *         parameters : [8, 4.3, {test:2}],
     *         callback : callback2
     *     }
	 * ];
	 * let options = {
     *     max_concurrent : 3,
     *     max_per_second : 2
     * };
     * await run(reqs, options);
     */
	run : async(requests, options) => {
        
        if (!_.type.isArray(requests)) {
            _.logger.error(`Expected an array of requests, but got ${_.type.of(requests)} "${requests}"`);
            return;
        }
        
        for (let i = 0, len = requests.length; i < len; i++) {
            
            let req = requests[i];
            
            if (!_.type.isObject(req) || !_.type.isFunction(req.function)) {
                _.logger.error(`A request must be an object with at least the property 'function' defined, but got ${_.type.of(req)} "${req}"`);
                return;
            }
            
            // set or replace other properties of the request if they're wrong or undefined
            req.parameters = _.type.isArray(req.parameters) ? req.parameters : [];
            req.callback = _.type.isFunction(req.callback) ? req.callback : new Function();
            req.callback_parameters = _.type.isArray(req.callback_parameters) ? req.callback_parameters : [];
        }
        
        if (!_.type.isObject(options)) {
            _.logger.error(`Expected options to be an object, but got ${_.type.of(options)} "${options}"`);
            return;
        }
        
        if (!_.type.isInteger(options.max_concurrent) || options.max_concurrent < 1) {
            _.logger.error(`Expected options.max_concurrent to be an integer above 0, but got ${_.type.of(options.max_concurrent)} "${options.max_concurrent}"`);
            return;
        }
        
        if (!_.type.isInteger(options.max_per_second) || options.max_per_second < 1) {
            _.logger.error(`Expected options.max_per_second to be an integer above 0, but got ${_.type.of(options.max_per_second)} "${options.max_per_second}"`);
            return;
        }
        
        // generate an id for the batch of requests
        let id = _.basic.getUUIDv4();
        
        // create the object with references about the given batch of requests
        REQUEST_BATCHES[id] = {
            // holds the request objects that are currently being executed
            requests : [],
            // reference to the interval loop
            interval : null,
            // timer counting up to 1000 milliseconds, before restarting
            timer : 0,
            // counts the requests started in the current second
            started_requests : 0,
            // counts the number of callback calls that are still open (asynchronously)
            started_callbacks : 0
        };
        
        return new Promise((resolve, reject) => {
            
            REQUEST_BATCHES[id].interval = setInterval(async() => {
                
                let batch = REQUEST_BATCHES[id];
                
                // if a second was reached, reset the started requests for the second
                if (batch.timer >= 1000) {
                    batch.timer = 0;
                    batch.started_requests = 0;
                }
                
                // increase the timer
                batch.timer += 5;
                
                // check if the max number of requests is already running
                if (batch.requests.length >= options.max_concurrent) {
                    return;
                }
                
                // check if the max number of requests for one second was already started
                if (batch.started_requests >= options.max_per_second) {
                    return;
                }
                
                // if all requests were executed, end the loop
                if (
                    batch.requests.length == 0 &&
                    requests.length == 0
                ) {
                    if (batch.started_callbacks == 0) {
                        clearInterval(batch.interval);
                        delete REQUEST_BATCHES[id];
                        resolve();
                    }
                    return;
                }
                
                // if all requests were started, don't add new ones
                if (requests.length == 0) {
                    return;
                }
                
                // otherwise, start a request
                batch.started_requests++;
                let request_id = _.basic.getUUIDv4();
                // the request is a function call with parameters
                let request = requests[0].function(...requests[0].parameters);
                let callback_parameters = requests[0].callback_parameters;
                
                // add the generated request to the currently running requests
                batch.requests.push({
                    id       : request_id,
                    request  : request,
                    callback : requests[0].callback
                });
                
                // remove the newly started request from the input array
                // so that it is not called a second time
                requests.shift();
                
                // check if the request returns a promise,
                // and apply an asynchronous callback
                if (_.type.isPromise(request)) {
                    // proceed once the asynchronous function finished
                    await request.then(async(output) => {

                        // find the right request in the list
                        for (let i = 0, len = batch.requests.length; i < len; i++) {
                            if (batch.requests[i].id == request_id) {
                                
                                let callback = batch.requests[i].callback;
                                let response = callback(output, ...callback_parameters);
                                
                                // if the callback call is asynchronous
                                if (_.type.isPromise(response)) {
                                    // increase the counter
                                    batch.started_callbacks++;
                                    // decrease again, if the callback is completed
                                    response
                                        .then(() => {
                                            batch.started_callbacks--;
                                        });
                                }
                                
                                // remove the reference to the completed request
                                _.basic.removeArrayIndex(batch.requests, i);
                                
                                break;
                            }
                        }
                    });
                }
                // if the request is synchronous and returns some value
                // call the callback function directly
                else {
                    
                    let index = batch.requests.length - 1;
                    let callback = batch.requests[index].callback;
                    let response = callback(request, ...callback_parameters);
                    
                    // remove the reference to the completed request
                    batch.requests.pop();
                                
                    // if the callback call is asynchronous
                    if (_.type.isPromise(response)) {
                        // increase the counter
                        batch.started_callbacks++;
                        // decrease again, if the callback is completed
                        response
                            .then(() => {
                                batch.started_callbacks--;
                            });
                    }
                }
            }, 5);
        });
    }
};

module.exports = __public;