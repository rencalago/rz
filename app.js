// let newPost = [
//   {
//     category: "Beach Resort",
//     imagesrc:
//       "https://drive.google.com/uc?id=10nme7clU1_5CXZ7NG6MpgM2whNunI_RX",
//     postNumber: 3,
//     title: "Lalimar Beach Resort - Infinite Relaxation ",
//     desc: "How about taking a dip on its infinite pool while enjoying the sunset view of the horizon? Or just sit in the Cabana with refreshments you craved for.",
//     datePublished: "14 Feb 2023",
//     comments: "14",
//     link: "./lalimar-beach-resort-la-libertad",
//     location: "La Libertad",
//     author: "Ren Calago",
//   },
//   {
//     category: "Cafes & Restaurant",
//     imagesrc:
//       "https://drive.google.com/uc?id=13grQ-pFx34CXhk0NfitlPV0g7n361VyB",
//     postNumber: 3,
//     title: "Victorias Mountainview Resort Tanjay City",
//     desc: "Dine in  while giving your eyes a feast of an amazing view. Victorias Mountainview is simply the best in the city. You will be treated with awesome scenery going to this place.",
//     datePublished: "13 Feb 2023",
//     comments: "",
//     link: "./victorias-mountain-view-tanjay-city",
//     location: "Tanjay City",
//     author: "Ren Calago",
//   },
//   {
//     category: "Cafes & Restaurant",
//     imagesrc:
//       "https://drive.google.com/uc?id=1n8e8tr-5NeiW7jx7K0YMU7SbmliN2OzI",
//     postNumber: 2,
//     title: "Sakada, a cafe on the Mountain",
//     desc: "Order your coffee at this mountain-top restaurant in Pamplona, Negros Oriental. It offers vibrant and cozy atmosphere with views like you've never seen before. ",
//     datePublished: "11 Feb 2023",
//     comments: "2",
//     link: "./sakada-cafe-and-farm-pamplona",
//     location: "Pamplona",
//     author: "Ren Calago",
//   },
//   {
//     category: "Travel",
//     imagesrc:
//       "https://drive.google.com/uc?id=16fR0SpWq1j_5y6cK29xpxYX7Mhg7x6MQ",
//     postNumber: 1,
//     title: "Tops Cebu Lookout - Busay, Cebu City",
//     desc: "See the skyline of Cebu City from up the hill of Busay Cebu City. It has the best view of metropolitan Cebu. I think a month after we visited here, this spot in busay is closed for visitors.",
//     datePublished: "11 Feb 2023",
//     comments: "61",
//     link: "./tops-cebu-look-out",
//     location: "cebu",
//     author: "Ren Calago",
//   },
// ];
import { newPostTwo } from "./allPost.js";
const newPost = newPostTwo;

const recentPosts = newPost.slice(0, 10);
const sliding = [
  recentPosts[0],
  recentPosts[1],
  recentPosts[2],
  recentPosts[3],
  recentPosts[4],
];

const sliderOption = document.querySelector(".slider");
const featured = document.querySelector(".featured");
const mainPosts = document.querySelector(".mainPost");
const labelsContainer = document.querySelector(".labels-container");
const viewBtn = document.querySelector(".vBtn");
const footerContents = document.querySelector(".footer-contents");
const myhome = document.getElementById("home");
const thumbsUp = document.querySelector(".breakAlert");
const today = new Date().getFullYear();
const contact = document.getElementById("contact");

//new variables
let counter = 0;
let newSlide = sliding.slice(0, 5);

//EVENT LISTENER
window.addEventListener("DOMContentLoaded", function () {
  importantElement();
  goSlide();
  heroPosts(recentPosts);
  funLabels();
  setInterval(goSlide, 2500);
  viewBtn.addEventListener("click", viewAll);
  myhome.addEventListener("click", myMomeBtn);
});

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

function myMomeBtn(e) {
  window.location = "./";
}

//Main Menu -- NavBar
function importantElement() {
  class myHeader extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<header>
      <div class="header-container">
        <div class="top-head">
          <h1>
            <span class="fname">ren</span><span class="lname">calago</span>
            <span class="lastOne">Blog</span>
          </h1>
        </div>
        <div class="low-head">
          <div class="menu-items">
            <div class="menuList" id="home">Home</div>
            <div class="menuList">Travels</div>
            <div class="menuList">News</div>
            <div class="menuList">Tech</div>
            <div class="menuList">Inspiration</div>
            <div class="menuList">About</div>
            <div class="menuList" id="contact"><a href="https://www.rencalago.com/contact-us">Contact</a></div>
          </div>
          <div class="hamburger-container">
            <div class="hamburger">
              <div class="box box1"></div>
              <div class="box box2"></div>
              <div class="box box3"></div>
            </div>   
          </div>       
        </div>
      </div>
    </header>`;
    }
  }
  customElements.define("my-header", myHeader);
  const myHome = document.getElementById("home");
  myHome.addEventListener("click", function () {
    window.location = "/";
  });

  const boxMenu = document.querySelector(".hamburger");
  const menuItems = document.querySelector(".menu-items");
  const menuList = document.querySelectorAll(".menuList");

  //Menu on Mobile
  boxMenu.addEventListener("click", function (e) {
    boxMenu.classList.toggle("active");
    menuItems.classList.toggle("active");
    menuList.forEach(function (menu) {
      menu.addEventListener("click", function () {
        boxMenu.classList.remove("active");
        menuItems.classList.remove("active");
      });
    });
  });

  thumbsUp.addEventListener("click", function () {
    window.location = "http://www.rencalagopro.com";
  });

  class myFooter extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<footer>
      <div class="footer-container">
        <div class="footer-contents">
          <div class="footer-left"><p>Copyright © ${today} • Ren Calago blog • All Rights Reserved</p></div>
          <div class="footer-right">
              <a href="https://www.facebook.com/rencalago"
                ><i class="fa-brands fa-facebook" id="footer-facebook"></i
              ></a>
              <a href="https://www.instagram.com/rencalago"
                ><i class="fa-brands fa-instagram" id="footer-instagram"></i
              ></a>
              <a href="https://www.youtube.com/rencalago"
                ><i class="fa-brands fa-youtube" id="footer-youtube"></i
              ></a>
              <a href="https://www.twitter.com/rencalago"
                ><i class="fa-brands fa-twitter" id="footer-twitter"></i></i
              ></a></div></div>
        </div>
      </div>
    </footer>`;
    }
  }
  customElements.define("my-footer", myFooter);

  class sideBar extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<div class="topheader-container">
            <div class="topHeader"><h2>Connect with Us</h2></div>
              <div class="socialMedia">
              <a href="https://www.facebook.com/rencalago"
                ><i class="fa-brands fa-facebook" id="facebook"></i
              ></a>
              <a href="https://www.instagram.com/rencalago"
                ><i class="fa-brands fa-instagram" id="instagram"></i
              ></a>
              <a href="https://www.youtube.com/rencalago"
                ><i class="fa-brands fa-youtube" id="youtube"></i
              ></a>
              <a href="https://www.twitter.com/rencalago"
                ><i class="fa-brands fa-twitter" id="twitter"></i></i
              ></a></div>
          </div>
          <div class="topheader-container">
            <div class="topHeader"><h2>Affiliate</h2></div>
            <div class="box-space"><div class="allAds"><span class="ad-space1">Be Our<br /></span><span class="ad-space2">Partner</span></div></div>
          </div>`;
    }
  }
  customElements.define("my-sidebar", sideBar);
}

//CONTACT
