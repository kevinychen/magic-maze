
export enum Wall { ORANGE, FULL };
export enum Color { YELLOW, PURPLE, GREEN, ORANGE };
export enum Action { UP, RIGHT, DOWN, LEFT, EXPLORE, ESCALATOR, VORTEX };

export interface PawnLocation {

    tileId: string;
    localRow: number;
    localCol: number;
}

export interface MallTile {

    row: number;
    col: number;

    squares: { walls: (Wall | undefined)[], vortex?: Color, timer: boolean, exit?: Color }[][];
    entranceDir?: number,
    exploreDirs: (Color | undefined)[],
    escalators: { startRow: number, startCol: number, endRow: number, endCol: number }[];
}

export interface ActionTile {

    numPlayers: number[];
    actions: Action[];
}

export interface GameState {

    actionTiles: { [playerID: string]: ActionTile };
    pawnLocations: PawnLocation[];
    placedTiles: { [tileId: string]: MallTile };
    unplacedMallTileIds: string[];
    vortexSystemEnabled: boolean;
}
