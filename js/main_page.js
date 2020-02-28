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
  const current_pg = document.getElementById(pageId);
  if (current_pg.classList.contains("onstart-load")) {
    current_pg.classList.remove("onstart-load");
  }
  current_pg.className += " unload";
};

const resetPageStyle = pageId => {
  const current_pg = document.getElementById(pageId);
  if (current_pg.classList.contains("unload")) {
    current_pg.classList.remove("unload");
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

const delay = (url) => {
  window.setTimeout(() => {
    window.location = url;
  }, 1500)
}
