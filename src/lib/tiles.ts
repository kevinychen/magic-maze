import { MallTile, UnplacedMallTile } from "./types";

export function placeTile(tile: UnplacedMallTile, dir: number, row: number, col: number): MallTile {
    let { squares, entranceDir, exploreDirs, escalators } = tile;

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
        exploreDirs = [exploreDirs[3], ...exploreDirs.slice(0, -1)];
        escalators = escalators.map(({ startRow, startCol, endRow, endCol }) => ({
            startRow: startCol,
            startCol: 3 - startRow,
            endRow: endCol,
            endCol: 3 - endRow,
        }));
    }

    return { row, col, dir, squares, entranceDir, exploreDirs, escalators };
}
