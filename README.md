# Diascope
A JavaScript library to create a horizontal slider. It does not have any dependencies.

## Installation
```
$ npm install diascope --save
```

## Usage

### Constructor
```
import Diascope from 'Diascope';

let frame = document.querySelector('.js-diascope-frame');
let reel = document.querySelector('.js-diascope-reel');
let options = {
	start: 3
};

new Diascope(frame, reel, options);
```

The constructor accepts an optional `options` as its 3rd parameter. It should be an object with any of the following parameters:

#### `step` (Number)
default: `1`

The number of new items to bring into view when navigating through the items.

#### `loop` (Boolean)
default: `false`

Whether to loop around the list when navigating past a first or last item.

#### `shouldCenter` (Boolean)
default: `false`

If set to `true`, visible items are shown centered. Otherwise, they will stick to a side.

#### `elementNavigateNext` (Element)
Pass an `Element` that triggers `next()` when clicked.

#### `elementNavigatePrevious` (Element)
Pass an `Element` that triggers `previous()` when clicked.

#### `drag` (Boolean)
default: `true`

Enable touch and mouse dragging.

#### `elastic` (Boolean)
default: `true`

Determines whether the reel can be dragged loosely out of bounds. The reel will bounce back once released.

#### `animationEasing` (String|Array)
default: `"linear"`

#### `duration` (Number)
default: `250`

The duration of the animation in milliseconds.

You can define the easing function that should be used for the animation of the reel. You can pass a keyword `String` to set it to a predefined cubic bezier curve:
* `"linear"`
* `"ease"`
* `"easeIn"`
* `"easeOut"`
* `"easeInOut"`

Alternatively, you can pass an `Array` with the coordinates of the second and third control points on the cubic bezier curve, like:

`[p1x, p1y, p2x, p2y]`

This syntax follows the same argument order as CSS' `cubic-bezier` timing function. To understand cubic bezier curves in relation to animation a little better, check out [Lea Verou's cubic bezier playground](http://cubic-bezier.com).

#### `onSlideStart` (Function)
A callback function that is called when the reel's position change starts.

#### `onSlideEnd` (Function)
A callback function that is called when the reel's position change ends.

#### `onSlide` (Function)
A callback function that is called with each step of the reel's position change.

### API
An instance of Diascope has the following methods available:

#### `next()`

#### `previous()`

#### `panSlides(pan)`

#### `addElementNavigateNext(element)`
* **element** (Element)
Add an `Element` that calls `next()` when clicked.

#### `addElementNavigatePrevious(element)`
Add an `Element` that calls `previous()` when clicked.

#### `setAnimationEasing(easing)`
* **easing** (String|Array)

#### `setOnSlideStart(onSlideStart)`
* **onSlideStart** (Function)

#### `setOnSlideEnd(onSlideEnd)`
* **onSlideEnd** (Function)

#### `setOnSlide(onSlide)`
* **onSlide** (Function)
