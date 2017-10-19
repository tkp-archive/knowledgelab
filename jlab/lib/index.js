"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var disposable_1 = require("@phosphor/disposable");
var apputils_1 = require("@jupyterlab/apputils");
require("../style/index.css");
/**
 * The plugin registration information.
 */
var plugin = {
    activate: activate,
    id: 'jupyter.extensions.new-button',
    autoStart: true
};
/**
 * A notebook widget extension that adds a button to the toolbar.
 */
var ButtonExtension = (function () {
    function ButtonExtension() {
    }
    /**
     * Create a new extension object.
     */
    ButtonExtension.prototype.createNew = function (panel, context) {
        var callback = function () {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/kr/submit?notebook=" + panel.context.path, true);
            xhr.onload = function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.log(xhr.responseText);
                    }
                    else {
                        console.error(xhr.statusText);
                    }
                }
            };
            xhr.onerror = function (e) {
                console.error(xhr.statusText);
            };
            xhr.send(null);
        };
        var button = new apputils_1.ToolbarButton({
            className: 'jp-KnowledgeRepo',
            onClick: callback,
            tooltip: 'Run All'
        });
        panel.toolbar.insertItem(8, 'runAll', button);
        return new disposable_1.DisposableDelegate(function () {
            button.dispose();
        });
    };
    return ButtonExtension;
}());
exports.ButtonExtension = ButtonExtension;
/**
 * Activate the extension.
 */
function activate(app) {
    app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
}
;
/**
 * Export the plugin as default.
 */
exports.default = plugin;
