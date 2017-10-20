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
    function ButtonExtension(lab) {
        this.lab = lab;
    }
    /**
     * Create a new extension object.
     */
    ButtonExtension.prototype.createNew = function (panel, context) {
        var _this = this;
        var callback = function () {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/kr/submit?notebook=" + panel.context.path, true);
            xhr.onload = function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.log(xhr.responseText);
                        this.lab.commands.execute('knowledge:open');
                    }
                    else {
                        console.error(xhr.statusText);
                    }
                }
            }.bind(_this);
            xhr.onerror = function (e) {
                console.error(xhr.statusText);
            };
            xhr.send(null);
        };
        var button = new apputils_1.ToolbarButton({
            className: 'jp-KnowledgeRepo',
            onClick: callback,
            tooltip: 'Publish Knowledge'
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
var KnowledgeWidget = (function (_super) {
    __extends(KnowledgeWidget, _super);
    /**
     * Construct a new xkcd widget.
     */
    function KnowledgeWidget() {
        var _this = _super.call(this) || this;
        _this.settings = services_1.ServerConnection.makeSettings();
        _this.id = 'knowledge';
        _this.title.label = 'Knowledge';
        _this.title.closable = true;
        _this.addClass('jp-knowledgeWidget');
        return _this;
    }
    /**
     * Handle update requests for the widget.
     */
    KnowledgeWidget.prototype.onUpdateRequest = function (msg) {
    };
    return KnowledgeWidget;
}(widgets_1.Widget));
;
/**
 * Activate the xckd widget extension.
 */
function activate(app, palette, restorer) {
    console.log('JupyterLab extension knowledgelab is activated!');
    app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension(app));
    // Declare a widget variable
    var widget;
    // Add an application command
    var new_command = 'knowledge:new';
    var open_command = 'knowledge:open';
    var submit_command = 'knowledge:submit';
    app.commands.addCommand(new_command, {
        label: 'New Knowledge',
        execute: function (args) {
            var path = typeof args['path'] === 'undefined' ? '' : args['path'];
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
            }
            else {
                widget.update();
            }
            app.shell.activateById(widget.id);
        }
    });
    app.commands.addCommand(open_command, {
        label: 'Open Knowledge',
        execute: function (args) {
            var path = typeof args['path'] === 'undefined' ? '' : args['path'];
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
            }
            else {
                widget.update();
            }
            app.shell.activateById(widget.id);
        }
    });
    app.commands.addCommand(submit_command, {
        label: 'Submit Knowledge',
        execute: function () {
            if (!widget) {
                widget = new KnowledgeWidget();
                widget.update();
            }
            if (!tracker.has(widget)) {
                tracker.add(widget);
            }
            if (!widget.isAttached) {
                app.shell.addToMainArea(widget);
            }
            else {
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
    var tracker = new apputils_1.InstanceTracker({ namespace: 'tools' });
    restorer.restore(tracker, {
        command: open_command,
        args: function () { return coreutils_1.JSONExt.emptyObject; },
        name: function () { return 'knowledge'; }
    });
}
;
/**
 * Export the plugin as default.
 */
exports.default = extension;
