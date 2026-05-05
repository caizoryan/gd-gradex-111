// ------------------
// Welcome Lurker!
// ------------------
let main = 'https://2026.ocadu.gd/'
let link = `https://2222.ocadu.gd/web/jsonapi/node/student_project?include=field_media_gallery,field_media_gallery.field_p_image,field_thumbnail_image`
let pckry

let projectMedia = document.querySelector('.project-media')
let projectMetadata = document.querySelector('.project-metadata')

let included  = {}
let data
let cleaned 

fetch(link, {
	Accept: 'application/json',
	'Content-Type': 'application/json',
	'Access-Control-Allow-Origin': '*'
})
	.then(res => res.json())
	.then(res => {
		console.log(res.data)
		console.log(res)
		data = res.data
		res.included.forEach(e => {
			included[e.id] = e
		})

		cleaned = (res.data.map(x => {
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
			console.log(videos.data.filter(e => e.type == 'paragraph--video').map(e => included[e.id].attributes))

			let o = {}
			o.projectTitle = attr.title
			o.firstName = attr.field_first_name_preferred_names
			o.lastName = attr.field_last_name
			console.log(attr)
			o.description = attr.field_project_description.value
			o.bio = attr.field_short_biography?.value
			o.portfolioLink = attr.field_portfolio_site_link?.uri
			o.instagramLink = attr.field_instagram_link?.uri
			o.images = images
			o.thumbnail = thumbnail
			o.id = x.id
			// console.log(images)
			if (!o.thumbnail && images && images.length > 0) o.thumbnail = images[0]

			return o
		}))

		cleaned = cleaned
			.sort(() => Math.random() > .5 ? 1 : -1 )
			.sort(() => Math.random() > .5 ? 1 : -1 )
			.sort(() => Math.random() > .5 ? 1 : -1 )
			.sort(() => Math.random() > .5 ? 1 : -1 )
			.sort(() => Math.random() > .5 ? 1 : -1 )
			.sort(() => Math.random() > .5 ? 1 : -1 )
			.sort(() => Math.random() > .5 ? 1 : -1 )
			.sort(() => Math.random() > .5 ? 1 : -1 )
			.sort(() => Math.random() > .5 ? 1 : -1 )

		initHomePage(cleaned)
		initPackery()
	})

const gridContainer = document.querySelector(".grid-container");

function random(min, max) {
    return Math.random() * (max - min) + min;
}

let curIndex = 1

let pckryDestroyTimeout
let resizeTimeout

function isMobileViewport() {
	return window.matchMedia('(max-width: 768px)').matches
}

function clearPackeryStyles() {
	if (gridContainer) {
		gridContainer.style.height = ''
		gridContainer.style.position = ''
	}

	document.querySelectorAll('.grid-item').forEach(item => {
		item.style.position = ''
		item.style.left = ''
		item.style.top = ''
		item.style.transform = ''
	})
}

function destroyPackery() {
	if (pckry) {
		pckry.destroy()
		pckry = null
	}
	clearPackeryStyles()
}

function initPackery() {
	if (isMobileViewport()) {
		destroyPackery()
		return
	}
	const grid = document.querySelector('.grid-container')
	if (!grid) return
	destroyPackery()
	pckry = new Packery(grid, {
		gutter: -30,
		itemSelector: '.grid-item'
	})
}

function openProfile(id) {
	document.body.classList.add('profile-open')
	let el = document.querySelector(`*[data-id='${id}']`)
	document.querySelectorAll("*[data-id]").forEach(e => {
		if (e != el) e.classList.add('fall-down')
		e.onanimationend = () => { 
			e.remove()
			window.scrollTo({behavior: 'smooth', top: 0, left: 0})
			el.classList.add('fall-down')
			el.onanimationend = () => el.remove()

			if (pckryDestroyTimeout) clearTimeout(pckryDestroyTimeout)
			pckryDestroyTimeout = setTimeout(() => {
				destroyPackery()
			}, 1500)
		}
	})

	projectMedia.style.display = 'block'
	projectMetadata.style.display = 'block'
	appendProjectImages(id)
}

function appendProjectImages(id){
	let project = cleaned.find(e => e.id == id)

	project.images.forEach(item => {
		let img = document.createElement("img")
		img.src = item.url
		img.classList.add('project-img')
		img.style.opacity = 0
		projectMedia.appendChild(img)
		setTimeout(() => {
			img.style.opacity=1
		}, random(500, 1500))
	})

	projectMetadata.innerHTML = `
<div class='project-data'>
	<h4>${project.projectTitle}</h4>
	<p class='project-description'>
			${project.description}
	</p>
</div>

<div class='designer-data'>
	<h4>${project.firstName} ${project.lastName}</h4>
	<p class='project-description'>
			${project.bio}
	</p>
</div>

${project.portfolioLink || project.instagramLink ? `
<div class='designer-links'>
	${project.portfolioLink ? `<a href='${project.portfolioLink}' target='_blank' rel='noopener noreferrer'>Portfolio ↗</a>` : ''}
	${project.instagramLink ? `<a href='${project.instagramLink}' target='_blank' rel='noopener noreferrer'>Instagram ↗</a>` : ''}
</div>
` : ''}
`


	setTimeout(() => {
		projectMetadata.style.opacity=1
	}, random(5, 15))

	// console.log(project.ima)

}

function applyRandomAngles() {
	document.querySelectorAll("*[data-id]").forEach(e => {
		e.onclick = () => {
			openProfile(e.getAttribute('data-id'), e)
		}
	})
	document.querySelectorAll('article').forEach(e => {
		e.onmouseover = () => e.style.zIndex = ++curIndex
		e.style.setProperty("--angle-random", random(-10, 10) + 'deg');
		e.style.setProperty("--angle-other-random", random(-10, 10) + 'deg');
	})
}

function reset(){
	document.body.classList.remove('profile-open')
	if (pckryDestroyTimeout) clearTimeout(pckryDestroyTimeout)
	initHomePage(cleaned)

	projectMedia.style.display = 'none'
	projectMetadata.style.display = 'none'
	projectMetadata.style.opacity = 0

	projectMedia.innerHTML = ''
	projectMetadata.innerHTML = ''

	initPackery()
}

function initHomePage(items) {
	if (!gridContainer) return;
	gridContainer.innerHTML = items.map((item) => {
		let w = random(200, 350)
		let ratio = w/(item.thumbnail?.width ? item.thumbnail.width : w)
		let height = ratio * (item.thumbnail?.height ? item.thumbnail.height : w)

		if (item.projectTitle == 'Cura Prototype') return ''

		console.log(imageStyleUrl(item.thumbnail.url, 'thumbnail'));

		return `
<a href='#${item.id}'>
			<article  class="grid-item crop-box" data-id="${item.id}">
				<h3 class="grid-item-heading">${item.firstName + ' ' + (item.lastName ? item.lastName : '')}</h3>
				<p class="grid-item-work-name">${item.projectTitle}</p>
				<img style='width:${w}px; height:${height}px;' class="grid-item-thumbnail" src="${item.thumbnail?.url ? imageStyleUrl(item.thumbnail.url, 'large') : './images/gray-square.jpg'}">
			</article>
</a>
`}).join("");

	applyRandomAngles()
}


function imageStyleUrl(originalUrl, style) {
  const url = new URL(originalUrl, window.location.origin);
  const path = url.pathname.replace('/web/sites/default/files', '');

  return `${url.origin}/web/sites/default/files/styles/${style}/public${path}`;
}

window.onhashchange = e => {
	let hash = window.location.hash
	console.log(hash.slice(1))
	if (hash.slice(1) == ''){reset()}
	else if (cleaned.find(e => e.id == hash.slice(1))) openProfile(hash.slice(1))
}

window.addEventListener('resize', () => {
	if (resizeTimeout) clearTimeout(resizeTimeout)
	resizeTimeout = setTimeout(() => {
		if (!cleaned) return
		if (window.location.hash.slice(1) !== '') return
		if (isMobileViewport()) {
			destroyPackery()
			return
		}
		if (!pckry) {
			initPackery()
			return
		}
		pckry.reloadItems()
		pckry.layout()
	}, 180)
})
