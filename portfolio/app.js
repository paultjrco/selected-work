(function () {
  "use strict";

  const data = window.PORTFOLIO_DATA;
  const params = new URLSearchParams(window.location.search);
  const collectionKey = params.get("v");
  const explicitIds = (params.get("work") || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const defaultCollection = data.collections.prototype;
  const collection = collectionKey ? data.collections[collectionKey] : null;
  const requestedIds = explicitIds.length
    ? explicitIds
    : collection
      ? collection.projectIds
      : [];
  const projectsById = new Map(data.projects.map((project) => [project.id, project]));
  const selectedProjects = requestedIds
    .map((id) => projectsById.get(id))
    .filter(Boolean);
  const presentation = selectedProjects.length
    ? collection || defaultCollection
    : null;

  const cloudTerms = new Map();
  const addCloudTerms = (projects, weight) => {
    projects.forEach((project) => {
      (project.capabilities || []).forEach((capability) => {
        const key = capability.toLocaleLowerCase();
        const existing = cloudTerms.get(key);
        cloudTerms.set(key, {
          label: existing ? existing.label : capability,
          score: (existing ? existing.score : 0) + weight
        });
      });
    });
  };

  addCloudTerms(selectedProjects, 2);

  if (collection && collection.relatedProjectIds) {
    const relatedById = new Map((data.relatedProjects || []).map((project) => [project.id, project]));
    addCloudTerms(
      collection.relatedProjectIds.map((id) => relatedById.get(id)).filter(Boolean),
      1
    );
  }

  if (presentation) {
    document.title = `${presentation.title} — Paul Tomanpos, Jr.`;
    const portfolioTitle = document.getElementById("portfolio-title");
    if (presentation.titleLines) {
      const titleLines = presentation.titleLines.map((line) => {
        const span = document.createElement("span");
        span.className = "intro__title-line";
        span.textContent = line;
        return span;
      });
      portfolioTitle.replaceChildren(...titleLines);
    } else {
      portfolioTitle.textContent = presentation.title;
    }
    document.getElementById("portfolio-summary").textContent = presentation.summary;

    const wordCloud = document.createElement("div");
    wordCloud.className = "intro__word-cloud";
    wordCloud.setAttribute("aria-hidden", "true");
    const scalePattern = [1.22, 0.86, 1.48, 1.02, 1.3, 0.78, 1.12, 1.58, 0.92, 1.38];
    const rotatePattern = [-2.4, 1.2, -0.8, 2, -1.5, 0.6, 2.5, -1.1, 1.7, -2];
    const horizontalPattern = [-8, 5, -2, 9, -5, 3, -10, 7, -4, 6];
    const verticalPattern = [2, -5, 6, -2, 4, -7, 1, 7, -4, 3];
    const opacityPattern = [0.92, 0.68, 1, 0.8, 0.9, 0.62, 0.84, 0.96, 0.72, 0.88];

    [...cloudTerms.values()]
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
      .slice(0, 20)
      .forEach((term, index) => {
        const word = document.createElement("span");
        word.className = "intro__word-cloud-term";
        word.textContent = term.label;
        word.style.setProperty("--term-score", Math.min(term.score, 5));
        word.style.setProperty("--term-scale", scalePattern[index % scalePattern.length]);
        word.style.setProperty("--term-rotate", `${rotatePattern[index % rotatePattern.length]}deg`);
        word.style.setProperty("--term-shift-x", `${horizontalPattern[index % horizontalPattern.length]}px`);
        word.style.setProperty("--term-shift-y", `${verticalPattern[index % verticalPattern.length]}px`);
        word.style.setProperty("--term-opacity", opacityPattern[index % opacityPattern.length]);
        word.style.zIndex = String((index % 4) + 1);
        wordCloud.appendChild(word);
      });

    document.querySelector(".intro").appendChild(wordCloud);
  } else {
    document.title = "Portfolio link incomplete — Paul Tomanpos, Jr.";
    document.getElementById("portfolio-title").textContent = "This portfolio link is incomplete.";
    document.getElementById("portfolio-summary").textContent = "Please check the URL you received and make sure the complete link was copied correctly.";
  }

  const projectList = document.getElementById("project-list");
  const fragment = document.createDocumentFragment();

  selectedProjects.forEach((project, index) => {
    const article = document.createElement("article");
    article.className = "project";

    const mediaItems = project.media || [
      {
        type: "image",
        src: project.image,
        alt: project.alt
      },
      ...(project.video
        ? [{
            type: "video",
            src: project.video,
            poster: project.videoPoster || project.image,
            label: project.videoLabel || "Process video"
          }]
        : [])
    ];

    const mediaSlider = document.createElement("div");
    mediaSlider.className = "project__media-slider";
    const mediaTrack = document.createElement("div");
    mediaTrack.className = "project__media-track";
    const renderedMedia = [];

    mediaItems.slice(0, 8).forEach((media, mediaIndex) => {
      const mediaWrap = document.createElement("figure");
      mediaWrap.className = "project__media-item";
      mediaWrap.hidden = mediaIndex !== 0;

      if (media.type === "video") {
        const video = document.createElement("video");
        video.className = "project__media project__media--video";
        video.controls = true;
        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.poster = media.poster || "";

        const source = document.createElement("source");
        source.src = media.src;
        source.type = "video/x-m4v";
        video.appendChild(source);
        mediaWrap.appendChild(video);

        if (media.label) {
          const caption = document.createElement("figcaption");
          caption.textContent = media.label;
          mediaWrap.appendChild(caption);
        }
      } else {
        const image = document.createElement("img");
        image.className = `project__media${media.fit === "contain" ? " project__media--contain" : ""}`;
        image.src = media.src;
        image.alt = media.alt || "";
        image.loading = index < 2 && mediaIndex === 0 ? "eager" : "lazy";
        image.decoding = "async";
        mediaWrap.appendChild(image);
      }

      renderedMedia.push(mediaWrap);
      mediaTrack.appendChild(mediaWrap);
    });

    mediaSlider.appendChild(mediaTrack);

    if (renderedMedia.length > 1) {
      let activeMediaIndex = 0;

      const controls = document.createElement("div");
      controls.className = "project__media-controls";

      const position = document.createElement("span");
      position.className = "project__media-position";
      position.setAttribute("aria-live", "polite");
      position.textContent = `1 / ${renderedMedia.length}`;

      const showMedia = (nextIndex) => {
        const currentVideo = renderedMedia[activeMediaIndex].querySelector("video");
        if (currentVideo) currentVideo.pause();
        renderedMedia[activeMediaIndex].hidden = true;
        activeMediaIndex = (nextIndex + renderedMedia.length) % renderedMedia.length;
        renderedMedia[activeMediaIndex].hidden = false;
        position.textContent = `${activeMediaIndex + 1} / ${renderedMedia.length}`;
      };

      const previousButton = document.createElement("button");
      previousButton.className = "project__media-nav project__media-nav--previous";
      previousButton.type = "button";
      previousButton.setAttribute("aria-label", `Show previous media for ${project.title}`);
      previousButton.innerHTML = "<span aria-hidden=\"true\">←</span>";
      previousButton.addEventListener("click", () => showMedia(activeMediaIndex - 1));

      const nextButton = document.createElement("button");
      nextButton.className = "project__media-nav project__media-nav--next";
      nextButton.type = "button";
      nextButton.setAttribute("aria-label", `Show next media for ${project.title}`);
      nextButton.innerHTML = "<span aria-hidden=\"true\">→</span>";
      nextButton.addEventListener("click", () => showMedia(activeMediaIndex + 1));

      controls.append(previousButton, position, nextButton);
      mediaSlider.appendChild(controls);
    }

    const content = document.createElement("div");
    content.className = "project__content";

    const meta = document.createElement("p");
    meta.className = "project__meta";
    meta.textContent = project.context;

    const heading = document.createElement("h2");
    heading.textContent = project.title;

    const status = document.createElement("span");
    status.className = `project__status${project.status === "Ongoing" ? " project__status--ongoing" : ""}`;
    status.textContent = project.status;

    content.append(meta, heading, status);

    project.description.forEach((paragraph) => {
      const body = document.createElement("p");
      body.textContent = paragraph;
      content.appendChild(body);
    });

    if (project.capabilities && project.capabilities.length) {
      const capabilities = document.createElement("ul");
      capabilities.className = "project__capabilities";
      capabilities.setAttribute("aria-label", "Relevant capabilities");

      project.capabilities.forEach((capability) => {
        const item = document.createElement("li");
        item.textContent = capability;
        capabilities.appendChild(item);
      });

      content.appendChild(capabilities);
    }

    article.append(mediaSlider, content);
    fragment.appendChild(article);
  });

  projectList.replaceChildren(fragment);

  const relatedIds = collection && collection.relatedProjectIds
    ? collection.relatedProjectIds
    : [];
  const relatedById = new Map((data.relatedProjects || []).map((project) => [project.id, project]));
  const relatedProjects = relatedIds
    .map((id) => relatedById.get(id))
    .filter(Boolean);

  if (relatedProjects.length) {
    const relatedSection = document.createElement("section");
    relatedSection.className = "related-projects";
    relatedSection.setAttribute("aria-labelledby", "related-projects-title");

    const relatedIntro = document.createElement("div");
    relatedIntro.className = "related-projects__intro";

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Additional experience";

    const relatedHeading = document.createElement("h2");
    relatedHeading.id = "related-projects-title";
    relatedHeading.textContent = "More relevant work";

    const relatedSummary = document.createElement("p");
    relatedSummary.textContent = "Additional projects demonstrating digital prototyping, visual systems, AI experimentation, and the connection between interface design and real-world use.";
    relatedIntro.append(eyebrow, relatedHeading, relatedSummary);

    const relatedList = document.createElement("div");
    relatedList.className = "related-projects__list";

    relatedProjects.forEach((project) => {
      const item = document.createElement("article");
      item.className = "related-project";

      if (project.media && project.media.length) {
        item.classList.add("related-project--with-media");

        const mediaSlider = document.createElement("div");
        mediaSlider.className = "related-project__media-slider";
        const mediaTrack = document.createElement("div");
        mediaTrack.className = "related-project__media-track";
        const renderedMedia = [];

        project.media.slice(0, 3).forEach((media, mediaIndex) => {
          const mediaWrap = document.createElement("figure");
          mediaWrap.className = "related-project__media-item";
          mediaWrap.hidden = mediaIndex !== 0;

          const image = document.createElement("img");
          image.src = media.src;
          image.alt = media.alt || "";
          image.loading = "lazy";
          image.decoding = "async";
          mediaWrap.appendChild(image);
          renderedMedia.push(mediaWrap);
          mediaTrack.appendChild(mediaWrap);
        });

        mediaSlider.appendChild(mediaTrack);

        if (renderedMedia.length > 1) {
          let activeMediaIndex = 0;

          const controls = document.createElement("div");
          controls.className = "project__media-controls";

          const position = document.createElement("span");
          position.className = "project__media-position";
          position.setAttribute("aria-live", "polite");
          position.textContent = `1 / ${renderedMedia.length}`;

          const showMedia = (nextIndex) => {
            renderedMedia[activeMediaIndex].hidden = true;
            activeMediaIndex = (nextIndex + renderedMedia.length) % renderedMedia.length;
            renderedMedia[activeMediaIndex].hidden = false;
            position.textContent = `${activeMediaIndex + 1} / ${renderedMedia.length}`;
          };

          const previousButton = document.createElement("button");
          previousButton.className = "project__media-nav project__media-nav--previous";
          previousButton.type = "button";
          previousButton.setAttribute("aria-label", `Show previous image for ${project.title}`);
          previousButton.innerHTML = "<span aria-hidden=\"true\">←</span>";
          previousButton.addEventListener("click", () => showMedia(activeMediaIndex - 1));

          const nextButton = document.createElement("button");
          nextButton.className = "project__media-nav project__media-nav--next";
          nextButton.type = "button";
          nextButton.setAttribute("aria-label", `Show next image for ${project.title}`);
          nextButton.innerHTML = "<span aria-hidden=\"true\">→</span>";
          nextButton.addEventListener("click", () => showMedia(activeMediaIndex + 1));

          controls.append(previousButton, position, nextButton);
          mediaSlider.appendChild(controls);
        }

        item.appendChild(mediaSlider);
      }

      const content = document.createElement("div");
      content.className = "related-project__content";

      const heading = document.createElement("h3");
      heading.textContent = project.title;

      const description = document.createElement("p");
      description.textContent = project.description;
      content.appendChild(heading);

      if (project.status) {
        const status = document.createElement("span");
        status.className = `related-project__status${project.status === "Ongoing" ? " related-project__status--ongoing" : ""}`;
        status.textContent = project.status;
        content.appendChild(status);
      }

      content.appendChild(description);

      if (project.capabilities && project.capabilities.length) {
        const capabilities = document.createElement("ul");
        capabilities.className = "related-project__capabilities";
        capabilities.setAttribute("aria-label", "Relevant capabilities");

        project.capabilities.forEach((capability) => {
          const capabilityItem = document.createElement("li");
          capabilityItem.textContent = capability;
          capabilities.appendChild(capabilityItem);
        });

        content.appendChild(capabilities);
      }

      if (project.url) {
        const link = document.createElement("a");
        link.className = "related-project__link";
        link.href = project.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View case study";
        content.appendChild(link);
      }

      item.appendChild(content);

      relatedList.appendChild(item);
    });

    relatedSection.append(relatedIntro, relatedList);
    projectList.insertAdjacentElement("afterend", relatedSection);
  }
})();
