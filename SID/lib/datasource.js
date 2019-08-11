"use strict";

class WebSocketDataSource extends Emitter {
    constructor(url, options) {
        super();
        this.url = url;

        const defaults = {
            sendParamsOnReceivedMsg: true,
            sendParamsInteval: undefined, // TO IMPLEMENT, interval in ms
        };
        options = {...defaults, ...options};

        this.sendParamsOnReceivedMsg = options.sendParamsOnReceivedMsg;

        this.open = false;
        this.sendQueue = [];
        this.parameters = {};

        this.openSocket();
    }

    openSocket() {
        this.socket = new WebSocket(this.url);
        if (!this.socket) {
            alert('Opening WebSocket failed!');
        }

        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onerror = this.onError.bind(this);
        this.socket.onclose = this.onClose.bind(this);
    }

    addSink(sink) {
        console.assert(sink.onSample !== undefined, 'sink.onSample() is undefined');
        this.on('sample', sink.onSample.bind(sink));
    }

    onOpen(open) {
        console.log("WebSocket has been opened", open, this);
        this.open = true;
        for (let message of this.sendQueue) {
            this.socket.send(message);
        }
        this.sendQueue = [];
    };

    onMessage(message) {
        // console.log(message.data);
        this.lastSample = this.processSample(JSON.parse(message.data));

        this.emit('sample', this.lastSample);

        if (this.sendParamsOnReceivedMsg && Object.keys(this.parameters).length) {
            let params = {};
            for (let parameterName in this.parameters) {
                const source = this.parameters[parameterName];
                let val = undefined;
                if (source instanceof Function) {
                    val = source();
                } else if (source instanceof Array) {
                    console.assert(source.length === 2);
                    val = source[0][source[1]];
                } else {
                    val = source.value;
                }
                params[parameterName] = val;
            }
            this.lastParams = params;
            // console.log(JSON.stringify(params));
            this.socket.send(JSON.stringify(params));
        }
    }

    onError(error) {
        console.log("WebSocket error:", error, this);
    }

    onClose(close) {
        console.log("WebSocket has been closed", close, this);
        this.open = false;

        this.openSocket();
    }

    // parameterSource can be one of the following:
    // callable, e.g. dataSource.addParameter(() => {myObj.getParam()}, 'myparam')
    // object that has a value property (like many Widgets), e.g. dataSource.addParameter(checkbox, 'enabled')
    // [object, propertyName], e.g. dataSource.addParameter([myObj, 'param'], 'myparam')
    addParameter(parameterSource, parameterName) {
        this.parameters[parameterName] = parameterSource;
    }

    processSample(sample) {
        return sample;
    }

    sendMessage(message) {
        const msg = JSON.stringify(message);
        if (!this.open) {
            this.sendQueue.push(msg);
        } else {
            this.socket.send(msg);
        }
    }
}


class JsonDataSource extends Emitter {
    constructor(url, options) {
        super();

        const defaults = {
            fps: 30,
            speed: 1,
            reverse: false,
            loop: false,
        };
        options = {...defaults, ...options};

        this._data = undefined;
        this._paused = true;
        this._timer = undefined;
        this._currentTime = 0;
        this._currentIndex = -1;
        this._lastTick = 0;
        this._sampleCount = 0;
        this.lastSample = undefined;

        this.fps = options.fps;
        this.speed = options.speed;
        this.reverse = options.reverse;
        this.loop = options.loop;

        this.url = url;
    }

    get fps() {
        return this._fps;
    }

    set fps(fps) {
        if (!this._paused) {
            this.pause();
            this.play();
        }
        this._fps = fps;
    }

    get url() {
        return this._url;
    }

    set url(url) {
        this._url = url;
        if (url) {
            $.getJSON(url, this._dataLoaded.bind(this));
        } else {
            this.data = undefined;
        }
    }

    get data() {
        return this._data;
    }

    set data(data) {
        this._data = data;
        this._sampleCount = this.data ? this.data.t.length : 0;  // use this.data to allow overriding of getter!
        this._currentIndex = -1;
        this._currentTime = 0;
        this.emit('ready');
    }

    isLoaded() {
        return Boolean(this.data);
    }

    get sampleCount() {
        return this._sampleCount;
    }

    get currentIndex() {
        return this._currentIndex;
    }

    set currentIndex(i) {
        const index = Math.max(0, Math.min(i, this.sampleCount));
        if (index === this._currentIndex) {
            return;
        }
        this._currentIndex = index;
        this.sendCurrentSample();
    }

    get currentTime() {
        return this._currentTime;
    }

    set currentTime(t) {
        const dataT = this.data.t;
        const N = this.sampleCount;
        let i = this.currentIndex;

        while (i+1 < N && dataT[i+1] < t + 1e-6) {
            i++;
        }
        while (i > 0 && dataT[i] > t + 1e-6) {
            i--;
        }

        this.currentIndex = i;
        this._currentTime = t;
    }

    static fileExists(url) {
        if(url){
            const req = new XMLHttpRequest();
            req.open('HEAD', url, false);
            req.send();
            return req.status === 200;
        } else {
            return false;
        }
    }

    play() {
        clearInterval(this._timer);
        this._timer = setInterval(this._tick.bind(this), 1000.0/this.fps);
        this._lastTick = Date.now();
        this._paused = false;
        this.emit('play');
    }

    pause() {
        clearInterval(this._timer);
        this._paused = true;
        this.emit('pause');
    }

    get paused() {
        return this._paused;
    }

    stop() {
        clearInterval(this._timer);
        this._paused = true;
        this._currentIndex = -1;
        this._currentTime = 0;
        this.emit('stop');
    }


    addSink(sink) {
        console.assert(sink.onSample !== undefined, 'sink.onSample() is undefined');
        this.on('sample', sink.onSample.bind(sink));
    }

    _dataLoaded(data) {
        console.log('json loaded:', data, this);
        this.data = data;
    }

    _tick() {
        const deltaT = (this.reverse ? -1 : 1) * this.speed * (Date.now() - this._lastTick)/1000.0;
        // console.log('deltaT', deltaT);
        this._lastTick = Date.now();

        this.currentTime = this.currentTime + deltaT;

        if (this.currentIndex >= this.sampleCount-1) {
            console.log('reached end');
            this.stop();
            if (this.loop) {
                this.play();
            }
        }
    }

    sendCurrentSample() {
        const i = this.currentIndex;
        const data = this.data;

        let sample = {
            ind: i,
            length: this.sampleCount,
        };

        for (let key in data) {
            if (data[key].length === this.sampleCount) {
                sample[key] = data[key][i];
            } else {
                sample[key] = data[key];
            }
        }

        this.lastSample = sample;
        this._currentTime = sample.t;
        this.emit('sample', sample);
    }
}
