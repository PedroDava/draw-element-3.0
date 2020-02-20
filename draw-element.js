/**
* * `<draw-element>` is a simple draw component based on William Malone's app:
* http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/#demo-simple
* 
* ## Polymer Component for painting
* 
* Polymer Component that offers a canvas area where the user is able to paint with the mouse or the finger
* depending on the device used, desktop or smartphone.
* 
* Usage:
* 
* ```html
* <draw-element></draw-element>
* ```
* 
* It is possible to customize the Component.
* 
* Custom property | Description | Default
* -----------------|-------------|---------
* width | canvas width in pixels | 490
* height | canvas height in pixels | 220
* line-width | pen point width in pixels | 11
* line-join | pen point shape, possible values: "round", "bevel", "miter" | "round"
* line-color | paint colour in css format | #df4b26
* background-color | background colour in css format | #fff8eb
* border-color | canvas border colour in css format | #d6d6d6
* 
* Example:
  * 
* ```html
* <draw-element
*     width="500"
*     height="300"
*     line-width="5"
*     line-join="round"
*     line-color="azure"
*     background-color="rgba(21, 24, 56, 1)"
*     border-color="#000000">
* ```
* 
* ## Styling
* 
* Custom property | Description | Default
* -----------------|-------------|---------
* --draw-element | Mixing applied to entire component | {}
*
* @customElement
* @polymer
* @demo demo/index.html
*/

import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';



class DrawElement extends GestureEventListeners(PolymerElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
        @apply --draw-element;
      }
    </style>
     <canvas id="canvas" width="[[width]]" height="[[height]]" 
      on-down="draw" on-up="stopDrawing" on-mouseleave="stopDrawing" on-track="record" 
      ></canvas> 
  
    <br>
    <button on-click="clear">clear</button>
`;
  }

  static get is() { return 'draw-element'; }
  static get properties() {
    return {
      /**
      * the canvas context, setted in ready() callback
      * @type {String}
      */
      context: {
        type: String,
        readonly: true
      },
      /**
      * paint colour in css format
      * @type {String}
      */
      lineColor: {
        type: String,
        value: '#df4b26'
      },
      /**
      * pen point width in pixels
      * @type {Number}
      */
      lineWidth: {
        type: Number,
        value: 11
      },
      /**
      * pen point shape, possible values: "round" (default), "bevel", "miter"
      * @type {String}
      */
      lineJoin: {
        type: String,
        value: 'round'
      },
      /**
      * background colour in css format
      * @type {String}
      */
      backgroundColor: {
        type: String,
        value: '#fff8eb'
      },
      /**
      * canvas border colour in css format
      * @type {String}
      */
      borderColor: {
        type: String,
        value: '#d6d6d6'
      },
      /**
      * pen point width in pixels
      * @type {Number}
      */
      width: {
        type: Number,
        value: 490
      },
      /**
      * pen point height in pixels
      * @type {Number}
      */
      height: {
        type: Number,
        value: 220
      },
      /**
      * paint flag
      * @type {Boolean}
      */
      paint: {
        type: Boolean,
        value: false
      },
      /**
      * mouse / touch X position in pixels
      * @type {Number}
      */
      mouseX: {
        type: Number
      },
      /**
      * mouse / touch Y position in pixels
      * @type {Number}
      */
      mouseY: {
        type: Number
      },
      /**
      * saves mouse / touch X positions in pixels while painting
      * @type {Array}
      */
      clickX: {
        type: Array,
        value: function () {
          return []
        }
      },
      /**
      * saves mouse / touch Y positions in pixels while painting
      * @type {Array}
      */
      clickY: {
        type: Array,
        value: function () {
          return []
        }
      },
      /**
      * saves click booleans, each false means the end and start of a new trace
      * @type {Array}
      */
      clickDrag: {
        type: Array,
        value: function () {
          return []
        }
      }
    };
  }

  /**
  * This method sets the background colour of the canvas
  * and the canvas border colour.
  */
  setBackground() {
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.context.canvas.style.border = '1px solid' + this.borderColor;
  }

  /**
  * This method clears the canvas, executes setBackground method
  * and sets the arrays of paint positions and drags to empty.
  * @param {event Object} e The event object that is generated automatically when event fires.
  */
  clear(e) {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.setBackground();
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
  }

  /**
  * This method is executed when down event occurres,
  * it records the position in an array via the addClick function. 
  * It sets the boolean paint to true. 
  * Finally it updates the canvas with the redraw method.
  * @param {event Object} e The event object that is generated automatically when event fires.
  */
  draw(e) {
    //console.log(e);
    this.mouseX = e.detail.sourceEvent.pageX - this.offsetLeft;
    this.mouseY = e.detail.sourceEvent.pageY - this.offsetTop;

    this.paint = true;
    this.addClick(e.detail.sourceEvent.pageX - this.offsetLeft, e.detail.sourceEvent.pageY - this.offsetTop, false);
    this.redraw();
  }

  /**
  * This method is executed when up event occurres, it sets the boolean paint to false.
  * @param {event Object} e The event object that is generated automatically when event fires.
  */
  stopDrawing(e) {
    this.paint = false;
  }

  /**
  * This method is executed when up draw method is executed, it saves the paint position.
  * @param {Number} x The numeric value of mouse / touch X position.
  * @param {Number} y The numeric value of mouse / touch Y position.
  * @param {Boolean} dragging The boolean value of mouse / touch Y position.
  */
  addClick(x, y, dragging) {
    this.push('clickX', x);
    this.push('clickY', y);
    this.push('clickDrag', dragging);
  }

  /**
  * This method is executed when record method is executed.
  * Each time the method is called the canvas is cleared and everything is redrawn. 
  * It sets a few stroke properties for the colour, shape, and width.
  * Then for every time we recorded as a marker on paper we are going to draw a line.
  */
  redraw() {
    this.setBackground();
    this.context.strokeStyle = this.lineColor;
    this.context.lineJoin = this.lineJoin;
    this.context.lineWidth = this.lineWidth;

    for (var i = 0; i < this.clickX.length; i++) {
      this.context.beginPath();
      if (this.clickDrag[i] && i) {
        this.context.moveTo(this.clickX[i - 1], this.clickY[i - 1]);
      } else {
        this.context.moveTo(this.clickX[i] - 1, this.clickY[i]);
      }
      this.context.lineTo(this.clickX[i], this.clickY[i]);
      this.context.closePath();
      this.context.stroke();
    }
  }

  /**
  * This method is executed when track event occurres,
  * it checks if paint property is true,
  * if so it executes the addClick method and the redraw method.
  * @param {event Object} e The event object that is generated automatically when event fires.
  */
  record(e) {
    if (this.paint) {
      this.addClick(e.detail.sourceEvent.pageX - this.offsetLeft, e.detail.sourceEvent.pageY - this.offsetTop, true);
      this.redraw();
    }
  }

  constructor() {
    super();
  }

  ready() {
    super.ready();
    this.context = this.shadowRoot.querySelector('#canvas').getContext("2d");
    this.setBackground();
  }
}

window.customElements.define(DrawElement.is, DrawElement);
