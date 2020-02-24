/* eslint-disable no-undef */
//prepare the virtual DOM jusing jsdom
const jsdom = require("jsdom");
const { JSDOM } = jsdom

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
global.document = dom.window.document;  //don't skipp this

//const fetch = require('node-fetch');

//require target under testing
require('../src/js/app.js')

//helper function
//I don't know how to fix this in a proper way when test are run in a random way
const waitForTheDomToGetUpdated = () => {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 200);
    });
}

/** 
 * -------------
 * Check the DOM itself if all required DOM elements for testing are available
 * -------------
*/
describe("Check testing page itself", function () {
  it("It should have the app container", function () {
    expect(dom.window.document.querySelector("#spa")).not.toBe(null);
  });
  it("The app container should have zero child nodes", function () {
    expect(dom.window.document.querySelector("#spa").children.length).toBe(0);
  });
})

/** 
* -------------
* check if the public API's are defined for app, app.model and app.data
* -------------
*/
describe("Check if the expected public interfaces are defined", function () {

  it("spa", function () {
    expect(spa).toBeDefined();
    //check the public API
    expect(typeof spa.initModule).toBe('function');
  });

  it("spa.model", function () {
    expect(spa.model).toBeDefined();
    //check the public API
    expect(typeof spa.model.initModule).toBe('function');
    expect(typeof spa.model.getQuestion).toBe('function');
    expect(typeof spa.model.logEvent).toBe('function');
  });

  it("spa.data", function () {
    expect(spa.model).toBeDefined();
    //check the public API
    expect(typeof spa.data.initModule).toBe('function');
    expect(typeof spa.data.loadData).toBe('function');
  });
})

/** 
 * -------------
 * Check spa app 
 * -------------
*/
describe("Testing the spa app (mocking spa.model and spa.data)", function () {
    const testQuestion = "Wow this is an awesome test question?";
    let testCounter = 0;

    beforeEach(function () {
        //add a spies and mock their behaviour
        spyOn(spa.data, 'initModule').and.callFake(function () {
            return Promise.resolve();   //do nothing
        });
        spyOn(spa.model, 'initModule').and.callFake(function () {
            return Promise.resolve();   //do nothing
        });

        //spa.model.getQuestions is called in the spa app and returns a String
        spyOn(spa.model, 'getQuestion').and.callFake(function () {
            testCounter++;  //testcounter is updated after each test
            return testQuestion + testCounter;
        });
    });

    describe("Test the OnClick event on the SPA container", function () {
        it("Check if the template is added to the DOM (after the initModule)", async function () {
            await spa.initModule('spa');
            await waitForTheDomToGetUpdated();

            expect(dom.window.document.querySelector("#question")).not.toBe(null);
        });

        it("Check if the app container should have three child nodes", async function () {
            expect(dom.window.document.querySelector("#spa").children.length).toBe(3);
        });

        it("Check if the first question is displayed", async function () {
            let displayedValue = dom.window.document.querySelector("#question").textContent;
            expect(displayedValue).toBe(testQuestion + testCounter);
        });

        it("Check if the xth question is displayed after each OnClick event", async function () {
            for (let i = 0; i < 5; i++) {
                dom.window.document.querySelector("#spa").click();

                let displayedValue = dom.window.document.querySelector("#question").textContent;
                expect(displayedValue).toBe(testQuestion + testCounter);
            }
        });
    })
});

/** 
 * -------------
 * Check spa model by mocking the spa.data layer
 * -------------
*/
describe("Check spa.model (mocking spa.data)", function () {

  let testJson = {
      "version": 3,
      "language": "eng",
      "questions": [
          { "id": 10, "question": "Awesome testdata 10!?" },
          { "id": 11, "question": "Awesome testdata 11!?" },
          { "id": 12, "question": "Awesome testdata 12!?" }
      ]
  };

  beforeEach(function () {
      //add a spies and mock its behaviour
      spyOn(spa.data, 'initModule').and.returnValue(Promise.resolve());

      //spa.data.loadData spy defined within the tests
  });

  afterEach(function () {
  });

  describe("Test spa.model.getQuestion()", function () {

      beforeEach(function () {
          //spa.data.loadData is called in the spa.model.initModule and returns the JSON
          spyOn(spa.data, 'loadData').and.callFake(function () {
              //make a copy of the testJson, otherwise we get some weird behaviour
              let copyOfTestData = JSON.parse(JSON.stringify(testJson));
              return Promise.resolve(copyOfTestData);
          });
      });

      it("Check if all of them are returned (in any order, but only once)", async function () {

          await spa.model.initModule();   //wait for this to finish

          //iterate trough all random questions
          let initialSize = testJson.questions.length;
          for (let i = 0; i < initialSize; i++) {
              let returnedQuestion = spa.model.getQuestion();
              testJson.questions.forEach((item, position) => {
                  if (returnedQuestion == item.question) {
                      expect(returnedQuestion).toBe(item.question);
                      //remove the item from the test Json
                      testJson.questions.splice(position, 1);
                  }
              });
          }
      });

      it("After all items have been returned, the default String is expected", function () {
          let returnedQuestion = spa.model.getQuestion();
          expect(returnedQuestion).toBe("Well done! You are done! :)");
          //double check
          let returnedQuestion2 = spa.model.getQuestion();
          expect(returnedQuestion2).toBe("Well done! You are done! :)");
      });
  })
});