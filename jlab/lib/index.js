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
var docmanager_1 = require("@jupyterlab/docmanager");
var widgets_1 = require("@phosphor/widgets");
require("../style/index.css");
var extension = {
    id: 'jupyterlab_kr',
    autoStart: true,
    requires: [docmanager_1.IDocumentManager, apputils_1.ICommandPalette, application_1.ILayoutRestorer],
    activate: activate
};
var ButtonExtension = /** @class */ (function () {
    function ButtonExtension(lab) {
        this.lab = lab;
    }
    ButtonExtension.prototype.createNew = function (panel, context) {
        var _this = this;
        var callback = function () {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/knowledge/submit?notebook=" + panel.context.path, true);
            xhr.onload = function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        // check if exists, if so populate fields
                        //TODO
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
function submitKnowledgeForm(notebook, title, authors, tags, tldr) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/knowledge/post", true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                alert(xhr.responseText);
            }
            else {
                console.error(xhr.statusText);
            }
        }
    }.bind(this);
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader('_xsrf', document.cookie.split('=')[1]);
    xhr.send(JSON.stringify({ notebook: notebook, title: title, authors: authors, tags: tags, tldr: tldr }));
}
var KnowledgeWidget = /** @class */ (function (_super) {
    __extends(KnowledgeWidget, _super);
    function KnowledgeWidget(path) {
        var _this = _super.call(this) || this;
        _this.id = 'kr-' + path;
        _this.title.label = 'Knowledge';
        _this.title.closable = true;
        _this.addClass('kl-widget');
        var form = document.createElement('form');
        form.className = 'kl-widgetBody';
        form.onsubmit = function () { return false; };
        var header = document.createElement('h2');
        header.textContent = 'Knowledge Post';
        header.className = 'kl-widgetTitle';
        form.appendChild(header);
        form.insertAdjacentHTML('beforeend', "<input id='kl-title' placeholder=\"Title\" required>\n       <input id='kl-authors' placeholder=\"Author/s\" value=\"\" required></div>\n       <input id='kl-tags' placeholder=\"Tags\" value=\"\" required></div>\n       <textarea id='kl-tldr' placeholder=\"tl;dr\" value=\"\" required></textarea></div>\n       <div><label>Private</label><input type=\"checkbox\"></div>\n       <div><span>Created: </span><span id=\"kr-created\"></span></div>\n       <div><span>Updated: </span><span id=\"kr-created\"></span></div>\n       <div><span>Path: </span><span id=\"kr-path\">" + path + "</span></div>\n       <div><span>ID: </span><span id=\"kr-path\"></span></div>\n       <!--div><span>Thumbnail</span></div>\n       <div><span>Allowed Groups:</span></div-->\n       <div><button type=\"submit\" id='kl-submit'>submit</button><button>cancel</button></div>\n      ");
        var button = form.querySelector('#kl-submit');
        button.onclick = function () {
            submitKnowledgeForm(path, form.querySelector('#kl-title').value, form.querySelector('#kl-authors').value.split(','), form.querySelector('#kl-tags').value.split(','), form.querySelector('#kl-tldr').value);
        };
        _this.node.appendChild(form);
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
function activate(app, docManager, palette, restorer) {
    console.log('JupyterLab extension knowledgelab is activated!');
    app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension(app));
    // Declare a widget variable
    var widget;
    var isEnabled = function () {
        var currentWidget = app.shell.currentWidget;
        return !!(currentWidget && docManager.contextForWidget(currentWidget));
    };
    // Add an application command
    var new_command = 'knowledge:new';
    var open_command = 'knowledge:open';
    var submit_command = 'knowledge:submit';
    app.commands.addCommand(new_command, {
        label: 'New Knowledge',
        isEnabled: isEnabled,
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
        isEnabled: isEnabled,
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
        isEnabled: isEnabled,
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
