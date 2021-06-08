import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import { PanZoom } from 'react-easy-panzoom'
import { Action, Color, GameState, MallTile, PawnLocation } from '../lib/types';
import { makeMove } from '../lib/game';
import './board.css';
import { isEqual } from 'lodash';

const MALL_TILE_SIZE = 600;
const SQUARE_SIZE = 126;
const PAWN_SIZE = 64;
const PAWN_BORDER = 2;
const ACTION_IMAGES = {
    [Action.UP]: '⬆️',
    [Action.RIGHT]: '️➡️',
    [Action.DOWN]: '⬇️️',
    [Action.LEFT]: '⬅️️',
    [Action.EXPLORE]: '🔍️',
    [Action.ESCALATOR]: '🚁️',
    [Action.VORTEX]: '🌀️',
};
const COLORS = {
    [Color.GREEN]: 'green',
    [Color.ORANGE]: 'orange',
    [Color.YELLOW]: 'yellow',
    [Color.PURPLE]: 'purple',
};

type Destination = { location: PawnLocation, path: Action[] };

interface BoardState {

    selectedPawn?: Color;
    possibleDestinations: Destination[];
}

export class Board extends React.Component<BoardProps<GameState>, BoardState> {

    constructor(props: BoardProps) {
        super(props);
        this.state = {
            possibleDestinations: [],
        };
    }

    render() {
        const { G: { pawnLocations, placedTiles }, ctx: { numPlayers, playOrder, playOrderPos } } = this.props;
        const { possibleDestinations } = this.state;
        return <div className="board">
            <PanZoom
                className="game"
                disableDoubleClickZoom={true}
            >
                {Object.entries(placedTiles).map(([tileId, tile]) => this.renderMallTile(tileId, tile))}
                {pawnLocations.map((pawnLocation, pawn) => this.renderPawn(pawn, pawnLocation))}
                {possibleDestinations.map(({ location, path }) => this.renderPossibleDestination(location, path))}
            </PanZoom>
            <div className="sidebar">
                <div className="title">MAGIC MAZE</div>
                {[...new Array(numPlayers)].map((_, i) => this.renderPlayer(playOrder[(playOrderPos + i) % numPlayers]))}
            </div>
        </div>;
    }

    renderMallTile = (tileId: string, { row, col, dir }: MallTile) => {
        return <img
            key={tileId}
            src={`./tiles/tile${tileId}.jpg`}
            alt={`Tile ${tileId}`}
            style={{
                top: `${row * MALL_TILE_SIZE + col * SQUARE_SIZE}px`,
                left: `${col * MALL_TILE_SIZE - row * SQUARE_SIZE}px`,
                transform: `rotate(${dir * 90}deg)`,
                transformOrigin: "center",
            }}
        />;
    }

    renderPlayer(playerID: string) {
        const { G: { actionTiles }, playerID: myPlayerID } = this.props;
        return <div
            key={playerID}
            className={"player" + (playerID === myPlayerID ? " me" : "")}
        >
            {playerID === myPlayerID ? "ME" : `Player ${playerID}:`}
            <br />
            {actionTiles[playerID].actions.map(action => ` ${ACTION_IMAGES[action]}`)}
        </div>;
    }

    renderPawn(pawn: Color, { tileId, localRow, localCol }: PawnLocation) {
        const { G: { placedTiles } } = this.props;
        const { selectedPawn } = this.state;
        const { row, col } = placedTiles[tileId];
        return <span
            key={pawn}
            className={'dot' + (selectedPawn === pawn ? ' selected' : '')}
            style={{
                width: PAWN_SIZE,
                height: PAWN_SIZE,
                top: `${row * MALL_TILE_SIZE + (col + localRow) * SQUARE_SIZE + (MALL_TILE_SIZE - 3 * SQUARE_SIZE - PAWN_SIZE) / 2 - PAWN_BORDER}px`,
                left: `${col * MALL_TILE_SIZE + (-row + localCol) * SQUARE_SIZE + (MALL_TILE_SIZE - 3 * SQUARE_SIZE - PAWN_SIZE) / 2 - PAWN_BORDER}px`,
                backgroundColor: COLORS[pawn],
                border: `${PAWN_BORDER}px solid black`,
            }}
            onClick={() => this.setSelectedPawn(selectedPawn === pawn ? undefined : pawn)}
        />;
    }

    renderPossibleDestination({ tileId, localRow, localCol }: PawnLocation, path: Action[]) {
        const { G: { placedTiles }, moves } = this.props;
        const { selectedPawn } = this.state;
        const { row, col } = placedTiles[tileId];
        return <span
            key={`${tileId}-${localRow}-${localCol}`}
            className="destination"
            style={{
                width: SQUARE_SIZE,
                height: SQUARE_SIZE,
                top: `${row * MALL_TILE_SIZE + (col + localRow) * SQUARE_SIZE + (MALL_TILE_SIZE - 4 * SQUARE_SIZE) / 2}px`,
                left: `${col * MALL_TILE_SIZE + (-row + localCol) * SQUARE_SIZE + (MALL_TILE_SIZE - 4 * SQUARE_SIZE) / 2}px`,
            }}
            onClick={() => {
                moves.movePawn(selectedPawn, path);
                this.setSelectedPawn(undefined);
            }}
        />;
    }

    setSelectedPawn = (pawn?: Color) => {
        const { G, playerID: myPlayerID } = this.props;
        const { actionTiles, pawnLocations } = G;
        const possibleDestinations: Destination[] = [];
        if (pawn !== undefined && myPlayerID !== null) {
            const myActions = actionTiles[myPlayerID].actions;
            const queue: Destination[] = [{ location: pawnLocations[pawn], path: [] }];
            while (true) {
                const prev = queue.pop();
                if (prev === undefined) {
                    break;
                }
                for (let action of myActions) {
                    if (action <= Action.ESCALATOR) {
                        const newLocation = makeMove(G, pawn, prev.location, action);
                        if (newLocation !== undefined && !possibleDestinations.some(d => isEqual(d.location, newLocation))) {
                            queue.push({ location: newLocation, path: [...prev.path, action] });
                            possibleDestinations.push({ location: newLocation, path: [...prev.path, action] });
                        }
                    }
                }
            }
        }
        this.setState({ selectedPawn: pawn, possibleDestinations })
    }
}
