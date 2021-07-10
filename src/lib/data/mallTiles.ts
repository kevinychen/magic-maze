import { isEqual, mapValues } from 'lodash';
import { Square, UnplacedMallTile, Wall } from '../types';

interface HumanReadableMallTile {

    /**
     * An array of 4 strings, each of 4 chars each. A char can be either ' ' (no walls), '|' (right wall), '_' (bottom wall), or 'J' (right and bottom walls)
     */
    walls: string[];

    /**
     * A 4x4 matrix. Each one has an empty string or "<color> vortex", "<color> exit", "timer"
     */
    objects: string[][];

    /**
     * A array of length 4, corresponding to the north, east, south, and west edges. Each entry is either "wall", "entrance", or "<color>" explore exit
     */
    edges: string[];

    /**
     * The escalators on the tile, represented as arrays of length 4 [start row, start col, end row, end col]
     */
    escalators?: number[][];

    /**
     * If an orange wall exits, its coordinate (array of length 2), and whether it is horizontal or vertical
     */
    orangeWall?: { loc: number[], dir: '|' | '_' };
}

export const HUMAN_READABLE_MALL_TILES: { [id: string]: HumanReadableMallTile } = {
    '1a': {
        walls: [
            '_  _',
            '_  _',
            '_ |_',
            '  | ',
        ],
        objects: [
            ['timer', '', '', 'purple vortex'],
            ['', '', '', 'yellow vortex'],
            ['orange vortex', '', '', ''],
            ['green vortex', '', '', ''],
        ],
        edges: ['orange', 'green', 'yellow', 'purple'],
        escalators: [[2, 3, 3, 2]],
    },
    '1b': {
        walls: [
            '| _ ',
            '| | ',
            ' _J_',
            '  | ',
        ],
        objects: [
            ['timer', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
        ],
        edges: ['green', 'yellow', 'orange', 'purple'],
        escalators: [[2, 3, 3, 2]],
    },
    '2': {
        walls: [
            '|  _',
            'J_J ',
            ' J _',
            '|   ',
        ],
        objects: [
            ['purple exit', '', '', ''],
            ['', '', '', 'purple vortex'],
            ['', '', '', ''],
            ['', '', '', 'green vortex'],
        ],
        edges: ['wall', 'entrance', 'orange', 'wall'],
        escalators: [[1, 0, 3, 1]],
    },
    '3': {
        walls: [
            'J J_',
            '__ _',
            '_ | ',
            '||  ',
        ],
        objects: [
            ['', '', '', ''],
            ['', '', '', 'timer'],
            ['green vortex', '', '', ''],
            ['', 'orange vortex', '', ''],
        ],
        edges: ['entrance', 'purple', 'wall', 'yellow'],
    },
    '4': {
        walls: [
            'J|_ ',
            '_ J_',
            '| _ ',
            '||| ',
        ],
        objects: [
            ['', 'orange vortex', '', ''],
            ['', '', 'timer', ''],
            ['', '', '', ''],
            ['', '', '', 'yellow vortex'],
        ],
        edges: ['wall', 'purple', 'green', 'entrance'],
    },
    '5': {
        walls: [
            'J|_ ',
            '| __',
            '_ J ',
            '|   ',
        ],
        objects: [
            ['', 'purple vortex', '', ''],
            ['', '', '', ''],
            ['', '', 'timer', ''],
            ['', '', '', ''],
        ],
        edges: ['yellow', 'orange', 'green', 'entrance'],
    },
    '6': {
        walls: [
            '_J| ',
            '_ |_',
            '||_ ',
            '||| ',
        ],
        objects: [
            ['', '', 'yellow weapon', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', 'purple vortex'],
        ],
        edges: ['wall', 'entrance', 'orange', 'green'],
    },
    '7': {
        walls: [
            '_J|_',
            ' __ ',
            'J_| ',
            '||| ',
        ],
        objects: [
            ['', '', 'green vortex', ''],
            ['', '', '', ''],
            ['orange weapon', '', '', ''],
            ['', '', '', 'yellow vortex'],
        ],
        edges: ['wall', 'purple', 'entrance', 'wall'],
        escalators: [[1, 2, 3, 1]],
    },
    '8': {
        walls: [
            ' _  ',
            'J|J ',
            '__J ',
            '    ',
        ],
        objects: [
            ['', '', '', ''],
            ['', '', 'yellow vortex', ''],
            ['', '', '', ''],
            ['green weapon', '', '', ''],
        ],
        edges: ['wall', 'purple', 'entrance', 'orange'],
    },
    '9': {
        walls: [
            'J _ ',
            '_J| ',
            '_J| ',
            '    ',
        ],
        objects: [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', 'orange vortex', ''],
            ['purple weapon', '', '', ''],
        ],
        edges: ['wall', 'wall', 'yellow', 'entrance'],
    },
    '10': {
        walls: [
            '_||_',
            '|J_ ',
            ' || ',
            '||| ',
        ],
        objects: [
            ['', '', '', ''],
            ['orange vortex', '', '', ''],
            ['', '', '', ''],
            ['green exit', '', '', 'green vortex'],
        ],
        edges: ['yellow', 'entrance', 'purple', 'wall'],
        escalators: [[1, 2, 2, 1]],
    },
    '11': {
        walls: [
            '|J|_',
            ' _J ',
            '| | ',
            ' |  ',
        ],
        objects: [
            ['yellow exit', '', '', ''],
            ['', '', '', 'yellow vortex'],
            ['', '', '', ''],
            ['', '', '', ''],
        ],
        edges: ['orange', 'entrance', 'green', 'wall'],
    },
    '12': {
        walls: [
            ' J__',
            '||| ',
            '|J  ',
            '| | ',
        ],
        objects: [
            ['', '', '', ''],
            ['', '', '', 'orange vortex'],
            ['', '', '', ''],
            ['orange exit', '', '', 'purple vortex'],
        ],
        edges: ['wall', 'entrance', 'wall', 'yellow'],
        escalators: [[0, 1, 1, 2], [2, 0, 3, 1]],
    },
    '13': {
        walls: [
            ' |_ ',
            'J J ',
            '||_ ',
            '|   ',
        ],
        objects: [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', 'purple vortex', ''],
            ['', '', '', ''],
        ],
        edges: ['green', 'wall', 'yellow', 'entrance'],
        orangeWall: { loc: [1, 2], dir: '|' },
    },
    '14': {
        walls: [
            '|||_',
            '||  ',
            '|JJ_',
            '    ',
        ],
        objects: [
            ['purple vortex', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', 'yellow vortex'],
        ],
        edges: ['green', 'entrance', 'orange', 'wall'],
        escalators: [[1, 0, 2, 2]],
        orangeWall: { loc: [2, 2], dir: '_' },
    },
    '15': {
        walls: [
            '|||_',
            '|J  ',
            'J J ',
            '||| ',
        ],
        objects: [
            ['', '', 'yellow vortex', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', 'purple crystal'],
        ],
        edges: ['wall', 'entrance', 'green', 'orange'],
        escalators: [[0, 0, 1, 2]],
        orangeWall: { loc: [2, 0], dir: '|' },
    },
    '16': {
        walls: [
            'J |_',
            '||_ ',
            ' _J_',
            '    ',
        ],
        objects: [
            ['', '', '', ''],
            ['yellow camera', '', '', ''],
            ['', '', '', ''],
            ['', '', '', 'green vortex'],
        ],
        edges: ['purple', 'entrance', 'orange', 'wall'],
        orangeWall: { loc: [2, 2], dir: '|' },
    },
    '17': {
        walls: [
            'J |_',
            '_J _',
            '_ |_',
            '||  ',
        ],
        objects: [
            ['', '', '', ''],
            ['', '', '', 'green vortex'],
            ['yellow camera', '', '', ''],
            ['', '', '', 'purple crystal'],
        ],
        edges: ['wall', 'wall', 'orange', 'entrance'],
    },
    '18': {
        walls: [
            '_J| ',
            '_ J_',
            '| __',
            '||  ',
        ],
        objects: [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', 'purple vortex'],
            ['', 'yellow camera', '', ''],
        ],
        edges: ['green', 'wall', 'wall', 'entrance'],
    },
    '19': {
        walls: [
            ' |_ ',
            '|__ ',
            '  J ',
            '||| ',
        ],
        objects: [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['yellow camera', '', '', 'green vortex'],
        ],
        edges: ['purple', 'orange', 'entrance', 'yellow'],
        orangeWall: { loc: [2, 2], dir: '|' },
    },
    '20': {
        walls: [
            'J |_',
            ' J_ ',
            '_|| ',
            '||| ',
        ],
        objects: [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', 'purple crystal'],
        ],
        edges: ['wall', 'yellow', 'entrance', 'green'],
        escalators: [[1, 2, 2, 1]],
    },
    '21': {
        walls: [
            ' __ ',
            '__| ',
            ' _J ',
            '  | ',
        ],
        objects: [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
        ],
        edges: ['wall', 'orange', 'entrance', 'purple'],
        orangeWall: { loc: [3, 2], dir: '|' },
    },
    '22': {
        walls: [
            '|J_ ',
            '|  _',
            '_J_ ',
            '|   ',
        ],
        objects: [
            ['yellow vortex', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
        ],
        edges: ['orange', 'wall', 'green', 'entrance'],
    },
    '23': {
        walls: [
            '  __',
            '||__',
            'J_| ',
            '|   ',
        ],
        objects: [
            ['', '', '', 'yellow vortex'],
            ['', '', '', ''],
            ['green vortex', '', '', ''],
            ['', '', '', ''],
        ],
        edges: ['wall', 'purple', 'entrance', 'orange'],
    },
    '24': {
        walls: [
            'J_  ',
            '_ J ',
            'J|J ',
            '  | ',
        ],
        objects: [
            ['', 'purple vortex', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['orange vortex', '', '', ''],
        ],
        edges: ['wall', 'green', 'entrance', 'yellow'],
        orangeWall: { loc: [3, 2], dir: '|' },
    },
};

function parse(mallTile: HumanReadableMallTile): UnplacedMallTile {
    const COLORS = ['yellow', 'purple', 'green', 'orange'];

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
            } else if (parts[1] === 'weapon') {
                squares[row][col].weapon = COLORS.indexOf(parts[0]);
            } else if (parts[1] === 'crystal') {
                squares[row][col].crystal = COLORS.indexOf(parts[0]);
            } else if (parts[1] === 'camera') {
                squares[row][col].camera = COLORS.indexOf(parts[0]);
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
    let entranceDir = mallTile.edges.includes('entrance') ? mallTile.edges.indexOf('entrance') : undefined;
    let exploreDirs = mallTile.edges.map(edge => {
        switch (edge) {
            case 'wall':
            case 'entrance':
                return null;
            default:
                return COLORS.indexOf(edge);
        }
    });
    let escalators = mallTile.escalators === undefined ? [] : mallTile.escalators.flatMap(([startRow, startCol, endRow, endCol]) => [
        { startRow, startCol, endRow, endCol },
        { startRow: endRow, startCol: endCol, endRow: startRow, endCol: startCol },
    ]);

    return { squares, entranceDir, exploreDirs, escalators };
}

export const MALL_TILES: { [id: string]: UnplacedMallTile } = mapValues(HUMAN_READABLE_MALL_TILES, parse);
