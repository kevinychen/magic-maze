import { Action, ActionTile, Color, Wall } from "./types";

interface MallTile {

    squares: { right?: Wall, bottom?: Wall, vortex?: Color, timer?: boolean, exit?: Color }[][];
    accessways: (Color | 'entrance' | '')[];
    escalators: { start: number[], end: number[] }[];
}

export const MALL_TILES: {[id: string]: MallTile} = {
    0: {
        squares: [
            [{ bottom: Wall.FULL, timer: true }, {}, {}, { vortex: Color.PURPLE }],
            [{ bottom: Wall.FULL }, {}, {}, { vortex: Color.YELLOW }],
            [{ bottom: Wall.FULL, vortex: Color.ORANGE }, {}, { right: Wall.FULL }, { bottom: Wall.FULL }],
            [{ vortex: Color.GREEN }, {}, { right: Wall.FULL }, {}]
        ],
        accessways: [Color.ORANGE, Color.GREEN, Color.YELLOW, Color.PURPLE],
        escalators: [{ start: [2, 3], end: [3, 2] }],
    },
    1: {
        squares: [
            [{ right: Wall.FULL, timer: true }, {}, { bottom: Wall.FULL }, {}],
            [{ right: Wall.FULL }, {}, { right: Wall.FULL }, {}],
            [{}, { bottom: Wall.FULL }, { right: Wall.FULL, bottom: Wall.FULL }, { bottom: Wall.FULL }],
            [{}, {}, { right: Wall.FULL }, {}]
        ],
        accessways: [Color.GREEN, Color.YELLOW, Color.ORANGE, Color.PURPLE],
        escalators: [{ start: [2, 3], end: [3, 2] }],
    },
    2: {
        squares: [
            [{ exit: Color.PURPLE }, {}, {}, { bottom: Wall.FULL }],
            [{ right: Wall.FULL, bottom: Wall.FULL }, { bottom: Wall.FULL }, { right: Wall.FULL, bottom: Wall.FULL }, { vortex: Color.PURPLE }],
            [{ right: Wall.FULL }, { right: Wall.FULL, bottom: Wall.FULL }, {}, { bottom: Wall.FULL }],
            [{ right: Wall.FULL }, {}, {}, { vortex: Color.GREEN }]
        ],
        accessways: ['', 'entrance', Color.ORANGE, ''],
        escalators: [{ start: [1, 0], end: [3, 1] }],
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
