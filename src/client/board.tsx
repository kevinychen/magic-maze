import { BoardProps } from 'boardgame.io/react';
import { intersectionWith, isEqual, range } from 'lodash';
import React from 'react';
import { PanZoom } from 'react-easy-panzoom'
import { canExplore, getExplorableAreas, getPossibleDestinations, getSquare } from '../lib/game';
import { Color, ExplorableArea, GameState, Location, TilePlacement } from '../lib/types';
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
    currentlyExplorableAreas: ExplorableArea[];
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
            currentlyExplorableAreas: getExplorableAreas(G, playerID),
        };
        if (!isEqual(possibleDestinations, newState.possibleDestinations)
            || !isEqual(currentlyExplorableAreas, newState.currentlyExplorableAreas)) {
            this.setState(newState);
        }
    }

    render() {
        const { moves } = this.props;
        return <div className="board">
            {this.renderGame()}
            <Sidebar {...this.props} />
            {this.renderInfo()}
            {this.isPlayPhase()
                ? <img
                    className="restart-button toggle-button"
                    src="./restart.png"
                    alt="Restart"
                    onClick={() => {
                        if (window.confirm('Are you sure you want to restart?')) {
                            moves.restart();
                        }
                    }}
                />
                : <ConfigPanel {...this.props} />}
            <Alert {...this.props} />
        </div>;
    }

    renderGame() {
        const { G: { pawnLocations, placedTiles, usedObjects }, moves } = this.props;
        const { selectedPawn, possibleDestinations } = this.state;
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
            {this.maybeRenderExplorableAreas()}
            {this.maybeRenderCurrentExplorableArea()}
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

    renderMallTile(tileId: string, tilePlacement: TilePlacement, placed: boolean) {
        const { G, moves, playerID } = this.props;
        const { row, col, dir } = tilePlacement;
        const explorable = !placed && canExplore(G, playerID);
        return <img
            key={tileId}
            className={`object ${placed ? 'placed' : 'unplaced'} ${explorable ? 'explorable' : ''}`}
            src={`./tiles/tile${tileId}.jpg`}
            alt={`Tile ${tileId}`}
            style={{
                top: `${row * MALL_TILE_SIZE + col * SQUARE_SIZE}px`,
                left: `${col * MALL_TILE_SIZE - row * SQUARE_SIZE}px`,
                transform: `rotate(${dir * 90}deg)`,
                transformOrigin: "center",
            }}
            onClick={explorable ? () => moves.finishExplore() : undefined}
        />;
    }

    maybeRenderExplorableAreas() {
        const { G: { explorableAreas }, moves } = this.props;
        let { currentlyExplorableAreas } = this.state;
        if (!this.isPlayPhase()) {
            return null;
        }
        if (explorableAreas.length > 0) {
            currentlyExplorableAreas = intersectionWith(currentlyExplorableAreas, explorableAreas, isEqual);
        }
        return currentlyExplorableAreas.map((explorableArea, i) => {
            return <span
                key={i}
                className="object destination"
                style={this.getExplorableAreaStyle(explorableArea)}
                onClick={() => moves.startExplore(explorableArea)}
            />;
        });
    }

    maybeRenderCurrentExplorableArea() {
        const { G: { exploringArea, unplacedMallTileIds } } = this.props;
        if (!this.isPlayPhase() || exploringArea === undefined || unplacedMallTileIds.length === 0) {
            return null;
        }
        return this.renderMallTile(unplacedMallTileIds.slice(-1)[0], exploringArea, false);
    }

    renderInfo() {
        const { G, moves } = this.props;
        const { clock: { numMillisLeft, atTime, frozen }, unplacedMallTileIds, vortexSystemEnabled } = G;
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
            <span className={"section explore"}>
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
        const { row, col } = tileId in placedTiles ? placedTiles[tileId] : { row: -1, col: -1 };
        return {
            width: size,
            height: size,
            top: row * MALL_TILE_SIZE + (col + localRow) * SQUARE_SIZE + (MALL_TILE_SIZE - 3 * SQUARE_SIZE - size) / 2,
            left: col * MALL_TILE_SIZE + (-row + localCol) * SQUARE_SIZE + (MALL_TILE_SIZE - 3 * SQUARE_SIZE - size) / 2,
        };
    }

    private getExplorableAreaStyle({ exploreRow, exploreCol, exploreDir }: ExplorableArea) {
        const depth = (MALL_TILE_SIZE - 3 * SQUARE_SIZE - PAWN_SIZE) / 2;
        const top = exploreRow * MALL_TILE_SIZE + exploreCol * SQUARE_SIZE;
        const left = exploreCol * MALL_TILE_SIZE - exploreRow * SQUARE_SIZE;
        if (exploreDir === 0) {
            return {
                width: SQUARE_SIZE,
                height: depth,
                top,
                left: left + MALL_TILE_SIZE / 2,
            };
        } else if (exploreDir === 1) {
            return {
                width: depth,
                height: SQUARE_SIZE,
                top: top + MALL_TILE_SIZE / 2,
                left: left + MALL_TILE_SIZE - depth,
            };
        } else if (exploreDir === 2) {
            return {
                width: SQUARE_SIZE,
                height: depth,
                top: top + MALL_TILE_SIZE - depth,
                left: left + MALL_TILE_SIZE / 2 - SQUARE_SIZE,
            };
        } else if (exploreDir === 3) {
            return {
                width: depth,
                height: SQUARE_SIZE,
                top: top + MALL_TILE_SIZE / 2 - SQUARE_SIZE,
                left: left,
            };
        }
    }

    private isPlayPhase() {
        const { ctx: { phase } } = this.props;
        return phase === 'play';
    }
}
