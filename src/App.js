import React from 'react';
import { Carousel } from './Carousel';
import "./Carousel.css";

const slides = [
    `<h1>Hi!</h1>
    <h3> My name is Kirils Vološins and this is my attempt on the React carousel component</h3>
    <div style="text-align:left;">
      <span style="font-weight:600;"> It does support: </span>
      <ul>
        <li>HTML content (you are now looking at h1, h2, h3 and span);</li>
        <li>Swiping on mobile devices (you can try it using the browser dev tools);</li>
        <li>Changing slides by clicking on arrows (arrows disappear on the first and last pages - just like on Instagram!);</li>
        <li>Changing slides by entering the number of the slide (the human one, not the zero based one);</li>
        <li>Changing slides does have some simple animation (actually too simple - I mean, it is just a for loop);</li>
      <ul> 
    </div>`,
    `
    <h3> It does support images too </h3>
    <img src="https://scandiweb.com/assets/images/scandiweb_logo.png" style="height:40%; width:auto;" alt="Scandiweb logo">
    `,
    `<h3>wow, you've made it to the slide #3! Swipe further!</h3>`,
    `
    <h3>Yet another nice image!</h3>
    <img src="https://i.pinimg.com/originals/61/e7/8b/61e78b08a8dd18779132812218a9f2a8.jpg" alt="yet another nice image" style="height:50%; width:auto;">
    `,
    `<h1> Thank you for your attention! </h1>
    <span> P.S. If any of this does not match the standard required to work on web apps, I would love to join the React team as a junior developer. </span>`
];

export function App() {
    return <Carousel slides={slides} />;
}