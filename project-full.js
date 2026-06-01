class ProjectFull {
	static activeId = null

	constructor({ mediaEl, metadataEl, overlay, tagsContainer, random, video, destroyPackery }) {
		this.mediaEl = mediaEl
		this.metadataEl = metadataEl
		this.overlay = overlay
		this.tagsContainer = tagsContainer
		this.random = random
		this.video = video
		this.destroyPackery = destroyPackery
		this.gridAnimationTimeout = null

		overlay.onclick = () => this.resetOverlay()
	}

	resetOverlay() {
		this.overlay.innerHTML = ''
		this.overlay.style.display = 'none'
	}

	isOpen(id) {
		return ProjectFull.activeId === id && document.body.classList.contains('profile-open')
	}

	open(id, projects) {
		if (this.isOpen(id)) return
		ProjectFull.activeId = id

		document.body.classList.add('profile-open')
		this.tagsContainer.innerHTML = ''

		const el = document.querySelector(`*[data-id='${id}']`)
		document.querySelectorAll('*[data-id]').forEach(e => {
			if (e != el) e.classList.add('fall-down')
			e.onanimationend = () => {
				e.remove()
				window.scrollTo({ behavior: 'smooth', top: 0, left: 0 })
				el.classList.add('fall-down')
				el.onanimationend = () => el.remove()

				if (this.gridAnimationTimeout) clearTimeout(this.gridAnimationTimeout)
				this.gridAnimationTimeout = setTimeout(() => {
					this.destroyPackery()
				}, 1500)
			}
		})

		this.mediaEl.style.display = 'block'
		this.metadataEl.style.display = 'block'
		this.mediaEl.innerHTML = ''

		const project = projects.find(e => e.id == id)
		if (project) this.render(project)
	}

	render(project) {
		this.renderMedia(project)
		this.renderMetadata(project)
	}

	renderMedia(project) {
		project.images.forEach(item => {
			const img = document.createElement('img')
			const fullscreen = document.createElement('img')
			img.src = item.url
			fullscreen.src = item.url
			img.classList.add('project-img')
			img.style.opacity = 0

			img.onclick = () => {
				this.overlay.style.display = 'flex'
				this.overlay.appendChild(fullscreen)
			}

			this.mediaEl.appendChild(img)
			setTimeout(() => {
				img.style.opacity = 1
			}, this.random(500, 1500))
		})

		project.videos.forEach(item => {
			console.log(item.field_video_url)
			this.mediaEl.appendChild(
				this.video.createEmbed(item.field_video_url.uri, '100%', '600px')
			)
		})
	}

	renderMetadataHTML(project) {
		const linksBlock = project.portfolioLink || project.instagramLink
			? `
	<div class='designer-links'>
		${project.portfolioLink ? `<a href='${project.portfolioLink}' target='_blank' rel='noopener noreferrer'>Portfolio ↗</a>` : ''}
		${project.instagramLink ? `<a href='${project.instagramLink}' target='_blank' rel='noopener noreferrer'>Instagram ↗</a>` : ''}
	</div>`
			: ''

		return `
	<div class='project-data'>
		<h4>${project.projectTitle}</h4>
		<p class='project-description'>
				${project.description}
		</p>
		<p class='tags'><span class='tag'>TAGS </span>${project.tags.join(', ')}</p>
	</div>

	<div class='designer-data'>
		<h4>${project.firstName} ${project.lastName}</h4>
		<p class='project-description'>
				${project.bio}
		</p>
	</div>
	${linksBlock}
	`
	}

	renderMetadata(project) {
		this.metadataEl.innerHTML = this.renderMetadataHTML(project)
		setTimeout(() => {
			this.metadataEl.style.opacity = 1
		}, this.random(5, 15))
	}

	close() {
		document.body.classList.remove('profile-open')
		ProjectFull.activeId = null

		if (this.gridAnimationTimeout) clearTimeout(this.gridAnimationTimeout)

		this.mediaEl.style.display = 'none'
		this.metadataEl.style.display = 'none'
		this.metadataEl.style.opacity = 0
		this.mediaEl.innerHTML = ''
		this.metadataEl.innerHTML = ''
	}
}
