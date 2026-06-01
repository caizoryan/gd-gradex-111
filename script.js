// ------------------
// Welcome Lurker!
// ------------------
let main = 'https://2026.ocadu.gd/'
let link = `https://2222.ocadu.gd/web/jsonapi/node/student_project?include=field_media_gallery,field_media_gallery.field_p_image,field_thumbnail_image,field_tags`
let pckry

let projectMedia = document.querySelector('.project-media')
let projectMetadata = document.querySelector('.project-metadata')
let overlay = document.querySelector(".overlay")

function resetOverlay() {
	overlay.innerHTML = ''
	overlay.style.display = 'none'
}

overlay.onclick = resetOverlay

let included  = {}
let cleaned 

// source ~ https://gist.github.com/kjbrum/2c784eda82f880e21cb3f0d621411e44
const video = {
    parse: function(url) {
        // - Supported YouTube URL formats:
        //   - http://www.youtube.com/watch?v=My2FRPA3Gf8
        //   - http://youtu.be/My2FRPA3Gf8
        //   - https://youtube.googleapis.com/v/My2FRPA3Gf8
        // - Supported Vimeo URL formats:
        //   - http://vimeo.com/25451551
        //   - http://player.vimeo.com/video/25451551
        // - Also supports relative URLs:
        //   - //player.vimeo.com/video/25451551

        url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

        if (RegExp.$3.indexOf('youtu') > -1) {
            var type = 'youtube';
        } else if (RegExp.$3.indexOf('vimeo') > -1) {
            var type = 'vimeo';
        }

        return {
            type: type,
            id: RegExp.$6
        };
    },

    // Returns an iframe of the video with the specified URL.
    createEmbed: function(url, width, height) {
        var self = this;
        var videoObj = self.parse(url);

        var iframe = document.createElement('iframe');
        iframe.width = width || 560;
        iframe.height = height || 315;
        iframe.frameborder = 0;
        iframe.setAttribute('allowFullScreen', '');

        if (videoObj.type == 'youtube') {
            iframe.src = '//www.youtube.com/embed/' + videoObj.id;
            iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
        } else if (videoObj.type == 'vimeo') {
            iframe.src = '//player.vimeo.com/video/' + videoObj.id;
            iframe.allow = "autoplay; fullscreen";
        }

        return iframe;
    },

    // Obtains the video's thumbnail and passed it back to a callback function.
    getThumbnail: function(url, cb) {
        var self = this;
        var videoObj = self.parse(url);
        var thumbUrl;

        switch (videoObj.type) {
            case 'youtube':
                thumbUrl = '//img.youtube.com/vi/' + videoObj.id + '/maxresdefault.jpg';
                break;
            case 'vimeo':
                thumbUrl = '//i.vimeocdn.com/video/' + videoObj.id + '_640.jpg';
                break;
            default:
                thumbUrl = '';
                break;
        }

        return thumbUrl;
    },
};

function init(){
}

let allTags = new Set()


fetch(link, {
	Accept: 'application/json',
	'Content-Type': 'application/json',
	'Access-Control-Allow-Origin': '*'
})
	.then(res => res.json())
	.then(res => {
		data = res.data

		res.included.forEach(e => {
			included[e.id] = e
		})

		cleaned = (res.data.map(x => {
			let attr = x.attributes
			let tags = x.relationships.field_tags
			tags = tags.data.map(e => included[e.id]?.attributes.name)
			tags.forEach(e => allTags.add(e))
			// tags.data.map(e => console.log(e.id, included[e.id]?.attributes.name))
			// console.log(tags.data, included[tags.data.id])
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
			let videoObjects = videos.data.filter(e => e.type == 'paragraph--video').map(e => included[e.id].attributes)
			if (videoObjects.length > 0) console.log("Has video", videoObjects.map(e => e.field_video_url ? video.parse(e.field_video_url?.uri) : ''))

			// console.log(videos.data.filter(e => e.type == 'paragraph--video').map(e => included[e.id].attributes))

			let o = {}
			o.projectTitle = attr.title
			o.firstName = attr.field_first_name_preferred_names
			o.lastName = attr.field_last_name
			o.description = attr.field_project_description.value
			o.bio = attr.field_short_biography?.value
			o.portfolioLink = attr.field_portfolio_site_link?.uri
			o.instagramLink = attr.field_instagram_link?.uri
			o.images = images
			o.videos = videoObjects
			o.thumbnail = thumbnail
			o.tags = tags
			o.id = x.id
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

		console.log(allTags)

		preloadThumbnailImages(cleaned).finally(() => {
			initHomePage(cleaned)
			initPackery()
		})
	})

const gridContainer = document.querySelector(".grid-container");
const tagsContainer = document.querySelector(".tags-container");

function random(min, max) {
    return Math.random() * (max - min) + min;
}

let curIndex = 1
let activeProfileId = null

let pckryDestroyTimeout

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
	if (activeProfileId === id && document.body.classList.contains('profile-open')) return
	activeProfileId = id

	document.body.classList.add('profile-open')
	tagsContainer.innerHTML = ''
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
	projectMedia.innerHTML = ''
	appendProjectImages(id)
}

function appendProjectImages(id){
	let project = cleaned.find(e => e.id == id)

	project.images.forEach(item => {
		let img = document.createElement("img")
		let fullscreen = document.createElement("img")
		img.src = item.url
		fullscreen.src = item.url

		img.classList.add('project-img')
		img.style.opacity = 0

		img.onclick = () => {
			overlay.style.display = 'flex'
			overlay.appendChild(fullscreen)
		}

		projectMedia.appendChild(img)
		setTimeout(() => {
			img.style.opacity=1
		}, random(500, 1500))
	})

	project.videos.forEach(item => {
		console.log(item.field_video_url)
		projectMedia.appendChild(video.createEmbed(item.field_video_url.uri, "100%", '600px'))
	})

	projectMetadata.innerHTML = `
	<div class='project-data'>
		<h4>${project.projectTitle}</h4>
		<p class='project-description'>
				${project.description}
		</p>
		<p class='tags'>${project.tags.join(', ')}</p>
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
}

function applyRandomAngles() {
	document.querySelectorAll("*[data-id]").forEach(e => {
		e.onclick = () => {
			openProfile(e.getAttribute('data-id'), e)
		}
	})
	document.querySelectorAll('article').forEach(e => {
		e.onmouseover = () => e.style.zIndex = ++curIndex
		e.style.setProperty("--angle-random", random(-8, 8) + 'deg');
		e.style.setProperty("--angle-other-random", random(-8, 8) + 'deg');
	})
}

function reset(){
	document.body.classList.remove('profile-open')
	// tagsContainer.innerHTML = ''
	activeProfileId = null
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

	let tagButtons = ['All', ...Array.from(allTags)].map(e => {
		let btn = document.createElement("button")
		btn.innerText = e
		if (e == 'All'){
			btn.style.paddingRight = '2em'
			btn.style.paddingLeft = '2em'
			btn.setAttribute('selected', 'true')
		}

		btn.onclick = () => {
			document.querySelectorAll("[selected='true']").forEach(e => e.setAttribute('selected', 'false'))
			btn.setAttribute('selected', 'true')
			let hideEls = []
			document.querySelectorAll(".tagged")
			.forEach(tagItem => {
				tagItem.style.opacity = 1
				let attr = tagItem.getAttribute('tags')
					console.log(attr, e, attr.includes(e))
				if (attr.includes(e)) return false
				else hideEls.push(tagItem)

			})
			hideEls.forEach(e => {
				e.style.opacity = .1 
			})
			pckry.reloadItems()
		}
		return btn
	})
	tagButtons.forEach(e => tagsContainer.appendChild(e))

	gridContainer.innerHTML = items.map((item) => {
		let w = random(200, 350)
		let ratio = w/(item.thumbnail?.width ? item.thumbnail.width : w)
		let height = ratio * (item.thumbnail?.height ? item.thumbnail.height : w)

		return `
		<a class='tagged' href='#${item.id}' tags='All, ${item.tags.join(", ")}'>
			<article  class="grid-item crop-box" data-id="${item.id}">
				<h3 class="grid-item-heading">${item.firstName + ' ' + (item.lastName ? item.lastName : '')}</h3>
				<p class="grid-item-work-name">${item.projectTitle}</p>
				<img style='width:${w}px; height:${height}px;' class="grid-item-thumbnail" src="${item.thumbnail?.url ? imageStyleUrl(item.thumbnail.url, 'large') : './images/gray-square.jpg'}">
				</article>
		</a>
`}).join("");

	applyRandomAngles()
}

function preloadThumbnailImages(items) {
	const thumbnailUrls = items
		.map(item => item.thumbnail?.url ? imageStyleUrl(item.thumbnail.url, 'large') : null)
		.filter(Boolean)

	const preloadPromises = thumbnailUrls.map(url => {
		return new Promise(resolve => {
			const img = new Image()
			img.onload = () => resolve()
			img.onerror = () => resolve()
			img.src = url
		})
	})

	return Promise.allSettled(preloadPromises)
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

let resizeTimeout
window.addEventListener('resize', () => {
	if (resizeTimeout) clearTimeout(resizeTimeout)
	resizeTimeout = setTimeout(() => {
		if (!cleaned) return
		// if (window.location.hash.slice(1) !== '') return

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
	}, 350)
})

window.addEventListener('keydown', (e) => {
	if (e.key == 'Escape' && overlay.style.display == 'flex'){
		resetOverlay()
	}
})
