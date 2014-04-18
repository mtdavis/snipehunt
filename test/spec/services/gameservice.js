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

        for(var rowNum = 0; rowNum < height; rowNum++)
        {
            expect(GameService.grid[rowNum]).toBeDefined();
            expect(GameService.grid[rowNum].length).toBe(width);

            for(var colNum = 0; colNum < width; colNum++)
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
        spyOn(GameService, 'clearLights').andCallThrough();

        var height = 10;
        var width = 5;
        GameService.startNewGame(height, width, 1);

        expect(GameService.clearLights.callCount).toBe(4);

        function checkLight(light)
        {
            expect(light).toBeDefined();
            expect(light.hit).toBeDefined();
            expect(light.reflection).toBeDefined();
            expect(light.passedThrough).toBeDefined();
            expect(light.linkId).toBeDefined();
        }

        for(var colNum = 0; colNum < width; colNum++)
        {
            checkLight(GameService.lights.north[colNum]);
            checkLight(GameService.lights.south[colNum]);
        }

        for(var rowNum = 0; rowNum < height; rowNum++)
        {
            checkLight(GameService.lights.east[rowNum]);
            checkLight(GameService.lights.west[rowNum]);
        }
    });

    it("should assign the required number of snipes", function()
    {
        var height = 10;
        var width = 10;

        //empty grid.
        GameService.startNewGame(height, width, 0);

        for(var rowNum = 0; rowNum < height; rowNum++)
        {
            for(var colNum = 0; colNum < height; colNum++)
            {
                expect(GameService.grid[rowNum][colNum].snipe).toBe(false);
            }
        }

        //half-filled grid.
        GameService.startNewGame(height, width, height * width / 2);
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

        expect(assignedSnipes).toBe(height * width / 2);

        //full grid.
        GameService.startNewGame(height, width, height * width);

        for(var rowNum = 0; rowNum < height; rowNum++)
        {
            for(var colNum = 0; colNum < height; colNum++)
            {
                expect(GameService.grid[rowNum][colNum].snipe).toBe(true);
            }
        }
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
});
