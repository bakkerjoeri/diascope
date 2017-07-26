# Diascope
Easily set up an item slider with touch & mouse drag interaction.

## Installation
```
$ npm install diascope --save
```

## Usage
### HTML
The structure of a slider has three parts:

* **frame**: The frame is the window that shows the currently visible slides.
* **reel**: The reel is displayed within the frame, and contains all the slides. Navigation through slides works by changing the offset of the reel. Because of this, you should make sure that the reel's `width` is determined by the slides it contains.
* **slides**: All the available slides.

![A diagram displaying the expected slider structure.](structure-diagram.png)

Consider the following example:

```
<div class="diascope__frame js-diascope-frame">
	<ul class="diascope__reel js-diascope-reel">
		<li class="diascope__slide">slide 1</li>
		<li class="diascope__slide">slide 2</li>
		<li class="diascope__slide">slide 3</li>
	</ul>
</div>
```

The `reel` should be the immediate child of the `frame`. All the direct children of the `reel` are each considered a `slide`.

I'm using `diascope` classnames, but since you're passing all elements in the constructor the naming is for you to decide.

Additionally, I'm using an unordered list, but whether you use `ul` or `div` is irrelevant. In stead what you use should depend on the semantics that best describe the contents of your slider.


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
default: `true`

Whether to loop around the list.

For instance, when the `position` is `4` and this is the *last item* in the list, calling `next()` with a `step` of `3` when `loop` is `true` will result in the `position` becoming to `2`.

#### `shouldCenter` (Boolean)
default: `false`

If set to `true`, visible items are shown centered. Otherwise, they will stick to a side.

#### `elementNavigateNext` (Element)
Pass an `Element` that triggers `next()` when clicked.

#### `elementNavigatePrevious` (Element)
Pass an `Element` that triggers `previous()` when clicked.

#### `animationEasing` (String|Array)
default: `"linear"`

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
