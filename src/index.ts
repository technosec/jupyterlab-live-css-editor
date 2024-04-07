import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { LabIcon } from '@jupyterlab/ui-components';
import { LiveCSSEditorWidget } from './liveCSSEditorWidget';

/**
 * Initialization data for the @technosec/jupyter-live-css-editor extension.
 */

const eyeDropperLabIcon = new LabIcon({
	name: 'liveCSS:eyeDropper',
	svgstr: `<svg class="liveCSSEditorIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11.25l1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 10-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25l-8.47 8.47c-.34.34-.8.53-1.28.53s-.94.19-1.28.53l-.97.97-.75-.75.97-.97c.34-.34.53-.8.53-1.28s.19-.94.53-1.28L12.75 9M15 11.25L12.75 9" />
			  </svg>`
  });

const plugin: JupyterFrontEndPlugin<void> = {
  id: '@technosec/jupyter-live-css-editor:plugin',
  description: 'A JupyterLab extension to style your extensions/applications easily & fast.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension @technosec/jupyter-live-css-editor is activated!');

	const content = new LiveCSSEditorWidget();
	const widget = new MainAreaWidget<LiveCSSEditorWidget>({content});
	widget.title.label = 'Live CSS Editor';
	widget.title.icon = eyeDropperLabIcon;
	widget.title.closable = false;
	
	widget.addClass('live-css-editor-plugin-wrapper');
	app.shell.add(widget, 'left');
}
};

export default plugin;
