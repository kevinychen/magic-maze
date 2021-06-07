import { Ctx } from "boardgame.io";
import { ACTION_TILES, MALL_TILES } from "./data";
import { toPlacedMallTile } from "./helper";
import { Action, Color, GameState, PawnLocation, Wall } from "./types";

const DIRS = [{ drow: -1, dcol: 0 }, { drow: 0, dcol: 1 }, { drow: 1, dcol: 0 }, { drow: 0, dcol: -1 }];
const INVALID_MOVE = "INVALID_MOVE";

function isAtExploreLocation(dir: number, localRow: number, localCol: number) {
    const { drow, dcol } = DIRS[dir];
    return 2 * localRow === 3 + 3 * drow + dcol && 2 * localCol === 3 + 3 * dcol - drow;
}

function makeMove(G: GameState, pawn: Color, dir: Action): PawnLocation | undefined {
    const { pawnLocations, placedTiles } = G;
    const { tileId, localRow, localCol } = pawnLocations[pawn];
    const { row, col, squares, entranceDir, exploreDirs, escalators } = placedTiles[tileId];
    const { drow, dcol } = DIRS[dir];

    if (dir === Action.ESCALATOR) {
        const escalator = escalators.find(({ startRow, startCol }) => startRow === localRow && startCol === localCol);
        return escalator === undefined
            ? undefined
            : { tileId, localRow: escalator.endRow, localCol: escalator.endCol };
    }

    // Check if currently at an accessway
    if (isAtExploreLocation(dir, localRow, localCol)) {
        if (entranceDir !== dir && exploreDirs[dir] === undefined) {
            return undefined;
        }
        const newTileId = Object.entries(placedTiles)
            .find(([_id, tile]) => tile.row === row + drow && tile.col === col + dcol)?.[0];
        return newTileId === undefined
            ? undefined
            : { tileId: newTileId, localRow: 3 - localRow, localCol: 3 - localCol };
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
    if (pawnLocations.some(loc => loc.tileId === tileId && loc.localRow === localRow + drow && loc.localCol === localCol + dcol)) {
        return undefined;
    }

    return { tileId: tileId, localRow: localRow + drow, localCol: localCol + dcol };
}

export const Title = "Magic Maze";

export const Game = {
    name: "magic-maze",

    setup: (ctx: Ctx): GameState => {
        const { numPlayers, random } = ctx;
        const startTileId = '0'; // TODO
        return {
            actionTiles: Object.fromEntries(random!.Shuffle(ACTION_TILES.filter(tile => tile.numPlayers.includes(numPlayers)))
                .map((tile, i) => [i, tile])),
            pawnLocations: random!.Shuffle([[1, 1], [1, 2], [2, 1], [2, 2]])
                .map(([localRow, localCol]) => ({ tileId: startTileId, localRow, localCol })),
            placedTiles: { [startTileId]: toPlacedMallTile(startTileId, 0, 0, 0) },
            unplacedMallTileIds: random!.Shuffle(Object.entries(MALL_TILES).filter(([_id, tile]) => tile.accessways.includes('entrance')))
                .map(([id, _tile]) => id),
            vortexSystemEnabled: true,
        };
    },

    moves: {
        movePawn: (G: GameState, ctx: Ctx, pawn: Color, moves: Action[]) => {
            const { actionTiles, pawnLocations } = G;
            const { playerID } = ctx;
            const allowedMoves = actionTiles[playerID!].actions
                .filter(action => action !== Action.EXPLORE && action !== Action.VORTEX);
            for (const move of moves) {
                if (!allowedMoves.includes(move)) {
                    return INVALID_MOVE;
                }
                const newLocation = makeMove(G, pawn, move);
                if (newLocation === undefined) {
                    return INVALID_MOVE;
                }
                pawnLocations[pawn] = newLocation;
            }
        },
        explore: (G: GameState, ctx: Ctx, pawn: Color) => {
            const { actionTiles, pawnLocations, placedTiles, unplacedMallTileIds } = G;
            const { playerID } = ctx;
            if (!actionTiles[playerID!].actions.includes(Action.EXPLORE)) {
                return INVALID_MOVE;
            }
            const { tileId, localRow, localCol } = pawnLocations[pawn];
            for (let dir = 0; dir < 4; dir++) {
                if (isAtExploreLocation(dir, localRow, localCol)) {
                    const { row, col, exploreDirs } = placedTiles[tileId];
                    if (exploreDirs[dir] !== pawn) {
                        return INVALID_MOVE;
                    }
                    const { drow, dcol } = DIRS[dir];
                    if (Object.values(placedTiles).some(tile => tile.row === row + drow && tile.col === col + dcol)) {
                        return INVALID_MOVE;
                    }
                    const [newTileId] = unplacedMallTileIds.splice(1);
                    const entranceDir = MALL_TILES[newTileId].accessways.indexOf('entrance');
                    placedTiles[newTileId] = toPlacedMallTile(newTileId, (dir - entranceDir + 6) % 4, row, col);
                }
            }
        },
        vortex: (G: GameState, ctx: Ctx, pawn: Color, newLocation: PawnLocation) => {
            const { actionTiles, pawnLocations, placedTiles, vortexSystemEnabled } = G;
            const { playerID } = ctx;
            const { tileId, localRow, localCol } = newLocation;
            if (!actionTiles[playerID!].actions.includes(Action.VORTEX)) {
                return INVALID_MOVE;
            }
            if (!vortexSystemEnabled) {
                return INVALID_MOVE;
            }
            if (placedTiles[tileId]?.squares[localRow][localCol].vortex !== pawn) {
                return INVALID_MOVE;
            }
            pawnLocations[pawn] = newLocation;
        },
    },
};
