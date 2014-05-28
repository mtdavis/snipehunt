"use strict";

//from http://stackoverflow.com/questions/15731634/how-do-i-handle-right-click-events-in-angular-js

angular.module("snipehuntApp").directive("ngRightClick", function($parse)
{
    return function(scope, element, attrs)
    {
        var fn = $parse(attrs.ngRightClick);
        element.bind("contextmenu", function(event)
        {
            scope.$apply(function()
            {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});
