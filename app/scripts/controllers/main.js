'use strict';

angular.module('snipehuntApp')
    .controller('MainCtrl', function(GameService)
    {
        this.startNewGame = function()
        {
            GameService.startNewGame(7, 7, 4);
        };

        this.revealSnipes = function()
        {
            GameService.revealSnipes();
        };

        this.getGrid = function()
        {
            return GameService.grid;
        };

        this.getSnipesVisible = function()
        {
            return GameService.snipesVisible;
        };

        this.toggleCage = function(rowNum, colNum)
        {
            GameService.toggleCage(rowNum, colNum);
        };

        this.toggleMark = function(rowNum, colNum)
        {
            GameService.toggleMark(rowNum, colNum);
        };
    });
