//important variables
const today = new Date().getFullYear();
const labelsContainer = document.querySelector(".labels-container");
const postingMeta = document.querySelector(".posting-meta");
import { newPostTwo } from "./allPost.js";
import { SITE_URL, FB_APP_ID, FB_SDK_VERSION } from "./config.js";
//Event Listener
window.addEventListener("DOMContentLoaded", function () {
  importantElement();
  funLabels();
  articleEssential();
  myMenu();
  loadComments();
});

//Main Menu -- NavBar
function importantElement() {
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
            <div class="box-space"><div class="allAds"><span class="ad-space1">Be Our Ad<br /></span><span class="ad-space2">Partner</span></div></div>
          </div>`;
    }
  }
  customElements.define("my-sidebar", sideBar);

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
            <div class="menuList">Contact</a></div>
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
}

//FUNCTIONS

const newPost = newPostTwo;

//LABELS
function funLabels() {
  const categories = newPost.reduce(
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
      window.location = `./#`;
    });
  });
}

//author and datePublished
let myDate;
let myAuthor;
function articleEssential() {
  const articleTitle = postingMeta.previousElementSibling.dataset.id;
  newPost.filter(function (posting) {
    if (posting.postNumber == articleTitle) {
      myDate = posting.datePublished;
      myAuthor = posting.author;
    }
  });
  postingMeta.innerHTML = `<p><span class="author"><i class="fa-solid fa-user"></i> ${myAuthor} </span><span class="postDate"></span><i class="fa-regular fa-clock"></i> ${myDate}</span></p>`;
}

//FACEBOOK COMMENTS
// The post is matched by its file name (e.g. /tops-cebu-look-out or
// /tops-cebu-look-out.html) against the "link" in allPost.js. Pages that are
// not listed there (contact, 404, leftover copies) get no comment section.
function loadComments() {
  const slug = (window.location.pathname.split("/").filter(Boolean).pop() || "")
    .replace(/\.html$/i, "");
  const post = newPost.find(function (item) {
    return item.link.replace("./", "") === slug;
  });
  const container = document.querySelector(".post-container");
  if (!post || !container) return;

  // Every post gets one stable address, so its comments never get split
  // between /post and /post.html
  const postUrl = `${SITE_URL}/${slug}`;

  const section = document.createElement("section");
  section.id = "comments";
  section.className = "comments-section";
  section.innerHTML = `<br><h2 class="comments-heading">Comments</h2><br>
    <div id="fb-root"></div>
    <div class="fb-comments" data-href="${postUrl}" data-width="100%" data-numposts="10"></div>
    <noscript>Please enable JavaScript to view the comments.</noscript>`;
  container.appendChild(section);

  // If the visitor arrived through the comment bubble (...#comments), the
  // section did not exist yet when the browser tried to jump to it.
  if (window.location.hash === "#comments") {
    section.scrollIntoView();
    window.addEventListener("load", function () {
      section.scrollIntoView();
    });
  }

  function startFacebook() {
    // SDK already on the page: just draw the box.
    if (window.FB && window.FB.XFBML) {
      window.FB.XFBML.parse(section);
      return;
    }
    if (document.getElementById("facebook-jssdk")) return;
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src =
      `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=${FB_SDK_VERSION}` +
      (FB_APP_ID ? `&appId=${FB_APP_ID}` : "");
    document.body.appendChild(script);
  }

  // Load Facebook only when the reader gets near the comments (keeps the
  // article fast, which also helps AdSense and Core Web Vitals).
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries, obs) {
        if (entries.some((entry) => entry.isIntersecting)) {
          obs.disconnect();
          startFacebook();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(section);
  } else {
    startFacebook();
  }
}

//MENULIST
function myMenu() {
  const menuList = document.querySelectorAll(".menuList");
  menuList.forEach(function (menu) {
    menu.addEventListener("click", function (e) {
      const menuItem = e.currentTarget.textContent;
      if (menuItem == "home") {
        window.location = "./";
      } else if (menuItem == "News") {
        window.location = "./#";
      } else if (menuItem == "Tech") {
        window.location = "./#";
      } else if (menuItem == "Inspiration") {
        window.location = "./#";
      } else if (menuItem == "About") {
        window.location = "./#";
      } else if (menuItem == "Contact") {
        window.location = "./contact";
      } else {
        window.location = "./";
      }
    });
  });
}
