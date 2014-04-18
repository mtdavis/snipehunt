'use strict';

angular.module('snipehuntApp')
    .service('GameService', function GameService()
    {
        this.startNewGame = function(height, width, snipes)
        {
            this.snipesVisible = false;

            //create the grid.
            this.grid = [];

            for(var rowNum = 0; rowNum < height; rowNum++)
            {
                var row = [];

                for(var colNum = 0; colNum < width; colNum++)
                {
                    row.push({
                        snipe:false,
                        cage:false,
                        mark:false
                    });
                }

                this.grid.push(row);
            }

            //create the lights.
            this.lights = {};
            this.clearLights("north", width);
            this.clearLights("east", height);
            this.clearLights("south", width);
            this.clearLights("west", height);

            //assign the snipes to random locations in the grid.
            var assignedSnipes = 0;
            while(assignedSnipes < snipes)
            {
                var row = Math.floor(Math.random() * height);
                var colNum = Math.floor(Math.random() * width);

                if(!this.grid[row][colNum].snipe)
                {
                    this.grid[row][colNum].snipe = true;
                    assignedSnipes++;
                }
            }
        };

        this.clearLights = function(side, numLights)
        {
            this.lights[side] = [];

            for(var i = 0; i < numLights; i++)
            {
                this.lights[side].push({
                    hit:false,
                    reflection:false,
                    passedThrough:false,
                    linkId:0
                });
            }
        };

        this.turnOnLight = function(side, colNum)
        {

        };

        this.toggleCage = function(rowNum, colNum)
        {
            this.grid[rowNum][colNum].cage = !this.grid[rowNum][colNum].cage;
        };

        this.toggleMark = function(rowNum, colNum)
        {
            this.grid[rowNum][colNum].mark = !this.grid[rowNum][colNum].mark;
        };

        this.revealSnipes = function()
        {
            this.snipesVisible = true;
        };

        this.getLights = function(side)
        {

        };
    });
