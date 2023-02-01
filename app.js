const hamburger = document.querySelector(".hamburger");
const menuItems = document.querySelector(".menu-items");
const menuList = document.querySelectorAll(".menulist");

//event listener
hamburger.addEventListener("click", menuBtn);

//functions
function menuBtn(e) {
  hamburger.classList.toggle("active");
  menuItems.classList.toggle("active");
  menuList.forEach(function (menu) {
    menu.addEventListener("click", function () {
      hamburger.classList.remove("active");
      menuItems.classList.remove("active");
    });
  });
}

//social media
const facebook = document.querySelector(".fa-facebook");
const instagram = document.querySelector(".fa-instagram");
const twitter = document.querySelector(".fa-twitter");
const youtube = document.querySelector(".fa-youtube");

facebook.addEventListener("click", function () {
  window.location = "https://www.facebook.com/rencalago";
});

twitter.addEventListener("click", function () {
  window.location = "https://www.twitter.com/rencalago";
});

instagram.addEventListener("click", function () {
  window.location = "https://www.instagram.com/rencalago";
});

youtube.addEventListener("click", function () {
  window.location = "https://www.youtube.com/rencalago";
});
