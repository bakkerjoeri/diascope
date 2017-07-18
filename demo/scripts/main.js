let Diascope = window.Diascope;

let frame = document.querySelector('.js-diascope-frame');
let reel = document.querySelector('.js-diascope-reel');
let options = {
	step: 3,
	shouldCenter: true
};

new Diascope(frame, reel, options);
