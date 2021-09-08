import React from "react";
import "./Carousel.css";
import { useState, useEffect, useRef } from "react";

/* External helper functions */
async function wait() {
    return new Promise(resolve => {
        setTimeout(() => resolve(), 1)
    });
}
const getCleanSlideData = (slides, slideId) => `<div>${typeof slides[slideId] === "undefined" ? "" : slides[slideId]}</div>`; /* will not show "undefined" instead of non-existing slides */
const getUserSwipeDirection = (newMarginLeft) => ({ isUserSwipingRight: newMarginLeft < -100, isUserSwipingLeft: newMarginLeft >= -100 });
const wasSwipeTooFast = (e, swipeStartData) => {
    const MIN_SWIPE_DURATION_MS = 100;
    const swipeDuration = e.timeStamp - swipeStartData.current.timeStamp;
    /* if (swipeDuration <= MIN_SWIPE_DURATION_MS) console.error(`SWIPE TOO FAST at (${swipeDuration}) ms.`); */
    return swipeDuration <= MIN_SWIPE_DURATION_MS;
};
const wasSwipeTooShort = (e, swipeStartData) => {
    const MIN_SWIPE_DISTANCE_PX = 50;
    const currentSwipeX = e.changedTouches[0].clientX;
    const swipeStartScreenX = swipeStartData.current.changedTouches[0].clientX;
    const swipeDeltaX = currentSwipeX - swipeStartScreenX;
    /* if (Math.abs(swipeDeltaX) < MIN_SWIPE_DISTANCE_PX) console.error(`SWIPE TOO SHORT at (${swipeDeltaX}) px.`) */
    return Math.abs(swipeDeltaX) < MIN_SWIPE_DISTANCE_PX;
};
const isThereNoSlideThere = (isUserSwipingRight, currentlySelectedSlideId) => {
    const idOfSlideToCheckExisting = isUserSwipingRight ? currentlySelectedSlideId + 1 : currentlySelectedSlideId - 1;
    const closestPossibleSlideIndex = returnClosestPossibleSlideIndex(idOfSlideToCheckExisting);
    return idOfSlideToCheckExisting !== closestPossibleSlideIndex;
}; /* just checking if the slide the user is about to open exists. */
const getSlidesDataHTML = (slides, slideId) => [getCleanSlideData(slides, slideId - 1), getCleanSlideData(slides, slideId), getCleanSlideData(slides, slideId + 1)].join("");
const getSlidesDataHTML_duplicate12 = (slides, slideId) => [getCleanSlideData(slides, slideId), getCleanSlideData(slides, slideId), getCleanSlideData(slides, slideId + 1)].join(""); /* animating slides the "easy" way turned out to be quite complex since I have chosen to store simultaneously only three slides and animations are done by changing marginLeft. The way it works is there are three slides on screen simultaneously. The user sees only the middle one - previous and next ones are hidden. Once the user swipes to the next slide, the previous and current are hidden. Since there are only three slides and I kinda need to reset the margin for selected slide to be the middle one (so the user can continue switching between slides), I duplicate the content of the slide being shown to the middle slide and change marginLeft back for the middle slide to be shown. Then I update the content of all slides to store newPrevious, newCurrent and newNext slide actual content.*/
const getSlidesDataHTML_duplicate23 = (slides, slideId) => [getCleanSlideData(slides, slideId), getCleanSlideData(slides, slideId + 1), getCleanSlideData(slides, slideId + 1)].join("");
const changeSlideContent = (slides, slideId, contentContainer) => contentContainer.current.innerHTML = getSlidesDataHTML(slides, slideId);
const changeSlideContentDuplicateVisibleSlideToNextOne = (slides, slideId, contentContainer) => contentContainer.current.innerHTML = getSlidesDataHTML_duplicate12(slides, slideId);
const changeSlideContentDuplicateVisibleSlideToPreviousOne = (slides, slideId, contentContainer) => contentContainer.current.innerHTML = getSlidesDataHTML_duplicate23(slides, slideId);
const returnClosestPossibleSlideIndex = (passedValue, firstSlideId, lastSlideId) => {
    if (passedValue < firstSlideId) return firstSlideId;
    if (passedValue > lastSlideId) return lastSlideId;
    return passedValue;
}; /* sometimes the user can try to open a non-existing slide. Let's prevent that. */
const returnRecommendedSlideIndex = (humanValue, firstSlideId, lastSlideId) => {
    if (isNaN(humanValue)) return firstSlideId;
    const properSlideIndex = humanValue - 1;
    return returnClosestPossibleSlideIndex(properSlideIndex, firstSlideId, lastSlideId);
}; /* sometimes the user can try to open a non-existing slide. Let's prevent that. This function handles user-input value. */
const handleSlideIdInputKeyboardPressEvent = ({ keyCode }) => keyCode === 13 ? handleSlideNumberManualInput() : '';



export function Carousel(props) {
    const { slides } = props;
    const firstSlideId = 0, amountOfSlides = slides.length, lastSlideId = amountOfSlides - 1;
    /* REFS */
    const contentContainer = useRef(null);
    const slideIdInputField = useRef(null);
    const scrollLeftButton = useRef(null);
    const scrollRightButton = useRef(null);
    const navOverlay = useRef(null);
    const swipeStartData = useRef(null); /* To find out if a swipe has been too short or fast (accidental), we need to store data about the swipe start. */
    const isAnimationStillActive = useRef(false); /* Fixing the situation when the next slide is being opened before the animation has ended. */
    /* STATES */
    const [currentlySelectedSlideId, selectSlideById] = useState(firstSlideId);
    const [newMarginLeft, setMarginLeft] = useState(-100); /* We will animate changing slides by changing the value of the corresponding margin. */
    /* EFFECTS */
    useEffect(() => contentContainer.current.style.marginLeft = `${newMarginLeft}%`, [newMarginLeft]); /* all slide animations are just changes of marginLeft */
    useEffect(() => {
        slideIdInputField.current.value = currentlySelectedSlideId + 1; /* change the number of slide being shown. */
        manageScrollButtonVisibility(currentlySelectedSlideId); /* hide scroll buttons on first and last slides. */
        changeSlideContent(slides, currentlySelectedSlideId, contentContainer); /* return slide container to the initial state. */
    }, [currentlySelectedSlideId]);


    /* MAIN FUNCTIONS */
    async function animateLeft() {
        isAnimationStillActive.current = true;
        return new Promise(async (resolve) => {
            const targetMarginLeft = 0;
            for (let i = newMarginLeft; i <= targetMarginLeft; i++) {
                setMarginLeft(i);
                await wait();
                if (i === targetMarginLeft) {
                    isAnimationStillActive.current = false;
                    resolve();
                }
            }
        });
    };
    async function animateRight() {
        isAnimationStillActive.current = true;
        return new Promise(async (resolve) => {
            const targetMarginLeft = -200;
            for (let i = newMarginLeft; i >= targetMarginLeft; i--) {
                setMarginLeft(i);
                await wait();
                if (i === targetMarginLeft) {
                    isAnimationStillActive.current = false;
                    resolve();
                }
            }
        });
    };
    async function animateWhatsLeftToGoToPreviousSlide() {
        await animateLeft();
        const newCurrentlySelectedSlideId = currentlySelectedSlideId - 1;
        changeSlideContentDuplicateVisibleSlideToNextOne(slides, newCurrentlySelectedSlideId, contentContainer);
        setMarginLeft(-100);
        selectSlideById(newCurrentlySelectedSlideId);
    };
    async function animateWhatsLeftToGoToNextSlide() {
        await animateRight();
        const newCurrentlySelectedSlideId = currentlySelectedSlideId + 1;
        changeSlideContentDuplicateVisibleSlideToPreviousOne(slides, newCurrentlySelectedSlideId, contentContainer);
        setMarginLeft(-100);
        selectSlideById(newCurrentlySelectedSlideId);
    };
    const changeToPreviousSlide = () => (currentlySelectedSlideId !== firstSlideId && isAnimationStillActive.current !== true) ? animateWhatsLeftToGoToPreviousSlide() : '';/* can't change to a non-existing slide. */
    const changeToNextSlide = () => (currentlySelectedSlideId !== lastSlideId && isAnimationStillActive.current !== true) ? animateWhatsLeftToGoToNextSlide() : ''; /* can't change to a non-existing slide. */
    function manageScrollButtonVisibility(slideId) {
        scrollLeftButton.current.style.display = slideId === firstSlideId ? "none" : "flex";
        scrollRightButton.current.style.display = slideId === lastSlideId ? "none" : "flex";
    }; /* let's hide scroll buttons on the first and last slides */
    function handleSlideNumberManualInput() {
        const valueBeingInput = parseInt(slideIdInputField.current.value);
        const properSlideIndex = returnRecommendedSlideIndex(valueBeingInput, firstSlideId, lastSlideId);
        selectSlideById(properSlideIndex);
        slideIdInputField.current.value = currentlySelectedSlideId + 1;
    }; /* check data once the user clicks the "go" button to open the slide which id has been input. */
    const handleSwipeStart = e => swipeStartData.current = e;
    function handleSwipeMove(e) {
        const currentSwipeX = e.changedTouches[0].clientX;
        const swipeStartScreenX = swipeStartData.current.changedTouches[0].clientX;
        const swipeDeltaX = currentSwipeX - swipeStartScreenX;
        const maximumSwipeXdelta = navOverlay.current.offsetWidth;
        let percentToMoveSlide = Math.round(100 * (swipeDeltaX / maximumSwipeXdelta));
        if (percentToMoveSlide > 100) percentToMoveSlide = 100;
        if (percentToMoveSlide < -100) percentToMoveSlide = -100;
        setMarginLeft(-100 + percentToMoveSlide);
    }; /* finger-following swipes */
    function handleSwipeEnd(e) {
        const { isUserSwipingRight, isUserSwipingLeft } = getUserSwipeDirection();
        if (wasSwipeTooFast(e, swipeStartData) || wasSwipeTooShort(e, swipeStartData) || isThereNoSlideThere(isUserSwipingRight, currentlySelectedSlideId)) {
            setMarginLeft(-100);
            return swipeStartData.current = null;
        }
        if (isUserSwipingRight) animateWhatsLeftToGoToNextSlide();
        if (isUserSwipingLeft) animateWhatsLeftToGoToPreviousSlide();
        swipeStartData.current = null;
    }; /* checking for the swipes to be valid and finishing animations once everything seems good. */

    return (
        <div className="wrapper">
            <div id="contentContainer" ref={contentContainer}></div>
            <div className="nav-overlay" ref={navOverlay}>
                <div className="slideTo">
                    go to
                    <input type="number" ref={slideIdInputField} onKeyUp={handleSlideIdInputKeyboardPressEvent} />
                    /
                    <span>{amountOfSlides}</span>
                    <button onClick={handleSlideNumberManualInput}>Go!</button>
                </div>
                <div className="navigation-zones" onTouchStart={handleSwipeStart} onTouchMove={handleSwipeMove} onTouchEnd={handleSwipeEnd}>
                    <div className="navigation-left navigation-big">
                        <div ref={scrollLeftButton} onClick={changeToPreviousSlide} className="nav-circle scroll-left">&#60;</div>
                    </div>
                    <div className="navigation-right navigation-big">
                        <div ref={scrollRightButton} onClick={changeToNextSlide} className="nav-circle scroll-right">&#62;</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Carousel;