// Free travel guides sign-up: the homepage card and the free-travel-guides page.
//
// Any <form class="js-guides-form"> is handled here. On submit it sends the
// details to the Google Apps Script web app in ENDPOINT (see
// _tools/guides-signup.gs for the script and how to deploy it), then shows the
// form's download links straight away, so readers never wait on email.
//
// While ENDPOINT is empty, the downloads are still shown but nothing is saved,
// which keeps the pages usable before the script is deployed.
(function () {
  "use strict";

  // The web app URL from Apps Script (Deploy > Manage deployments), ending in /exec.
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbxZ-fUexdI3IPhW2ffTHPVIHNSMjfNHBILU7aR_7BX6eKx39O8b4Dj_3YN1cPM-2lxq/exec";

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(form, message) {
    const box = form.querySelector(".gs-error");
    if (!box) return;
    box.textContent = message;
    box.hidden = !message;
  }

  function chosenGuides(form) {
    if (form.dataset.guides) return form.dataset.guides.split(",").map((g) => g.trim()).filter(Boolean);
    const boxes = form.querySelectorAll('input[name="guides"]');
    if (!boxes.length) return ["weekend-escapes", "bisaya-phrasebook", "food-passport"];
    return Array.from(boxes).filter((b) => b.checked).map((b) => b.value);
  }

  function showDownloads(form, guides) {
    const done = document.getElementById(form.dataset.success);
    if (!done) return;
    done.querySelectorAll("[data-guide]").forEach((el) => {
      el.hidden = !guides.includes(el.dataset.guide);
    });
    form.hidden = true;
    done.hidden = false;
    const focusTarget = done.querySelector("h2, h3, [tabindex]");
    if (focusTarget) {
      focusTarget.setAttribute("tabindex", "-1");
      focusTarget.focus();
    }
  }

  async function send(endpoint, data) {
    if (!endpoint) return;
    // Apps Script web apps do not answer CORS preflights, so the request is sent
    // as a simple form post. The response cannot be read, so it is not awaited
    // for content; the row is written on Google's side.
    await fetch(endpoint, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });
  }

  function handle(form) {
    const emailInput = form.querySelector('input[name="email"]');
    const params = new URLSearchParams(location.search);
    if (emailInput && params.get("email") && !emailInput.value) emailInput.value = params.get("email");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setError(form, "");

      const email = (emailInput ? emailInput.value : "").trim();
      const nameInput = form.querySelector('input[name="name"]');
      const consent = form.querySelector('input[name="consent"]');
      const trap = form.querySelector('input[name="website"]');
      const guides = chosenGuides(form);

      if (!EMAIL.test(email)) return setError(form, "Please enter a valid email address.");
      if (!guides.length) return setError(form, "Pick at least one guide.");
      if (consent && !consent.checked) return setError(form, "Please tick the box so we can send you the guides.");
      if (trap && trap.value) return showDownloads(form, guides); // a bot filled the hidden field

      const button = form.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = true;
        button.dataset.label = button.textContent;
        button.textContent = "Sending…";
      }

      try {
        await send(ENDPOINT, {
          name: nameInput ? nameInput.value.trim() : "",
          email,
          guides: guides.join(","),
          consent: consent && consent.checked ? "yes" : "no",
          source: form.dataset.source || location.pathname,
          page: location.href,
        });
      } catch (err) {
        // A network hiccup should not stop the reader getting the guides.
      }

      if (typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", { form_location: form.dataset.source || location.pathname, guides: guides.join(",") });
      }
      showDownloads(form, guides);
    });
  }

  document.querySelectorAll("form.js-guides-form").forEach(handle);
})();
