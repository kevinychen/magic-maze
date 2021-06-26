import { GameConfig } from "../types";

interface SetupConfig {

    startTileId: string;
    topMallTileIds?: string[];
    remainingMallTileIds: string[];
}

export const SCENARIOS: { [scenarioId: string]: (SetupConfig & GameConfig) } = {
    1: {
        startTileId: '1a',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9'],
        allUsePurpleExit: true,
        disableGreenExploreRule: true,
        skipPassingActions: true,
    },
    2: {
        startTileId: '1a',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        disableGreenExploreRule: true,
        skipPassingActions: true,
    },
    3: {
        startTileId: '1a',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        disableGreenExploreRule: true,
    },
    4: {
        startTileId: '1a',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
    },
    5: {
        startTileId: '1b',
        topMallTileIds: ['15'],
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
    },
    6: {
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'],
    },
    7: {
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
    },
    8: {
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        divination: true,
    },
    9: {
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        followTheLeader: true,
    },
    10: {
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        trickTheGuards: true,
    },
    11: {
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        rearrangementMode: true,
    },
    12: {
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        noCommunication: true,
    },
    13: {
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        multdimensionalMall: true,
    },
    14: {
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        noCommunication: true,
    },
    15: {
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        noCommunication: true,
        noDoSomethingPawn: true,
    },
    16: {
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        vortexOutOfService: true,
    },
    17: {
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        groupsForbidden: true,
    },
};
