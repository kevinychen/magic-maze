export enum Wall { ORANGE, FULL };
export enum Color { YELLOW, PURPLE, GREEN, ORANGE };
export enum Action { UP, RIGHT, DOWN, LEFT, ESCALATOR, EXPLORE, VORTEX };

export interface Location {

    tileId: string;
    localRow: number;
    localCol: number;
}

export interface Square {

    walls: (Wall | undefined)[];
    vortex?: Color;
    timer: boolean;
    exit?: Color;
    weapon?: Color;
}

export interface UnplacedMallTile {

    squares: Square[][];
    entranceDir?: number,
    exploreDirs: (Color | undefined)[],
    escalators: { startRow: number, startCol: number, endRow: number, endCol: number }[];
}

export type MallTile = UnplacedMallTile & { row: number, col: number, dir: number };

export interface ActionTile {

    id: string;
    numPlayers: number[];
    actions: Action[];
}

export interface GameState {

    actionTiles: { [playerID: string]: ActionTile };
    clock: { numMillisLeft: number, atTime: number, frozen: boolean };
    doSomethingPawn?: { playerID: string, byPlayerID: string, atTime: number };
    pawnLocations: Location[];
    placedTiles: { [tileId: string]: MallTile };
    unplacedMallTileIds: string[];
    usedObjects: Location[];
    vortexSystemEnabled: boolean;
}
