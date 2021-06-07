import { MALL_TILES } from "./data";
import { MallTile } from "./types";

export function toPlacedMallTile(tileId: string, dir: number, row: number, col: number): MallTile {
    const mallTile = MALL_TILES[tileId];
    let squares = mallTile.squares.map(row => row.map(({ vortex, timer, exit }) => ({
        walls: Array(4), vortex, timer: timer || false, exit,
    })));
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
            const wall = mallTile.squares[row][col].right;
            if (wall !== undefined) {
                squares[row][col].walls[1] = squares[row][col + 1].walls[3] = wall;
            }
        }
    }
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            const wall = mallTile.squares[row][col].bottom;
            if (wall !== undefined) {
                squares[row][col].walls[2] = squares[row + 1][col].walls[0] = wall;
            }
        }
    }
    let entranceDir = mallTile.accessways.includes('entrance') ? mallTile.accessways.indexOf('entrance') : undefined;
    let exploreDirs = mallTile.accessways.map(accessway => {
        switch (accessway) {
            case '':
            case 'entrance':
                return undefined;
            default:
                return accessway;
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
                newSquares[row][col].walls = [...walls.slice(1), walls[0]];
            }
        }
        squares = newSquares;
        if (entranceDir !== undefined) {
            entranceDir = (entranceDir + 1) % 4;
        }
        exploreDirs = [...exploreDirs.slice(1), exploreDirs[0]];
        escalators = escalators.map(({ startRow, startCol, endRow, endCol }) => ({
            startRow: 3 - startCol,
            startCol: startRow,
            endRow: 3 - endCol,
            endCol: endRow,
        }));
    }

    return { row, col, dir, squares, entranceDir, exploreDirs, escalators };
}
