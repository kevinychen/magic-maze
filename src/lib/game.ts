import { Ctx } from "boardgame.io";
import { findKey, isEqual, range, some } from 'lodash';
import { ACTION_TILES, MALL_TILES, nextScenarioIndex, SCENARIOS } from "./data";
import { placeTile } from "./tiles";
import { Action, Color, ExplorableArea, GameConfig, GameState, Location, Square, Wall } from "./types";

const DIRS = [{ drow: -1, dcol: 0 }, { drow: 0, dcol: 1 }, { drow: 1, dcol: 0 }, { drow: 0, dcol: -1 }];
const EXPLORE_LOCATIONS = [{ row: 0, col: 2 }, { row: 2, col: 3 }, { row: 3, col: 1 }, { row: 1, col: 0 }];
const INVALID_MOVE = "INVALID_MOVE";
const TIMER_MILLIS = 180000;
const MAX_CRYSTAL_BALL_USES = 2;
const REARRANGEMENT_MODE_DISCARDS = 2;
const OTHER_START_TILE_ID = '3';

function allUsePurpleExit(config: GameConfig): boolean {
    const { remainingMallTileIds } = config;
    return remainingMallTileIds.every(tileId => parseInt(tileId) <= 9);
}

export function isValidConfig(ctx: Ctx, config: GameConfig) {
    const { numPlayers } = ctx;
    const { followTheLeader, groupsForbidden } = config;
    if (followTheLeader && numPlayers === 2) {
        return false;
    }
    if (!followTheLeader && numPlayers === 9) {
        return false;
    }
    if (allUsePurpleExit(config) && groupsForbidden) {
        return false;
    }
    return true;
}

function setup(ctx: Ctx, config: GameConfig): GameState | undefined {
    const { numPlayers, random } = ctx;
    const { startTileId, topMallTileIds, followTheLeader, multidimensionalMall } = config;

    const actionTiles = ACTION_TILES.filter(
        tile => tile.numPlayers.includes(followTheLeader ? numPlayers - 1 : numPlayers));
    if (followTheLeader) {
        actionTiles.push({ id: '0', numPlayers: [], actions: [] });
    }

    const pawnLocations = random!.Shuffle([[1, 1], [1, 2], [2, 1], [2, 2]])
        .map(([localRow, localCol]) => ({ tileId: startTileId, localRow, localCol }));
    const placedTiles = { [startTileId]: placeTile(MALL_TILES[startTileId], { row: 0, col: 0, dir: 0 }) };
    let remainingMallTileIds = config.remainingMallTileIds;
    if (multidimensionalMall) {
        pawnLocations[0].tileId = pawnLocations[1].tileId = OTHER_START_TILE_ID;
        placedTiles[OTHER_START_TILE_ID] = placeTile(MALL_TILES[OTHER_START_TILE_ID], { row: 1.5, col: 0, dir: 0 });
        remainingMallTileIds = remainingMallTileIds.filter(tileId => tileId !== OTHER_START_TILE_ID);
    }

    return {
        actionTiles: Object.fromEntries(random!.Shuffle(actionTiles).map((tile, i) => [i, tile])),
        canTalk: true,
        clock: { numMillisLeft: TIMER_MILLIS, atTime: Date.now(), frozen: true },
        config,
        equipmentStolen: false,
        explorableAreas: [],
        numCrystalBallUses: 0,
        pawnLocations,
        placedTiles,
        rearrangementModeDiscards: 0,
        unplacedMallTileIds: [...random!.Shuffle(remainingMallTileIds), ...(topMallTileIds || [])],
        usedObjects: [],
    };
}

export function getSquare(G: GameState, pawn: Color): Square {
    const { pawnLocations, placedTiles } = G;
    const { tileId, localRow, localCol } = pawnLocations[pawn];
    return placedTiles[tileId].squares[localRow][localCol];
}

export function atWeapon(G: GameState, pawn: Color): boolean {
    const { config: { trickTheGuards } } = G;
    const { weapon } = getSquare(G, pawn);
    return weapon !== undefined && ((weapon === pawn) !== trickTheGuards);
}

export function atExit(G: GameState, pawn: Color): boolean {
    const { config } = G;
    const { trickTheGuards } = config;
    const { exit } = getSquare(G, pawn);
    return exit !== undefined && (allUsePurpleExit(config) || ((exit === pawn) !== trickTheGuards));
}

function getNeighboringTile(G: GameState, tileId: string, dir: number): string | undefined {
    const { placedTiles } = G;
    const { row, col, entranceDir, exploreDirs } = placedTiles[tileId];
    if (entranceDir !== dir && exploreDirs[dir] === null) {
        return undefined;
    }
    const { drow, dcol } = DIRS[dir];
    const newTileEntry = Object.entries(placedTiles)
        .find(([_id, tile]) => tile.row === row + drow && tile.col === col + dcol);
    if (newTileEntry === undefined) {
        return undefined;
    }
    const [newTileId, newTile] = newTileEntry;
    if (newTile.entranceDir !== (dir + 2) % 4 && newTile.exploreDirs[(dir + 2) % 4] === null) {
        return undefined;
    }
    return newTileId;
}

function inAlternateDimension(G: GameState, tileId: string): boolean {
    const { placedTiles } = G;
    return placedTiles[tileId].row % 1 !== 0;
}

function makeMove(G: GameState, pawn: Color, pawnLocation: Location, dir: Action): Location | undefined {
    const { config, pawnLocations, placedTiles } = G;
    const { startTileId, groupsForbidden } = config;
    const { tileId, localRow, localCol } = pawnLocation;
    const { squares, escalators } = placedTiles[tileId];

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
        const newTileId = getNeighboringTile(G, tileId, dir);
        if (newTileId === undefined) {
            return undefined;
        }
        if (groupsForbidden && newTileId !== startTileId && pawnLocations.some(loc => loc.tileId === newTileId)) {
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

    // If we're moving into a shared exit, then don't check for another pawn
    const destination = { tileId: tileId, localRow: localRow + drow, localCol: localCol + dcol };
    if (allUsePurpleExit(config) && squares[localRow + drow][localCol + dcol].exit !== undefined) {
        return destination;
    }

    // Check for another pawn
    if (some(pawnLocations, destination)) {
        return undefined;
    }

    return destination;
}

export function getPossibleDestinations(G: GameState, playerID: string | null | undefined, pawn: Color): Location[] {
    const {
        actionTiles,
        config: { multidimensionalMall, vortexOutOfService },
        equipmentStolen,
        pawnLocations,
        placedTiles,
        rearrangementModeDiscards,
        usedObjects,
    } = G;
    if (playerID === undefined || playerID === null || rearrangementModeDiscards > 0) {
        return [];
    }
    const possibleDestinations: Location[] = [];
    for (const action of actionTiles[playerID].actions) {
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
        } else if (action === Action.VORTEX && !equipmentStolen && !vortexOutOfService) {
            for (const tileId in placedTiles) {
                if (multidimensionalMall) {
                    // In this mode, the hero must also start from a vertex square
                    if (getSquare(G, pawn).vortex !== pawn) {
                        continue;
                    }
                    const currDimension = inAlternateDimension(G, location.tileId);
                    // In this mode, the hero cannot vortex within the same dimension
                    if (inAlternateDimension(G, tileId) === currDimension) {
                        continue;
                    }
                    // The four hero pawns cannot ever all be in the same dimension
                    if (range(4).every(i => i === pawn || inAlternateDimension(G, pawnLocations[i].tileId) !== currDimension)) {
                        continue;
                    }
                }
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
    let numCameras = 0;
    for (const [tileId, { squares }] of Object.entries(placedTiles)) {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (squares[row][col].camera !== undefined && !some(usedObjects, { tileId, localRow: row, localCol: col })) {
                    numCameras++;
                }
            }
        }
    }
    return possibleDestinations.filter(({ tileId, localRow, localCol }) =>
        numCameras < 2 || !placedTiles[tileId].squares[localRow][localCol].timer);
}

export function canExplore(G: GameState, playerID: string | null | undefined) {
    const { actionTiles } = G;
    return playerID !== undefined && playerID !== null && actionTiles[playerID].actions.includes(Action.EXPLORE);
}

export function getExplorableAreas(G: GameState, playerID: string | null | undefined): ExplorableArea[] {
    const { exploringArea, numCrystalBallUses, pawnLocations, placedTiles, unplacedMallTileIds } = G;
    if (!canExplore(G, playerID)) {
        return [];
    }
    if (exploringArea === undefined && unplacedMallTileIds.length === 0) {
        return [];
    }
    const explorableAreas: ExplorableArea[] = [];
    const newTileId = exploringArea !== undefined ? exploringArea.tileId : unplacedMallTileIds.slice(-1)[0];
    for (const [tileId, { row, col, exploreDirs }] of Object.entries(placedTiles)) {
        for (let dir = 0; dir < 4; dir++) {
            const { drow, dcol } = DIRS[dir];
            const explorePawn = exploreDirs[dir];
            if (explorePawn === null) {
                continue;
            }
            const { row: localRow, col: localCol } = EXPLORE_LOCATIONS[dir];
            const canPawnExplore = isEqual(pawnLocations[explorePawn], { tileId, localRow, localCol });
            if ((canPawnExplore || numCrystalBallUses >= 1)
                && !Object.values(placedTiles).some(tile => tile.row === row + drow && tile.col === col + dcol)) {
                explorableAreas.push({
                    tileId: newTileId,
                    exploreRow: row,
                    exploreCol: col,
                    exploreDir: dir,
                    canPawnExplore,
                    isElfExplore: canPawnExplore && explorePawn === 2,
                    row: row + drow,
                    col: col + dcol,
                    dir: (dir - MALL_TILES[newTileId].entranceDir! + 6) % 4,
                });
            }
        }
    }
    return explorableAreas;
}

export function getDiscardableTiles(G: GameState): string[] {
    const { config: { startTileId }, pawnLocations, placedTiles, rearrangementModeDiscards, usedObjects } = G;
    if (rearrangementModeDiscards === 0) {
        return [];
    }
    const discardableTiles: string[] = [];
    for (const tileId in placedTiles) {
        if (tileId === startTileId) {
            continue;
        }
        if (range(4).some(i => pawnLocations[i].tileId === tileId)) {
            continue;
        }
        if (usedObjects.some(loc => loc.tileId === tileId)) {
            continue;
        }
        const queue: string[] = [startTileId];
        const reachableTiles: { [tileId: string]: boolean } = {};
        while (queue.length > 0) {
            const currTileId = queue.pop()!;
            if (currTileId === tileId || reachableTiles[currTileId] !== undefined) {
                continue;
            }
            reachableTiles[currTileId] = true;
            for (let dir = 0; dir < 4; dir++) {
                const newTileId = getNeighboringTile(G, currTileId, dir);
                if (newTileId !== undefined) {
                    queue.push(newTileId);
                }
            }
        }
        if (Object.keys(reachableTiles).length === Object.keys(placedTiles).length - 1) {
            discardableTiles.push(tileId);
        }
    }
    return discardableTiles;
}

export const Name = "magic-maze";
export const MinPlayers = 2;
export const MaxPlayers = 9;

export const Game = {
    name: Name,

    setup: (ctx: Ctx) => setup(ctx, SCENARIOS[0]),

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
            },
            onEnd: (G: GameState, ctx: Ctx) => setup(ctx, G.config),
            start: true,
            next: 'play',
        },

        play: {
            endIf: (G: GameState) => {
                const { clock: { numMillisLeft }, equipmentStolen, rearrangementModeDiscards } = G;
                return numMillisLeft <= 0
                    || (rearrangementModeDiscards > 0 && getDiscardableTiles(G).length === 0)
                    || (equipmentStolen && range(4).every(i => atExit(G, i)));
            },
            onEnd: (G: GameState) => {
                const { clock: { numMillisLeft, atTime }, config } = G;
                const { scenario } = config;
                const now = Date.now();
                G.clock = { numMillisLeft: numMillisLeft - (now - atTime), atTime: now, frozen: true }
                G.clock.frozen = true;
                G.config = numMillisLeft > 0 && some(SCENARIOS, config) && nextScenarioIndex(scenario) > 0
                    ? SCENARIOS[nextScenarioIndex(scenario)]
                    : config;
            },
            next: 'setConfig',
        },
    },

    moves: {
        movePawn: (G: GameState, ctx: Ctx, pawn: Color, newLocation: Location) => {
            const {
                actionTiles,
                clock: { numMillisLeft, atTime, frozen },
                config: { rearrangementMode, skipPassingActions },
                exploringArea,
                numCrystalBallUses,
                pawnLocations,
                placedTiles,
                rearrangementModeDiscards,
                usedObjects,
            } = G;
            const { numPlayers, playerID } = ctx;
            if (!some(getPossibleDestinations(G, playerID, pawn), newLocation)) {
                return INVALID_MOVE;
            }
            if (rearrangementModeDiscards > 0) {
                return INVALID_MOVE;
            }

            if (getSquare(G, pawn).crystal === pawn && !some(usedObjects, pawnLocations[pawn])) {
                if (numCrystalBallUses < MAX_CRYSTAL_BALL_USES) {
                    usedObjects.push(pawnLocations[pawn]);
                }
                G.numCrystalBallUses = 0;
            }

            pawnLocations[pawn] = newLocation;

            // Can't move pawn away from the currently exploring area
            const exploringPlayerID = findKey(actionTiles, tile => tile.actions.includes(Action.EXPLORE));
            if (exploringArea !== undefined && !some(getExplorableAreas(G, exploringPlayerID), exploringArea)) {
                return INVALID_MOVE;
            }

            const now = Date.now();
            if (frozen) {
                G.clock = { numMillisLeft, atTime: now, frozen: false };
            }
            const { tileId, localRow, localCol } = newLocation;
            const { squares } = placedTiles[tileId];
            const flippedTimer = squares[localRow][localCol].timer && !some(usedObjects, newLocation);
            // check if we flip the timer
            if (flippedTimer) {
                const actualNumMillisLeft = numMillisLeft - (now - atTime);
                usedObjects.push(newLocation);
                G.clock = { numMillisLeft: TIMER_MILLIS - actualNumMillisLeft, atTime: now, frozen: false };
                if (!skipPassingActions) {
                    G.actionTiles = Object.fromEntries(range(numPlayers).map(i => [(i + 1) % numPlayers, actionTiles[i]]));
                }
                if (rearrangementMode) {
                    G.rearrangementModeDiscards = REARRANGEMENT_MODE_DISCARDS;
                }
            }
            G.canTalk = flippedTimer;

            if (range(4).every(i => atWeapon(G, i))) {
                G.equipmentStolen = true;
            }

            if (getSquare(G, pawn).crystal === pawn && !some(usedObjects, pawnLocations[pawn])) {
                G.numCrystalBallUses = MAX_CRYSTAL_BALL_USES;
            }
            if (getSquare(G, pawn).camera === pawn && !some(usedObjects, pawnLocations[pawn])) {
                usedObjects.push(pawnLocations[pawn]);
            }
        },
        startExplore: (G: GameState, ctx: Ctx, newExploringArea: ExplorableArea) => {
            const { config: { disableElfExploreRule }, explorableAreas, exploringArea, unplacedMallTileIds } = G;
            const { playerID } = ctx;
            const newExplorableAreas = getExplorableAreas(G, playerID);
            if (!some(newExplorableAreas, newExploringArea)) {
                return INVALID_MOVE;
            }
            if (exploringArea === undefined) {
                G.explorableAreas = newExplorableAreas;
                unplacedMallTileIds.pop();
            } else if (!some(explorableAreas, newExploringArea)) {
                return INVALID_MOVE;
            }
            G.exploringArea = newExploringArea;
            if (!disableElfExploreRule && newExploringArea.isElfExplore) {
                G.canTalk = true;
            }
        },
        finishExplore: (G: GameState, ctx: Ctx) => {
            const { config: { multidimensionalMall }, exploringArea, numCrystalBallUses, placedTiles } = G;
            const { playerID } = ctx;
            if (exploringArea === undefined || !canExplore(G, playerID)) {
                return INVALID_MOVE;
            }
            placedTiles[exploringArea.tileId] = placeTile(MALL_TILES[exploringArea.tileId], exploringArea);
            G.explorableAreas = [];
            G.exploringArea = undefined;
            if (numCrystalBallUses >= 1 && !exploringArea.canPawnExplore) {
                G.numCrystalBallUses--;
            }
            if (multidimensionalMall) {
                while (true) {
                    let needAdjustment = false;
                    for (const [tileId1, { row: row1, col: col1 }] of Object.entries(placedTiles)) {
                        for (const [tileId2, { row: row2, col: col2 }] of Object.entries(placedTiles)) {
                            if (inAlternateDimension(G, tileId1) !== inAlternateDimension(G, tileId2)) {
                                if (Math.abs(row1 - row2) < 1 && Math.abs(col1 - col2) < 1) {
                                    needAdjustment = true;
                                }
                            }
                        }
                    }
                    if (!needAdjustment) {
                        break;
                    }
                    for (const [tileId, tile] of Object.entries(placedTiles)) {
                        if (inAlternateDimension(G, tileId)) {
                            tile.row++;
                        }
                    }
                }
            }
        },
        discardTile: (G: GameState, _ctx: Ctx, tileId: string) => {
            const { placedTiles, unplacedMallTileIds } = G;
            if (!getDiscardableTiles(G).includes(tileId)) {
                return INVALID_MOVE;
            }
            delete placedTiles[tileId];
            unplacedMallTileIds.unshift(tileId);
            G.rearrangementModeDiscards--;
        },
        restart: (G: GameState) => {
            G.clock.numMillisLeft = 0;
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
