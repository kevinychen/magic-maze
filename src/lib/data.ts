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
     * A string of four words, corresponding to the north, east, south, and west exits. Each word is either "wall", "entrance", or "<color>" explore exit
     */
    accessways: string;

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
        accessways: 'orange green yellow purple',
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
        accessways: 'green yellow orange purple',
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
        accessways: 'wall entrance orange wall',
        escalators: [{ start: [2, 3], end: [3, 2] }],
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
        accessways: 'entrance purple wall yellow',
        escalators: [],
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
