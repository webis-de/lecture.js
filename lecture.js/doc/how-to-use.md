[lecture.js](../README.md) > [Documentation](README.md) > **How to use**

---

This is a step-by-step guide on how to use the lecture.js project.



# 1. How to use

Before you try to run the program, make sure it is properly [installed](installation.md)!

You can call the main `lecture.js` script by opening your terminal inside the `/lecture.js/` directory. Once inside, type either:
```
node lecture.js
```
Or simply:
```
node lecture
```

## 1.1 Open the help menu

Open your terminal and navigate to the `/lecture.js/` directory. Then enter the following command:
```
node lecture -h
```

## 1.2 View available languages

You can use more than one language for generating your lecture. To get an overview over which languages are available, open your terminal and navigate to the `/lecture.js/` directory. Then enter the following command:
```
node lecture --languages
```

## 1.3 View available voices

You can use more than one voice for generating your lecture. To get an overview over which voices are available, open your terminal and navigate to the `/lecture.js/` directory. Then enter the following command:
```
node lecture --voices
```

## 1.4 How to try out voices

You can simply generate audio samples via the terminal without having to go through the whole process of generating a lecture. To do that, open your terminal and navigate to the `/lecture.js/` directory. If you want to test voice `amazon-en-gb-amy` with text `This is a sentence.`, then enter the following command:
```
node lecture -s --voice="amazon-en-gb-amy" --text="This is a sentence."
```
The command will create a `/lecture.js/sample/` folder and place your audio file sample inside, if the generation was successful.

You can also generate samples of SSML content, using the following command:
```xml
node lecture -s --ssml --voice="amazon-en-us-matthew" --text="<speak>This is <break time=\"750ms\" /> a sentence.</speak>"
```

Also, if you just want a quick voice sample using the default voice, enter this command:
```
node lecture "This is a sentence."
```
It uses the `defaultVoice` setting in the configuration file at `/lecture.js/src/pipeline/config.ini`. To try out the default voice with SSML elements, you may use this command:
```xml
node lecture -s --ssml --text="<speak>This is <break time=\"750ms\" /> a sentence.</speak>"
```

## 1.5 Generate an example lecture

Open your terminal and navigate to the `/lecture.js/` directory. You can then start the lecture.js pipeline with the example files using the following command:
```
node lecture -i=input/example.xml -o=output/
```
This will generate an example lecture using the input file [`/lecture.js/input/example.xml`](../input/example.xml) and output the files in the `output/` directory. The example output should look similar to this [`/lecture.js/output/example-output/`](../output/example-output/).

## 1.6 Generate your own lecture

### 1.6.1 Create a basic lecture

To generate your own simple lecture, all you need is a script an an XML file and your slides as one or multiple PDF files.

Your XML file should use the LSML language, which is an extension of the SSML language. Don't worry, LSML is really **easy** to learn! An example XML script that includes most lecture.js features is located at [/lecture.js/input/example.xml](../input/example.xml), which generates this [output](../output/example-output/)! 

If you are looking for how to use LSML more in-depth, check out this [documentation](lsml-features.md).

Once you have written your script and created your slides as a PDF file, you are ready to generate your own lecture. Open your terminal and navigate to the `/lecture.js/` directory. Then run the following command, where you replace the input with the file path to your XML file:
```
node lecture -i=input/your-script.xml -o=output/
```
The input and output parameters accept absolute and relative file paths. Relative file paths are relative to the location of the `lecture.js` file (which is the file you execute with the above command).

The command will generate your lecture in the `output/` directory.

### 1.6.2 Pick a suitable voice

If you want to use an Amazon Polly voice, it's best to select one of their neural voices. Some of the good sounding Amazon Polly voices are:
- `amazon-en-gb-amy` (female, British English)
- `amazon-en-us-matthew` (male, US American English)

It's best not to use any of the Standard voices from Google (they all have "standard" in the name) for your video. Instead, concentrate on the Google Wavenet voices, which sound much more natural. Some of the good sounding Google Cloud voices are:
- `google-en-us-wavenet-d` (male, US American English)
- `google-en-us-wavenet-j` (male, US American English)
- `google-en-us-wavenet-e` (female, US American English)
- `google-en-gb-wavenet-b` (male, British English)
- `google-en-gb-wavenet-f` (female, British English)

You are free to experiment with other voices and not use the recommendations above. Depending on which voice you use, the program will use a different service to generate your video (either Amazon or Google). Some of the SSML elements may behave slightly differently between these services, so check out the [documentation](lsml-features.md) if you plan to use any of the more advanced SSML features.

In general, Amazon has better feature support, while Google has the better sounding voices.

### 1.6.3 Include audio files

You can include your own audio files into the final video lecture. These audio clips will be played at the position where they are inserted into the script, while the currently visible PDF page stays open.

In order to play an audio file in your lecture, you need to use the `<audio>` element:
```xml
<audio src="your-audio-file.mp3" />
```

You can apply additional parameters to your audio. To do that, check out the documentation for the [`<audio>`](lsml-features.md#audio) element.

Embedded audio files should preferably have the following properties:
- <ins>container</ins>: `MP3` or `M4A`

### 1.6.4 Include video files

You can include your own video files into the final video lecture. These videos will be played at the position where they are inserted into the script.

In order to play a video file in your lecture, you need to use the `<video>` element:
```xml
<video src="your-video-file.mp4" />
```

You can apply additional parameters to your video. Check out the documentation for the [`<video>`](lsml-features.md#video) element.

Embedded video files should have the following properties:

- <ins>container</ins>: `MP4`
- <ins>video codec</ins>: `H.264`
- <ins>audio codec</ins>: `AAC`
- preferably, should have the same frame rate, aspect ratio, and resolution that you defined for your output video

### 1.6.5 Include images

It is also simply possible to include individual images outside of PDF slides. These images will be displayed as a persistent frame  at the position where they are inserted into the script until the slide is changed again.

In order to show an image, you need to use the `<image>` element:
```xml
<image src="your-image.png" />
```

You can also apply additional options to the image. Check out the documentation for the [`<image>`](lsml-features.md#image) element.

### 1.6.6 How to correct the pronunciation of words

There are multiple SSML elements that enable you to correct the pronunciation of single words and whole sections.

- [`<lexicon> and <lookup>`](lsml-features.md#lexicons): defines a lexicons with one or multiple pronunciation definitions, that can be applied to sections of text
- [`<phoneme>`](lsml-features.md#phoneme): applies a phonetic alphabet, like the IPA, to precisely define the pronunciation of a word
- [`<sub>`](lsml-features.md#sub): defines an alias for a word, that will be rendered as speech instead of the word
- [`<say-as>`](lsml-features.md#say-as): tells the language processor how to interpret its contents, e.g., as a date, or number or as characters to be spelt out
- [`<lang>`](lsml-features.md#lang): specifies the natural language of the content, should the language processor interpret the natural language wrongly

## 1.7 Configure lecture.js

To configure the lecture.js pipeline and set default parameters, edit the configuration file located at `/lecture.js/src/pipeline/config.ini`. If you enter any unexpected values in the configuration file, the pipeline will throw warnings once it is run.

You may also directly set certain settings explicitely for each input file. For more information on that, check out the documentation for the [`<settings>`](lsml-features.md#settings) element.

## 1.8 Get project statistics

To get some statistics about the project, run the `stats.bat` file or run the `stats.js` file using the following command inside the terminal:
```
node stats
```

<br />
<br />

# 2. Common Problems

This section provides solutions for common problems seen in the usage of lecture.js.

## 2.1 The validator throws errors.

In most cases, if the validator throws any errors, there is something wrong with your input file. Please read the errors carefully and try to fix any problems. However, if you are completely sure, that your input file is correct, you may disable the validator. To disable the validator, change the `enableValidator` setting the configuration file `config.ini`, which is located inside the directory `/lecture.js/src/pipeline/`.

## 2.2 I get Text-to-speech errors.

This problem may be caused by the incorrect usage of (especially the more advanced) SSML elements in your input file. Make sure that the validator is enabled in the configuration file `config.ini`. If the validator doesn't throw any errors, please check out the [LSML Features](lsml-features.md) documentation and look up the elements you used. Most likely, your error was caused by the wrong usage of an attribute or using a SSML element inside an SSML element, in which it shouldn't be used.

## 2.3 The program stops and does nothing.

This problem may occur when you loose your internet connection while that program is being executed. Make sure to use the program with a stable internet connection.

## 2.3 The program takes very long to load audio files from cache.

This may indicate that your cache is filled with too many cached text-to-speech audio files. This can be fixed by clearing the cache, using the following command:
```
node lecture --clearcache
```