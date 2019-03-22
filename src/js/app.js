/** 
 * -------------
 * SPA app
 * -------------
*/
spa = (function () {
    var configMap = {
        templateId: 'spa',
        questionDomId: 'question'
    },
    stateMap = {
        $container: undefined
    },
    _initModule, _showNextQuestion;

    _initModule = function ($container) {
        stateMap.$container = $container;

        let dataLoaded = spa.data.initModule();
        let modelLoaded = spa.model.initModule();

        Promise.all([dataLoaded,modelLoaded]).then(data => {
            _showNextQuestion();
            
            document.getElementById(stateMap.$container).onclick = function() { 
                _showNextQuestion(); 
            };
            
            //.addEventListener("click", _showNextQuestion(), false);
        }).catch(error => {
           console.error('spa.initModule ' + error);
        });
    };

    _showNextQuestion = function(){
        document.getElementById(configMap.questionDomId).innerHTML = spa.model.getQuestion();
    };

    //public API
    return {
        initModule: _initModule
    };
}());

/** 
 * -------------
 * MODEL 
 * -------------
*/
spa.model = (function () {
    var configMap = {
    },
    stateMap = {
        $questions: undefined
    },
    _initModule, _getQuestion, _shuffleArray;

    //returns a promise when it is ready
    _initModule = function () {
        console.log('spa.model.initModule');
        localStorage.clear();
        return spa.data.loadData().then(json => {
            //shuffle the array and store it
            stateMap.$questions = _shuffleArray(json.questions);
        });
    };

    _getQuestion = function () {
        console.log('spa.model.getQuestion');
        if(stateMap.$questions == undefined || stateMap.$questions.length == 0){
            return "Well done! You are done! :)";
        }
        return stateMap.$questions.pop().question;
    };

    _shuffleArray = function(array){
        return array.sort(() => Math.random() - 0.5);
    }

    //public API
    return {
        initModule: _initModule,
        getQuestion: _getQuestion
    };
}());

/** 
 * -------------
 * SPA DATA
 * -------------
*/

spa.data = (function () {
    var configMap = {
        endpoint: './src/questions-nl.json'
    },
    stateMap = {
        $container: undefined
    },
    initModule;

    //returns a promise when it is ready
    _initModule = function () {
        return new Promise(function(resolve, reject) {
            console.log('spa.data.initModule');
            setTimeout(resolve, 100);
          });
    };

    // load data returns a promise which contains json data
    _loadData = function () {
        console.log('spa.data.loadData');

        return fetch(configMap.endpoint).then(response => response.json())
        .then(json =>{
            //console.log(json);
            return json;
        });

    };

    //public API
    return {
        initModule: _initModule,
        loadData: _loadData
    };
}());
