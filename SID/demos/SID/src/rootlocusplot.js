"use strict";

class RootLocusPlot extends Widget {
    constructor(container, eqEditor, options) {
        const defaults = {
            id: '',
            width: 400,
            height: 400,
        };
        options = {...defaults, ...options};
        super(container, options);

        this.eqEditor = eqEditor;
        this.content = $('<div style="margin: 0 auto; width: '+options.width+'px"></div>');
        this.canvas = $('<canvas width="'+options.width+'" height="'+options.height+'"></canvas>');
        this.content.append(this.canvas);
        insertDOM(container, this.content);

        this.chart = new Chart(this.canvas[0], {
            type: 'scatter',
            data: {
                datasets: [{
                    label: "Lines",
                    pointRadius: 0,
                    pointStyle: "crossRot",
                    fill: false,
                    borderColor: "#d62728",
                    data: [],
                }, {
                    label: "KPoles",
                    pointStyle: "crossRot",
                    pointRadius: 15,
                    pointBorderWidth: 3,
                    pointHoverRadius: 17,
                    pointHoverBorderWidth: 3,
                    borderColor: "#2ca02c",
                    showLine: false,
                    fill: false,
                    data: [],
                }, {
                    label: "KZeros",
                    pointStyle: "circle",
                    pointRadius: 15,
                    pointBorderWidth: 3,
                    pointHoverRadius: 17,
                    pointHoverBorderWidth: 3,
                    borderColor: "#2ca02c",
                    showLine: false,
                    fill: false,
                    backgroundColor: "transparent",
                    data: [],
                }, {
                    label: "GPoles",
                    pointStyle: "crossRot",
                    pointRadius: 15,
                    pointBorderWidth: 3,
                    pointHoverRadius: 17,
                    pointHoverBorderWidth: 3,
                    borderColor: "#1f77b4",
                    showLine: false,
                    fill: false,
                    data: [],
                }, {
                    label: "GZeros",
                    pointStyle: "circle",
                    pointRadius: 15,
                    pointBorderWidth: 3,
                    pointHoverRadius: 17,
                    pointHoverBorderWidth: 3,
                    borderColor: "#1f77b4",
                    showLine: false,
                    fill: false,
                    backgroundColor: "transparent",
                    data: [],
                }, {
                    label: "Arrowheads",
                    pointRadius: 0,
                    fill: false,
                    borderColor: "#d62728",
                    lineTension: 0,
                    data: [],
                }, {
                    label: "ClPoles",
                    pointStyle: "circle",
                    pointRadius: 7,
                    pointBorderWidth: 2,
                    pointHoverRadius: 12,
                    pointHoverBorderWidth: 2,
                    borderColor: "#d62728",
                    backgroundColor: "#d62728",
                    showLine: false,
                    fill: false,
                    data: [],
                }]
            },
            options: {
                responsive: true,
                legend: {display: false},
                scales: {
                    xAxes: [{
                        ticks:{min: -1, max: 10},
                        scaleLabel: {display: true, labelString: "Re"}
                    }],
                    yAxes: [{
                        ticks: {min: -1, max: 10},
                        scaleLabel: {display: true, labelString: "Im"}
                    }],
                }
            }
        });

        this.lastUpdate = Date.now();
    }

    onSample(sample) {
        if (Date.now() - this.lastUpdate < 1000)
            return;

        const xPos = [];
        const yPos = [];

        const points = this.chart.data.datasets[0].data;
        points.length = 0;
        const arrowArgs = [];
        for (let i in sample.en_wok) {
            if (sample.en_wok[i] !== 1.0)
                continue;
            const vals = sample['wok'+(parseInt(i)+1)];
            const len = Math.floor(vals.length / 2);
            let count = 0;

            for (let j = 0; j < len; j++) {
                if (vals[j] >= 998)
                    break;
                points.push({x: vals[j], y: vals[len+j]});
                xPos.push(vals[j]);
                yPos.push(vals[len+j]);
                count++;
            }
            if (count >= 2) {
                const tip = points[points.length-1];
                let start = points[points.length-2];
                let k = 2;
                while (k <= points.length && (start.x-tip.x)*(start.x-tip.x) + (start.y-tip.y)*(start.y-tip.y) < 0.001) {
                    start = points[points.length-k];
                    k++;
                }
                arrowArgs.push([start.x, start.y, tip.x, tip.y]);
            }
            points.push({x: NaN, y: NaN});
        }

        const kpoles = this.chart.data.datasets[1].data;
        kpoles.length = 0;
        for(let elem of ['Kp1', 'Kp2', 'Kp3']) {
            if (!this.eqEditor.values[elem + '_enabled'])
                continue;
            const x = this.eqEditor.values[elem + '_re'];
            const y = this.eqEditor.values[elem + '_im'];
            kpoles.push({x: x, y: y});
            xPos.push(x);
            yPos.push(y);
        }

        const kzeros = this.chart.data.datasets[2].data;
        kzeros.length = 0;
        for(let elem of ['Kz1', 'Kz2', 'Kz3']) {
            if (!this.eqEditor.values[elem + '_enabled'])
                continue;
            const x = this.eqEditor.values[elem + '_re'];
            const y = this.eqEditor.values[elem + '_im'];
            kzeros.push({x: x, y: y});
            xPos.push(x);
            yPos.push(y);
        }

        const gpoles = this.chart.data.datasets[3].data;
        gpoles.length = 0;
        for(let elem of ['Gp1', 'Gp2', 'Gp3']) {
            if (!this.eqEditor.values[elem + '_enabled'])
                continue;
            const x = this.eqEditor.values[elem + '_re'];
            const y = this.eqEditor.values[elem + '_im'];
            gpoles.push({x: x, y: y});
            xPos.push(x);
            yPos.push(y);
        }

        const gzeros = this.chart.data.datasets[4].data;
        gzeros.length = 0;
        for(let elem of ['Gz1', 'Gz2', 'Gz3']) {
            if (!this.eqEditor.values[elem + '_enabled'])
                continue;
            const x = this.eqEditor.values[elem + '_re'];
            const y = this.eqEditor.values[elem + '_im'];
            gzeros.push({x: x, y: y});
            xPos.push(x);
            yPos.push(y);
        }

        const clpoles = this.chart.data.datasets[6].data;
        clpoles.length = 0;
        const len2 = Math.floor(sample.clpoles.length / 2);
        for (let i = 0; i < len2; i++) {
            if (sample.clpoles[i] >= 998)
                break;
            const x = sample.clpoles[i];
            const y = sample.clpoles[len2+i];
            clpoles.push({x: x, y: y});
            xPos.push(x);
            yPos.push(y);
        }

        let xMin = Math.min(...xPos)-0.2;
        let xMax = Math.max(...xPos)+0.2;
        let yMin = Math.min(...yPos)-0.2;
        let yMax = Math.max(...yPos)+0.2;

        this.chart.options.scales.xAxes[0].ticks.min = xMin;
        this.chart.options.scales.xAxes[0].ticks.max = xMax;
        this.chart.options.scales.yAxes[0].ticks.min = yMin;
        this.chart.options.scales.yAxes[0].ticks.max = yMax;

        const arrows = this.chart.data.datasets[5].data;
        arrows.length = 0;
        for (let args of arrowArgs) {
            arrows.push(...this.createArrowhead(...args, xMax-xMin, yMax-yMin));
        }

        this.chart.update();

        this.lastUpdate = Date.now();
    }

    createArrowhead(xStart, yStart, xTip, yTip, xRange, yRange) {
        xStart = xStart / xRange;
        yStart = yStart / yRange;
        xTip = xTip / xRange;
        yTip = yTip / yRange;

        let xDir = xStart - xTip;
        let yDir = yStart - yTip;

        const a = 20*Math.PI/180; // angle
        const len = 0.08; // length in normalized coordinates

        const norm = Math.sqrt(xDir*xDir + yDir*yDir);
        xDir = xDir / norm * len;
        yDir = yDir / norm * len;

        const x1 = xDir*Math.cos(a) - yDir*Math.sin(a);
        const y1 = xDir*Math.sin(a) + yDir*Math.cos(a);

        const x2 = xDir*Math.cos(-a) - yDir*Math.sin(-a);
        const y2 = xDir*Math.sin(-a) + yDir*Math.cos(-a);

        // console.log({x: (xTip+x1)*xRange, y: (yTip+y1)*yRange}, {x: xTip*xRange, y: yTip*yRange}, {x: (xTip+x2)*xRange, y: (yTip+y2)*yRange}, {x: NaN, y: NaN});
        return [{x: (xTip+x1)*xRange, y: (yTip+y1)*yRange}, {x: xTip*xRange, y: yTip*yRange}, {x: (xTip+x2)*xRange, y: (yTip+y2)*yRange}, {x: NaN, y: NaN}];
    }
}

