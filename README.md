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
default: `true`

Whether to loop around the list.

For instance, when the `position` is `4` and this is the *last item* in the list, calling `next()` with a `step` of `3` when `loop` is `true` will result in the `position` becoming to `2`.

#### `shouldCenter` (Boolean)
default: `false`

If set to `true`, visible items are shown centered. Otherwise, they will stick to a side.

### API
An instance of Diascope has the following methods available:

#### `next()`

#### `previous()`

#### `panSlides(pan)`
