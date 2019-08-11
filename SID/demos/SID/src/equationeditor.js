"use strict";

class EqnElementScalar {
    constructor(equation, callbackBase, idPrefix, options) {
        this.equation = equation;
        this.callbackBase = callbackBase;
        this.idPrefix = idPrefix;
        this.$elem = undefined;
        const defaults = {
            value: 0,
        };
        this.options = {...defaults, ...options};
    }

    render() {
        let text = this.options.value;
        text = '\\color{black}{'+text+'}';
        text = '\\href{javascript:'+this.callbackBase+')}{'+text+'}';
        return text;
    }

    postRender($elem) {
        $elem.popover({
            html: true,
            content: '<p><form onsubmit="'+this.callbackBase+',1); return false;"><span style="vertical-align:center;">k: <input id="'+this.idPrefix+'_val" type="number" value="'+this.options.value+'" step="0.5" min="-10" max="10"></span>&nbsp;&nbsp;&nbsp;'+
                '<button style="vertical-align:center;" type="submit" class="btn btn-primary">OK</button></form></p>',
            title: undefined, //"Edit coefficient",
            placement: 'auto bottom',
            container: 'body'
        });
        this.$elem = $elem;
    }

    callback(args) {
        console.log('callback!', args);
        if (args === 1) { // OK clicked
            this.options.value = parseFloat($('#'+this.idPrefix+'_val').val());
            this.$elem.popover('hide');
            return true;
        }
        return false;
    }

    getValues() {
        return {val: this.options.value};
    }
}

class EqnElementTF {
    constructor(equation, callbackBase, idPrefix, options) {
        this.equation = equation;
        this.callbackBase = callbackBase;
        this.idPrefix = idPrefix;
        this.$elem = undefined;
        const defaults = {
            re: 0,
            im: 0,
            enabled: true,
        };
        this.options = {...defaults, ...options};
    }

    render() {
        let text = '\\Big(s-('+ (this.options.re<0?'':'+') + this.options.re+(this.options.im !== 0.0 ? (this.options.im<0?'':'+')+this.options.im+'j' : '') + ')\\Big)';
        if (this.options.enabled)
            text = '\\color{black}{'+text+'}';
        else
        // text = '\\quad'; //'\\color{lightgray}{'+text+'}';
            text = '\\color{lightgray}{\\square}';
        text = '\\href{javascript:'+this.callbackBase+')}{'+text+'}';
        return text;
    }

    postRender($elem) {
        $elem.popover({
            html: true,
            content: '<form onsubmit="'+this.callbackBase+',1); return false;"><p>'+
                '<input id="'+this.idPrefix+'_re" type="number" value="'+this.options.re+'" step="0.5" min="-10" max="10"></span>&nbsp;+&nbsp;'+
                '<input id="'+this.idPrefix+'_im" type="number" value="'+this.options.im+'" step="0.5" min="-10" max="10"></span>&nbsp;j</p>'+
                '<p><span style="vertical-align:center; float:left;" class="checkbox"><label><input id="'+this.idPrefix+'_enabled" type="checkbox"'+(true || this.options.enabled ? ' checked="checked"' : '')+'>enabled</label></span><button style="vertical-align:center; float:right;" type="submit" class="btn btn-primary">OK</button></p></form><div style="clear: both;"></div>',
            title: undefined, //"Edit coefficient",
            placement: 'auto bottom',
            container: 'body'
        });
        this.$elem = $elem;
    }

    callback(args) {
        if (args === 1) { // OK clicked
            const re = parseFloat($('#'+this.idPrefix+'_re').val());
            const im = parseFloat($('#'+this.idPrefix+'_im').val());
            const enabled = $('#'+this.idPrefix+'_enabled').prop('checked');
            this.updateValues(re, im, enabled);
            this.$elem.popover('hide');
            return true;
        }
        return false;
    }

    updateValues(re, im, enabled) {
        console.log('updateValues:', re, im, enabled);
        if (isNaN(re))
            re = 0.0;
        if (isNaN(im))
            im = 0.0;

        // determine name of this element in the InteractiveEquation class (e.g. Kz1/Gp0)
        let name;
        for (let e of this.equation.elements) {
            if (e[1] === this) {
                name = e[0];
                break;
            }
        }

        // find out if there is another pole/zero that will be cancelled out
        const c = (name[1] === 'z') ? 'p' : 'z';
        let cancelled = false;
        for (let e of this.equation.elements) {
            if (e[0].length !== 3 || e[0][1] !== c)
                continue;
            if (enabled && e[1].options.enabled && re === e[1].options.re && (im === e[1].options.im || im === -e[1].options.im)) {
                e[1].options.enabled = false;
                cancelled = true;
            }
        }
        if (cancelled) {
            alert(tr('Pole-zero cancellation!'));
            enabled = false;
        }

        // if the pole/zero is/was complex and is enabled, ensure there is another one which is its conjugate
        if (enabled && (im !== 0.0 || (this.options.enabled && this.options.im !== 0.0))) {
            const elems = [];
            // first, find the two corresponding elements (e.g. Kz1 and Kz3 if the name == "Kz2")
            for (let e of this.equation.elements) {
                if (e[0].length !== 3 || e[0].substring(0, 2) !== name.substring(0, 2) || e[0] === name)
                    continue;
                elems.push(e[1]);
            }
            console.assert(elems.length === 2, elems);
            let elem = undefined;
            // find the element to update. first: is there an enabled complex one?
            if (elems[0].options.enabled && elems[0].options.im !== 0.0) {
                elem = elems[0];
                if (elems[1].options.enabled && elems[1].options.im !== 0.0) {
                    alert(tr('Imaginary part of third pole/zero set to zero!'));
                    elems[1].options.im = 0.0;
                }
            } else if (elems[1].options.enabled && elems[1].options.im !== 0.0) {
                elem = elems[1];
                // if not, is there a disabled one?
            } else if (!elems[0].options.enabled) {
                elem = elems[0];
            } else if (!elems[1].options.enabled) {
                elem = elems[1];
            } else {
                elem = elems[0]; // whatever...
            }
            // this element has to enabled and be the complex conjugate
            elem.options.re = re;
            elem.options.im = -im;
            elem.options.enabled = true;
        }

        // if the pole/zero was complex and is now disabled, look for other complex poles/zeros and disable them
        if (!enabled && this.options.enabled && this.options.im !== 0.0) {
            for (let e of this.equation.elements) {
                if (e[0].length !== 3 || e[0].substring(0, 2) !== name.substring(0, 2) || e[0] === name)
                    continue;
                if (e[1].options.im !== 0)
                    e[1].options.enabled = false;
            }
        }

        this.options.re = re;
        this.options.im = im;
        this.options.enabled = enabled;

        // count the number of enabled poles and zeros
        let pCount = 0;
        let zCount = 0;
        for (let e of this.equation.elements) {
            if (e[0].length !== 3 || !e[1].options.enabled)
                continue;
            if (e[0][1] === 'p')
                pCount++;
            else {
                console.assert(e[0][1] === 'z', e[0]);
                zCount++;
            }
        }
        console.log(zCount, pCount);
        if (zCount > pCount) {
            alert(tr('Warning: The total number of zeros is greater than the number of poles!'));
        }
    }

    getValues() {
        return {re: this.options.re, im: this.options.im, enabled: this.options.enabled};
    }
}

class EquationEditor extends Emitter {
    // note that for the callback to work, id must also be the global variable name of the object
    constructor(id, template, elements) {
        super();
        this.id = id;
        this.template = template;
        this.elements = elements;
        this.math = undefined;
        this.values = {};
        for(let i in this.elements) {
            const name = this.elements[i][0];
            const cls = this.elements[i][1];
            const opts = this.elements[i][2];
            const callbackBase = this.id + '.callback('+i;
            this.elements[i] = [name, new cls(this, callbackBase, this.id+'_'+name, opts), callbackBase];
        }

        MathJax.Hub.Queue(this.setup.bind(this));
        this.updateValues();
    }

    callback(id, args) {
        console.log('callback', id);
        if (this.elements[id][1].callback(args)) {
            this.updateValues();
            this.render();
        }
    }

    setup() {
        this.math = MathJax.Hub.getAllJax(this.id)[0];
        this.render();
    }

    preRenderHook(template) {
        return template;
    }

    render() {
        let text = this.preRenderHook(this.template);
        for(let i in this.elements) {
            const name = this.elements[i][0];
            const obj = this.elements[i][1];
            text = text.replace('<'+name+'/>', obj.render());
        }
        MathJax.Hub.Queue(["Text", this.math, text]);
        MathJax.Hub.Queue(this.postRender.bind(this));
    }

    postRender() {
        console.log('post render');
        for (let i in this.elements) {
            const obj = this.elements[i][1];
            const callbackBase = this.elements[i][2];
            const $elem = $('[href="javascript:' + callbackBase + ')"]');
            obj.postRender($elem);

        }
    }

    updateValues() {
        for (let i in this.elements) {
            const name = this.elements[i][0];
            const obj = this.elements[i][1];
            const vals = obj.getValues();
            for (let valName in vals) {
                this.values[name+'_'+valName] = vals[valName];
            }
        }
        this.emit('change');
        console.log(this.values)
    }

    applyPreset(preset) {
        for(let i in this.elements) {
            const name = this.elements[i][0];
            const obj = this.elements[i][1];

            if (preset[name] !== undefined) {
                obj.options = preset[name];
            }
        }
        this.updateValues();
        this.render();
    }
}

class EqPresetDropdown extends DropdownMenu {
    constructor(container, eq, presets) {
        const values = presets.map(p => p.name);
        super(container, values);
        this.eq = eq;
        this.presets = presets;
        this.on('change', this._apply.bind(this));
    }

    _apply(index) {
        this.eq.applyPreset(this.presets[index]);
    }
}
