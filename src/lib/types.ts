export enum Wall { ORANGE, FULL };
export enum Color { YELLOW, PURPLE, GREEN, ORANGE };
export enum Action { UP, RIGHT, DOWN, LEFT, ESCALATOR, EXPLORE, VORTEX };
export enum TalkingMode { ALWAYS_ALLOW, DEFAULT, NEVER };

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
    tileId: string,
    exploreRow: number,
    exploreCol: number,
    exploreDir: number,
    canPawnExplore: boolean,
    isElfExplore: boolean,
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
    disableElfExploreRule?: boolean;
    divination?: boolean;
    followTheLeader?: boolean;
    groupsForbidden?: boolean;
    multidimensionalMall?: boolean;
    talkingMode?: TalkingMode;
    noDoSomethingPawn?: boolean;
    rearrangementMode?: boolean;
    skipPassingActions?: boolean;
    trickTheGuards?: boolean;
    vortexOutOfService?: boolean;
}

export interface GameState {

    actionTiles: { [playerID: string]: ActionTile };
    canTalk: boolean;
    clock: { numMillisLeft: number, atTime: number, frozen: boolean };
    config: GameConfig;
    doSomethingPawn?: { playerID: string, byPlayerID: string, atTime: number };
    equipmentStolen: boolean;
    explorableAreas: ExplorableArea[];
    exploringArea?: ExplorableArea;
    numCrystalBallUses: number;
    pawnLocations: Location[];
    placedTiles: { [tileId: string]: MallTile };
    rearrangementModeDiscards: number;
    unplacedMallTileIds: string[];
    usedObjects: Location[];
}
