/* eslint-disable no-undef */
const jsdom = require("jsdom")
const { JSDOM } = jsdom

global.window = new JSDOM(
    `<!doctype html>
        <html>
        <head>
        </head>
        <body>
            <div id="spa" class="container">SPA!</div>
        </body>
        </html>`
    , { resources: "usable", runScripts: "dangerously" }).window;
global.document = global.window.document

beforeEach(function () {
    
    
});
