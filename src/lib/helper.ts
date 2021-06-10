import { isEqual } from 'lodash';
import { MALL_TILES } from "./data";
import { MallTile, Square, Wall } from "./types";

const COLORS = ['yellow', 'purple', 'green', 'orange'];

export function toPlacedMallTile(tileId: string, dir: number, row: number, col: number): MallTile {
    const mallTile = MALL_TILES[tileId];
    let squares: Square[][] = new Array(4);
    for (let row = 0; row < 4; row++) {
        squares[row] = new Array(4);
        for (let col = 0; col < 4; col++) {
            squares[row][col] = { walls: new Array(4), timer: false };
            const parts = mallTile.objects[row][col].split(' ');
            if (parts[1] === 'vortex') {
                squares[row][col].vortex = COLORS.indexOf(parts[0]);
            } else if (parts[1] === 'exit') {
                squares[row][col].exit = COLORS.indexOf(parts[0]);
            } else if (parts[0] === 'timer') {
                squares[row][col].timer = true;
            }
        }
    }
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
            if ('|J'.includes(mallTile.walls[row][col])) {
                squares[row][col].walls[1] = squares[row][col + 1].walls[3] =
                    isEqual(mallTile.orangeWall, { loc: [row, col], dir: '|' }) ? Wall.ORANGE : Wall.FULL;
            }
        }
    }
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            if ('_J'.includes(mallTile.walls[row][col])) {
                squares[row][col].walls[2] = squares[row + 1][col].walls[0] =
                    isEqual(mallTile.orangeWall, { loc: [row, col], dir: '_' }) ? Wall.ORANGE : Wall.FULL;
            }
        }
    }
    const accessways = mallTile.accessways.split(' ');
    let entranceDir = accessways.includes('entrance') ? accessways.indexOf('entrance') : undefined;
    let exploreDirs = accessways.map(accessway => {
        switch (accessway) {
            case 'wall':
            case 'entrance':
                return undefined;
            default:
                return COLORS.indexOf(accessway);
        }
    });
    let escalators = mallTile.escalators.flatMap(({ start, end }) => [
        { startRow: start[0], startCol: start[1], endRow: end[0], endCol: end[1] },
        { startRow: end[0], startCol: end[1], endRow: start[0], endCol: start[1] },
    ]);

    // rotate
    for (let i = 0; i < dir; i++) {
        const newSquares = new Array(4);
        for (let row = 0; row < 4; row++) {
            newSquares[row] = new Array(4);
            for (let col = 0; col < 4; col++) {
                newSquares[row][col] = squares[3 - col][row];
                const walls = newSquares[row][col].walls;
                newSquares[row][col].walls = [walls[3], ...walls.slice(0, -1)];
            }
        }
        squares = newSquares;
        if (entranceDir !== undefined) {
            entranceDir = (entranceDir + 1) % 4;
        }
        exploreDirs = [...exploreDirs.slice(1), exploreDirs[0]];
        escalators = escalators.map(({ startRow, startCol, endRow, endCol }) => ({
            startRow: startCol,
            startCol: 3 - startRow,
            endRow: endCol,
            endCol: 3 - endRow,
        }));
    }

    return { row, col, dir, squares, entranceDir, exploreDirs, escalators };
}
