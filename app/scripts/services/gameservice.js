'use strict';

angular.module('snipehuntApp')
    .service('GameService', function GameService()
    {
        this.startNewGame = function(height, width, snipes)
        {
            this.gridHeight = height;
            this.gridWidth = width;
            this.snipesVisible = false;

            //create the grid.
            this.grid = [];

            var northRow = 0;
            var southRow = height - 1;
            var westCol = 0;
            var eastCol = width - 1;

            for(var rowNum = 0; rowNum < height; rowNum++)
            {
                var row = [];

                for(var colNum = 0; colNum < width; colNum++)
                {
                    if(westCol < colNum && colNum < eastCol)
                    {
                        if(rowNum === northRow || rowNum === southRow)
                        {
                            row.push(this.makeLight());
                        }
                        else
                        {
                            row.push({
                                snipe:false,
                                cage:false,
                                mark:false
                            });
                        }
                    }
                    else if(northRow < rowNum && rowNum < southRow)
                    {
                        row.push(this.makeLight());
                    }
                    else
                    {
                        row.push({empty:true});
                    }
                }

                this.grid.push(row);
            }

            //assign the snipes to random locations in the grid.
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
        };

        this.makeLight = function()
        {
            return {
                used:false,
                hit:false,
                reflection:false,
                passedThrough:false,
                linkId:0
            };
        };

        this.turnOnLight = function(rowNum, colNum)
        {
            var light = this.grid[rowNum][colNum];
            if(!light.used)
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

                this.resolveBeam(beam);
            }
        };

        this.resolveBeam = function(beam)
        {
            while(true)
            {
                try
                {
                    var nextCell = this.grid[beam.rowNum + beam.verticalDirection][beam.colNum + beam.horizontalDirection];

                    if(nextCell.snipe)
                    {
                        beam.sourceLight.hit = true;
                        break;
                    }
                    else if(beam.rowNum === 0 || beam.rowNum === this.gridHeight - 1)
                    {
                        //currently outside the grid, check for a snipe to the immediate left/right.
                        var nextLeftCell = this.grid[beam.rowNum + beam.verticalDirection][beam.colNum - 1];
                        var nextRightCell = this.grid[beam.rowNum + beam.verticalDirection][beam.colNum + 1];

                        if(nextLeftCell.snipe || nextRightCell.snipe)
                        {
                            beam.sourceLight.reflection = true;
                            break;
                        }
                        else
                        {
                            beam.rowNum += beam.verticalDirection;
                            beam.colNum += beam.horizontalDirection;
                        }
                    }
                    else if(beam.colNum === 0 || beam.colNum === this.gridWidth - 1)
                    {
                        //currently outside the grid, check for a snipe to the immediate left/right.
                        var nextTopCell = this.grid[beam.rowNum - 1][beam.colNum + beam.horizontalDirection];
                        var nextBottomCell = this.grid[beam.rowNum + 1][beam.colNum + beam.horizontalDirection];

                        if(nextTopCell.snipe || nextBottomCell.snipe)
                        {
                            beam.sourceLight.reflection = true;
                            break;
                        }
                        else
                        {
                            beam.rowNum += beam.verticalDirection;
                            beam.colNum += beam.horizontalDirection;
                        }
                    }
                    else
                    {
                        beam.rowNum += beam.verticalDirection;
                        beam.colNum += beam.horizontalDirection;
                    }
                }
                catch(ex)
                {
                    //this is temporary.  should be gone in the final logic.
                    break;
                }
            }
        };

        this.toggleCage = function(rowNum, colNum)
        {
            if(!this.snipesVisible)
            {
                var cell = this.grid[rowNum][colNum];
                cell.cage = !cell.cage;

                if(cell.cage)
                {
                    cell.mark = false;
                }
            }
        };

        this.toggleMark = function(rowNum, colNum)
        {
            if(!this.snipesVisible)
            {
                var cell = this.grid[rowNum][colNum];
                cell.mark = !cell.mark;

                if(cell.mark)
                {
                    cell.cage = false;
                }
            }
        };

        this.revealSnipes = function()
        {
            this.snipesVisible = true;
        };
    });
