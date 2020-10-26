/**
 * @module formatting_codes
 * @desc contains formatting codes for the terminal
 *
 * @example
 * const _ = {};
 * _.format = require('/.global/formatting-codes.js');
 */

'use strict';

// define text formatting / color ANSI codes
module.exports = {
    
    // text formatting
    bold      : '\u001b[1m',
    italic    : '\u001b[3m', // not widely supported
    underline : '\u001b[4m',
    reversed  : '\u001b[7m',
    reset     : '\u001b[0m',
    
    // basic foreground colors
    black   : '\u001b[30m',
    red     : '\u001b[31m',
    green   : '\u001b[32m',
    yellow  : '\u001b[33m',
    blue    : '\u001b[34m',
    magenta : '\u001b[35m',
    cyan    : '\u001b[36m',
    white   : '\u001b[37m',
    
    // extended foreground colors 
    // (almost complete terminal support)
    brightBlack   : '\u001b[30;1m',
    brightRed     : '\u001b[31;1m',
    brightGreen   : '\u001b[32;1m',
    brightYellow  : '\u001b[33;1m',
    brightBlue    : '\u001b[34;1m',
    brightMagenta : '\u001b[35;1m',
    brightCyan    : '\u001b[36;1m',
    brightWhite   : '\u001b[37;1m',
    
    // basic background colors
    bgBlack   : '\u001b[40m',
    bgRed     : '\u001b[41m',
    bgGreen   : '\u001b[42m',
    bgYellow  : '\u001b[43m',
    bgBlue    : '\u001b[44m',
    bgMagenta : '\u001b[45m',
    bgCyan    : '\u001b[46m',
    bgWhite   : '\u001b[47m',
    
    // extended background colors
    // (almost complete terminal support)
    bgBrightBlack   : '\u001b[40;1m',
    bgBrightRed     : '\u001b[41;1m',
    bgBrightGreen   : '\u001b[42;1m',
    bgBrightYellow  : '\u001b[43;1m',
    bgBrightBlue    : '\u001b[44;1m',
    bgBrightMagenta : '\u001b[45;1m',
    bgBrightCyan    : '\u001b[46;1m',
    bgBrightWhite   : '\u001b[47;1m'
};