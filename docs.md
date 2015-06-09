# SimpleDiagram.js Documentation

Documentation to be added very soon!

When you include the **SimpleDiagram.js** library in a webpage, a constructor
function called SimpleDiagram will be exposed on the global window object.


<a href="#SimpleDiagram" name="SimpleDiagram">#</a> **SimpleDiagram**(*containerSelector*[, *settings*])

The constructor must be called with the new operator. You should provide a CSS
selector which represents the container element to draw the diagram in, and additionally
a *settings* object. Your custom settings will be merged onto the default settings.
The default *settings* are as follows:

```javascript
defaultSettings = {

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
Here is an example of how to create a diagram in the *#diagram* element:

```javascript
var diagram = new SimpleDiagram('#diagram', {
    numRows: 9,
    numColumns: 9,
    cellSize: 35
});
```



<a href="#addNode" name="addNode">#</a> diagram.**addNode**(*opts*)


<a href="#addLine" name="addLine">#</a> diagram.**addLine**(*opts*)


<a href="#addLabel" name="addLabel">#</a> diagram.**addLabel**(*opts*)


<a href="#addBox" name="addBox">#</a> diagram.**addBox**(*opts*)


<a href="#addCoordinatesAtCell" name="getCoordinatesAtCell">#</a> diagram.**getCoordinatesAtCell**(*row*, *column*)
