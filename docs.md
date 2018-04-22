# Documentation

Before getting started, make sure you include the full D3 library, or the required standalone packages:

```html
<script src="https://d3js.org/d3-selection.v1.min.js"></script>
<script src="https://d3js.org/d3-color.v1.min.js"></script>
<script src="https://d3js.org/d3-dispatch.v1.min.js"></script>
<script src="https://d3js.org/d3-ease.v1.min.js"></script>
<script src="https://d3js.org/d3-interpolate.v1.min.js"></script>
<script src="https://d3js.org/d3-timer.v1.min.js"></script>
<script src="https://d3js.org/d3-transition.v1.min.js"></script>
```

Note that if you aren't using any tooltips in your diagram, you can get away with just the following standalone packages:

```html
<script src="https://d3js.org/d3-dispatch.v1.min.js"></script>
<script src="https://d3js.org/d3-selection.v1.min.js"></script>
```

Alternatively, the packages can be installed via npm and references loaded from `node_modules`.


Include *simple-diagram.js* (or the minified version) into your page. Also make sure you load *simple-diagram.css* in the
head element, otherwise your diagrams aren't going to look very good!

A constructor function called `SimpleDiagram` will be exposed on the global window object.

**Note**: Subscripts and superscripts are supported in all labels and tooltips. To create a subscript, use an underscore
and place the text you want made into subscript text in curly braces immediately after, e.g. `x_{1}`. Similarly,
for superscripts use a caret, e.g. `x^{1}`.

**Note**: All row and column numbers in this library are 1-based, not 0-based.
Position a node at row 1, column 1 to insert it into the top-left cell.



<br><br>
<a href="#SimpleDiagram" name="SimpleDiagram">#</a> **SimpleDiagram**(*containerSelector*[, *settings*])

The constructor must be called with the new operator. You should provide a CSS
selector or DOM element which represents the container element to draw the diagram in, and additionally
a `settings` object. Your custom settings will be merged onto the default settings.
The default `settings` are as follows:

```javascript
var defaultSettings = {

    // Should a background grid be added?
    addGrid: true,

    // Width and height (pixels) of each cell
    cellSize: 25,

    // Number of rows in the diagram
    numRows: 10,

    // Number of columns in the diagram
    numColumns: 10,

    // Margin around the diagram on all sides (pixels)
    margin: 1,

    // Should nodes be interactive (tooltips on hover)?
    interactive: true

};
```
Here is an example of how to create a diagram in the `#diagram` element:

```javascript
var diagram = new SimpleDiagram('#diagram', {
    numRows: 9,
    numColumns: 9,
    cellSize: 35
});
```

**Note**: Total width of the SVG element will be `numColumns * cellSize + 2 * margin` and
total height will be `numRows * cellSize + 2 * margin`.

The returned `diagram` object has several methods for adding content to the diagram.
These are described below.



<br><br>
<a href="#addNode" name="addNode">#</a> diagram.**addNode**(*opts*)

Add a node to the diagram. At a minimum you should provide the following properties
in the `opts` object:

* `name` - unique name identifier
* `row` - which row the node should sit in
* `column` - which column the node should sit in
* `label` - the label displayed in the node (should be very short). Subscripts/superscripts supported.

Returns the diagram instance (chainable method).

Other optional properties are:

* `class` - a custom class name to apply to the node, e.g. for CSS styling purposes
* `shape` - shape of the node, either `circle` (default) or `square`
* `hoverText` - the text to show in the tooltip when this node is moused over. Subscripts/superscripts supported.
* `shapeStyle` - inline styles object to apply to the node shape
* `labelStyle` - inline styles object to apply to the node label



<br><br>
<a href="#addLine" name="addLine">#</a> diagram.**addLine**(*opts*)

Add a line to the diagram. At minimum you should provide the following properties
in the `opts` object:

* `from` - node name or `[row,column]` array where the line should start
* `to` - node name or `[row,column]` array where the line should end

Other optional properties are:

* `class` - a custom class name to apply to the line, e.g. for CSS styling purposes
* `addArrow` - should the line have an arrowhead at the `to` end? Defaults to `true`
* `style` - inline styles object to apply to the line

Returns the diagram instance (chainable method).



<br><br>
<a href="#addLabel" name="addLabel">#</a> diagram.**addLabel**(*opts*)

Add a text label to the diagram. At minimum you should provide the following properties
in the `opts` object:

* `row` - row position of the label
* `column` - column position of the label
* `label` - the text displayed by the label. Subscripts/superscripts supported.

Other optional properties are:

* `align` - how to horizontally align the text. `start`, `middle` (default) or `end`
* `class` - a custom class name to apply to the label, e.g. for CSS styling purposes
* `style` - inline styles object to apply to the label

Returns the diagram instance (chainable method).



<br><br>
<a href="#addBox" name="addBox">#</a> diagram.**addBox**(*opts*)

Add a box to the diagram. At minimum you should provide the following
properties in the `opts` object:

* `row` - row position (top edge of the box)
* `column` - column position (left edge of the box)
* `width` - the width of the box
* `height` - the height of the box

Other optional properties are:

* `class` - a custom class name to apply to the box, e.g. for CSS styling purposes
* `style` - inline styles object to apply to the box

Returns the diagram instance (chainable method).



<br><br>
<a href="#getCoordinatesAtCell" name="getCoordinatesAtCell">#</a> diagram.**getCoordinatesAtCell**(*row*, *column*)

Get the pixel coordinates at a location defined by a row number and column number.
Useful when used in conjunction with the `getCanvas()` method as it allows you
to add your own custom elements to the diagram and easily position them.



<br><br>
<a href="#getCanvas" name="getCanvas">#</a> diagram.**getCanvas**()

Returns the element where all drawing takes place inside as a D3 element.
If you want to add your own custom elements to the diagram, access the canvas by
calling this method.

```javascript
var canvas = diagram.getCanvas();

// Use the D3 node method to get raw SVG element
canvas.node()
```
