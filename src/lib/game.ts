import { Ctx } from "boardgame.io";
import { intersectionWith, isEqual, range, some } from 'lodash';
import { ACTION_TILES, MALL_TILES, SCENARIOS } from "./data";
import { placeTile } from "./tiles";
import { Action, Color, GameConfig, GameState, Location, Square, TilePlacement, Wall } from "./types";

const DIRS = [{ drow: -1, dcol: 0 }, { drow: 0, dcol: 1 }, { drow: 1, dcol: 0 }, { drow: 0, dcol: -1 }];
const EXPLORE_LOCATIONS = [{ row: 0, col: 2 }, { row: 2, col: 3 }, { row: 3, col: 1 }, { row: 1, col: 0 }];
const INVALID_MOVE = "INVALID_MOVE";
const TIMER_MILLIS = 180000;
const MAX_CRYSTAL_BALL_USES = 2;

function setup(ctx: Ctx, config: GameConfig): GameState {
    const { numPlayers, random } = ctx;
    const { startTileId, topMallTileIds, remainingMallTileIds } = config;
    return {
        actionTiles: Object.fromEntries(random!.Shuffle(ACTION_TILES.filter(tile => tile.numPlayers.includes(numPlayers)))
            .map((tile, i) => [i, tile])),
        clock: { numMillisLeft: TIMER_MILLIS, atTime: Date.now(), frozen: true },
        config,
        explorableAreas: [],
        numCrystalBallUses: 0,
        pawnLocations: random!.Shuffle([[1, 1], [1, 2], [2, 1], [2, 2]])
            .map(([localRow, localCol]) => ({ tileId: startTileId, localRow, localCol })),
        placedTiles: { [startTileId]: placeTile(MALL_TILES[startTileId], { row: 0, col: 0, dir: 0 }) },
        unplacedMallTileIds: [...random!.Shuffle(remainingMallTileIds), ...(topMallTileIds || [])],
        usedObjects: [],
        vortexSystemEnabled: true,
    };
}

export function getSquare(G: GameState, pawn: Color): Square {
    const { pawnLocations, placedTiles } = G;
    const { tileId, localRow, localCol } = pawnLocations[pawn];
    return placedTiles[tileId].squares[localRow][localCol];
}

export function atExit(G: GameState, pawn: Color, square?: Square): boolean {
    const { config: { remainingMallTileIds } } = G;
    const { exit } = square === undefined ? getSquare(G, pawn) : square;
    const allUsePurpleExit = remainingMallTileIds.every(tileId => parseInt(tileId) <= 9);
    return exit === pawn || (exit !== undefined && allUsePurpleExit === true);
}

function makeMove(G: GameState, pawn: Color, pawnLocation: Location, dir: Action): Location | undefined {
    const { pawnLocations, placedTiles } = G;
    const { tileId, localRow, localCol } = pawnLocation;
    const { row, col, squares, entranceDir, exploreDirs, escalators } = placedTiles[tileId];

    if (dir === Action.ESCALATOR) {
        const escalator = escalators.find(({ startRow, startCol }) => startRow === localRow && startCol === localCol);
        if (escalator === undefined) {
            return undefined;
        }
        const destination = { tileId, localRow: escalator.endRow, localCol: escalator.endCol };
        if (some(pawnLocations, destination)) {
            return undefined;
        }
        return destination;
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

    // Can't move if already at exit
    if (atExit(G, pawn)) {
        return undefined;
    }

    // Check for another pawn
    const destination = { tileId: tileId, localRow: localRow + drow, localCol: localCol + dcol };
    if (some(pawnLocations, destination) && !atExit(G, pawn, squares[localRow + drow][localCol + dcol])) {
        return undefined;
    }

    return destination;
}

export function getPossibleDestinations(G: GameState, playerID: string | null | undefined, pawn: Color): Location[] {
    const { actionTiles, pawnLocations, placedTiles, vortexSystemEnabled } = G;
    const possibleDestinations: Location[] = [];
    if (playerID !== undefined && playerID !== null) {
        const actions = actionTiles[playerID].actions;
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
    }
    return possibleDestinations;
}

export function getExplorableAreas(G: GameState): TilePlacement[] {
    const { numCrystalBallUses, pawnLocations, placedTiles, unplacedMallTileIds } = G;
    const explorableAreas: TilePlacement[] = [];
    if (unplacedMallTileIds.length > 0) {
        const [newTileId] = unplacedMallTileIds.slice(-1);
        for (const [tileId, { row, col, exploreDirs }] of Object.entries(placedTiles)) {
            for (let dir = 0; dir < 4; dir++) {
                const { drow, dcol } = DIRS[dir];
                const explorePawn = exploreDirs[dir];
                if (explorePawn === undefined) {
                    continue;
                }
                const { row: localRow, col: localCol } = EXPLORE_LOCATIONS[dir];
                if ((isEqual(pawnLocations[explorePawn], { tileId, localRow, localCol }) || numCrystalBallUses >= 1)
                    && !Object.values(placedTiles).some(tile => tile.row === row + drow && tile.col === col + dcol)) {
                    explorableAreas.push({ row: row + drow, col: col + dcol, dir: (dir - MALL_TILES[newTileId].entranceDir! + 6) % 4 });
                }
            }
        }
    }
    return explorableAreas;
}

export function canExplore({ actionTiles }: GameState, playerID: string | null | undefined): boolean {
    return playerID !== undefined && playerID !== null && actionTiles[playerID].actions.includes(Action.EXPLORE);
}

export const Name = "magic-maze";
export const MinPlayers = 2;
export const MaxPlayers = 8;

export const Game = {
    name: Name,

    setup: (ctx: Ctx) => setup(ctx, SCENARIOS[1]),

    turn: {
        activePlayers: { all: '' },
    },

    phases: {
        setConfig: {
            moves: {
                setGameConfig: (G: GameState, _ctx: Ctx, newConfig: GameConfig) => {
                    G.config = newConfig;
                },
                updateGameConfig: (G: GameState, _ctx: Ctx, update: Partial<GameConfig>) => {
                    G.config = {
                        ...G.config,
                        ...update,
                    };
                },
                sync: () => {},
            },
            onEnd: (G: GameState, ctx: Ctx) => setup(ctx, G.config),
            start: true,
            next: 'play',
        },

        play: {
            endIf: (G: GameState) => {
                const { clock: { numMillisLeft }, vortexSystemEnabled } = G;
                return numMillisLeft <= 0 || (!vortexSystemEnabled && range(4).every(i => atExit(G, i)));
            },
            onEnd: (G: GameState) => {
                const { clock: { numMillisLeft }, config } = G;
                const { scenario } = config;
                G.clock.frozen = true;
                G.config = numMillisLeft > 0 && some(SCENARIOS, config) && scenario + 1 < SCENARIOS.length
                    ? SCENARIOS[scenario + 1]
                    : config;
            },
            next: 'setConfig',
        },
    },

    moves: {
        movePawn: (G: GameState, ctx: Ctx, pawn: Color, newLocation: Location) => {
            const {
                actionTiles,
                clock: { numMillisLeft, atTime, frozen},
                config: { skipPassingActions },
                explorableAreas,
                numCrystalBallUses,
                pawnLocations,
                placedTiles,
                usedObjects,
            } = G;
            const { numPlayers, playerID } = ctx;
            if (!some(getPossibleDestinations(G, playerID, pawn), newLocation)) {
                return INVALID_MOVE;
            }

            if (getSquare(G, pawn).crystal === pawn && !some(usedObjects, pawnLocations[pawn])) {
                if (numCrystalBallUses < MAX_CRYSTAL_BALL_USES) {
                    usedObjects.push(pawnLocations[pawn]);
                }
                G.numCrystalBallUses = 0;
            }

            pawnLocations[pawn] = newLocation;

            // Can't move pawn away if in the middle of exploring
            if (explorableAreas.length > 0 && getExplorableAreas(G).length === 0) {
                return INVALID_MOVE;
            }

            const now = Date.now();
            if (frozen) {
                G.clock = { numMillisLeft, atTime: now, frozen: false };
            }
            const { tileId, localRow, localCol } = newLocation;
            const { squares } = placedTiles[tileId];
            // check if we flip the timer
            if (squares[localRow][localCol].timer && !some(usedObjects, newLocation)) {
                const actualNumMillisLeft = numMillisLeft - (now - atTime);
                usedObjects.push(newLocation);
                G.clock = { numMillisLeft: TIMER_MILLIS - actualNumMillisLeft, atTime: now, frozen: false };
                if (!skipPassingActions) {
                    G.actionTiles = Object.fromEntries(range(numPlayers).map(i => [(i + 1) % numPlayers, actionTiles[i]]));
                }
            }

            if (range(4).every(i => getSquare(G, i).weapon === i)) {
                G.vortexSystemEnabled = false;
            }

            if (getSquare(G, pawn).crystal === pawn && !some(usedObjects, pawnLocations[pawn])) {
                G.numCrystalBallUses = MAX_CRYSTAL_BALL_USES;
            }
        },
        startExplore: (G: GameState, ctx: Ctx) => {
            const { explorableAreas } = G;
            const { playerID } = ctx;
            if (!canExplore(G, playerID)) {
                return INVALID_MOVE;
            }
            if (explorableAreas.length > 0) {
                return INVALID_MOVE;
            }
            const newExplorableAreas = getExplorableAreas(G);
            if (newExplorableAreas.length === 0) {
                return INVALID_MOVE;
            }
            G.explorableAreas = newExplorableAreas;
        },
        finishExplore: (G: GameState, ctx: Ctx, tilePlacement: TilePlacement) => {
            const { explorableAreas, numCrystalBallUses, placedTiles, unplacedMallTileIds } = G;
            const { playerID } = ctx;
            if (!canExplore(G, playerID)) {
                return INVALID_MOVE;
            }
            if (!some(intersectionWith(explorableAreas, getExplorableAreas(G), isEqual), tilePlacement)) {
                return INVALID_MOVE;
            }
            const newTileId = unplacedMallTileIds.pop()!;
            placedTiles[newTileId] = placeTile(MALL_TILES[newTileId], tilePlacement);
            G.explorableAreas = [];
            if (numCrystalBallUses >= 1) {
                G.numCrystalBallUses--;
            }
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
        moveDoSomethingPawn: {
            move: (G: GameState, ctx: Ctx, playerID: string) => {
                const { playerID: byPlayerID } = ctx;
                if (byPlayerID === undefined) {
                    throw INVALID_MOVE;
                }
                G.doSomethingPawn = { playerID, byPlayerID, atTime: Date.now() };
            },
            client: false,
        },
    },

    minPlayers: MinPlayers,
    maxPlayers: MaxPlayers,
};
