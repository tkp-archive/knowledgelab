import { IDisposable } from '@phosphor/disposable';
import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';
import '../style/index.css';
/**
 * Initialization data for the jupyterlab_xkcd extension.
 */
declare const extension: JupyterLabPlugin<void>;
/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export declare class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
    private lab;
    constructor(lab: JupyterLab);
    /**
     * Create a new extension object.
     */
    createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable;
}
export default extension;
