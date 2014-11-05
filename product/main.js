function getCurrentChapterNumber() {
	return Number(window.location.href.match(/chapter-[0-9]*\.html/)[0].match(/[0-9]+/)[0]);
};

function wget(url) {
	var x = new XMLHttpRequest();
	x.open("GET", url, false);
	x.send();
	return x.responseText;
};

function json(url) {
	return JSON.parse(wget(url));
};

function detectEdgesOfBook() {
	var chapters = wget("chapters.json");
	if (getCurrentChapterNumber() == 0) {
		document.getElementById("nav-prev-chapter").remove();
		document.getElementById("nav-next-chapter").href = "chapter-" + (getCurrentChapterNumber() + 1) + ".html";
	} else if (getCurrentChapterNumber() == chapters.length - 1) {
		document.getElementById("nav-next-chapter").remove();
		document.getElementById("nav-prev-chapter").href = "chapter-" + (getCurrentChapterNumber() - 1) + ".html";
	};
};

window.onload = function () {
	detectEdgesOfBook();
};