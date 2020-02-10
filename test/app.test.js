/** 
 * -------------
 * Check the run.html page itself
 * -------------
*/
describe("Check testing page itself", function () {
    it("It should have the app container", function () {
        expect(document.getElementById("spa")).not.toBe(null);
    });
    it("The app app container should have three child nodes", function () {
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
describe("Spy-ing and Mocking spa.data.loadData request (status code 200)", function () {

    let onSuccess, onFailure;
    //the test response that will be used for mocking
    //Response object see: https://developer.mozilla.org/en-US/docs/Web/API/Response/Response
    let testJson = { "version": 1, "language": "nl", "questions": [{ "id": 7, "question": "That's the question!?" }, { "id": 8, "question": "Awesome testdata!?" }] };
    let testJsonBlob = new Blob([JSON.stringify(testJson)], { type: "application/json" });
    let testJsonResponse = new Response(testJsonBlob, { "status": 200 });

    beforeEach(function () {
        jasmine.Ajax.install();

        onSuccess = jasmine.createSpy('onSuccess');
        onFailure = jasmine.createSpy('onFailure');

        spyOn(window, 'fetch').and.callFake(function (req) {
            // resolve using our mock data (ingnore the req)
            return Promise.resolve(testJsonResponse);
        });
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
            //add async before function and await, to let it wait
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

describe("Mocking spa.model request", function () {

    //the test response that will be used for mocking
    let testJson = { "version": 2, "language": "eng", "questions": [{ "id": 8, "question": "Awesome testdata!?" }] };
    let testJsonBlob = new Blob([JSON.stringify(testJson)], { type: "application/json" });
    let testJsonResponse = new Response(testJsonBlob, { "status": 200 });

    beforeEach(function () {
        jasmine.Ajax.install();

        spyOn(window, 'fetch').and.callFake(function (req) {
            // resolve using our mock data (ingnore the req)
            return Promise.resolve(testJsonResponse);
        });
    });

    afterEach(function () {
        jasmine.Ajax.uninstall();
    });

    describe("getQuestion()", function () {
        it("Check if you get the proper question", async function () {
            await spa.data.initModule();
            await spa.model.initModule();

            let question = spa.model.getQuestion();
            //check question of first question in array
            expect(question).toBe(testJson.questions[0].question);
        });

        it("Check if you get the default return String if there are no more questions (1)", function () {
            //check if you get the default return String
            let question = spa.model.getQuestion();
            expect(question).not.toBe(testJson.questions[0].question);
            expect(question).toBe("Well done! You are done! :)");
        });

        it("Check if you get the default return String if there are no more questions (2)", function () {
            //check if you get the default return String
            let question = spa.model.getQuestion();
            expect(question).not.toBe(testJson.questions[0].question);
            expect(question).toBe("Well done! You are done! :)");
        });
    })
});
