import { range } from "lodash";
import { GameConfig } from "../types";

export const SCENARIOS: GameConfig[] = [
    {
        scenario: 1,
        startTileId: '1a',
        remainingMallTileIds: range(2, 9 + 1).map(String),
        allUsePurpleExit: true,
        disableGreenExploreRule: true,
        skipPassingActions: true,
    },
    {
        scenario: 2,
        startTileId: '1a',
        remainingMallTileIds: range(2, 12 + 1).map(String),
        disableGreenExploreRule: true,
        skipPassingActions: true,
    },
    {
        scenario: 3,
        startTileId: '1a',
        remainingMallTileIds: range(2, 12 + 1).map(String),
        disableGreenExploreRule: true,
    },
    {
        scenario: 4,
        startTileId: '1a',
        remainingMallTileIds: range(2, 14 + 1).map(String),
    },
    {
        scenario: 5,
        startTileId: '1b',
        topMallTileIds: ['15'],
        remainingMallTileIds: range(2, 14 + 1).map(String),
    },
    {
        scenario: 6,
        startTileId: '1b',
        remainingMallTileIds: range(2, 17 + 1).map(String),
    },
    {
        scenario: 7,
        startTileId: '1b',
        remainingMallTileIds: range(2, 19 + 1).map(String),
    },
    {
        scenario: 8,
        startTileId: '1b',
        remainingMallTileIds: range(2, 19 + 1).map(String),
        divination: true,
    },
    {
        scenario: 9,
        startTileId: '1b',
        remainingMallTileIds: range(2, 19 + 1).map(String),
        followTheLeader: true,
    },
    {
        scenario: 10,
        startTileId: '1b',
        remainingMallTileIds: range(2, 19 + 1).map(String),
        trickTheGuards: true,
    },
    {
        scenario: 11,
        startTileId: '1b',
        remainingMallTileIds: range(2, 19 + 1).map(String),
        rearrangementMode: true,
    },
    // {
    //     scenario: 12,
    //     startTileId: '1b',
    //     remainingMallTileIds: range(2, 19 + 1).map(String),
    //     noCommunication: true,
    // },
    {
        scenario: 13,
        startTileId: '1b',
        remainingMallTileIds: range(2, 19 + 1).map(String),
        divination: true,
        multidimensionalMall: true,
    },
    // {
    //     scenario: 14,
    //     startTileId: '1b',
    //     remainingMallTileIds: range(2, 19 + 1).map(String),
    //     noCommunication: true,
    // },
    {
        scenario: 15,
        startTileId: '1b',
        remainingMallTileIds: range(2, 19 + 1).map(String),
        noCommunication: true,
        noDoSomethingPawn: true,
    },
    {
        scenario: 16,
        startTileId: '1b',
        remainingMallTileIds: range(2, 19 + 1).map(String),
        vortexOutOfService: true,
    },
    {
        scenario: 17,
        startTileId: '1b',
        remainingMallTileIds: range(2, 19 + 1).map(String),
        groupsForbidden: true,
    },
];

export function prevScenarioIndex(scenario: number): number {
    return (SCENARIOS.findIndex(config => config.scenario === scenario) + SCENARIOS.length - 1) % SCENARIOS.length;
}

export function nextScenarioIndex(scenario: number): number {
    return (SCENARIOS.findIndex(config => config.scenario === scenario) + 1) % SCENARIOS.length;
}
