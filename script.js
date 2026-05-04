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

		let cleaned = (res.data.map(x => {
			let attr = x.attributes
			let media = x.relationships.field_media_gallery.data

			let images = media.map(e => {
				let imageObj = included[e.id].relationships
				if (imageObj.field_p_image && imageObj.field_p_image.data) {
					let img = included[imageObj.field_p_image.data.id]
					let meta = imageObj.field_p_image.data.meta
					let attr = img.attributes
					let obj = {}
					obj.url = main + attr.uri.url
					obj.alt = meta.alt
					obj.width = meta.width
					obj.height = meta.height

					return obj
				}
				return undefined
			}).filter(e => e!=undefined)

			console.log(images)

			let videos = x.relationships.field_media_gallery
			console.log(videos.data.filter(e => e.type == 'paragraph--video').map(e => included[e.id].attributes))

			let o = {}
			o.projectTitle = attr.title
			o.firstName = attr.field_first_name_preferred_names
			o.lastName = attr.field_last_name
			o.images = images
			console.log(images)
			if (images && images.length > 0) o.thumbnail = images[0]

			return o
		}))

		populateGrid(cleaned)

		var grid = document.querySelector('.grid-container');
		// initialize with element
		var pckry = new Packery( grid, {
			// options...
			gutter: 40,
			itemSelector: '.grid-item'
		});
	})

const GRID_ITEM_SELECTOR = ".grid-item";
const THUMBNAIL_SELECTOR = ".grid-item-thumbnail";
const FULL_CLIP_PATH = createFullSquareClipPath(24);

const gridContainer = document.querySelector(".grid-container");

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

function createSkewedClipPath(){
	return '60% 40% 55% 45% / 55% 60% 40% 45%';
// }
 // return 'polygon( 0% 20%, 10% 80%, 90% 100%, 100% 0%)'
}

function getRandomClipPathForItem() {
    // return createCircularCutClipPath();
	return createSkewedClipPath()
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
	gridContainer.innerHTML = items.map((item, sourceIndex) => {

		let w = 300 + Math.random() * 80
		console.log(item.thumbnail)
		let ratio = w/(item.thumbnail?.width ? item.thumbnail.width : w)
		let height = ratio * (item.thumbnail?.height ? item.thumbnail.height : w)

		return `
			<article  class="grid-item crop-box" data-item-index="${sourceIndex}">
					<img style='width:${w}px; height:${height}px;' class="grid-item-thumbnail" src="${item.thumbnail?.url ? item.thumbnail.url : './images/gray-square.jpg'}">
					 <h3 class="grid-item-heading">${item.firstName + ' ' + item.lastName}</h3>
					 <p class="grid-item-work-name">${item.projectTitle}</p>
			</article>
	`}).join("");


	// applyRandomCutShapes()
}
