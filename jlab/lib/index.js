"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var disposable_1 = require("@phosphor/disposable");
var application_1 = require("@jupyterlab/application");
var apputils_1 = require("@jupyterlab/apputils");
var services_1 = require("@jupyterlab/services");
var coreutils_1 = require("@phosphor/coreutils");
var widgets_1 = require("@phosphor/widgets");
require("../style/index.css");
/**
 * Initialization data for the jupyterlab_xkcd extension.
 */
var extension = {
    id: 'jupyterlab_kr',
    autoStart: true,
    requires: [apputils_1.ICommandPalette, application_1.ILayoutRestorer],
    activate: activate
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
 * An new widget.
 */
var NewWidget = (function (_super) {
    __extends(NewWidget, _super);
    /**
     * Construct a new xkcd widget.
     */
    function NewWidget() {
        var _this = _super.call(this) || this;
        _this.settings = services_1.ServerConnection.makeSettings();
        _this.id = 'newwidget';
        _this.title.label = 'My Widget';
        _this.title.closable = true;
        _this.addClass('jp-newWidget');
        return _this;
    }
    /**
     * Handle update requests for the widget.
     */
    NewWidget.prototype.onUpdateRequest = function (msg) {
    };
    return NewWidget;
}(widgets_1.Widget));
;
/**
 * Activate the xckd widget extension.
 */
function activate(app, palette, restorer) {
    console.log('JupyterLab extension newwidget is activated!');
    app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
    // Declare a widget variable
    var widget;
    // Add an application command
    var command = 'newwidget:open';
    app.commands.addCommand(command, {
        label: 'New Widget',
        execute: function () {
            if (!widget) {
                // Create a new widget if one does not exist
                widget = new NewWidget();
                widget.update();
            }
            if (!tracker.has(widget)) {
                // Track the state of the widget for later restoration
                tracker.add(widget);
            }
            if (!widget.isAttached) {
                // Attach the widget to the main area if it's not there
                app.shell.addToMainArea(widget);
            }
            else {
                // Refresh the widget
                widget.update();
            }
            // Activate the widget
            app.shell.activateById(widget.id);
        }
    });
    // Add the command to the palette.
    palette.addItem({ command: command, category: 'Tools' });
    // Track and restore the widget state
    var tracker = new apputils_1.InstanceTracker({ namespace: 'tools' });
    restorer.restore(tracker, {
        command: command,
        args: function () { return coreutils_1.JSONExt.emptyObject; },
        name: function () { return 'newwidget'; }
    });
}
;
/**
 * Export the plugin as default.
 */
exports.default = extension;
