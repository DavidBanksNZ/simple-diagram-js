(function() {

    'use strict';

    var Utils = {

        // Function for converting arguments object to a standard JavaScript
        // array object.
        argsToArray: function argsToArray(args) {
            return Array.prototype.slice.call(args);
        },

        // Safe version of hasOwnProperty
        hasOwn: function hasOwn(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        },

        // Function for creating a shallow clone of an object.
        cloneShallow: function cloneShallow(obj) {

            var o = {};

            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop))
                    o[prop] = obj[prop];
            }

            return o;

        },

        // Function for merging two objects. Makes a shallow copy of baseObject.
        // Currently, shallow copies are fine because our base objects all have
        // primitive type values stored in them.
        mergeObjects: function mergeObjects(baseObj, obj) {

            var o = Utils.cloneShallow(baseObj);

            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop))
                    o[prop] = obj[prop];
            }

            return o;

        }

    };



    // Regexes we will need
    var regex = {
        subscript: /_{([^}]*)}/g,
        superscript: /\^{([^}]*)}/g
    };



    // Default settings for each diagram. These can be over-ridden
    // in the SimpleDiagram constructor function.

    var defaultSettings = {
        addGrid: true,
        cellSize: 25,
        numRows: 20,
        numColumns: 20,
        margin: 2,
        interactive: true,
        activeNodeFill: 'rgb(255,212,212)'
    };



    // Function for adding a background grid to the diagram.

    var _addGrid = function _addGrid(svg, settings, style) {

        var i, nv = settings.numColumns + 1,
            nh = settings.numRows + 1,
            width = settings.numColumns * settings.cellSize,
            height = settings.numRows * settings.cellSize;

        var grid = svg.append('g')
            .attr('class', 'grid');

        if (style)
            grid.style(style);

        // Draw vertical grid lines
        for (i = 0; i < nv; i++) {

            grid.append('line')
                .attr({
                    x1: i * settings.cellSize,
                    x2: i * settings.cellSize,
                    y1: 0,
                    y2: height
                });

        }

        // Draw horizontal grid lines
        for (i = 0; i < nh; i++) {

            grid.append('line')
                .attr({
                    x1: 0,
                    x2: width,
                    y1: i * settings.cellSize,
                    y2: i * settings.cellSize
                });

        }

    };



    // Function for adding tooltip events to the diagram.

    var _addTooltipEvents = function _addTooltipEvents(instance) {

        instance.canvas.on('mouseover', function() {

            // Get parent element of event target
            var parent = d3.event.target.parentNode;

            // We are looking for cases when the parent element is
            // g.interactive-node (g elements do not fire events directly;
            // their children elements do instead).

            var S = instance.settings,
                width = S.cellSize * S.numColumns,
                height = S.cellSize * S.numRows,
                margin = S.margin;

            var isNode = parent.className.baseVal === 'node';

            // tspan elements may trigger the event. If so, we need to check for
            // this case and go up one more level to check if the tspan is a
            // descendant of a g.interactive-node element.
            if (!isNode && d3.event.target.tagName === 'tspan'
                && parent.parentNode.className.baseVal === 'node') {
                    isNode = true;
                    parent = parent.parentNode;
            }

            if (isNode) {

                var node = parent,
                    name = node.getAttribute('data-name'),
                    data = _getNodeData(instance, name),
                    position = _getCoordinates(instance, data.row, data.column);

                // Update tooltip content
                instance.tooltip.html(data.tooltipHTML)
                    .style('display', 'block');

                var tt_dim = instance.tooltip.node().getBoundingClientRect(),
                    tt_width = tt_dim.width,
                    tt_height = tt_dim.height,
                    x = position.x + margin,
                    y = position.y + margin;

                // If tooltip overflows right side of diagram, adjust x
                if (x + tt_width > width)
                    x = width + margin - tt_width;

                // Position bottom of tooltip 10 pixels above the cell containing
                // the interactive node.
                y -= (10 + tt_height);

                // If small overflow at top of diagram, decrease the gap between
                // the cell and the tooltip to fit the tooltip in.
                if (y < margin && y >= margin - 5)
                    y = margin;

                // If overflow at top of diagram is not small, position the tooltip
                // either directly to the left or right of the cell containing the
                // interactive node.
                if (y < margin - 5) {

                    y = position.y + margin + S.cellSize - tt_height;

                    if (x + S.cellSize + 10 + tt_width < width) {
                        x = position.x + margin + S.cellSize + 10;
                    } else {
                        x = position.x + margin - tt_width - 10;
                    }

                }

                // Update position of tooltip
                instance.tooltip.style({
                    left: x + 'px',
                    top: y + 'px'
                });

                // Fade the tooltip in
                instance.tooltip.transition()
                    .duration(200)
                    .style('opacity', instance.__tooltipAlpha);

                // Add active class to the currently active node
                d3.select(node).classed('active', true);

            }

        });  // end mouseover handler

        // Set up mouseout event handler. This will hide the tooltip when the
        // mouse leaves an interactive node.

        instance.canvas.on('mouseout', function() {

            // Fade the tooltip out
            instance.tooltip.transition()
                .delay(200)
                .duration(200)
                .style('opacity', 0)
                .each('end', function() {
                    instance.tooltip.style('display', 'none');
                });

            // Remove active class from the currently active node,
            // and reset fill color to the original value
            instance.canvas.select('.node.active')
                .classed('active', false);

        });  // end mouseout handler

    };



    // Function for doing the initial setup for a SimpleDiagram instance.

    var _setup = function _setup(instance) {

        var S = instance.settings;

        // Append a base div element and set its position to relative.
        // Then set the tooltip position to absolute. This makes it
        // easier to position the tooltip.

        var baseDiv = instance.container.append('div'),
            svgElem = baseDiv.append('svg');

        svgElem.attr('class', 'simple-diagram');
        baseDiv.style('position', 'relative');

        var width = S.cellSize * S.numColumns,
            height = S.cellSize * S.numRows,
            margin = 2;

        var defs = svgElem.append('defs');

        svgElem.attr({
            height: height + 2 * S.margin,
            width: width + 2 * S.margin
        });

        var svg = svgElem.append('g')
            .attr('transform', 'translate(' + S.margin + ',' + S.margin + ')');

        // Add line marker definition
        defs.append('marker')
            .attr({
                id: 'arrow',
                refX: 8,
                refY: 3,
                markerUnit: 'userSpaceOnUse',
                markerWidth: 8,
                markerHeight: 6,
                orient: 'auto'
            })
            .append('path')
                .attr('d', 'M 0 0 8 3 0 6 Z');

        // Draw background grid if specified
        if (S.addGrid)
            _addGrid(svg, S);

        // Element to draw all diagram content in
        var canvas = svg.append('g')
            .attr('class', 'canvas');

        // Make the canvas and a public property on the instance object
        instance.canvas = canvas;

        // We will store node data here
        instance.__nodeData = {};

        if (S.interactive) {

            // Create HTML tooltip
            instance.tooltip = baseDiv.append('div')
                .attr('class', 'simple-diagram-tooltip')
                .style({
                    position: 'absolute',
                    display: 'none'
                });

            instance.__tooltipAlpha = instance.tooltip.style('opacity');
            instance.tooltip.style('opacity', 0);

            // Add tooltip events
            _addTooltipEvents(instance);

        }

    };



    // Function for determining the coordinates of a particular cell
    // given its row number and column numbers.

    var _getCoordinates = function _getCoordinates(instance, row, column) {

        return {
            x: (column - 1) * instance.settings.cellSize,
            y: (row - 1) * instance.settings.cellSize
        };

    };



    // Function for recording data about a given node.

    var _recordNodeData = function _recordNodeData(instance, opts) {

        var data = Utils.cloneShallow(opts),
            ttHtml;

        if (instance.settings.interactive) {

            ttHtml = opts.hoverText;

            // replace superscripts and subscripts with their HTML tags
            ttHtml = ttHtml.replace(/\^{([^}]*)}/, '<sup>$1</sup>')
                .replace(/\_{([^}]*)}/, '<sub>$1</sub>');

            data.tooltipHTML = ttHtml;

        }

        instance.__nodeData[opts.name] = data;

    };



    // Function for retrieving data stored for a given node.

    var _getNodeData = function _getNodeData(instance, name) {
        return instance.__nodeData[name];
    };


    // Function for adding a label to a particular cell.

    var _addLabel = function _addLabel(instance, parentElem, opts) {

        if (!parentElem)
            parentElem = instance.canvas;

        var coords = _getCoordinates(instance, opts.row, opts.column),
            text = opts.label,
            hasSubscript = text.search(regex.subscript) > -1,
            hasSuperscript = text.search(regex.superscript) > -1;

        if (hasSubscript)
            text = text.replace(regex.subscript, '%%<sub>$1</sub>%%');

        if (hasSuperscript)
            text = text.replace(regex.superscript, '%%<sup>$1</sup>%%');

        var textParts = text.split('%%');

        var label = parentElem.append('text').attr({
            x: coords.x + instance.settings.cellSize/2,
            y: coords.y + instance.settings.cellSize/2,
            'text-anchor': opts.align || 'middle',
            class: 'label'
        });

        if (opts.class)
            label.classed(opts.class, true);

        if (opts.style)
            label.style(opts.style);

        var lastDy,
            supDy = -0.6,
            subDy = 0.3;

        if (hasSubscript) {
            lastDy = -0.2;
        }
        else if (hasSuperscript) {
            lastDy = -0.4;
        }
        else {
            lastDy = -0.3;
        }

        textParts.forEach(function(t) {

            if (!t) return;

            var string,
                tspan = label.append('tspan');

            if (t.search('<sup>') > -1) {

                // Deal with superscripts

                string = t.replace(/<sup>(.*?)<\/sup>/, '$1');

                tspan.attr('dy', (supDy - lastDy) + 'em')
                    .attr('class', 'superscript');

                lastDy = supDy;

            } else if (t.search('<sub>') > -1) {

                // Deal with subscripts

                string = t.replace(/<sub>(.*?)<\/sub>/, '$1');

                tspan.attr('dy', (subDy - lastDy) + 'em')
                    .attr('class', 'subscript');

                lastDy = subDy;

            } else {

                string = t;
                tspan.attr('dy', (-lastDy) + 'em');
                lastDy = 0;

            }

            tspan.text(string);

        });

    };


    var _getLinkEndPoints = function _getLinkEndPoints(instance, fromData, toData) {

        var reverse = fromData.column > toData.column,
            fromCoords = _getCoordinates(instance, fromData.row, fromData.column),
            toCoords = _getCoordinates(instance, toData.row, toData.column),
            cellsize = instance.settings.cellSize;

        var adjust = cellsize/2,
            x1 = fromCoords.x + adjust,
            y1 = fromCoords.y + adjust,
            x2 = toCoords.x + adjust,
            y2 = toCoords.y + adjust,
            gradient = (x1 === x2 ? NaN : (y2 - y1) / (x2 - x1)),
            angle;

        if (reverse)
            adjust *= -1;

        if (gradient >= 2 || (isNaN(gradient) && y2 > y1)) {
            y1 += adjust;
            y2 -= adjust;
        }
        else if (gradient >= 1) {
            x1 += adjust;
            y1 += adjust;
            x2 -= adjust;
            y2 -= adjust;
        }
        else if (gradient > -1) {
            x1 += adjust;
            x2 -= adjust;
        }
        else if (gradient > -2) {
            x1 += adjust;
            y1 -= adjust;
            x2 -= adjust;
            y2 += adjust;
        }
        else {
            y1 -= adjust;
            y2 += adjust;
        }

        if (isNaN(gradient)) {
            angle = Math.PI/2 + (y2 < y1 ? -1 : 1) * Math.PI/2;
        } else {
            angle = Math.atan(gradient) + (reverse ? -1 : 1) * Math.PI/2;
        }

        // For circle nodes, we need to use some trigonometry to make sure the
        // link endpoint touches the circle boundary.

        // For custom links not connected to a node (shape = null) we just reset
        // the coordinates to the midpoints of the cells supplied.

        if (fromData.shape === 'circle') {
            x1 = fromCoords.x + (cellsize/2) * (1 + Math.cos(angle - Math.PI/2));
            y1 = fromCoords.y + (cellsize/2) * (1 + Math.sin(angle - Math.PI/2));
        }
        else if (fromData.shape === null) {
            x1 = fromCoords.x + cellsize/2;
            y1 = fromCoords.y + cellsize/2;
        }

        if (toData.shape === 'circle') {
            x2 = toCoords.x + (cellsize/2) * (1 - Math.cos(Math.PI/2 - angle));
            y2 = toCoords.y + (cellsize/2) * (1 + Math.sin(Math.PI/2 - angle));
        }
        else if (toData.shape === null) {
            x2 = toCoords.x + cellsize/2;
            y2 = toCoords.y + cellsize/2;
        }

        return {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
        };

    };



    // Function for adding a link between two cells.

    var _addLine = function _addLine(instance, parentElem, opts) {

        if (!parentElem)
            parentElem = instance.canvas;

        if (typeof opts.addArrow === 'undefined')
            opts.addArrow = true;

        var fromData, toData;

        if (typeof opts.from === 'string') {

            // Coming from a node
            fromData =  _getNodeData(instance, opts.from);

        } else if (opts.from instanceof Array) {

            // Coming from a fixed point
            fromData = {
                row: opts.from[0],
                column: opts.from[1],
                shape: null
            };

        }

        if (typeof opts.to === 'string') {

            // Connect to a node
            toData =  _getNodeData(instance, opts.to);

        } else if (opts.to instanceof Array) {

            // Connect to a fixed point
            toData = {
                row: opts.to[0],
                column: opts.to[1],
                shape: null
            };

        }

        var linkEndPoints = _getLinkEndPoints(instance, fromData, toData);

        var line = parentElem.append('line')
            .attr(linkEndPoints)
            .attr('class', 'line');

        if (opts.addArrow)
            line.attr('marker-end', 'url(#arrow)');

        if (opts.class)
            line.classed(opts.class, true);

        if (opts.style)
            line.style(opts.style);

    };


    // Function for drawing a rectangular box shape of any dimension into
    // the diagram. Can be useful for visually grouping nodes together.

    var _addBox = function _addBox(instance, parentElem, opts) {

        if (!parentElem)
            parentElem = instance.canvas;

        var coords = _getCoordinates(instance, opts.row, opts.column),
            w = opts.width * instance.settings.cellSize,
            h = opts.height * instance.settings.cellSize;

        var box = parentElem.append('rect').attr({
            class: 'box',
            x: coords.x,
            y: coords.y,
            width: w,
            height: h
        });

        if (opts.class)
            box.classed(opts.class, true);

        if (opts.style)
            box.style(opts.style);

    };



    // Function for adding a node shape element to the diagram.

    var _addNodeShape = function _addCircleNode(instance, parentElem, opts) {

        if (!parentElem)
            parentElem = instance.canvas;

        var coords = _getCoordinates(instance, opts.row, opts.column),
            size = instance.settings.cellSize,
            node;

        if (opts.shape === 'circle') {

            node = parentElem.append('circle').attr({
                cx: coords.x + size/2,
                cy: coords.y + size/2,
                r: size/2
            });

        } else {

            node = parentElem.append('rect').attr({
                x: coords.x,
                y: coords.y,
                width: size,
                height: size
            });

        }

        node.attr('class', 'node-shape ' + opts.shape);

        if (opts.style)
            node.style(opts.style);

    };



    // Function for adding a node to the diagram (node shape + label)

    var _addNode = function _addNode(instance, parentElem, opts) {

        if (!parentElem)
            parentElem = instance.canvas;

        var g = parentElem.append('g')
            .attr('class', 'node')
            .attr('data-name', opts.name);

        // Record node data
        _recordNodeData(instance, opts);

        // Add node shape
        opts.style = opts.shapeStyle;
        _addNodeShape(instance, g, opts);

        // Add node label
        opts.style = opts.labelStyle;
        _addLabel(instance, g, opts);

        if (opts.class)
            g.classed(opts.class, true);

    };



    // SimpleDiagram constructor function

    var SimpleDiagram = function SimpleDiagram(containerSelector, settings) {

        this.container = d3.select(containerSelector);
        this.settings = Utils.mergeObjects(defaultSettings, settings);

        _setup(this);
        return this;

    };


    // addLabel method for adding a label to the diagram

    SimpleDiagram.prototype.addLabel = function addLabel(opts) {
        _addLabel(this, null, opts);
        return this;
    };


    // addBox method for adding a rectangular shape to the diagram

    SimpleDiagram.prototype.addBox = function addBox(opts) {
        _addBox(this, null, opts);
        return this;
    };


    // addNode method for adding a node to the diagram

    SimpleDiagram.prototype.addNode = function addNode(opts) {
        _addNode(this, null, opts);
        return this;
    };


    // addLine method for adding a lines between nodes and/or positions

    SimpleDiagram.prototype.addLine = function addLink(opts) {
        _addLine(this, null, opts);
        return this;
    };


    // getCoordinatesAtCell method for getting the coordinates of a cell in pixels.
    // May be useful for adding custom elements to the diagram.

    SimpleDiagram.prototype.getCoordinatesAtCell = function getCoordinatesAtCell(row, column) {
        return _getCoordinates(this, row, column);
    };


    // Expose SimpleDiagram constructor function on global window object
    window.SimpleDiagram = SimpleDiagram;

})();
