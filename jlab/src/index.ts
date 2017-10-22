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

const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_kr',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate
};

export
class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  private lab: JupyterLab;
  constructor(lab: JupyterLab){
      this.lab = lab;
  }

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
      className: 'kl-editPostIcon',
      onClick: callback,
      tooltip: 'Publish Knowledge'
    });

    panel.toolbar.insertItem(8, 'runAll', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}


class KnowledgeWidget extends Widget {
  constructor() {
    super();
    this.settings = ServerConnection.makeSettings();

    this.id = 'knowledge';
    this.title.label = 'Knowledge';
    this.title.closable = true;
    this.addClass('kl-widget');

    let div = document.createElement('div');
    div.className = 'kl-widgetBody';

    let header = document.createElement('h2');
    header.textContent = 'Knowledge Post';
    div.appendChild(header);
    /*
    header  required  purpose  example
  title  required  String at top of post  title: This post proves that 2+2=4
  authors  required  User entity that wrote the post in organization specified format  authors: 
  - kanye_west
  - beyonce_knowles
  tags  required  Topics, projects, or any other uniting principle across posts  tags: 
  - hiphop
  - yeezy
  created_at  required  Date when post was written  created_at: 2016-04-03
  updated_at  optional  Date when post was last updated  updated_at: 2016-10-10
  tldr  required  Summary of post takeaways that will be visible in /feed  tldr: I'ma let you finish, but Beyonce had one of the best videos of all time!
  path  optional  Instead of specifying post path in the CLI, specify with this post header  path: projects/path/to/post/on/repo
  thumbnail  optional  Specify which image is shown in /feed  thumbnail: 3 OR thumbnail: http://cdn.pcwallart.com/images/giraffe-tongue-wallpaper-1.jpg
  private  optional  If included, post is only visible to authors and editors set in repo configuration  private: true
  allowed_groups  optional  If the post is private, specify additional users or groups who can see the post  allowed_groups: ['jay_z', 'taylor_swift', 'rap_community']
     */
    div.innerHTML= `<div><label>Title:</label><input class="kl-titleInput"></div>
       <div><label>Author/s:</label><input class="kl-authorSelect"></div>
       <div><label>Tags:</label><input class="kl-tagsInput"></div>
       <div><label>tldr:</label><input class="kl-tldrText"></div>
      `;
    this.node.appendChild(div);
  }

  readonly settings: ServerConnection.ISettings;
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


export default extension;
