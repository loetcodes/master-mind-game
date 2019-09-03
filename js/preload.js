/* 

Javascript for Preloader Animation

*/

// Check the body content at this point and uncover preloader, check all resources are loaded
let document_state = setInterval(function () {
	if(document.readyState === "complete") {
		clearInterval(document_state);
		let body_tag = document.getElementById("main-body");
		body_tag.className += " loaded";
	}
}, 10);
