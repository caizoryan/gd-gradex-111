class ProjectTeaser {
	static TAGGED_SELECTOR = '.tagged'
	static GRID_ITEM_SELECTOR = '.grid-item'
	static zIndex = 1

	constructor(project, { random, imageStyleUrl }) {
		this.project = project
		this.random = random
		this.imageStyleUrl = imageStyleUrl
	}

	getDisplayName() {
		const { firstName, lastName } = this.project
		return firstName + ' ' + (lastName ? lastName : '')
	}

	getTagsAttr() {
		return `All, ${this.project.tags.join(', ')}`
	}

	getDimensions() {
		const w = this.random(200, 350)
		const thumb = this.project.thumbnail
		const ratio = w / (thumb?.width ? thumb.width : w)
		const height = ratio * (thumb?.height ? thumb.height : w)
		return { w, height }
	}

	toHTML() {
		const { id, projectTitle, thumbnail } = this.project
		const { w, height } = this.getDimensions()
		const thumbSrc = thumbnail?.url
			? this.imageStyleUrl(thumbnail.url, 'thumbnail')
			: './images/gray-square.jpg'

		return `
		<a class='tagged' href='#${id}' tags='${this.getTagsAttr()}'>
			<article class="grid-item crop-box" data-id="${id}">
				<h3 class="grid-item-heading">${this.getDisplayName()}</h3>
				<p class="grid-item-work-name">${projectTitle}</p>
				<img style='width:${w}px; height:${height}px;' class="grid-item-thumbnail" src="${thumbSrc}" loading="lazy">
			</article>
		</a>`
	}

	static renderAll(container, projects, helpers) {
		if (!container) return
		container.innerHTML = projects
			.map(project => new ProjectTeaser(project, helpers).toHTML())
			.join('')
		ProjectTeaser.bindInteractions(helpers.random)
	}

	static bindInteractions(random) {
		document.querySelectorAll('*[data-id]').forEach(el => {
			el.onclick = () => openProfile(el.getAttribute('data-id'), el)
		})
		document.querySelectorAll('article').forEach(el => {
			el.onmouseover = () => { el.style.zIndex = ++ProjectTeaser.zIndex }
			el.style.setProperty('--angle-random', random(-8, 8) + 'deg')
			el.style.setProperty('--angle-other-random', random(-8, 8) + 'deg')
		})
	}

	static clearPackeryStyles() {
		document.querySelectorAll(ProjectTeaser.GRID_ITEM_SELECTOR).forEach(item => {
			item.style.position = ''
			item.style.left = ''
			item.style.top = ''
			item.style.transform = ''
		})
	}
}
