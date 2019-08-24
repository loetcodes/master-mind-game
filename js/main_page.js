/* 

Javascript for MasterMind Gems

Front/Main page loading

*/

function showPage(id) {
	let element = document.getElementById(id);
	element.style.display="flex";
	// element.style.animation-play-state="paused";
	// document.getElementById(id).style.display="flex";
}


function hidePage(id) {
	let element = document.getElementById(id);
	if (element.classList.contains("load-transition")) {
		element.classList.remove("load-transition");
	}
	element.style.display="none";

	// let elements = document.getElementById(id), element_children = elements.getElementsByName("A");
	// element_children.style

	// let div_parent = document.getElementById(row_no),
 //            div_children = div_parent.getElementsByTagName("DIV");

}


function hideAndShow(hideId, showId) {
	hidePage(hideId);
	showPage(showId);
}