"use strict";

describe("Service: GameService", function()
{
    // load the service's module
    beforeEach(module("snipehuntApp"));

    // instantiate service
    var GameService;
    beforeEach(inject(function(_GameService_)
    {
        GameService = _GameService_;
    }));

    it("should do something", function()
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

    it("should clear a cage when setting a mark, and vice versa", function()
    {
        GameService.startNewGame(5, 5, 4);

        expect(GameService.grid[2][3].mark).toBe(false);
        expect(GameService.grid[2][3].cage).toBe(false);

        GameService.toggleCage(2, 3);

        expect(GameService.grid[2][3].mark).toBe(false);
        expect(GameService.grid[2][3].cage).toBe(true);

        GameService.toggleMark(2, 3);

        expect(GameService.grid[2][3].mark).toBe(true);
        expect(GameService.grid[2][3].cage).toBe(false);

        GameService.toggleCage(2, 3);

        expect(GameService.grid[2][3].mark).toBe(false);
        expect(GameService.grid[2][3].cage).toBe(true);
    });

    it("should count cages correctly", function()
    {
        GameService.startNewGame(5, 5, 2);

        expect(GameService.availableCages).toBe(2);

        GameService.toggleCage(1, 1);
        expect(GameService.availableCages).toBe(1);

        GameService.toggleCage(1, 1);
        expect(GameService.availableCages).toBe(2);

        GameService.toggleCage(1, 1);
        GameService.toggleCage(1, 2);
        expect(GameService.availableCages).toBe(0);

        //can't exceed the number of cages.
        GameService.toggleCage(1, 3);
        expect(GameService.availableCages).toBe(0);
        expect(GameService.grid[1][3].cage).toBe(false);

        //adding a mark (which clears a cage) behaves properly.
        GameService.toggleMark(1, 1);
        expect(GameService.availableCages).toBe(1);
    });

    it("should reveal the snipes when told to", function()
    {
        GameService.startNewGame(5, 5, 4);

        expect(GameService.snipesRevealed).toBe(false);

        GameService.revealSnipes();

        expect(GameService.snipesRevealed).toBe(true);
    });

    it("shouldn't toggle cages/marks/lights after the game is over", function()
    {
        GameService.startNewGame(5, 5, 4);

        GameService.revealSnipes();

        GameService.toggleCage(2, 3);
        expect(GameService.grid[2][3].cage).toBe(false);

        GameService.toggleMark(2, 3);
        expect(GameService.grid[2][3].mark).toBe(false);

        GameService.turnOnLight(0, 1);
        expect(GameService.grid[0][1].used).toBe(false);

    });

    it("should turn on a light when told to", function()
    {
        GameService.startNewGame(5, 5, 4);

        expect(GameService.grid[0][2].used).toBe(false);

        GameService.turnOnLight(0, 2);

        expect(GameService.grid[0][2].used).toBe(true);
    });

    it("should create a beam correctly", function()
    {
        GameService.startNewGame(5, 5, 0);

        spyOn(GameService, "resolveBeam");

        GameService.turnOnLight(0, 2);

        expect(GameService.resolveBeam).toHaveBeenCalledWith({
            sourceLight:{
                isALight:true,
                side:"north",
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
                isALight:true,
                side:"west",
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

    it("should register a reflection for a snipe on the edge", function()
    {
        //assign a snipe manually.
        var width = 5;
        var height = 5;
        var snipeRow = 1;
        var snipeCol = 1;
        GameService.startNewGame(height, width, 0);
        GameService.grid[snipeRow][snipeCol].snipe = true;

        GameService.turnOnLight(0, snipeCol + 1);
        expect(GameService.grid[0][snipeCol + 1].reflection).toBe(true);

        GameService.turnOnLight(snipeRow + 1, 0);
        expect(GameService.grid[snipeRow + 1][0].reflection).toBe(true);
    });

    it("should register a reflection when it's about to go between two snipes - horizontally", function()
    {
        //assign snipes manually.
        var width = 5;
        var height = 5;
        var beamRow = 3;
        var snipesCol = 3;
        GameService.startNewGame(height, width, 0);
        GameService.grid[beamRow - 1][snipesCol].snipe = true;
        GameService.grid[beamRow + 1][snipesCol].snipe = true;

        GameService.turnOnLight(beamRow, 0);
        expect(GameService.grid[beamRow][0].reflection).toBe(true);

        GameService.turnOnLight(beamRow, width - 1);
        expect(GameService.grid[beamRow][width - 1].reflection).toBe(true);
    });

    it("should register a reflection when it's about to go between two snipes - vertically", function()
    {
        //assign snipes manually.
        var width = 5;
        var height = 5;
        var beamCol = 3;
        var snipesRow = 3;
        GameService.startNewGame(height, width, 0);
        GameService.grid[snipesRow][beamCol - 1].snipe = true;
        GameService.grid[snipesRow][beamCol + 1].snipe = true;

        GameService.turnOnLight(0, beamCol);
        expect(GameService.grid[0][beamCol].reflection).toBe(true);

        GameService.turnOnLight(height - 1, beamCol);
        expect(GameService.grid[height - 1][beamCol].reflection).toBe(true);
    });

    it("should register passthroughs - from the north", function()
    {
        //assign 0 snipes.
        var width = 5;
        var height = 5;
        GameService.startNewGame(height, width, 0);

        //from the north.
        var expectedLinkId = GameService.availableLinkIds[0];
        GameService.turnOnLight(0, 2);
        expect(GameService.grid[0][2].passedThrough).toBe(true);
        expect(GameService.grid[height - 1][2].passedThrough).toBe(true);
        expect(GameService.grid[0][2].linkId).toBe(expectedLinkId);
        expect(GameService.grid[height - 1][2].linkId).toBe(expectedLinkId);
    });

    it("should register passthroughs - from the south", function()
    {
        //assign 0 snipes.
        var width = 5;
        var height = 5;

        GameService.startNewGame(height, width, 0);

        var expectedLinkId = GameService.availableLinkIds[0];
        GameService.turnOnLight(height - 1, 2);
        expect(GameService.grid[height - 1][2].passedThrough).toBe(true);
        expect(GameService.grid[0][2].passedThrough).toBe(true);
        expect(GameService.grid[height - 1][2].linkId).toBe(expectedLinkId);
        expect(GameService.grid[0][2].linkId).toBe(expectedLinkId);
    });

    it("should register passthroughs - from the east", function()
    {
        //assign 0 snipes.
        var width = 5;
        var height = 5;
        GameService.startNewGame(height, width, 0);

        var expectedLinkId = GameService.availableLinkIds[0];
        GameService.turnOnLight(2, width - 1);
        expect(GameService.grid[2][width - 1].passedThrough).toBe(true);
        expect(GameService.grid[2][0].passedThrough).toBe(true);
        expect(GameService.grid[2][width - 1].linkId).toBe(expectedLinkId);
        expect(GameService.grid[2][width - 1].linkId).toBe(expectedLinkId);
    });

    it("should register passthroughs - from the west", function()
    {
        //assign 0 snipes.
        var width = 5;
        var height = 5;
        GameService.startNewGame(height, width, 0);

        var expectedLinkId = GameService.availableLinkIds[0];
        GameService.turnOnLight(2, 0);
        expect(GameService.grid[2][0].passedThrough).toBe(true);
        expect(GameService.grid[2][width - 1].passedThrough).toBe(true);
        expect(GameService.grid[2][0].linkId).toBe(expectedLinkId);
        expect(GameService.grid[2][width - 1].linkId).toBe(expectedLinkId);
    });

    it("should turn the beam correctly - vertically to horizontally", function()
    {
        //assign a snipe manually.
        var width = 5;
        var height = 5;
        GameService.startNewGame(height, width, 0);
        GameService.grid[2][2].snipe = true;

        //from the north, turning west.
        var expectedLinkId = GameService.availableLinkIds[0];
        GameService.turnOnLight(0, 1);
        expect(GameService.grid[0][1].linkId).toBe(expectedLinkId);
        expect(GameService.grid[1][0].linkId).toBe(expectedLinkId);

        //from the north, turning east.
        expectedLinkId = GameService.availableLinkIds[0];
        GameService.turnOnLight(0, 3);
        expect(GameService.grid[0][3].linkId).toBe(expectedLinkId);
        expect(GameService.grid[1][4].linkId).toBe(expectedLinkId);

        //from the south, turning west.
        expectedLinkId = GameService.availableLinkIds[0];
        GameService.turnOnLight(4, 1);
        expect(GameService.grid[4][1].linkId).toBe(expectedLinkId);
        expect(GameService.grid[3][0].linkId).toBe(expectedLinkId);

        //from the south, turning east.
        expectedLinkId = GameService.availableLinkIds[0];
        GameService.turnOnLight(4, 3);
        expect(GameService.grid[4][3].linkId).toBe(expectedLinkId);
        expect(GameService.grid[3][4].linkId).toBe(expectedLinkId);
    });

    it("should turn the beam correctly - horizontally to vertically", function()
    {
        //assign a snipe manually.
        var width = 5;
        var height = 5;
        GameService.startNewGame(height, width, 0);
        GameService.grid[2][2].snipe = true;

        //from the west, turning north.
        var expectedLinkId = GameService.availableLinkIds[0];
        GameService.turnOnLight(1, 0);
        expect(GameService.grid[1][0].linkId).toBe(expectedLinkId);
        expect(GameService.grid[0][1].linkId).toBe(expectedLinkId);

        //from the west, turning south.
        expectedLinkId = GameService.availableLinkIds[0];
        GameService.turnOnLight(3, 0);
        expect(GameService.grid[3][0].linkId).toBe(expectedLinkId);
        expect(GameService.grid[4][1].linkId).toBe(expectedLinkId);

        //from the east, turning north.
        expectedLinkId = GameService.availableLinkIds[0];
        GameService.turnOnLight(1, 4);
        expect(GameService.grid[1][4].linkId).toBe(expectedLinkId);
        expect(GameService.grid[0][3].linkId).toBe(expectedLinkId);

        //from the east, turning south.
        expectedLinkId = GameService.availableLinkIds[0];
        GameService.turnOnLight(3, 4);
        expect(GameService.grid[3][4].linkId).toBe(expectedLinkId);
        expect(GameService.grid[4][3].linkId).toBe(expectedLinkId);
    });

    it("should detect whether the user won or lost", function()
    {
        GameService.startNewGame(4, 4, 4);

        GameService.revealSnipes();
        expect(GameService.caughtAll).toBe(false);

        GameService.startNewGame(4, 4, 4);
        GameService.toggleCage(1, 1);
        GameService.toggleCage(1, 2);
        GameService.toggleCage(2, 1);
        GameService.toggleCage(2, 2);

        GameService.revealSnipes();
        expect(GameService.caughtAll).toBe(true);
    });

    it("should generate tutorial information - snipe hits", function()
    {
        //assign a snipe manually.
        var width = 5;
        var height = 5;
        GameService.startNewGame(height, width, 0);
        GameService.grid[3][3].snipe = true;

        expect(GameService.grid[3][3].snipeCausedHit).toBe(false);

        GameService.turnOnLight(0, 3);

        expect(GameService.grid[1][3].beams).toEqual({"south":true});
        expect(GameService.grid[2][3].beams).toEqual({"south":true});
        expect(GameService.grid[3][3].snipeCausedHit).toBe(true);

        GameService.turnOnLight(3, 0);

        expect(GameService.grid[1][3].beams).toEqual({});
        expect(GameService.grid[2][3].beams).toEqual({});
        expect(GameService.grid[3][1].beams).toEqual({"east":true});
        expect(GameService.grid[3][2].beams).toEqual({"east":true});
        expect(GameService.grid[3][3].snipeCausedHit).toBe(true);
    });

    it("should generate tutorial information - redirection", function()
    {
        //assign a snipe manually.
        var width = 5;
        var height = 5;
        GameService.startNewGame(height, width, 0);
        GameService.grid[3][3].snipe = true;

        expect(GameService.grid[3][3].snipeCausedRedirection).toBe(false);

        GameService.turnOnLight(2, 0);

        expect(GameService.grid[2][1].beams).toEqual({"east":true});
        expect(GameService.grid[2][2].beams).toEqual({"eastToNorth":true});
        expect(GameService.grid[1][2].beams).toEqual({"north":true});
        expect(GameService.grid[3][3].snipeCausedRedirection).toBe(true);
    });

    it("should generate tutorial information - reflection", function()
    {
        //assign snipes manually.
        var width = 5;
        var height = 5;
        GameService.startNewGame(height, width, 0);
        GameService.grid[1][3].snipe = true;
        GameService.grid[3][3].snipe = true;

        expect(GameService.grid[1][3].snipeCausedReflection).toBe(false);
        expect(GameService.grid[1][3].snipeCausedReflection).toBe(false);

        GameService.turnOnLight(2, 0);

        expect(GameService.grid[2][1].beams).toEqual({"east":true, "west":true});
        expect(GameService.grid[2][2].beams).toEqual({"reflectionEastToWest":true});
        expect(GameService.grid[1][3].snipeCausedReflection).toBe(true);
        expect(GameService.grid[3][3].snipeCausedReflection).toBe(true);

        GameService.turnOnLight(0, 2);
        expect(GameService.grid[2][1].beams).toEqual({});
        expect(GameService.grid[2][2].beams).toEqual({});
        expect(GameService.grid[1][3].snipeCausedReflection).toBe(true);
        expect(GameService.grid[3][2].snipeCausedReflection).toBe(false);

        GameService.turnOnLight(2, 4);
        expect(GameService.grid[1][3].snipeCausedReflection).toBe(true);
        expect(GameService.grid[3][3].snipeCausedReflection).toBe(true);
    });
});
