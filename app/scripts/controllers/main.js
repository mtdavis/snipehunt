'use strict';

angular.module('snipehuntApp')
    .controller('MainCtrl', function(GameService)
    {
        this.startNewGame = function()
        {
            GameService.startNewGame(5, 5, 4);
        };

        this.revealSnipes = function()
        {
            GameService.revealSnipes();
        };
    });
