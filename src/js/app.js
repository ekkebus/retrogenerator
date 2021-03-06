/* eslint-disable no-undef */
/** 
 * -------------
 * Retrogenerator SPA app
 * -------------
*/
spa = (() => {
    var configMap = {
        startText: 'Loading...',
        htmlTemplate: (content) =>
            `<header class="box"></header>
            <section id="question" class="box">${content}</section>
            <footer class="box">Tap on the text for the next question.</footer>`,
        questionTemplate:(question) =>
            `${question}`
    },
        stateMap = {
            $container: undefined
        },
        _initModule, _insertTemplateToDom, _showNextQuestion, _roundCounter = 0;

    _initModule = ($container) => {
        stateMap.$container = document.getElementById($container);

        _insertTemplateToDom (configMap.questionTemplate(configMap.startText));

        let dataLoaded = spa.data.initModule();
        let modelLoaded = spa.model.initModule();

        Promise.all([dataLoaded, modelLoaded]).then(() => {
            _showNextQuestion();
            _roundCounter++;
            spa.model.logEvent('OnClick', _roundCounter);

            stateMap.$container.onclick = () => {
                _showNextQuestion();
                _roundCounter++;
                spa.model.logEvent('OnClick', _roundCounter);
            };

        }).catch(error => {
            console.error('spa.initModule ' + error);
        });
    }

    _showNextQuestion = () => {
        stateMap.$container.querySelector('section#question').innerHTML = configMap.questionTemplate(spa.model.getQuestion());
        
    }

    _insertTemplateToDom = (content) => {
        // execute the compiled template and update the DOM
        stateMap.$container.innerHTML += configMap.htmlTemplate(content);
    }

    //public API
    return {
        initModule: _initModule
    };
})();

/** 
 * -------------
 * MODEL 
 * -------------
*/
spa.model = (() => {
    var stateMap = {
        $questions: undefined,
        $currentQuestion: undefined,
        $currentQuestionStartTime: undefined
    },
        _initModule, _getQuestion, _shuffleArray;

    //returns a promise when it is ready
    _initModule = () => {

        stateMap.$currentQuestionStartTime = new Date().getTime();

        return spa.data.loadData().then(json => {
            //shuffle the array and store it
            stateMap.$questions = _shuffleArray(json.questions);
        });
    }

    _getQuestion = () => {
        if (stateMap.$questions == undefined || stateMap.$questions.length == 0) {
            return "Well done! You are done! :)";
        }
        //if there is a previous currentQuestion defined
        if (typeof stateMap.$currentQuestion !== 'undefined') {
            _logEvent('Time', `Viewed question ${stateMap.$currentQuestion.id}`, Math.round((new Date().getTime() - stateMap.$currentQuestionStartTime) / 1000));
            stateMap.$currentQuestionStartTime = new Date().getTime();
        }

        stateMap.$currentQuestion = stateMap.$questions.pop();

        return stateMap.$currentQuestion.question;
    }

    //logs action events (from UI)
    _logEventAction = (eventName, eventValue) => {
        _logEvent('Actions', eventName, eventValue);
    }

    _logEvent = (eventCategory, eventName, eventValue) => {
        //add event to analytics
        if (typeof gtag === "function") {
            console.log(`Send ${eventCategory} Event to GA: ${eventName}  with value ${eventValue}`);
            gtag('event', 'action', {
                'event_category': eventCategory,
                'event_label': eventName,
                'value': eventValue,
                'non_interaction': false,
                'anonymize_ip': true
            });
        }
    }

    _shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
    }

    //public API
    return {
        initModule: _initModule,
        getQuestion: _getQuestion,
        logEvent: _logEventAction
    };
})();

/** 
 * -------------
 * SPA DATA
 * -------------
*/

spa.data = (() => {
    var configMap = {
        endpoint: './dist/questions-nl.json'
    },
        _initModule;

    //returns a promise when it is ready
    _initModule = () => {
        return new Promise((resolve) => {
            setTimeout(resolve, 10);
        });
    }

    // load data returns a promise which contains json data
    _loadData = () => {
        return fetch(configMap.endpoint).then(response => {
            return response.json()
        });

    }

    //public API
    return {
        initModule: _initModule,
        loadData: _loadData
    };
})();
