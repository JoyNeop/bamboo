// Overall
var fs = require('fs');
var url = require('url');
var path = require('path');

var parseConfig = function (rawText) {
	var c = { 'generator' : 'Bamboo' };
	var configArray = rawText.replace(/\n\n/g, '\n').split('\n'); // It no longer has empty lines and now is an array
	var configModel = [];
	for (var i = 0; i < configArray.length; i++) {
		// User input syntax will not be validated
		// To be fixed later
		c[configArray[i].split(': ')[0]] = configArray[i].split(': ')[1];;
	};
	return c;
};


// Default
var bookSourceDir = __dirname;
var config = parseConfig(fs.readFileSync(bookSourceDir + '/config.yml').toString());

// Parse TOC
var TOCRawText = fs.readFileSync(bookSourceDir + '/source/TOC.md').toString();
var TOCTree = (function(tocRawText){
	var tocArray = tocRawText.replace(/\n\n/g, '\n').split('\n'); // It no longer has empty lines and now is an array
	var tocBlocks = [];
	var tocChapters = [];
	for (var i = 0; i < tocArray.length; i++) {
		if (tocArray[i].indexOf('# ') == 0) {
			// Regular block title
			tocBlocks.push({
				'title' : tocArray[i].replace('# ', ''),
				'position' : (i - tocBlocks.length) // Title before chapter #i
			});
		} else {
			tocChapters.push(tocArray[i]);
		}
	};
	return [ tocBlocks, tocChapters ];
})(TOCRawText.replace(/^\s\s*/g, '').replace(/\s\s*$/g, ''));
var TOCBlocks = TOCTree[0];
var TOCChapters = TOCTree[1];
fs.writeFileSync(bookSourceDir + '/product/meta/blocks.json', JSON.stringify(TOCBlocks));
fs.writeFileSync(bookSourceDir + '/product/meta/chapters.json', JSON.stringify(TOCChapters));


// Filling out the template
var templateFill = function (templateName, content) {
	var templateRawText = fs.readFileSync(bookSourceDir + '/template/' + templateName + '.html').toString();

	// Remove comments at the beginning of the template which may contain liense information
	// Whereas that license information doesn't affect generated HTML documents
	if (templateRawText.indexOf('<!--') == 0) {
		templateRawText = templateRawText.split('\n-->\n')[1];
	};

	var replacedText = templateRawText;

	replacedText = replacedText.replace(/\{\{ meta\.copyright \}\}/ig, config.copyright);
	replacedText = replacedText.replace(/\{\{ book\.title \}\}/ig, config.title);
	replacedText = replacedText.replace(/\{\{ book\.brief \}\}/ig, config.brief);
	replacedText = replacedText.replace(/\{\{ book\.language \}\}/ig, config.language);
	replacedText = replacedText.replace(/\{\{ meta\.author \}\}/ig, config.author);
	replacedText = replacedText.replace(/\{\{ meta\.year \}\}/ig, config.year);

	replacedText = replacedText.replace(/\{\{ chapter\.content \}\}/ig, content);

	if (arguments.length == 3) {
		var chapterIndex = arguments[2];
		replacedText = replacedText.replace(/\{\{ chapter\.title \}\}/ig, TOCChapters[chapterIndex]);
	};

	return replacedText;
};


// When I run app.js
for (var i = 0; i < TOCChapters.length; i++) {
	var chapterRawText = fs.readFileSync(bookSourceDir + '/source/' + i + '.html').toString();
	fs.writeFileSync(bookSourceDir + '/product/chapter-' + i + '.html', templateFill('chapter', chapterRawText, i));
};

console.log("Compilation completed.");
