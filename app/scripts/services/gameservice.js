'use strict';

angular.module('snipehuntApp')
    .service('GameService', function GameService()
    {
        this.gridHeight = 0;
        this.gridWidth = 0;
        this.snipesVisible = false;
        this.tutorialMode = false;
        this.freshGame = false;
        this.message = "";
        this.caughtAll = false;
        this.grid = [];
        this.availableLinkIds = [];
        this.availableCages = 0;

        this.startNewGame = function(height, width, snipes)
        {
            this.gridHeight = height;
            this.gridWidth = width;
            this.snipesVisible = false;
            this.freshGame = true;
            this.message = "Started new game.";
            this.caughtAll = false;

            //create the grid.
            this.grid = [];

            for(var rowNum = 0; rowNum < height; rowNum++)
            {
                this.grid.push([]);
            }

            var northRow = 0;
            var southRow = height - 1;
            var westCol = 0;
            var eastCol = width - 1;

            //add the lights for the north and south rows.
            for(var col = 1; col < eastCol; col++)
            {
                this.grid[northRow][col] = this.makeLight();
                this.grid[southRow][col] = this.makeLight();
            }

            //add the lights for the west and east columns.
            for(var row = 1; row < southRow; row++)
            {
                this.grid[row][westCol] = this.makeLight();
                this.grid[row][eastCol] = this.makeLight();
            }

            //add the field cells in the middle.
            for(var row = 1; row < southRow; row++)
            {
                for(var col = 1; col < eastCol; col++)
                {
                    this.grid[row][col] = {
                        isAField:true,
                        snipe:false,
                        cage:false,
                        mark:false,
                        beams:{},
                        snipeCausedHit:false,
                        snipeCausedRedirection:false,
                        snipeCausedReflection:false
                    };
                }
            }

            //add the empty cells in the corners.
            this.grid[northRow][westCol] = {isEmpty:true};
            this.grid[northRow][eastCol] = {isEmpty:true};
            this.grid[southRow][westCol] = {isEmpty:true};
            this.grid[southRow][eastCol] = {isEmpty:true};

            //assign the snipes to random locations in the field.
            var assignedSnipes = 0;
            while(assignedSnipes < snipes)
            {
                var rowNum = Math.floor(Math.random() * (height - 2)) + 1;
                var colNum = Math.floor(Math.random() * (width - 2)) + 1;

                if(!this.grid[rowNum][colNum].snipe)
                {
                    this.grid[rowNum][colNum].snipe = true;
                    assignedSnipes++;
                }
            }

            //generate the shuffled link IDs.
            this.availableLinkIds = [];
            for(var i = 1; i <= 26; i++)
            {
                this.availableLinkIds.push(i);
            }
            shuffle(this.availableLinkIds);

            this.availableCages = snipes;
        };

        //from http://stackoverflow.com/a/6274398
        function shuffle(array)
        {
            var counter = array.length, temp, index;

            // While there are elements in the array
            while (counter > 0) {
                // Pick a random index
                index = Math.floor(Math.random() * counter);

                // Decrease counter by 1
                counter--;

                // And swap the last element with it
                temp = array[counter];
                array[counter] = array[index];
                array[index] = temp;
            }

            return array;
        }

        this.makeLight = function()
        {
            return {
                isALight:true,
                used:false,
                hit:false,
                reflection:false,
                passedThrough:false,
                linkId:0
            };
        };

        this.turnOnLight = function(rowNum, colNum)
        {
            this.freshGame = false;

            var light = this.grid[rowNum][colNum];
            if(!light.used && !this.snipesVisible)
            {
                light.used = true;

                var beam = {};

                beam.sourceLight = light;
                beam.rowNum = rowNum;
                beam.colNum = colNum;

                if(rowNum === 0)
                {
                    //north side.
                    beam.horizontalDirection = 0;
                    beam.verticalDirection = 1;
                }
                else if(colNum === this.gridWidth - 1)
                {
                    //east side.
                    beam.horizontalDirection = -1;
                    beam.verticalDirection = 0;
                }
                else if(rowNum === this.gridHeight - 1)
                {
                    //south side.
                    beam.horizontalDirection = 0;
                    beam.verticalDirection = -1;
                }
                else if(colNum === 0)
                {
                    //west side.
                    beam.horizontalDirection = 1;
                    beam.verticalDirection = 0;
                }

                this.clearTutorialInfo();

                this.resolveBeam(beam);

                if(light.hit)
                {
                    this.message = "Hit a snipe!";
                }
                else if(light.passedThrough)
                {
                    this.message = "Passed through."
                }
                else if(light.reflection)
                {
                    this.message = "Reflected!"
                }
            }
        };

        this.clearTutorialInfo = function()
        {
            for(var row = 1; row < this.gridHeight - 1; row++)
            {
                for(var col = 1; col < this.gridWidth - 1; col++)
                {
                    var cell = this.grid[row][col];
                    cell.beams = {};
                    cell.snipeCausedHit = false;
                    cell.snipeCausedReflection = false;
                    cell.snipeCausedRedirection = false;
                }
            }
        };

        this.resolveBeam = function(beam)
        {
            var resolved = false;

            while(!resolved)
            {
                var currentCell = this.grid[beam.rowNum][beam.colNum];
                var nextCell = this.grid[beam.rowNum + beam.verticalDirection][beam.colNum + beam.horizontalDirection];

                if(nextCell.snipe)
                {
                    beam.sourceLight.hit = true;
                    nextCell.snipeCausedHit = true;
                    resolved = true;

                    if(currentCell.isAField)
                    {
                        if(beam.horizontalDirection !== 0)
                        {
                            currentCell.beams[beam.horizontalDirection === 1 ? "east" : "west"] = true;
                        }
                        else if(beam.verticalDirection !== 0)
                        {
                            currentCell.beams[beam.verticalDirection === 1 ? "south" : "north"] = true;
                        }
                    }
                }
                else if(beam.horizontalDirection !== 0)
                {
                    resolved = this.iterateBeamMovingHorizontally(beam);
                }
                else if(beam.verticalDirection !== 0)
                {
                    resolved = this.iterateBeamMovingVertically(beam);
                }

                if(!resolved)
                {
                    var currentCell = this.grid[beam.rowNum][beam.colNum];

                    if(currentCell.isALight)
                    {
                        if(currentCell === beam.sourceLight)
                        {
                            beam.sourceLight.reflection = true;
                        }
                        else
                        {
                            this.registerPassthrough(beam.sourceLight, currentCell);
                        }

                        resolved = true;
                    }
                }
            }
        };

        this.iterateBeamMovingHorizontally = function(beam)
        {
            var resolved = false;
            var currentCell = this.grid[beam.rowNum][beam.colNum];
            var nextTopCell = this.grid[beam.rowNum - 1][beam.colNum + beam.horizontalDirection];
            var nextCell = this.grid[beam.rowNum][beam.colNum + beam.horizontalDirection];
            var nextBottomCell = this.grid[beam.rowNum + 1][beam.colNum + beam.horizontalDirection];

            if((beam.colNum === 0 || beam.colNum === this.gridWidth - 1) &&
                (nextTopCell.snipe || nextBottomCell.snipe))
            {
                //currently outside the grid on the east or west,
                //with a snipe immediately above/below the next cell.
                beam.sourceLight.reflection = true;
                resolved = true;

                if(nextTopCell.snipe)
                {
                    nextTopCell.snipeCausedReflection = true;
                }
                
                if(nextBottomCell.snipe)
                {
                    nextBottomCell.snipeCausedReflection = true;
                }
            }
            else if(nextTopCell.snipe && nextBottomCell.snipe)
            {
                currentCell.beams["reflection" + (beam.horizontalDirection === 1 ? "EastToWest" : "WestToEast")] = true;
                nextTopCell.snipeCausedReflection = true;
                nextBottomCell.snipeCausedReflection = true;
                beam.horizontalDirection = -beam.horizontalDirection;
                beam.colNum += beam.horizontalDirection;
            }
            else if(nextTopCell.snipe)
            {
                nextTopCell.snipeCausedRedirection = true;
                currentCell.beams[(beam.horizontalDirection === 1 ? "east" : "west") + "ToSouth"] = true;

                //turn south.
                beam.horizontalDirection = 0;
                beam.verticalDirection = 1;
                beam.rowNum += beam.verticalDirection;
            }
            else if(nextBottomCell.snipe)
            {
                nextBottomCell.snipeCausedRedirection = true;
                currentCell.beams[(beam.horizontalDirection === 1 ? "east" : "west") + "ToNorth"] = true;

                //turn north.
                beam.horizontalDirection = 0;
                beam.verticalDirection = -1;
                beam.rowNum += beam.verticalDirection;
            }
            else
            {
                if(currentCell.isAField)
                {
                    currentCell.beams[beam.horizontalDirection === 1 ? "east" : "west"] = true;
                }

                beam.colNum += beam.horizontalDirection;
            }

            return resolved;
        };

        this.iterateBeamMovingVertically = function(beam)
        {
            var resolved = false;
            var currentCell = this.grid[beam.rowNum][beam.colNum];
            var nextLeftCell = this.grid[beam.rowNum + beam.verticalDirection][beam.colNum - 1];
            var nextCell = this.grid[beam.rowNum + beam.verticalDirection][beam.colNum];
            var nextRightCell = this.grid[beam.rowNum + beam.verticalDirection][beam.colNum + 1];

            if((beam.rowNum === 0 || beam.rowNum === this.gridHeight - 1) &&
                (nextLeftCell.snipe || nextRightCell.snipe))
            {
                //currently outside the grid on the north or south,
                //with a snipe immediately left/right to the next cell.
                beam.sourceLight.reflection = true;
                resolved = true;

                if(nextLeftCell.snipe)
                {
                    nextLeftCell.snipeCausedReflection = true;
                }

                if(nextRightCell.snipe)
                {
                    nextRightCell.snipeCausedReflection = true;
                }
            }
            else if(nextLeftCell.snipe && nextRightCell.snipe)
            {
                currentCell.beams["reflection" + (beam.verticalDirection === 1 ? "SouthToNorth" : "NorthToSouth")] = true;
                nextLeftCell.snipeCausedReflection = true;
                nextRightCell.snipeCausedReflection = true;

                beam.verticalDirection = -beam.verticalDirection;
                beam.rowNum += beam.verticalDirection;
            }
            else if(nextLeftCell.snipe)
            {
                nextLeftCell.snipeCausedRedirection = true;
                currentCell.beams[(beam.verticalDirection === 1 ? "south" : "north") + "ToEast"] = true;

                //turn east.
                beam.horizontalDirection = 1;
                beam.verticalDirection = 0;
                beam.colNum += beam.horizontalDirection;
            }
            else if(nextRightCell.snipe)
            {
                nextRightCell.snipeCausedRedirection = true;
                currentCell.beams[(beam.verticalDirection === 1 ? "south" : "north") + "ToWest"] = true;

                //turn west.
                beam.horizontalDirection = -1;
                beam.verticalDirection = 0;
                beam.colNum += beam.horizontalDirection;
            }
            else
            {
                if(currentCell.isAField)
                {
                    currentCell.beams[beam.verticalDirection === 1 ? "south" : "north"] = true;
                }

                beam.rowNum += beam.verticalDirection;
            }

            return resolved;
        };

        this.registerPassthrough = function(firstLight, secondLight)
        {
            var linkId = this.availableLinkIds[0];
            this.availableLinkIds.splice(0, 1); //remove zero-th element

            firstLight.used = true;
            secondLight.used = true;
            firstLight.passedThrough = true;
            secondLight.passedThrough = true;
            firstLight.linkId = linkId;
            secondLight.linkId = linkId;
        };

        this.toggleCage = function(rowNum, colNum)
        {
            this.freshGame = false;

            if(!this.snipesVisible)
            {
                var cell = this.grid[rowNum][colNum];
                if(cell.cage)
                {
                    this.availableCages++;
                    cell.cage = false;
                }
                else if(!cell.cage && this.availableCages > 0)
                {
                    this.availableCages--;
                    cell.cage = true;
                    cell.mark = false;
                }
            }
        };

        this.toggleMark = function(rowNum, colNum)
        {
            this.freshGame = false;

            if(!this.snipesVisible)
            {
                var cell = this.grid[rowNum][colNum];
                cell.mark = !cell.mark;

                if(cell.mark && cell.cage)
                {
                    cell.cage = false;
                    this.availableCages++;
                }
            }
        };

        this.revealSnipes = function()
        {
            this.freshGame = false;
            this.snipesVisible = true;

            this.caughtAll = true;
            for(var row = 1; row < this.gridHeight - 1; row++)
            {
                for(var col = 1; col < this.gridWidth - 1; col++)
                {
                    var cell = this.grid[row][col];
                    if(cell.snipe)
                    {
                        this.caughtAll = this.caughtAll && cell.cage;
                    }
                }
            }

            if(this.caughtAll)
            {
                this.message = "Congratulations!";
            }
            else
            {
                this.message = "Better luck next time!";
            }
        };

        this.toggleTutorialMode = function()
        {
            this.tutorialMode = !this.tutorialMode;
        };
    });
