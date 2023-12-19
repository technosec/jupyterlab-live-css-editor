import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the @technosec/jupyter-live-css-editor extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@technosec/jupyter-live-css-editor:plugin',
  description: 'A JupyterLab extension to style your extensions/applications easily & fast.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension @technosec/jupyter-live-css-editor is activated!');
  }
};

export default plugin;
