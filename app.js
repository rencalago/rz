const text = document.querySelector(".website-title .nav-branding");
const strText = text.textContent;
const splitText = strText.split("");
text.textContent = "";

for (let i = 0; i < splitText.length; i++) {
  text.innerHTML += "<span>" + splitText[i] + "</span>";
}

let char = 0;
let timer = setInterval(onTick, 50);
function onTick() {
  const span = text.querySelectorAll("span")[char];
  span.classList.add("fade");
  char++;
  if (char === splitText.length) {
    complete();
    return;
  }
}

function complete() {
  clearInterval(timer);
  timer = null;
}

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const featured = document.querySelector(".featured");

hamburger.addEventListener("click", () => {
  const goodValue = hamburger.classList.contains("active");
  const goodValue2 = navMenu.classList.contains("active");

  if (goodValue && goodValue2) {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    featured.style.marginTop = "0.1px";
  } else {
    hamburger.classList.add("active");
    navMenu.classList.add("active");
    featured.style.marginTop = "165px";
  }
});

document.querySelectorAll(".nav-link").forEach((n) =>
  n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    featured.style.marginTop = "0.1px";
  })
);

const quotes = [
  {
    quote: "We become what we think about.",
    author: "Earl Nightingale",
  },
  {
    quote:
      "The most difficult thing is the decision to act, the rest is merely tenacity.",
    author: "Amelia Earhart",
  },
  {
    quote: "Definiteness of purpose is the starting point of all achievement.",
    author: "W. Clement Stone",
  },
  {
    quote: "Life isn't about getting and having, it's about giving and being.",
    author: "Kevin Kruse",
  },
  {
    quote: "Life is what happens to you while you’re busy making other plans.",
    author: "John Lennon",
  },
  {
    quote:
      "Twenty years from now you will be more disappointed by the things that you didn’t do than by the ones you did do, so throw off the bowlines, sail away from safe harbor, catch the trade winds in your sails.  Explore, Dream, Discover.",
    author: "Mark Twain",
  },
  {
    quote: "Life is 10% what happens to me and 90% of how I react to it.",
    author: "Charles Swindoll",
  },
  {
    quote:
      "The most common way people give up their power is by thinking they don’t have any.",
    author: "Alice Walker",
  },
  {
    quote: "The mind is everything. What you think you become.",
    author: "Buddha",
  },
  {
    quote: "Eighty percent of success is showing up.",
    author: "Woody Allen",
  },
  {
    quote: "Winning isn’t everything, but wanting to win is.",
    author: "Vince Lombardi",
  },
];

const firstQuotes = document.querySelector(".firstQuotes");
const quotesAuthor = document.querySelector(".quotesAuthor");
const btn = document.querySelector(".btn");

btn.addEventListener("click", function () {
  const randomVal = Math.floor(Math.random() * quotes.length);
  firstQuotes.innerHTML = quotes[randomVal].quote;
  quotesAuthor.innerHTML = quotes[randomVal].author;
});
