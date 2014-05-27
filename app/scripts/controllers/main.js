'use strict';

angular.module('snipehuntApp')
    .controller('MainCtrl', function(GameService)
    {
        this.startNewGame = function()
        {
            GameService.startNewGame(8, 8, 5);
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

        this.isFreshGame = function()
        {
            return GameService.freshGame;
        };

        this.isTutorialMode = function()
        {
            return GameService.tutorialMode;
        };

        this.toggleTutorialMode = function()
        {
            GameService.toggleTutorialMode();
        };

        this.getMessage = function()
        {
            return GameService.message;
        };

        this.getAvailableCages = function()
        {
            return GameService.availableCages;
        };

        this.toggleCage = function(rowNum, colNum)
        {
            GameService.toggleCage(rowNum, colNum);
        };

        this.toggleMark = function(rowNum, colNum)
        {
            GameService.toggleMark(rowNum, colNum);
        };

        this.turnOnLight = function(rowNum, colNum)
        {
            GameService.turnOnLight(rowNum, colNum);
        };

        this.startNewGame();
    });
