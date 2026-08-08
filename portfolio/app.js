(function () {
  "use strict";

  const data = window.PORTFOLIO_DATA;
  const params = new URLSearchParams(window.location.search);
  const collectionKey = params.get("v") || "prototype";
  const explicitIds = (params.get("work") || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const defaultCollection = data.collections.prototype;
  const collection = data.collections[collectionKey] || defaultCollection;
  const requestedIds = explicitIds.length ? explicitIds : collection.projectIds;
  const projectsById = new Map(data.projects.map((project) => [project.id, project]));
  const selectedProjects = requestedIds
    .map((id) => projectsById.get(id))
    .filter(Boolean);

  document.title = `${collection.title} — Paul Tomanpos, Jr.`;
  document.getElementById("portfolio-title").textContent = collection.title;
  document.getElementById("portfolio-summary").textContent = collection.summary;

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
})();
