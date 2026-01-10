const menuButton = document.querySelector("#menu");
const nav = document.querySelector("#nav");

menuButton.addEventListener("click", () => {
  nav.classList.toggle("open");
  menuButton.setAttribute(
    "aria-expanded",
    nav.classList.contains("open")
  );
});
