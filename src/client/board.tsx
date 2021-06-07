import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import { PanZoom } from 'react-easy-panzoom'
import { Action, GameState, MallTile } from '../lib/types';
import './board.css';

const MALL_TILE_SIZE = 600;
const MALL_TILE_SHIFT_SIZE = 126;
const actionImages = {
    [Action.UP]: '⬆️',
    [Action.RIGHT]: '️➡️',
    [Action.DOWN]: '⬇️️',
    [Action.LEFT]: '⬅️️',
    [Action.EXPLORE]: '🔍️',
    [Action.ESCALATOR]: '🚁️',
    [Action.VORTEX]: '🌀️',
};

export class Board extends React.Component<BoardProps<GameState>> {

    render() {
        const { G: { placedTiles }, ctx: { numPlayers, playOrder, playOrderPos } } = this.props;
        return <div className="board">
            <PanZoom
                className="game"
            >
                {Object.entries(placedTiles).map(([tileId, tile]) => this.renderMallTile(tileId, tile))}
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
                top: `${row * MALL_TILE_SIZE + col * MALL_TILE_SHIFT_SIZE}px`,
                left: `${col * MALL_TILE_SIZE - row * MALL_TILE_SHIFT_SIZE}px`,
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
            {actionTiles[playerID].actions.map(action => ` ${actionImages[action]}`)}
        </div>;
    }
}
