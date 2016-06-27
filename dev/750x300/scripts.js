//You can (and propably should) use es6 if you use separate js file 
//        set this values
var intervals = [3000,1500,3000,3000];
var loops = 2;
//        if all goes well, you don't need to touch lines below
var scenes = intervals.length;
var maxRuns = scenes*loops - 1;
var body = document.querySelector('body');
var button = document.querySelector('.button');
var nextSceneNumber = 2;
var previousSceneNumber = 1;
var nextScene = function () {
    var previousSceneClass = 'scene'+previousSceneNumber;
    var nextSceneClass = 'scene'+nextSceneNumber;
    body.classList.remove(previousSceneClass);
    body.classList.add(nextSceneClass);
    if (nextSceneNumber<scenes) {
        nextSceneNumber += 1;
        previousSceneNumber +=1;
    } else {
        nextSceneNumber = 1;
        previousSceneNumber = scenes;
    }
    if (nextSceneNumber === 2) {
        previousSceneNumber = 1;
    }
};
var runs = 0;
var currentInterval = 0;
var animateSlides = function(interval) {
    if (runs < maxRuns) {
        setTimeout(function(){

            nextScene();
            document.querySelector('.main-content').children[0].classList.remove('-firstRun');
            if (currentInterval === 3) {
                currentInterval = 0;
            } else {
                currentInterval++;
            }
            if (currentInterval === 2) {
                button.classList.add('-animated');
            }
            if (runs === maxRuns-1) {
                document.querySelector('.main-content').children[scenes-1].classList.add('-lastRun');
            }

            animateSlides(intervals[currentInterval]);
        },interval);
        runs++;
    }
    else {
        return false;
    }
};
animateSlides(intervals[currentInterval]);