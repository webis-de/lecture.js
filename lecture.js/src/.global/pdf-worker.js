/**
 * @module pdf_worker
 * @desc extracts information and image frames from PDF files
 *
 * @example
 * const _ = {};
 * _.pdf_worker = require('/.global/pdf-worker.js');
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
_.basic  = require('./basic-utilities.js');
_.type   = require('./type-tests.js');
_.logger = require('./logger.js');

// include a specific pdf.js build as require('pdfjs-dist') fails
//      https://github.com/mozilla/pdf.js/issues/11762
_.pdfjs = require('pdfjs-dist/es5/build/pdf.js');

// simulates a HTML canvas in node
// is needed because pdf.js needs a canvas context to output an image
_.canvas = require('canvas');



/*
 * =========
 * CONSTANTS
 * =========
 */

// directory with PDF CMAPS
const CMAP_URL = _.path.join('..', 'node_modules', 'pdfjs-dist', 'cmaps');



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

// holds cached PDF files
const files = {};



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

// simulate a NodeCanvas factory to prevent pipeline from crashing at certain PDF pages
function CanvasFactory() {}
CanvasFactory.prototype = {
    
    // creates a new canvas
    create: (width, height) => {
        
        if (width < 1 || height < 1) {
            _.logger.error(`Canvas must be at least 1 pixel high and wide, but got sizes "${width}x${height}".`);
            return;
        }
        
        let canvas = _.canvas.createCanvas(width, height);
        
        return {
            canvas : canvas,
            context : canvas.getContext('2d')
        };
    },

    // resets the given canvas to the given size
    reset: (canvas_and_context, width, height) => {
        
        if (!_.type.isObject(canvas_and_context)) {
            _.logger.error(`Expected the CanvasFactory object, but got ${_.type.of(canvas_and_context)} "${canvas_and_context}"`);
            return;
        }
        
        if (!canvas_and_context.canvas) {
            _.logger.error(`Expected the CanvasFactory object to have a 'canvas' property, but got "${canvas_and_context.canvas}"`);
            return;
        }
        
        if (width < 1 || height < 1) {
            _.logger.error(`Canvas must be at least 1 pixel high and wide, but got sizes "${width}x${height}".`);
            return;
        }
        
        canvas_and_context.canvas.width = width;
        canvas_and_context.canvas.height = height;
        
    },

    // destroys the canvas object
    destroy: canvas_and_context => {
        
        if (!_.type.isObject(canvas_and_context)) {
            _.logger.error(`Expected the CanvasFactory object, but got ${_.type.of(canvas_and_context)} "${canvas_and_context}"`);
            return;
        }
        
        if (!canvas_and_context.canvas) {
            _.logger.error(`Expected the CanvasFactory object to have a 'canvas' property, but got "${canvas_and_context.canvas}"`);
            return;
        }

        // reset these values to make PDF.js free up resources
        canvas_and_context.canvas.width = 0;
        canvas_and_context.canvas.height = 0;
        canvas_and_context.canvas = null;
        canvas_and_context.context = null;
    }
};

/**
 * reads a PDF file either from disk or from cache (if already read once)
 *
 * @function
 * @alias module:pdf_worker
 * @category private
 * 
 * @param {string} path - absolute path to a PDF file
 * @returns {string} PDF contents
 */
const read = path => {
    
    // check if the file is a valid PDF
    if (!__public.exists(path)) {
        _.logger.error(`Requested file "${path}" is not a valid PDF`);
        return;
    }
    
    let data = '';
    
    // check if the PDF was already cached
    if (files[path] !== undefined) {
        // load it from cache
        data = files[path];
    }
    // otherwise read the file from disk, then cache it
    else {
        data = _.fs.readFileSync(path);
        files[path] = data;
    }
    
    return data;
};

/**
 * creates a PDF.js object of a given PDF file
 *
 * @async
 * @function
 * @alias module:pdf_worker
 * @category private
 * 
 * @param {string} path - absolute path to a PDF file
 * @returns {Promise.<Object>} PDF.js object
 */
const createObject = async(path) => {

    if (!(await __public.isValidFile(path))) {
        _.logger.error(`Expected a file path to valid PDF, but got ${_.type.of(path)} "${path}"`);
        return;
    }

    // ------------

    // read the PDF
    let data = read(path);

    return _.pdfjs.getDocument({
            data : data,
            // https://github.com/mozilla/pdf.js/issues/8489
            disableFontFace : true,
            nativeImageDecoderSupport : 'none',
            // https://github.com/mozilla/pdf.js/blob/4a7e29865da590a33894d6ec39d0a070cfca1643/examples/node/pdf2png/pdf2png.js#L53
            cMapUrl : CMAP_URL,
            cMapPacked : true
        })
        .promise;
};

/**
 * converts the viewport of a PDF page to the given dimensions (as the aspect ratio is "fit" to the dimensions, the viewport does not distort and remains in the same aspect ratio as the original page object)
 *
 * @function
 * @alias module:pdf_worker
 * @category private
 * 
 * @param {Object} page_object - PDF.js page object
 * @param {integer} desired_width - desired width of the output (viewport may be smaller, if the aspect ratio differs)
 * @param {integer} desired_height - desired height of the output (viewport may be smaller, if the aspect ratio differs)
 * @returns {Object} PDF.js viewport object
 */
const convertPageViewport = (page_object, desired_width, desired_height) => {

    if (!_.type.isObject(page_object)) {
        _.logger.error(`Expected a PDF.js page object, but got ${_.type.of(page_object)} "${page_object}"`);
        return;
    }

    if (!_.type.isInteger(desired_width)) {
        _.logger.error(`Expected a desired width as an integer, but got ${_.type.of(desired_width)} "${desired_width}"`);
        return;
    }

    if (!_.type.isInteger(desired_height)) {
        _.logger.error(`Expected a desired height as an integer, but got ${_.type.of(desired_height)} "${desired_height}"`);
        return;
    }

    // ------------

    // get current dimensions from PDF page
    let viewport = page_object.getViewport({
        scale : 1
    });

    // first fit viewport relative to height 
    // to the dimensions of the output viewport
    let width = desired_height * viewport.width / viewport.height;
    let height = desired_height;

    // calculate by how much to scale the orginial viewport
    // to reach the dimensions of the resolution viewport
    let new_scale = height / viewport.height;

    // test if width goes out out of resolution viewport
    if (width > desired_width) {

        // if so, fit viewport relative to width
        // to the dimensions of the output viewport
        width = desired_width;
        height = desired_width * viewport.height / viewport.width;
        new_scale = width / viewport.width;
    }

    // scale the PDF page's viewport to fit contained into the output width and height
    return page_object.getViewport({
        scale : new_scale
    });
};



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
     * checks if a PDF file at the given path exists
     *
     * @function
     * @alias module:pdf_worker
     * @category public
     * 
     * @param {string} path - absolute path to a PDF file
     * @returns {boolean} true if the path points to a PDF file
     */
    exists : path => {
        
        return _.type.isString(path) && 
               _.path.extname(path) === '.pdf' &&
               _.fs.existsSync(path);
    },
    
    /**
     * checks if a PDF file exists at a given path and can be read
     *
     * @async
     * @function
     * @alias module:pdf_worker
     * @category public
     * 
     * @param {string} path - absolute path to a PDF file
     * @returns {Promise.<boolean>} true if it's a valid PDF file
     */
    isValidFile : async(path) => {
        
        if (!__public.exists(path)) {
            return false;
        }
        
        // ------------
        
        // load the PDF (possibly from cache, if it had been loaded before)
        let data = read(path);
        
        // cancel if file is invalid
        if (!data) return;
        
        return new Promise((resolve, reject) => {
                try {
                    // parse it for the page number
                    _.pdfjs
                        .getDocument({
                            data : data
                        })
                        .promise
                        .then(() => {
                            resolve(true);
                        });
                }
                catch (err) {
                    _.logger.error(`Could not parse PDF file "${path}", because: ${err}`);
                    resolve(false);
                }
            });
    },
    
    
    
    /*
     * UTILITY
     */
    
    /**
     * loads a PDF file and counts its pages
     *
     * @async
     * @function
     * @alias module:pdf_worker
     * @category public
     * 
     * @param {string} path - absolute path to a file
     * @returns {Promise.<integer>} number of pages
     */
    countPages : async(path) => {
        
        if (!(await __public.isValidFile(path))) {
            _.logger.error(`Expected a file path to valid PDF, but got ${_.type.of(path)} "${path}"`);
            return 0;
        }
        
        // ------------
        
        return new Promise((resolve, reject) => {
            
                try {
                    
                    createObject(path)
                        .then(doc => {
                            resolve(doc._pdfInfo.numPages);
                        });
                }
                catch (err) {
                    _.logger.error(`Failed counting the pages of PDF "${path}" because: ${err}`);
                    resolve(0);
                }
            });
    },
    
    /**
     * generates an image file from a PDF page
     *
     * @async
     * @function
     * @alias module:pdf_worker
     * @category public
     * 
     * @param {Object} options - set of options
     * @param {string} options.input_path - path to an existing PDF file
     * @param {string} options.output_path - path to the output file
     * @param {integer} options.page - number of the page to extract
     * @param {integer} options.width - width to which to scale the output image
     * @param {integer} options.height - height to which to scale the output image
     * @returns {Promise.<boolean>} true on success
     *
     * @example
     * await renderPage({
     *     input_path : 'here/file.pdf',
     *     output_path : 'there/output.png',
     *     page : 2,
     *     width : 1280,
     *     height : 720
     * });
     */
    renderPage : async(options) => {
        
        if (!_.basic.isFile(options.input_path, '.pdf')) {
            _.logger.error(`Expected options.input_path as a path to an existing PDF file, but got ${_.type.of(options.input_path)} "${options.input_path}"`);
            return;
        }
        
        if (!(await __public.isValidFile(options.input_path,))) {
            _.logger.error(`Expected a valid PDF, but the input PDF is invalid: "${options.input_path}"`);
            return;
        }
        
        if (
            !_.type.isString(options.output_path) ||
            _.path.extname(options.output_path) !== '.png'
        ) {
            _.logger.error(`Expected options.output_path as a path to a PDF file, but got ${_.type.of(options.output_path)} "${options.output_path}"`);
            return;
        }
        
        if (!_.type.isInteger(options.page) || options.page <= 0) {
            _.logger.error(`Expected options.page as an integer above 0, but got ${_.type.of(options.page)} "${options.page}"`);
            return;
        }
        
        if (!_.type.isInteger(options.width) || options.width <= 0) {
            _.logger.error(`Expected options.width as an integer above 0, but got ${_.type.of(options.width)} "${options.width}"`);
            return;
        }
        
        if (!_.type.isInteger(options.height) || options.height <= 0) {
            _.logger.error(`Expected options.height as an integer above 0, but got ${_.type.of(options.height)} "${options.height}"`);
            return;
        }
        
        // ------------
        
        // generate an image of the PDF page using Mozilla's pdf.js
        return await new Promise(async(resolve, reject) => {
            
            let pdf = await createObject(options.input_path);
            let page = await pdf.getPage(options.page);
                        
            // fit the page viewport to the output width and height
            // so that the complete page is contained within, but not stretched
            let viewport = convertPageViewport(page, options.width, options.height);

            // convert any floating values to integers
            viewport.width = parseInt(viewport.width);
            viewport.height = parseInt(viewport.height);
            // fix values below 1 pixel
            viewport.width = viewport.width < 1 ? 1 : viewport.width;
            viewport.height = viewport.height < 1 ? 1 : viewport.height;
            
            // simulate a HTML canvas with the given viewport
            let factory = new CanvasFactory();
            let canvas_and_context = factory.create(
                viewport.width,
                viewport.height
            );

            page.render({
                    canvasContext : canvas_and_context.context,
                    viewport      : viewport,
                    canvasFactory : factory,
                })
                .promise
                .then(() => {
                    // convert the canvas to an image buffer
                    let image = canvas_and_context.canvas.toBuffer();

                    // write the image buffer to file
                    _.fs.writeFile(options.output_path, image, error => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(true);
                    });
                })
                .catch(err => {
                    reject(err);
                });
        })
        .catch(err => {
            _.logger.error(`Failed to create an image of page ${page} of PDF "${options.input_path}", because: ${err}`);
            return false;
        });
    }
};

module.exports = __public;