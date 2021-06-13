import { Action, ActionTile } from "../types";

export const ACTION_TILES: ActionTile[] = [
    {
        id: '1',
        numPlayers: [2],
        actions: [Action.VORTEX, Action.UP, Action.RIGHT],
    },
    {
        id: '2',
        numPlayers: [2],
        actions: [Action.ESCALATOR, Action.EXPLORE, Action.DOWN, Action.LEFT],
    },
    {
        id: '3',
        numPlayers: [3, 4, 5, 6, 7, 8],
        actions: [Action.VORTEX, Action.LEFT],
    },
    {
        id: '4',
        numPlayers: [3],
        actions: [Action.ESCALATOR, Action.EXPLORE, Action.DOWN],
    },
    {
        id: '5',
        numPlayers: [3],
        actions: [Action.UP, Action.RIGHT],
    },
    {
        id: '6',
        numPlayers: [4, 5, 6, 7, 8],
        actions: [Action.EXPLORE, Action.DOWN],
    },
    {
        id: '7',
        numPlayers: [4, 5, 6, 7, 8],
        actions: [Action.ESCALATOR, Action.RIGHT],
    },
    {
        id: '8',
        numPlayers: [4, 5, 6, 7, 8],
        actions: [Action.UP],
    },
    {
        id: '9',
        numPlayers: [5, 6, 7, 8],
        actions: [Action.LEFT],
    },
    {
        id: '10',
        numPlayers: [6, 7, 8],
        actions: [Action.RIGHT],
    },
    {
        id: '11',
        numPlayers: [7, 8],
        actions: [Action.DOWN],
    },
    {
        id: '12',
        numPlayers: [8],
        actions: [Action.UP],
    },
];
