import { IDisposable } from '@phosphor/disposable';
import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';
import '../style/index.css';
declare const extension: JupyterLabPlugin<void>;
export declare class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
    constructor(lab: JupyterLab);
    createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable;
    lab: JupyterLab;
}
export default extension;
