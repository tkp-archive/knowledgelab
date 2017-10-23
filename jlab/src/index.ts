import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer
} from '@jupyterlab/application';

import {
  ToolbarButton, ICommandPalette
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
      xhr.open("GET", "/knowledge/submit?notebook=" + panel.context.path, true);
      xhr.onload = function (e:any) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            // check if exists, if so populate fields
            //TODO
            console.log(xhr.responseText);
            this.lab.commands.execute('knowledge:open', {path:panel.context.path})
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

function submitKnowledgeForm(notebook:string, title:string, authors:string[], tags:string[], tldr:string): void {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/knowledge/post", true);
    xhr.onload = function (e:any) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          alert(xhr.responseText);
        } else {
          console.error(xhr.statusText);
        }
      }
    }.bind(this);
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader('_xsrf', document.cookie.split('=')[1])
    xhr.send(JSON.stringify({notebook:notebook, title:title, authors:authors, tags:tags, tldr:tldr}));
}

class KnowledgeWidget extends Widget {
  constructor(path: string) {
    super();
    this.settings = ServerConnection.makeSettings();

    this.id = 'kr-' + path;
    this.title.label = 'Knowledge';
    this.title.closable = true;
    this.addClass('kl-widget');

    let form = document.createElement('form');
    form.className = 'kl-widgetBody';
    form.onsubmit = () => {return false;};
    let header = document.createElement('h2');
    header.textContent = 'Knowledge Post';
    header.className = 'kl-widgetTitle';
    form.appendChild(header);
    form.insertAdjacentHTML('beforeend', `<input id='kl-title' placeholder="Title" required>
       <input id='kl-authors' placeholder="Author/s" value="" required></div>
       <input id='kl-tags' placeholder="Tags" value="" required></div>
       <textarea id='kl-tldr' placeholder="tl;dr" value="" required></textarea></div>
       <div><label>Private</label><input type="checkbox"></div>
       <div><span>Created: </span><span id="kr-created"></span></div>
       <div><span>Updated: </span><span id="kr-created"></span></div>
       <div><span>Path: </span><span id="kr-path">` + path + `</span></div>
       <div><span>ID: </span><span id="kr-path"></span></div>
       <!--div><span>Thumbnail</span></div>
       <div><span>Allowed Groups:</span></div-->
       <div><button type="submit" id='kl-submit'>submit</button><button>cancel</button></div>
      `);

    let button = <HTMLElement>form.querySelector('#kl-submit');
    button.onclick = () => {
      submitKnowledgeForm(path,
                          (<HTMLInputElement>form.querySelector('#kl-title')).value,
                          (<HTMLInputElement>form.querySelector('#kl-authors')).value.split(','),
                          (<HTMLInputElement>form.querySelector('#kl-tags')).value.split(','),
                          (<HTMLInputElement>form.querySelector('#kl-tldr')).value)
    };
    this.node.appendChild(form);
  }

  setPath(path: string){
    var path_span = this.node.querySelector('#kr-path');
    path_span.textContent = path;
  }

  readonly settings: ServerConnection.ISettings;
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
      widget = new KnowledgeWidget(path);
      widget.setPath(path);
      app.shell.addToMainArea(widget);
      app.shell.activateById(widget.id);
    }
  });

  app.commands.addCommand(open_command, {
    label: 'Open Knowledge',
    execute: args => {
      const path = typeof args['path'] === 'undefined' ? '': args['path'] as string;
      widget = new KnowledgeWidget(path);
      widget.setPath(path);
      app.shell.addToMainArea(widget);
      app.shell.activateById(widget.id);
    }
  });

app.commands.addCommand(submit_command, {
    label: 'Submit Knowledge',
    execute: args => {
      const path = typeof args['path'] === 'undefined' ? '': args['path'] as string;
      widget = new KnowledgeWidget(path);
      app.shell.addToMainArea(widget);
      widget.setPath(path);
      app.shell.activateById(widget.id);
    }
  });

  // Add the command to the palette.
  palette.addItem({command: new_command, category: 'Tools'});
  palette.addItem({command: open_command, category: 'Tools'});
  palette.addItem({command: submit_command, category: 'Tools'});
};


export default extension;
