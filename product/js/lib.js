window.bamboo = {};

bamboo.currentChapterNumber = (function (n) {
	if (n) {
		if (n[0].match(/[0-9]+/).length) {
			return Number(n[0].match(/[0-9]+/)[0]);
		}
	} else {
		return null;
	};
})(window.location.href.match(/chapter-[0-9]*\.html/));

bamboo.wget = function (url) {
	var x = new XMLHttpRequest();
	x.open("GET", url, false);
	x.send();
	return x.responseText;
};

bamboo.json = function (url) {
	return JSON.parse(bamboo.wget(url));
};

bamboo.detectEdgesOfBook = function () {
	var chapters = bamboo.json("meta/chapters.json");
	document.getElementById('nav-prev').href = 'chapter-' + (bamboo.currentChapterNumber - 1) + '.html';
	document.getElementById('nav-next').href = 'chapter-' + (bamboo.currentChapterNumber + 1) + '.html';
	document.getElementById('nav-prev-span').innerHTML = '<span class=\"num\">Back</span><span class=\"chapter-title\">' + chapters[(bamboo.currentChapterNumber - 2)] + '</span>';
	document.getElementById('nav-next-span').innerHTML = '<span class=\"num\">Next</span><span class=\"chapter-title\">' + chapters[(bamboo.currentChapterNumber + 0)] + '</span>';
	if (bamboo.currentChapterNumber) {
		if (bamboo.currentChapterNumber == 1) {
			document.getElementById('nav-prev').remove();
		} else if (bamboo.currentChapterNumber == chapters.length) {
			document.getElementById('nav-next').remove();
		};
	};
};
