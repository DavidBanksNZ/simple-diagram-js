# SimpleDiagram.js Documentation

Before getting started, make sure you include D3.js in your web page before
*SimpleDiagram.js*. Also make sure you reference *SimpleDiagram.css* in the
head element, otherwise your diagrams are going to look, well, really weird.

When you include the *SimpleDiagram.js* library in a webpage, a constructor
function called `SimpleDiagram` will be exposed on the global window object.

**Note:** All row and column numbers in this library are 1-based, not 0-based.
Position a node at row 1, column 1 to insert it into the top-left cell.



<br><br>
<a href="#SimpleDiagram" name="SimpleDiagram">#</a> **SimpleDiagram**(*containerSelector*[, *settings*])

The constructor must be called with the new operator. You should provide a CSS
selector which represents the container element to draw the diagram in, and additionally
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

    // Margin around the diagram (pixels)
    margin: 2,

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

The returned `diagram` object has several methods for adding content to the diagram.
These are described below.



<br><br>
<a href="#addNode" name="addNode">#</a> diagram.**addNode**(*opts*)

[Chainable] Add a node to the diagram. At a minimum you should provide the following properties
in the `opts` object:

* `name` - unique name identifier
* `row` - which row the node should sit in
* `column` - which column the node should sit in
* `label` - the label displayed in the node (should be very short)

Other optional properties are:

* `class` - a custom class name to apply to the node, e.g. for CSS styling purposes
* `shape` - shape of the node, either `circle` (default) or `square`
* `hoverText` - the text to show in the tooltip when this node is moused over
* `shapeStyle` - inline styles object to apply to the node shape
* `labelStyle` - inline styles object to apply to the node label



<br><br>
<a href="#addLine" name="addLine">#</a> diagram.**addLine**(*opts*)

[Chainable] Add a line to the diagram. At minimum you should provide the following properties
in the `opts` object:

* `from` - node name or `[row,column]` array where the line should start
* `to` - node name or `[row,column]` array where the line should end

Other optional properties are:

* `class` - a custom class name to apply to the line, e.g. for CSS styling purposes
* `addArrow` - should the line have an arrowhead at the `to` end? Defaults to `true`
* `style` - inline styles object to apply to the line



<br><br>
<a href="#addLabel" name="addLabel">#</a> diagram.**addLabel**(*opts*)

[Chainable] Add a text label to the diagram. At minimum you should provide the following properties
in the `opts` object:

* `row` - row position of the label
* `column` - column position of the label
* `label` - the text displayed by the label

Other optional properties are:

* `align` - how to horizontally align the text. `start`, `middle` (default) or `end`
* `class` - a custom class name to apply to the label, e.g. for CSS styling purposes
* `style` - inline styles object to apply to the label



<br><br>
<a href="#addBox" name="addBox">#</a> diagram.**addBox**(*opts*)

[Chainable] Add a box to the diagram. At minimum you should provide the following
properties in the `opts` object:

* `row` - row position (top edge of the box)
* `column` - column position (left edge of the box)
* `width` - the width of the box
* `height` - the height of the box

Other optional properties are:

* `class` - a custom class name to apply to the box, e.g. for CSS styling purposes
* `style` - inline styles object to apply to the box



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

// Use D3 node method to get raw SVG element
canvas.node()
```
