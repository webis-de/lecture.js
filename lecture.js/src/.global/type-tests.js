/**
 * @module type
 * @desc provides methods for validating variable types
 *
 * @example
 * const _ = {};
 * _.type = require('/.global/type-tests.js');
 */

'use strict';

/*
 * ================
 * PUBLIC FUNCTIONS
 * ================
 */

const __public = {
    
    /**
     * returns the type of a value (extended typeof method)
     *
     * @function
     * @alias module:type
     * @category public
     * 
     * @param {*} value
     * @returns {string} type of the value
     *
	 * @example
	 * of(true); // output: 'boolean'
	 * of(false); // output: 'boolean'
	 * of('true'); // output: 'string'
	 * of('false'); // output: 'string'
	 * of({}); // output: 'object'
	 * of([]); // output: 'array'
	 * of(new Function()); // output: 'function'
	 * of(new Date()); // output: 'date'
	 * of(new Promise((a, r) => {setTimeout(a, 5);})); // output: 'promise'
	 * of(1); // output: 'integer'
	 * of(-1); // output: 'integer'
	 * of(0); // output: 'integer'
	 * of(1.5); // output: 'float'
	 * of(-1.5); // output: 'float'
	 * of(undefined); // output: 'undefined'
	 * of(null); // output: 'null'
     */
    of : value => {
        
        if (__public.isArray(value)) {
            return 'array';
        }
        else if (__public.isInteger(value)) {
            return 'integer';
        }
        else if (__public.isFloat(value)) {
            return 'float';
        }
        else if (__public.isPromise(value)) {
            return 'promise';
        }
        else if (__public.isDate(value)) {
            return 'date';
        }
        else if (value === null) {
            return 'null';
        }
        
        return typeof(value);
    },
    
    /**
     * checks if a value would be equal to a `true` or `false` expression
     *
     * @function
     * @alias module:type
     * @category public
     * 
     * @param {*} value
     * @returns {boolean} true if the value equals a true boolean
     *
	 * @example
	 * isLikeBoolean(true); // output: true
	 * isLikeBoolean(false); // output: false
	 * isLikeBoolean('true'); // output: true
	 * isLikeBoolean('false'); // output: false
	 * isLikeBoolean({}); // output: true
	 * isLikeBoolean([]); // output: true
	 * isLikeBoolean(new Function()); // output: true
	 * isLikeBoolean(new Date()); // output: true
	 * isLikeBoolean(new Promise((a, r) => {setTimeout(a, 5);})); // output: true
	 * isLikeBoolean(1); // output: true
	 * isLikeBoolean(-1); // output: false
	 * isLikeBoolean(0); // output: false
	 * isLikeBoolean(1.5); // output: true
	 * isLikeBoolean(-1.5); // output: false
	 * isLikeBoolean(undefined); // output: false
	 * isLikeBoolean(null); // output: false
     */
    isLikeBoolean : value => {
        return (typeof(value) === 'string' ? value === 'true' : Boolean(value));
    },
    
    /**
     * checks if a value is a boolean
     *
     * @function
     * @alias module:type
     * @category public
     * 
     * @param {*} value
     * @returns {boolean} true if the value is a boolean
     *
	 * @example
	 * isBoolean(true); // output: true
	 * isBoolean(false); // output: true
	 * isBoolean('true'); // output: false
	 * isBoolean('false'); // output: false
	 * isBoolean({}); // output: false
	 * isBoolean([]); // output: false
	 * isBoolean(new Function()); // output: false
	 * isBoolean(new Date()); // output: false
	 * isBoolean(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
	 * isBoolean(1); // output: false
	 * isBoolean(-1); // output: false
	 * isBoolean(0); // output: false
	 * isBoolean(1.5); // output: false
	 * isBoolean(-1.5); // output: false
	 * isBoolean(undefined); // output: false
	 * isBoolean(null); // output: false
     */
    isBoolean : value => {
        return typeof(value) === 'boolean';
    },
    
    /**
     * checks if a value is a function
     *
     * @function
     * @alias module:type
     * @category public
     * 
     * @param {*} value
     * @returns {boolean} true if the value is a function
     *
	 * @example
	 * isFunction(true); // output: false
	 * isFunction(false); // output: false
	 * isFunction('true'); // output: false
	 * isFunction('false'); // output: false
	 * isFunction({}); // output: false
	 * isFunction([]); // output: false
	 * isFunction(new Function()); // output: true
	 * isFunction(new Date()); // output: false
	 * isFunction(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
	 * isFunction(1); // output: false
	 * isFunction(-1); // output: false
	 * isFunction(0); // output: false
	 * isFunction(1.5); // output: false
	 * isFunction(-1.5); // output: false
	 * isFunction(undefined); // output: false
	 * isFunction(null); // output: false
     */
    isFunction : value => {
        return typeof(value) === 'function';
    },
    
    /**
     * checks if a value is a promise
     *
     * @function
     * @alias module:type
     * @category public
     * 
     * @param {*} value
     * @returns {boolean} true if the value is a promise
	 *
     * @example
	 * isPromise(true); // output: false
	 * isPromise(false); // output: false
	 * isPromise('true'); // output: false
	 * isPromise('false'); // output: false
	 * isPromise({}); // output: false
	 * isPromise([]); // output: false
	 * isPromise(new Function()); // output: false
	 * isPromise(new Date()); // output: false
	 * isPromise(new Promise((a, r) => {setTimeout(a, 5);})); // output: true
	 * isPromise(1); // output: false
	 * isPromise(-1); // output: false
	 * isPromise(0); // output: false
	 * isPromise(1.5); // output: false
	 * isPromise(-1.5); // output: false
	 * isPromise(undefined); // output: false
	 * isPromise(null); // output: false
     */
    isPromise : value => {
        
		return value && 
			   typeof(value.then) == 'function';
    },
    
    /**
     * checks if a value is an object
     *
     * @function
     * @alias module:type
     * @category public
     * 
     * @param {*} value
     * @returns {boolean} true if the value is an object
     *
	 * @example
	 * isObject(true); // output: false
	 * isObject(false); // output: false
	 * isObject('true'); // output: false
	 * isObject('false'); // output: false
	 * isObject({}); // output: true
	 * isObject([]); // output: false
	 * isObject(new Function()); // output: false
	 * isObject(new Date()); // output: true
	 * isObject(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
	 * isObject(1); // output: false
	 * isObject(-1); // output: false
	 * isObject(0); // output: false
	 * isObject(1.5); // output: false
	 * isObject(-1.5); // output: false
	 * isObject(undefined); // output: false
	 * isObject(null); // output: false
     */
    isObject : value => {
        
		return !__public.isArray(value) &&
               typeof(value) === 'object' && 
			   value !== null;
    },
    
    /**
     * checks if a value is a date object
     *
     * @function
     * @alias module:type
     * @category public
     * 
     * @param {*} value
     * @returns {boolean} true if the value is a date
     *
	 * @example
	 * isDate(true); // output: false
	 * isDate(false); // output: false
	 * isDate('true'); // output: false
	 * isDate('false'); // output: false
	 * isDate({}); // output: false
	 * isDate([]); // output: false
	 * isDate(new Function()); // output: false
	 * isDate(new Date()); // output: true
	 * isDate(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
	 * isDate(1); // output: false
	 * isDate(-1); // output: false
	 * isDate(0); // output: false
	 * isDate(1.5); // output: false
	 * isDate(-1.5); // output: false
	 * isDate(undefined); // output: false
	 * isDate(null); // output: false
     */
    isDate : value => {
		
        return value instanceof Date && 
			   !isNaN(value);
    },

    /**
     * checks if a value is an array
     *
     * @function
     * @alias module:type
     * @category public
     * 
     * @param {*} value
     * @returns {boolean} true if the value is an array
     *
	 * @example
	 * isArray(true); // output: false
	 * isArray(false); // output: false
	 * isArray('true'); // output: false
	 * isArray('false'); // output: false
	 * isArray({}); // output: false
	 * isArray([]); // output: true
	 * isArray(new Function()); // output: false
	 * isArray(new Date()); // output: false
	 * isArray(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
	 * isArray(1); // output: false
	 * isArray(-1); // output: false
	 * isArray(0); // output: false
	 * isArray(1.5); // output: false
	 * isArray(-1.5); // output: false
	 * isArray(undefined); // output: false
	 * isArray(null); // output: false
     */
    isArray : value => {
		
        return typeof(value) !== 'undefined' && 
			   value !== null && 
			   value.constructor === Array;
    },

    /**
     * checks if a value is a string
     *
     * @function
     * @alias module:type
     * @category public
     * 
     * @param {*} value
     * @returns {boolean} true if the value is a string
	 *
     * @example
	 * isString(true); // output: false
	 * isString(false); // output: false
	 * isString('true'); // output: true
	 * isString('false'); // output: true
	 * isString({}); // output: false
	 * isString([]); // output: false
	 * isString(new Function()); // output: false
	 * isString(new Date()); // output: false
	 * isString(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
	 * isString(1); // output: false
	 * isString(-1); // output: false
	 * isString(0); // output: false
	 * isString(1.5); // output: false
	 * isString(-1.5); // output: false
	 * isString(undefined); // output: false
	 * isString(null); // output: false
     */
    isString : value => {
        return typeof(value) === 'string';
    },

    /**
     * checks if a value is a number
     *
     * @function
     * @alias module:type
     * @category public
     * 
     * @param {*} value
     * @returns {boolean} true if the value is a number
     * 
	 * @example
	 * isNumber(true); // output: false
	 * isNumber(false); // output: false
	 * isNumber('true'); // output: false
	 * isNumber('false'); // output: false
	 * isNumber({}); // output: false
	 * isNumber([]); // output: false
	 * isNumber(new Function()); // output: false
	 * isNumber(new Date()); // output: false
	 * isNumber(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
	 * isNumber(1); // output: true
	 * isNumber(-1); // output: true
	 * isNumber(0); // output: true
	 * isNumber(1.5); // output: true
	 * isNumber(-1.5); // output: true
	 * isNumber(undefined); // output: false
	 * isNumber(null); // output: false
     */
    isNumber : value => {
        return typeof(value) === 'number';
    },

    /**
     * checks if a value is an integer
     *
     * @function
     * @alias module:type
     * @category public
     * 
     * @param {*} value
     * @returns {boolean} true if the value is an integer
     *
	 * @example
	 * isInteger(true); // output: false
	 * isInteger(false); // output: false
	 * isInteger('true'); // output: false
	 * isInteger('false'); // output: false
	 * isInteger({}); // output: false
	 * isInteger([]); // output: false
	 * isInteger(new Function()); // output: false
	 * isInteger(new Date()); // output: false
	 * isInteger(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
	 * isInteger(1); // output: true
	 * isInteger(-1); // output: true
	 * isInteger(0); // output: true
	 * isInteger(1.5); // output: false
	 * isInteger(-1.5); // output: false
	 * isInteger(undefined); // output: false
	 * isInteger(null); // output: false
     */
    isInteger : value => {
		
        return typeof(value) === 'number' && 
			   value % 1 === 0;
    },

    /**
     * checks if a value is a floating point value
     *
     * @function
     * @alias module:type
     * @category public
     * 
     * @param {*} value
     * @returns {boolean} true if the value is a floating point value
     *
	 * @example
	 * isInteger(true); // output: false
	 * isInteger(false); // output: false
	 * isInteger('true'); // output: false
	 * isInteger('false'); // output: false
	 * isInteger({}); // output: false
	 * isInteger([]); // output: false
	 * isInteger(new Function()); // output: false
	 * isInteger(new Date()); // output: false
	 * isInteger(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
	 * isInteger(1); // output: false
	 * isInteger(-1); // output: false
	 * isInteger(0); // output: false
	 * isInteger(1.5); // output: true
	 * isInteger(-1.5); // output: true
	 * isInteger(undefined); // output: false
	 * isInteger(null); // output: false
     */
    isFloat : value => {
		
        return typeof(value) === 'number' && 
			   value % 1 !== 0;
    }
};

module.exports = __public;