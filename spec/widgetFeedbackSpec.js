/* eslint-disable no-undef */

const jsdom = require("jsdom")
const { JSDOM } = jsdom

//prepare the virtual DOM jusing jsdom
const dom = new JSDOM(
    `<!doctype html>
        <html>
        <head>
        </head>
        <body>
            <div id="spa" class="container">SPA!</div>
        </body>
        </html>`
    , { resources: "usable", runScripts: "dangerously" });

//access document via:  dom.window.document;

global.document = dom.window.document;

//require target under testing (the compiled dist file)
require('../dist/app.min.js')

/** 
* -------------
* check if the public API's are defined for app, app.model and app.data
* -------------
*/
describe("Check if the expected public interfaces are defined", function () {

    it("widget.feedback", function () {
        expect(widget.feedback).toBeDefined();
        //check the public API
        expect(typeof widget.feedback.initModule).toBe('function');
        expect(typeof widget.feedback.showMessage).toBe('function');
    });

})

/** 
 * -------------
 * Check the widget itself 
 * -------------
*/
describe("Testing the widgetFeedback", function () {

    describe("Test the initModule()", function () {
        it("Check if the template is added to the DOM (after the initModule)", function () {
            widget.feedback.initModule('spa');

            expect(dom.window.document.querySelector("#feedback-container")).not.toBe(null);
        });

        it("Check if the app container should have zero child nodes", function () {
            expect(dom.window.document.querySelector("#feedback-container").children.length).toBe(0);
        });

    })

    describe("Test the showMessage() #1", function () {
        it("Check if a title is being displayed", async function () {
            widget.feedback.showMessage('This is my title', 'This is the message', 1);
            let displayedValue = dom.window.document.querySelector("#feedback-widget strong.title").textContent;
            expect(displayedValue).toBe('This is my title');
        });

        it("Check if a message is being displayed", async function () {
            //✕
            let displayedMessageValue = dom.window.document.querySelector("#feedback-widget span.message").textContent;
            expect(displayedMessageValue).toBe('This is the message');
        });
    })

    describe("Test button click", function () {
        it("Check if the message disappeared from the DOM", function () {
            dom.window.document.querySelector("#feedback-close-button").click();
            expect(dom.window.document.querySelector('#feedback-container').children.length).toBe(0);
        });
    })

    describe("Test the showMessage() #2", function () {
        it("Check if a title is being displayed", async function () {
            widget.feedback.showMessage('This is my title 2', 'This is the message 2', 2);
            let displayedValue = dom.window.document.querySelector("#feedback-widget strong.title").textContent;
            expect(displayedValue).toBe('This is my title 2');
        });

        it("Check if a message is being displayed", async function () {
            let displayedMessageValue = dom.window.document.querySelector("#feedback-widget span.message").textContent;
            expect(displayedMessageValue).toBe('This is the message 2');
        });
        it("Check if the message disappeared from the DOM", function () {
            dom.window.document.querySelector("#feedback-close-button").click();
            expect(dom.window.document.querySelector('#feedback-container').children.length).toBe(0);
        });

    })
});
