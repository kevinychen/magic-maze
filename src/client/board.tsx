import { BoardProps } from 'boardgame.io/react';
import { intersectionWith, isEqual, range } from 'lodash';
import React from 'react';
import { PanZoom } from 'react-easy-panzoom'
import { canExplore, getExplorableAreas, getPossibleDestinations, getSquare } from '../lib/game';
import { Color, GameState, Location, TilePlacement } from '../lib/types';
import { Alert } from './alert';
import { Clock } from './clock';
import { Pawn } from './pawn';
import { Sidebar } from './sidebar';
import './board.css';
import { ConfigPanel } from './configPanel';

const MALL_TILE_SIZE = 555;
const SQUARE_SIZE = 118;
const PAWN_SIZE = 60;
const COLORS = {
    [Color.GREEN]: 'green',
    [Color.ORANGE]: 'orange',
    [Color.YELLOW]: 'yellow',
    [Color.PURPLE]: 'purple',
};

interface State {

    selectedPawn?: Color;
    possibleDestinations: Location[];
    currentlyExplorableAreas: TilePlacement[];
}

export class Board extends React.Component<BoardProps<GameState>, State> {

    constructor(props: BoardProps) {
        super(props);
        this.state = {
            possibleDestinations: [],
            currentlyExplorableAreas: [],
        };
    }

    componentDidMount() {
        const { moves } = this.props;
        moves.sync();
    }

    componentDidUpdate() {
        const { G, playerID } = this.props;
        const { selectedPawn, possibleDestinations, currentlyExplorableAreas } = this.state;

        const newState: State = {
            possibleDestinations: selectedPawn === undefined ? [] : getPossibleDestinations(G, playerID, selectedPawn),
            currentlyExplorableAreas: getExplorableAreas(G),
        };
        if (!isEqual(possibleDestinations, newState.possibleDestinations)
            || !isEqual(currentlyExplorableAreas, newState.currentlyExplorableAreas)) {
            this.setState(newState);
        }
    }

    render() {
        return <div className="board">
            {this.renderGame()}
            {this.isPlayPhase() ? undefined : <ConfigPanel {...this.props} />}
            <Sidebar {...this.props} />
            {this.renderInfo()}
            <Alert {...this.props} />
        </div>;
    }

    renderGame() {
        const { G: { explorableAreas, pawnLocations, placedTiles, unplacedMallTileIds, usedObjects }, moves } = this.props;
        const { selectedPawn, possibleDestinations, currentlyExplorableAreas } = this.state;
        return <PanZoom
            className="game"
            disableDoubleClickZoom={true}
            keyMapping={{
                '87': { x: 0, y: 5, z: 0 },
                '83': { x: 0, y: -5, z: 0 },
                '65': { x: 5, y: 0, z: 0 },
                '68': { x: -5, y: 0, z: 0 },
            }}
            minZoom={0.1}
            maxZoom={5}
        >
            {Object.entries(placedTiles).map(([tileId, tile]) => this.renderMallTile(tileId, tile, true))}
            {intersectionWith(explorableAreas, currentlyExplorableAreas, isEqual)
                .map(exploreArea => this.renderMallTile(unplacedMallTileIds.slice(-1)[0], exploreArea, false))}
            {usedObjects.map((loc, i) => <img
                key={i}
                className="object"
                style={this.getPositionStyle(loc, SQUARE_SIZE)}
                src="./used.png"
                alt="used"
            />)}
            {possibleDestinations.map((loc, i) => <span
                key={i}
                className="object destination"
                style={this.getPositionStyle(loc, SQUARE_SIZE)}
                onClick={this.isPlayPhase() ? () => moves.movePawn(selectedPawn, loc) : undefined}
            />)}
            {pawnLocations.map((pawnLocation, pawn) => <Pawn
                color={COLORS[pawn as Color]}
                selected={selectedPawn === pawn}
                onClick={() => this.setState({ selectedPawn: selectedPawn === pawn ? undefined : pawn })}
                {...this.getPositionStyle(pawnLocation, PAWN_SIZE)}
            />)}
        </PanZoom>;
    }

    renderMallTile = (tileId: string, tilePlacement: TilePlacement, placed: boolean) => {
        const { G, moves, playerID } = this.props;
        const { row, col, dir } = tilePlacement;
        const canFinishExplore = canExplore(G, playerID) && !placed;
        return <img
            key={tileId}
            className={`object ${placed ? 'placed' : 'unplaced'} ${canFinishExplore ? 'explorable' : ''}`}
            src={`./tiles/tile${tileId}.jpg`}
            alt={`Tile ${tileId}`}
            style={{
                top: `${row * MALL_TILE_SIZE + col * SQUARE_SIZE}px`,
                left: `${col * MALL_TILE_SIZE - row * SQUARE_SIZE}px`,
                transform: `rotate(${dir * 90}deg)`,
                transformOrigin: "center",
            }}
            onClick={canFinishExplore && this.isPlayPhase() ? () => moves.finishExplore(tilePlacement) : undefined}
        />;
    }

    renderInfo() {
        const { G, moves, playerID } = this.props;
        const { clock: { numMillisLeft, atTime, frozen }, explorableAreas, unplacedMallTileIds, vortexSystemEnabled } = G;
        const { currentlyExplorableAreas } = this.state;
        const canStartExplore = canExplore(G, playerID) && explorableAreas.length === 0 && currentlyExplorableAreas.length > 0;
        const weapons: Color[] = vortexSystemEnabled
            ? range(4).filter(i => getSquare(G, i).weapon === i)
            : range(4).filter(i => getSquare(G, i).exit !== i);
        return <div
            className="info"
        >
            <span className="section timer">
                <Clock
                    numMillisLeft={numMillisLeft}
                    atTime={atTime}
                    frozen={frozen}
                    timesUp={() => moves.sync()}
                />
            </span>
            <span
                className={`section explore ${canStartExplore ? 'enabled' : 'disabled'}`}
                onClick={canStartExplore && this.isPlayPhase() ? () => moves.startExplore() : undefined}
            >
                {`🔍 x${unplacedMallTileIds.length}`}
            </span>
            {weapons.length === 0
                ? undefined
                : <span className="section">
                    {weapons.map(color => <img
                        key={color}
                        className="weapon"
                        src={`./weapons/${COLORS[color]}.png`}
                        alt={`${COLORS[color]} weapon`}
                    />)}
                </span>}
        </div>;
    }

    private getPositionStyle({ tileId, localRow, localCol }: Location, size: number) {
        const { G: { placedTiles } } = this.props;
        const { row, col } = placedTiles[tileId];
        return {
            width: size,
            height: size,
            top: row * MALL_TILE_SIZE + (col + localRow) * SQUARE_SIZE + (MALL_TILE_SIZE - 3 * SQUARE_SIZE - size) / 2,
            left: col * MALL_TILE_SIZE + (-row + localCol) * SQUARE_SIZE + (MALL_TILE_SIZE - 3 * SQUARE_SIZE - size) / 2,
        };
    }

    private isPlayPhase() {
        const { ctx: { phase } } = this.props;
        return phase === 'play';
    }
}
