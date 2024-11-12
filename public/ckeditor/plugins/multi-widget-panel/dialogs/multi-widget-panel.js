(function () {
	let idPrefix = 'i' + (new Date()).getTime()
	let cellsId = idPrefix + 'cells'


	CKEDITOR.dialog.add('multiwidgetpanel', function (editor) {
		let desc = {
			title: 'Add Widget'
			, buttons: [
				CKEDITOR.dialog.okButton,
			]
			, contents: [
				{
					id: 'info',
					label: 'Basics',
					elements: [
						{
							type: 'html'
							, html:
								`<p>
						Click a widget below to add it to the editor.
						</p>
						`

						}
						, {
							type: 'html',
							html: `
						<div id="${cellsId}" class="widget-cells" style="display: grid; grid-template-columns: 1fr 1fr 1fr; column-gap: 30px; row-gap: 30px; margin-top: 30px;">
						</div>
						`
						}
					]
				}
			]
			, onShow: function (one, two) {
				if(!window['@webhandle/ckeditor-widget-panel'].drawWidgets) {
					window['@webhandle/ckeditor-widget-panel'].drawWidgets = () => {
						if (window['@webhandle/ckeditor-widget-panel'] && window['@webhandle/ckeditor-widget-panel'].widgets) {
							for (let widget of Object.values(window['@webhandle/ckeditor-widget-panel'].widgets)) {
								let widgetCell = document.createElement('div')
								widgetCell.className = 'widget-cell'

								widgetCell.innerHTML = `
							<div class="top">
								<img src="${widget.icon}" alt="${widget.name}" style="max-width: 100%;"/>
							</div>
							<div class="label">
								${widget.label}
							
							</div>
							<div class="desc">
								<p>
								${widget.description}
								</p>
							
							</div>
							
							`

								widgetCell.addEventListener('click', (evt) => {
									widget.action(editor)
									closeDialog()
								})

								cells.appendChild(widgetCell)

							}
						}
					}
				}

				let editor = one.sender._.editor
				let cells = document.querySelector(`#${cellsId}`)
				addStyles()

				if (cells) {
					cells.innerHTML = ''
					window['@webhandle/ckeditor-widget-panel'].drawWidgets()
				}
			}

		}
		return desc
	})

	function closeDialog() {
		if (CKEDITOR.dialog.getCurrent().fire('cancel', { hide: true }).hide !== false) {
			CKEDITOR.dialog.getCurrent().hide();
		}
	}

	function addStyles() {
		if (!document.querySelector(`#${stylesId}`)) {
			let s = document.createElement('style')
			s.setAttribute('id', stylesId)
			s.innerHTML = panelStyles
			document.head.prepend(s)
		}
	}

	var stylesId = 'widget-panel-styles'

	var panelStyles =
		`
.widget-cell, .widget-cell * {
	cursor: pointer !important;
}
.widget-cell .top img {
	display: block;
	margin: auto;
}


`
})()