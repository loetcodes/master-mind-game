/* 

Javascript for MasterMind Gems

Front/Main page loading

*/

function showPage(id) {
	// Internal page navigation only
	let element = document.getElementById(id);
	element.style.display="grid";
	window.location = "#" + id;
	// element.style.animation-play-state="paused";
	// document.getElementById(id).style.display="grid";
}


function hidePage(id) {
	let element = document.getElementById(id);
	// if (element.classList.contains("onstart-load")) {
	// 	element.classList.remove("onstart-load");
	// }
	element.style.display="none";

	// let elements = document.getElementById(id), element_children = elements.getElementsByName("A");
	// element_children.style

	// let div_parent = document.getElementById(row_no),
 //            div_children = div_parent.getElementsByTagName("DIV");

}


function hideAndShow(hideId, showId) {
	let current_pg = document.getElementById(hideId);

	if (current_pg.classList.contains("onstart-load")) {
		current_pg.classList.remove("onstart-load");
	}

	current_pg.className += " unload";

	window.setTimeout( () => {
		hidePage(hideId);
		showPage(showId);

		// remember to remove the unload class from the previous element
		if (current_pg.classList.contains("unload")) {
			current_pg.classList.remove("unload");
		}

	}, 2000);
	
}