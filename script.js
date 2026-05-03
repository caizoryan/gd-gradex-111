let link = `https://2222.ocadu.gd/web/jsonapi/node/student_project?include=field_media_gallery,field_media_gallery.field_p_image`
fetch(link, {
	Accept: 'application/json',
	'Content-Type': 'application/json',
	'Access-Control-Allow-Origin': '*'
})
	.then(res => res.json())
	.then(res => console.log(res.data))

/*
    ----------------------------------------------------------------------------
    APPLICATION OVERVIEW (main.js)
    ----------------------------------------------------------------------------
    This file owns the full client-side behavior for the prototype:

    1) DATA LAYER
       - `sampleItems` is the source-of-truth list for all works shown in the
         archive grid.
       - Each object describes both the grid card and preview window content.

    2) RENDER LAYER
       - `populateGrid()` creates card markup and injects it into `.grid-container`.
       - Grid cards are not hardcoded in HTML; they are generated from data.

    3) VISUAL SHAPE SYSTEM
       - `applyRandomCutShapes()` assigns each thumbnail a unique irregular
         polygon through CSS custom properties.
       - On hover, CSS transitions from random silhouette to full square.

    4) WINDOWING SYSTEM
       - Clicking a thumbnail spawns a floating preview window (`createPreviewWindow`).
       - Multiple windows can exist simultaneously.
       - Most recently created/interacted window is brought to front via z-index.
       - Window header supports dragging (`setupPreviewWindowDragging`).
       - Native CSS resize is enabled by stylesheet (`resize: both`).
       - Clicking the close icon removes only that window.
       - When a window is opened, the thumbnail remains expanded until the last window for that item is closed.

    5) STARTUP
       - Final line `populateGrid(sampleItems)` bootstraps the page.
*/

/*
    ----------------------------------------------------------------------------
    1) DATA SOURCE
    ----------------------------------------------------------------------------
*/
// Source data for each tile in the object: sampleItems.
const sampleItems = [
    {
        thumbnail: "./images/gray-square.jpg",
        artistName: "Hana Abdelrazik",
        workName: "[insert-work-name]",
        projectDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        documentationLink: "https://example.com/projects/",
    },
];

const GRID_ITEM_SELECTOR = ".grid-item";
const THUMBNAIL_SELECTOR = ".grid-item-thumbnail";
const PREVIEW_PADDING = 8;
const FULL_CLIP_PATH = createFullSquareClipPath(24);

const gridContainer = document.querySelector(".grid-container");
const searchInput = document.querySelector("#archive-search");

let highestPreviewWindowZIndex = 10;
let previewWindowOpenCount = 0;
const randomClipPathByItemIndex = new Map();
const openPreviewCountByItemIndex = new Map();

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function isValidItemIndex(itemIndex) {
    return Number.isInteger(itemIndex) && itemIndex >= 0;
}

function createCircularCutClipPath(points = 24) {
    const baseRadius = getRandomInRange(38, 45);
    const variation = getRandomInRange(4, 10);
    const coords = [];

    for (let i = 0; i < points; i += 1) {
        const angle = (Math.PI * 2 * i) / points;
        const radius = baseRadius + getRandomInRange(-variation, variation);
        const x = clamp(50 + Math.cos(angle) * radius, 2, 98);
        const y = clamp(50 + Math.sin(angle) * radius, 2, 98);
        coords.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }

    return `polygon(${coords.join(", ")})`;
}

function createFullSquareClipPath(points) {
    const coords = [];
    for (let i = 0; i < points; i += 1) {
        const angle = (Math.PI * 2 * i) / points;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        const scale = 50 / Math.max(Math.abs(dx), Math.abs(dy));
        coords.push(
            `${clamp(50 + dx * scale, 0, 100).toFixed(2)}% ${clamp(50 + dy * scale, 0, 100).toFixed(2)}%`
        );
    }
    return `polygon(${coords.join(", ")})`;
}

function getRandomClipPathForItem(itemIndex) {
    if (!isValidItemIndex(itemIndex)) return createCircularCutClipPath();
    if (!randomClipPathByItemIndex.has(itemIndex)) {
        randomClipPathByItemIndex.set(itemIndex, createCircularCutClipPath());
    }
    return randomClipPathByItemIndex.get(itemIndex);
}

function setThumbnailExpandedState(itemIndex, shouldExpand) {
    if (!isValidItemIndex(itemIndex)) return;
    const thumbnail = document.querySelector(
        `${GRID_ITEM_SELECTOR}[data-item-index="${itemIndex}"] ${THUMBNAIL_SELECTOR}`
    );
    if (!thumbnail) return;
    thumbnail.classList.toggle("grid-item-thumbnail--pinned-open", shouldExpand);
}

function applyRandomCutShapes() {
    if (!gridContainer) return;
    gridContainer.querySelectorAll(GRID_ITEM_SELECTOR).forEach((gridItem) => {
        const thumbnail = gridItem.querySelector(THUMBNAIL_SELECTOR);
        if (!thumbnail) return;
        const itemIndex = Number(gridItem.dataset.itemIndex);
        thumbnail.style.setProperty("--clip-random", getRandomClipPathForItem(itemIndex));
        thumbnail.style.setProperty("--clip-full", FULL_CLIP_PATH);
    });
}

function populateGrid(items) {
    if (!gridContainer) return;
    gridContainer.innerHTML = items.map(({ item, sourceIndex }) => `
        <article class="grid-item" data-item-index="${sourceIndex}">
            <img class="grid-item-thumbnail" src="${item.thumbnail}" alt="${item.workName}">
            <h3 class="grid-item-heading">${item.artistName}</h3>
            <p class="grid-item-work-name">${item.workName}</p>
        </article>
    `).join("");

    applyRandomCutShapes();
    openPreviewCountByItemIndex.forEach((count, sourceIndex) => {
        setThumbnailExpandedState(sourceIndex, count > 0);
    });
}


function getFilteredItems(query) {
    const normalizedQuery = query.trim().toLowerCase();
    return sampleItems
        .map((item, sourceIndex) => ({ item, sourceIndex }))
        .filter(({ item }) => {
            if (!normalizedQuery) return true;
            return (
                item.artistName.toLowerCase().includes(normalizedQuery) ||
                item.workName.toLowerCase().includes(normalizedQuery)
            );
        });
}

function setupSearchFilter() {
    if (!searchInput) return;
    searchInput.addEventListener("input", (event) => {
        populateGrid(getFilteredItems(event.target.value || ""));
    });
}

setupSearchFilter();
populateGrid(getFilteredItems(""));
