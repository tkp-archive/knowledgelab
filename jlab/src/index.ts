import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer // new
} from '@jupyterlab/application';

import {
  ToolbarButton, ICommandPalette, InstanceTracker // new
} from '@jupyterlab/apputils';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';

import {
  ServerConnection
} from '@jupyterlab/services';

import {
  JSONExt // new
} from '@phosphor/coreutils';

import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';

import '../style/index.css';

/**
 * Initialization data for the jupyterlab_xkcd extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_kr',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate
};

/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export
class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  private lab: JupyterLab;
  constructor(lab: JupyterLab){
      this.lab = lab;
  }

  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {

    let callback = () => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/kr/submit?notebook=" + panel.context.path, true);
      xhr.onload = function (e:any) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            console.log(xhr.responseText);
            this.lab.commands.execute('knowledge:open')
          } else {
            console.error(xhr.statusText);
          }
        }
      }.bind(this);
      xhr.onerror = function (e) {
        console.error(xhr.statusText);
      };
      xhr.send(null);
    };
    let button = new ToolbarButton({
      className: 'jp-KnowledgeRepo',
      onClick: callback,
      tooltip: 'Publish Knowledge'
    });

    panel.toolbar.insertItem(8, 'runAll', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}


/**
 * An new widget.
 */
class KnowledgeWidget extends Widget {
  /**
   * Construct a new xkcd widget.
   */
  constructor() {
    super();
    this.settings = ServerConnection.makeSettings();

    this.id = 'knowledge';
    this.title.label = 'Knowledge';
    this.title.closable = true;
    this.addClass('jp-knowledgeWidget');
  }

  /**
   * The server settings associated with the widget.
   */
  readonly settings: ServerConnection.ISettings;

  /**
   * Handle update requests for the widget.
   */
  onUpdateRequest(msg: Message): void {
  }
};


/**
 * Activate the xckd widget extension.
 */
function activate(app: JupyterLab, palette: ICommandPalette, restorer: ILayoutRestorer) {
  console.log('JupyterLab extension knowledgelab is activated!');

  app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension(app));

  // Declare a widget variable
  let widget: KnowledgeWidget;

  // Add an application command
  const new_command = 'knowledge:new';
  const open_command = 'knowledge:open';
  const submit_command = 'knowledge:submit';
  app.commands.addCommand(new_command, {
    label: 'New Knowledge',
    execute: args => {
      const path = typeof args['path'] === 'undefined' ? '': args['path'] as string;
      console.log(path);
      if (!widget) {
        widget = new KnowledgeWidget();
        widget.update();
      }
      if (!tracker.has(widget)) {
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        app.shell.addToMainArea(widget);
      } else {
        widget.update();
      }
      app.shell.activateById(widget.id);
    }
  });
  app.commands.addCommand(open_command, {
    label: 'Open Knowledge',
    execute: args => {
      const path = typeof args['path'] === 'undefined' ? '': args['path'] as string;
      console.log(path);
      if (!widget) {
        widget = new KnowledgeWidget();
        widget.update();
      }
      if (!tracker.has(widget)) {
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        app.shell.addToMainArea(widget);
      } else {
        widget.update();
      }
      app.shell.activateById(widget.id);
    }
  });

app.commands.addCommand(submit_command, {
    label: 'Submit Knowledge',
    execute: () => {
      if (!widget) {
        widget = new KnowledgeWidget();
        widget.update();
      }
      if (!tracker.has(widget)) {
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        app.shell.addToMainArea(widget);
      } else {
        widget.update();
      }
      app.shell.activateById(widget.id);
    }
  });

  // Add the command to the palette.
  palette.addItem({ command: new_command, category: 'Tools' });
  palette.addItem({ command: open_command, category: 'Tools' });
  palette.addItem({ command: submit_command, category: 'Tools' });

  // Track and restore the widget state
  let tracker = new InstanceTracker<Widget>({ namespace: 'tools' });
  restorer.restore(tracker, {
    command: open_command,
    args: () => JSONExt.emptyObject,
    name: () => 'knowledge'
  });
};


/**
 * Export the plugin as default.
 */
export default extension;