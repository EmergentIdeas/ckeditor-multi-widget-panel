# MultiWidgetPanel

Adds a wiget to the ck editor which shows multiple widgets that a user can
choose to add to the editor.

## Install

```bash
npm install @webhandle/ckeditor-multi-widget-panel
```

## Use

### CK Editor Config

Add `multi-widget-panel` to the ck editor config file like

```js
	config.extraPlugins = (config.extraPlugins ? config.extraPlugins + ',' : '') + 'multi-widget-panel'
```

### Webhandle Server Side

This is safe to run multiple times

```js
import('@webhandle/ckeditor-multi-widget-panel').then(mod => {
	mod.default()
})
```


### Adding a widget to the panel

This code is the sort of thing a ck editor plugin would run

```js
// Just make sure the data structures are in place
if(!window['@webhandle/ckeditor-widget-panel']) {
	window['@webhandle/ckeditor-widget-panel'] = {
		widgets: []
	}
}
if(!window['@webhandle/ckeditor-widget-panel'].widgets) {
	window['@webhandle/ckeditor-widget-panel'].widgets = {}
}


// The secret sauce here is the `template` which should be markup which will
// be recognized as a widget, and the `action` method, which inserts it.
// If your widget does not have and editor, remove the call to edit.
// It's important to check if the widget is registered with the panel already
// because the widget will be initialized multiple times, once per editor
// on the page.
if(!window['@webhandle/ckeditor-widget-panel'].widgets[widgetName]) {
	window['@webhandle/ckeditor-widget-panel'].widgets[widgetName] = {
		name: widgetName
		, label: "Widget Start"
		, template: template
		, icon: this.path + `icons/widget-start.png`
		, description: 'Adds a basic widget to the editor'
		, action: function(editor) {
			editor.insertHtml(this.template)
			setTimeout(function() {
				let keys = Object.keys(editor.widgets.instances)
				let widget = editor.widgets.instances[keys[keys.length - 1]]

				widget.focus()
				widget.edit()
			})
		}
	}
}

```
