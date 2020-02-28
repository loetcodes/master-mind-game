export class Utils {
  preloadWithInterval = timeInterval => {
    let documentState = setInterval(() => {
      if (document.readyState === "complete") {
        clearInterval(documentState);
        const bodyTag = document.getElementById("main-body");
        bodyTag.className += " loaded";

        window.setTimeout(() => {
          const element = document.getElementById("preloader");
          element.style.display = "none";
        }, timeInterval);
      }
    }, 10);
  };
}
