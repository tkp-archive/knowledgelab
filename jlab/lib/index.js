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
var widgets_1 = require("@phosphor/widgets");
require("../style/index.css");
var extension = {
    id: 'jupyterlab_kr',
    autoStart: true,
    requires: [apputils_1.ICommandPalette, application_1.ILayoutRestorer],
    activate: activate
};
var ButtonExtension = (function () {
    function ButtonExtension(lab) {
        this.lab = lab;
    }
    ButtonExtension.prototype.createNew = function (panel, context) {
        var _this = this;
        var callback = function () {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/kr/submit?notebook=" + panel.context.path, true);
            xhr.onload = function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.log(xhr.responseText);
                        this.lab.commands.execute('knowledge:open', { path: panel.context.path });
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
            className: 'kl-editPostIcon',
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
var KnowledgeWidget = (function (_super) {
    __extends(KnowledgeWidget, _super);
    function KnowledgeWidget(path) {
        var _this = _super.call(this) || this;
        _this.settings = services_1.ServerConnection.makeSettings();
        _this.id = 'kr-' + path;
        _this.title.label = 'Knowledge';
        _this.title.closable = true;
        _this.addClass('kl-widget');
        var div = document.createElement('div');
        div.className = 'kl-widgetBody';
        var header = document.createElement('h2');
        header.textContent = 'Knowledge Post';
        header.className = 'kl-widgetTitle';
        div.appendChild(header);
        div.insertAdjacentHTML('beforeend', "<div><input placeholder=\"Title\"></div>\n       <div><input placeholder=\"Author\"></div>\n       <div><input placeholder=\"Tags\"></div>\n       <div><textarea placeholder=\"tl;dr\"></textarea></div>\n       <div><label>Private</label><input type=\"checkbox\"></div>\n       <div><span>Created: </span><span id=\"kr-created\"></span></div>\n       <div><span>Updated: </span><span id=\"kr-created\"></span></div>\n       <div><span>Path: </span><span id=\"kr-path\">" + path + "</span></div>\n       <div><span>ID: </span><span id=\"kr-path\"></span></div>\n       <!--div><span>Thumbnail</span></div>\n       <div><span>Allowed Groups:</span></div-->\n       <div><button>submit</button><button>cancel</button></div>\n      ");
        _this.node.appendChild(div);
        return _this;
    }
    KnowledgeWidget.prototype.setPath = function (path) {
        var path_span = this.node.querySelector('#kr-path');
        path_span.textContent = path;
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
            widget = new KnowledgeWidget(path);
            widget.setPath(path);
            app.shell.addToMainArea(widget);
            app.shell.activateById(widget.id);
        }
    });
    app.commands.addCommand(open_command, {
        label: 'Open Knowledge',
        execute: function (args) {
            var path = typeof args['path'] === 'undefined' ? '' : args['path'];
            widget = new KnowledgeWidget(path);
            widget.setPath(path);
            app.shell.addToMainArea(widget);
            app.shell.activateById(widget.id);
        }
    });
    app.commands.addCommand(submit_command, {
        label: 'Submit Knowledge',
        execute: function (args) {
            var path = typeof args['path'] === 'undefined' ? '' : args['path'];
            widget = new KnowledgeWidget(path);
            app.shell.addToMainArea(widget);
            widget.setPath(path);
            app.shell.activateById(widget.id);
        }
    });
    // Add the command to the palette.
    palette.addItem({ command: new_command, category: 'Tools' });
    palette.addItem({ command: open_command, category: 'Tools' });
    palette.addItem({ command: submit_command, category: 'Tools' });
}
;
exports.default = extension;
