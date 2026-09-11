(function () {
  "use strict";

  // Contact information
  const contact = {
    brand: "PAULTJRCO",
    name: "Paul Tomanpos, Jr.",
    tagline: "Experience Design & Fabrication",
    headingLead: "Let's make something",
    headingWords: ["memorable", "easy to use", "fun", "engaging", "inviting", "delightful", "meaningful"],
    phoneDisplay: "415-937-7890",
    phoneHref: "+14159377890",
    email: "paultjrco@gmail.com",
    url: "paultjrco.github.io/pocket/card"
  };

  const card = document.getElementById("card");

  // Create the card container
  const container = document.createElement("div");
  container.className = "card__container";

  // Create content section (left side)
  const content = document.createElement("div");
  content.className = "card__content";

  // Heading with rotating word
  const heading = document.createElement("h1");
  heading.className = "card__heading";
  heading.setAttribute("aria-label", `${contact.headingLead} memorable`);
  heading.innerHTML = `
    <span class="card-title__lead">${contact.headingLead}</span>
    <span class="rotating-word-frame" aria-hidden="true">
      <span class="rotating-word">${contact.headingWords[0]}</span>
    </span>
  `;
  content.appendChild(heading);

  // Contact details
  const details = document.createElement("div");
  details.className = "card__details";
  details.innerHTML = `
    <p class="card__name">${contact.name}</p>
    <p class="card__tagline">${contact.tagline}</p>
    <div class="card__contact">
      <a href="mailto:${contact.email}">${contact.email}</a>
      <a href="tel:${contact.phoneHref}">${contact.phoneDisplay}</a>
      <span>${contact.url}</span>
    </div>
  `;
  content.appendChild(details);
  container.appendChild(content);

  // Create QR section (right side)
  const qrSection = document.createElement("div");
  qrSection.className = "card__qr";
  const qrButton = document.createElement("button");
  qrButton.type = "button";
  qrButton.setAttribute("aria-label", "Enlarge QR code");
  qrButton.setAttribute("aria-haspopup", "dialog");
  qrButton.innerHTML = '<img src="../images/qrcode.png" alt="QR code for the PAULTJRCO Digital Business Card">';
  qrSection.appendChild(qrButton);
  container.appendChild(qrSection);

  card.appendChild(container);

  // Rotating word animation
  const headingWords = contact.headingWords;
  if (headingWords.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const rotatingWord = container.querySelector(".rotating-word");
    let headingWordIndex = 0;
    window.setInterval(() => {
      rotatingWord.classList.add("is-leaving");
      window.setTimeout(() => {
        headingWordIndex = (headingWordIndex + 1) % headingWords.length;
        rotatingWord.textContent = headingWords[headingWordIndex];
        rotatingWord.classList.remove("is-leaving");
        rotatingWord.classList.add("is-entering");
        void rotatingWord.offsetWidth;
        window.requestAnimationFrame(() => rotatingWord.classList.remove("is-entering"));
      }, 220);
    }, 2200);
  }

  // QR Dialog
  const qrDialog = document.createElement("dialog");
  qrDialog.className = "qr-dialog";
  qrDialog.setAttribute("aria-label", "Enlarged QR code for digital business card");
  qrDialog.innerHTML = `
    <button class="qr-dialog__close" type="button" aria-label="Close enlarged QR code">×</button>
    <img src="../images/qrcode.png" alt="QR code for the PAULTJRCO Digital Business Card">
  `;
  document.body.appendChild(qrDialog);

  qrButton.addEventListener("click", () => qrDialog.showModal());
  qrDialog.querySelector(".qr-dialog__close").addEventListener("click", () => qrDialog.close());
  qrDialog.addEventListener("click", (event) => {
    const bounds = qrDialog.getBoundingClientRect();
    const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    if (!inside) qrDialog.close();
  });

  // Service Worker registration
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("../sw.js").catch(() => {}));
  }
})();