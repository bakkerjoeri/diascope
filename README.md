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

### Options
#### `align` (String)
default: `"left"`

Where to position any new items brought into view. Can be:

* `"left"`
* `"center"`
* `"right"`

#### `start` (Number)
default: `0`

The position of the item in the item list to bring into view on startup.

#### `step` (Number)
default: `1`

The number of new items to bring into view when navigating through the items.

#### `loop` (Boolean)
default: `true`

Whether to loop around the list.

For instance, when the `position` is `4` and this is the *last item* in the list, calling `next()` with a `step` of `3` when `loop` is `true` will result in the `position` becoming to `2`.
