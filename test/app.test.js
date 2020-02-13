/** 
 * -------------
 * Check the test/index.html page itself if all required DOM elements for testing are available
 * -------------
*/
describe("Check testing page itself", function () {
    it("It should have the app container", function () {
        expect(document.getElementById("spa")).not.toBe(null);
    });
    it("The app container should have three child nodes", function () {
        expect(document.getElementById("spa").childElementCount).toBe(3);
    });
    it("It should have the question section", function () {
        expect(document.getElementById("question")).not.toBe(null);
    });
})

/** 
 * -------------
 * Check spa.data
 * -------------
*/
describe("Check spa.data.loadData request", function () {

    let onSuccess, onFailure;
    //the test response that will be used for mocking
    //Response object see: https://developer.mozilla.org/en-US/docs/Web/API/Response/Response
    let testJson = {
        "version": 1,
        "language": "nl",
        "questions": [
            { "id": 7, "question": "That's the question!?" },
            { "id": 8, "question": "Awesome testdata!?" }
        ]
    };
    let testJsonBlob = new Blob(
        [JSON.stringify(testJson)],
        { type: "application/json" });

    //this response will be returned for this testing scenario    
    let testJsonResponse = new Response(testJsonBlob, { "status": 200 });

    beforeEach(function () {
        jasmine.Ajax.install();

        onSuccess = jasmine.createSpy('onSuccess');
        onFailure = jasmine.createSpy('onFailure');

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(testJsonResponse));
    });

    afterEach(function () {
        jasmine.Ajax.uninstall();
    });

    describe("onSuccess", function () {
        it("should not have called the spy onSuccess before doing the request", function () {
            expect(onSuccess).not.toHaveBeenCalled();
            expect(onFailure).not.toHaveBeenCalled();
        });

        it("after the request it should have called the spy onSuccess", async function () {

            spa.data.initModule();
            //add async before it function and await, to let it wait
            await spa.data.loadData()
                .then(function (response) {
                    //check version
                    expect(response.version).toBe(testJson.version);
                    //check language    
                    expect(response.language).toBe(testJson.language);
                    //check id of first question in array
                    expect(response.questions[0].id).toBe(testJson.questions[0].id);
                    //check question of first question in array
                    expect(response.questions[0].question).toBe(testJson.questions[0].question);

                    //check id of second question in array
                    expect(response.questions[1].id).toBe(testJson.questions[1].id);
                    //check question of second question in array
                    expect(response.questions[1].question).toBe(testJson.questions[1].question);

                    return onSuccess();
                })
                .catch(function (error) {
                    return onFailure();
                });

            expect(onSuccess).toHaveBeenCalled();
            expect(onFailure).not.toHaveBeenCalled();
        });
    })
});

/**
 * -------------
 * Test how exceptions are handled using promises
 * -------------
 * Based on http://engineering.pivotal.io/post/tdd-js-native-promises/
 */
describe("Check spa.data.loadData request both successfull and unsuccessfull", function () {
    var loadDataPromise;
    var promiseHelper;

    beforeEach(async function () {
        var fetchPromise = new Promise(function (resolve, reject) {
            promiseHelper = {
                resolve: resolve,
                reject: reject
            };
        });
        //spa.data uses fetch, so we are going to spy on that
        spyOn(window, 'fetch').and.returnValue(fetchPromise);

        await spa.data.initModule();
        loadDataPromise = spa.data.loadData();
    });

    describe('on unsuccessful spa.data.loadData()', function () {
        var errorObj = { msg: 'Wow, this really failed!' };

        beforeEach(function () {
            promiseHelper.reject(errorObj);
        });

        it('check if an error is returned', function (done) {
            loadDataPromise.catch(function (error) {
                expect(error).toEqual(errorObj);
                done();
            });
        });
    });

    describe('on successful spa.data.loadData()', function () {
        beforeEach(function () {
            var response = new Response(JSON.stringify({
                "version": 7,
                "language": "de",
                "questions": []
            }));
            promiseHelper.resolve(response);
        });

        it('check if the correct JSON is returned', function (done) {
            loadDataPromise.then(function (json) {
                expect(json.version).toEqual(7);
                expect(json.language).toEqual('de');
                expect(json.questions.length).toEqual(0);
                done();
            });
        });
    });
});

/** 
 * -------------
 * Check spa model by mocking the spa.data layer
 * -------------
*/
describe("Check spa.model", function () {

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
        //local storage is used by spa.model, so clear it
        localStorage.clear();

        //add a spies and mock its behaviour
        spyOn(spa.data, 'initModule').and.returnValue(Promise.resolve());

        //spa.data.loadData spy defined within the tests

    });

    afterEach(function () {
        //local storage is used by spa.model, so clear it after each test
        localStorage.clear();
    });

    describe("Test spa.model.getQuestion()", function () {

        beforeEach(function () {
            //spa.data.loadData is called in the spa.model.initModule and returns the JSON
            spyOn(spa.data, 'loadData').and.callFake(function (req) {
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

/** 
 * -------------
 * Check spa app 
 * -------------
*/
describe("Testing the spa app", function () {
    const testQuestion = "Wow this is an awesome test question?";
    let testCounter = 0;

    beforeEach(function () {
        //add a spies and mock their behaviour
        spyOn(spa.data, 'initModule').and.callFake(function (req) {
            return Promise.resolve();   //do nothing
        });
        spyOn(spa.model, 'initModule').and.callFake(function (req) {
            return Promise.resolve();   //do nothing
        });

        //spa.model.getQuestions is called in the spa app and returns a String
        spyOn(spa.model, 'getQuestion').and.callFake(function (req) {
            testCounter++;  //testcounter is updated after each test
            return testQuestion + testCounter;
        });
    });

    describe("Test the OnClick event on the SPA container", function () {
        it("Check if the first question is displayed (after the initModule)", async function () {

            await spa.initModule('spa');
            await setTimeout(null, 100);    //wait for the DOM to update

            let displayedValue = document.getElementById("question").innerHTML;
            expect(displayedValue).toBe(testQuestion + testCounter);
        });

        it("Check if the xth question is displayed after each OnClick event", async function () {

            for (let i = 0; i < 5; i++) {
                document.getElementById("spa").click();

                await setTimeout(null, 100);    //wait for the DOM to update

                let displayedValue = document.getElementById("question").innerHTML;
                expect(displayedValue).toBe(testQuestion + testCounter);
            }
        });
    })
});

/** 
 * -------------
 * Test the entire stack (app, model, data)
 * -------------
*/
describe("Test the entire stack (mocking the fetch() called by data layer)", function () {

    //the test response that will be used for mocking
    let testJson = {
        "version": 2,
        "language": "eng",
        "questions": [
            { "id": 8, "question": "Awesome testdata!? 88" },
            { "id": 9, "question": "Awesome testdata!? 99" }
        ]
    };
    let testJsonBlob = new Blob([JSON.stringify(testJson)], { type: "application/json" });
    let testJsonResponse = new Response(testJsonBlob, { "status": 200 });

    //I don't know how to fix this in a proper way when test are run in a random way
    const waitForTheDomToGetUpdated = () => {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve();
            }, 100);
        });
    }

    beforeEach(async function () {
        jasmine.Ajax.install();

        spyOn(window, 'fetch').and.callFake(function (req) {
            // resolve using our mock data
            return Promise.resolve(testJsonResponse);
        });

    });

    afterEach(function () {
        jasmine.Ajax.uninstall();
    });

    describe("Check the entire stack", function () {

        it("Check if the first (random) question is displayed after the initModule", async function () {
            await spa.initModule('spa');    //init the SPA module
            await waitForTheDomToGetUpdated();

            let displayedQuestion1 = document.getElementById("question").innerHTML;
            //since we are looking for a random value, we need to iterate through the test input
            testJson.questions.forEach((value, position) => {
                if (displayedQuestion1 == value.question) {
                    expect(displayedQuestion1).toBe(value.question);
                    testJson.questions.splice(position, 1);
                }
            });
        });

        it("Check if you get the next (and last question) after a click event", async function () {
            document.getElementById("spa").click();
            await waitForTheDomToGetUpdated();

            let displayedQuestion2 = document.getElementById("question").innerHTML;
            expect(displayedQuestion2).toBe(testJson.questions[0].question);
        });

        it("Check if you get the default String after another click event", async function () {
            document.getElementById("spa").click();
            await waitForTheDomToGetUpdated();
            let displayedQuestion3 = document.getElementById("question").innerHTML;
            expect(displayedQuestion3).toBe("Well done! You are done! :)");
        });
    })
});