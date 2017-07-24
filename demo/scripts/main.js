const Diascope = window.Diascope;

let frame, reel, navigateNext, navigatePrevious, options;

frame = document.querySelector('.js-diascope-frame');
reel = document.querySelector('.js-diascope-reel');
navigateNext = document.querySelector('.js-diascope-navigate-next');
navigatePrevious = document.querySelector('.js-diascope-navigate-previous');

options = {
	elementNavigateNext: navigateNext,
	elementNavigatePrevious: navigatePrevious,
};

new Diascope(frame, reel, options);
