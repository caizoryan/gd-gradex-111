let main = 'https://2026.ocadu.gd/'
let link = `https://2222.ocadu.gd/web/jsonapi/node/student_project?include=field_media_gallery,field_media_gallery.field_p_image`
fetch(link, {
	Accept: 'application/json',
	'Content-Type': 'application/json',
	'Access-Control-Allow-Origin': '*'
})
	.then(res => res.json())
	.then(res => {
		console.log(res.data)
		console.log(res)
		let included = {}
		res.included.forEach(e => {
			included[e.id] = e
		})

		console.log(included)


		let cleaned = (res.data.map(x => {
			let attr = x.attributes
			let media = x.relationships.field_media_gallery.data

			let images = media.map(e => {
				let imageObj = included[e.id].relationships
				if (imageObj.field_p_image && imageObj.field_p_image.data) {
					let img = included[imageObj.field_p_image.data.id]
					let attr = img.attributes
					let obj = {}
					obj.url = main + attr.uri.url

					return obj
				}
				return undefined
			}).filter(e => e!=undefined)

			let videos = x.relationships.field_media_gallery
			console.log(videos.data.filter(e => e.type == 'paragraph--video').map(e => included[e.id].attributes))


			console.log(images)

			let o = {}
			o.projectTitle = attr.title
			o.firstName = attr.field_first_name_preferred_names
			o.lastName = attr.field_last_name
			o.images = images
			console.log(images)
			if (images && images.length > 0) o.thumbnail = images[0].url

			return o
		}))

		populateGrid(cleaned)
	})

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
const FULL_CLIP_PATH = createFullSquareClipPath(24);

const gridContainer = document.querySelector(".grid-container");
const searchInput = document.querySelector("#archive-search");

const randomClipPathByItemIndex = new Map();

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
	console.log(items)
    if (!gridContainer) return;
    gridContainer.innerHTML = items.map((item, sourceIndex) => `
        <article class="grid-item" data-item-index="${sourceIndex}">
            <img class="grid-item-thumbnail" src="${item.thumbnail}">
            <h3 class="grid-item-heading">${item.firstName + ' ' + item.lastName}</h3>
            <p class="grid-item-work-name">${item.projectTitle}</p>
        </article>
    `).join("");

    applyRandomCutShapes();
}

// populateGrid(sampleItems);
