import { GameConfig } from "../types";

export const SCENARIOS: GameConfig[] = [
    {
        scenario: 1,
        startTileId: '1a',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9'],
        allUsePurpleExit: true,
        disableGreenExploreRule: true,
        skipPassingActions: true,
    },
    {
        scenario: 2,
        startTileId: '1a',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        disableGreenExploreRule: true,
        skipPassingActions: true,
    },
    {
        scenario: 3,
        startTileId: '1a',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        disableGreenExploreRule: true,
    },
    {
        scenario: 4,
        startTileId: '1a',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
    },
    {
        scenario: 5,
        startTileId: '1b',
        topMallTileIds: ['15'],
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
    },
    {
        scenario: 6,
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'],
    },
    {
        scenario: 7,
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
    },
    {
        scenario: 8,
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        divination: true,
    },
    {
        scenario: 9,
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        followTheLeader: true,
    },
    {
        scenario: 10,
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        trickTheGuards: true,
    },
    {
        scenario: 11,
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        rearrangementMode: true,
    },
    // {
    //     scenario: 12,
    //     startTileId: '1b',
    //     remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
    //     noCommunication: true,
    // },
    // {
    //     scenario: 13,
    //     startTileId: '1b',
    //     remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
    //     multdimensionalMall: true,
    // },
    // {
    //     scenario: 14,
    //     startTileId: '1b',
    //     remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
    //     noCommunication: true,
    // },
    {
        scenario: 15,
        startTileId: '1b',
        remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
        noCommunication: true,
        noDoSomethingPawn: true,
    },
    // {
    //     scenario: 16,
    //     startTileId: '1b',
    //     remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
    //     vortexOutOfService: true,
    // },
    // {
    //     scenario: 17,
    //     startTileId: '1b',
    //     remainingMallTileIds: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
    //     groupsForbidden: true,
    // },
];

export function prevScenarioIndex(scenario: number): number {
    return (SCENARIOS.findIndex(config => config.scenario === scenario) + SCENARIOS.length - 1) % SCENARIOS.length;
}

export function nextScenarioIndex(scenario: number): number {
    return (SCENARIOS.findIndex(config => config.scenario === scenario) + 1) % SCENARIOS.length;
}
