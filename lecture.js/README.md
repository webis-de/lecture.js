[![Logo text colored with blue gradient saying "lecture.js"](doc/img/logo_small.png)](#)

Lecture.js is a tool to convert PDF slides and scripts to spoken video lectures using advanced text-to-speech services from Amazon and Google. It implements a custom XML-based language, the Lecture Synthesis Markup Language (LSML), which supports the integration of PDF slides, controlling the voice and language, embedding of images, audio and video clips, and video quality settings.

# How to use

1. [Installation](doc/installation.md)
2. [How to use](doc/how-to-use.md)
3. [Documentation](doc/README.md)

# Structure

This project uses multiple libraries and additional tools, which are downloaded into `/src/node_modules/` upon running the installation script. The `/src/.global/` directory contains scripts that may be used by multiple of the other modules contained in `/src/`.

Here's a brief explanation of the structure of this directory:

- `doc/` contains documentation
    - `generate.js` generates documentation markdown files for the public/private functions of the source code
- `input/` contains sample input files
- `output/` can be used as an output directory
- `src/` contains the source code
    - `.global/` contains utility scripts used by multiple other scripts
    - `node_modules/` contains globally used npm modules
        - [`aws-sdk`](https://www.npmjs.com/package/aws-sdk): client for Amazon Polly Text-to-Speech
        - [`canvas`](https://www.npmjs.com/package/canvas): simulates a HTML canvas
        - [`ffmpeg-static`](https://www.npmjs.com/package/ffmpeg-static) : provides a static build of FFmpeg for the user's operating system
        - [`ffprobe-static`](https://www.npmjs.com/package/ffprobe-static) : provides a static build of FFprobe for the user's operating system
        - [`googleapis`](https://www.npmjs.com/package/googleapis): client library for using Google APIs
        - [`@google-cloud/text-to-speech`](https://www.npmjs.com/package/@google-cloud/text-to-speech): client for Google Cloud Text-to-Speech
        - [`ini`](https://www.npmjs.com/package/ini): parser for ini files
        - [`is-online`](https://www.npmjs.com/package/is-online): checks if an internet connection can be established
        - [`lz-string`](https://www.npmjs.com/package/lz-string): implements LZ-based string compression
        - [`mri`](https://www.npmjs.com/package/mri): parser for CLI flags and arguments
        - [`open`](https://www.npmjs.com/package/open): execution of other OS apps like opening a URL in a browser
        - [`pdfjs-dist`](https://www.npmjs.com/package/pdfjs-dist): generic build of Mozilla's [pdf.js](https://github.com/mozilla/pdf.js) PDF reader
        - [`xml-js`](https://www.npmjs.com/package/xml-js): converter between XML and JSON
        - *+ dependencies*
    - `parser/` module for parsing LSML
    - `pipeline/` module that runs the lecture.js pipeline to generate a video lecture
        - `config.ini` contains configuration for the pipeline
    - `preprocessor/` transforms LSML content and applies certain changes
    - `text-to-speech/` module for communicating with the Text-to-Speech APIs
    - `uploader/` module for communicating with and uploading to YouTube
    - `validator/` module for validating LSML
        - [`xjparse`](https://github.com/ndw/xjparse): wrapper for [Xerces J](http://xerces.apache.org/xerces-j/) that allows for XSD (XML schema) validation
    - `video-manager/` module managing valid video parameters
- `lecture.js` main script; if executed runs the complete pipeline
- `stats.js` if executed, collects some statistical information about the source code
- `install.js` if executed, installs missing Node modules