import path from 'path'
import webhandle from 'webhandle'

let integrated = false

export default function integrate() {
	if(!integrated) {
		integrated = true
		webhandle.addStaticDir(path.join(webhandle.projectRoot, 'node_modules/@webhandle/ckeditor-multi-widget-panel/public/ckeditor/plugins'), {urlPrefix: '/ckeditor/plugins'})
	}
}

