import { BoardProps } from 'boardgame.io/react';
import React from 'react';
import { PanZoom } from 'react-easy-panzoom'
import { Color, GameState, MallTile, PawnLocation } from '../lib/types';
import './board.css';
import { isEqual } from 'lodash';
import { getExploreDir, getPawnsAt, getPossibleDestinations } from '../lib/game';
import { Clock } from './clock';

const MALL_TILE_SIZE = 555;
const SQUARE_SIZE = 118;
const PAWN_SIZE = 60;
const PAWN_BORDER = 2;
const COLORS = {
    [Color.GREEN]: 'green',
    [Color.ORANGE]: 'orange',
    [Color.YELLOW]: 'yellow',
    [Color.PURPLE]: 'purple',
};

interface BoardState {

    selectedPawn?: Color;
    possibleDestinations: PawnLocation[];
    canExplore: boolean;
}

export class Board extends React.Component<BoardProps<GameState>, BoardState> {

    constructor(props: BoardProps) {
        super(props);
        this.state = {
            possibleDestinations: [],
            canExplore: false,
        };
    }

    componentDidMount() {
        const { moves } = this.props;
        moves.sync();
    }

    componentDidUpdate() {
        const { G, playerID } = this.props;
        const { selectedPawn, possibleDestinations, canExplore } = this.state;

        const newState = playerID !== null && selectedPawn !== undefined
            ? {
                possibleDestinations: getPossibleDestinations(G, playerID, selectedPawn),
                canExplore: getExploreDir(G, playerID, selectedPawn) !== undefined,
            }
            : {
                possibleDestinations: [],
                canExplore: false,
            };
        if (!isEqual(possibleDestinations, newState.possibleDestinations)
            || canExplore !== newState.canExplore) {
            this.setState(newState);
        }
    }

    render() {
        const { G: { pawnLocations, placedTiles, usedObjects }, ctx: { numPlayers, playOrder, playOrderPos } } = this.props;
        const { possibleDestinations } = this.state;
        return <div className="board">
            <PanZoom
                className="game"
                disableDoubleClickZoom={true}
                keyMapping={{
                    '87': { x: 0, y: 5, z: 0 },
                    '83': { x: 0, y: -5, z: 0 },
                    '65': { x: 5, y: 0, z: 0 },
                    '68': { x: -5, y: 0, z: 0 },
                }}
            >
                {Object.entries(placedTiles).map(([tileId, tile]) => this.renderMallTile(tileId, tile))}
                {usedObjects.map(loc => this.renderUsedObject(loc))}
                {possibleDestinations.map(loc => this.renderPossibleDestination(loc))}
                {pawnLocations.map((pawnLocation, pawn) => this.renderPawn(pawn, pawnLocation))}
            </PanZoom>
            <div className="sidebar">
                <div className="title">MAGIC MAZE</div>
                {[...new Array(numPlayers)].map((_, i) => this.renderPlayer(playOrder[(playOrderPos + i) % numPlayers]))}
            </div>
            {this.renderInfo()}
            {this.maybeRenderExplore()}
        </div>;
    }

    renderMallTile = (tileId: string, { row, col, dir }: MallTile) => {
        return <img
            key={tileId}
            className="object"
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
        const { G: { actionTiles, vortexSystemEnabled }, playerID: myPlayerID } = this.props;
        return <div
            key={playerID}
            className={"player" + (playerID === myPlayerID ? " me" : "")}
        >
            {`${playerID === myPlayerID ? "ME" : `Player ${playerID}`}: `}
            <img
                className="action"
                src={`./actions/${vortexSystemEnabled ? 'normal' : 'flip'}${actionTiles[playerID].id}.jpg`}
                alt=''
            />
        </div>;
    }

    renderPawn(pawn: Color, { tileId, localRow, localCol }: PawnLocation) {
        const { G: { placedTiles } } = this.props;
        const { selectedPawn } = this.state;
        const { row, col } = placedTiles[tileId];
        return <span
            key={pawn}
            className={'object dot' + (selectedPawn === pawn ? ' selected' : '')}
            style={{
                width: PAWN_SIZE,
                height: PAWN_SIZE,
                top: `${row * MALL_TILE_SIZE + (col + localRow) * SQUARE_SIZE + (MALL_TILE_SIZE - 3 * SQUARE_SIZE - PAWN_SIZE) / 2 - PAWN_BORDER}px`,
                left: `${col * MALL_TILE_SIZE + (-row + localCol) * SQUARE_SIZE + (MALL_TILE_SIZE - 3 * SQUARE_SIZE - PAWN_SIZE) / 2 - PAWN_BORDER}px`,
                backgroundColor: COLORS[pawn],
                border: `${PAWN_BORDER}px solid black`,
            }}
            onClick={() => this.setState({ selectedPawn: selectedPawn === pawn ? undefined : pawn })}
        />;
    }

    renderPossibleDestination(destination: PawnLocation) {
        const { tileId, localRow, localCol } = destination;
        const { G: { placedTiles }, moves } = this.props;
        const { selectedPawn } = this.state;
        const { row, col } = placedTiles[tileId];
        return <span
            key={`${tileId}-${localRow}-${localCol}`}
            className="object destination"
            style={{
                width: SQUARE_SIZE,
                height: SQUARE_SIZE,
                top: `${row * MALL_TILE_SIZE + (col + localRow) * SQUARE_SIZE + (MALL_TILE_SIZE - 4 * SQUARE_SIZE) / 2}px`,
                left: `${col * MALL_TILE_SIZE + (-row + localCol) * SQUARE_SIZE + (MALL_TILE_SIZE - 4 * SQUARE_SIZE) / 2}px`,
            }}
            onClick={() => { moves.movePawn(selectedPawn, destination) }}
        />;
    }

    renderUsedObject(location: PawnLocation) {
        const { tileId, localRow, localCol } = location;
        const { G: { placedTiles } } = this.props;
        const { row, col } = placedTiles[tileId];
        return <span
            key={`${tileId}-${localRow}-${localCol}`}
            className="object used"
            style={{
                width: SQUARE_SIZE,
                height: SQUARE_SIZE,
                top: `${row * MALL_TILE_SIZE + (col + localRow) * SQUARE_SIZE + (MALL_TILE_SIZE - 4 * SQUARE_SIZE) / 2}px`,
                left: `${col * MALL_TILE_SIZE + (-row + localCol) * SQUARE_SIZE + (MALL_TILE_SIZE - 4 * SQUARE_SIZE) / 2}px`,
            }}
        />;
    }

    renderInfo() {
        const { G, moves } = this.props;
        const { clock: { numMillisLeft, atTime }, vortexSystemEnabled } = G;
        const weapons: Color[] = vortexSystemEnabled
            ? getPawnsAt(G, 'weapon')
            : [...new Array(4)].map((_, i) => i).filter(i => !getPawnsAt(G, 'exit').includes(i));
        return <span
            className="info"
        >
            <Clock
                numMillisLeft={numMillisLeft}
                atTime={atTime}
                timesUp={() => moves.sync()}
            />
            {weapons.map(color => <img
                key={color}
                className="weapon"
                src={`./weapons/${COLORS[color]}.png`}
                alt={`${COLORS[color]} weapon`}
            />)}
        </span>;
    }

    maybeRenderExplore() {
        const { moves } = this.props;
        const { selectedPawn, canExplore } = this.state;
        if (!canExplore) {
            return undefined;
        }
        return <span
            className="explore"
            onClick={() => { moves.explore(selectedPawn) }}
        >
            {'🔍'}
        </span>;
    }
}
