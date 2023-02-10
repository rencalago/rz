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
const home = document.querySelector(".home");

//new variables
let counter = 0;
let newSlide = sliding.slice(0, 4);
let newItem = [];

//EVENT LISTENER
window.addEventListener("DOMContentLoaded", function () {
  homeBtn();
  goSlide();
  heroPosts(recentPosts);
  funLabels();
  footerC();
  setInterval(goSlide, 2500);
});
viewBtn.addEventListener("click", viewAll);

//FEATURED IMAGES
const featureItem = newSlide
  .map(function (item) {
    return `<div class="slider-container">
          <div class="px-left">
            <img src="${item.imagesrc}" alt="" class="myImage" />
          </div>
          <div class="slider-contents">
            <div class="slider-title"><h2><a href="${item.link}">${item.title}</a></h2></div>
            <div class="dotted-dashed"></div>
            <div class="description">
              <p>
                ${item.desc}
              </p>
            </div>
            <div class="readmore-btn">
              <button type="btn" class="btn"><a href="${item.link}">read more</a></button>
            </div>
          </div>
        </div>`;
  })
  .join(" ");
sliderOption.innerHTML = featureItem;
const sliderContainer = sliderOption.querySelectorAll(".slider-container");
sliderContainer.forEach(function (slide, index) {
  slide.style.left = `${index * 100}%`;
});

//slide nav
const boxC = document.createElement("div");
boxC.classList.add("box-container");
featured.appendChild(boxC);
const secondFeature = newSlide
  .map(function (item) {
    return `<div class="sliding-box" data-id="${counter++}"></div>`;
  })
  .join("");
boxC.innerHTML = secondFeature;
const slidingBox = boxC.querySelectorAll(".sliding-box");
//functions
function goSlide(e) {
  sliderContainer.forEach(function (slide) {
    if (counter > newSlide.length - 1) {
      counter = 0;
    }
    slide.style.transform = `translateX(-${counter * 100}%)`;
  });
  /*for (let i = 0; i < slidingBox.length; i++) {
    if (slidingBox[i].dataset.id == counter) {
      slidingBox[i].style.backgroundColor = "#1d9bf0";
    } else {
      slidingBox[i].style.backgroundColor = "#fff";
    }
  } */

  slidingBox.forEach(function (box) {
    if (box.dataset.id == counter) {
      box.style.backgroundColor = "#1d9bf0";
    } else {
      box.style.backgroundColor = "#fff";
    }
    box.addEventListener("click", function (e) {
      const item = e.currentTarget.dataset.id;
      counter = item;
      sliderContainer.forEach(function (slide) {
        slide.style.transform = `translateX(-${item * 100}%)`;
      });
    });
  });

  counter++;
}

//main post function

function heroPosts(heroItems) {
  let displayPosts = heroItems
    .map(function (post) {
      return `<div class="mainPost-container">
              <div class="post-image">
                <a href="${post.link}"><img
                  src= "${post.imagesrc}"
                  alt=""
                  class="post-img"
                /></a>
              </div>
              <div class="post-content">
                <div class="post-titles">
                  <h1 class="post-title">
                    <a href="${post.link}">${post.title}</a>
                  </h1>
                </div>
                <div class="post-desc">
                  <p>
                    ${post.desc}
                  </p>
                </div>
                <div class="post-essentials">
                  <div class="date-posted">${post.datePublished}</div>
                  <div class="comments">
                    <i class="fa-solid fa-message"></i
                    ><span class="comments-number">${post.comments}</span>
                  </div>
                </div>
              </div>
            </div>`;
    })
    .join("");
  mainPosts.innerHTML = displayPosts;
}
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

function viewAll() {
  heroPosts(recentPosts);
}

//for the footer
const today = new Date().getFullYear();

function footerC() {
  footerContents.innerHTML = `Copyright © ${today} • rencalago BLOG • All Rights Reserved`;
}

//HOME BTN
function homeBtn() {
  home.addEventListener("click", function (e) {
    window.location = "https://www.rencalago.com/";
    console.log(e);
  });
}
