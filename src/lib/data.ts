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

export const MALL_TILES: { [id: string]: MallTile } = {
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
        accessways: ['green', 'entrance', 'orange', 'wall'],
        escalators: [{ start: [1, 0], end: [2, 2] }],
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
        accessways: ['wall', 'entrance', 'green', 'orange'],
        escalators: [{ start: [0, 0], end: [1, 2] }],
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
        accessways: ['purple', 'entrance', 'orange', 'wall'],
        escalators: [],
        orangeWall: { loc: [2, 2], dir: '|' },
    },
    '17': {
        walls: [
            'J_|_',
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
        accessways: ['wall', 'wall', 'orange', 'entrance'],
        escalators: [],
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
        accessways: ['green', 'wall', 'wall', 'entrance'],
        escalators: [],
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
        accessways: ['purple', 'orange', 'entrance', 'yellow'],
        escalators: [],
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
        accessways: ['wall', 'yellow', 'entrance', 'green'],
        escalators: [{ start: [1, 2], end: [2, 1] }],
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
        accessways: ['wall', 'orange', 'entrance', 'purple'],
        escalators: [],
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
        accessways: ['orange', 'wall', 'green', 'entrance'],
        escalators: [],
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
        accessways: ['wall', 'purple', 'entrance', 'orange'],
        escalators: [],
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
        accessways: ['wall', 'green', 'entrance', 'yellow'],
        escalators: [],
        orangeWall: { loc: [3, 2], dir: '|' },
    },
};

export const ACTION_TILES: ActionTile[] = [
    {
        numPlayers: [2],
        actions: [Action.VORTEX, Action.UP, Action.RIGHT],
    },
    {
        numPlayers: [2],
        actions: [Action.ESCALATOR, Action.EXPLORE, Action.DOWN, Action.LEFT],
    },
    {
        numPlayers: [3, 4, 5, 6, 7, 8],
        actions: [Action.VORTEX, Action.LEFT],
    },
    {
        numPlayers: [3],
        actions: [Action.ESCALATOR, Action.EXPLORE, Action.DOWN],
    },
    {
        numPlayers: [3],
        actions: [Action.UP, Action.RIGHT],
    },
    {
        numPlayers: [4, 5, 6, 7, 8],
        actions: [Action.EXPLORE, Action.DOWN],
    },
    {
        numPlayers: [4, 5, 6, 7, 8],
        actions: [Action.ESCALATOR, Action.RIGHT],
    },
    {
        numPlayers: [4, 5, 6, 7, 8],
        actions: [Action.UP],
    },
    {
        numPlayers: [5, 6, 7, 8],
        actions: [Action.LEFT],
    },
    {
        numPlayers: [6, 7, 8],
        actions: [Action.RIGHT],
    },
    {
        numPlayers: [7, 8],
        actions: [Action.DOWN],
    },
    {
        numPlayers: [8],
        actions: [Action.UP],
    },
];
