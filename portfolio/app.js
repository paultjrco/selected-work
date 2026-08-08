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

  if (presentation) {
    document.title = `${presentation.title} — Paul Tomanpos, Jr.`;
    document.getElementById("portfolio-title").textContent = presentation.title;
    document.getElementById("portfolio-summary").textContent = presentation.summary;
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

    const imageWrap = document.createElement("div");
    imageWrap.className = "project__image-wrap";

    const image = document.createElement("img");
    image.className = "project__image";
    image.src = project.image;
    image.alt = project.alt;
    image.loading = index < 2 ? "eager" : "lazy";
    image.decoding = "async";
    imageWrap.appendChild(image);

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

    if (project.video) {
      const videoFigure = document.createElement("figure");
      videoFigure.className = "project__video-wrap";

      const video = document.createElement("video");
      video.className = "project__video";
      video.controls = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.poster = project.videoPoster || project.image;

      const source = document.createElement("source");
      source.src = project.video;
      source.type = "video/x-m4v";
      video.appendChild(source);

      const caption = document.createElement("figcaption");
      caption.textContent = project.videoLabel || "Process video";
      videoFigure.append(video, caption);
      content.appendChild(videoFigure);
    }

    article.append(imageWrap, content);
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

      const heading = document.createElement("h3");
      heading.textContent = project.title;

      const description = document.createElement("p");
      description.textContent = project.description;
      item.append(heading, description);

      if (project.capabilities && project.capabilities.length) {
        const capabilityText = document.createElement("p");
        capabilityText.className = "related-project__capabilities";
        capabilityText.textContent = project.capabilities.join(" · ");
        item.appendChild(capabilityText);
      }

      if (project.url) {
        const link = document.createElement("a");
        link.className = "related-project__link";
        link.href = project.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View case study";
        item.appendChild(link);
      }

      relatedList.appendChild(item);
    });

    relatedSection.append(relatedIntro, relatedList);
    projectList.insertAdjacentElement("afterend", relatedSection);
  }
})();
