'use strict';

describe('Service: GameService', function()
{
    // load the service's module
    beforeEach(module('snipehuntApp'));

    // instantiate service
    var GameService;
    beforeEach(inject(function(_GameService_)
    {
        GameService = _GameService_;
    }));

    it('should do something', function()
    {
        expect(!!GameService).toBe(true);
    });

    it("should create a grid of the required size", function()
    {
        var height = 10;
        var width = 5;
        GameService.startNewGame(height, width, 1);

        expect(GameService.grid).toBeDefined();
        expect(GameService.grid.length).toBe(height);

        for(var rowNum = 1; rowNum < height - 1; rowNum++)
        {
            expect(GameService.grid[rowNum]).toBeDefined();
            expect(GameService.grid[rowNum].length).toBe(width);

            for(var colNum = 1; colNum < width - 1; colNum++)
            {
                expect(GameService.grid[rowNum][colNum]).toBeDefined();

                expect(GameService.grid[rowNum][colNum].snipe).toBeDefined();
                expect(GameService.grid[rowNum][colNum].cage).toBeDefined();
                expect(GameService.grid[rowNum][colNum].mark).toBeDefined();
            }
        }
    });

    it("should create the required lamps", function()
    {
        var height = 10;
        var width = 5;
        GameService.startNewGame(height, width, 1);

        function checkLight(light)
        {
            expect(light).toBeDefined();
            expect(light.hit).toBeDefined();
            expect(light.reflection).toBeDefined();
            expect(light.passedThrough).toBeDefined();
            expect(light.linkId).toBeDefined();
        }

        for(var colNum = 1; colNum < width - 1; colNum++)
        {
            checkLight(GameService.grid[0][colNum]);
            checkLight(GameService.grid[height - 1][colNum]);
        }

        for(var rowNum = 1; rowNum < height - 1; rowNum++)
        {
            checkLight(GameService.grid[rowNum][0]);
            checkLight(GameService.grid[rowNum][width - 1]);
        }
    });

    it("should assign the required number of snipes", function()
    {
        var height = 12;
        var width = 12;

        function countSnipes()
        {
            var assignedSnipes = 0;
            for(var rowNum = 0; rowNum < height; rowNum++)
            {
                for(var colNum = 0; colNum < height; colNum++)
                {
                    if(GameService.grid[rowNum][colNum].snipe)
                    {
                        assignedSnipes++;
                    }
                }
            }
            return assignedSnipes;
        }

        //empty grid.
        GameService.startNewGame(height, width, 0);
        expect(countSnipes()).toBe(0);

        //half-filled grid.
        GameService.startNewGame(height, width, 50);
        expect(countSnipes()).toBe(50);

        //full grid.
        GameService.startNewGame(height, width, 100);
        expect(countSnipes()).toBe(100);
    });

    it("should toggle a cage when told to", function()
    {
        GameService.startNewGame(5, 5, 4);

        expect(GameService.grid[2][3].cage).toBe(false);

        GameService.toggleCage(2, 3);

        expect(GameService.grid[2][3].cage).toBe(true);

        GameService.toggleCage(2, 3);

        expect(GameService.grid[2][3].cage).toBe(false);
    });

    it("should toggle a mark when told to", function()
    {
        GameService.startNewGame(5, 5, 4);

        expect(GameService.grid[2][3].mark).toBe(false);

        GameService.toggleMark(2, 3);

        expect(GameService.grid[2][3].mark).toBe(true);

        GameService.toggleMark(2, 3);

        expect(GameService.grid[2][3].mark).toBe(false);
    });

    it("should reveal the snipes when told to", function()
    {
        GameService.startNewGame(5, 5, 4);

        expect(GameService.snipesVisible).toBe(false);

        GameService.revealSnipes();

        expect(GameService.snipesVisible).toBe(true);
    });

    it("should turn on a light when told to", function()
    {
        GameService.startNewGame(5, 5, 4);

        expect(GameService.grid[0][2].used).toBe(false);

        GameService.turnOnLight(0, 2)

        expect(GameService.grid[0][2].used).toBe(true);
    });

    it("should create a beam correctly", function()
    {
        GameService.startNewGame(5, 5, 0);

        spyOn(GameService, "resolveBeam");

        GameService.turnOnLight(0, 2);

        expect(GameService.resolveBeam).toHaveBeenCalledWith({
            sourceLight:{
                used:true,
                hit:false,
                reflection:false,
                passedThrough:false,
                linkId:0
            },
            horizontalDirection:0,
            verticalDirection:1,
            rowNum: 0,
            colNum: 2
        });

        GameService.turnOnLight(1, 0);

        expect(GameService.resolveBeam).toHaveBeenCalledWith({
            sourceLight:{
                used:true,
                hit:false,
                reflection:false,
                passedThrough:false,
                linkId:0
            },
            horizontalDirection:1,
            verticalDirection:0,
            rowNum: 1,
            colNum: 0
        });
    });

    it("should register a snipe hit from all four directions", function()
    {
        //assign a snipe manually.
        var width = 5;
        var height = 4;
        var snipeRow = 1;
        var snipeCol = 2;
        GameService.startNewGame(height, width, 0);
        GameService.grid[snipeRow][snipeCol].snipe = true;

        for(var colNum = 1; colNum < width - 1; colNum++)
        {
            GameService.turnOnLight(0, colNum);
            expect(GameService.grid[0][colNum].hit).toBe(colNum === snipeCol);

            GameService.turnOnLight(height - 1, colNum);
            expect(GameService.grid[height - 1][colNum].hit).toBe(colNum === snipeCol);
        }

        for(var rowNum = 1; rowNum < height - 1; rowNum++)
        {
            GameService.turnOnLight(rowNum, width - 1);
            expect(GameService.grid[rowNum][width - 1].hit).toBe(rowNum === snipeRow);

            GameService.turnOnLight(rowNum, 0);
            expect(GameService.grid[rowNum][0].hit).toBe(rowNum === snipeRow);
        }
    });
});
