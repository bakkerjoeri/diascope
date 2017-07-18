let Diascope = window.Diascope;

let frame = document.querySelector('.js-diascope-frame');
let reel = document.querySelector('.js-diascope-reel');
let options = {
	step: 1,
};

new Diascope(frame, reel, options);
