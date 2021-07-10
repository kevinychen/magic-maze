export enum Wall { ORANGE, FULL };
export enum Color { YELLOW, PURPLE, GREEN, ORANGE };
export enum Action { UP, RIGHT, DOWN, LEFT, ESCALATOR, EXPLORE, VORTEX };

export interface Location {

    tileId: string;
    localRow: number;
    localCol: number;
}

export interface Square {

    walls: (Wall | null)[];
    vortex?: Color;
    timer: boolean;
    exit?: Color;
    weapon?: Color;
    crystal?: Color;
    camera?: Color;
}

export interface UnplacedMallTile {

    squares: Square[][];
    entranceDir?: number,
    exploreDirs: (Color | null)[],
    escalators: { startRow: number, startCol: number, endRow: number, endCol: number }[];
}

export interface TilePlacement {

    row: number;
    col: number;
    dir: number;
}

export type ExplorableArea = TilePlacement & {
    exploreRow: number,
    exploreCol: number,
    exploreDir: number,
    canPawnExplore: boolean,
};

export type MallTile = UnplacedMallTile & TilePlacement;

export interface ActionTile {

    id: string;
    numPlayers: number[];
    actions: Action[];
}

export interface GameConfig {

    scenario: number;

    startTileId: string;
    topMallTileIds?: string[];
    remainingMallTileIds: string[];

    allUsePurpleExit?: boolean;
    canAlwaysTalk?: boolean;
    disableGreenExploreRule?: boolean;
    divination?: boolean;
    followTheLeader?: boolean;
    groupsForbidden?: boolean;
    multdimensionalMall?: boolean;
    noCommunication?: boolean;
    noDoSomethingPawn?: boolean;
    rearrangementMode?: boolean;
    skipPassingActions?: boolean;
    trickTheGuards?: boolean;
    vortexOutOfService?: boolean;
}

export interface GameState {

    actionTiles: { [playerID: string]: ActionTile };
    clock: { numMillisLeft: number, atTime: number, frozen: boolean };
    config: GameConfig;
    doSomethingPawn?: { playerID: string, byPlayerID: string, atTime: number };
    explorableAreas: ExplorableArea[];
    exploringArea?: ExplorableArea;
    numCrystalBallUses: number;
    pawnLocations: Location[];
    placedTiles: { [tileId: string]: MallTile };
    unplacedMallTileIds: string[];
    usedObjects: Location[];
    vortexSystemEnabled: boolean;
}
