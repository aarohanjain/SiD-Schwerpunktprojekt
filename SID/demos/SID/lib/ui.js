"use strict";

function insertDOM(container, content) {
    // console.log('insertDOM', container, content);
    if (container == null) {
        console.log('insertDOM called with container == null,', content);
        return; // do nothing
    }

    if (container instanceof Container) {
        container.insertChild(content);
        return container;
    }

    const c = $(container);
    if (!c.length) {
        console.error('insertDOM: container does not exist:', container);
    }
    return c.append(content);
}

// baseclass for all ui elements
class Widget extends Emitter {
    constructor(container, options) {
        const defaults = {
            id: '',
        };

        options = {...defaults, ...options};
        super();
        this.contents = null;

        this.options = options;
    }

    set id(id) {
        this.content.prop('id', id);
    }

    get id() {
        return this.content.prop('id');
    }

    _convertClasslist(list) {
        if (list.length == null || typeof(list) === "string" ) {
            list = [list];
        }

        return list
    }

    addClass(classlist) {
        for (let c of this._convertClasslist(classlist)) {
            this.content.addClass(c);
        }
    }

    removeClass(classlist) {
        for (let c of this._convertClasslist(classlist)) {
            this.content.removeClass(c);
        }
    }
}

class Container extends Widget {
    constructor(container, options) {
        super(container, options);
    }

    insertChild(child) {
        throw Error("Container is an abstract class, insertChild is not implemented.");
    }
}

// box layout that can contain other widgets and is implemnted using flexbox
class Box extends Container {
    constructor(container, options) {
        const defaults = {
            id: '',
            direction: 'row',
            border: false,
            spacing: '10px',
            alignment: 'center',
            wrap: true,
        };

        options = {...defaults , ...options};
        super(container, options);

        this.content = $('<div>');

        this.content.css('display', 'flex');
        this.content.css('flex-direction', options.direction);
        if (options.wrap)
            this.content.css('flex-wrap', 'wrap');

        // useful for debugging
        if (options.border) {
            this.content.css('border-width', '1px');
            this.content.css('border-style', 'solid');
        }

        this.alignment(options.alignment);
        this.children = [];

        insertDOM(container, this.content);
    }

    insertChild(child) {
        this.children.push(child);
        this.content.append(child);

        if (this.children.length === 1)
            return;

        if (this.options.direction === 'row') {
            child.css('margin-left', this.spacing);
        } else {
            child.css('margin-top', this.spacing);
        }
    }

    set spacing(spacing) {
        this.options.spacing = spacing;

        for (let child in this.children.slice(1)) {
            if (this.options.direction === 'row') {
                child.css('margin-left', this.spacing);
            } else {
                child.css('margin-top', this.spacing);
            }
        }
    }

    get spacing() {
        return this.options.spacing;
    }

    alignment(setting) {
        this.content.css('align-items', setting);
    }
}

// implements a spacer in a box
class BoxSpacer extends Widget {
    constructor(container, options) {
        const defaults = {
            id: '',
            width: 'auto',
            height: 'auto',
        };

        options = {...defaults, ...options};
        super(container, options);

        this.content = $('<div>');
        this.content.css('flex-grow', '1');

        this.id = options.id;

        this.width = options.width;
        this.height = options.height;

        insertDOM(container, this.content);
    }

    set width(w) {
        this._width = w;
        this.content.css('width', w);
    }

    get width() {
        return this._width;
    }

    set height(h) {
        this._height = h;
        this.content.css('height', h);
    }

    get height() {
        return this._height;
    }
}

// Adds text at any place (creates div and adds text into that)
class Label extends Widget {
    constructor(container, text, options) {
        const defaults = {
            id: '',
            tag: '<div>',
        };

        options = {...defaults, ...options};
        super(container, options);

        this.content = $(options.tag);
        this.text = text;
        this.id = options.id;

        insertDOM(container, this.content);
    }

    set text(text) {
        this.content.html(String(text));
        return this;
    }

    get text() {
        return this.content.html();
    }

    set width(text) {
        this.content.css('width', text);
    }

    get width() {
        return this.content.css('width');
    }
}

class Form extends Container {
    constructor(container, options) {
        const defaults = {
            id: '',
            inline: false,
        };
        options = {...defaults , ...options};
        super(container, options);

        this.content = $('<form>');
        insertDOM(container, this.content);
        if (options.inline) {
            this.addClass('form-inline');
        }

        this.content.on('submit', this._onChange.bind(this));
    }

    _onChange(event) {
        event.preventDefault();

        this.emit('change', event, this);
    }

    insertChild(child) {
        this.content.append(child);
    }
}

class LinePlot extends Widget {
    constructor(container, signals, options) {
        const defaults = {
            id: '',
            ylim: 0,
            labels: [],
            colors: [],
            width: 320, // in px
            height: 200, // in px
            scaleFactor: 1.0,
            verticalSections: 6,
            clip: true,
        };

        const defaultColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
            '#bcbd22', '#17becf'];

        options = {...defaults, ...options};

        super(container, options);

        this.labels = [];
        this.signals = signals;
        this.clip = options.clip;
        this.ylim = options.ylim;
        this.scaleFactor = options.scaleFactor;

        this.startTimeSys = new Date().getTime();
        this.series = [];
        this.colors = [];

        // spawn canvas
        this.canvas = $('<canvas></canvas>');
        this.canvas.prop('id', options.id);
        this.width = options.width;
        this.height = options.height;


        for (let i = 0; i < this.signals.length; i++) {
            this.colors[i] = options.colors[i] || defaultColors[i%defaultColors.length];
        }

        for (let i = 0; i < this.signals.length; i++) {
            if (!options.labels[i]) {
                continue;
            }

            const span = $('<span>');
            span.append($('<span class="badge">&nbsp;</span>').css('background-color', this.colors[i]));
            span.append($("<span>").html('&nbsp;' + options.labels[i] + ' '));
            this.labels[i] = span;
        }

        this.content = $('<p style="text-align: center"></p>').append(this.canvas).append($("<div>").append(this.labels));

        insertDOM(container, this.content);

        // http://smoothiecharts.org/builder/
        this.chart = new SmoothieChart({
            interpolation: 'linear',
            maxValue: this.ylim[1],
            minValue: this.ylim[0],
            grid: {
                fillStyle: '#ffffff',
                sharpLines: true,
                verticalSections: options.verticalSections
            },
            labels: {
                fillStyle: '#000000',
                precision: 1
            },
            timestampFormatter: function(t) {
                return (Math.round((t.getTime() - this.startTimeSys) / 1000).toString() + ' ');
            }.bind(this)
        });

        for (let i = 0; i < this.signals.length; i++) {
            const s = new TimeSeries();

            this.chart.addTimeSeries(s, {lineWidth: 3, strokeStyle: this.colors[i]});
            this.series.push(s);
        }

        this.chart.streamTo(this.canvas[0], 0);
    }

    set width(w) {
        this.canvas.prop('width', w);
    }
    get width() {
        return this.canvas.prop('width');
    }

    set height(h) {
        this.canvas.prop('height', h);
    }
    get height() {
        return this.canvas.prop('height');
    }

    onSample(sample) {
        if (this.startTimeData === -1) {
            this.startTimeData = sample.t;
        }

        for (let i = 0; i < this.signals.length; i++) {
            const name = this.signals[i];
            let value = getNestedObject(sample, name);
            value = this.scaleFactor * value;
            if (value === undefined) {
                console.log('signal does not exist', this.signals[i]);
            }
            if (this.clip) {
                this.clipVal(value);
            }
            this.series[i].append(new Date().getTime(), value);
        }
    }

    clipVal(value) {
        const eps = Math.abs(this.ylim[1] - this.ylim[0]) / 200;
        return Math.min(Math.max(value, this.ylim[0] + eps), this.ylim[1] - eps);
    }
}

class TextField extends Widget {
    constructor(container, placeholder, options) {
        const defaults = {
            id: '',
            value: '',
        };

        options = {...defaults, ...options};

        super(container, options);

        this.content = $('<input class="form-control" type="text">');
        this.content.on("change", this._onTextfieldChange.bind(this));

        // the order of these assignments is important
        this.value = options.value;
        this.id = options.id;
        this.placeholder = placeholder;

        insertDOM(container, this.content);
    }

    _onTextfieldChange() {
        this.emit('change', this.value, this);
    }

    set placeholder(text) {
        this.content.prop('placeholder', text);
    }

    get placeholder() {
        return this.content.prop('placeholder');
    }

    set value(text) {
        this.content.prop('value', text);
    }

    get value() {
        return this.content.prop('value');
    }
}

class Checkbox extends Widget {
    constructor(container, text, options) {
        const defaults = {
            id: '',
            checked: false,
            inline: false,
        };

        options = {...defaults, ...options};

        super(container, options);

        this.content = $('<div></div>');
        if (!options.inline)
            this.content.addClass('checkbox');

        this._label = $('<label></label>');
        this._labelText = $('<span></span>');
        if (options.inline)
            this._label.addClass('checkbox-inline');

        this._checkbox = $('<input type="checkbox" value="">');

        this._label.append(this._checkbox);
        this._label.append(this._labelText);
        this._labelText.html(text);
        this.content.append(this._label);

        // append checkbox to container
        insertDOM(container, this.content);

        if (options.id !== "") {
            this.id = options.id;
        }

        this.value   = options.checked;

        // register change handler
        this._checkbox.change(this._onCheckBoxChange.bind(this));
    }

    _onCheckBoxChange() {
        this.emit("change", this.value, this);
    }

    set value(value) {
        this._checkbox.prop("checked", value);
    }

    get value() {
        return this._checkbox.prop("checked");
    }

    set id(id) {
        this._checkbox.prop("id", id);
    }

    get id() {
        return this._checkbox.prop("id");
    }

    get text() {
        return this._labelText.html();
    }

    set text(text) {
        this._labelText.html(String(text));
    }

    set width(text) {
        this._label.css('width', text);
    }

    get width() {
        return this._label.css('width');
    }
}

// In addition to the "click" event, the value of the button switches between 0 and 1 when clicked.
// This signal can be easily interpreted e.g. in Simulink, but by default it does not change the visual appearance.
// Set a checkedClass to get a checkable button (i.e. a button with a different color when the value is 1).
// "defaultClass" and "checkedClass" can be set to "" to get a gray button style.
class Button extends Widget {
    constructor(container, text, options) {
        const defaults = {
            id: '',
            checkable: false,
            value: 0,
            block: true,
            defaultClass: "btn-primary",
            checkedClass: undefined,
        };
        options = {...defaults, ...options};

        super(container, options);

        this.content = $("<button class=\"btn\">");
        if (options.block)
            this.content.addClass('btn-block');
        this.content.on("click", this._onClick.bind(this));

        this.text = text;
        this.defaultClass = options.defaultClass;
        this.checkedClass = options.checkedClass === undefined ? options.defaultClass : options.checkedClass;
        this.id = options.id;
        this.value = options.value;

        insertDOM(container, this.content);
    }

    _onClick() {
        this.value = (this.value + 1) % 2;
    }

    set text(text) {
        this.content.html(text);
    }

    get text() {
        return this.content.html();
    }

    set value(value) {
        value = parseInt(value);
        console.assert(!isNaN(value), 'wrong value');

        this._value = value;

        if (this.value) {
            this.content.removeClass(this.defaultClass).addClass(this.checkedClass);
        } else {
            this.content.removeClass(this.checkedClass).addClass(this.defaultClass);
        }

        this.emit('change', value, this);
    }

    get value() {
        return this._value;
    }
}

class SubmitButton extends Button {
    constructor(container, text, options) {
        super(container, text, options);

        this.content.prop('type', 'submit');
    }
}

class Dropdown extends Widget {
    constructor(container, values, options) {
        const defaults = {
            id: '',
            value: 0,
        };
        options = {...defaults, ...options};

        super(container, options);

        this.content = $('<select class="form-control"></select>');

        for (let option of values) {
            const DOMOption = $('<option>');
            DOMOption.text(option);
            this.content.append(DOMOption);
        }

        insertDOM(container, this.content);

        this.content.on('change', this._onChange.bind(this));

        this.value = options.value;
        this.id    = options.id;
    }

    set value(value) {
        // just to be safe
        value = parseInt(value);
        console.assert(!isNaN(value), 'wrong value');

        this.content.prop('selectedIndex', value);
        this.emit('change', value, this);
    }

    get value() {
        return this.content.prop('selectedIndex');
    }

    get valueText() {
        return this.content.prop('value');
    }

    _onChange() {
        // *irony* isn't javascript beautiful? O.O */irony*
        this.value = this.value;
    }
}

class DropdownMenu extends Widget {
    constructor(container, values, options) {
        const defaults = {
            id: '',
            label: '<span class="glyphicon glyphicon-menu-hamburger"></span> <span class="caret"></span>',
            value: 0,
        };
        options = {...defaults, ...options};

        super(container, options);

        this.content = $('<div class="dropdown"></div>');

        this.button = $('<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">');
        this.button.html(options.label);
        this.content.append(this.button);

        const list = $('<ul class="dropdown-menu dropdown-menu-right"></ul>');
        this.content.append(list);

        for (let i in values) {
            const li = $('<li></li>');
            const a = $('<a href="#"></a>').click(() => this.value = i);
            a.text(values[i]);
            li.append(a);
            list.append(li);
        }

        insertDOM(container, this.content);

        this.values = values;
        this.value = options.value;
        this.id = options.id;
    }

    set value(value) {
        // just to be safe
        value = parseInt(value);
        console.assert(!isNaN(value), 'wrong value');

        this._value = value;
        this.emit('change', value, this);
    }

    get value() {
        return this._value;
    }

    get valueText() {
        return this.values[this.value];
    }
}

class Panel extends Container {
    constructor(container, headerText, options) {
        const defaults = {
            collapsible: true,
            collapsed: false,
            id: '',
            content: '',
            spacing: '10px',
        };
        options = {...defaults, ...options};

        super(container, options);

        // create div
        this.header  = $('<div>', {class:'panel-heading'}).append($('<h3>', {class:'panel-title'}).text(headerText));
        this.content = $('<div>', {class:'panel-body in'}).append(options.content);
        this.panel   = $('<div>', {class:'panel panel-default', id: options.id});

        this.panel.append(this.header).append(this.content);

        if (options.collapsible) {
            this.header.on('click', this.toggle.bind(this));
            this.header.prop('style', 'cursor: pointer;');
        }

        if (options.collapsible && options.collapsed) {
            this.content.toggleClass('collapse in');
        }

        this.spacing  = options.spacing;
        this.children = [];

        insertDOM(container, this.panel);
    }

    insertChild(child) {
        this.children.push(child);
        this.content.append(child);

        if (child.css != null)
            child.css("margin-top", this.spacing);
    }

    toggle(animated=true) {
        // this.content.toggleClass("collapse");
        if (animated)
            this.content.collapse('toggle');
        else
            this.content.toggleClass('collapse in');
        this.emit('change', this.value, this);
    }

    set spacing(spacing) {
        this._spacing = spacing;

        for (let i in this.children) {
            i.css('margin-top', spacing);
        }
    }

    get spacing() {
        return this._spacing;
    }

    get value() { // false if panel is collapsed
        return this.content.hasClass('collapse in');
    }
}

class Slider extends Widget {
    constructor(container, sliderOptions, options) {
        const defaults = {
            id: '',
            width: '300px',
        };
        options = {...defaults, ...options};

        super(container, options);

        const sliderDefaults = {
            value: 0,
            min: 0,
            max: 100,
        };
        sliderOptions = {...sliderDefaults, ...sliderOptions};

        this.content = $('<div>');
        // this.content.css('flex-grow', '1');
        if (options.id !== '') {

            this.content.prop('id', options.id);
        }
        this.slider = $('<input>');

        this.width = options.width;
        this.content.append(this.slider);
        insertDOM(container, this.content);

        this.slider.slider(sliderOptions);

        this.slider.on('slide', this._onChange.bind(this));
    }

    set width(w) {
        // if (w === 'auto') {
        //     this.content.css('flex-grow', 1);
        // } else {
        //     this.content.css('flex-grow', 0);
        // }
        this.slider.css('width', w);
    }

    get width() {
        this.slider.css('width');
    }

    hide() {
        this.content.hide();
    }

    show() {
        this.content.show();
        this.slider.slider('relayout');
    }

    get value() {
        return this.slider.slider('getValue');
    }

    set value(value) {
        this.slider.slider('setValue', value);
        this._onChange();
    }

    _onChange() {
        this.emit('change', this.value, this);
    }
}

class SliderRow extends Box {
    constructor(container, sliderOptions, options) {
        const defaults = {
            id: '',
            width: '300px',
            checkbox: false,
            checked: true,
            disabledValue: undefined, // when undefined, the actual slider value is always returned
            label: '',
            labelWidth: 'auto',
            valueLabelFormatter: sliderOptions.formatter || (val => val),
            valueLabelWidth: 'auto',
            spacing: '1.5em',
        };
        options = {...defaults, wrap: false, ...options};

        super(container, options);

        this.valueLabelFormatter = options.valueLabelFormatter;
        this.disabledValue = options.disabledValue;

        if (options.checkbox) {
            this.checkbox = new Checkbox(this, options.label, {inline: true});
            this.checkbox.value = options.checked;
            this.checkbox.width = options.labelWidth;
            this.label = null;
        } else {
            this.checkbox = null;
            this.label = new Label(this, options.label, {tag: '<span>'});
            this.label.width = options.labelWidth;
        }
        this.slider = new Slider(this, sliderOptions, {width: options.width});
        this.valueLabel = new Label(this, '', {tag: '<span>'});

        this._updateValueLabel();
        this.slider.on('change', this._emitChange.bind(this));
        if (this.checkbox)
            this.checkbox.on('change', this._emitChange.bind(this));
        this.on('change', this._updateValueLabel.bind(this));
    }

    get checked() {
        return this.checkbox ? this.checkbox.value : true;
    }

    set checked(value) {
        if (this.checkbox)
            this.checkbox.value = value;
        this._onChange();
    }

    get value() {
        if (!this.checked && this.disabledValue !== undefined)
            return this.disabledValue;
        return this.slider.value;
    }

    set value(value) {
        this.slider.value = value;
    }

    _emitChange() {
        this.emit('change', this.value, this);
    }

    _updateValueLabel() {
        this.valueLabel.text = this.valueLabelFormatter(this.value, !this.checked);
    }

    setCustomValueLabel(label) {
        this.valueLabelFormatter = () => label;
        this._updateValueLabel();
    }

    hide() {
        this.content.hide();
    }

    show() {
        this.content.show();
        this.slider.slider.slider('relayout');
    }
}
