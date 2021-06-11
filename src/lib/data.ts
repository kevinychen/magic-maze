import { Action, ActionTile } from "./types";

/**
 * An encoding of a mall tile that is easy to read and type.
 */
interface MallTile {

    /**
     * An array of 4 strings, each of 4 chars each. A char can be either ' ' (no walls), '|' (right wall), '_' (bottom wall), or 'J' (right and bottom walls)
     */
    walls: string[];

    /**
     * A 4x4 matrix. Each one has an empty string or "<color> vortex", "<color> exit", "timer"
     */
    objects: string[][];

    /**
     * A array of length 4, corresponding to the north, east, south, and west exits. Each entry is either "wall", "entrance", or "<color>" explore exit
     */
    accessways: string[];

    /**
     * The escalators on the tile, with the start and end coordinates (arrays of length 2). The directionality does not matter.
     */
    escalators: { start: number[], end: number[] }[];

    /**
     * If an orange wall exits, its coordinate (array of length 2), and whether it is horizontal or vertical.
     */
    orangeWall?: { loc: number[], dir: '|' | '_' };
}

export const MALL_TILES: {[id: string]: MallTile} = {
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
        accessways: ['orange', 'green', 'yellow', 'purple'],
        escalators: [{ start: [2, 3], end: [3, 2] }],
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
        accessways: ['green', 'yellow', 'orange', 'purple'],
        escalators: [{ start: [2, 3], end: [3, 2] }],
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
        accessways: ['wall', 'entrance', 'orange', 'wall'],
        escalators: [{ start: [1, 0], end: [3, 1] }],
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
        accessways: ['entrance', 'purple', 'wall', 'yellow'],
        escalators: [],
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
        accessways: ['wall', 'purple', 'green', 'entrance'],
        escalators: [],
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
        accessways: ['yellow', 'orange', 'green', 'entrance'],
        escalators: [],
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
        accessways: ['wall', 'entrance', 'orange', 'green'],
        escalators: [],
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
        accessways: ['wall', 'purple', 'entrance', 'wall'],
        escalators: [{ start: [1, 2], end: [3, 1] }],
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
        accessways: ['wall', 'purple', 'entrance', 'orange'],
        escalators: [],
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
        accessways: ['wall', 'wall', 'yellow', 'entrance'],
        escalators: [],
    },
    '10': {
        walls: [
            '_||_',
            '_J_ ',
            ' || ',
            '||| ',
        ],
        objects: [
            ['', '', '', ''],
            ['orange vortex', '', '', ''],
            ['', '', '', ''],
            ['green exit', '', '', 'green vortex'],
        ],
        accessways: ['yellow', 'entrance', 'purple', 'wall'],
        escalators: [{ start: [1, 2], end: [2, 1] }],
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
        accessways: ['orange', 'entrance', 'green', 'wall'],
        escalators: [],
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
        accessways: ['wall', 'entrance', 'wall', 'yellow'],
        escalators: [{ start: [0, 1], end: [1, 2] }, { start: [2, 0], end: [3, 1] }],
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
        accessways: ['green', 'wall', 'yellow', 'entrance'],
        escalators: [],
        orangeWall: { loc: [1, 2], dir: '|' },
    },
};

export const ACTION_TILES: ActionTile[] = [
    {
        numPlayers: [2],
        actions: [Action.UP, Action.RIGHT, Action.VORTEX],
    },
    {
        numPlayers: [2],
        actions: [Action.DOWN, Action.LEFT, Action.ESCALATOR, Action.EXPLORE],
    },
];
