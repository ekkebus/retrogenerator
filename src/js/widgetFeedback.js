/* eslint-disable no-undef */
/** 
 * -------------
 * Feedback widget
 * -------------
*/
widget = (() => {
    return{
    }
})();

widget.feedback = (() => {
    var configMap = {
        htmlWidgetContainer: () =>
            `<div id="feedback-container"></div>`,
        htmlTemplate: (title, message) =>
            `<div id="feedback-widget">
                <button id="feedback-close-button"><span>✕</span></button>
                <strong class='title'>${title}</strong><span class='message'>${message}</span>
            </div>`
    },
        stateMap = {
            $container: undefined
        },
        _initModule, _showMessage, _closeMessage;

    _initModule = ($container) => {
        stateMap.$container = document.getElementById($container);
        stateMap.$container.innerHTML = configMap.htmlWidgetContainer();
        //set the new container for this widget
        stateMap.$container = stateMap.$container.querySelector('#feedback-container');
    }

    _showMessage = (title, message, type) => {
        var element = document.getElementById('feedback-container');
        switch (type) {
            case 2:
                element.classList.add('alert-succes');
                break;
            case 3:
                element.classList.add('alert-warning');
                break;
            case 4:
                element.classList.add('alert-danger');
                break;
            default:
                element.classList.add('alert-info');
        }
        //append to the container
        stateMap.$container.innerHTML = configMap.htmlTemplate(title, message);
        //add event listener
        stateMap.$container.querySelector('#feedback-close-button').onclick = (event) => {
            event.stopPropagation();
            _closeMessage();
        };
    }

    _closeMessage = () => {
        stateMap.$container.className = '';
        stateMap.$container.removeEventListener('click',() => {});
        //remove from the DOM
        let container = stateMap.$container;
        while(container.hasChildNodes()){
            container.removeChild(container.firstChild);
        }
    }

    //public API
    return {
        initModule: _initModule,
        showMessage: _showMessage
    };
})();