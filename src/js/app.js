/** 
 * -------------
 * Retrogenerator SPA app
 * -------------
*/
spa = ( () => {
    var configMap = {
        templateId: 'spa',
        questionDomId: 'question'
    },
    stateMap = {
        $container: undefined
    },
    _initModule, _showNextQuestion, _roundCounter = 0;

    _initModule = ($container) => {
        stateMap.$container = $container;

        let dataLoaded = spa.data.initModule();
        let modelLoaded = spa.model.initModule();

        Promise.all([dataLoaded,modelLoaded]).then(data => {
            _showNextQuestion();
            _roundCounter++;
            spa.model.logEvent('OnClick',_roundCounter);
            
            document.getElementById(stateMap.$container).onclick = () => { 
                _showNextQuestion(); 
                _roundCounter++;
                spa.model.logEvent('OnClick',_roundCounter);
            };
            
        }).catch(error => {
           console.error(`spa.initModule ${error}`);
        });
    }

    _showNextQuestion = () => {
        document.getElementById(configMap.questionDomId).innerHTML = spa.model.getQuestion();
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
spa.model = ( () => {
    var configMap = {
    },
    stateMap = {
        $questions: undefined,
        $currentQuestion: undefined,
        $currentQuestionStartTime: undefined
    },
    _initModule, _getQuestion, _shuffleArray;

    //returns a promise when it is ready
    _initModule = () => {
        console.log('spa.model.initModule');
        localStorage.clear();
        stateMap.$currentQuestionStartTime = new Date().getTime();

        return spa.data.loadData().then(json => {
            //shuffle the array and store it
            stateMap.$questions = _shuffleArray(json.questions);
        });
    }

    _getQuestion = () => {
        console.log('spa.model.getQuestion');
        if(stateMap.$questions == undefined || stateMap.$questions.length == 0){
            return "Well done! You are done! :)";
        }
        //if there is a previous currentQuestion defined
        if(typeof stateMap.$currentQuestion !== 'undefined'){
            _logEvent('Time',`Viewed question ${stateMap.$currentQuestion.id}`,Math.round((new Date().getTime() - stateMap.$currentQuestionStartTime) / 1000));
            stateMap.$currentQuestionStartTime = new Date().getTime();
        }

        stateMap.$currentQuestion = stateMap.$questions.pop();
        
        return stateMap.$currentQuestion.question;
    }

    //logs action events (from UI)
    _logEventAction = (eventName, eventValue) => {
        _logEvent('Actions',eventName,eventValue);
    }

    _logEvent = (eventCategory,eventName, eventValue) => {
        console.log(`Send ${eventCategory} Event to GA: ${eventName}  with value ${eventValue}`);
        //add event to analytics
        if(typeof ga === "function"){
            ga('send', {
                hitType: 'event',
                eventCategory: eventCategory,
                eventAction: eventName,
                eventValue: eventValue
            });
        }
        else console.log("ga('send', 'event',...) not defined.");
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

spa.data = ( () => {
    var configMap = {
        endpoint: './src/questions-nl.json'
    },
    stateMap = {
        $container: undefined
    },
    initModule;

    //returns a promise when it is ready
    _initModule =  () => {
        return new Promise((resolve, reject) => {
            console.log('spa.data.initModule');
            setTimeout(resolve, 100);
          });
    }

    // load data returns a promise which contains json data
    _loadData = () => {
        console.log('spa.data.loadData');

        return fetch(configMap.endpoint).then(response => response.json())
        .then(json =>{
            //console.log(json);
            return json;
        });

    }

    //public API
    return {
        initModule: _initModule,
        loadData: _loadData
    };
})();
