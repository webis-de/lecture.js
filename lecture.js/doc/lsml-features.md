[lecture.js](../README.md) > [Documentation](README.md) > **LSML Features**

---

This is a list of LSML features and how they are supported by a number of speech APIs and lecture.js. The basis for the documentation is the [W3 SSML Specification v1.1](https://www.w3.org/TR/speech-synthesis11/). Lecture.js implements the custom language "Lecture Synthesis Markup Language (LSML)", which is an extension of the XML-based language SSML v1.1.



# Notes

- lecture.js ignores the XML prolog
```xml
<?xml version="1.0"?>
```

## Feature Support

- ✅ extends SSML by the following lecture.js-exclusive elements: `<lecture>`,  `<info/>`,  `<settings/>`, `<deck/>`, `<slide/>`, `<video/>`, *specific language elements*
- ✅ supports the following SSML elements: *comments*, `<mark/>`, `<p>`, `<s>`, `<token>`, `<w>`, `<emphasis>`, `<break/>`, `<prosody>`, `<say-as>`, `<sub>`, `<lang>`, `<phoneme>`, `<audio>`
- ✅ supports altered versions the following SSML elements: `<lexicon>`, (inside lexicons: `<lexeme>`, `<grapheme>`, `<alias>`, `<phoneme>`), `<lookup>`,  `<voice>`
- ❌ does not support the following SSML elements: `<speak>`,  `<meta>`, `<metadata>`, `<desc>`
- ❌ does not support the following Google-exclusive and Amazon-exclusive elements: `<seq>`, `<par>`, `<media>`, `<amazon:auto-breath/>`,  `<amazon:auto-breaths>`, `<amazon:domain>`, `<amazon:effect>`, `<amazon:emotion>`

## Incompatible elements

The following elements are not supported in combination with each other in Amazon Polly SSML, meaning that they cannot be used on the same text, with some additional restrictions as well.

- `amazon:domain`
- `amazon:emotion`
- `voice` cannot be combined with `<amazon:domain name="long-form">` and `<amazon:domain name="music">`
- `emphasis`
- `prosody` with the `pitch` attribute

# Glossary

- [✅](#) means that the feature is supported
  - clicking on the icon loads up the documentation page for the feature if available
- ❌ means that the feature is not supported
- `<element>` defines a **non-empty** XML element by the name `element`
- `<element/>` defines an **empty** XML element by the name `element`
- `attribute` defines a **required** XML attribute to a given `<element>`
- `[attribute]` defines an **optional** XML attribute to a given `<element>`



# Elements

## Document Structure

### Comments

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<!-- -->`** |  | adds a comment that is not rendered as speech | ✅ | [✅](#) | ❌ | ❌ | [✅](#) |

```xml
<!-- A comment -->
```

### &lt;lecture&gt;

| Element             | Attribute | Description                                                  | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| ------------------- | --------- | ------------------------------------------------------------ | ----------- | ---- | ------------ | ---------------- | ------------ |
| **`<lecture>`** |           | root element of a lecture.js document<br />- the following elements are required as direct children: **1** `<info/> `, **1** `<settings/>`, **1+** `<deck/>` | ✅<br />- replaces the `<speak>` element from SSML | ❌    | ❌            | ❌                | ❌            |
|  | `[startmark]` | sets at which `<mark/>` rendering starts | ✅ | ❌ | ❌ | ❌ | ❌ |
|  | `[endmark]` | sets at which `<mark/>` rendering ends | ✅ | ❌ | ❌ | ❌ | ❌ |

```xml
<lecture startmark="start123" endmark="end345">
   <!-- LSML content -->
</lecture>
```

### &lt;info/&gt;

| Element             | Attribute      | Description                                                  | LSML (lecture.js)                                | SSML                                              | Amazon Polly                                      | Google Cloud TTS                             | OpenMARY                           |
| ------------------- | -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **`<info/>`**      |                | defines information about the lecture<br />- must only appear once and only as a direct child element inside the `<lecture>` element | ✅ | ❌ | ❌ | ❌ | ❌ |
|                     | `[title]` | defines the title of the lecture                  | ✅                 | ❌                 | ❌                 | ❌                 | ❌                 |
| | `[description]` | defines a short description about the lecture | ✅ | ❌ | ❌ | ❌ | ❌ |
|                     | `[authors]`    | defines the name(s) of the author(s)<br />- preferably use a semicolon-separated list of strings | ✅ | ❌ | ❌ | ❌ | ❌ |
|                     | `[copyright]`  | defines the copyright holder(s) and additional copyright information | ✅ | ❌ | ❌ | ❌ | ❌ |

```xml
<lecture>
    <info 
       title="An example lecture name"
       description="This is a short description of the lecture."
       authors="Max Mustermann; Erika Musterfrau"
       copyright="2020 Max Mustermann, Example University"
    />
</lecture>
```

### &lt;settings/&gt;

| Element             | Attribute      | Description                                                  | LSML (lecture.js)                                | SSML                                              | Amazon Polly                                      | Google Cloud TTS                             | OpenMARY                           |
| ------------------- | -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **`<settings/>`**  |                | defines settings for the lecture.js pipeline<br />- may only appear once and only as a direct child element inside the `<lecture>` element<br />- settings default to the value set in the configuration file, if they're no set using this element | ✅ | ❌ | ❌ | ❌ | ❌ |
|                     | `[voice]`      | defines the default voice of the document to be used in sections where no other voice is defined | ✅ | ❌ | ❌ | ❌ | ❌ |
|                     | `[resolution]` | defines the resolution of the resulting video<br />- must be an exact value in the format _{width}x{height}_, e.g., _1280x720_<br />- both width and height must be even values (divisible by 2)<br />- width is limited to a range from 128 to 3840<br />- height is limited to a range from 72 to 2160 | ✅ | ❌ | ❌ | ❌ | ❌ |
|                     | `[fps]`        | defines the number of FPS for the resulting video as an integer<br />- limited to a range from 10 to 120 FPS | ✅ | ❌ | ❌ | ❌ | ❌ |
| | `[breakAfterSlide]` | defines a break in milliseconds that should be applied by default when the slide changes | ✅ | ❌ | ❌ | ❌ | ❌ |
| | `[breakAfterParagraph]` | defines a break in milliseconds that should be applied by default between all paragraphs | ✅ | ❌ | ❌ | ❌ | ❌ |
| | `[googleEffectProfile]` | defines an [effect profile](https://cloud.google.com/text-to-speech/docs/audio-profiles#available_audio_profiles) for all Google voices used in the document | ✅ | ❌ | ❌ | ❌ | ❌ |
| | `[youtubePrivacyStatus]` | defines the privacy status of videos uploaded to YouTube<br />- supported values are: `public`, `unlisted`, `private` | ✅ | ❌ | ❌ | ❌ | ❌ |
| | `[youtubePlaylistId]` | defines an ID of a playlist owned by the authenticated user in which to insert the uploaded YouTube video | ✅ | ❌ | ❌ | ❌ | ❌ |

```xml
<lecture>
    <settings 
       voice="amazon-de-de-vicki"
       resolution="1280x720"
       fps="30"
       breakAfterSlide="1500"
       breakAfterParagraph="500"     
    />
</lecture>
```

### &lt;mark&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<mark>`** |  | defines a marker (position) inside the document | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.2) | [✅](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#custom-tag)<br />- supported by Polly with timestamps | [✅](https://cloud.google.com/text-to-speech/docs/ssml#mark) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L469) |
|  | `name` | defines the name of the marker<br />-  can be targeted using the attributes `startmark` and `endmark` on the `<speak>` and `<lecture>` elements | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.2) | [✅](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#custom-tag) | [✅](https://cloud.google.com/text-to-speech/docs/ssml#mark) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L469) |
|  | [`chapter`] | defines that a new chapter with the given values as the name begins at this marker | ✅ | ❌ | ❌ | ❌ | ❌ |

- usage in LSML:

```xml
<lecture startmark="mark1" endmark="mark2">
   This sentence is ignored.
   <mark name="mark1" chapter="Intro" />
   This sentence will be spoken.
   <mark name="mark2"/>
   This sentence is ignored.
</lecture>
```

- usage in SSML:

```xml
<speak startmark="mark1" endmark="mark2">
   This sentence is ignored.
   <mark name="mark1" />
   This sentence will be spoken.
   <mark name="mark2"/>
   This sentence is ignored.
</speak>
```

### &lt;speak&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<speak>`** |  | root element of a SSML document | ❌<br />- does not support `<speak>`, but instead implements a similar element called `<lecture>` | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.1) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#speak) | [✅](https://cloud.google.com/text-to-speech/docs/ssml#speak) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L40)<br />- converted to `<maryxml>` |
|  | `version` | specifies the version of the SSML specification used | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.1) | ❌ | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L40) |
|  | `xml:lang` | specifies the language of the root document | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.1) | ❌ | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L40) |
|  | `[xml:base]` | specifies the [Base URI](https://www.w3.org/TR/speech-synthesis11/#S3.1.3) of the root document | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.1) | ❌ | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L40) |
| | `[xmlns]` | defines a default namespace for all elements | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.1) | ❌ | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L40) |
| | `[xmlns:xsi]` | defines a namespace for all elements prefixed with `xsi` | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.1) | ❌ | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L40) |
|  | `[xsi:schemaLocation]` | indicates the location of the [SSML schema](https://www.w3.org/TR/speech-synthesis11/#AppD) | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.1) | ❌ | ❌ | ❌ |
|  | `[onlangfailure]` | specifies the behavior once the speaking language fails | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.1) | ❌ | ❌ | ❌ |
|  | `[startmark]` | sets at which `<mark/>` rendering starts | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.1) | ❌ | ❌ | ❌ |
|  | `[endmark]` | sets at which `<mark/>` rendering ends | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.1) | ❌ | ❌ | ❌ |

- minimal version:
 ```xml
 <speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <!-- SSML content -->
 </speak>
 ```
- extended version:
 ```xml
 <speak version="1.1" xml:lang="en-US"
        xmlns="http://www.w3.org/2001/10/synthesis"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.w3.org/2001/10/synthesis
                  http://www.w3.org/TR/speech-synthesis11/synthesis.xsd"
        xml:base="http://www.example.com/base-file-path">
    <!-- SSML content -->
</speak>
 ```

### &lt;meta/&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<meta/>`** |  | defines meta information about the document<br />- associates a  string to a declared meta property or declares `http-equiv` content<br />- must appear only as a direct child of the `<speak>` element and before all content elements | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.6) | ❌ | ❌ | ❌ |
|  | `name` | declares a custom attribute name _(must not be combined with `http-equiv`)_ | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.6) | ❌ | ❌ | ❌ |
|  | `http-equiv` | declares a custom attribute name with special significance when received via HTTP_(must not be combined with `name`)_ | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.6) | ❌ | ❌ | ❌ |
|  | `content` | provides the content for either `name` or `http-equiv` | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.6) | ❌ | ❌ | ❌ |

```xml
<speak>
	<meta name="seeAlso" content="http://example.com/my-ssml-metadata.xml"/>
	<meta http-equiv="Cache-Control" content="no-cache"/>
</speak>
```

### &lt;metadata&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<metadata>`** |  | adds meta information about the document using a metadata schema<br />- any metadata schema is valid, but [RDF-XMLSYNTAX](https://www.w3.org/TR/2004/REC-rdf-syntax-grammar-20040210/) is recommended<br />- none of its content is rendered by the speech synthesizer<br />- must appear only as a direct child of the `<speak>` element and before all content elements | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.7) | ❌ | ❌ | ❌ |

```xml
<speak>
	<metadata>
       <rdf:RDF xmlns:rdf = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                xmlns:rdfs = "http://www.w3.org/2000/01/rdf-schema#"
                xmlns:dc = "http://purl.org/dc/elements/1.1/">
          <rdf:Description rdf:about="http://www.example.com/meta.ssml"
                dc:title="Hamlet-like Soliloquy"
                dc:description="Aldine's Soliloquy in the style of Hamlet"
                dc:publisher="W3C"
                dc:language="en-US"
                dc:date="2002-11-29"
                dc:rights="Copyright 2002 Aldine Turnbet"
                dc:format="application/ssml+xml" >                
             <dc:creator>
                <rdf:Seq ID="CreatorsAlphabeticalBySurname">
                   <rdf:li>William Shakespeare</rdf:li>
                   <rdf:li>Aldine Turnbet</rdf:li>
                </rdf:Seq>
             </dc:creator>
          </rdf:Description>
       </rdf:RDF>
    </metadata>
</speak>
```



## Slide Control

### &lt;deck/&gt;

| Element             | Attribute      | Description                                                  | LSML (lecture.js)                                | SSML                                              | Amazon Polly                                      | Google Cloud TTS                             | OpenMARY                           |
| ------------------- | -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **`<deck/>`** |                | loads a PDF file and assigns it a unique identifier<br />- must only appear as a direct child of the `<lecture>` element<br />- multiple slide decks may be loaded, but each needs its own `<deck>` element | ✅ | ❌ | ❌ | ❌ | ❌ |
|                     | `id`           | defines a unique identifier for the slide                    | ✅                   | ❌                   | ❌                   | ❌                   | ❌                   |
|                     | `src`         | defines the path to a local PDF file                        | ✅                       | ❌                       | ❌                       | ❌                       | ❌                       |
|                     | `[active]`     | sets the deck to be active, which means it's used as long as no other slide deck is loaded using a `<slide>` element<br />- exactly one slide can and must be set to active<br />- can be `true` or `false` (default)<br />- if set to `false`, it's equivalent to not using the `active` attribute | ✅ | ❌ | ❌ | ❌ | ❌ |
| | `[fit]` | defines how to fit the image frames generated from the slide deck into the video<br />- these are default values, which may be overwritten for an individual page using the `<slide>` element<br />- valid values are:<br />- `contain` *(default)*: resizes the slide deck to be fully visible inside the resolution, while keeping its aspect ratio<br />- `cover`: resizes the slide deck to cover the entire frame, while keeping its aspect ratio, so parts of it may be cut off<br />- `fill`: ignores the aspect ratio of the slide deck to stretch and/or compress it to fit the output resolution | ✅ | ❌ | ❌ | ❌ | ❌ |

```xml
<lecture>
	<deck id="deck1" src="deck1.pdf" active="true" />
	<deck id="deck2" src="deck2.pdf" />
</lecture>
```

### &lt;slide/&gt;

| Element        | Attribute | Description                                                  | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| -------------- | --------- | ------------------------------------------------------------ | ----------- | ---- | ------------ | ---------------- | ------------ |
| **`<slide/>`** |           | displays a slide from a slide deck as a frame that stays visible until the next slide is loaded | ✅           | ❌    | ❌            | ❌                | ❌            |
|                | `page`  | defines the page of the PDF file defined as the slide deck from which to take the slide<br />- may be a non-negative non-zero integer, e.g., _1_, _5_ (equivalent to the page to go to)<br />- may be a signed non-zero integer, e.g., _+3_, _-2_ (describes a change relative to the current page)<br />- may be one of the following values: `current`, `next` (_+1_), `previous` (_-1_), `first` (_1_), `last`<br />- if a page number exceeds available pages in slide deck, the last available page is used<br />- if a page number is set to below 1, page 1 is used | ✅           | ❌    | ❌            | ❌                | ❌            |
|                | `[deck]` | defines the identifier of the slide deck to use<br />- if undefined, use currently active slide deck | ✅           | ❌    | ❌            | ❌                | ❌            |
| | `[fit]` | defines how to fit the extracted image into the frame<br />- overwrites the default value set on the `<deck>` element for the specific slide deck<br />- valid values are:<br />- `contain` : resizes the slide to be fully visible inside the resolution, while keeping its aspect ratio<br />- `cover`: resizes the slide to cover the entire frame, while keeping its aspect ratio, so parts of it may be cut off<br />- `fill`: ignores the aspect ratio of the slide to stretch and/or compress it to fit the output resolution | ✅ | ❌ | ❌ | ❌ | ❌ |

```xml
<!-- goes to the 2nd page in the active slide deck -->
<slide page="2" />
<!-- goes 3 pages forward in the active slide deck to page 5 -->
<slide page="+3" />
<!-- goes to the last page in another slide deck -->
<slide deck="deck3" page="last" />
```



## Text Structure

### &lt;p&gt; and &lt;s&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<p>`** |  | explicitly specifies its contents as a paragraph | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.8.1) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#p) | [✅](https://cloud.google.com/text-to-speech/docs/ssml#p,s) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L51) |
|  | `[xml:lang]` | defines the language of the contents | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.2) | ❌ | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L51) |
|  | `[xml:id]` | defines an identifier | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.4) | ❌ | ❌ | ❌ |
| **`<s>`** |  | explicitly specifies its contents as a sentence | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.8.1) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#s) | [✅](https://cloud.google.com/text-to-speech/docs/ssml#p,s) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L70) |
|  | `[xml:lang]` | defines the language of the contents                        | ❌                                       | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.2)   | ❌                                                       | ❌                                                     | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L70) |
|  | `[xml:id]`   | defines an identifier                                        | ❌                                       | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.4)   | ❌                                                       | ❌                                                     | ❌ |

```xml
<p>
    <s>This is the first sentence of the paragraph.</s>
    <s>Here's another sentence.</s>
</p>
```

### &lt;token&gt; / &lt;w&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<token>`** |  | explicitly indicates a section as a token<br />- used to eliminate word (token) segmentation ambiguities | ✅<br />- internally converted to `<w>` | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.8.2) | ❌ | ❌ | ❌ |
|  | `[xml:lang]` | defines the language | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.2) | ❌ | ❌ | ❌ |
|  | `[xml:id]` | defines an identifier | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.4) | ❌ | ❌ | ❌ |
| **`<w>`** |  | explicitly indicates a section as a token | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.8.2) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#w) | ❌ | ❌ |
| | `[xml:lang]` | defines the language | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.2) | ❌ | ❌ | ❌ |
| | `[xml:id]` | defines an identifier | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.4) | ❌ | ❌ | ❌ |
| | `[role]` | defines the pronunciation of the contained token | ❌ | ❌ | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#w)<br />- `amazon:VB`: interprets the content as a verb<br />- `amazon:VBD`: interprets the content as a past participle<br />- `amazon:NN`: interprets the content as a noun<br />- `amazon:SENSE_1`: uses the non-default sense of the word, e.g., _bass_ is pronounced differently depending on the meaning, where normal sense would be the musical context, non-default meaning could be the freshwater fish | ❌ | ❌ |

- is necessary for languages that:
   - do not use whitespace for indicating boundaries, e.g., Chinese, Thai, Japanese
   - use whitespace for syllable segmentation, e.g., Vietnamese
   - use white space for other purposes, e.g., Urdu
```xml
<!-- Shanghai is a metropolis -->
上海是个<w>大都会</w>
```



## Voices and Languages

### &lt;voice&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<voice>`** |  | requests a change in the narrating voice | ✅<br />- implements custom voice names to ensure cross-compatibility between APIs | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.1) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#voice)<br />- only available in a basic form that allows for specifying language names | ❌<br />- some of its attributes are available in the options part of the request to the API | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L189) |
|  | `[name]` | indicates one or multiple processor-specific voice names to speak the contained text<br />- can be a space-separated list of preferred voices, with the top choice upfront | ✅<br />- only supports specifying a single voice name | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.1) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#voice)<br />- defines the name of an Amazon Polly voice<br />- cannot be a space-separated list of voices<br />- to speak in a different language, combine it with `<lang>`<br />- supports [these voices](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#supported-voices) | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L189) |
|  | `[gender]` | indicates the preferred gender of the narrating voice | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.1) | ❌ | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L189) |
|  | `[variant]` | indicates a preferred variant of voice characteristics as a positive integer, e.g., second male child voice | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.1) | ❌ | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L189) |
| | `[age]` | defines the age of the voice | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.1) | ❌ | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L189) |
|  | `[languages]` | defines a list of languages the voice is desired to speak | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.1) | ❌ | ❌ | ❌ |
|  | `[required]` | defines a list of features that should be used by the voice selection algorithm<br />- can be a space-separated list<br />- the default value is "languages" | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.1) | ❌ | ❌ | ❌ |
| | `[xml:lang]` | defines the language | ❌ | ❌ | ❌ | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L189) |

```xml
<voice name="google-en-us-wavenet-a">
    This text is spoken with a specific voice.
</voice>
```

### &lt;lang&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<lang>`** |  | specifies the natural language of the content<br />- should be used if there is a change in the natural language, but not voice | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.12) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#lang) | ❌ | ❌ |
|  | `xml:lang` | defines the language code of the desired language | ✅<br />- support only the languages supported by the currently speaking Text-to-speech implementation | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.12) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#lang)<br />- supported language codes are `de-DE`, `en-AU`, `en-CA`, `en-GB`, `en-IN`, `en-US`, `es-ES`, `es-MX`, `es-US`, `fr-CA`, `fr-FR`, `hi-IN`, `it-IT`, `ja-JP`, `pt-BR` | ❌ | ❌ |
|  | `[onlangfailure]` | specifies the desired behavior upon language speaking failure | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.12) | ❌ | ❌ | ❌ |

```xml
The German word for cat is <lang xml:lang="de">Katze</lang>.
```

### Specific language elements

| Element                                                      | Attribute | Description                                                  | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| ------------------------------------------------------------ | --------- | ------------------------------------------------------------ | ----------------- | ---- | ------------ | ---------------- | -------- |
| **`<de>`,`<de-DE>`,`<en>`,`<en-AU>`, `<en-GB>`, `<en-US>`, ...** _(for all available languages in the APIs)_ |           | acts the same as a `<lang>` element for the same language code | ✅                 | ❌    | ❌            | ❌                | ❌        |

```xml
The German word for cat is <de>Katze</de>.
Das englische Wort für Katze ist <en-US>cat</en-US>.
```

- depending on the currently active narrating voice, it's internally converted to one of the below:
    - to a `<lang>` element for Amazon Polly voices:
        - region-specific language codes are directly converted, e.g., `<en-GB>` becomes `<lang xml:lang="en-GB">`
        - region-nonspecific language codes are matched to the region-specific language code with the most available voices, e.g., `<en>` becomes `<lang xml:lang="en-US">`
    - to a `<voice>` element for Google Cloud voices:
        - a similar voice in a different language is matched to the active narrating voice



## Lexicons

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<lexicon>`** |  | references a lexicon document<br />- may appear multiple times but only as direct children of the `<lecture>` element and before all content elements | ✅<br />- defines a lexicon as its content instead of referencing a lexicon file | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.5.1) | ❌<br />- up to 5 lexicons may be defined using the [cloud console](https://docs.aws.amazon.com/polly/latest/dg/lexicons-applying.html) (but not the element) | ❌ | ❌ |
|  | `xml:id` | assigns an identifying name to the lexicon document | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.5.1) | ❌ | ❌ | ❌ |
|  | `alphabet` | defines the alphabet to use for phonemes in the lexicon | ✅ | ❌ | ❌ | ❌ | ❌ |
|  | `version` | defines the version of the [Lexicon specification](https://www.w3.org/TR/pronunciation-lexicon/) | ❌ | ❌ | ❌ | ❌ | ❌ |
|  | `uri` | specifies the location of a lexicon file as a URI | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.5.1) | ❌ | ❌ | ❌ |
|  | `[type]` | specifies the [media type](https://www.w3.org/TR/speech-synthesis11/#term-media-type) of the lexicon document | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.5.1) | ❌ | ❌ | ❌ |
|  | `[fetchtimeout]` | specifies the timeout for fetches in a [time designation](https://www.w3.org/TR/speech-synthesis11/#def_time_designation) | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.5.1) | ❌ | ❌ | ❌ |
|  | `[maxage]` | specifies the maximum age of content that the document is willing to use, as a non-negative integer | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.5.1) | ❌ | ❌ | ❌ |
|  | `[maxstale]` | specifies the maximum additional time over `maxage` that the document is willing to use, as a non-negative integer | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.5.1) | ❌ | ❌ | ❌ |
| **`<lookup>`** |  | loads a lexicon for use in a section | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.5.2) | ❌<br />- lexicons may be referenced in the request to the API | ❌ | ❌ |
|  | `ref` | specifies a name that references a lexicon using the `xml:id` | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.5.2) | ❌ | ❌ | ❌ |

- usage in **SSML** (lexicon files are linked):


```xml
<lexicon uri="lexicon1.pls" xml:id="lex1"/>
<lexicon uri="lexicon2.pls" xml:id="lex2" />
Does not look up these tokens in any lexicon.
<lookup ref="lex1">
    Looks up these tokens in lexicon 1.
    <lookup ref="lex2">
        Looks up these tokens in lexicon 2.
        If they are not found, it falls back to lexicon 1.
    </lookup>
</lookup>
```

- usage in **LSML** (lexicons are defined inside the document):
  - internally `<alias>` definitions convert matched text to `<sub alias="">` 
  - internally `<phoneme>` definitions convert in the text to `<phoneme alphabet="" ph="">`

```xml
<lexicon xml:id="lexicon1" alphabet="ipa">
    <lexeme>
        <grapheme>Bob</grapheme>
        <alias>Bobby</alias>
    </lexeme>
    <lexeme>
        <grapheme>tomato</grapheme>
        <phoneme>təˈmeiːtəʊ</phoneme>
    </lexeme>
</lexicon>

This text is spoken without a lexicon.

<lookup ref="lexicon1">
    This text is spoken with a specific lexicon 1.
    Bob <!-- pronounced as Bobby -->
    tomato <!-- pronounced as "təˈmeiːtəʊ" -->
</lookup>
```

- the most direct lexicon provides the proper replacement, but falls back to the next direct one, if no proper replacement is defined in it, e.g.:

```xml
<lookup ref="lexicon1">
    Any words here may be affected by lexicon 1.
    <lookup ref="lexicon2">
        Any words here are foremost affected by lexicon 2.
        Lexicon 1 serves as a fallback, if there is no definition for a token in lexicon 2.
    </lookup>
</lookup>
```



## Correcting Mispronunciations

### &lt;say-as&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<say-as>`** |  | describes how the text should be interpreted by providing additional context<br />- the attribute names are set by SSML specification, but the available values are arbitrary set by the different speech synthesis APIs | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.9) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#say-as) | [✅](https://cloud.google.com/text-to-speech/docs/ssml#say%E2%80%91as) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L81) |
|  | `interpret-as` | indicates the content type of the contained text construct<br />- `cardinal`/`number`: interprets the values as a cardinal number, e.g., _123_ as _One hundred twenty-three_<br />- `ordinal`: interprets the value as an ordinal number, e.g., _1_ as _First_<br />- `characters` / `verbatim` / `spell-out`: spells out each letter<br />- `fraction`: interprets the value as a fraction, e.g., _1+1/2_ as _one and a half_<br />- `expletive` / `bleep`: bleeps out the content inside the element as if censored<br />- `unit`: interprets the value as a measurement, e.g., _10kg_ as _ten kilogram_<br />- `date`: interprets the value as a date of which the format can be defined in `format`, or detail level using `detail`<br />- `time`: interprets the value as time, e.g., _1'21"_ as a duration in minutes and seconds or _1:20pm_ as a time of day, of which the format may be set using `format`<br />- `telephone`: interprets the value as a 7 or 10 digit telephone number ([W3 Specification](https://www.w3.org/TR/ssml-sayas/#S3.3))<br />-`address`: interprets the value as part of a street address<br />- `interjection`: interprets the value as an interjection (speaks the text more expressively) | ✅<br />- may only contain text<br />- only supports types supported by Amazon Polly and Google Cloud TTS, which are:<br />- `cardinal`<br />- `ordinal`<br />- `characters`<br />- `spell-out`<br />- `fraction`<br />- `expletive`<br />- `unit`<br />- `date`<br />- `time`<br />- `telephone` | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.9) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#say-as)<br />- does not support the synonyms `bleep`, `verbatim`<br />- only supports `interjection` for certain [speechcons](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speechcon-reference-interjections-english-australia.html) | [✅](https://cloud.google.com/text-to-speech/docs/ssml#say%E2%80%91as)<br />- does not support the synonym `number`<br />- does not support the values `address`, `interjection`<br />- `unit` also converts units to a singular or plural depending on the number<br />- `characters` may spell out a string boldly, for example _can_ as _C A N_, in contrast to `verbatim` and `spell-out` | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L81)<br />- does not support the synonyms `verbatim` / `spell-out` (even though `spell-out` is used internally)<br />- does not support the values `expletive` / `bleep`, `unit`, `fraction`, `address`, `interjection` |
|  | `[format]` | indicates an additional format for the interpret-as attribute as defined by the implementation | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.9) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#say-as)<br />- only used if `interpret-as` is set to `date`<br />- possible values: `mdy`, `dmy`, `ymd`, `md`, `dm`, `ym`, `my`, `d`, `m`, `y` | [✅](https://cloud.google.com/text-to-speech/docs/ssml#say%E2%80%91as)<br />- only used if `interpret-as` is set to `date`, or `time`<br />- if `interpret-as` is set to `date`, supported are the character codes `y`, `m`, and `d` in an arbitrary sequence, e.g., _yyyymmdd_<br />- if `interpret-as` is set to `time`, supported are the character codes `h`, `m`, `s`, `Z`, `12` and `24` in an arbitrary sequence, e.g., _hms_ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L81)<br />- only used if `interpret-as` is set to `number`, `date`, or `time` |
|  | `[detail]` | indicates the level of detail to be rendered as a positive integer | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.9) | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#say%E2%80%91as)<br />- only used if `interpret-as` is set to `date`, or `time` | ❌ |

```xml
<say-as interpret-as="characters">0123456789</say-as>
```

### &lt;sub&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<sub>`** |  | defines a replacement for the contained text when is is rendered as speech<br />- allows for both a spoken and written form of the contained text | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.11) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#sub) | [✅](https://cloud.google.com/text-to-speech/docs/ssml#sub) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L174) |
|  | `alias` | defines an alternative text that is spoken in place of the text contained inside the element | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.11) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#sub) | [✅](https://cloud.google.com/text-to-speech/docs/ssml#sub) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L174) |


```xml
<!-- "World Wide Web Consortium" is spoken instead of "W3C" -->
<sub alias="World Wide Web Consortium">W3C</sub>
```

### &lt;phoneme&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<phoneme>`** |  | provides a phonemic pronunciation for a section | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.10) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#phoneme)<br />- supports [these symbols](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#supported-symbols) | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L159) |
|  | `ph` | defines the the phoneme string to be used | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.10) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#phoneme) | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L159) |
|  | `[alphabet]` | specifies the phonemic alphabet to be used<br />- the only defined alphabet is `ipa` (International Phonetic Alphabet), though vendors may define their own with the prefix `x-` | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.10) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#phoneme)<br />- implements `ipa` and `x-sampa` (Extended Speech Assessment Methods Phonetic Alphabet) | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L159) |

- useful in the following cases:
    - same-language speakers may pronounce certain words differently
    - the language synthesizer may fail pronouncing words correctly
    - it may not be apparent without context how to pronounce a word

```xml
<phoneme alphabet="ipa" ph="təˈmeiːtəʊ">tomato</phoneme>
<phoneme alphabet="ipa" ph="pɪˈkɑːn">pecan</phoneme>
<phoneme alphabet="x-sampa" ph='ˈ"bA.t@l'>bottle</phoneme>
```



## Prosodic Features

### &lt;emphasis&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<emphasis>`** |  | requests the contained text to be spoken with a specific level of emphasis<br />- effect may differ between languages, dialects, voices and APIs | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.2) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#emphasis)<br />- does not alter the pronunciation of words and only changes rate and volume<br />- not available with Neural Voices | [✅](https://cloud.google.com/text-to-speech/docs/ssml#emphasis) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L223) |
|  | `level` | indicates the strength of emphasis to be applied<br />- valid values are:<br />- `none`: does not add an emphasis effect<br />- `strong`<br />- `moderate`<br />- `reduced` | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.2) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#emphasis)<br />- changes rate and volume, e.g., `strong` is louder and slower<br />- does not support the `none` level | [✅](https://cloud.google.com/text-to-speech/docs/ssml#emphasis) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L223)<br />- is converted to pitch and rate levels in MaryXML |

```xml
That is <emphasis level="strong">a lot</emphasis> of money!
```

### &lt;break/&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<break/>`** |  | controls prosodic boundaries like pausing between tokens defined by either `strength` or `time`<br />- if not present between tokens, the speech synthesiser will automatically determine a pause | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.3) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#break) | [✅](https://cloud.google.com/text-to-speech/docs/ssml#break) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L265) |
|  | `[strength]` | specifies the strength of the pause<br />- `none`: don't output a pause<br />- `x-weak`<br />- `weak`<br />- `medium`<br />- `strong`<br />- `x-strong` | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.3) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#break)<br />- `x-weak`: don't output a pause, equivalent to `none`<br />- `weak`/`medium`: treat adjacent words as if separated by a single comma<br />- `strong`: add a sentence break (equivalent to using `<s>`)<br />- `x-strong`: add a paragraph break (equivalent to using `<p>`) | [✅](https://cloud.google.com/text-to-speech/docs/ssml#break)<br />- strength is defined as monotonically non-decreasing (conceptually increasing)<br />- stronger boundaries are accompanied by pauses | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L265)<br />- converted to attribute `bi` in MaryXML |
|  | `[time]` | defines the duration of the pause to be inserted using seconds or milliseconds, e.g., _3s_, _50ms_ | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.3) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#break) | [✅](https://cloud.google.com/text-to-speech/docs/ssml#break) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L265)<br />- converted to attribute `duration` in MaryXML |
| | `[tone]` | defines the tone of the break | ❌ | ❌ | ❌ | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L265)<br />- automatically set by MaryXML using the `bi` attribute |

```xml
You will wait.
<break time="3s"/>
Wait is over.
```

### &lt;prosody&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<prosody>`** |  | controls the pitch, speaking rate and volume | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.4) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#prosody) | [✅](https://cloud.google.com/text-to-speech/docs/ssml#prosody)<br />- should only be used around full sentences | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L315) |
|  | `[pitch]` | defines the baseline pitch<br />- may be a Hertz value, e.g., _20Hz_<br />- may be a relative change with a signed ("+" or "-") percentage, Hertz value or semitone, e.g., _+90%_, _+10Hz_ or _-5st_<br />- may be an absolute change with `x-low`, `low`, `medium`, `high`, `x-high`, `default` | ✅<br />- does not support Hertz values | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.4) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#prosody)<br />- does not support Hertz values | [✅](https://cloud.google.com/text-to-speech/docs/ssml#prosody)<br />- does not support Hertz values<br />- also supports relative changes using semitones e.g. _+2st_, _-5st_ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L315)<br />- values `x-high`, `high`, `medium` (default), `low`, `x-low`, `default` are converted to [percentage values](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L337) |
| | `[range]` | defines the pitch range (variability) for the contained text<br />- meaning of "pitch range" will vary across language processors,  but increasing/decreasing this value will typically increase/decrease the dynamic range of the output pitch respectively<br />- may be a Hertz value, e.g., _20Hz_<br />- may be a relative change with a signed ("+" or "-") percentage, Hertz value or semitone, e.g., _+90%_, _+10Hz_ or _-5st_<br />- may be an absolute change with `x-low`, `low`, `medium`, `high`, `x-high`, `default` | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.4) | ❌ | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L347) |
|  | `[rate]` | defines a change in the speaking rate<br />- may be a non-negative percentage, e.g., _90%_<br />- may be a relative change with a signed ("+" or "-") percentage, e.g., _+90%_<br />- may be an absolute change with `x-slow`, `slow`, `medium`, `fast`, `x-fast`, `default` | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.4) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#prosody)<br />- minimum rate is 20%<br />- does not support relative change using percentages, e.g., _+90%_ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#prosody) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L377)<br />- values `x-fast`, `fast`, `medium` (default), `slow`, `x-slow`, `default` are converted to [percentage values](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L392) |
|  | `[volume]` | defines the volume for the contained text<br />- may be a signed ("+" or "-") number followed by "dB", e.g., _+0.5dB_<br />- may be a relative change with a signed ("+" or "-") percentage, e.g., _+90%_<br />- may be an absolute value like `silent`, `x-soft`, `soft`, `medium`, `loud`, `x-loud`, `default` | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.4) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#prosody)<br />- "-6dB" is roughly half the current amplitude<br />- maximum positive dB value is _+4.08dB_<br />- does not support relative change using percentages, e.g., _+90%_ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#prosody) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L402)<br />- values `x-loud`, `loud`, `medium` (default), `soft`, `x-soft`, `silent`, `default` are converted to [percentage values](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L413) |
| | `amazon:max-duration` | defines the maximum duration in seconds or milliseconds | ❌ | ❌ | [✅](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#maxduration-tag)<br />- not available with Neural Voices | ❌ | ❌ |
|  | `[duration]` | defines the desired time for the narrator to read the text<br />- takes precedence over the `rate` attribute<br />- may be a time declaration following the CSS2 Recommendation, e.g., "2s", "50ms"<br />- may be a relative change with a signed ("+" or "-") percentage, e.g., "+90%" | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.4) | ❌ | ❌ | ❌ |
|  | `[contour]` | defines an interpolation of different pitch values on the text within<br />- defined as a set of white space-separated targets at specified time positions in the speech output | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.2.4) | ❌ | ❌ | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L425) |

```xml
<prosody rate="x-slow" volume="x-loud">This text is slow, but loud.</prosody>
<prosody contour="(0%,+20Hz) (10%,+30%) (40%,+10Hz)">This is a sentence.</prosody>
```



## External Resources

### &lt;video/&gt;

| Element         | Attribute       | Description                                                  | LSML (lecture.js)                                | SSML                                              | Amazon Polly                                      | Google Cloud TTS                             | OpenMARY                           |
| --------------- | --------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **`<video/>`** |                 | inserts a video file to be played<br />- throws error on failure of finding the file | ✅                           | ❌                           | ❌                           | ❌                           | ❌                           |
|                 | `src`          | defines the path to a local video file                      | ✅                     | ❌                     | ❌                     | ❌                     | ❌                     |
|                 | `[clipBegin]`   | defines an offset when to start rendering the video relative to the beginning of the clip, e.g., _2s_, _2000ms_, _hh:mm:ss.SS_, _hh:mm:ss_ | ✅ | ❌ | ❌ | ❌ | ❌ |
|                 | `[clipEnd]`     | defines an offset when to stop rendering the video relative to the beginning of the clip, e.g., _2s_, _2000ms_, _hh:mm:ss.SS_, _hh:mm:ss_ | ✅ | ❌ | ❌ | ❌ | ❌ |
| | `[keepFrame]` | defines if after the video was played, the last frame should remain as the current video lecture frame, or if the lecture should display the last slide again | ✅ | ❌ | ❌ | ❌ | ❌ |
| | `[fit]` | defines how to fit the video into the frame<br />- valid values are:<br />- `contain` *(default)*: resizes the video to be fully visible inside the resolution, while keeping its aspect ratio<br />- `cover`: resizes the video to cover the entire frame, while keeping its aspect ratio, so parts of it may be cut off<br />- `fill`: ignores the aspect ratio of the video to stretch and/or compress it to fit the output resolution | ✅ | ❌ | ❌ | ❌ | ❌ |
| | `[soundLevel]` | defines the relative volume of the audio channel of the referenced video file<br />- takes signed ("+" or "-") [CSS2 numbers](https://www.w3.org/TR/CSS2/syndata.html#numbers) followed by "dB" | ✅<br />- limited to values between _+50dB_ and _-50dB_ | ❌ | ❌ | ❌ | ❌ |
| | `[speed]` | defines the playback speed of the referenced video file in percentage<br />- takes a positive real percentage value, e.g., _90%_ | ✅<br />- limited to values between _50%_ and _200%_ | ❌ | ❌ | ❌ | ❌ |
|                 | `[repeatCount]` | defines how often to loop the video as a positive integer    | ✅                         | ❌                         | ❌                         | ❌                         | ❌                         |

```xml
<!-- plays a video -->
<video src="recording.mp4" />
<!-- plays a video at 2 seconds into the clip, and ends at the 4th second -->
<video src="footage.mp4" clipBegin="00:00:02" clipEnd="00:00:04" />
```

### &lt;image/&gt;

| Element         | Attribute       | Description                                                  | LSML (lecture.js)                                | SSML                                              | Amazon Polly                                      | Google Cloud TTS                             | OpenMARY                           |
| --------------- | --------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **`<image/>`** |                 | inserts a image file to be shown as the backdrop, while the voice speaks, until a `<slide>`, `<video>` or different `<image>` element is used again<br />- throws error on failure of finding the file | ✅                           | ❌                           | ❌                           | ❌                           | ❌                           |
|                 | `src`          | defines the path to a local image file                 | ✅                     | ❌                     | ❌                     | ❌                     | ❌                     |
|                 | `[fit]` | defines how to fit the image into the frame<br />- valid values are:<br />- `contain` *(default)*: resizes the image to be fully visible inside the resolution, while keeping its aspect ratio<br />- `cover`: resizes the image to cover the entire frame, while keeping its aspect ratio, so parts of it may be cut off<br />- `fill`: ignores the aspect ratio of the image to stretch and/or compress it to fit the output resolution | ✅ | ❌ | ❌ | ❌ | ❌ |

```xml
<image src="image.png" fit="contain" />
```

### &lt;audio/&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<audio/>`** |  | inserts an audio file<br />- throws error on failure of loading the audio file | ✅<br />- only useable as an empty element (with no other content inside)<br />- does not send audio files to the API, but implements embedding itself<br />- is played while current frame remains visible | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.1) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#audio)<br />- only useable as an empty element (with no other content inside) | [✅](https://cloud.google.com/text-to-speech/docs/ssml#audio) | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L463) |
|  | `src` | specifies the path or the URL for the audio file | ✅<br />- only accepts local audio files (only file paths, not URLs) | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.1) | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#audio)<br />- only supports MP3 (MPEG v2) files<br />- file must be hosted on accessible HTTPS point and present a [trusted SSL](https://wiki.mozilla.org/index.php?title=CA/IncludedCertificates&redirect=no)<br />- file can only be _240s_ long<br />- combined total audio files can only be _240s_ long<br />- can at most use 5 audio files in one request<br />- bit rate must be 48 kbps<br />- sample rate must be 22050Hz, 24000Hz, or 16000Hz | [✅](https://cloud.google.com/text-to-speech/docs/ssml#audio)<br />- supports MP3 (MPEG v2), Ogg (Opus) files<br />- source URL must use HTTPS protocol<br />- file can only be _240s_ long<br />- file can at most be _5MB_ big<br />- must be 24K samples per second<br />- 24-96K bits per second at a fixed rate<br /> | [✅](https://github.com/marytts/marytts/blob/79e4edef3f478dcef0aad3609ba77090e91f0b6d/marytts-runtime/src/main/resources/marytts/modules/ssml-to-mary.xsl#L463) |
|  | `[clipBegin]` | defines an offset from the start of the media to begin rendering as a [time designation](https://www.w3.org/TR/speech-synthesis11/#def_time_designation) | ✅<br />- additionally supports the timestamp formats _hh:mm:ss_ and _hh:mm:ss.SSS_ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.1) | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#audio) | ❌ |
|  | `[clipEnd]` | defines an offset from the start of the media to end rendering as a [time designation](https://www.w3.org/TR/speech-synthesis11/#def_time_designation) | ✅<br />- additionally supports the timestamp formats _hh:mm:ss_ and _hh:mm:ss.SSS_ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.1) | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#audio) | ❌ |
| | `[soundLevel]` | defines the relative volume of the referenced audio<br />- takes signed ("+" or "-") [CSS2 numbers](https://www.w3.org/TR/CSS2/syndata.html#numbers) followed by "dB" | ✅<br />- limited to integer values between _+50dB_ and _-50dB_ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.1) | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#audio)<br />- maximum range is -/+40dB, but effective range may be smaller | ❌ |
|  | `[speed]` | defines the playback speed of the referenced audio in percentage<br />- takes a positive real percentage value, e.g., "90%" | ✅<br />- limited to integer values between 50% and 200% | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.1) | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#audio)<br />- allowed range is 50-200%<br />- values outside that range may be adjusted to be within range | ❌ |
|  | `[repeatCount]` | defines how often to loop the audio as a positive integer | ✅ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.1) | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#audio) | ❌ |
|  | `[repeatDur]` | defines the total duration of repeatedly rendering the media | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.1) | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#audio)<br />- limits duration after `clipBegin`, `clipEnd`, `repeatCount` and `speed` have been applied | ❌ |
|  | `[fetchtimeout]` | specifies the timeout for fetches as a [time designation](https://www.w3.org/TR/speech-synthesis11/#def_time_designation) | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.1) | ❌ | ❌ | ❌ |
|  | `[fetchhint]` | tells the synthesis processor if it may pre-fetch audio<br />- `safe`<br />- `prefetch` | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.1) | ❌ | ❌ | ❌ |
|  | `[maxage]` | indicates the maximum age of content that the document is willing to use, as a non-negative integer | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.1) | ❌ | ❌ | ❌ |
|  | `[maxstale]` | indicates the maximum additional time over `maxage` of content that the document is willing to use, as a non-negative integer | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.3.1) | ❌ | ❌ | ❌ |

```xml
<!-- plays audio file twice -->
<audio src="sound.mp3" repeatCount="2" />
<!-- plays audio file starting at 30 seconds and ends after 30 seconds -->
<audio src="speech.mp3" clipBegin="30s" clipEnd="60s">
    If the audio file fails to play or non-audible output is being generated, this will be read instead.
</audio>
```

### &lt;desc&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<desc>`** |  | adds a description to the audio file, e.g., describing sound effects like "_door slamming_"<br />- optional element that may only occur inside of the `<audio>` element | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#edef_desc) | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#audio)<br />- contents are rendered as speech if the audio file cannot be played | ❌ |

```xml
<audio src="ichbineinberliner.wav">
    Ich bin ein Berliner.
    <desc>John F. Kennedey's "Berliner" Speech</desc>
</audio>
```

### &lt;seq&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<seq>`** |  | element that allows to play media elements one after the other<br />- can only contain `<seq>`, `<par>` and `<media>` elements<br />- the beginning and end child elements can have offsets | ❌ | ❌ | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#seq) | ❌ |

### &lt;par&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<par>`** |  | element that allows play media elements parallel to each other<br />- can only contain `<seq>`, `<par>` and `<media>` elements<br />- child elements take the beginning time of the `<par>` container<br />- `begin` attribute is ignored on the `par` container, time is set at the location of the element in the text<br />- if child`<media>` elements define a `begin` or `end` time, the offset is relative to the `<par>` container | ❌ | ❌ | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#par) | ❌ |

### &lt;media&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<media>`** |  | defines a layer within a `<par>` or `<seq>` element<br />- may only contain SSML `<speak>` or `<audio>` elements | ❌ | ❌ | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#media) | ❌ |
|  | `[xml:id]` | specifies a unique XML identifier for this element | ❌ | ❌ | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#media)<br />- must match the regular expression `([-_#]\p{L}\|\p{D})+` ([W3 Specification](https://www.w3.org/TR/xml-id/)) | ❌ |
|  | `[begin]` | defines an offset from the start of the media to begin rendering as a [time designation](https://www.w3.org/TR/speech-synthesis11/#def_time_designation) | ❌ | ❌ | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#media) | ❌ |
|  | `[end]` | defines an offset from the start of the media to end rendering as a [time designation](https://www.w3.org/TR/speech-synthesis11/#def_time_designation) | ❌ | ❌ | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#media) | ❌ |
|  | `[repeatCount]` | specifies how many times to repeat the media as a real number | ❌ | ❌ | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#media) | ❌ |
|  | `[repeatDur]` | specifies a time limit on the play time duration of the inserted media as a [time designation](https://www.w3.org/TR/speech-synthesis11/#def_time_designation) | ❌ | ❌ | ❌ | [✅](https://cloud.google.com/text-to-speech/docs/ssml#media) | ❌ |
|  | `[soundLevel]` | defines the relative volume of the referenced media<br />- takes signed ("+" or "-") [CSS2 numbers](https://www.w3.org/TR/CSS2/syndata.html#numbers) followed by "dB" | ❌                                                  | ❌                                        | ❌                                        | [✅](https://cloud.google.com/text-to-speech/docs/ssml#media)<br />- maximum range is -/+40dB, but effective range may be smaller | ❌ |
|  | `[fadeInDur]` | defines a duration during which the media will fade in from silence to the `soundLevel`<br />- takes a [time designation](https://www.w3.org/TR/speech-synthesis11/#def_time_designation) | ❌                                                  | ❌                                        | ❌                                        | [✅](https://cloud.google.com/text-to-speech/docs/ssml#media) | ❌ |
|  | `[fadeOutDur]` | defines a duration during which the media will fade out from the `soundLevel` to silence<br />- takes a [time designation](https://www.w3.org/TR/speech-synthesis11/#def_time_designation) | ❌                                                  | ❌                                        | ❌                                        | [✅](https://cloud.google.com/text-to-speech/docs/ssml#media) | ❌ |



## Amazon Polly

### &lt;amazon:auto-breath/&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<amazon:auto-breath/>`** |  | adds a single breathing sound | ❌ | ❌ | [✅](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#breath-tag)<br />- only supported by Polly | ❌ | ❌ |
|  | `duration` | controls the length of the breath<br />- valid values are `default`, `x-short`, `short`, `medium` (default), `long`, `x-long` | ❌ | ❌ | [✅](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#breath-tag) | ❌ | ❌ |
|  | `volume` | controls the loudness of the breather<br />- valid values are `default`, `x-soft`, `soft`, `medium` (default), `loud`, `x-loud` | ❌ | ❌ | [✅](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#breath-tag) | ❌ | ❌ |

### &lt;amazon:auto-breaths&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<amazon:auto-breaths>`** |  | adds breathings sounds automatically at appropriate intervals to the contained text | ❌ | ❌ | [✅](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#breath-tag) | ❌ | ❌ |
|  | `duration` | controls the length of the breaths<br />- valid values are `default`, `x-short`, `short`, `medium` (default), `long`, `x-long` | ❌ | ❌ | [✅](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#breath-tag) | ❌ | ❌ |
|  | `frequency` | controls how often breathing sounds occur in the                                             text<br />- valid values are `default`, `x-low`, `low`, `medium` (default), `high`, `x-high` | ❌ | ❌ | [✅](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#breath-tag) | ❌ | ❌ |
|  | `volume` | controls the loudness of the breathers<br />- valid values are `default`, `x-soft`, `soft`, `medium` (default), `loud`, `x-loud` | ❌ | ❌ | [✅](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#breath-tag) | ❌ | ❌ |

### &lt;amazon:domain&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<amazon:domain>`** |  | applies different speaking styles to the speech | ❌ | ❌ | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#amazon-domain) | ❌ | ❌ |
|  | `name` | defines the name of the specific speaking style to apply to the voice<br />- `conversational`: sound less formal, more as if talking to friends or family _(requires the Matthew or Joanna voice)_<br />- `long-form`: style suitable for long-form content like podcasts, blogs, articles _(only available in English (US) and not compatible with `<voice>`)_<br />- `music`: style the speech as if talking about music, videos or other multi-media content _(only available in English (US) and not compatible with `<voice>`)_<br />- `news`: style the speech similar to TV or radio news hosts _(requires the Matthew, Joanna or Lupe voice, only available in English (US) and English (AU))_ | ❌ | ❌ | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#amazon-domain) | ❌ | ❌ |

### &lt;amazon:effect&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<amazon:effect>`** |  | applies an effect to the voice | ❌ | ❌ | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#amazon-effect) | ❌ | ❌ |
|  | `name` | defines the name of the specific effect to apply to the voice<br />- `whispered`: applies a whispering effect<br />- `soft`: speaks softly<br />- `drc`: adds [dynamic range compression](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#drc-tag) | ❌ | ❌ | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#amazon-effect)<br />- `soft` and `whispered` not available with Neural Voices | ❌ | ❌ |
| | `vocal-tract-length` | defines the tonal quality (so you can differentiate between speech even when using the same voice)<br />- uses absolute percentage values, e.g., _110%_, or relative percentage values, e.g., _+50%_ or _-20%_ | ❌ | ❌ | [✅](https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#vocaltractlength-tag)<br />- not available with Neural Voices | ❌ | ❌ |

### &lt;amazon:emotion&gt;

| Element | Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **`<amazon:emotion>`** |  | makes the voice express a specific emotion | ❌ | ❌ | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#amazon-emotion) | ❌ | ❌ |
|  | `name` | defines the name of the specific emotion to apply to the voice<br />- `excited`<br />- `disappointed` | ❌ | ❌ | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#amazon-emotion) | ❌ | ❌ |
|  | `intensity` | defines the intensity of the specific emotion<br />- `low`<br />- `medium`<br />- `high` | ❌ | ❌ | [✅](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#amazon-emotion) | ❌ | ❌ |



# Generic Attributes

| Attribute | Description | LSML (lecture.js) | SSML | Amazon Polly | Google Cloud TTS | OpenMARY |
| --- | --- | --- | --- | --- | --- | --- |
| **`<onlangfailure>`** | defines the reaction to a language speaking failure of the synthesis processor<br />- applicable on all elements with `xml:lang` attribute<br />- `changevoice`: makes the processor switch to another voice that can speak the content and is available<br />- `ignoretext`: makes the processor not attempt to render the text<br />- `ignorelang`: ignores the change in language and speaks as if still using the previous language<br />- `processorchoise`: makes the processor choose on of the behaviors above | ❌ | [✅](https://www.w3.org/TR/speech-synthesis11/#S3.1.13) | ❌ | ❌ | ❌ |