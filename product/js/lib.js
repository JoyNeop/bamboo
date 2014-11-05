window.bamboo = {};

bamboo.getCurrentChapterNumber = function () {
	return Number(window.location.href.match(/chapter-[0-9]*\.html/)[0].match(/[0-9]+/)[0]);
};

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
	if (bamboo.getCurrentChapterNumber() == 0) {
		document.getElementById("nav-prev").remove();
		document.getElementById("nav-next").href = "chapter-" + (bamboo.getCurrentChapterNumber() + 1) + ".html";
	} else if (bamboo.getCurrentChapterNumber() == chapters.length - 1) {
		document.getElementById("nav-next").remove();
		document.getElementById("nav-prev").href = "chapter-" + (bamboo.getCurrentChapterNumber() - 1) + ".html";
	} else {
		document.getElementById("nav-prev").href = "chapter-" + (bamboo.getCurrentChapterNumber() - 1) + ".html";
		document.getElementById("nav-next").href = "chapter-" + (bamboo.getCurrentChapterNumber() + 1) + ".html";
	}
};