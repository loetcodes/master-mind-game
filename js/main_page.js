/* 
Javascript for MasterMind Gems
Front/Main page loading
*/

// Internal page navigation only
const showPage = pageId => {
  const element = document.getElementById(pageId);
  element.style.display = "grid";
  window.location = "#" + pageId;
};

const hidePage = pageId => {
  const element = document.getElementById(pageId);
  element.style.display = "none";
};

const animatePageHiding = pageId => {
  const currentPg = document.getElementById(pageId);
  if (currentPg.classList.contains("onstart-load")) {
    currentPg.classList.remove("onstart-load");
  }
  currentPg.className += " unload";
};

const resetPageStyle = pageId => {
  const currentPg = document.getElementById(pageId);
  if (currentPg.classList.contains("unload")) {
    currentPg.classList.remove("unload");
  }
};

const hideAndShow = (hideId, showId) => {
  animatePageHiding(hideId);

  window.setTimeout(() => {
    hidePage(hideId);
    showPage(showId);
    resetPageStyle(hideId);
  }, 1500);
};