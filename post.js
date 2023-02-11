let newPost = [
  {
    category: "Travel",
    imagesrc:
      "https://drive.google.com/uc?id=1Z66jNKibvN-Hg6QhEwIo1eWU2Wz70ndu",
    postNumber: 1,
    title: "Tops Cebu Lookout - Busay, Cebu City",
    desc: "See the skyline of Cebu City from up the hill of Busay Cebu City. It has the best view of metropolitan Cebu. I think a month after we visited here, this spot in busay is closed for visitors.",
    datePublished: "1/3/2023",
    comments: "61",
    link: "https://www.rencalago.com/tops-cebu-look-out",
    location: "cebu",
  },
];
const recentPosts = newPost.slice(0, 6);
const sliding = [recentPosts[0]];

// let mainArticles = recentPosts.slice(0, 2);
// console.log(mainArticles);

const sliderOption = document.querySelector(".slider");
const featured = document.querySelector(".featured");
const mainPosts = document.querySelector(".mainPost");
const labelsContainer = document.querySelector(".labels-container");
const viewBtn = document.querySelector(".vBtn");
const footerContents = document.querySelector(".footer-contents");
const myhome = document.getElementById("home");

//new variables
let counter = 0;
let newSlide = sliding.slice(0, 4);
let newItem = [];

//EVENT LISTENER
window.addEventListener("DOMContentLoaded", function () {
  funLabels();
  footerC();
});
myhome.addEventListener("click", myMomeBtn);

//LABELS
function funLabels() {
  const categories = recentPosts.reduce(
    function (values, item) {
      if (!values.includes(item.category)) {
        values.push(item.category);
      }
      return values;
    },
    ["all"]
  );

  let myLabel = categories
    .map(function (item) {
      return `<div class="label-select" data-id="${item}">${item}</div>`;
    })
    .join("");
  labelsContainer.innerHTML = myLabel;
  const myBtn = labelsContainer.querySelectorAll(".label-select");
  myBtn.forEach(function (btn) {
    btn.addEventListener("click", function (item) {
      const category = item.currentTarget.dataset.id;
      //   console.log(category);
      const menuCategory = newPost.filter(function (ray) {
        if (ray.category === category) {
          return ray;
        }
      });
      if (category === "all") {
        heroPosts(newPost);
      } else {
        heroPosts(menuCategory);
      }
    });
  });
}
//for the footer
const today = new Date().getFullYear();

function footerC() {
  footerContents.innerHTML = `Copyright © ${today} • rencalago BLOG • All Rights Reserved`;
}

//HOME BTN
function myMomeBtn(e) {
  window.location = "./";
}
