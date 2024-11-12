(function () {
	let widgetName = 'multi-widget-panel'


	let escapeAttributeValue = function (s, preserveCR) {
		preserveCR = preserveCR ? '&#13;' : '\n';
		return ('' + s) /* Forces the conversion to string. */
			.replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
			.replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
			.replace(/"/g, '&quot;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			/*
			You may add other replacements here for HTML only 
			(but it's not necessary).
			Or for XML, only if the named entities are defined in its DTD.
			*/
			.replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
			.replace(/[\r\n]/g, preserveCR)
	}
	let unescapeAttributeValue = function (s, preserveCR) {
		preserveCR = preserveCR ? '&#13;' : '\n';
		return ('' + s) /* Forces the conversion to string. */
			.split('&apos;').join("'")
			.split('&quot;').join('"')
			.split('&lt;').join('<')
			.split('&gt;').join('>')
			.split('&#13;').join('\n')
			.split('&amp;').join('&')
	}

	let setIfExists = function (widget, attr) {
		var w = widget.element.$.attributes.getNamedItem('data-' + attr)
		if (w) {
			widget.setData(attr, w.value)
		}
	}
	let setIfExistsCheckbox = function (widget, attr) {
		var w = widget.element.$.attributes.getNamedItem('data-' + attr)
		if (w) {
			widget.setData(attr, w.value == 'false' ? false : true)
		}
	}


	CKEDITOR.plugins.add(widgetName, {
		requires: 'widget',

		icons: 'multi-widget-panel.png',

		init: function (editor) {
			editor.addCommand( 'multiwidgetpanelopen', new CKEDITOR.dialogCommand( 'multiwidgetpanel' ) );

			editor.ui.addButton("MultiWidgetPanel", {
				label: 'Add a Widget'
				, command: 'multiwidgetpanelopen'
				, icon: this.path + 'icons/multi-widget-panel.png' 
			})

			CKEDITOR.dialog.add('multiwidgetpanel', this.path + `dialogs/multi-widget-panel.js`);

			if(!window['@webhandle/ckeditor-widget-panel']) {
				window['@webhandle/ckeditor-widget-panel'] = {
					widgets: []
				}
			}
			if(!window['@webhandle/ckeditor-widget-panel'].widgets) {
				window['@webhandle/ckeditor-widget-panel'].widgets = {}
			}
		}
	});


	function makeMarkup(url, options) {
		let o = parseWebp2xUrl(url)
		o.params = o.params || {}
		o.params.imgStyle = o.params.imgStyle || ''
		o.params.imgStyle += ' display: block; max-width: 100%; max-height: 100%; height: auto; '
		let html = generatePictureMarkup(o.url, Object.assign(o.params, options))
		return html
	}

	function parseWebp2xUrl(url) {

		let i = url.lastIndexOf('#')
		if (i < 0) {
			return {
				url: url
			}
		}

		let result = {
			url: url.substring(0, i)
			, params: {}
		}

		let parts = url.substring(i + 1).split('&')
		for (let part of parts) {
			let sides = part.split('=')
			if (sides[1]) {
				sides[1] = decodeURIComponent(sides[1])
			}
			result.params[sides[0]] = sides[1]
		}

		return result
	}

	/**
	 * Generate markup for a picture with webp double density components and a fallback to another format
	 * @param {string} url The URL of the primary fallback image
	 * @param {object} options
	 * @param {object} options.width The natural width of the single size image
	 * @param {object} options.height The natural height of the single size image
	 * @param {object} [options.format] Set with webp2x which will generate an picture with webp alternatives. Anything else will cause a simpler picture with single image element
	 * @param {object} [options.alt] The alt text (descriptive text) for the image, If blank it will be set from the image name
	 * @param {object} [options.displayWidth] The width at which the picture will actually be displayed if known and different from the natural width
	 * @param {object} [options.displayHeight] The height at which the picture will actually be displayed if known and different from the natural height
	 * @param {object} [options.pictureStyle] Style attribute text for the picture element
	 * @param {object} [options.imgStyle] Style attribute text for the image element
	 * @param {object} [options.pictureClass] The class attribute value. If blank it will be set from the base name
	 * @param {object} [options.cdnPrefix] A prefix for the url
	 * @returns 
	 */
	function generatePictureMarkup(url, { width, height, format, alt,
		displayWidth, displayHeight, pictureStyle, imgStyle, pictureClass, cdnPrefix = '' } = {}) {

		let pictureStyleAttr = ''
		if (pictureStyle) {
			pictureStyleAttr = ` style="${pictureStyle}" `
		}

		let imgStyleAttr = ''
		if (imgStyle) {
			imgStyleAttr = ` style="${imgStyle}" `
		}

		let { basename, ext, baseUrl } = urlBasename(url)
		if (!pictureClass) {
			pictureClass = escapeAttributeValue(basename) + '-picture'
		}

		if (!alt) {
			alt = basename
		}
		alt = escapeAttributeValue(alt, true)

		if (!displayWidth && width) {
			displayWidth = width + 'px'
		}
		if (!displayHeight && height) {
			displayHeight = height + 'px'
		}


		let picture

		if (format === 'webp2x') {
			let full = parseInt(width)
			let double = 2 * full
			let half = Math.ceil(full / 2)
			let quarter = Math.ceil(full / 4)


			let fallback = 'image/jpeg'
			if (ext.toLowerCase() == 'png') {
				fallback = 'image/png'
			}
			picture =
				`<picture class="${pictureClass}" ${pictureStyleAttr}>
	<source 
		srcset="${cdnPrefix}${baseUrl}-2x.webp ${double}w, ${cdnPrefix}${baseUrl}.webp ${full}w, ${cdnPrefix}${baseUrl}-half.webp ${half}w, ${cdnPrefix}${baseUrl}-quarter.webp ${quarter}w"  
		sizes="min(100vw, ${displayWidth})"
		type="image/webp">
	<source 
		srcset="${cdnPrefix}${baseUrl}-2x.${ext} ${double}w, ${cdnPrefix}${baseUrl}.${ext} ${full}w, ${cdnPrefix}${baseUrl}-half.${ext} ${half}w, ${cdnPrefix}${baseUrl}-quarter.${ext} ${quarter}w"  
		sizes="min(100vw, ${displayWidth})"
		type="${fallback}">
	
	<img src="${cdnPrefix}${baseUrl}.${ext}" alt="${alt}" width="${displayWidth}" height="${displayHeight}" ${imgStyleAttr} >
</picture>
`
		}
		else {
			let widthAttr = ''
			if (displayWidth) {
				widthAttr = `width="${displayWidth}"`
			}

			let heightAttr = ''
			if (displayHeight) {
				heightAttr = `height="${displayHeight}"`
			}
			picture = `<picture class="${pictureClass}" ${pictureStyleAttr}>
	<img src="${cdnPrefix}${baseUrl}.${ext}" alt="${alt}" ${widthAttr} ${heightAttr} ${imgStyleAttr} >
</picture>
`
		}
		return picture

	}

	function urlBasename(url) {
		while (url.endsWith('/')) {
			url = url.substring(0, url.length - 1)
		}

		let parts = url.split('/')
		let last = parts.pop()

		let i = last.lastIndexOf('.')
		let ext
		if (i > -1) {
			ext = last.substring(i + 1)
		}

		let result = {
			basename: fileBasename(last)
			, ext: ext
		}

		parts.push(result.basename)
		result.baseUrl = parts.join('/')

		return result
	}

	function fileBasename(name) {
		return name.substring(0, name.lastIndexOf('.'))
	}

})()