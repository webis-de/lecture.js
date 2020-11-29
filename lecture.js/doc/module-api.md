[lecture.js](../README.md) > [Documentation](README.md) > **Module API**

---

This section documents the modules of lecture.js and their private and public functions.

# Documentation

This API documentation of the modules is automatically generated from *JSDoc* comments inside the source code. To update this documentation, install the npm module [jsdoc-to-markdown](https://www.npmjs.com/package/jsdoc-to-markdown). Then just simply run the `generate.bat` or `generate.js` file in this directory. This will update and overwrite this documentation file.

# Module Usage

The `/lecture.js/src/pipeline/` module is the pipeline that calls all the other modules located in `/lecture.js/src/` to generate a lecture.

Each module provides a set of public functions that can be included and used separately from all other modules (excluding the *pipeline*, *parser*, and *preprocessor* modules, which require other lecture.js modules to work). To use a module by itself, the following files and directories must also be present, as they are dependencies to most of the modules:
- `/lecture.js/src/.global/`
- `/lecture.js/src/node_modules/`
- `/lecture.js/src/package.json`
- `/lecture.js/src/package-lock.json`

If you want to use a module by itself, for example, the *text-to-speech* module, you only need to require the `main.js` script inside the module directory, e.g.:
```javascript
const tts = require('./src/text-to-speech/main.js');
```
The other scripts in the module directory are already required by the main script and contain "private", non-relevant functions that should not be exposed outside the module.

# Modules

<table>
  <thead>
    <tr>
      <th>Module</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#module_basic_utilities">basic_utilities</a></td>
    <td><p>provides basic utility functions</p>
</td>
    </tr>
<tr>
    <td><a href="#module_environment">environment</a></td>
    <td><p>checks if certain programs are available in the user&#39;s environment</p>
</td>
    </tr>
<tr>
    <td><a href="#module_ffmpeg_worker">ffmpeg_worker</a></td>
    <td><p>provides methods to communicate with the FFmpeg and FFprobe libraries</p>
</td>
    </tr>
<tr>
    <td><a href="#module_formatting_codes">formatting_codes</a></td>
    <td><p>contains formatting codes for the terminal</p>
</td>
    </tr>
<tr>
    <td><a href="#module_logger">logger</a></td>
    <td><p>provides methods for logging to the terminal or a file</p>
</td>
    </tr>
<tr>
    <td><a href="#module_pdf_worker">pdf_worker</a></td>
    <td><p>extracts information and image frames from PDF files</p>
</td>
    </tr>
<tr>
    <td><a href="#module_requests">requests</a></td>
    <td><p>runs batches of requests asynchronously with specific limits</p>
</td>
    </tr>
<tr>
    <td><a href="#module_timestamp">timestamp</a></td>
    <td><p>provides functions for parsing, converting, and validating different timestamp formats</p>
</td>
    </tr>
<tr>
    <td><a href="#module_type">type</a></td>
    <td><p>provides methods for validating variable types</p>
</td>
    </tr>
<tr>
    <td><a href="#module_xml_converter">xml_converter</a></td>
    <td><p>works with XML and can convert it to a JSON representation and vice versa</p>
</td>
    </tr>
<tr>
    <td><a href="#module_parser">parser</a></td>
    <td><p>parses the lecture.js XML input</p>
</td>
    </tr>
<tr>
    <td><a href="#module_parser/meta-parser">parser/meta-parser</a></td>
    <td><p>gets meta information from given XML</p>
</td>
    </tr>
<tr>
    <td><a href="#module_parser/section-creator">parser/section-creator</a></td>
    <td><p>splits the LSML content into sections that can be sent to the Text-to-speech APIs</p>
</td>
    </tr>
<tr>
    <td><a href="#module_pipeline/cli-worker">pipeline/cli-worker</a></td>
    <td><p>parses command line arguments and manages certain terminal-printing options</p>
</td>
    </tr>
<tr>
    <td><a href="#module_pipeline/configure">pipeline/configure</a></td>
    <td><p>parses the configuration file and applies settings</p>
</td>
    </tr>
<tr>
    <td><a href="#module_pipeline">pipeline</a></td>
    <td><p>accesses all modules to generate a video lecture from input files</p>
</td>
    </tr>
<tr>
    <td><a href="#module_parser/preprocessor">parser/preprocessor</a></td>
    <td><p>transforms XML content and applies certain changes</p>
</td>
    </tr>
<tr>
    <td><a href="#module_text_to_speech/cache">text_to_speech/cache</a></td>
    <td><p>caches generated audio files</p>
</td>
    </tr>
<tr>
    <td><a href="#module_text_to_speech">text_to_speech</a></td>
    <td><p>communicates with speech synthesis APIs</p>
</td>
    </tr>
<tr>
    <td><a href="#module_uploader">uploader</a></td>
    <td><p>connects to the YouTube Data API and uploads videos</p>
</td>
    </tr>
<tr>
    <td><a href="#module_validator">validator</a></td>
    <td><p>validates the LSML input using a XSD schema</p>
</td>
    </tr>
<tr>
    <td><a href="#module_validator/tests">validator/tests</a></td>
    <td><p>testing suite for the validator</p>
</td>
    </tr>
<tr>
    <td><a href="#module_video_manager">video_manager</a></td>
    <td><p>manages acceptable parameters for video file generation</p>
</td>
    </tr>
</tbody>
</table>

# Functions

<table>
  <thead>
    <tr>
      <th>Global</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#exp_module_text_to_speech/cache--generateAudioId">generateAudioId(options)</a> ⇒ <code>Promise.&lt;string&gt;</code> </td>
    <td><p>generates a unique ID for an audio file depending on the provided options</p>
</td>
    </tr>
</tbody>
</table>

<a name="module_basic_utilities"></a>

# basic\_utilities
provides basic utility functions

**Example**  
```js
const _ = {};
_.basic = require('/.global/basic-utilities.js');
```

* [basic_utilities](#module_basic_utilities)
    * [getOS()](#exp_module_basic_utilities--getOS) ⇒ <code>string</code> 
    * [isWindows()](#exp_module_basic_utilities--isWindows) ⇒ <code>string</code> 
    * [isLinux()](#exp_module_basic_utilities--isLinux) ⇒ <code>string</code> 
    * [isRelativePath(path)](#exp_module_basic_utilities--isRelativePath) ⇒ <code>boolean</code> 
    * [isAbsolutePath(path)](#exp_module_basic_utilities--isAbsolutePath) ⇒ <code>boolean</code> 
    * [normalizePath(path, relative_to_path)](#exp_module_basic_utilities--normalizePath) ⇒ <code>string</code> 
    * [isDirectory(path)](#exp_module_basic_utilities--isDirectory) ⇒ <code>boolean</code> 
    * [isFile(path, [extension])](#exp_module_basic_utilities--isFile) ⇒ <code>boolean</code> 
    * [getFileSize(path)](#exp_module_basic_utilities--getFileSize) ⇒ <code>integer</code> 
    * [createDirectory(path)](#exp_module_basic_utilities--createDirectory) ⇒ <code>boolean</code> 
    * [deleteDirectory(path)](#exp_module_basic_utilities--deleteDirectory) 
    * [clearDirectory(path, options)](#exp_module_basic_utilities--clearDirectory) 
    * [replaceFileExtension(path, extension)](#exp_module_basic_utilities--replaceFileExtension) ⇒ <code>string</code> 
    * [appendToFilename(path, append)](#exp_module_basic_utilities--appendToFilename) ⇒ <code>string</code> 
    * [deepCopy(obj)](#exp_module_basic_utilities--deepCopy) ⇒ <code>Object</code> \| <code>Array</code> 
    * [isEqual(val1, val2)](#exp_module_basic_utilities--isEqual) ⇒ <code>boolean</code> 
    * [hasKeyValuePair(obj, find_key, find_value)](#exp_module_basic_utilities--hasKeyValuePair) ⇒ <code>boolean</code> 
    * [getLength(obj)](#exp_module_basic_utilities--getLength) ⇒ <code>integer</code> 
    * [inArray(arr, val)](#exp_module_basic_utilities--inArray) ⇒ <code>boolean</code> 
    * [insertArray(arr, index, items)](#exp_module_basic_utilities--insertArray) ⇒ <code>Array</code> 
    * [removeArrayIndex(arr, index)](#exp_module_basic_utilities--removeArrayIndex) ⇒ <code>Array</code> 
    * [forEachAsync(arr, func)](#exp_module_basic_utilities--forEachAsync) ⇒ <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code> 
    * [getStringSimilarity(s1, s2)](#exp_module_basic_utilities--getStringSimilarity) ⇒ <code>number</code> 
    * [removeSpacesAfterNewlines(str)](#exp_module_basic_utilities--removeSpacesAfterNewlines) ⇒ <code>string</code> 
    * [getLines(str)](#exp_module_basic_utilities--getLines) ⇒ <code>Array.&lt;String&gt;</code> 
    * [countLines(str)](#exp_module_basic_utilities--countLines) ⇒ <code>integer</code> 
    * [encodeBase64(str)](#exp_module_basic_utilities--encodeBase64) ⇒ <code>string</code> 
    * [decodeBase64(str)](#exp_module_basic_utilities--decodeBase64) ⇒ <code>string</code> 
    * [escapeRegex(str)](#exp_module_basic_utilities--escapeRegex) ⇒ <code>string</code> 
    * [stringifyFullDate(date)](#exp_module_basic_utilities--stringifyFullDate) ⇒ <code>string</code> 
    * [getUUIDv4()](#exp_module_basic_utilities--getUUIDv4) ⇒ <code>string</code> 
    * [getRandomFloat(min, max)](#exp_module_basic_utilities--getRandomFloat) ⇒ <code>number</code> 
    * [getRandomInt(min, max)](#exp_module_basic_utilities--getRandomInt) ⇒ <code>integer</code> 
    * [transformRange(val, original, new_range)](#exp_module_basic_utilities--transformRange) ⇒ <code>float</code> 


* * *

<a name="exp_module_basic_utilities--getOS"></a>

## getOS() ⇒ <code>string</code> 
returns the type of operating system Node.js is running on

**Kind**: Exported function  
**Returns**: <code>string</code> - operating system  
**Category**: public  

* * *

<a name="exp_module_basic_utilities--isWindows"></a>

## isWindows() ⇒ <code>string</code> 
checks if Node.js is currently running on Windows

**Kind**: Exported function  
**Returns**: <code>string</code> - true, if the OS is Windows  
**Category**: public  

* * *

<a name="exp_module_basic_utilities--isLinux"></a>

## isLinux() ⇒ <code>string</code> 
checks if Node.js is currently running on Linux

**Kind**: Exported function  
**Returns**: <code>string</code> - true, if the OS is Linux  
**Category**: public  

* * *

<a name="exp_module_basic_utilities--isRelativePath"></a>

## isRelativePath(path) ⇒ <code>boolean</code> 
checks if the given path is a relative path

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the path is relative  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | path to a file or a directory |


* * *

<a name="exp_module_basic_utilities--isAbsolutePath"></a>

## isAbsolutePath(path) ⇒ <code>boolean</code> 
checks if the given path is an absolute path

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the path is absolute  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | path to a file or a directory |


* * *

<a name="exp_module_basic_utilities--normalizePath"></a>

## normalizePath(path, relative_to_path) ⇒ <code>string</code> 
normalizes a file path and transforms it to an absolute path if it's relative

**Kind**: Exported function  
**Returns**: <code>string</code> - path  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | any file or directory path |
| relative_to_path | <code>string</code> | if the "path" is relative, it should be relative to "relative_to_path" |


* * *

<a name="exp_module_basic_utilities--isDirectory"></a>

## isDirectory(path) ⇒ <code>boolean</code> 
checks if a path points to an existing directory

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the path points to a directory  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>\*</code> | absolute path to a file or a directory |


* * *

<a name="exp_module_basic_utilities--isFile"></a>

## isFile(path, [extension]) ⇒ <code>boolean</code> 
checks if a path points to an existing file

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the path points to a file  
**Category**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| path | <code>\*</code> |  | absolute path to a file or a directory |
| [extension] | <code>string</code> | <code>null</code> | file can be optionally checked for this file extension, e.g. '.xml' |


* * *

<a name="exp_module_basic_utilities--getFileSize"></a>

## getFileSize(path) ⇒ <code>integer</code> 
returns the size of a file in bytes

**Kind**: Exported function  
**Returns**: <code>integer</code> - size of the file in bytes  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to a file |


* * *

<a name="exp_module_basic_utilities--createDirectory"></a>

## createDirectory(path) ⇒ <code>boolean</code> 
creates a directory at the given path

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if a new directory was created (false if a directory already exists at the path)  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to a non-existing directory |


* * *

<a name="exp_module_basic_utilities--deleteDirectory"></a>

## deleteDirectory(path) 
deletes the directory at the given path

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to an existing or non-existing directory |


* * *

<a name="exp_module_basic_utilities--clearDirectory"></a>

## clearDirectory(path, options) 
deletes the contents of the directory at the given path

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to an existing or non-existing directory |
| options | <code>Object</code> |  |
| [options.ignore_dirs] | <code>Array.&lt;string&gt;</code> | base names of child directories that should not be deleted |
| [options.ignore_files] | <code>Array.&lt;string&gt;</code> | base names of child files that should not be deleted |


* * *

<a name="exp_module_basic_utilities--replaceFileExtension"></a>

## replaceFileExtension(path, extension) ⇒ <code>string</code> 
replaces the file extension of a path

**Kind**: Exported function  
**Returns**: <code>string</code> - file path with replaced file extension  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute or relative file path |
| extension | <code>string</code> | file extension; must be without a dot, e.g., "txt" instead of ".txt") |

**Example**  
```js
replaceFileExtension('here/is/a/log.txt', 'log');
// output: 'here/is/a/log.log'
```

* * *

<a name="exp_module_basic_utilities--appendToFilename"></a>

## appendToFilename(path, append) ⇒ <code>string</code> 
appends a string to the file name of a file path

**Kind**: Exported function  
**Returns**: <code>string</code> - new path  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute or relative file path |
| append | <code>string</code> | text that will be appended to the file name |

**Example**  
```js
appendToFilename('here/is/a/log.txt', '_123');
// output: 'here/is/a/log_123.txt'
```

* * *

<a name="exp_module_basic_utilities--deepCopy"></a>

## deepCopy(obj) ⇒ <code>Object</code> \| <code>Array</code> 
makes a deep copy of an object or an array

**Kind**: Exported function  
**Returns**: <code>Object</code> \| <code>Array</code> - deep copy  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> \| <code>Array</code> | an object or array to make a deep copy of |


* * *

<a name="exp_module_basic_utilities--isEqual"></a>

## isEqual(val1, val2) ⇒ <code>boolean</code> 
compares two values (or objects) deeply
 supported types: integer, string, boolean, null, undefined, array, object(, floats somewhat)

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true, if the values match  
**Category**: public  

| Param | Type |
| --- | --- |
| val1 | <code>\*</code> | 
| val2 | <code>\*</code> | 


* * *

<a name="exp_module_basic_utilities--hasKeyValuePair"></a>

## hasKeyValuePair(obj, find_key, find_value) ⇒ <code>boolean</code> 
checks if a given key-value pair exists in a nested object

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if a key-value pair was found  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | nested object |
| find_key | <code>string</code> |  |
| find_value | <code>\*</code> |  |

**Example**  
```js
let obj = {
     a : 1,
     b : 2,
     c : [{
         d : 4
     }],
     e : {
         f : 5
     }
};
hasKeyValuePair(obj, 'b', 2); // output: true
hasKeyValuePair(obj, 'c', 3); // output: false
hasKeyValuePair(obj, 'd', 4); // output: true
hasKeyValuePair(obj, 'f', 5); // output: true
hasKeyValuePair(obj, 'g', 6); // output: false
```

* * *

<a name="exp_module_basic_utilities--getLength"></a>

## getLength(obj) ⇒ <code>integer</code> 
counts the number of keys in an object or the amount of indexes in an array

**Kind**: Exported function  
**Returns**: <code>integer</code> - size  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> \| <code>Array.&lt;\*&gt;</code> | object or array |

**Example**  
```js
let obj = {
     a:1,
     b:2
};
getLength(obj); // output: 2
let obj2 = [1,'a',2];
getLength(obj2); // output: 3
```

* * *

<a name="exp_module_basic_utilities--inArray"></a>

## inArray(arr, val) ⇒ <code>boolean</code> 
checks if a value is inside an array

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the array is contained within the array  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array</code> | array to check |
| val | <code>\*</code> | value to search for in the array |

**Example**  
```js
let arr = [1,2,3];
inArray(arr, 2); // output: true
inArray(arr, 4); // output: false
```

* * *

<a name="exp_module_basic_utilities--insertArray"></a>

## insertArray(arr, index, items) ⇒ <code>Array</code> 
inserts multiple items at a given index into an array

**Kind**: Exported function  
**Returns**: <code>Array</code> - new array including the inserted items  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array</code> | array to insert the items into |
| index | <code>integer</code> | index at which to insert |
| items | <code>Array</code> | array of one or more items to insert into the main array |

**Example**  
```js
let arr = [1,2,5,6];
let items = [3,4];
insertArray(arr, 2, items); 
// output: [1,2,3,4,5,6]
```

* * *

<a name="exp_module_basic_utilities--removeArrayIndex"></a>

## removeArrayIndex(arr, index) ⇒ <code>Array</code> 
removes an entry from an array and shifts later entries to fill the empty index

**Kind**: Exported function  
**Returns**: <code>Array</code> - new array without the removed index  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array</code> | array to insert the items into |
| index | <code>integer</code> | index of the entry which is to be removed |

**Example**  
```js
let arr = [1,2,3,4];
removeArrayIndex(arr, 2); 
// output: [1,2,4]
```

* * *

<a name="exp_module_basic_utilities--forEachAsync"></a>

## forEachAsync(arr, func) ⇒ <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code> 
simulates a forEach loop asynchronously (but the requests are still in synchronous orders)

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code> - new array without the removed index  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array</code> | array to insert the items into |
| func | <code>function</code> | function to be run |

**Example**  
```js
await forEachAsync([1,2,3], async(nr) => {
     return new Promise((resolve, reject) => {
         let random_time = Math.floor(Math.random() * 100);
         setTimeout(() => {
             console.log(nr);
             resolve();
         }, random_time);
     });
});
// output:
// 1
// 2
// 3
```

* * *

<a name="exp_module_basic_utilities--getStringSimilarity"></a>

## getStringSimilarity(s1, s2) ⇒ <code>number</code> 
checks how similar two strings are

**Kind**: Exported function  
**Returns**: <code>number</code> - float between 0 and 1, where 1 is most similar  
**Category**: public  

| Param | Type |
| --- | --- |
| s1 | <code>string</code> | 
| s2 | <code>string</code> | 

**Example**  
```js
getStringSimilarity('hallo', 'hllo'); // output: 0.8
```

* * *

<a name="exp_module_basic_utilities--removeSpacesAfterNewlines"></a>

## removeSpacesAfterNewlines(str) ⇒ <code>string</code> 
removes the spaces and tab characters after newlines

**Kind**: Exported function  
**Returns**: <code>string</code> - output text  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | input text |

**Example**  
```js
let str = `
   hello
`;
removeSpacesAfterNewlines(str);
// output: '\nhello\n'
```

* * *

<a name="exp_module_basic_utilities--getLines"></a>

## getLines(str) ⇒ <code>Array.&lt;String&gt;</code> 
returns a string split into lines

**Kind**: Exported function  
**Returns**: <code>Array.&lt;String&gt;</code> - array of strings  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | input text |

**Example**  
```js
let str = `
  hello
`;
getLines(str);
// output: ['','  hello','']
```

* * *

<a name="exp_module_basic_utilities--countLines"></a>

## countLines(str) ⇒ <code>integer</code> 
counts the number of lines a string has

**Kind**: Exported function  
**Returns**: <code>integer</code> - number of lines  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | input text |

**Example**  
```js
let str = `
  hello
`;
countLines(str);
// output: 3
```

* * *

<a name="exp_module_basic_utilities--encodeBase64"></a>

## encodeBase64(str) ⇒ <code>string</code> 
encodes a string using Base64

**Kind**: Exported function  
**Returns**: <code>string</code> - Base64-encoded string  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | input text |

**Example**  
```js
encodeBase64('hallo 123 -.;');
// output: 'aGFsbG8gMTIzIC0uOw=='
```

* * *

<a name="exp_module_basic_utilities--decodeBase64"></a>

## decodeBase64(str) ⇒ <code>string</code> 
decodes a Base64 string

**Kind**: Exported function  
**Returns**: <code>string</code> - decoded text  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | Base64-encoded text |

**Example**  
```js
decodeBase64('aGFsbG8gMTIzIC0uOw==');
// output: 'hallo 123 -.;'
```

* * *

<a name="exp_module_basic_utilities--escapeRegex"></a>

## escapeRegex(str) ⇒ <code>string</code> 
escapes a string to be usable in a regular expression

**Kind**: Exported function  
**Returns**: <code>string</code> - escaped text  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | input text |

**Example**  
```js
escapeRegex('Match [this text].');
// output: 'Match \[this text\]\.'
```

* * *

<a name="exp_module_basic_utilities--stringifyFullDate"></a>

## stringifyFullDate(date) ⇒ <code>string</code> 
formats a Date object to a string in the format of `yyyy/mm/dd hh:mm:ss.SSS`

**Kind**: Exported function  
**Returns**: <code>string</code> - formatted date string  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| date | <code>Object</code> | date object |

**Example**  
```js
stringifyFullDate(new Date());
// output: '2020/07/16 15:59:12.306'
```

* * *

<a name="exp_module_basic_utilities--getUUIDv4"></a>

## getUUIDv4() ⇒ <code>string</code> 
generates an universally unique identifier, version 4

**Kind**: Exported function  
**Returns**: <code>string</code> - UUID v4  
**Category**: public  
**Example**  
```js
getUUIDv4();
// output: 'd9171d3c-bbd5-4ea6-a676-8c3ed01a9dea'
```

* * *

<a name="exp_module_basic_utilities--getRandomFloat"></a>

## getRandomFloat(min, max) ⇒ <code>number</code> 
generates a random float between min and max (min included)

**Kind**: Exported function  
**Returns**: <code>number</code> - floating point value inbetween min and max  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| min | <code>number</code> | smallest possible value |
| max | <code>number</code> | greatest possible value |

**Example**  
```js
getRandomFloat(5, 100);
// output: 95.9096168949175
getRandomFloat(1, 2);
// output: 1.854652212731835
getRandomFloat(5.2, 5.3);
// output: 5.287019333987489
```

* * *

<a name="exp_module_basic_utilities--getRandomInt"></a>

## getRandomInt(min, max) ⇒ <code>integer</code> 
generates a random integer between min and max (min and max included)

**Kind**: Exported function  
**Returns**: <code>integer</code> - integer inbetween min and max  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| min | <code>integer</code> | smallest possible value |
| max | <code>integer</code> | greatest possible value |

**Example**  
```js
getRandomInt(5, 100);
// output: 32
getRandomInt(1, 2);
// output: 2
getRandomInt(5, 6);
// output: 5
```

* * *

<a name="exp_module_basic_utilities--transformRange"></a>

## transformRange(val, original, new_range) ⇒ <code>float</code> 
transforms a value from one number range to another number range

**Kind**: Exported function  
**Returns**: <code>float</code> - transformed value  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>number</code> | value to transform |
| original | <code>Object</code> | original range in which the value fits |
| original.min | <code>number</code> | lower end of the range |
| original.max | <code>number</code> | upper end of the range |
| new_range | <code>Object</code> |  |
| new_range.min | <code>number</code> | lower end of the range |
| new_range.max | <code>number</code> | upper end of the range |

**Example**  
```js
transformRange(2, {min:1,max:2}, {min:1,max:6}); // output: 6
transformRange(2, {min:1,max:3}, {min:1,max:6}); // output: 3.5
transformRange(3, {min:0,max:6}, {min:0,max:12}); // output: 6
```

* * *

<a name="module_environment"></a>

# environment
checks if certain programs are available in the user's environment

**Example**  
```js
const _ = {};
_.environment = require('/.global/environment.js');
```

* [environment](#module_environment)
    * [javaIsInstalled()](#exp_module_environment--javaIsInstalled) ⇒ <code>Promise.&lt;boolean&gt;</code> 
    * [getJavaVersion()](#exp_module_environment--getJavaVersion) ⇒ <code>Promise.&lt;string&gt;</code> 


* * *

<a name="exp_module_environment--javaIsInstalled"></a>

## javaIsInstalled() ⇒ <code>Promise.&lt;boolean&gt;</code> 
checks if Java is installed on the machine

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true, if Java is installed  
**Category**: public  

* * *

<a name="exp_module_environment--getJavaVersion"></a>

## getJavaVersion() ⇒ <code>Promise.&lt;string&gt;</code> 
returns the version of Java currently installed on the system

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;string&gt;</code> - Java version  
**Category**: public  

* * *

<a name="module_ffmpeg_worker"></a>

# ffmpeg\_worker
provides methods to communicate with the FFmpeg and FFprobe libraries

**Example**  
```js
const _ = {};
_.ffmpeg = require('/.global/ffmpeg-worker.js');
```

* [ffmpeg_worker](#module_ffmpeg_worker)
    * _private_
        * [getScalingFilter(mode, width, height)](#exp_module_ffmpeg_worker--getScalingFilter) ⇒ <code>string</code> 
        * [createLogFile(path, command, response)](#exp_module_ffmpeg_worker--createLogFile) 
    * _public_
        * [call(command, [log_path])](#exp_module_ffmpeg_worker--call) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [probe(command, [log_path])](#exp_module_ffmpeg_worker--probe) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [getDuration(path, [log_path])](#exp_module_ffmpeg_worker--getDuration) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [getResolution(path, [log_path])](#exp_module_ffmpeg_worker--getResolution) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [countFrames(path, [log_path])](#exp_module_ffmpeg_worker--countFrames) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [convertVideo(options)](#exp_module_ffmpeg_worker--convertVideo) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [trim(options)](#exp_module_ffmpeg_worker--trim) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [changeVolume(options)](#exp_module_ffmpeg_worker--changeVolume) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [changeVideoSpeed(options)](#exp_module_ffmpeg_worker--changeVideoSpeed) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [changeAudioSpeed(options)](#exp_module_ffmpeg_worker--changeAudioSpeed) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [extractLastFrame(options)](#exp_module_ffmpeg_worker--extractLastFrame) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [createMP4fromImageAudio(options)](#exp_module_ffmpeg_worker--createMP4fromImageAudio) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [concatenateMP4s(options)](#exp_module_ffmpeg_worker--concatenateMP4s) ⇒ <code>Promise.&lt;Object&gt;</code> 


* * *

<a name="exp_module_ffmpeg_worker--getScalingFilter"></a>

## getScalingFilter(mode, width, height) ⇒ <code>string</code> 
gets the scaling filter for the given scaling mode

**Kind**: Exported function  
**Returns**: <code>string</code> - scaling filter  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| mode | <code>contain</code> \| <code>cover</code> \| <code>fill</code> | scaling mode |
| width | <code>integer</code> | width in pixels |
| height | <code>integer</code> | height in pixels |


* * *

<a name="exp_module_ffmpeg_worker--createLogFile"></a>

## createLogFile(path, command, response) 
generates a log file

**Kind**: Exported function  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path at which to generate the log file |
| command | <code>string</code> | FFmpeg command |
| response | <code>string</code> | FFmpeg response from the command |


* * *

<a name="exp_module_ffmpeg_worker--call"></a>

## call(command, [log_path]) ⇒ <code>Promise.&lt;Object&gt;</code> 
runs FFmpeg library with parameters or a command

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - response from FFmpeg  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | FFmpeg command |
| [log_path] | <code>string</code> | path where a FFmpeg log file will be generated |

**Example**  
```js
await call(`-i "path/to/file.mp4" ...`);
// ouput: {
//   command : '', // command by which the library was called
//   success : true, // true, if successful, false if not, null if the process failed to execute the command
//   error   : {}, // object containing more information about an error that occured
//   stdout  : '', // what the library returned as stdout after the command was executed
//   stderr  : '' // what the library returned as stderr after the command was executed
// }
```

* * *

<a name="exp_module_ffmpeg_worker--probe"></a>

## probe(command, [log_path]) ⇒ <code>Promise.&lt;Object&gt;</code> 
runs FFprobe library with parameters or a command

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - response from FFprobe  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>string</code> | FFprobe command |
| [log_path] | <code>string</code> | path where a FFmpeg log file will be generated |

**Example**  
```js
await probe(`-i "path/to/file.mp4" ...`);
// ouput: {
//   command : '', // command by which the library was called
//   success : true, // true, if successful, false if not, null if the process failed to execute the command
//   error   : {}, // object containing more information about an error that occured
//   stdout  : '', // what the library returned as stdout after the command was executed
//   stderr  : '' // what the library returned as stderr after the command was executed
// }
```

* * *

<a name="exp_module_ffmpeg_worker--getDuration"></a>

## getDuration(path, [log_path]) ⇒ <code>Promise.&lt;Object&gt;</code> 
returns the duration of a video or audio clip

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - FFprobe output and duration as a timestamp in the format "hh:mm:ss.SSS"  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to a video or audio file |
| [log_path] | <code>string</code> | path where a FFprobe log file will be generated |

**Example**  
```js
await getResolution('video.mp4');
// output: {
//   duration : '00:00:00.000', // video duration
//   command  : '', // command by which the library was called
//   success  : true, // true, if successful, false if not, null if the process failed to execute the command
//   error    : {}, // object containing more information about an error that occured
//   stdout   : '', // what the library returned as stdout after the command was executed
//   stderr   : '' // what the library returned as stderr after the command was executed
// }
```

* * *

<a name="exp_module_ffmpeg_worker--getResolution"></a>

## getResolution(path, [log_path]) ⇒ <code>Promise.&lt;Object&gt;</code> 
returns the resolution of a video in pixels

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - object with resolution data and FFprobe response  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to a video file |
| [log_path] | <code>string</code> | path where a FFprobe log file will be generated |

**Example**  
```js
await getResolution('video.mp4');
// output: {
//   width   : 1280, // width in pixels
//   height  : 720, // height in pixels
//   command : '', // command by which the library was called
//   success : true, // true, if successful, false if not, null if the process failed to execute the command
//   error   : {}, // object containing more information about an error that occured
//   stdout  : '', // what the library returned as stdout after the command was executed
//   stderr  : '' // what the library returned as stderr after the command was executed
// }
```

* * *

<a name="exp_module_ffmpeg_worker--countFrames"></a>

## countFrames(path, [log_path]) ⇒ <code>Promise.&lt;Object&gt;</code> 
counts the frames of a video file

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - FFprobe response with number of frames in the video  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | path to a video file |
| [log_path] | <code>string</code> | path where a FFprobe log file will be generated |

**Example**  
```js
await getResolution('video.mp4');
// output: {
//   frames  : 0, // amount of frames
//   command : '', // command by which the library was called
//   success : true, // true, if successful, false if not, null if the process failed to execute the command
//   error   : {}, // object containing more information about an error that occured
//   stdout  : '', // what the library returned as stdout after the command was executed
//   stderr  : '' // what the library returned as stderr after the command was executed
// }
```

* * *

<a name="exp_module_ffmpeg_worker--convertVideo"></a>

## convertVideo(options) ⇒ <code>Promise.&lt;Object&gt;</code> 
converts a video file to an MP4 file with a lecture.js-compatible codec

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - response from FFmpeg  
**Category**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.input_path | <code>string</code> |  | path to the input video file |
| options.output_path | <code>string</code> |  | path to the where the output file should be generated |
| options.width | <code>integer</code> |  | width of the output video (if undefined, uses default value) |
| options.height | <code>integer</code> |  | height of the output video (if undefined, uses default value) |
| options.fps | <code>integer</code> |  | frames per second of the output video (if undefined, uses default value) |
| [options.fit] | <code>contain</code> \| <code>cover</code> \| <code>fill</code> | <code>contain</code> | defines how to fit the video to the output resolution |
| [options.begin_time] | <code>integer</code> |  | time as a SSML or FFmpeg timestamp at where the clip should should start |
| [options.end_time] | <code>integer</code> |  | time as a SSML or FFmpeg timestamp at where the clip should should end |
| [options.log_path] | <code>string</code> |  | path where a FFmpeg log file will be generated |


* * *

<a name="exp_module_ffmpeg_worker--trim"></a>

## trim(options) ⇒ <code>Promise.&lt;Object&gt;</code> 
trims a media file to a given start and/or end time

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - response from FFmpeg  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.input_path | <code>string</code> | path to the input video or audio file |
| options.output_path | <code>string</code> | path to the where the output file should be generated |
| [options.begin_time] | <code>integer</code> | time as a SSML or FFmpeg timestamp at where the clip should should start |
| [options.end_time] | <code>integer</code> | time as a SSML or FFmpeg timestamp at where the clip should should end |
| [options.log_path] | <code>string</code> | path where a FFmpeg log file will be generated |


* * *

<a name="exp_module_ffmpeg_worker--changeVolume"></a>

## changeVolume(options) ⇒ <code>Promise.&lt;Object&gt;</code> 
changes the volume of an audio or video clip by a relative decibel amount

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - response from FFmpeg  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.input_path | <code>string</code> | path to the input video or audio file |
| options.output_path | <code>string</code> | path to the where the output file should be generated |
| options.volume | <code>string</code> | defines by how much to change the volume in relative dB values, e.g., +5dB or -10dB |
| [options.log_path] | <code>string</code> | path where a FFmpeg log file will be generated |

**Example**  
```js
// increases volume by 5dB
await changeVolume({
     input_path  : 'test.m4a',
     output_path : 'output.m4a',
     volume      : '+5dB' // to decrease it by e.g. 2dB. write '-2dB'
});
```

* * *

<a name="exp_module_ffmpeg_worker--changeVideoSpeed"></a>

## changeVideoSpeed(options) ⇒ <code>Promise.&lt;Object&gt;</code> 
changes the speed of a video clip

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - response from FFmpeg  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.input_path | <code>string</code> | path to the input video or audio file |
| options.output_path | <code>string</code> | path to the where the output file should be generated |
| options.speed | <code>integer</code> | defines to what to change the speed in percentage |
| [options.log_path] | <code>string</code> | path where a FFmpeg log file will be generated |

**Example**  
```js
// sets the speed to 200%, meaning that it doubles it
await changeVideoSpeed({
     input_path  : 'test.mp4',
     output_path : 'output.mp4',
     speed       : 200
});
```

* * *

<a name="exp_module_ffmpeg_worker--changeAudioSpeed"></a>

## changeAudioSpeed(options) ⇒ <code>Promise.&lt;Object&gt;</code> 
changes the speed of an audio clip

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - response from FFmpeg  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.input_path | <code>string</code> | path to the input video or audio file |
| options.output_path | <code>string</code> | path to the where the output file should be generated |
| options.speed | <code>integer</code> | defines to what to change the speed in percentage |
| [options.log_path] | <code>string</code> | path where a FFmpeg log file will be generated |

**Example**  
```js
// sets the speed to 50%, meaning that it halves it
await changeAudioSpeed({
     input_path  : 'test.m4a',
     output_path : 'output.m4a',
     speed       : 200
});
```

* * *

<a name="exp_module_ffmpeg_worker--extractLastFrame"></a>

## extractLastFrame(options) ⇒ <code>Promise.&lt;Object&gt;</code> 
extracts the last frame from a video file as an image

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - response from FFmpeg  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.input_path | <code>string</code> | absolute path to a video file |
| options.output_path | <code>string</code> | output location of a PNG file |
| [options.log_path] | <code>string</code> | path where a FFmpeg log file will be generated |

**Example**  
```js
await extractLastFrame({
     input_path  : 'here/clip.mp4', 
     output_path : 'there/output.png'
});
```

* * *

<a name="exp_module_ffmpeg_worker--createMP4fromImageAudio"></a>

## createMP4fromImageAudio(options) ⇒ <code>Promise.&lt;Object&gt;</code> 
combines an image and audio into an MP4 file

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - response from FFmpeg  
**Category**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.frame_path | <code>string</code> |  | path to an image file |
| options.audio_path | <code>string</code> |  | path to an audio file |
| options.output_path | <code>string</code> |  | path where to put the MP4 output video file |
| options.width | <code>integer</code> |  | width of the output video in pixels |
| options.height | <code>integer</code> |  | height of the output video in pixels |
| options.fps | <code>integer</code> |  | frames per second of the output video |
| [options.fit] | <code>contain</code> \| <code>cover</code> \| <code>fill</code> | <code>contain</code> | defines how to fit the image to the output resolution |
| [options.log_path] | <code>string</code> |  | path where a FFmpeg log file will be generated |


* * *

<a name="exp_module_ffmpeg_worker--concatenateMP4s"></a>

## concatenateMP4s(options) ⇒ <code>Promise.&lt;Object&gt;</code> 
combines multiple similar MP4 files (codec, fps, resolution, ...) into a single MP4 file

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - response from FFmpeg  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.input_paths | <code>Array.&lt;string&gt;</code> | array of file paths to existing MP4 video files |
| options.output_path | <code>string</code> | path where to put the output MP4 video file |
| [options.log_path] | <code>string</code> | path where a FFmpeg log file will be generated |


* * *

<a name="module_formatting_codes"></a>

# formatting\_codes
contains formatting codes for the terminal

**Example**  
```js
const _ = {};
_.format = require('/.global/formatting-codes.js');
```

* * *

<a name="module_logger"></a>

# logger
provides methods for logging to the terminal or a file

**Example**  
```js
const _ = {};
_.logger = require('/.global/logger.js');
```

* [logger](#module_logger)
    * _private_
        * [stringifyDate(date)](#exp_module_logger--stringifyDate) ⇒ <code>string</code> 
        * [getTrace()](#exp_module_logger--getTrace) ⇒ <code>Object</code> 
        * [createLog(type, ...content)](#exp_module_logger--createLog) ⇒ <code>Object</code> 
        * [saveLog(log)](#exp_module_logger--saveLog) 
        * [writeLog(file_path, log)](#exp_module_logger--writeLog) 
        * [writeIndex(file_path, index)](#exp_module_logger--writeIndex) 
        * [printLog(log)](#exp_module_logger--printLog) 
        * [printIndex(index)](#exp_module_logger--printIndex) 
        * [processLog(type, ...content)](#exp_module_logger--processLog) 
        * [processMultipleLogs(type, contentArray)](#exp_module_logger--processMultipleLogs) 
    * _public_
        * [setOption(key, value)](#exp_module_logger--setOption) ⇒ <code>boolean</code> 
        * [fatal(...content)](#exp_module_logger--fatal) 
        * [fatalMultiple(contentArray)](#exp_module_logger--fatalMultiple) 
        * [error(...content)](#exp_module_logger--error) 
        * [errorMultiple(contentArray)](#exp_module_logger--errorMultiple) 
        * [warn(...content)](#exp_module_logger--warn) 
        * [warnMultiple(contentArray)](#exp_module_logger--warnMultiple) 
        * [info(...content)](#exp_module_logger--info) 
        * [infoMultiple(contentArray)](#exp_module_logger--infoMultiple) 
        * [message(...content)](#exp_module_logger--message) 
        * [messageMultiple(contentArray)](#exp_module_logger--messageMultiple) 
        * [question(...content)](#exp_module_logger--question) ⇒ <code>Promise.&lt;string&gt;</code> 
        * [confirm(...content)](#exp_module_logger--confirm) ⇒ <code>Promise.&lt;boolean&gt;</code> 
        * [printAll()](#exp_module_logger--printAll) 
        * [countLogs()](#exp_module_logger--countLogs) ⇒ <code>integer</code> 
        * [getAll()](#exp_module_logger--getAll) ⇒ <code>Array.&lt;Object&gt;</code> 
        * [getWithType(type)](#exp_module_logger--getWithType) ⇒ <code>Array.&lt;Object&gt;</code> 
        * [getLast()](#exp_module_logger--getLast) ⇒ <code>Object</code> 
        * [writeLogsToFile(file_path)](#exp_module_logger--writeLogsToFile) 


* * *

<a name="exp_module_logger--stringifyDate"></a>

## stringifyDate(date) ⇒ <code>string</code> 
formats a Date object to a string in the format of `yy/mm/dd hh:mm:ss.SSS`

**Kind**: Exported function  
**Returns**: <code>string</code> - formatted date string  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| date | <code>Object</code> | date object |

**Example**  
```js
stringifyDate(new Date());
// output: '20/08/22 00:03:10.234'
```

* * *

<a name="exp_module_logger--getTrace"></a>

## getTrace() ⇒ <code>Object</code> 
creates a silent error and reads trace information from the error stack

**Kind**: Exported function  
**Returns**: <code>Object</code> - error trace  
**Category**: private  

* * *

<a name="exp_module_logger--createLog"></a>

## createLog(type, ...content) ⇒ <code>Object</code> 
creates a log object of the given type and content

**Kind**: Exported function  
**Returns**: <code>Object</code> - log  
**Category**: private  

| Param | Type |
| --- | --- |
| type | <code>string</code> | 
| ...content | <code>\*</code> | 


* * *

<a name="exp_module_logger--saveLog"></a>

## saveLog(log) 
saves a log object in the logs array

**Kind**: Exported function  
**Category**: private  

| Param | Type |
| --- | --- |
| log | <code>Object</code> | 


* * *

<a name="exp_module_logger--writeLog"></a>

## writeLog(file_path, log) 
writes a log object into a file

**Kind**: Exported function  
**Category**: private  

| Param | Type |
| --- | --- |
| file_path | <code>string</code> | 
| log | <code>Object</code> | 


* * *

<a name="exp_module_logger--writeIndex"></a>

## writeIndex(file_path, index) 
writes a log object (of the logs array at a given index) into a file

**Kind**: Exported function  
**Category**: private  

| Param | Type |
| --- | --- |
| file_path | <code>string</code> | 
| index | <code>integer</code> | 


* * *

<a name="exp_module_logger--printLog"></a>

## printLog(log) 
prints a log object

**Kind**: Exported function  
**Category**: private  

| Param | Type |
| --- | --- |
| log | <code>Object</code> | 


* * *

<a name="exp_module_logger--printIndex"></a>

## printIndex(index) 
prints a log object found in the logs array by a given index

**Kind**: Exported function  
**Category**: private  

| Param | Type |
| --- | --- |
| index | <code>integer</code> | 


* * *

<a name="exp_module_logger--processLog"></a>

## processLog(type, ...content) 
creates, saves and prints a single log

**Kind**: Exported function  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | type of the logs |
| ...content | <code>\*</code> | variable number of arguments that will be combined into one log |

**Example**  
```js
processLog('fatal', 'log', 1 'test');
// output: [FATAL] log 1 test
```

* * *

<a name="exp_module_logger--processMultipleLogs"></a>

## processMultipleLogs(type, contentArray) 
creates, saves and prints multiple logs of the same type

**Kind**: Exported function  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | type of the logs |
| contentArray | <code>Array.&lt;\*&gt;</code> | each index of which (can be an array also) will be treated as its own log |

**Example**  
```js
let logs = [
  'log1',
  'log2',
  ['log3', 'test']
];
processMultipleLogs('fatal', logs);
// output:
// [FATAL] log1
// [FATAL] log2
// [FATAL] log3 test
```

* * *

<a name="exp_module_logger--setOption"></a>

## setOption(key, value) ⇒ <code>boolean</code> 
sets an internal option with a value

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true on success  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>&#x27;max\_logs\_amount&#x27;</code> \| <code>&#x27;colored\_logs&#x27;</code> | name of the option |
| value | <code>\*</code> | value of the option |

**Example**  
```js
// set maximum number of logs that is held by the logs object (older ones are discarded)
setOption('max_logs_amount', 500);
// set if logs printed in the terminal should be formatted with color
setOption('colored_logs', true);
```

* * *

<a name="exp_module_logger--fatal"></a>

## fatal(...content) 
prints a fatal error and saves it as a log

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| ...content | <code>\*</code> | variable number of arguments that will be combined into one log |

**Example**  
```js
fatal('log',1,'test');
// output: [FATAL] log 1 test
```

* * *

<a name="exp_module_logger--fatalMultiple"></a>

## fatalMultiple(contentArray) 
prints multiple fatal errors and saves them in logs

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| contentArray | <code>Array.&lt;\*&gt;</code> | each index of which (can be an array also) will be treated as its own log |

**Example**  
```js
let logs = [
  'log1',
  'log2',
  ['log3', 'test']
];
fatalMultiple(logs);
// output:
// [FATAL] log1
// [FATAL] log2
// [FATAL] log3 test
```

* * *

<a name="exp_module_logger--error"></a>

## error(...content) 
prints an error and saves it as a log

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| ...content | <code>\*</code> | variable number of arguments that will be combined into one log |

**Example**  
```js
error('log',1,'test');
// output: [ERROR] log 1 test
```

* * *

<a name="exp_module_logger--errorMultiple"></a>

## errorMultiple(contentArray) 
prints multiple errors and saves them in logs

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| contentArray | <code>Array.&lt;\*&gt;</code> | each index of which (can be an array also) will be treated as its own log |

**Example**  
```js
let logs = [
  'log1',
  'log2',
  ['log3', 'test']
];
errorMultiple(logs);
// output:
// [ERROR] log1
// [ERROR] log2
// [ERROR] log3 test
```

* * *

<a name="exp_module_logger--warn"></a>

## warn(...content) 
prints a warning and saves it as a log

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| ...content | <code>\*</code> | variable number of arguments that will be combined into one log |

**Example**  
```js
warn('log',1,'test');
// output: [WARN] log 1 test
```

* * *

<a name="exp_module_logger--warnMultiple"></a>

## warnMultiple(contentArray) 
prints multiple warnings and saves them in logs

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| contentArray | <code>Array.&lt;\*&gt;</code> | each index of which (can be an array also) will be treated as its own log |

**Example**  
```js
let logs = [
  'log1',
  'log2',
  ['log3', 'test']
];
warnMultiple(logs);
// output:
// [WARN] log1
// [WARN] log2
// [WARN] log3 test
```

* * *

<a name="exp_module_logger--info"></a>

## info(...content) 
prints an info and saves it as a log

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| ...content | <code>\*</code> | variable number of arguments that will be combined into one log |

**Example**  
```js
info('log',1,'test');
// output: [INFO] log 1 test
```

* * *

<a name="exp_module_logger--infoMultiple"></a>

## infoMultiple(contentArray) 
prints multiple infos and saves them in logs

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| contentArray | <code>Array.&lt;\*&gt;</code> | each index of which (can be an array also) will be treated as its own log |

**Example**  
```js
let logs = [
  'log1',
  'log2',
  ['log3', 'test']
];
infoMultiple(logs);
// output:
// [INFO] log1
// [INFO] log2
// [INFO] log3 test
```

* * *

<a name="exp_module_logger--message"></a>

## message(...content) 
prints a message and saves it as a log

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| ...content | <code>\*</code> | variable number of arguments that will be combined into one log |

**Example**  
```js
message('log',1,'test');
// output: [LOG] log 1 test
```

* * *

<a name="exp_module_logger--messageMultiple"></a>

## messageMultiple(contentArray) 
prints multiple messages and saves them in logs

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| contentArray | <code>Array.&lt;\*&gt;</code> | each index of which (can be an array also) will be treated as its own log |

**Example**  
```js
let logs = [
  'log1',
  'log2',
  ['log3', 'test']
];
messageMultiple(logs);
// output:
// [LOG] log1
// [LOG] log2
// [LOG] log3 test
```

* * *

<a name="exp_module_logger--question"></a>

## question(...content) ⇒ <code>Promise.&lt;string&gt;</code> 
asks a question and receives a user answer via the terminal

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;string&gt;</code> - answer entered by the user  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| ...content | <code>\*</code> | variable number of arguments that will be combined into one question |


* * *

<a name="exp_module_logger--confirm"></a>

## confirm(...content) ⇒ <code>Promise.&lt;boolean&gt;</code> 
asks a question and returns true, if the user entered 'y' or 'Y'

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true, if the user confirmed it  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| ...content | <code>\*</code> | variable number of arguments that will be combined into one question |


* * *

<a name="exp_module_logger--printAll"></a>

## printAll() 
prints all logs created since the start of the program and that are still saved

**Kind**: Exported function  
**Category**: public  

* * *

<a name="exp_module_logger--countLogs"></a>

## countLogs() ⇒ <code>integer</code> 
returns the number of logs in the logs array

**Kind**: Exported function  
**Returns**: <code>integer</code> - amount of logs  
**Category**: public  

* * *

<a name="exp_module_logger--getAll"></a>

## getAll() ⇒ <code>Array.&lt;Object&gt;</code> 
returns all log objects

**Kind**: Exported function  
**Returns**: <code>Array.&lt;Object&gt;</code> - array with copies of all log objects  
**Category**: public  

* * *

<a name="exp_module_logger--getWithType"></a>

## getWithType(type) ⇒ <code>Array.&lt;Object&gt;</code> 
returns all log objects with a specific type

**Kind**: Exported function  
**Returns**: <code>Array.&lt;Object&gt;</code> - array with copies of log objects  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | types include: message, info, warn, error, fatal |


* * *

<a name="exp_module_logger--getLast"></a>

## getLast() ⇒ <code>Object</code> 
returns the latest log object

**Kind**: Exported function  
**Returns**: <code>Object</code> - copy of the last log object  
**Category**: public  

* * *

<a name="exp_module_logger--writeLogsToFile"></a>

## writeLogsToFile(file_path) 
writes the current contents of the logs object into a file

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| file_path | <code>string</code> | path at where to write the file |


* * *

<a name="module_pdf_worker"></a>

# pdf\_worker
extracts information and image frames from PDF files

**Example**  
```js
const _ = {};
_.pdf_worker = require('/.global/pdf-worker.js');
```

* [pdf_worker](#module_pdf_worker)
    * _private_
        * [read(path)](#exp_module_pdf_worker--read) ⇒ <code>string</code> 
        * [createObject(path)](#exp_module_pdf_worker--createObject) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [convertPageViewport(page_object, desired_width, desired_height)](#exp_module_pdf_worker--convertPageViewport) ⇒ <code>Object</code> 
    * _public_
        * [exists(path)](#exp_module_pdf_worker--exists) ⇒ <code>boolean</code> 
        * [isValidFile(path)](#exp_module_pdf_worker--isValidFile) ⇒ <code>Promise.&lt;boolean&gt;</code> 
        * [countPages(path)](#exp_module_pdf_worker--countPages) ⇒ <code>Promise.&lt;integer&gt;</code> 
        * [renderPage(options)](#exp_module_pdf_worker--renderPage) ⇒ <code>Promise.&lt;boolean&gt;</code> 


* * *

<a name="exp_module_pdf_worker--read"></a>

## read(path) ⇒ <code>string</code> 
reads a PDF file either from disk or from cache (if already read once)

**Kind**: Exported function  
**Returns**: <code>string</code> - PDF contents  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to a PDF file |


* * *

<a name="exp_module_pdf_worker--createObject"></a>

## createObject(path) ⇒ <code>Promise.&lt;Object&gt;</code> 
creates a PDF.js object of a given PDF file

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - PDF.js object  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to a PDF file |


* * *

<a name="exp_module_pdf_worker--convertPageViewport"></a>

## convertPageViewport(page_object, desired_width, desired_height) ⇒ <code>Object</code> 
converts the viewport of a PDF page to the given dimensions (as the aspect ratio is "fit" to the dimensions, the viewport does not distort and remains in the same aspect ratio as the original page object)

**Kind**: Exported function  
**Returns**: <code>Object</code> - PDF.js viewport object  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| page_object | <code>Object</code> | PDF.js page object |
| desired_width | <code>integer</code> | desired width of the output (viewport may be smaller, if the aspect ratio differs) |
| desired_height | <code>integer</code> | desired height of the output (viewport may be smaller, if the aspect ratio differs) |


* * *

<a name="exp_module_pdf_worker--exists"></a>

## exists(path) ⇒ <code>boolean</code> 
checks if a PDF file at the given path exists

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the path points to a PDF file  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to a PDF file |


* * *

<a name="exp_module_pdf_worker--isValidFile"></a>

## isValidFile(path) ⇒ <code>Promise.&lt;boolean&gt;</code> 
checks if a PDF file exists at a given path and can be read

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true if it's a valid PDF file  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to a PDF file |


* * *

<a name="exp_module_pdf_worker--countPages"></a>

## countPages(path) ⇒ <code>Promise.&lt;integer&gt;</code> 
loads a PDF file and counts its pages

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;integer&gt;</code> - number of pages  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to a file |


* * *

<a name="exp_module_pdf_worker--renderPage"></a>

## renderPage(options) ⇒ <code>Promise.&lt;boolean&gt;</code> 
generates an image file from a PDF page

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true on success  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | set of options |
| options.input_path | <code>string</code> | path to an existing PDF file |
| options.output_path | <code>string</code> | path to the output file |
| options.page | <code>integer</code> | number of the page to extract |
| options.width | <code>integer</code> | width to which to scale the output image |
| options.height | <code>integer</code> | height to which to scale the output image |

**Example**  
```js
await renderPage({
    input_path : 'here/file.pdf',
    output_path : 'there/output.png',
    page : 2,
    width : 1280,
    height : 720
});
```

* * *

<a name="module_requests"></a>

# requests
runs batches of requests asynchronously with specific limits

**Example**  
```js
const _ = {};
_.requester = require('/.global/requester.js');
```

* * *

<a name="exp_module_requests--run"></a>

## run(requests, options) ⇒ <code>Promise.&lt;undefined&gt;</code> 
runs a batch of requests in parallel with defined limits

**Kind**: Exported function  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| requests | <code>Array.&lt;{function: function(), parameters: Array.&lt;\*&gt;, callback: function(), callback\_parameters: Array.&lt;\*&gt;}&gt;</code> | requests to be run |
| options | <code>Object</code> | set of options |
| options.max_concurrent | <code>integer</code> | maximum requests that may run concurrently |
| options.max_per_second | <code>integer</code> | maximum requests that may be started in any second |

**Example**  
```js
let reqs = [
    {
        // the function is run with the given parameters
        function : function1,
        parameters : ['hello', 12.56],
        // after the function ran, the callback function is called
        callback : (output, param1, param2) => {
             console.log('This is the output from function1:', output);
             console.log('This will spell "abc":', param1);
             console.log('This will spell 12345:', param2);
        },
        callback_parameters : ['abc', 12345]
    },{
        function : function2,
        parameters : [8, 4.3, {test:2}],
        callback : callback2
    }
];
let options = {
    max_concurrent : 3,
    max_per_second : 2
};
await run(reqs, options);
```

* * *

<a name="module_timestamp"></a>

# timestamp
provides functions for parsing, converting, and validating different timestamp formats

**Example**  
```js
const _ = {};
_.timestamp = require('/.global/timestamp.js');
```

* [timestamp](#module_timestamp)
    * [isValid(n)](#exp_module_timestamp--isValid) ⇒ <code>boolean</code> 
    * [isFFmpeg(n)](#exp_module_timestamp--isFFmpeg) ⇒ <code>boolean</code> 
    * [isYoutube(n)](#exp_module_timestamp--isYoutube) ⇒ <code>boolean</code> 
    * [isSSML(n)](#exp_module_timestamp--isSSML) ⇒ <code>boolean</code> 
    * [parse(timestamp)](#exp_module_timestamp--parse) ⇒ <code>Object</code> 
    * [convertToFFmpeg(timestamp)](#exp_module_timestamp--convertToFFmpeg) ⇒ <code>string</code> 
    * [ffmpeg2youtube(timestamp)](#exp_module_timestamp--ffmpeg2youtube) ⇒ <code>string</code> 
    * [ffmpeg2ssml(timestamp)](#exp_module_timestamp--ffmpeg2ssml) ⇒ <code>string</code> 
    * [youtube2ffmpeg(timestamp)](#exp_module_timestamp--youtube2ffmpeg) ⇒ <code>string</code> 
    * [youtube2ssml(timestamp)](#exp_module_timestamp--youtube2ssml) ⇒ <code>string</code> 
    * [ssml2ffmpeg(timestamp)](#exp_module_timestamp--ssml2ffmpeg) ⇒ <code>string</code> 
    * [ssml2youtube(timestamp)](#exp_module_timestamp--ssml2youtube) ⇒ <code>string</code> 
    * [msec2ffmpeg(time)](#exp_module_timestamp--msec2ffmpeg) ⇒ <code>string</code> 
    * [sec2ffmpeg(time)](#exp_module_timestamp--sec2ffmpeg) ⇒ <code>string</code> 
    * [msec2youtube(time)](#exp_module_timestamp--msec2youtube) ⇒ <code>string</code> 
    * [sec2youtube(time)](#exp_module_timestamp--sec2youtube) ⇒ <code>string</code> 
    * [msec2ssml(time)](#exp_module_timestamp--msec2ssml) ⇒ <code>string</code> 
    * [sec2ssml(time)](#exp_module_timestamp--sec2ssml) ⇒ <code>string</code> 


* * *

<a name="exp_module_timestamp--isValid"></a>

## isValid(n) ⇒ <code>boolean</code> 
tests if a value is in a format valid on Youtube and SSML, or conforms to a (limited) FFmpeg timestamp format

**Kind**: Exported function  
**Category**: public  

| Param | Type |
| --- | --- |
| n | <code>string</code> | 

**Example**  
```js
isValid('105s'); // output: true
isValid('105000ms'); // output: true
isValid('01:45'); // output: true
isValid('00:01:45'); // output: true
isValid('00:01:45.000'); // output: true
isValid('000:01:45.000'); // output: true
```

* * *

<a name="exp_module_timestamp--isFFmpeg"></a>

## isFFmpeg(n) ⇒ <code>boolean</code> 
tests if a value conforms to a (limited) FFmpeg timestamp format

**Kind**: Exported function  
**Category**: public  

| Param | Type |
| --- | --- |
| n | <code>string</code> | 

**Example**  
```js
isFFmpeg('00:01:45'); // output: true
isFFmpeg('00:01:45.000'); // output: true
isFFmpeg('000:01:45.000'); // output: true
```

* * *

<a name="exp_module_timestamp--isYoutube"></a>

## isYoutube(n) ⇒ <code>boolean</code> 
tests if a value is a timestamp formatted for usage on Youtube

**Kind**: Exported function  
**Category**: public  

| Param | Type |
| --- | --- |
| n | <code>string</code> | 

**Example**  
```js
isValid('01:45'); // output: true
isValid('00:01:45'); // output: true
isValid('000:01:45'); // output: true
```

* * *

<a name="exp_module_timestamp--isSSML"></a>

## isSSML(n) ⇒ <code>boolean</code> 
tests if a value is a timestamp formatted for usage in SSML

**Kind**: Exported function  
**Category**: public  

| Param | Type |
| --- | --- |
| n | <code>string</code> | 

**Example**  
```js
isValid('5s'); // output: true
isValid('5000ms'); // output: true
```

* * *

<a name="exp_module_timestamp--parse"></a>

## parse(timestamp) ⇒ <code>Object</code> 
parses a valid timestamp (SSML, Youtube, FFmpeg) and extracts values

**Kind**: Exported function  
**Returns**: <code>Object</code> - time values  
**Category**: public  

| Param | Type |
| --- | --- |
| timestamp | <code>string</code> | 

**Example**  
```js
parse(`02:10:20.345`);
// ouput: {
//   milliseconds: 345,
//   seconds: 20,
//   minutes: 10,
//   hours: 2,
//   milliseconds_total: 7820345,
//   seconds_total: 7820.345,
//   minutes_total: 130.33908333333332,
//   hours_total: 2.1723180555555555
// }
```

* * *

<a name="exp_module_timestamp--convertToFFmpeg"></a>

## convertToFFmpeg(timestamp) ⇒ <code>string</code> 
converts a valid SSML or Youtube timestamp to a FFmpeg timestamp

**Kind**: Exported function  
**Returns**: <code>string</code> - FFmpeg timestamp  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| timestamp | <code>string</code> | SSML or YouTube timestamp |

**Example**  
```js
convertToFFmpeg('55s'); // output: '00:00:55.000'
convertToFFmpeg('00:55'); // output: '00:00:55.000'
```

* * *

<a name="exp_module_timestamp--ffmpeg2youtube"></a>

## ffmpeg2youtube(timestamp) ⇒ <code>string</code> 
converts a valid FFmpeg timestamp to a Youtube timestamp

**Kind**: Exported function  
**Returns**: <code>string</code> - Youtube timestamp  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| timestamp | <code>string</code> | FFmpeg timestamp |

**Example**  
```js
ffmpeg2youtube('00:20:59.500'); // output: '20:59'
ffmpeg2youtube('01:20:59.500'); // output: '01:20:59'
```

* * *

<a name="exp_module_timestamp--ffmpeg2ssml"></a>

## ffmpeg2ssml(timestamp) ⇒ <code>string</code> 
converts a valid FFmpeg timestamp to a SSML timestamp

**Kind**: Exported function  
**Returns**: <code>string</code> - SSML timestamp  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| timestamp | <code>string</code> | FFmpeg timestamp |

**Example**  
```js
ffmpeg2ssml('00:00:02.500'); // output: '2500ms'
```

* * *

<a name="exp_module_timestamp--youtube2ffmpeg"></a>

## youtube2ffmpeg(timestamp) ⇒ <code>string</code> 
converts a valid Youtube timestamp to a FFmpeg timestamp

**Kind**: Exported function  
**Returns**: <code>string</code> - FFmpeg timestamp  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| timestamp | <code>string</code> | Youtube timestamp |

**Example**  
```js
youtube2ffmpeg('00:02'); // output: '00:00:02.000'
youtube2ffmpeg('05:00:02'); // output: '05:00:02.000'
```

* * *

<a name="exp_module_timestamp--youtube2ssml"></a>

## youtube2ssml(timestamp) ⇒ <code>string</code> 
converts a valid Youtube timestamp to a SSML timestamp

**Kind**: Exported function  
**Returns**: <code>string</code> - SSML timestamp  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| timestamp | <code>string</code> | Youtube timestamp |

**Example**  
```js
youtube2ssml('00:02'); // output: '2s'
youtube2ssml('05:00:02'); // output: '18002s'
```

* * *

<a name="exp_module_timestamp--ssml2ffmpeg"></a>

## ssml2ffmpeg(timestamp) ⇒ <code>string</code> 
converts a valid SSML timestamp to a FFmpeg timestamp

**Kind**: Exported function  
**Returns**: <code>string</code> - FFmpeg timestamp  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| timestamp | <code>string</code> | SSML timestamp |

**Example**  
```js
ssml2ffmpeg('2s'); // output: '00:00:02.000'
ssml2ffmpeg('2000ms'); // output: '00:00:02.000'
```

* * *

<a name="exp_module_timestamp--ssml2youtube"></a>

## ssml2youtube(timestamp) ⇒ <code>string</code> 
converts a valid SSML timestamp to a Youtube timestamp

**Kind**: Exported function  
**Returns**: <code>string</code> - Youtube timestamp  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| timestamp | <code>string</code> | SSML timestamp |

**Example**  
```js
ssml2youtube('2345ms'); // output: '00:02'
ssml2youtube('2s'); // output: '00:02'
ssml2youtube('9000s'); // output: '02:30:00'
```

* * *

<a name="exp_module_timestamp--msec2ffmpeg"></a>

## msec2ffmpeg(time) ⇒ <code>string</code> 
converts milliseconds to a FFmpeg timestamp

**Kind**: Exported function  
**Returns**: <code>string</code> - FFmpeg timestamp  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>integer</code> | milliseconds |

**Example**  
```js
msec2ffmpeg(2500); // output: '00:00:02.500'
msec2ffmpeg(99999999); // output: '27:46:39.999'
```

* * *

<a name="exp_module_timestamp--sec2ffmpeg"></a>

## sec2ffmpeg(time) ⇒ <code>string</code> 
converts seconds to a FFmpeg timestamp

**Kind**: Exported function  
**Returns**: <code>string</code> - FFmpeg timestamp  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>integer</code> | seconds |

**Example**  
```js
sec2ffmpeg(2); // output: '00:00:02.000'
sec2ffmpeg(9999); // output: '02:46:39.000'
```

* * *

<a name="exp_module_timestamp--msec2youtube"></a>

## msec2youtube(time) ⇒ <code>string</code> 
converts milliseconds to a Youtube timestamp

**Kind**: Exported function  
**Returns**: <code>string</code> - Youtube timestamp  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>integer</code> | milliseconds |

**Example**  
```js
msec2youtube(2500); // output: '00:02'
msec2youtube(99999999); // output: '27:46:39'
```

* * *

<a name="exp_module_timestamp--sec2youtube"></a>

## sec2youtube(time) ⇒ <code>string</code> 
converts seconds to a Youtube timestamp

**Kind**: Exported function  
**Returns**: <code>string</code> - Youtube timestamp  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>integer</code> | seconds |

**Example**  
```js
sec2youtube(2); // output: '00:02'
sec2youtube(9999); // output: '02:46:39'
```

* * *

<a name="exp_module_timestamp--msec2ssml"></a>

## msec2ssml(time) ⇒ <code>string</code> 
converts milliseconds to a SSML timestamp

**Kind**: Exported function  
**Returns**: <code>string</code> - SSML timestamp  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>integer</code> | milliseconds |

**Example**  
```js
msec2youtube(2500); // output: '2500ms'
msec2youtube(99999999); // output: '99999999ms'
```

* * *

<a name="exp_module_timestamp--sec2ssml"></a>

## sec2ssml(time) ⇒ <code>string</code> 
converts seconds to a SSML timestamp

**Kind**: Exported function  
**Returns**: <code>string</code> - SSML timestamp  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>integer</code> | seconds |

**Example**  
```js
sec2youtube(2); // output: '2s'
sec2youtube(9999); // output: '9999s'
```

* * *

<a name="module_type"></a>

# type
provides methods for validating variable types

**Example**  
```js
const _ = {};
_.type = require('/.global/type-tests.js');
```

* [type](#module_type)
    * [of(value)](#exp_module_type--of) ⇒ <code>string</code> 
    * [isLikeBoolean(value)](#exp_module_type--isLikeBoolean) ⇒ <code>boolean</code> 
    * [isBoolean(value)](#exp_module_type--isBoolean) ⇒ <code>boolean</code> 
    * [isFunction(value)](#exp_module_type--isFunction) ⇒ <code>boolean</code> 
    * [isPromise(value)](#exp_module_type--isPromise) ⇒ <code>boolean</code> 
    * [isObject(value)](#exp_module_type--isObject) ⇒ <code>boolean</code> 
    * [isDate(value)](#exp_module_type--isDate) ⇒ <code>boolean</code> 
    * [isArray(value)](#exp_module_type--isArray) ⇒ <code>boolean</code> 
    * [isString(value)](#exp_module_type--isString) ⇒ <code>boolean</code> 
    * [isNumber(value)](#exp_module_type--isNumber) ⇒ <code>boolean</code> 
    * [isInteger(value)](#exp_module_type--isInteger) ⇒ <code>boolean</code> 
    * [isFloat(value)](#exp_module_type--isFloat) ⇒ <code>boolean</code> 


* * *

<a name="exp_module_type--of"></a>

## of(value) ⇒ <code>string</code> 
returns the type of a value (extended typeof method)

**Kind**: Exported function  
**Returns**: <code>string</code> - type of the value  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

**Example**  
```js
of(true); // output: 'boolean'
of(false); // output: 'boolean'
of('true'); // output: 'string'
of('false'); // output: 'string'
of({}); // output: 'object'
of([]); // output: 'array'
of(new Function()); // output: 'function'
of(new Date()); // output: 'date'
of(new Promise((a, r) => {setTimeout(a, 5);})); // output: 'promise'
of(1); // output: 'integer'
of(-1); // output: 'integer'
of(0); // output: 'integer'
of(1.5); // output: 'float'
of(-1.5); // output: 'float'
of(undefined); // output: 'undefined'
of(null); // output: 'null'
```

* * *

<a name="exp_module_type--isLikeBoolean"></a>

## isLikeBoolean(value) ⇒ <code>boolean</code> 
checks if a value would be equal to a `true` or `false` expression

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value equals a true boolean  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

**Example**  
```js
isLikeBoolean(true); // output: true
isLikeBoolean(false); // output: false
isLikeBoolean('true'); // output: true
isLikeBoolean('false'); // output: false
isLikeBoolean({}); // output: true
isLikeBoolean([]); // output: true
isLikeBoolean(new Function()); // output: true
isLikeBoolean(new Date()); // output: true
isLikeBoolean(new Promise((a, r) => {setTimeout(a, 5);})); // output: true
isLikeBoolean(1); // output: true
isLikeBoolean(-1); // output: false
isLikeBoolean(0); // output: false
isLikeBoolean(1.5); // output: true
isLikeBoolean(-1.5); // output: false
isLikeBoolean(undefined); // output: false
isLikeBoolean(null); // output: false
```

* * *

<a name="exp_module_type--isBoolean"></a>

## isBoolean(value) ⇒ <code>boolean</code> 
checks if a value is a boolean

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is a boolean  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

**Example**  
```js
isBoolean(true); // output: true
isBoolean(false); // output: true
isBoolean('true'); // output: false
isBoolean('false'); // output: false
isBoolean({}); // output: false
isBoolean([]); // output: false
isBoolean(new Function()); // output: false
isBoolean(new Date()); // output: false
isBoolean(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
isBoolean(1); // output: false
isBoolean(-1); // output: false
isBoolean(0); // output: false
isBoolean(1.5); // output: false
isBoolean(-1.5); // output: false
isBoolean(undefined); // output: false
isBoolean(null); // output: false
```

* * *

<a name="exp_module_type--isFunction"></a>

## isFunction(value) ⇒ <code>boolean</code> 
checks if a value is a function

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is a function  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

**Example**  
```js
isFunction(true); // output: false
isFunction(false); // output: false
isFunction('true'); // output: false
isFunction('false'); // output: false
isFunction({}); // output: false
isFunction([]); // output: false
isFunction(new Function()); // output: true
isFunction(new Date()); // output: false
isFunction(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
isFunction(1); // output: false
isFunction(-1); // output: false
isFunction(0); // output: false
isFunction(1.5); // output: false
isFunction(-1.5); // output: false
isFunction(undefined); // output: false
isFunction(null); // output: false
```

* * *

<a name="exp_module_type--isPromise"></a>

## isPromise(value) ⇒ <code>boolean</code> 
checks if a value is a promise

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is a promise  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

**Example**  
```js
isPromise(true); // output: false
isPromise(false); // output: false
isPromise('true'); // output: false
isPromise('false'); // output: false
isPromise({}); // output: false
isPromise([]); // output: false
isPromise(new Function()); // output: false
isPromise(new Date()); // output: false
isPromise(new Promise((a, r) => {setTimeout(a, 5);})); // output: true
isPromise(1); // output: false
isPromise(-1); // output: false
isPromise(0); // output: false
isPromise(1.5); // output: false
isPromise(-1.5); // output: false
isPromise(undefined); // output: false
isPromise(null); // output: false
```

* * *

<a name="exp_module_type--isObject"></a>

## isObject(value) ⇒ <code>boolean</code> 
checks if a value is an object

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is an object  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

**Example**  
```js
isObject(true); // output: false
isObject(false); // output: false
isObject('true'); // output: false
isObject('false'); // output: false
isObject({}); // output: true
isObject([]); // output: false
isObject(new Function()); // output: false
isObject(new Date()); // output: true
isObject(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
isObject(1); // output: false
isObject(-1); // output: false
isObject(0); // output: false
isObject(1.5); // output: false
isObject(-1.5); // output: false
isObject(undefined); // output: false
isObject(null); // output: false
```

* * *

<a name="exp_module_type--isDate"></a>

## isDate(value) ⇒ <code>boolean</code> 
checks if a value is a date object

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is a date  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

**Example**  
```js
isDate(true); // output: false
isDate(false); // output: false
isDate('true'); // output: false
isDate('false'); // output: false
isDate({}); // output: false
isDate([]); // output: false
isDate(new Function()); // output: false
isDate(new Date()); // output: true
isDate(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
isDate(1); // output: false
isDate(-1); // output: false
isDate(0); // output: false
isDate(1.5); // output: false
isDate(-1.5); // output: false
isDate(undefined); // output: false
isDate(null); // output: false
```

* * *

<a name="exp_module_type--isArray"></a>

## isArray(value) ⇒ <code>boolean</code> 
checks if a value is an array

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is an array  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

**Example**  
```js
isArray(true); // output: false
isArray(false); // output: false
isArray('true'); // output: false
isArray('false'); // output: false
isArray({}); // output: false
isArray([]); // output: true
isArray(new Function()); // output: false
isArray(new Date()); // output: false
isArray(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
isArray(1); // output: false
isArray(-1); // output: false
isArray(0); // output: false
isArray(1.5); // output: false
isArray(-1.5); // output: false
isArray(undefined); // output: false
isArray(null); // output: false
```

* * *

<a name="exp_module_type--isString"></a>

## isString(value) ⇒ <code>boolean</code> 
checks if a value is a string

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is a string  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

**Example**  
```js
isString(true); // output: false
isString(false); // output: false
isString('true'); // output: true
isString('false'); // output: true
isString({}); // output: false
isString([]); // output: false
isString(new Function()); // output: false
isString(new Date()); // output: false
isString(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
isString(1); // output: false
isString(-1); // output: false
isString(0); // output: false
isString(1.5); // output: false
isString(-1.5); // output: false
isString(undefined); // output: false
isString(null); // output: false
```

* * *

<a name="exp_module_type--isNumber"></a>

## isNumber(value) ⇒ <code>boolean</code> 
checks if a value is a number

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is a number  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

**Example**  
```js
isNumber(true); // output: false
isNumber(false); // output: false
isNumber('true'); // output: false
isNumber('false'); // output: false
isNumber({}); // output: false
isNumber([]); // output: false
isNumber(new Function()); // output: false
isNumber(new Date()); // output: false
isNumber(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
isNumber(1); // output: true
isNumber(-1); // output: true
isNumber(0); // output: true
isNumber(1.5); // output: true
isNumber(-1.5); // output: true
isNumber(undefined); // output: false
isNumber(null); // output: false
```

* * *

<a name="exp_module_type--isInteger"></a>

## isInteger(value) ⇒ <code>boolean</code> 
checks if a value is an integer

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is an integer  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

**Example**  
```js
isInteger(true); // output: false
isInteger(false); // output: false
isInteger('true'); // output: false
isInteger('false'); // output: false
isInteger({}); // output: false
isInteger([]); // output: false
isInteger(new Function()); // output: false
isInteger(new Date()); // output: false
isInteger(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
isInteger(1); // output: true
isInteger(-1); // output: true
isInteger(0); // output: true
isInteger(1.5); // output: false
isInteger(-1.5); // output: false
isInteger(undefined); // output: false
isInteger(null); // output: false
```

* * *

<a name="exp_module_type--isFloat"></a>

## isFloat(value) ⇒ <code>boolean</code> 
checks if a value is a floating point value

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is a floating point value  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>\*</code> | 

**Example**  
```js
isInteger(true); // output: false
isInteger(false); // output: false
isInteger('true'); // output: false
isInteger('false'); // output: false
isInteger({}); // output: false
isInteger([]); // output: false
isInteger(new Function()); // output: false
isInteger(new Date()); // output: false
isInteger(new Promise((a, r) => {setTimeout(a, 5);})); // output: false
isInteger(1); // output: false
isInteger(-1); // output: false
isInteger(0); // output: false
isInteger(1.5); // output: true
isInteger(-1.5); // output: true
isInteger(undefined); // output: false
isInteger(null); // output: false
```

* * *

<a name="module_xml_converter"></a>

# xml\_converter
works with XML and can convert it to a JSON representation and vice versa

**Example**  
```js
const _ = {};
_.xml_converter = require('/.global/xml-converter.js');
```

* [xml_converter](#module_xml_converter)
    * [isValidXML(xml)](#exp_module_xml_converter--isValidXML) ⇒ <code>Object</code> 
    * [countXMLCharacters(xml)](#exp_module_xml_converter--countXMLCharacters) ⇒ <code>Object</code> 
    * [xml2json(xml)](#exp_module_xml_converter--xml2json) ⇒ <code>Object</code> 
    * [json2xml(json, [raw])](#exp_module_xml_converter--json2xml) ⇒ <code>string</code> 


* * *

<a name="exp_module_xml_converter--isValidXML"></a>

## isValidXML(xml) ⇒ <code>Object</code> 
checks if a string is valid XML content

**Kind**: Exported function  
**Returns**: <code>Object</code> - JSON representation  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| xml | <code>string</code> | valid XML file contents |

**Example**  
```js
isValidXML(`<a>test</a>`); // output: true
isValidXML(`test`); // output: false
```

* * *

<a name="exp_module_xml_converter--countXMLCharacters"></a>

## countXMLCharacters(xml) ⇒ <code>Object</code> 
counts the characters taken by XML elements in an XML string

**Kind**: Exported function  
**Returns**: <code>Object</code> - JSON representation  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| xml | <code>string</code> | valid XML file contents |

**Example**  
```js
countXMLCharacters(`<a>test</a>`); // output: 7
countXMLCharacters(`<ab c="d">test<b></b>test</a>`); // output: 21
```

* * *

<a name="exp_module_xml_converter--xml2json"></a>

## xml2json(xml) ⇒ <code>Object</code> 
converts XML to a JSON representation

**Kind**: Exported function  
**Returns**: <code>Object</code> - JSON representation  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| xml | <code>string</code> | valid XML file contents |


* * *

<a name="exp_module_xml_converter--json2xml"></a>

## json2xml(json, [raw]) ⇒ <code>string</code> 
converts a valid JSON representation back to XML data

**Kind**: Exported function  
**Returns**: <code>string</code> - XML content  
**Category**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| json | <code>Object</code> |  | valid JSON representation of an XML file |
| [raw] | <code>boolean</code> | <code>false</code> | if set to true, directly uses library to convert - if set to false, will make additional small adjustments |


* * *

<a name="module_parser"></a>

# parser
parses the lecture.js XML input

**Example**  
```js
const _ = {};
_.parser = require('/parser/main.js');
```

* [parser](#module_parser)
    * [parseMeta(path)](#exp_module_parser--parseMeta) ⇒ <code>Promise.&lt;Object&gt;</code> 
    * [parse(meta, xml_string, input_script_dir_path, configuration)](#exp_module_parser--parse) ⇒ <code>Promise.&lt;Object&gt;</code> 


* * *

<a name="exp_module_parser--parseMeta"></a>

## parseMeta(path) ⇒ <code>Promise.&lt;Object&gt;</code> 
parses the XML input for any meta information and settings

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - parsed meta data  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to the input XML file |


* * *

<a name="exp_module_parser--parse"></a>

## parse(meta, xml_string, input_script_dir_path, configuration) ⇒ <code>Promise.&lt;Object&gt;</code> 
parses a XML string and returns data

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - parsed data  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| meta | <code>Object</code> | meta data parsed using parseMeta() |
| xml_string | <code>string</code> | XML input |
| input_script_dir_path | <code>string</code> | path to the directory where the input file is located |
| configuration | <code>Object</code> | configuration data |


* * *

<a name="module_parser/meta-parser"></a>

# parser/meta-parser
gets meta information from given XML

**Example**  
```js
const _ = {};
_.meta_parser = require('/parser/meta-parser.js');
```

* [parser/meta-parser](#module_parser/meta-parser)
    * _private_
        * [handleInfo(tag)](#exp_module_parser/meta-parser--handleInfo) 
        * [handleSettings(tag)](#exp_module_parser/meta-parser--handleSettings) ⇒ <code>boolean</code> 
        * [handleDeck(tag, input_directory)](#exp_module_parser/meta-parser--handleDeck) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [handleLexicon(tag)](#exp_module_parser/meta-parser--handleLexicon) 
    * _public_
        * [parse(path)](#exp_module_parser/meta-parser--parse) ⇒ <code>Promise.&lt;Object&gt;</code> 


* * *

<a name="exp_module_parser/meta-parser--handleInfo"></a>

## handleInfo(tag) 
handles a <info /> tag and its attributes

**Kind**: Exported function  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| tag | <code>Object</code> | element |


* * *

<a name="exp_module_parser/meta-parser--handleSettings"></a>

## handleSettings(tag) ⇒ <code>boolean</code> 
handles a <settings /> tag and its attributes

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true, if the <info> tag was valid  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| tag | <code>Object</code> | element |


* * *

<a name="exp_module_parser/meta-parser--handleDeck"></a>

## handleDeck(tag, input_directory) ⇒ <code>Promise.&lt;Object&gt;</code> 
handles a <deck /> tag and its attributes

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - information if the slide deck is valid and active  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| tag | <code>Object</code> | element |
| input_directory | <code>string</code> | directory where the input LSML file is located |


* * *

<a name="exp_module_parser/meta-parser--handleLexicon"></a>

## handleLexicon(tag) 
handles a <lexicon> tag, its attributes and contents

**Kind**: Exported function  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| tag | <code>Object</code> | element |


* * *

<a name="exp_module_parser/meta-parser--parse"></a>

## parse(path) ⇒ <code>Promise.&lt;Object&gt;</code> 
detects the meta information inside the <lecture> element

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - parsed meta information  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to a XML file |


* * *

<a name="module_parser/section-creator"></a>

# parser/section-creator
splits the LSML content into sections that can be sent to the Text-to-speech APIs

**Example**  
```js
const _ = {};
_.section_creator = require('/parser/section-creator.js');
```

* [parser/section-creator](#module_parser/section-creator)
    * [startLoop(meta, json)](#exp_module_parser/section-creator--startLoop) 
    * _private_
        * [getFrame()](#exp_module_parser/section-creator--getFrame) ⇒ <code>Object</code> 
        * [addSSMLsection()](#exp_module_parser/section-creator--addSSMLsection) 
        * [addResourceSection(tag)](#exp_module_parser/section-creator--addResourceSection) 
        * [clearCurrentContent()](#exp_module_parser/section-creator--clearCurrentContent) 
        * [addElementToContent(tag, depth)](#exp_module_parser/section-creator--addElementToContent) 
    * _public_
        * [getSections(meta, json, input_script_dir_path, configuration)](#exp_module_parser/section-creator--getSections) ⇒ <code>Promise.&lt;Object&gt;</code> 


* * *

<a name="exp_module_parser/section-creator--startLoop"></a>

## startLoop(meta, json) 
goes recursively through the JSON and splits it into sections at specific tags

**Kind**: Exported function  

| Param | Type | Description |
| --- | --- | --- |
| meta | <code>Object</code> | meta information |
| json | <code>Object</code> | JSON representation of the XML data |


* * *

<a name="exp_module_parser/section-creator--getFrame"></a>

## getFrame() ⇒ <code>Object</code> 
returns the data about the current frame that should be rendered the given section

**Kind**: Exported function  
**Returns**: <code>Object</code> - image frame information  
**Category**: private  

* * *

<a name="exp_module_parser/section-creator--addSSMLsection"></a>

## addSSMLsection() 
adds a new SSML section with the given 'current' parameters to the sections array

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_parser/section-creator--addResourceSection"></a>

## addResourceSection(tag) 
adds a new (audio, image or video) resource section to the sections array

**Kind**: Exported function  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| tag | <code>Object</code> | either a <video>, <image> or <audio> element |


* * *

<a name="exp_module_parser/section-creator--clearCurrentContent"></a>

## clearCurrentContent() 
clears the current content array of all SSML elements and text nodes from the previous section (except for all parent elements needed for the next section)

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_parser/section-creator--addElementToContent"></a>

## addElementToContent(tag, depth) 
adds an SSML element or text node to CURRENT.content array

**Kind**: Exported function  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| tag | <code>Object</code> | SSML element or text node to insert |
| depth | <code>Object</code> | depth at which to insert the element into the multi-layered 'current content' array |


* * *

<a name="exp_module_parser/section-creator--getSections"></a>

## getSections(meta, json, input_script_dir_path, configuration) ⇒ <code>Promise.&lt;Object&gt;</code> 
parses a string of XML

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - parsed data  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| meta | <code>Object</code> | meta information |
| json | <code>Object</code> | JSON representation of the XML data |
| input_script_dir_path | <code>string</code> | path to the directory where the input file is located |
| configuration | <code>Object</code> | configuration data |


* * *

<a name="module_pipeline/cli-worker"></a>

# pipeline/cli-worker
parses command line arguments and manages certain terminal-printing options

**Example**  
```js
const _ = {};
_.cli_worker = require('/pipeline/cli-worker.js');
```

* [pipeline/cli-worker](#module_pipeline/cli-worker)
    * [printStart()](#exp_module_pipeline/cli-worker--printStart) 
    * [printHelp()](#exp_module_pipeline/cli-worker--printHelp) 
    * [printVoices()](#exp_module_pipeline/cli-worker--printVoices) ⇒ <code>Promise.&lt;boolean&gt;</code> 
    * [printLanguages()](#exp_module_pipeline/cli-worker--printLanguages) ⇒ <code>Promise.&lt;boolean&gt;</code> 
    * [getArguments()](#exp_module_pipeline/cli-worker--getArguments) ⇒ <code>Object</code> 


* * *

<a name="exp_module_pipeline/cli-worker--printStart"></a>

## printStart() 
prints the start screen with information to the terminal

**Kind**: Exported function  
**Category**: public  

* * *

<a name="exp_module_pipeline/cli-worker--printHelp"></a>

## printHelp() 
prints a help menu to the terminal

**Kind**: Exported function  
**Category**: public  

* * *

<a name="exp_module_pipeline/cli-worker--printVoices"></a>

## printVoices() ⇒ <code>Promise.&lt;boolean&gt;</code> 
prints all the available Text-to-Speech voices to the terminal

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true on success  
**Category**: public  

* * *

<a name="exp_module_pipeline/cli-worker--printLanguages"></a>

## printLanguages() ⇒ <code>Promise.&lt;boolean&gt;</code> 
prints all the available Text-to-Speech languages to the terminal

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true on success  
**Category**: public  

* * *

<a name="exp_module_pipeline/cli-worker--getArguments"></a>

## getArguments() ⇒ <code>Object</code> 
returns parsed command line arguments

**Kind**: Exported function  
**Returns**: <code>Object</code> - CLI arguments  
**Category**: public  

* * *

<a name="module_pipeline/configure"></a>

# pipeline/configure
parses the configuration file and applies settings

**Example**  
```js
const _ = {};
_.configurator = require('/pipeline/configurator.js');
```

* [pipeline/configure](#module_pipeline/configure)
    * _private_
        * [loadData()](#exp_module_pipeline/configure--loadData) ⇒ <code>boolean</code> 
        * [processData(data)](#exp_module_pipeline/configure--processData) ⇒ <code>Object</code> 
    * _public_
        * [getData()](#exp_module_pipeline/configure--getData) ⇒ <code>Object</code> 


* * *

<a name="exp_module_pipeline/configure--loadData"></a>

## loadData() ⇒ <code>boolean</code> 
parses the configuration file and caches the results

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true on success  
**Category**: private  

* * *

<a name="exp_module_pipeline/configure--processData"></a>

## processData(data) ⇒ <code>Object</code> 
transforms certain configuration values for easier usage

**Kind**: Exported function  
**Returns**: <code>Object</code> - configuration data  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | configuration data |


* * *

<a name="exp_module_pipeline/configure--getData"></a>

## getData() ⇒ <code>Object</code> 
gets the data from the configuration file

**Kind**: Exported function  
**Returns**: <code>Object</code> - configuration data  
**Category**: public  

* * *

<a name="module_pipeline"></a>

# pipeline
accesses all modules to generate a video lecture from input files

**Example**  
```js
const _ = {};
_.pipeline = require('/pipeline/main.js');
```

* [pipeline](#module_pipeline)
    * _private_
        * [createOutputLog()](#exp_module_pipeline--createOutputLog) 
        * [generateSample(voice, text, type)](#exp_module_pipeline--generateSample) ⇒ <code>boolean</code> 
        * [validateInput(path)](#exp_module_pipeline--validateInput) 
        * [parseInput()](#exp_module_pipeline--parseInput) ⇒ <code>Object</code> 
        * [createDirectories()](#exp_module_pipeline--createDirectories) ⇒ <code>Promise.&lt;undefined&gt;</code> 
        * [convertVideoClips()](#exp_module_pipeline--convertVideoClips) ⇒ <code>Promise.&lt;undefined&gt;</code> 
        * [convertAudioClips()](#exp_module_pipeline--convertAudioClips) ⇒ <code>Promise.&lt;undefined&gt;</code> 
        * [createFrames()](#exp_module_pipeline--createFrames) ⇒ <code>Promise.&lt;undefined&gt;</code> 
        * [createAudio()](#exp_module_pipeline--createAudio) ⇒ <code>Promise.&lt;undefined&gt;</code> 
        * [createClips()](#exp_module_pipeline--createClips) ⇒ <code>Promise.&lt;undefined&gt;</code> 
        * [createTimestamps()](#exp_module_pipeline--createTimestamps) ⇒ <code>Promise.&lt;undefined&gt;</code> 
        * [createLecture()](#exp_module_pipeline--createLecture) ⇒ <code>Promise.&lt;undefined&gt;</code> 
        * [uploadToYoutube()](#exp_module_pipeline--uploadToYoutube) ⇒ <code>Promise.&lt;undefined&gt;</code> 
    * _public_
        * [start()](#exp_module_pipeline--start) ⇒ <code>Promise.&lt;undefined&gt;</code> 


* * *

<a name="exp_module_pipeline--createOutputLog"></a>

## createOutputLog() 
generates a file with all logs from the run-time and 
a file with the internal data in the output directory

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_pipeline--generateSample"></a>

## generateSample(voice, text, type) ⇒ <code>boolean</code> 
generates an audio sample

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true on success  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| voice | <code>string</code> | voice used to render the text |
| text | <code>string</code> | text content to be rendered as speech |
| type | <code>ssml</code> \| <code>text</code> | type of the content: either SSML or plaintext |


* * *

<a name="exp_module_pipeline--validateInput"></a>

## validateInput(path) 
creates directories for the output files

**Kind**: Exported function  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>Object</code> | absolute path to the input XML file |


* * *

<a name="exp_module_pipeline--parseInput"></a>

## parseInput() ⇒ <code>Object</code> 
parses the input file

**Kind**: Exported function  
**Returns**: <code>Object</code> - data  
**Category**: private  

* * *

<a name="exp_module_pipeline--createDirectories"></a>

## createDirectories() ⇒ <code>Promise.&lt;undefined&gt;</code> 
creates directories for the output files

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_pipeline--convertVideoClips"></a>

## convertVideoClips() ⇒ <code>Promise.&lt;undefined&gt;</code> 
converts all embedded video clips to the right codecs and settings

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_pipeline--convertAudioClips"></a>

## convertAudioClips() ⇒ <code>Promise.&lt;undefined&gt;</code> 
trims audio clips if needed

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_pipeline--createFrames"></a>

## createFrames() ⇒ <code>Promise.&lt;undefined&gt;</code> 
creates image files needed for the sections

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_pipeline--createAudio"></a>

## createAudio() ⇒ <code>Promise.&lt;undefined&gt;</code> 
creates audio for each SSML section

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_pipeline--createClips"></a>

## createClips() ⇒ <code>Promise.&lt;undefined&gt;</code> 
creates video for each SSML section

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_pipeline--createTimestamps"></a>

## createTimestamps() ⇒ <code>Promise.&lt;undefined&gt;</code> 
goes through all sections and chapters to generate timestamps at which sections begin

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_pipeline--createLecture"></a>

## createLecture() ⇒ <code>Promise.&lt;undefined&gt;</code> 
combines the section video clips and resources into one video

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_pipeline--uploadToYoutube"></a>

## uploadToYoutube() ⇒ <code>Promise.&lt;undefined&gt;</code> 
uploads the video to YouTube

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_pipeline--start"></a>

## start() ⇒ <code>Promise.&lt;undefined&gt;</code> 
scans the command line arguments, and converts the input to a video lecture

**Kind**: Exported function  
**Category**: public  

* * *

<a name="module_parser/preprocessor"></a>

# parser/preprocessor
transforms XML content and applies certain changes

**Example**  
```js
const _ = {};
_.preprocessor = require('/preprocessor/main.js');
```

* [parser/preprocessor](#module_parser/preprocessor)
    * _private_
        * [processCode(json, default_voice, lexicons, break_between_slides)](#exp_module_parser/preprocessor--processCode) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [addBreaksBetweenParagraphs(xml, duration)](#exp_module_parser/preprocessor--addBreaksBetweenParagraphs) ⇒ <code>string</code> 
    * _public_
        * [process(options)](#exp_module_parser/preprocessor--process) ⇒ <code>Promise.&lt;string&gt;</code> 


* * *

<a name="exp_module_parser/preprocessor--processCode"></a>

## processCode(json, default_voice, lexicons, break_between_slides) ⇒ <code>Promise.&lt;Object&gt;</code> 
scans through LSML code and applies specific transformations (including the removal of invalid elements, converting language elements, etc.)

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - JSON representation of XML data  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| json | <code>Object</code> | JSON representation of LSML/XML data |
| default_voice | <code>Object</code> | default voice to use for sections where no other voice is defined |
| lexicons | <code>Array.&lt;Object&gt;</code> | available lexicons that may be applied |
| break_between_slides | <code>integer</code> | break time to be added after <slide/> tags in milliseconds |


* * *

<a name="exp_module_parser/preprocessor--addBreaksBetweenParagraphs"></a>

## addBreaksBetweenParagraphs(xml, duration) ⇒ <code>string</code> 
adds <break> tags between paragraphs

**Kind**: Exported function  
**Returns**: <code>string</code> - XML data  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| xml | <code>string</code> | XML input data |
| duration | <code>integer</code> | break time in milliseconds |


* * *

<a name="exp_module_parser/preprocessor--process"></a>

## process(options) ⇒ <code>Promise.&lt;string&gt;</code> 
transforms the input XML and applies certain changes

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;string&gt;</code> - processed XML data  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.input_file | <code>string</code> | absolute path to a XML file |
| options.default_voice | <code>string</code> | default voice to use for sections with no other voice defined |
| options.lexicons | <code>Array.&lt;Object&gt;</code> | available lexicons that may be applied |
| options.break_between_slides | <code>integer</code> | break time to add between <slide/> tags in milliseconds |
| options.break_between_paragraphs | <code>integer</code> | break time to add between paragraphs in milliseconds |


* * *

<a name="module_text_to_speech/cache"></a>

# text\_to\_speech/cache
caches generated audio files


* [text_to_speech/cache](#module_text_to_speech/cache)
    * _private_
        * [readCache()](#exp_module_text_to_speech/cache--readCache) 
        * [saveCache()](#exp_module_text_to_speech/cache--saveCache) 
        * [removeIndexedNoncachedFiles()](#exp_module_text_to_speech/cache--removeIndexedNoncachedFiles) 
        * [removeNonindexedCachedFiles()](#exp_module_text_to_speech/cache--removeNonindexedCachedFiles) 
        * [removeOldFiles()](#exp_module_text_to_speech/cache--removeOldFiles) 
        * _public_
            * [setDirectory(dir)](#exp_module_text_to_speech/cache--setDirectory) ⇒ <code>boolean</code> 
            * [setExpiry(days)](#exp_module_text_to_speech/cache--setExpiry) ⇒ <code>boolean</code> 
            * [isValidMode(mode)](#exp_module_text_to_speech/cache--isValidMode) ⇒ <code>boolean</code> 
            * [clearCache()](#exp_module_text_to_speech/cache--clearCache) 
            * [isCached(id)](#exp_module_text_to_speech/cache--isCached) ⇒ <code>boolean</code> 
            * [getData(id)](#exp_module_text_to_speech/cache--getData) ⇒ <code>Object</code> 
            * [cacheData(id, data)](#exp_module_text_to_speech/cache--cacheData) ⇒ <code>string</code> 
    * _global_
        * _public_
            * [generateAudioId(options)](#exp_module_text_to_speech/cache--generateAudioId) ⇒ <code>Promise.&lt;string&gt;</code> 


* * *

<a name="exp_module_text_to_speech/cache--readCache"></a>

## readCache() 
reads the cache into memory

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_text_to_speech/cache--saveCache"></a>

## saveCache() 
cleans faulty cache entries and then
overwrites the existing cache files with the cleaned cache from memory

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_text_to_speech/cache--removeIndexedNoncachedFiles"></a>

## removeIndexedNoncachedFiles() 
removes entries from index file if the file does not exist in the cache directory

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_text_to_speech/cache--removeNonindexedCachedFiles"></a>

## removeNonindexedCachedFiles() 
overwrites the existing cache files with the current cache from memory

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_text_to_speech/cache--removeOldFiles"></a>

## removeOldFiles() 
removes cached files that are too old

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_text_to_speech/cache--setDirectory"></a>

## setDirectory(dir) ⇒ <code>boolean</code> 
sets the directoy in which the cache directory will be created, and creates a cache index file

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the assignment was successful  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| dir | <code>string</code> | path to an existing directory |


* * *

<a name="exp_module_text_to_speech/cache--setExpiry"></a>

## setExpiry(days) ⇒ <code>boolean</code> 
sets the number of days after which an audio file will be removed from the cache
if it's set to 0, cached files never expire

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the assignment was successful  
**Category**: public  

| Param | Type |
| --- | --- |
| days | <code>integer</code> | 


* * *

<a name="exp_module_text_to_speech/cache--isValidMode"></a>

## isValidMode(mode) ⇒ <code>boolean</code> 
checks a cache mode is valid

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the cache mode is valid  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| mode | <code>string</code> | cache mode |


* * *

<a name="exp_module_text_to_speech/cache--clearCache"></a>

## clearCache() 
removes all cached audio files

**Kind**: Exported function  
**Category**: public  

* * *

<a name="exp_module_text_to_speech/cache--isCached"></a>

## isCached(id) ⇒ <code>boolean</code> 
checks if a cached audio file exists for the given identifier

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true on success  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Object</code> | text to uniquely identify the audio file |


* * *

<a name="exp_module_text_to_speech/cache--getData"></a>

## getData(id) ⇒ <code>Object</code> 
reads and returns the data of a cached audio file

**Kind**: Exported function  
**Returns**: <code>Object</code> - MP3 binary data  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Object</code> | text to uniquely identify the audio file |


* * *

<a name="exp_module_text_to_speech/cache--cacheData"></a>

## cacheData(id, data) ⇒ <code>string</code> 
caches an audio file

**Kind**: Exported function  
**Returns**: <code>string</code> - MP3 binary data  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | text to uniquely identify the audio file |
| data | <code>Object</code> | MP3 binary data |


* * *

<a name="exp_module_text_to_speech/cache--generateAudioId"></a>

## generateAudioId(options) ⇒ <code>Promise.&lt;string&gt;</code> 
generates a unique ID for an audio file depending on the provided options

**Kind**: global method of [<code>text\_to\_speech/cache</code>](#module_text_to_speech/cache)  
**Returns**: <code>Promise.&lt;string&gt;</code> - ID  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.voice_name | <code>string</code> | name of the voice to render with |
| options.google_cloud_effect_profile | <code>string</code> | Google cloud effect profile that was used (only relevant for Google Cloud voices) |
| options.type | <code>ssml</code> \| <code>text</code> | type of content: either SSML or plain text |
| options.content | <code>string</code> | plain text or SSML that should be rendered as speech |


* * *

<a name="module_text_to_speech"></a>

# text\_to\_speech
communicates with speech synthesis APIs

**Example**  
```js
const _ = {};
_.tts = require('/text-to-speech/main.js');
```

* [text_to_speech](#module_text_to_speech)
    * _private_
        * [initialize()](#exp_module_text_to_speech--initialize) ⇒ <code>Promise.&lt;boolean&gt;</code> 
        * [synthesizeWithAmazonPolly(voice_name, content, type)](#exp_module_text_to_speech--synthesizeWithAmazonPolly) ⇒ <code>Promise.&lt;string&gt;</code> 
        * [synthesizeWithGoogleCloud(voice_name, content, type)](#exp_module_text_to_speech--synthesizeWithGoogleCloud) ⇒ <code>Promise.&lt;string&gt;</code> 
    * _public_
        * [setAmazonCredentials(path)](#exp_module_text_to_speech--setAmazonCredentials) ⇒ <code>boolean</code> 
        * [setGoogleCredentials(path)](#exp_module_text_to_speech--setGoogleCredentials) ⇒ <code>boolean</code> 
        * [setGoogleEffectProfile(profile)](#exp_module_text_to_speech--setGoogleEffectProfile) ⇒ <code>boolean</code> 
        * [setCacheDirectory(dir)](#exp_module_text_to_speech--setCacheDirectory) ⇒ <code>boolean</code> 
        * [setCacheExpiry(days)](#exp_module_text_to_speech--setCacheExpiry) ⇒ <code>boolean</code> 
        * [isValidCacheMode(mode)](#exp_module_text_to_speech--isValidCacheMode) ⇒ <code>boolean</code> 
        * [voiceExists(voice_name)](#exp_module_text_to_speech--voiceExists) ⇒ <code>Promise.&lt;boolean&gt;</code> 
        * [getVoices()](#exp_module_text_to_speech--getVoices) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [getVoiceAPI(voice_name)](#exp_module_text_to_speech--getVoiceAPI) ⇒ <code>Promise.&lt;string&gt;</code> 
        * [matchVoice(voice_name, language_code)](#exp_module_text_to_speech--matchVoice) ⇒ <code>Promise.&lt;string&gt;</code> 
        * [getLanguages()](#exp_module_text_to_speech--getLanguages) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [matchRegionLanguageCode(language_code)](#exp_module_text_to_speech--matchRegionLanguageCode) ⇒ <code>Promise.&lt;string&gt;</code> 
        * [getLanguageCodesForSchema()](#exp_module_text_to_speech--getLanguageCodesForSchema) ⇒ <code>Promise.&lt;string&gt;</code> 
        * [countVoicesOfLanguage(language_code)](#exp_module_text_to_speech--countVoicesOfLanguage) ⇒ <code>Promise.&lt;integer&gt;</code> 
        * [getVoicesOfLanguage(language_code)](#exp_module_text_to_speech--getVoicesOfLanguage) ⇒ <code>Promise.&lt;Object&gt;</code> 
        * [languageCodeExists(language_code)](#exp_module_text_to_speech--languageCodeExists) ⇒ <code>Promise.&lt;boolean&gt;</code> 
        * [createMP3Strictly(options)](#exp_module_text_to_speech--createMP3Strictly) ⇒ <code>Promise.&lt;integer&gt;</code> 
        * [createMP3(options)](#exp_module_text_to_speech--createMP3) ⇒ <code>Promise.&lt;integer&gt;</code> 


* * *

<a name="exp_module_text_to_speech--initialize"></a>

## initialize() ⇒ <code>Promise.&lt;boolean&gt;</code> 
initializes the text to speech clients

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true on success  
**Category**: private  

* * *

<a name="exp_module_text_to_speech--synthesizeWithAmazonPolly"></a>

## synthesizeWithAmazonPolly(voice_name, content, type) ⇒ <code>Promise.&lt;string&gt;</code> 
generates an audio binary using Amazon Polly's API

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;string&gt;</code> - audio content as binary data  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| voice_name | <code>string</code> | name of the voice to render the content with |
| content | <code>string</code> | content to be rendered as speech |
| type | <code>ssml</code> \| <code>text</code> | type of content: either SSML or plain text |


* * *

<a name="exp_module_text_to_speech--synthesizeWithGoogleCloud"></a>

## synthesizeWithGoogleCloud(voice_name, content, type) ⇒ <code>Promise.&lt;string&gt;</code> 
generates an audio binary using Google Cloud's API

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;string&gt;</code> - audio content as binary data  
**Category**: private  

| Param | Type | Description |
| --- | --- | --- |
| voice_name | <code>string</code> | name of the voice to render the content with |
| content | <code>string</code> | content to be rendered as speech |
| type | <code>ssml</code> \| <code>text</code> | type of content: either SSML or plain text |


* * *

<a name="exp_module_text_to_speech--setAmazonCredentials"></a>

## setAmazonCredentials(path) ⇒ <code>boolean</code> 
sets the file path for the AWS credentials file

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the assignment was successful  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to a file |


* * *

<a name="exp_module_text_to_speech--setGoogleCredentials"></a>

## setGoogleCredentials(path) ⇒ <code>boolean</code> 
sets the file path for the Google Cloud credentials file

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the assignment was successful  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | absolute path to a file |


* * *

<a name="exp_module_text_to_speech--setGoogleEffectProfile"></a>

## setGoogleEffectProfile(profile) ⇒ <code>boolean</code> 
sets the effect profile that should be applied to Google Cloud voices

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the assignment was successful  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| profile | <code>string</code> | name of the effects profile |


* * *

<a name="exp_module_text_to_speech--setCacheDirectory"></a>

## setCacheDirectory(dir) ⇒ <code>boolean</code> 
sets the directoy in which the cache directory will be created

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the assignment was successful  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| dir | <code>string</code> | path to an existing directory |


* * *

<a name="exp_module_text_to_speech--setCacheExpiry"></a>

## setCacheExpiry(days) ⇒ <code>boolean</code> 
sets the number of days after which an audio file will be removed from the cache

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the assignment was successful  
**Category**: public  

| Param | Type |
| --- | --- |
| days | <code>integer</code> | 


* * *

<a name="exp_module_text_to_speech--isValidCacheMode"></a>

## isValidCacheMode(mode) ⇒ <code>boolean</code> 
checks a cache mode is valid

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the cache mode is valid  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| mode | <code>string</code> | cache mode |


* * *

<a name="exp_module_text_to_speech--voiceExists"></a>

## voiceExists(voice_name) ⇒ <code>Promise.&lt;boolean&gt;</code> 
checks if a voice exists

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true if the voice exists  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| voice_name | <code>string</code> | name of the voice |


* * *

<a name="exp_module_text_to_speech--getVoices"></a>

## getVoices() ⇒ <code>Promise.&lt;Object&gt;</code> 
returns an object containing information on all the available voices

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - object with all the available voices  
**Category**: public  

* * *

<a name="exp_module_text_to_speech--getVoiceAPI"></a>

## getVoiceAPI(voice_name) ⇒ <code>Promise.&lt;string&gt;</code> 
gets the name of the API used by a given voice

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;string&gt;</code> - name of the API  
**Category**: public  

| Param | Type |
| --- | --- |
| voice_name | <code>string</code> | 


* * *

<a name="exp_module_text_to_speech--matchVoice"></a>

## matchVoice(voice_name, language_code) ⇒ <code>Promise.&lt;string&gt;</code> 
finds the most similar voice in another language

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;string&gt;</code> - name of a matching voice  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| voice_name | <code>string</code> |  |
| language_code | <code>string</code> | general or region-specific language code, e.g., 'de' or 'en-US' |


* * *

<a name="exp_module_text_to_speech--getLanguages"></a>

## getLanguages() ⇒ <code>Promise.&lt;Object&gt;</code> 
returns an object containing available general and region-specific language codes

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - available languages  
**Category**: public  

* * *

<a name="exp_module_text_to_speech--matchRegionLanguageCode"></a>

## matchRegionLanguageCode(language_code) ⇒ <code>Promise.&lt;string&gt;</code> 
returns a matching region-specific language code to a pure language code

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;string&gt;</code> - region specific language code  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| language_code | <code>string</code> | pure language code, e.g., 'en' (not region-specific codes like 'de-DE' or 'en-US') |

**Example**  
```js
await matchRegionLanguageCode('en'); // output: en-US
```

* * *

<a name="exp_module_text_to_speech--getLanguageCodesForSchema"></a>

## getLanguageCodesForSchema() ⇒ <code>Promise.&lt;string&gt;</code> 
returns valid XSD data that validates all possible language tags in an XSD schema

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;string&gt;</code> - XSD data  
**Category**: public  

* * *

<a name="exp_module_text_to_speech--countVoicesOfLanguage"></a>

## countVoicesOfLanguage(language_code) ⇒ <code>Promise.&lt;integer&gt;</code> 
counts how many voices are available for a given available language

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;integer&gt;</code> - amount of available voices for the language  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| language_code | <code>string</code> | general or region-specific language code, e.g., 'de' or 'en-US' |

**Example**  
```js
await countVoicesOfLanguage('en'); // counts all English voices
await countVoicesOfLanguage('en-US'); // counts all US-American voices
```

* * *

<a name="exp_module_text_to_speech--getVoicesOfLanguage"></a>

## getVoicesOfLanguage(language_code) ⇒ <code>Promise.&lt;Object&gt;</code> 
returns all voices available for a given language code

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - voices available for the given language code  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| language_code | <code>string</code> | general or region-specific language code, e.g., 'de' or 'en-US' |

**Example**  
```js
await getVoicesOfLanguage('en'); // returns all English voices
await getVoicesOfLanguage('en-US'); // returns all US-American voices
```

* * *

<a name="exp_module_text_to_speech--languageCodeExists"></a>

## languageCodeExists(language_code) ⇒ <code>Promise.&lt;boolean&gt;</code> 
checks if a language code exists (is available with at least one voice)

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true if the language code exists  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| language_code | <code>string</code> | general or region-specific language code, e.g., 'de' or 'en-US' |


* * *

<a name="exp_module_text_to_speech--createMP3Strictly"></a>

## createMP3Strictly(options) ⇒ <code>Promise.&lt;integer&gt;</code> 
generates a MP3 file of the given SSML and voice (does not pull the MP3 from the cache)

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;integer&gt;</code> - 1 (successfully generated), 0 (failed)  
**Category**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.output_path | <code>string</code> |  | where the generated MP3 file should be put |
| options.voice_name | <code>string</code> |  | name of the voice to render with |
| options.type | <code>ssml</code> \| <code>text</code> |  | type of content: either SSML or plain text |
| options.content | <code>string</code> |  | text that should be rendered as speech |
| [options.save_in_cache] | <code>boolean</code> | <code>true</code> | if to cache the file |


* * *

<a name="exp_module_text_to_speech--createMP3"></a>

## createMP3(options) ⇒ <code>Promise.&lt;integer&gt;</code> 
either generates a MP3 file of the given SSML and voice or returns a cached previously-generated version

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;integer&gt;</code> - 2 (loaded from cache), 1 (freshly created), 0 (failed)  
**Category**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.output_path | <code>string</code> |  | where the generated MP3 file should be put |
| options.voice_name | <code>string</code> |  | name of the voice to render with |
| options.type | <code>ssml</code> \| <code>text</code> |  | type of content: either SSML or plain text |
| options.content | <code>string</code> |  | text that should be rendered as speech |
| [options.save_in_cache] | <code>boolean</code> | <code>true</code> | if to cache the file if it was freshly generated |


* * *

<a name="module_uploader"></a>

# uploader
connects to the YouTube Data API and uploads videos

**Example**  
```js
const _ = {};
_.uploader = require('/uploader/main.js');
```

* [uploader](#module_uploader)
    * _private_
        * [initClient()](#exp_module_uploader--initClient) ⇒ <code>Promise.&lt;boolean&gt;</code> 
        * [generateNewTokenFile()](#exp_module_uploader--generateNewTokenFile) ⇒ <code>Promise.&lt;boolean&gt;</code> 
    * _public_
        * [isValidPrivacyStatus(value)](#exp_module_uploader--isValidPrivacyStatus) ⇒ <code>boolean</code> 
        * [playlistExists(credential_file, playlist_id)](#exp_module_uploader--playlistExists) ⇒ <code>Promise.&lt;boolean&gt;</code> 
        * [isUsersPlaylist(credential_file, playlist_id)](#exp_module_uploader--isUsersPlaylist) ⇒ <code>Promise.&lt;boolean&gt;</code> 
        * [videoExists(credential_file, video_id)](#exp_module_uploader--videoExists) ⇒ <code>Promise.&lt;boolean&gt;</code> 
        * [generateDescription(options)](#exp_module_uploader--generateDescription) ⇒ <code>string</code> 
        * [uploadToYoutube(options)](#exp_module_uploader--uploadToYoutube) ⇒ <code>Promise.&lt;(string\|undefined)&gt;</code> 
        * [insertIntoPlaylist(options)](#exp_module_uploader--insertIntoPlaylist) ⇒ <code>Promise.&lt;boolean&gt;</code> 


* * *

<a name="exp_module_uploader--initClient"></a>

## initClient() ⇒ <code>Promise.&lt;boolean&gt;</code> 
initializes an OAuth2 client

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true on success  
**Category**: private  

* * *

<a name="exp_module_uploader--generateNewTokenFile"></a>

## generateNewTokenFile() ⇒ <code>Promise.&lt;boolean&gt;</code> 
generates a new token file after prompting for user authorization

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true on success  
**Category**: private  

* * *

<a name="exp_module_uploader--isValidPrivacyStatus"></a>

## isValidPrivacyStatus(value) ⇒ <code>boolean</code> 
checks if a value is a valid privacy status value

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true, if the value is valid  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | information about the authors of the lecture |


* * *

<a name="exp_module_uploader--playlistExists"></a>

## playlistExists(credential_file, playlist_id) ⇒ <code>Promise.&lt;boolean&gt;</code> 
checks if a YouTube playlist is viewable by the channel belonging to the credentials
 will be true for all public playlists, as well as private/unlisted playlists of the authenticated channel

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true, if the playlist exists  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| credential_file | <code>string</code> | absolute path to the YouTube credentials file |
| playlist_id | <code>string</code> | id of the YouTube playlist |


* * *

<a name="exp_module_uploader--isUsersPlaylist"></a>

## isUsersPlaylist(credential_file, playlist_id) ⇒ <code>Promise.&lt;boolean&gt;</code> 
checks if a YouTube playlist is owned by the channel belonging to the credentials

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true, if the playlist exists  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| credential_file | <code>string</code> | absolute path to the YouTube credentials file |
| playlist_id | <code>string</code> | id of the YouTube playlist |


* * *

<a name="exp_module_uploader--videoExists"></a>

## videoExists(credential_file, video_id) ⇒ <code>Promise.&lt;boolean&gt;</code> 
checks if a YouTube video exists
 will be true for all public videos, as well as private/unlisted playlists of the authenticated channel

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true, if the video exists  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| credential_file | <code>string</code> | absolute path to the YouTube credentials file |
| video_id | <code>string</code> | id of the YouTube video |


* * *

<a name="exp_module_uploader--generateDescription"></a>

## generateDescription(options) ⇒ <code>string</code> 
generates a YouTube description with timestamps for chapters

**Kind**: Exported function  
**Returns**: <code>string</code> - YouTube video description  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.description | <code>string</code> | main passage that describes the video |
| [options.copyright] | <code>string</code> | copyright information about the video |
| [options.authors] | <code>string</code> | information about the authors of the lecture |
| [options.chapters] | <code>Array.&lt;Object&gt;</code> | definitions at which timestamps chapters begin |


* * *

<a name="exp_module_uploader--uploadToYoutube"></a>

## uploadToYoutube(options) ⇒ <code>Promise.&lt;(string\|undefined)&gt;</code> 
uploads a video to YouTube

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;(string\|undefined)&gt;</code> - returns YouTube id to where the video was uploaded on success  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.credential_file | <code>string</code> | absolute path to the YouTube credentials file |
| options.input_path | <code>string</code> | absolute path to a video file |
| options.title | <code>string</code> | title of the YouTube video |
| options.description | <code>string</code> | description of the YouTube video |
| options.privacy_status | <code>public</code> \| <code>private</code> \| <code>unlisted</code> | privacy status of the YouTube video |


* * *

<a name="exp_module_uploader--insertIntoPlaylist"></a>

## insertIntoPlaylist(options) ⇒ <code>Promise.&lt;boolean&gt;</code> 
checks if a YouTube playlist on the user's channel exists for the given ID

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true on success  
**Category**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | absolute path to the YouTube credentials file |
| options.credential_file | <code>string</code> |  | absolute path to the YouTube credentials file |
| options.video_id | <code>string</code> |  | id of the YouTube video to be inserted |
| options.playlist_id | <code>string</code> |  | id of the YouTube playlist |
| [options.position] | <code>integer</code> | <code>0</code> | position greater than 0 at which to insert the video into the playlist |


* * *

<a name="module_validator"></a>

# validator
validates the LSML input using a XSD schema

**Example**  
```js
const _ = {};
_.validator = require('/validator/main.js');
```

* [validator](#module_validator)
    * _private_
        * [callXJParse()](#exp_module_validator--callXJParse) ⇒ <code>string</code> \| <code>Promise.&lt;Object&gt;</code> 
    * _public_
        * [getSchemaPath()](#exp_module_validator--getSchemaPath) ⇒ <code>string</code> 
        * [clearTemporaryFiles()](#exp_module_validator--clearTemporaryFiles) 
        * [validate(options)](#exp_module_validator--validate) ⇒ <code>Promise.&lt;boolean&gt;</code> 


* * *

<a name="exp_module_validator--callXJParse"></a>

## callXJParse() ⇒ <code>string</code> \| <code>Promise.&lt;Object&gt;</code> 
calls the XJParse library with a given XML file and XSD schema

**Kind**: Exported function  
**Returns**: <code>string</code> - file path<code>Promise.&lt;Object&gt;</code> - output from the library  
**Category**: private  
**Example**  
```js
await callXJParse(xml_file_path, schema_file_path);
// output:
// {
//   error  : null,
//   stdout : '...',
//   stderr : '...'
// }
```

* * *

<a name="exp_module_validator--getSchemaPath"></a>

## getSchemaPath() ⇒ <code>string</code> 
gets the path to the XSD schema used by the validator

**Kind**: Exported function  
**Returns**: <code>string</code> - file path  
**Category**: public  

* * *

<a name="exp_module_validator--clearTemporaryFiles"></a>

## clearTemporaryFiles() 
clears all temporary files created by the validator that are still present

**Kind**: Exported function  
**Category**: public  

* * *

<a name="exp_module_validator--validate"></a>

## validate(options) ⇒ <code>Promise.&lt;boolean&gt;</code> 
validates an input LSML file

**Kind**: Exported function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true if the LSML file is valid  
**Category**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.xml_path | <code>string</code> |  | absolute path to the XML file |
| [options.print_errors] | <code>boolean</code> | <code>true</code> | if set to true, will print validation errors |
| [options.print_results] | <code>boolean</code> | <code>true</code> | if set to true, will print message the including validation result |
| [options.keep_temp_files] | <code>boolean</code> | <code>false</code> | if set to true, will keep temporary XML files generated for validation, if the validation fails with an error |


* * *

<a name="module_validator/tests"></a>

# validator/tests
testing suite for the validator


* [validator/tests](#module_validator/tests)
    * [addAllTags()](#exp_module_validator/tests--addAllTags) ⇒ <code>string</code> \| <code>string</code> 
    * [addLectureTag()](#exp_module_validator/tests--addLectureTag) ⇒ <code>string</code> \| <code>string</code> 
    * [addInfoTag()](#exp_module_validator/tests--addInfoTag) ⇒ <code>string</code> \| <code>string</code> 
    * [addSettingsTag()](#exp_module_validator/tests--addSettingsTag) ⇒ <code>string</code> \| <code>string</code> 
    * [addDeckTag()](#exp_module_validator/tests--addDeckTag) ⇒ <code>string</code> \| <code>string</code> 
    * [runPassingTests()](#exp_module_validator/tests--runPassingTests) ⇒ <code>Promise.&lt;undefined&gt;</code> 
    * [runFailingTests()](#exp_module_validator/tests--runFailingTests) ⇒ <code>Promise.&lt;undefined&gt;</code> 


* * *

<a name="exp_module_validator/tests--addAllTags"></a>

## addAllTags() ⇒ <code>string</code> \| <code>string</code> 
adds a valid <lecture>, <info />, <settings /> and <deck /> element to an XML string

**Kind**: Exported function  
**Returns**: <code>string</code> - xml - input XML string<code>string</code> - output XML string  
**Category**: private  

* * *

<a name="exp_module_validator/tests--addLectureTag"></a>

## addLectureTag() ⇒ <code>string</code> \| <code>string</code> 
wraps the given XML into a valid <lecture> element

**Kind**: Exported function  
**Returns**: <code>string</code> - xml - input XML string<code>string</code> - output XML string  
**Category**: private  

* * *

<a name="exp_module_validator/tests--addInfoTag"></a>

## addInfoTag() ⇒ <code>string</code> \| <code>string</code> 
adds a valid <info /> element to an XML string

**Kind**: Exported function  
**Returns**: <code>string</code> - xml - input XML string<code>string</code> - output XML string  
**Category**: private  

* * *

<a name="exp_module_validator/tests--addSettingsTag"></a>

## addSettingsTag() ⇒ <code>string</code> \| <code>string</code> 
adds a valid <settings /> element to an XML string

**Kind**: Exported function  
**Returns**: <code>string</code> - xml - input XML string<code>string</code> - output XML string  
**Category**: private  

* * *

<a name="exp_module_validator/tests--addDeckTag"></a>

## addDeckTag() ⇒ <code>string</code> \| <code>string</code> 
adds a valid <deck /> element to an XML string

**Kind**: Exported function  
**Returns**: <code>string</code> - xml - input XML string<code>string</code> - output XML string  
**Category**: private  

* * *

<a name="exp_module_validator/tests--runPassingTests"></a>

## runPassingTests() ⇒ <code>Promise.&lt;undefined&gt;</code> 
runs all defined tests that should pass

**Kind**: Exported function  
**Category**: private  

* * *

<a name="exp_module_validator/tests--runFailingTests"></a>

## runFailingTests() ⇒ <code>Promise.&lt;undefined&gt;</code> 
runs all defined tests that should fail

**Kind**: Exported function  
**Category**: private  

* * *

<a name="module_video_manager"></a>

# video\_manager
manages acceptable parameters for video file generation

**Example**  
```js
const _ = {};
_.video = require('/video-manager/main.js');
```

* [video_manager](#module_video_manager)
    * [isValidWidth(value)](#exp_module_video_manager--isValidWidth) ⇒ <code>boolean</code> 
    * [isValidHeight(value)](#exp_module_video_manager--isValidHeight) ⇒ <code>boolean</code> 
    * [isValidResolution(value)](#exp_module_video_manager--isValidResolution) ⇒ <code>boolean</code> 
    * [isValidFPS(value)](#exp_module_video_manager--isValidFPS) ⇒ <code>boolean</code> 
    * [parseResolutionString(resolution)](#exp_module_video_manager--parseResolutionString) ⇒ <code>Object</code> 


* * *

<a name="exp_module_video_manager--isValidWidth"></a>

## isValidWidth(value) ⇒ <code>boolean</code> 
checks if a given value is a valid video width

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is a valid width  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>integer</code> | 


* * *

<a name="exp_module_video_manager--isValidHeight"></a>

## isValidHeight(value) ⇒ <code>boolean</code> 
checks if a given value is a valid video height

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is a valid height  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>integer</code> | 


* * *

<a name="exp_module_video_manager--isValidResolution"></a>

## isValidResolution(value) ⇒ <code>boolean</code> 
checks if a given value is a valid resolution

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is a valid resolution  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | resolution, e.g., "1280x720" |


* * *

<a name="exp_module_video_manager--isValidFPS"></a>

## isValidFPS(value) ⇒ <code>boolean</code> 
checks if a given value is a valid FPS value

**Kind**: Exported function  
**Returns**: <code>boolean</code> - true if the value is a valid FPS value  
**Category**: public  

| Param | Type |
| --- | --- |
| value | <code>integer</code> | 


* * *

<a name="exp_module_video_manager--parseResolutionString"></a>

## parseResolutionString(resolution) ⇒ <code>Object</code> 
parses a resolution string and returns width and height as an object

**Kind**: Exported function  
**Returns**: <code>Object</code> - parsed resolution  
**Category**: public  

| Param | Type | Description |
| --- | --- | --- |
| resolution | <code>string</code> | resolution string, e.g., "1280x720" or "1920x1080" |

**Example**  
```js
parseResolutionString("1280x720");
// output:
// {
//   width : 1280,
//   height : 720
// }
```

* * *

