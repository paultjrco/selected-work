(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const editions = window.POCKET_PORTFOLIO_EDITIONS;
  const editionKey = params.get("edition") || "spaces";
  const edition = editions[editionKey] || editions.spaces;
  const presentation = document.getElementById("presentation");
  const totalScreens = edition.projects.length + 2;
  const assetPath = (source) => source.startsWith("../../portfolio/images-web/")
    ? `images/${source.split("/").pop()}`
    : source;

  const focalPosition = (focus) => {
    if (!focus) return "50% 50%";
    if (focus.includes("%")) return focus;

    const terms = focus.toLowerCase().replace(/focal|,/g, " ").split(/\s+/).filter(Boolean);
    const horizontal = terms.includes("left") ? "25%" : terms.includes("right") ? "75%" : "50%";
    const vertical = terms.includes("top") ? "25%" : terms.includes("bottom") ? "75%" : "50%";
    return `${horizontal} ${vertical}`;
  };

  document.title = edition.pageTitle;

  const screenCounter = (index) => {
    const counter = document.createElement("p");
    counter.className = "screen__counter";
    counter.textContent = `${String(index).padStart(2, "0")} / ${String(totalScreens).padStart(2, "0")}`;
    return counter;
  };

  const intro = document.createElement("section");
  intro.id = "presentation-start";
  intro.className = "screen screen--intro";
  intro.setAttribute("aria-labelledby", "intro-title");
  const introductionTitle = edition.introduction.titleLines
    ? edition.introduction.titleLines.map((line) => `<span>${line}</span>`).join("")
    : edition.introduction.title;
  intro.innerHTML = `
    <div class="intro__content">
      <p class="intro__brand">${edition.brand}</p>
      <p class="eyebrow">${edition.introduction.label}</p>
      <h1 id="intro-title">${introductionTitle}</h1>
      <p class="intro__body">${edition.introduction.body}</p>
    </div>
    <p class="gesture-hint"><span class="gesture-hint__arrow" aria-hidden="true">↑</span><span>Swipe</span></p>
  `;
  intro.prepend(screenCounter(1));
  presentation.appendChild(intro);

  edition.projects.forEach((project, projectIndex) => {
    const screen = document.createElement("section");
    screen.className = "screen screen--project";
    screen.setAttribute("aria-label", `${project.category}: ${project.client}`);
    screen.appendChild(screenCounter(projectIndex + 2));

    const gallery = document.createElement("div");
    gallery.className = "gallery";
    gallery.setAttribute("role", "region");
    gallery.setAttribute("aria-label", `${project.client} image gallery`);
    gallery.tabIndex = 0;

    const track = document.createElement("div");
    track.className = "gallery__track";
    project.frames.forEach((frame) => {
      const figure = document.createElement("figure");
      figure.className = "gallery__frame";
      const image = document.createElement("img");
      image.className = `gallery__image${frame.fit === "contain" ? " gallery__image--contain" : ""}`;
      image.src = assetPath(frame.src);
      image.alt = frame.alt;
      image.loading = "eager";
      image.decoding = "async";
      image.style.objectPosition = focalPosition(frame.focus);
      figure.appendChild(image);
      track.appendChild(figure);
    });
    gallery.appendChild(track);

    const overlay = document.createElement("div");
    overlay.className = "project-copy";
    overlay.innerHTML = `
      <h2 class="project-copy__offering">${project.category}</h2>
      <p class="project-copy__source">${project.client}</p>
      <p class="project-copy__caption">${project.statement}</p>
    `;

    const controls = document.createElement("div");
    controls.className = "gallery__controls";
    controls.innerHTML = `
      <button type="button" class="gallery__button gallery__button--previous" aria-label="Previous image">←</button>
      <div class="gallery__dots" aria-label="Image position"></div>
      <button type="button" class="gallery__button gallery__button--next" aria-label="Next image">→</button>
    `;
    const dots = controls.querySelector(".gallery__dots");
    project.frames.forEach((_, index) => {
      const dot = document.createElement("span");
      dot.className = "gallery__dot";
      dot.setAttribute("aria-hidden", "true");
      dot.toggleAttribute("data-active", index === 0);
      dots.appendChild(dot);
    });

    const updateDots = () => {
      const activeIndex = Math.round(track.scrollLeft / track.clientWidth);
      [...dots.children].forEach((dot, index) => dot.toggleAttribute("data-active", index === activeIndex));
    };
    const move = (direction) => track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
    controls.querySelector(".gallery__button--previous").addEventListener("click", () => move(-1));
    controls.querySelector(".gallery__button--next").addEventListener("click", () => move(1));
    track.addEventListener("scroll", updateDots, { passive: true });
    window.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (document.querySelector("dialog[open]")) return;
      if (event.target instanceof Element && event.target.closest("a, button, input, textarea, select")) return;

      const bounds = screen.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      if (bounds.top > viewportCenter || bounds.bottom < viewportCenter) return;

      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    });

    screen.append(gallery, overlay, controls);
    presentation.appendChild(screen);
  });

  const contact = edition.contact;
  const finalScreen = document.createElement("section");
  finalScreen.className = "screen screen--contact";
  finalScreen.setAttribute("aria-labelledby", "contact-title");
  finalScreen.innerHTML = `
    <div class="contact__content">
      <p class="eyebrow">${contact.brand}</p>
      <h2 id="contact-title">${contact.heading}</h2>
      <p class="contact__body">${contact.body}</p>
      <div class="contact__handoff">
        <div class="qr-code">
          <img src="images/qrcode.png" alt="QR code for the PAULTJRCO Pocket Portfolio">
        </div>
        <div class="contact__details">
          <span class="contact__name">${contact.name}</span>
          <a href="mailto:${contact.email}">${contact.email}</a>
          <a href="tel:${contact.phoneHref}">${contact.phoneDisplay}</a>
          <span>${contact.url}</span>
        </div>
      </div>
    </div>
    <div class="contact__footer">
      <a class="back-to-top" href="#presentation-start"><span class="back-to-top__arrow" aria-hidden="true">↑</span><span>Back to top</span></a>
      <p class="contact__partner-note">${contact.partnerNote}</p>
      <button class="presentation-offer" type="button">${contact.presentationOffer}</button>
    </div>
  `;
  finalScreen.prepend(screenCounter(totalScreens));
  presentation.appendChild(finalScreen);

  finalScreen.querySelector(".back-to-top").addEventListener("click", (event) => {
    event.preventDefault();
    presentation.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  });

  const productDialog = document.createElement("dialog");
  productDialog.className = "product-dialog";
  productDialog.setAttribute("aria-labelledby", "product-dialog-title");
  productDialog.innerHTML = `
    <button class="product-dialog__close" type="button" aria-label="Close">×</button>
    <p class="product-dialog__byline">${contact.productByline}</p>
    <h2 id="product-dialog-title">${contact.productName}</h2>
    <p>${contact.productMessage}</p>
    <a class="product-dialog__cta" href="mailto:${contact.email}?subject=Pocket%20Portfolio%20Inquiry">${contact.email}</a>
  `;
  document.body.appendChild(productDialog);

  finalScreen.querySelector(".presentation-offer").addEventListener("click", () => productDialog.showModal());
  productDialog.querySelector(".product-dialog__close").addEventListener("click", () => productDialog.close());
  productDialog.addEventListener("click", (event) => {
    const bounds = productDialog.getBoundingClientRect();
    const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    if (!inside) productDialog.close();
  });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
