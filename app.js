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
			// Chapter title
			tocChapters.push(tocArray[i]);
		}
	};
	return [ tocBlocks, tocChapters ];
})(TOCRawText.trim());
var TOCBlocks = TOCTree[0];
var TOCChapters = TOCTree[1];
fs.writeFileSync(bookSourceDir + '/product/meta/blocks.json', JSON.stringify(TOCBlocks));
fs.writeFileSync(bookSourceDir + '/product/meta/chapters.json', JSON.stringify(TOCChapters));

// Filling out the `chapter` template
var templateChapterFill = function (templateName, content) {
	var templateRawText = fs.readFileSync(bookSourceDir + '/template/' + templateName + '.html').toString();

	// Remove comments at the beginning of the template which may contain liense information
	// Whereas that license information doesn't affect generated HTML documents
	templateRawText = templateRawText.replace(/^<--.*?-->/, '');

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

// Filling out the `index` template
var templateIndexFill = function (TOCTree) {
	var content = '';
	var listItemHtml = fs.readFileSync(bookSourceDir + '/template/toc-list-item.html').toString();
	var indexHtml = fs.readFileSync(bookSourceDir + '/template/index.html').toString();
	for (var _i = 0; _i < TOCTree[1].length; _i++) {
		var i = _i+1;
		content += listItemHtml.replace(/\{\{ iterator \}\}/ig, i).replace(/\{\{ title \}\}/ig, TOCTree[1][_i]);
	};

	var replacedText = indexHtml;
	replacedText = replacedText.replace(/\{\{ meta\.copyright \}\}/ig, config.copyright);
	replacedText = replacedText.replace(/\{\{ book\.title \}\}/ig, config.title);
	replacedText = replacedText.replace(/\{\{ book\.brief \}\}/ig, config.brief);
	replacedText = replacedText.replace(/\{\{ book\.language \}\}/ig, config.language);
	replacedText = replacedText.replace(/\{\{ meta\.author \}\}/ig, config.author);
	replacedText = replacedText.replace(/\{\{ meta\.year \}\}/ig, config.year);
	replacedText = replacedText.replace(/\{\{ chapter\.content \}\}/ig, content);
	replacedText = replacedText.replace(/\{\{ book\.toc \}\}/ig, content);

	return replacedText.replace(/\{\{ book\.toc \}\}/ig, content);

};

// When I run app.js
for (var _i = 0; _i < TOCChapters.length; _i++) {
	var i = _i+1;
	var chapterRawText = fs.readFileSync(bookSourceDir + '/source/' + i + '.html').toString();
	fs.writeFileSync(bookSourceDir + '/product/chapter-' + i + '.html', templateChapterFill('chapter', chapterRawText, i));
};
fs.writeFileSync(bookSourceDir + '/product/index.html', templateIndexFill(TOCTree));

// Done
console.log("Compilation completed.");
