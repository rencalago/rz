// The free-guides sign-up card that sits beside the article title (wide
// screens only; see .article-header--signup in style.css). Shared by post.js
// and the build (_tools/build-site.mjs), which writes it into every article so
// the title band is already in place when the page first appears.
// Same card as the homepage one under Editor's picks (classes from style.css).
export function headerSignupHtml() {
  const cover = (file) =>
    `<img src="./Images/free-guides/${file}-cover-small.jpg" alt="" width="38" height="54" loading="lazy" decoding="async">`;
  return `<section class="guides-promo article-header__signup" aria-labelledby="ah-gp-title">
  <div class="gp-head">
    <div>
      <p class="gp-eyebrow">3 free PDF guides</p>
      <h2 class="gp-title" id="ah-gp-title">Plan your next <em>escape</em></h2>
    </div>
    <a class="gp-covers" href="./free-travel-guides" tabindex="-1" aria-hidden="true">${cover("visayas-food-passport")}${cover("bisaya-phrasebook")}${cover("weekend-escapes-from-cebu")}</a>
  </div>
  <form class="gp-form js-guides-form" data-source="article-header" data-success="ah-gp-done" novalidate>
    <label class="sr-only" for="ah-gp-email">Email address</label>
    <div class="gp-row">
      <input id="ah-gp-email" type="email" name="email" placeholder="Your email" autocomplete="email" required>
      <button type="submit">Get them free</button>
    </div>
    <input type="text" name="website" class="gs-trap" tabindex="-1" autocomplete="off" aria-hidden="true">
    <p class="gs-error" role="alert" hidden></p>
    <p class="gp-fine">By signing up you agree to get the guides and occasional travel tips. <a href="./free-travel-guides#privacy">Privacy</a></p>
  </form>
  <div class="gp-done" id="ah-gp-done" hidden>
    <h3 class="gp-done__title">Your guides are ready</h3>
    <div class="gp-done__links">
      <a data-guide="weekend-escapes" href="./downloads/weekend-escapes-from-cebu.pdf" download>Weekend Escapes</a>
      <a data-guide="bisaya-phrasebook" href="./downloads/bisaya-phrasebook.pdf" download>Phrasebook</a>
      <a data-guide="food-passport" href="./downloads/visayas-food-passport.pdf" download>Food Passport</a>
    </div>
    <p class="gp-fine">A copy of the links is on its way to your inbox.</p>
  </div>
</section>`;
}
