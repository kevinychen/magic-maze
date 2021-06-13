import { Ctx } from "boardgame.io";
import { range, some } from 'lodash';
import { Clock } from "../client/clock";
import { ACTION_TILES, MALL_TILES } from "./data";
import { placeTile } from "./tiles";
import { Action, Color, GameState, Location, Wall } from "./types";

const DIRS = [{ drow: -1, dcol: 0 }, { drow: 0, dcol: 1 }, { drow: 1, dcol: 0 }, { drow: 0, dcol: -1 }];
const EXPLORE_LOCATIONS = [{ row: 0, col: 2 }, { row: 2, col: 3 }, { row: 3, col: 1 }, { row: 1, col: 0 }];
const INVALID_MOVE = "INVALID_MOVE";
const TIMER_MILLIS = 180000;

function makeMove(G: GameState, pawn: Color, pawnLocation: Location, dir: Action): Location | undefined {
    const { pawnLocations, placedTiles } = G;
    const { tileId, localRow, localCol } = pawnLocation;
    const { row, col, squares, entranceDir, exploreDirs, escalators } = placedTiles[tileId];

    if (dir === Action.ESCALATOR) {
        const escalator = escalators.find(({ startRow, startCol }) => startRow === localRow && startCol === localCol);
        return escalator === undefined
            ? undefined
            : { tileId, localRow: escalator.endRow, localCol: escalator.endCol };
    }

    // Check if currently at an exit to a neighboring tile
    const { drow, dcol } = DIRS[dir];
    if (localRow === EXPLORE_LOCATIONS[dir].row && localCol === EXPLORE_LOCATIONS[dir].col) {
        if (entranceDir !== dir && exploreDirs[dir] === undefined) {
            return undefined;
        }
        const newTileEntry = Object.entries(placedTiles)
            .find(([_id, tile]) => tile.row === row + drow && tile.col === col + dcol);
        if (newTileEntry === undefined) {
            return undefined;
        }
        const [newTileId, newTile] = newTileEntry;
        if (newTile.entranceDir !== (dir + 2) % 4 && newTile.exploreDirs[(dir + 2) % 4] === undefined) {
            return undefined;
        }
        return { tileId: newTileId, localRow: 3 - localRow, localCol: 3 - localCol };
    }

    // Otherwise, check if moving will go out of bounds
    if (localRow + drow < 0 || localRow + drow >= 4 || localCol + dcol < 0 || localCol + dcol >= 4) {
        return undefined;
    }

    // Check for wall
    const wall = squares[localRow][localCol].walls[dir];
    if (wall === Wall.FULL || (wall === Wall.ORANGE && pawn !== Color.ORANGE)) {
        return undefined;
    }

    // Check for another pawn
    const destination = { tileId: tileId, localRow: localRow + drow, localCol: localCol + dcol };
    if (some(pawnLocations, destination)) {
        return undefined;
    }

    return destination;
}

export function getPossibleDestinations(G: GameState, playerID: string, pawn: Color): Location[] {
    const { actionTiles, pawnLocations, placedTiles, vortexSystemEnabled } = G;
    const actions = actionTiles[playerID].actions;
    const possibleDestinations: Location[] = [];
    for (const action of actions) {
        let location = pawnLocations[pawn];
        if (action < Action.ESCALATOR) {
            while (true) {
                const newLocation = makeMove(G, pawn, location, action);
                if (newLocation === undefined) {
                    break;
                }
                possibleDestinations.push(newLocation);
                location = newLocation;
            }
        } else if (action === Action.ESCALATOR) {
            const newLocation = makeMove(G, pawn, location, action);
            if (newLocation !== undefined) {
                possibleDestinations.push(newLocation);
            }
        } else if (action === Action.VORTEX && vortexSystemEnabled) {
            for (const tileId in placedTiles) {
                const { squares } = placedTiles[tileId];
                for (let localRow = 0; localRow < 4; localRow++) {
                    for (let localCol = 0; localCol < 4; localCol++) {
                        const destination = { tileId, localRow, localCol };
                        if (squares[localRow][localCol].vortex === pawn
                            && !some(pawnLocations, destination)
                            && !some(possibleDestinations, destination)) {
                            possibleDestinations.push(destination);
                        }
                    }
                }
            }
        }
    }
    return possibleDestinations;
}

export function getExploreDir(G: GameState, playerID: string, pawn: Color): number | undefined {
    const { actionTiles, pawnLocations, placedTiles, unplacedMallTileIds } = G;
    if (!actionTiles[playerID].actions.includes(Action.EXPLORE)) {
        return undefined;
    }
    if (unplacedMallTileIds.length === 0) {
        return undefined;
    }
    const { tileId, localRow, localCol } = pawnLocations[pawn];
    const exploreDir = EXPLORE_LOCATIONS.findIndex(loc => loc.row === localRow && loc.col === localCol);
    if (exploreDir === -1) {
        return undefined;
    }
    const { row, col, exploreDirs } = placedTiles[tileId];
    if (exploreDirs[exploreDir] !== pawn) {
        return undefined;
    }
    const { drow, dcol } = DIRS[exploreDir];
    if (Object.values(placedTiles).some(tile => tile.row === row + drow && tile.col === col + dcol)) {
        return undefined;
    }
    return exploreDir;
}

export function getPawnsAt(G: GameState, locationType: 'weapon' | 'exit'): Color[] {
    const { pawnLocations, placedTiles } = G;
    return range(4)
        .filter(i => {
            const { tileId, localRow, localCol } = pawnLocations[i];
            const { squares } = placedTiles[tileId];
            return squares[localRow][localCol][locationType] === i;
        });
}

export const Title = "Magic Maze";

export const Game = {
    name: "magic-maze",

    setup: (ctx: Ctx): GameState => {
        const { numPlayers, random } = ctx;
        const startTileId = '1a';
        return {
            actionTiles: Object.fromEntries(random!.Shuffle(ACTION_TILES.filter(tile => tile.numPlayers.includes(numPlayers)))
                .map((tile, i) => [i, tile])),
            clock: { numMillisLeft: TIMER_MILLIS, atTime: Date.now(), frozen: true },
            pawnLocations: random!.Shuffle([[1, 1], [1, 2], [2, 1], [2, 2]])
                .map(([localRow, localCol]) => ({ tileId: startTileId, localRow, localCol })),
            placedTiles: { [startTileId]: placeTile(MALL_TILES[startTileId], 0, 0, 0) },
            unplacedMallTileIds: random!.Shuffle(range(15).filter(i => i >= 2).map(i => String(i))),
            usedObjects: [],
            vortexSystemEnabled: true,
        };
    },

    turn: {
        activePlayers: { all: '' },
    },

    moves: {
        movePawn: (G: GameState, ctx: Ctx, pawn: Color, newLocation: Location) => {
            const { clock: { numMillisLeft, atTime, frozen}, pawnLocations, placedTiles, usedObjects } = G;
            const { playerID } = ctx;
            if (playerID === undefined) {
                return INVALID_MOVE;
            }
            if (!some(getPossibleDestinations(G, playerID, pawn), newLocation)) {
                return INVALID_MOVE;
            }
            pawnLocations[pawn] = newLocation;

            const now = Date.now();
            if (frozen) {
                G.clock = { numMillisLeft, atTime: now, frozen: false };
            }
            const { tileId, localRow, localCol } = newLocation;
            const { squares } = placedTiles[tileId];
            if (squares[localRow][localCol].timer && !some(usedObjects, newLocation)) {
                const actualNumMillisLeft = numMillisLeft - (now - atTime);
                usedObjects.push(newLocation);
                G.clock = { numMillisLeft: TIMER_MILLIS - actualNumMillisLeft, atTime: now, frozen: false };
            }

            if (getPawnsAt(G, 'weapon').length === 4) {
                G.vortexSystemEnabled = false;
            }
        },
        explore: (G: GameState, ctx: Ctx, pawn: Color) => {
            const { pawnLocations, placedTiles, unplacedMallTileIds } = G;
            const { playerID } = ctx;
            if (playerID === undefined) {
                return INVALID_MOVE;
            }
            const exploreDir = getExploreDir(G, playerID, pawn);
            if (exploreDir === undefined) {
                return INVALID_MOVE;
            }
            const { row, col } = placedTiles[pawnLocations[pawn].tileId];
            const { drow, dcol } = DIRS[exploreDir];
            const newTileId = unplacedMallTileIds.pop()!;
            const entranceDir = MALL_TILES[newTileId].entranceDir!;
            placedTiles[newTileId] = placeTile(MALL_TILES[newTileId], (exploreDir - entranceDir + 6) % 4, row + drow, col + dcol);
        },
        sync: {
            move: (G: GameState) => {
                const { clock: { numMillisLeft, atTime, frozen } } = G;
                const now = Date.now();
                if (!frozen) {
                    G.clock = { numMillisLeft: numMillisLeft - (now - atTime), atTime: now, frozen };
                }
            },
            client: false,
        },
    },

    endIf: (G: GameState) => {
        const { clock: { numMillisLeft }, vortexSystemEnabled } = G;
        return numMillisLeft <= 0 || (!vortexSystemEnabled && getPawnsAt(G, 'exit').length === 4);
    },
};
