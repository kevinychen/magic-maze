import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import { PanZoom } from 'react-easy-panzoom'
import { Action, Color, GameState, MallTile, PawnLocation } from '../lib/types';
import './board.css';

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

export class Board extends React.Component<BoardProps<GameState>> {

    render() {
        const { G: { pawnLocations, placedTiles }, ctx: { numPlayers, playOrder, playOrderPos } } = this.props;
        return <div className="board">
            <PanZoom
                className="game"
            >
                {Object.entries(placedTiles).map(([tileId, tile]) => this.renderMallTile(tileId, tile))}
                {pawnLocations.map((pawnLocation, pawn) => this.renderPawn(pawn, pawnLocation))}
            </PanZoom>
            <div className="sidebar">
                <div className="title">MAGIC MAZE</div>
                {[...new Array(numPlayers)].map((_, i) => this.renderPlayer(playOrder[(playOrderPos + i) % numPlayers]))}
            </div>
        </div>;
    }

    renderMallTile = (tileId: string, { row, col, dir }: MallTile) => {
        return <img
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
            className={"player" + (playerID === myPlayerID ? " me" : "")}
        >
            {playerID === myPlayerID ? "ME" : `Player ${playerID}:`}
            <br/>
            {actionTiles[playerID].actions.map(action => ` ${ACTION_IMAGES[action]}`)}
        </div>;
    }

    renderPawn(pawn: Color, { tileId, localRow, localCol }: PawnLocation) {
        const { G: { placedTiles } } = this.props;
        const { row, col } = placedTiles[tileId];
        return <span
            className="dot"
            style={{
                width: PAWN_SIZE,
                height: PAWN_SIZE,
                top: `${row * MALL_TILE_SIZE + (col + localRow) * SQUARE_SIZE + (MALL_TILE_SIZE - 3 * SQUARE_SIZE - PAWN_SIZE) / 2 - PAWN_BORDER}px`,
                left: `${col * MALL_TILE_SIZE + (-row + localCol) * SQUARE_SIZE + (MALL_TILE_SIZE - 3 * SQUARE_SIZE - PAWN_SIZE) / 2 - PAWN_BORDER}px`,
                backgroundColor: COLORS[pawn],
                border: `${PAWN_BORDER}px solid black`,
            }}
        />;
    }
}
