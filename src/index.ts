import {
  DisposableDelegate, IDisposable,
} from "@phosphor/disposable";

import {
  ILayoutRestorer, JupyterFrontEndPlugin, JupyterLab,
} from "@jupyterlab/application";

import {
  ICommandPalette, ToolbarButton,
} from "@jupyterlab/apputils";

import {
  DocumentRegistry,
} from "@jupyterlab/docregistry";

import {
  IDocumentManager,
} from "@jupyterlab/docmanager";

import {
  INotebookModel, NotebookPanel,
} from "@jupyterlab/notebook";

import {
  IMainMenu,
} from "@jupyterlab/mainmenu";

import {
  Widget,
} from "@phosphor/widgets";

import "../style/index.css";

// tslint:disable: no-console
// tslint:disable: object-literal-sort-keys
// tslint:disable: max-line-length

const extension: JupyterFrontEndPlugin<void> = {
  id: "jupyterlab_kr",
  autoStart: true,
  requires: [IDocumentManager, ICommandPalette, ILayoutRestorer],
  activate,
};

export
class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {

  public lab: JupyterLab;
  constructor(lab: JupyterLab) {
      this.lab = lab;
  }

  public createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {

    const callback = () => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "/knowledge/submit?notebook=" + panel.context.path, true);
      xhr.onload = function(e: any) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            // check if exists, if so populate fields
            // TODO
            console.log(xhr.responseText);
            this.lab.commands.execute("knowledge:open", {path: panel.context.path});
          } else {
            console.error(xhr.statusText);
          }
        }
      }.bind(this);
      xhr.onerror = (e) => {
        console.error(xhr.statusText);
      };
      xhr.send(null);
    };

    const button = new ToolbarButton({
      className: "kl-editPostIcon",
      onClick: callback,
      tooltip: "Publish Knowledge",
    });

    panel.toolbar.insertItem(8, "runAll", button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}

export
function submitKnowledgeForm(path: string, title: string, authors: string[], tags: string[], tldr: string, notebook: string, knowledgeRepo: string): void {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/knowledge/post", true);
    xhr.onload = (e: any) => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          alert(xhr.responseText);
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = (e) => {
      console.error(xhr.statusText);
    };
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader("_xsrf", document.cookie.split("=")[1]);
    xhr.send(JSON.stringify({path, title, authors, tags, tldr, notebook, knowledgeRepo}));
}

// tslint:disable-next-line: max-classes-per-file
export
class KnowledgeWidget extends Widget {
  constructor(path: string) {
    super();

    this.id = "kr-" + path;
    this.title.label = "Knowledge";
    this.title.closable = true;
    this.addClass("kl-widget");

    const form = document.createElement("form");
    form.className = "kl-widgetBody";
    form.onsubmit = () => false;
    const header = document.createElement("h2");
    header.textContent = "Knowledge Post";
    header.className = "kl-widgetTitle";
    form.appendChild(header);
    form.insertAdjacentHTML("beforeend", `<input id='kl-title' placeholder="Title" required>
       <input id='kl-authors' placeholder="Author/s" value="" required>
       <input id='kl-tags' placeholder="Tags" value="" required>
       <textarea id='kl-tldr' placeholder="tl;dr" value="" required></textarea>
       <div><label>Private</label><input type="checkbox"></div>
       <div><span>Created: </span><span id="kr-created"></span></div>
       <div><span>Updated: </span><span id="kr-created"></span></div>
       <div><span>Path: </span><span id="kr-path">` + path + `</span></div>
       <div><span>ID: </span><span id="kr-path"></span></div>
       <!--div><span>Thumbnail</span></div>
       <div><span>Allowed Groups:</span></div-->
       <input id='kl-kr' placeholder="Knowledge-repo url" value="">
       <div><button type="submit" id='kl-submit'>submit</button><button>cancel</button></div>
      `);

    const button =  form.querySelector("#kl-submit") as HTMLElement;
    button.onclick = () => {
      submitKnowledgeForm(path,
                          ( form.querySelector("#kl-title") as HTMLInputElement).value,
                          ( form.querySelector("#kl-authors") as HTMLInputElement).value.split(","),
                          ( form.querySelector("#kl-tags") as HTMLInputElement).value.split(","),
                          ( form.querySelector("#kl-tldr") as HTMLInputElement).value,
                          "test",
                          ( form.querySelector("#kl-kr") as HTMLInputElement).value,
                          );
    };
    this.node.appendChild(form);
  }

  public setPath(path: string) {
    const pathSpan = this.node.querySelector("#kr-path");
    pathSpan.textContent = path;
  }

}

/**
 * Activate the xckd widget extension.
 */
function activate(app: JupyterLab,
                  docManager: IDocumentManager,
                  palette: ICommandPalette,
                  restorer: ILayoutRestorer,
                  menu: IMainMenu) {
  console.log("JupyterLab extension knowledgelab is activated!!!");

  app.docRegistry.addWidgetExtension("Notebook", new ButtonExtension(app));

  // Declare a widget variable
  let widget: KnowledgeWidget;

  const isEnabled = () => {
    const { currentWidget } = app.shell;
    return !!(currentWidget && docManager.contextForWidget(currentWidget));
  };

  // Add an application command
  const openCommand = "knowledge:open";
  const submitCommand = "knowledge:submit";
  app.commands.addCommand(openCommand, {
    label: "Open Knowledge",
    isEnabled,
    execute: (args) => {
      let path = typeof args.path === "undefined" ? "" : args.path as string;
      if (path === "") {
        console.error("no path");
        const { currentWidget } = app.shell;
        path = docManager.contextForWidget(currentWidget).path;
      }
      widget = new KnowledgeWidget(path);
      widget.setPath(path);
      app.shell.add(widget, "main");
      app.shell.activateById(widget.id);
    },
  });

  app.commands.addCommand(submitCommand, {
    label: "Submit Knowledge",
    isEnabled,
    execute: (args) => {
      let path = typeof args.path === "undefined" ? "" : args.path as string;
      if (path === "") {
        console.error("no path");
        const { currentWidget } = app.shell;
        path = docManager.contextForWidget(currentWidget).path;
      }
      widget = new KnowledgeWidget(path);
      app.shell.add(widget, "main");
      widget.setPath(path);
      app.shell.activateById(widget.id);
    },
  });

  // Add the command to the palette.
  palette.addItem({command: openCommand, category: "Tools"});
  palette.addItem({command: submitCommand, category: "Tools"});
}

export default extension;
export {activate as _activate};
