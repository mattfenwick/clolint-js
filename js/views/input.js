'use strict';

function Input(button, elem, model) {
    button.click(function() {
        // TODO read these args from the UI (checkboxes)
        var args = ['indentation', 'singleform', 'specials', 'functions', 'symbols'];
        model.input(elem.val(), args);
        elem.removeClass('changed');
    });
    
    elem.on('input', function() {
        elem.addClass('changed');
    });
}

module.exports = Input;

