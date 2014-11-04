// Overall
var fs = require('fs');
var url = require('url');
var path = require('path');

var config;

function parseConfig(rawText) {
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
config = parseConfig(fs.readFileSync(bookSourceDir + '/config.yml').toString());


// Parse TOC
var TOCRawText = fs.readFileSync(bookSourceDir + '/source/TOC.md').toString();
var TOCTree = (function(){
	var TOCArray = TOCRawText.replace(/\n\n/g, '\n').split('\n'); // It no longer has empty lines and now is an array
	var TOCBlocks = [];
	var TOCChapters = [];
	for (var i = 0; i < TOCArray.length; i++) {
		if (TOCArray[i].indexOf('# ') == 0) {
			TOCBlocks.push({
				'title' : TOCArray[i].replace('# ', ''),
				'position' : (i - TOCBlocks.length) // Title before chapter #i
			});
		} else if (TOCArray[i].indexOf('- ') == 0) {
			TOCChapters.push(TOCArray[i].replace('- ', ''));
		} else {
			return false;
			console.log('TOC parse error');
		}
	};
	return [ TOCBlocks, TOCChapters ];
})(TOCRawText);
var TOCBlocks = TOCTree[0];
var TOCChapters = TOCTree[1];
fs.writeFileSync(bookSourceDir + '/product/blocks.json', JSON.stringify(TOCBlocks));
fs.writeFileSync(bookSourceDir + '/product/chapters.json', JSON.stringify(TOCChapters));


// Filling out the template
function templateFill(templateName, content) {
	var templateRawText = fs.readFileSync(bookSourceDir + '/template/' + templateName + '.html').toString();
	var replacedText = templateRawText;

	replacedText = replacedText.replace(/__ meta\.copyright __/ig, config.copyright);
	replacedText = replacedText.replace(/__ book\.title __/ig, config.title);
	replacedText = replacedText.replace(/__ book\.brief __/ig, config.brief);
	replacedText = replacedText.replace(/__ meta\.author __/ig, config.author);
	replacedText = replacedText.replace(/__ meta\.year __/ig, config.year);

	replacedText = replacedText.replace(/__ chapter\.content __/ig, content);
	
	if (arguments.length == 3) {
		var chapterIndex = arguments[2];
		replacedText = replacedText.replace(/__ chapter\.title __/ig, TOCChapters[chapterIndex]);
	};

	return replacedText;
};


// When I run app.js
for (var i = 0; i < TOCChapters.length; i++) {
	var chapterRawText = fs.readFileSync(bookSourceDir + '/source/' + i + '.html').toString();
	fs.writeFileSync(bookSourceDir + '/product/chapter-' + i + '.html', templateFill('chapter', chapterRawText, i));
};

console.log("Compilation completed.");