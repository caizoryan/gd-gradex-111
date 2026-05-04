// ------------------
// ALI's Notes
// ------------------
// Background too pallid / Needs higher contrast or maybe no background.
// - no background
// Perhaps more scale variation of elements
// - randomized
// Individual student view as popup feels like a different logic than the rest of the system and doesn’t really do justice to each project.
// To get closer to brand consider oblong round shapes instead of jagged one
// Scissors as cursor (sparingly)?
// Should follow the title logic of the posters:
// GRADEX 111 OCAD UNIVERSITY at bottom
// “Cuts” at top”
// Maybe we don’t have a search bar since all students will be right there on the front page
// We could use tag filtering though (tags,. Class,
// ------------------

let main = 'https://2026.ocadu.gd/'
let link = `https://2222.ocadu.gd/web/jsonapi/node/student_project?include=field_media_gallery,field_media_gallery.field_p_image,field_thumbnail_image`
let person = window.location.hash

fetch(link, {
	Accept: 'application/json',
	'Content-Type': 'application/json',
	'Access-Control-Allow-Origin': '*'
})
	.then(res => res.json())
	.then(res => {
		// console.log(res.data)
		// console.log(res)
		let included = {}
		res.included.forEach(e => {
			included[e.id] = e
		})

		let cleaned = (res.data.map(x => {
			console.log(x.id)
			let attr = x.attributes
			let media = x.relationships.field_media_gallery.data
			let thumbnail = x.relationships.field_thumbnail_image?.data
			if (thumbnail){
				let tb = {}
				tb.width = thumbnail.meta.width
				tb.height = thumbnail.meta.height

				thumbnail = included[thumbnail.id]

				tb.url = main + thumbnail.attributes.uri?.url

				thumbnail = tb
			}

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

			// console.log(images)

			let videos = x.relationships.field_media_gallery
			// console.log(videos.data.filter(e => e.type == 'paragraph--video').map(e => included[e.id].attributes))

			let o = {}

			o.projectTitle = attr.title
			o.description = attr.field_project_description.value
			o.firstName = attr.field_first_name_preferred_names
			o.lastName = attr.field_last_name
			o.images = images
			o.thumbnail = thumbnail
			o.id = x.id
			// console.log(images)
			if (!o.thumbnail && images && images.length > 0) o.thumbnail = images[0]

			return o
		}))

		cleaned = cleaned.find(e => e.id == person.slice(1))

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

let radiuses = [
'70% 30% 60% 40% / 50% 60% 40% 50%',
'60% 40% 55% 45% / 55% 60% 40% 45%',
'55% 45% 65% 35% / 60% 40% 55% 45%',
]

function createSkewedClipPath(){
	let points = []
	for (let i = 0; i < 5; i++){
		points.push({x: i * 25, y: Math.random() * 8})
	}

	points.push({x: 100, y: 100})

	for (let i = 4; i >= 0; i--){
		points.push({x: i * 25, y:  100 - Math.random() * 8 })
	}

  return `polygon(${points
    .map(p => `${p.x.toFixed(2)}% ${p.y}%`)
    .join(", ")})`;
}

function getRandomClipPathForItem() {
    // return createCircularCutClipPath();
	return createSkewedClipPath()
}

// let strategy = 'kiki' 
let strategy = 'bouba' 
// let strategy = 'meh'

function applyRandomCutShapes() {
	if (!gridContainer) return;
	gridContainer.querySelectorAll(GRID_ITEM_SELECTOR).forEach((gridItem) => {
		const thumbnail = gridItem.querySelector(THUMBNAIL_SELECTOR);
		if (!thumbnail) return;
		let rand = radiuses[Math.floor(Math.random()*radiuses.length)]
		if(strategy == 'kiki') thumbnail.style.setProperty("--clip-random", getRandomClipPathForItem());
		else if (strategy == 'bouba')  thumbnail.style.setProperty("--border-random", rand);
	});
}

function populateGrid(profile) {
	console.log(profile)
	if (!gridContainer) return;
	gridContainer.innerHTML = `<div class="grid-item" style='width:350px'> ${profile.description} </div>`
			+
		profile.images.map((item, sourceIndex) => {
			let min = 350
			let w = min + Math.random() * 70
			let ratio = w/(item.width ? item.width : w)
			let height = ratio * (item?.height ? item.height : w)

			return  `<article  class="grid-item crop-box" data-item-index="${sourceIndex}">
						<img style='width:${w}px; height:${height}px;' class="grid-item-thumbnail" src="${item.url ? item.url : './images/gray-square.jpg'}">
				</article>
		`}).join("");


	// applyRandomCutShapes()
}
