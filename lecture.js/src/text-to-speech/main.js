/**
 * @module text_to_speech
 * @desc communicates with speech synthesis APIs
 *
 * @example
 * const _ = {};
 * _.tts = require('/text-to-speech/main.js');
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

// utility scripts
_.basic  = require('../.global/basic-utilities.js');
_.type   = require('../.global/type-tests.js');
_.logger = require('../.global/logger.js');

// text-to-speech sub-modules
_.cache = require('./caching.js');

// npm modules
_.lz_string = require('lz-string');

// load the Amazon Web Services library
//  https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-your-credentials.html
_.aws = require('aws-sdk');

// load the Google Cloud Text-to-Speech library
// https://www.npmjs.com/package/@google-cloud/text-to-speech#before-you-begin
// https://cloud.google.com/docs/authentication/getting-started#auth-cloud-implicit-nodejs
_.google_cloud = require('@google-cloud/text-to-speech');



/*
 * =========
 * CONSTANTS
 * =========
 */

// valid effect profiles for Google Cloud voices
//  can be found here: https://cloud.google.com/text-to-speech/docs/audio-profiles#available_audio_profiles
const GOOGLE_EFFECT_PROFILES = [
    'wearable-class-device',
    'handset-class-device',
    'headphone-class-device',
    'small-bluetooth-speaker-class-device',
    'medium-bluetooth-speaker-class-device',
    'large-home-entertainment-class-device',
    'large-automotive-class-device',
    'telephony-class-application'
];

const EOL = _.os.EOL;



/*
 * ===========
 * DEFINITIONS
 * ===========
 */

// checks if the Text-to-Speech clients were already initialized
let IS_INITIALIZED = false;

// location of the AWS credentials file and initialized the client
let AWS_CREDENTIALS = ''
let AWS_CLIENT = null;

// location of the Google Cloud credentials file and initialized the client
let GOOGLE_CLOUD_CREDENTIALS = '';
let GOOGLE_CLOUD_CLIENT = null;

// the id of the effect profile that should be applied when synthesizing
let GOOGLE_CLOUD_EFFECT_PROFILE = '';

// holds all voices
const VOICES = {};
/*
    "example-voice-key" : {
        name     : name-used-by-api,
        gender   : MALE|FEMALE|NEUTRAL,
        language : en-US,
        api      : google-cloud
    }
*/



/*
 * =================
 * PRIVATE FUNCTIONS
 * =================
 */

/**
 * initializes the text to speech clients
 *
 * @async
 * @function
 * @alias module:text_to_speech
 * @category private
 * 
 * @returns {Promise.<boolean>} true on success
 */
const initialize = async() => {
    
    // if already initialized, return
    if (IS_INITIALIZED) return true;
    IS_INITIALIZED = true;
    
    const aws_credentials_exist = _.basic.isFile(AWS_CREDENTIALS, '.json');
    const google_credentials_exist = _.basic.isFile(GOOGLE_CLOUD_CREDENTIALS, '.json');
    
    if (
        !aws_credentials_exist &&
        !google_credentials_exist
    ) {
        _.logger.error(`Neither an AWS or Google Cloud JSON credentials file exists`);
        return false;
    }
    else if (!aws_credentials_exist) {
        _.logger.warn(`Amazon Polly voices can't be used, because there is no existing credentials file at "${AWS_CREDENTIALS}"`);
    }
    else if (!google_credentials_exist) {
        _.logger.warn(`Google Cloud voices can't be used, because there is no existing credentials file at "${GOOGLE_CLOUD_CREDENTIALS}"`);
    }
    
    // temporarily saves voice definitions collected from the APIs
    let unordered_voices = {};
    let error = false;

    // create Google Cloud client and get voices
    if (google_credentials_exist) {
        
        try {
            // set environment variable pointing to the credentials file
            process.env.GOOGLE_APPLICATION_CREDENTIALS = GOOGLE_CLOUD_CREDENTIALS;
            // create Google Cloud client
            GOOGLE_CLOUD_CLIENT = new _.google_cloud.TextToSpeechClient();
        }
        catch (err) {
            _.logger.error(`Failed to initialize a Google Cloud Text-to-Speech client, because: ${err}`);
            error = true;
        }
        
        try {
            // get Google voice definitions from the API
            const [result] = await GOOGLE_CLOUD_CLIENT.listVoices({});

            result.voices.forEach(voice => {
                const key = 'google-' + voice.name.toLowerCase();
                unordered_voices[key] = {
                    name     : voice.name,
                    language : voice.languageCodes[0],
                    gender   : voice.ssmlGender,
                    api      : 'google-cloud'
                };
            });
        }
        // error may happen, if the linked credentials files are invalid or incorrect
        catch (err) {
            _.logger.error(`Failed to load voice of the Google Cloud Text-to-Speech client, because: ${err}`);
            error = true;
        }
    
    }

    // create Amazon Polly client and get voices
    if (aws_credentials_exist) {
        try {
            _.aws.config.loadFromPath(AWS_CREDENTIALS);
            _.aws.config.update({
                region : 'us-west-2'
            });
            AWS_CLIENT = new _.aws.Polly({
                signatureVersion: 'v4'
            });
        }
        catch (err) {
            _.logger.error(`Failed to initialize an Amazon Polly client, because: ${err}`);
            error = true;
        }
        
        // get Amazon Polly voice definitions from the API
        await new Promise(resolve => {
            AWS_CLIENT.describeVoices({}, (err, data) => {
                // error may happen, if the linked credentials files are invalid or incorrect
                if (err || data === null) {
                    _.logger.error(`Failed to load voice of the Amazon Polly client, because: ${err}`);
                    error = true;
                    return resolve();
                }
                data.Voices.forEach(voice => {
                    const key = 'amazon-' + (voice.LanguageCode+'-'+voice.Id).toLowerCase();
                    unordered_voices[key] = {
                        name     : voice.Id,
                        language : voice.LanguageCode,
                        gender   : voice.Gender,
                        api      : 'amazon-polly'
                    };
                });
                resolve();
            });
        });
    }

    // check if any voice definitions were loaded
    if (error) {
        return false;
    }

    // check if any voice definitions were loaded
    if (Object.keys(unordered_voices).length === 0) {
        _.logger.error(`Failed loading any voice definitions from the Text-to-speech APIs`);
        return false;
    }

    // sort the voices by language
    let ordered_voice_keys = Object.keys(unordered_voices).sort((name1, name2) => {

        const lang1 = unordered_voices[name1].language.toUpperCase();
        const lang2 = unordered_voices[name2].language.toUpperCase();
        const gender1 = unordered_voices[name1].gender.toUpperCase();
        const gender2 = unordered_voices[name2].gender.toUpperCase();

        // first sort by language
        if (lang1 !== lang2) {
            return lang1 > lang2 ? 1 : -1;
        }

        // if language is the same, sort by gender
        if (gender1 !== gender2) {
            return gender1 > gender2 ? 1 : -1;
        }

        // if language and gender are the same, sort by name
        return name1.localeCompare(name2);
    });

    // assign ordered voice objects, object by object, to global voices object
    ordered_voice_keys.forEach(key => {
        VOICES[key] = unordered_voices[key];
    });
        
    return true;
};

/**
 * generates an audio binary using Amazon Polly's API
 *
 * @async
 * @function
 * @alias module:text_to_speech
 * @category private
 * 
 * @param {string} voice_name - name of the voice to render the content with
 * @param {string} content - content to be rendered as speech
 * @param {ssml|text} type - type of content: either SSML or plain text
 * @returns {Promise.<string>} audio content as binary data
 */
const synthesizeWithAmazonPolly = async(voice_name, content, type) => {
    
    if (!_.basic.isFile(AWS_CREDENTIALS, '.json')) {
        _.logger.error(`Can't synthesize voice "${voice_name}" with Amazon Polly, because no credentials file for AWS exists at "${AWS_CREDENTIALS}"`);
        return;
    }
        
    if (!_.type.isString(voice_name) || voice_name === '') {
        _.logger.error(`Expected a voice name as a string, but got ${_.type.of(voice_name)} "${voice_name}"`);
        return;
    }

    if (!_.type.isString(content) || content === '') {
        _.logger.error(`Expected content as a string, but got ${_.type.of(content)} "${content}"`);
        return;
    }
        
    if (!_.type.isString(type) || !['ssml','text'].includes(type)) {
        _.logger.error(`Expected type as a string 'ssml' or 'text', but got ${_.type.of(type)} "${type}"`);
        return;
    }

    // get voice properties
    let voice = VOICES[voice_name];
    
    const request = {
        TextType     : type,
        Text         : content,
        OutputFormat : 'mp3',
        VoiceId      : voice.name
    };
    
    return new Promise(resolve => {

        AWS_CLIENT.synthesizeSpeech(request, (err, data) => {
            
            if (err) {
                _.logger.error(`Failed synthesizing speech for voice "${voice_name}" and content type "${type}", because: ${err}. Content in question is: "${content}"`);
                return resolve();
            }
            
            if (data && data.AudioStream instanceof Buffer) {
                return resolve(data.AudioStream);
            }
            
            _.logger.error(`Failed synthesizing speech for voice "${voice_name}" and content type "${type}", because API responded with non-buffer data as an audio stream: ${data}. Content in question is: "${content}"`);
            resolve();
        });
    });
};

/**
 * generates an audio binary using Google Cloud's API
 *
 * @async
 * @function
 * @alias module:text_to_speech
 * @category private
 * 
 * @param {string} voice_name - name of the voice to render the content with
 * @param {string} content - content to be rendered as speech
 * @param {ssml|text} type - type of content: either SSML or plain text
 * @returns {Promise.<string>} audio content as binary data
 */
const synthesizeWithGoogleCloud = async(voice_name, content, type) => {
    
    if (!_.basic.isFile(GOOGLE_CLOUD_CREDENTIALS, '.json')) {
        _.logger.error(`Can't synthesize voice "${voice_name}" with Google Cloud, because no credentials file for Google Cloud exists at "${GOOGLE_CLOUD_CREDENTIALS}"`);
        return;
    }
        
    if (!_.type.isString(voice_name) || voice_name === '') {
        _.logger.error(`Expected a voice name as a string, but got ${_.type.of(voice_name)} "${voice_name}"`);
        return;
    }

    if (!_.type.isString(content) || content === '') {
        _.logger.error(`Expected content as a string, but got ${_.type.of(content)} "${content}"`);
        return;
    }
        
    if (!_.type.isString(type) || !['ssml','text'].includes(type)) {
        _.logger.error(`Expected type as a string 'ssml' or 'text', but got ${_.type.of(type)} "${type}"`);
        return;
    }

    // get voice properties
    let voice = VOICES[voice_name];
    
    // assign the content and content type
    const input = {};
    if (type === 'ssml') input.ssml = content;
    else if (type === 'text') input.text = content;

    // construct the request
    const request = {
        input : input,
        // Select the language and SSML voice gender (optional)
        voice : {
            name         : voice.name,
            languageCode : 'en-US',//voice.language,
            ssmlGender   : voice.gender
        },
        // select the type of audio encoding
        audioConfig : {
            audioEncoding : 'MP3'
        }
    };
    
    // request the set google cloud effects profile, if it's a valid profile
    if (GOOGLE_EFFECT_PROFILES.includes(GOOGLE_CLOUD_EFFECT_PROFILE)) {
        request.audioConfig.effectsProfileId = [GOOGLE_CLOUD_EFFECT_PROFILE];
    }

    // performs the text-to-speech request
    const [response] = await GOOGLE_CLOUD_CLIENT.synthesizeSpeech(request);
    
    return response.audioContent;
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
     * sets the file path for the AWS credentials file
     *
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {string} path - absolute path to a file
     * @returns {boolean} true if the assignment was successful
     */
    setAmazonCredentials : path => {
        
        if (!_.type.isString(path) || !_.basic.isFile(path)) {
            return false;
        }
        
        AWS_CREDENTIALS = path;
        return true;
    },
    
    /**
     * sets the file path for the Google Cloud credentials file
     *
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {string} path - absolute path to a file
     * @returns {boolean} true if the assignment was successful
     */
    setGoogleCredentials : path => {
        
        if (!_.type.isString(path) || !_.basic.isFile(path)) {
            return false;
        }
        
        GOOGLE_CLOUD_CREDENTIALS = path;
        return true;
    },
    
    /**
     * sets the effect profile that should be applied to Google Cloud voices
     *
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {string} profile - name of the effects profile
     * @returns {boolean} true if the assignment was successful
     */
    setGoogleEffectProfile : profile => {
        
        if (!_.type.isString(profile) || !GOOGLE_EFFECT_PROFILES.includes(profile)) {
            return false;
        }
        
        GOOGLE_CLOUD_EFFECT_PROFILE = profile;
        return true;
    },
    
    /**
     * sets the directoy in which the cache directory will be created
     *
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {string} dir - path to an existing directory
     * @returns {boolean} true if the assignment was successful
     */
    setCacheDirectory : dir => {
        return _.cache.setDirectory(dir);
    },
    
    /**
     * sets the number of days after which an audio file will be removed from the cache
     *
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {integer} days
     * @returns {boolean} true if the assignment was successful
     */
    setCacheExpiry : days => {
        return _.cache.setExpiry(days);
    },
    
    /**
     * checks a cache mode is valid
     *
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {string} mode - cache mode
     * @returns {boolean} true if the cache mode is valid
     */
    isValidCacheMode : mode => {
        return _.cache.isValidMode(mode);
    },
    
    
    
    /*
     * VOICES
     */
    
    /**
     * checks if a voice exists
     *
     * @async
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {string} voice_name - name of the voice
     * @returns {Promise.<boolean>} true if the voice exists
     */
    voiceExists : async(voice_name) => {
        
        if (!_.type.isString(voice_name)) {
            _.logger.error(`Expected a voice name as a string, but got ${_.type.of(voice_name)} "${voice_name}"`);
            return;
        }
        
        // ------------
        
        // initialize clients
        if (!(await initialize())) {
            _.logger.error(`Failed initializing the clients`);
            return;
        }
        
        // check if the voice is defined
        return Boolean(VOICES[voice_name]);
    },
    
    /**
     * returns an object containing information on all the available voices
     *
     * @async
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @returns {Promise.<Object>} object with all the available voices
     */
    getVoices : async() => {
        
        // initialize clients
        if (!(await initialize())) {
            _.logger.error(`Failed initializing the clients`);
            return;
        }
        
        return _.basic.deepCopy(VOICES);
    },
    
    /**
     * gets the name of the API used by a given voice
     *
     * @async
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {string} voice_name
     * @returns {Promise.<string>} name of the API
     */
    getVoiceAPI : async(voice_name) => {
        
        if (!_.type.isString(voice_name) || voice_name === '') {
            _.logger.error(`Expected a voice as a string, but got ${_.type.of(voice_name)} "${voice_name}"`);
            return;
        }
        
        // ------------
        
        // initialize clients
        if (!(await initialize())) {
            _.logger.error(`Failed initializing the clients`);
            return;
        }
        
        const voice = VOICES[voice_name];
        
        if (!voice) {
            _.logger.error(`Voice "${voice_name}" does not exist`);
            return;
        }
        
        return voice.api;
    },
    
    /**
     * finds the most similar voice in another language
     *
     * @async
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {string} voice_name
     * @param {string} language_code - general or region-specific language code, e.g., 'de' or 'en-US'
     * @returns {Promise.<string>} name of a matching voice
     */
    matchVoice : async(voice_name, language_code) => {
        
        if (!_.type.isString(voice_name) || voice_name === '') {
            _.logger.error(`Expected a voice as a string, but got ${_.type.of(voice_name)} "${voice_name}"`);
            return;
        }
        
        if (!_.type.isString(language_code) || language_code === '') {
            _.logger.error(`Expected a language code as a string, but got ${_.type.of(language_code)} "${language_code}"`);
            return;
        }
        
        if (!(await __public.languageCodeExists(language_code))) {
            _.logger.error(`Language code '${language_code}' is not valid`);
            return;
        }
        
        // ------------
        
        // get the voice definition
        let voice = VOICES[voice_name];
        
        if (!voice) {
            _.logger.error(`Voice "${voice_name}" does not exist`);
            return;
        }
        
        let voices_in_language = await __public.getVoicesOfLanguage(language_code);
        
        if (_.basic.getLength(voices_in_language) == 0) {
            _.logger.error(`Language code "${language_code}" has no available voices`)
            return;
        }
        
        // assign points to the voices depending on certain properties
        await _.basic.forEachAsync(Object.keys(voices_in_language), async(language_voice_name) => {
            
            let compare_voice = voices_in_language[language_voice_name];
            compare_voice.points = 0;
            
            if (voice.gender == compare_voice.gender) {
                compare_voice.points += 15;
            }
            
            if (voice.api == compare_voice.api) {
                compare_voice.points += 5;
            }
            
            // give extra points if a language code has more voices
            // e.g., en-US has more voices than en-IN
            // this helps in giving the most used voice variant additional points
            compare_voice.points += await __public.countVoicesOfLanguage(compare_voice.language);
            
            // match the voice name for similarities
            compare_voice.points += _.basic.getStringSimilarity(language_voice_name, voice_name) * 5;
            
            // reduce numbers after comma
            compare_voice.points = parseFloat(compare_voice.points.toFixed(5));
        });
        
        // get the voice with the highest points
        let closest_voice = '';
        Object.keys(voices_in_language).forEach(voice_name => {
            let compare_voice_points = voices_in_language[closest_voice] ? voices_in_language[closest_voice].points : 0;
            let voice_points = voices_in_language[voice_name].points;
            
            if (voice_points > compare_voice_points) {
                closest_voice = voice_name;
            }
        });
        
        // return the name of the voice with the highest points
        return closest_voice;
    },
    
    
    
    /*
     * LANGUAGES
     */
    
    /**
     * returns an object containing available general and region-specific language codes
     *
     * @async
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @returns {Promise.<Object>} available languages
     */
    getLanguages : async() => {
        
        // initialize clients
        if (!(await initialize())) {
            _.logger.error(`Failed initializing the clients`);
            return;
        }
        
        let languages = {
            all : [],
            codes : [],
            region_codes : []
        };
        
        Object.keys(VOICES).forEach(voice_name => {
            
            let voice = VOICES[voice_name];
            
            // remove region from language code
            let no_region = voice.language.replace(/\-.*$/, '');
            
            if (!languages.all.includes(no_region)) {
                languages.all.push(no_region);
                languages.codes.push(no_region);
            }
            
            // add region-specific codes
            if (!languages.all.includes(voice.language)) {
                languages.all.push(voice.language);
                languages.region_codes.push(voice.language);
            }
        });
        
        // sort the languages alphabetically
        languages.all.sort();
        languages.codes.sort();
        languages.region_codes.sort();
        
        return languages;
    },
    
    /**
     * returns a matching region-specific language code to a pure language code
     *
     * @async
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {string} language_code - pure language code, e.g., 'en' (not region-specific codes like 'de-DE' or 'en-US')
     * @returns {Promise.<string>} region specific language code
     * 
     * @example
     * await matchRegionLanguageCode('en'); // output: en-US
     */
    matchRegionLanguageCode : async(language_code) => {
        
        if (!_.type.isString(language_code) || language_code === '') {
            _.logger.error(`Expected a language code as a string, but got ${_.type.of(language_code)} "${language_code}"`);
            return;
        }

        let language_codes = await __public.getLanguages();
        
        if (!language_codes) {
            _.logger.error(`Failed obtaining language codes`);
            return;
        }
        
        if (!language_codes.all.includes(language_code)) {
            _.logger.error(`Language code "${language_code}" is not valid`);
            return;
        }
        
        // ------------
        
        // return the code, if the given language code is already region-specific
        // e.g., only accept codes like 'en' or 'de', not 'en-US' or 'de-DE'
        if (language_code.match(/\-/)) {
            return language_code;
        }
        
        // reduce language_codes array to only region-specific language codes matching to the given language code
        // e.g., if 'en' is given, match codes like 'en-AU', 'en-GB', 'en-US', etc...
        const lang_code_regex = new RegExp('^'+language_code+'\-');
        language_codes = language_codes.all.filter(code => code.match(lang_code_regex));
        
        // count the number of voices contained in each language code
        for (let i = 0, len = language_codes.length; i < len; i++) {
            let code = language_codes[i];
            language_codes[i] = {
                code : code,
                voice_amount : await __public.countVoicesOfLanguage(code) 
            };
        };
        
        // select the region-specific language code with the most voices
        language_codes = language_codes.sort((code1, code2) => {
            return code1.voice_amount > code2.voice_amount ? -1 : 1;
        });
        
        // return the language code with the most defined voices
        return language_codes[0].code;
    },
    
    /**
     * returns valid XSD data that validates all possible language tags in an XSD schema 
     *
     * @async
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @returns {Promise.<string>} XSD data
     */
    getLanguageCodesForSchema : async() => {

        let language_codes = await __public.getLanguages();
        
        if (!language_codes) {
            _.logger.error(`Failed obtaining language codes`);
            return;
        }
        
        // ------------
        
        let definitions = '';
        let references = '';
        
        language_codes.all.forEach(code => {
            definitions += `<xs:element name="${code}"/>`;
            references += `<xs:element ref="${code}"/>`;
        });
        
        const output = '' + EOL +
              '---------------' + EOL +
              '| DEFINITIONS |' + EOL +
              '---------------' + EOL +
              EOL +
              definitions +
              EOL + EOL +
              '--------------' + EOL +
              '| REFERENCES |' + EOL +
              '--------------' + EOL +
              EOL +
              references + 
              EOL;
        
        return output;
    },
    
    /**
     * counts how many voices are available for a given available language
     *
     * @async
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {string} language_code - general or region-specific language code, e.g., 'de' or 'en-US'
     * @returns {Promise.<integer>} amount of available voices for the language
     *
     * @example
     * await countVoicesOfLanguage('en'); // counts all English voices
     * await countVoicesOfLanguage('en-US'); // counts all US-American voices
     */
    countVoicesOfLanguage : async(language_code) => {
        
        if (!_.type.isString(language_code) || language_code === '') {
            _.logger.error(`Expected a language code as a string, but got ${_.type.of(language_code)} "${language_code}"`);
            return;
        }
        
        if (!(await __public.languageCodeExists(language_code))) {
            _.logger.error(`Language code "${language_code}" is not valid`);
            return;
        }
        
        // ------------
        
        let voices = await __public.getVoicesOfLanguage(language_code);
        
        if (!voices) {
            _.logger.error(`Failed counting voices for language code "${language_code}"`);
            return 0;
        }
        
        // count the keys in the voices object
        return _.basic.getLength(voices);
    },
    
    /**
     * returns all voices available for a given language code
     *
     * @async
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {string} language_code - general or region-specific language code, e.g., 'de' or 'en-US'
     * @returns {Promise.<Object>} voices available for the given language code
     *
     * @example
     * await getVoicesOfLanguage('en'); // returns all English voices
     * await getVoicesOfLanguage('en-US'); // returns all US-American voices
     */
    getVoicesOfLanguage : async(language_code) => {
        
        if (!_.type.isString(language_code) || language_code === '') {
            _.logger.error(`Expected a language code as a string, but got ${_.type.of(language_code)} "${language_code}"`);
            return;
        }
        
        if (!(await __public.languageCodeExists(language_code))) {
            _.logger.error(`Language code "${language_code}" is not valid`);
            return;
        }
        
        // ------------
        
        let voices = {};
        
        Object.keys(VOICES).forEach(voice_name => {
            
            let voice = VOICES[voice_name];
            
            // directly match the language-region code
            if (voice.language == language_code) {
                voices[voice_name] = _.basic.deepCopy(voice);
            }
            // if the language code does not have a hyphen, match it to language-region codes
            // e.g., 'cmn' should match 'cmn-CN', 'cmn-TW', etc.
            else if (
                !language_code.match(/[-]{1}/) && 
                voice.language.match(new RegExp(`^${language_code}\-`, 'i'))
            ) {
                voices[voice_name] = _.basic.deepCopy(voice);
            }
        });
        
        return voices;
    },
    
    /**
     * checks if a language code exists (is available with at least one voice)
     *
     * @async
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {string} language_code - general or region-specific language code, e.g., 'de' or 'en-US'
     * @returns {Promise.<boolean>} true if the language code exists
     */
    languageCodeExists : async(language_code) => {
        
        if (!_.type.isString(language_code) || language_code === '') {
            _.logger.error(`Expected a language code as a string, but got ${_.type.of(language_code)} "${language_code}"`);
            return;
        }
        
        // ------------
        
        // initialize clients
        if (!(await initialize())) {
            _.logger.error(`Failed initializing the clients`);
            return;
        }
        
        // check if any language has the given language code
        for (let voice_name in VOICES) {
            // en-US == en-US
            if (VOICES[voice_name].language == language_code) {
                return true;
            }
            // en match en-US, en-GB, en-IN, ...
            else if (
                !language_code.match(/[-]{1}/) && 
                VOICES[voice_name].language.match(new RegExp(`^${language_code}\-`, 'i'))
            ) {
                return true;
            }
        }
        
        return false;
    },
    
    
    
    /*
     * MP3
     */
    
    /**
     * generates a MP3 file of the given SSML and voice (does not pull the MP3 from the cache)
     *
     * @async
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {Object} options
     * @param {string} options.output_path - where the generated MP3 file should be put
     * @param {string} options.voice_name - name of the voice to render with
     * @param {ssml|text} options.type - type of content: either SSML or plain text
     * @param {string} options.content - text that should be rendered as speech
     * @param {boolean} [options.save_in_cache=true] - if to cache the file
     * @returns {Promise.<integer>} 1 (successfully generated), 0 (failed)
     */
    createMP3Strictly : async(options) => {
        
        // required parameters
        
        if (
            !_.type.isString(options.output_path) ||
            _.path.extname(options.output_path) !== '.mp3'
        ) {
            _.logger.error(`Expected options.output_path as a file path for a MP3 file as a string, but got ${_.type.of(options.output_path)} "${options.output_path}"`);
            return 0;
        }
        
        if (!_.type.isString(options.voice_name) || options.voice_name === '') {
            _.logger.error(`Expected a options.voice_name as a string, but got ${_.type.of(options.voice_name)} "${options.voice_name}"`);
            return 0;
        }
        
        if (!_.type.isString(options.content) || options.content === '') {
            _.logger.error(`Expected options.content as a string, but got ${_.type.of(options.content)} "${options.content}"`);
            return 0;
        }
        
        if (!_.type.isString(options.type) || !['ssml','text'].includes(options.type)) {
            _.logger.error(`Expected options.type as a string 'ssml' or 'text', but got ${_.type.of(options.type)} "${options.type}"`);
            return 0;
        }
        
        // optional parameters
        
        if (options.save_in_cache !== undefined && !_.type.isBoolean(options.save_in_cache)) {
            _.logger.error(`Expected options.save_in_cache as a boolean, but got ${_.type.of(options.save_in_cache)} "${options.save_in_cache}"`);
            return 0;
        }
        options.save_in_cache = _.type.isBoolean(options.save_in_cache) ? options.save_in_cache : true;
        
        // ------------
        
        // initialize clients
        if (!(await initialize())) {
            _.logger.error(`Failed initializing the clients`);
            return 0;
        }
        
        // get voice properties
        const voice = VOICES[options.voice_name];
    
        // check if voice exists
        if (!voice) {
            _.logger.error(`Voice "${options.voice_name}" is unknown`);
            return 0;
        }
        
        // check which voice API to use, then synthesize
        let mp3_binary = null;
        switch (voice.api) {
            
            case 'amazon-polly': {
                mp3_binary = await synthesizeWithAmazonPolly(options.voice_name, options.content, options.type);
                break;
            }
            
            case 'google-cloud': {
                mp3_binary = await synthesizeWithGoogleCloud(options.voice_name, options.content, options.type);
                break;
            }
            
            default: {
                _.logger.error(`Failed synthesizing using voice "${voice_name}", because its specified API "${voice.api}" does not exist`);
                return 0;
            }
        }
        
        if (!mp3_binary) {
            _.logger.fatal(`Failed creating audio clip at "${_.path.basename(options.output_path)}"`);
            return 0;
        }
        
        // write the MP3 binary audio data to a file
        _.fs.writeFileSync(options.output_path, mp3_binary, 'binary');
        
        if (options.save_in_cache) {
            // generate an id for the audio file
            const id = await __public.generateAudioId({
                voice_name : options.voice_name,
                google_cloud_effect_profile : GOOGLE_CLOUD_EFFECT_PROFILE,
                type : options.type,
                content : options.content
            });

            // cache the file if it's not yet cached
            if (!_.cache.isCached(id)) {
                _.cache.cacheData(id, mp3_binary);
            }
        }
        
        return 1;
    },
    
    /**
     * either generates a MP3 file of the given SSML and voice or returns a cached previously-generated version
     *
     * @async
     * @function
     * @alias module:text_to_speech
     * @category public
     * 
     * @param {Object} options
     * @param {string} options.output_path - where the generated MP3 file should be put
     * @param {string} options.voice_name - name of the voice to render with
     * @param {ssml|text} options.type - type of content: either SSML or plain text
     * @param {string} options.content - text that should be rendered as speech
     * @param {boolean} [options.save_in_cache=true] - if to cache the file if it was freshly generated
     * @returns {Promise.<integer>} 2 (loaded from cache), 1 (freshly created), 0 (failed)
     */
    createMP3 : async(options) => {
        
        // required parameters
        
        if (
            !_.type.isString(options.output_path) ||
            _.path.extname(options.output_path) !== '.mp3'
        ) {
            _.logger.error(`Expected options.output_path as a file path for a MP3 file as a string, but got ${_.type.of(options.output_path)} "${options.output_path}"`);
            return false;
        }
        
        if (!_.type.isString(options.voice_name) || options.voice_name === '') {
            _.logger.error(`Expected a options.voice_name as a string, but got ${_.type.of(options.voice_name)} "${options.voice_name}"`);
            return false;
        }
        
        if (!_.type.isString(options.type) || !['ssml','text'].includes(options.type)) {
            _.logger.error(`Expected options.type as a string 'ssml' or 'text', but got ${_.type.of(options.type)} "${options.type}"`);
            return false;
        }
        
        if (!_.type.isString(options.content) || options.content === '') {
            _.logger.error(`Expected options.content as a string, but got ${_.type.of(options.content)} "${options.content}"`);
            return false;
        }
        
        // optional parameters
        
        if (options.save_in_cache !== undefined && !_.type.isBoolean(options.save_in_cache)) {
            _.logger.error(`Expected options.save_in_cache as a boolean, but got ${_.type.of(options.save_in_cache)} "${options.save_in_cache}"`);
            return false;
        }
        options.save_in_cache = _.type.isBoolean(options.save_in_cache) ? options.save_in_cache : true;
        
        // ------------
        
        // initialize clients
        if (!(await initialize())) {
            _.logger.error(`Failed initializing the clients`);
            return false;
        }
        
        // get voice properties
        const voice = VOICES[options.voice_name];
    
        // check if voice exists
        if (!voice) {
            _.logger.error(`Voice "${options.voice_name}" is unknown`);
            return false;
        }
        
        // generate an id for the audio file
        const id = await __public.generateAudioId({
            voice_name : options.voice_name,
            google_cloud_effect_profile : GOOGLE_CLOUD_EFFECT_PROFILE,
            type : options.type,
            content : options.content,
            save_in_cache : options.save_in_cache
        });
        
        // try to pull the file from cache
        if (_.cache.isCached(id)) {
            const mp3_binary = _.cache.getData(id);
            if (!mp3_binary) {
                _.logger.warn(`Failed to get MP3 audio file from cache to place at: "${options.output_path}"`);
                // if obtaining from cache failed, create it instead
                return await __public.createMP3Strictly(options);
            }
            // write the MP3 binary audio data to a file
            _.fs.writeFileSync(options.output_path, mp3_binary, 'binary');
            return 2;
        }
        
        // if it could not be retrieved from cache, create it
        return await __public.createMP3Strictly(options);
    },
    
    /**
     * generates a unique ID for an audio file depending on the provided options
     *
     * @async
     * @function
     * @alias module:text_to_speech/cache
     * @category public
     * 
     * @param {Object} options
     * @param {string} options.voice_name - name of the voice to render with
     * @param {string} options.google_cloud_effect_profile - Google cloud effect profile that was used (only relevant for Google Cloud voices)
     * @param {ssml|text} options.type - type of content: either SSML or plain text
     * @param {string} options.content - plain text or SSML that should be rendered as speech
     * @returns {Promise.<string>} ID
     */
    generateAudioId : async(options) => {
        
        // required parameters
        
        if (!_.type.isString(options.voice_name) || options.content === '') {
            _.logger.error(`Expected options.voice_name as a string, but got ${_.type.of(options.voice_name)} "${options.voice_name}"`);
            return;
        }
        
        if (!_.type.isString(options.google_cloud_effect_profile) || options.content === '') {
            _.logger.error(`Expected a options.google_cloud_effect_profile as a string, but got ${_.type.of(options.google_cloud_effect_profile)} "${options.google_cloud_effect_profile}"`);
            return;
        }
        
        if (!_.type.isString(options.type) || !['ssml','text'].includes(options.type)) {
            _.logger.error(`Expected options.type as a string 'ssml' or 'text', but got ${_.type.of(options.type)} "${options.type}"`);
            return;
        }
        
        if (!_.type.isString(options.content) || options.content === '') {
            _.logger.error(`Expected options.content as a string, but got ${_.type.of(options.content)} "${options.content}"`);
            return;
        }
        
        // ------------
        
        let id = options.voice_name + EOL;
        
        if ((await __public.getVoiceAPI(options.voice_name)) === 'google-cloud') {
            id += options.google_cloud_effect_profile;
        }
        else {
            id += '-';
        }
        
        id += EOL + options.type
            + EOL + options.content;
        
        return _.lz_string.compressToUTF16(id).toString();
    }
};

module.exports = __public;