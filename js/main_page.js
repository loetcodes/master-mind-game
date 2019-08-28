/* 

Javascript for MasterMind Gems

Front/Main page loading

*/

function showPage(id) {
	let element = document.getElementById(id);
	element.style.display="grid";
	// element.style.animation-play-state="paused";
	// document.getElementById(id).style.display="grid";
}


function hidePage(id) {
	let element = document.getElementById(id);
	if (element.classList.contains("onstart-load")) {
		element.classList.remove("onstart-load");
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