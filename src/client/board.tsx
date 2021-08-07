import { BoardProps } from 'boardgame.io/react';
import { intersectionWith, isEqual, range } from 'lodash';
import React from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PanZoom } from 'react-easy-panzoom'
import { animated, useSpring } from 'react-spring';
import { atExit, atWeapon, canExplore, getDiscardableTiles, getExplorableAreas, getPossibleDestinations } from '../lib/game';
import { Color, ExplorableArea, GameState, Location, TilePlacement } from '../lib/types';
import { Alert } from './alert';
import { AudioController, Phase } from './audio';
import { Clock } from './clock';
import { ConfigPanel } from './configPanel';
import { Sidebar } from './sidebar';
import './board.css';

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
    discardableTiles: string[];
}

export class Board extends React.Component<BoardProps<GameState>, State> {

    constructor(props: BoardProps) {
        super(props);
        this.state = {
            possibleDestinations: [],
            currentlyExplorableAreas: [],
            discardableTiles: [],
        };
    }

    componentDidMount() {
        const { moves } = this.props;
        moves.sync();
    }

    componentDidUpdate() {
        const { G, playerID } = this.props;
        const { equipmentStolen } = G;
        const { selectedPawn, possibleDestinations, currentlyExplorableAreas, discardableTiles } = this.state;

        const newState: State = {
            possibleDestinations: selectedPawn === undefined ? [] : getPossibleDestinations(G, playerID, selectedPawn),
            currentlyExplorableAreas: getExplorableAreas(G, playerID),
            discardableTiles: getDiscardableTiles(G),
        };
        if (!isEqual(possibleDestinations, newState.possibleDestinations)
            || !isEqual(currentlyExplorableAreas, newState.currentlyExplorableAreas)
            || !isEqual(discardableTiles, newState.discardableTiles)) {
            this.setState(newState);
        }

        AudioController.getInstance().setPhase(this.isPlayPhase() && equipmentStolen ? Phase.EXIT : Phase.INTRO);
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
                        if (window.confirm('Restart the game for everyone?')) {
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
            preventPan={event => (event.target as any).draggable}
        >
            <DndProvider backend={HTML5Backend}>
                {Object.entries(placedTiles).map(([tileId, tile]) => this.renderMallTile(tileId, tile))}
                {this.maybeRenderExplorableAreas()}
                {usedObjects.map((loc, i) => <img
                    key={i}
                    className="object"
                    style={this.getPositionStyle(loc, SQUARE_SIZE)}
                    src="./used.png"
                    alt="used"
                />)}
                {pawnLocations.map((pawnLocation, pawn) => <Pawn
                    key={pawn}
                    index={pawn}
                    selected={selectedPawn === pawn}
                    onClick={() => this.setState({ selectedPawn: selectedPawn === pawn ? undefined : pawn })}
                    {...this.getPositionStyle(pawnLocation, PAWN_SIZE)}
                />)}
                {this.maybeRenderCurrentExplorableArea()}
                {possibleDestinations.map((loc, i) => <Destination
                    key={i}
                    index={i}
                    onClick={this.isPlayPhase() ? () => moves.movePawn(selectedPawn, loc) : undefined}
                    {...this.getPositionStyle(loc, SQUARE_SIZE)}
                />)}
            </DndProvider>
        </PanZoom>;
    }

    renderMallTile(tileId: string, tilePlacement: TilePlacement) {
        const { G, moves, playerID } = this.props;
        const { discardableTiles } = this.state;
        const { placedTiles } = G;
        const { row, col, dir } = tilePlacement;
        let extraClassName = '';
        let onClick = undefined;
        if (!(tileId in placedTiles)) {
            extraClassName = 'unplaced';
            if (canExplore(G, playerID)) {
                onClick = () => moves.finishExplore();
            }
        } else if (discardableTiles.includes(tileId)) {
            extraClassName = 'discardable';
            onClick = () => moves.discardTile(tileId);
        }
        return <img
            key={tileId}
            className={`object ${extraClassName} ${onClick !== undefined ? 'clickable' : ''}`}
            src={`./tiles/tile${tileId}.jpg`}
            alt={`Tile ${tileId}`}
            style={{
                top: `${row * MALL_TILE_SIZE + col * SQUARE_SIZE}px`,
                left: `${col * MALL_TILE_SIZE - row * SQUARE_SIZE}px`,
                transform: `rotate(${dir * 90}deg)`,
                transformOrigin: "center",
            }}
            onClick={this.isPlayPhase() ? onClick : undefined}
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
        return currentlyExplorableAreas.map((explorableArea, i) => <Destination
            key={i}
            index={i}
            onClick={() => moves.startExplore(explorableArea)}
            {...this.getExplorableAreaStyle(explorableArea)}
        />);
    }

    maybeRenderCurrentExplorableArea() {
        const { G: { exploringArea } } = this.props;
        if (!this.isPlayPhase() || exploringArea === undefined) {
            return null;
        }
        return this.renderMallTile(exploringArea.tileId, exploringArea);
    }

    renderInfo() {
        const { G, moves } = this.props;
        const { clock: { numMillisLeft, atTime, frozen }, equipmentStolen, unplacedMallTileIds } = G;
        const weapons: Color[] = equipmentStolen
            ? range(4).filter(i => !atExit(G, i))
            : range(4).filter(i => atWeapon(G, i));
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
                <span className={"top-unplaced"}>
                    {this.renderTopUnplacedTile()}
                </span>
                {`x${unplacedMallTileIds.length}`}
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

    renderTopUnplacedTile() {
        const { G: { config: { divination }, unplacedMallTileIds } } = this.props;
        if (!divination || unplacedMallTileIds.length === 0) {
            return <img
                className="base"
                src="./back.jpg"
                alt="Tile back"
            />;
        }
        const tileId = unplacedMallTileIds.slice(-1)[0];
        return <>
            <img
                className="base"
                src={`./tiles/tile${tileId}.jpg`}
                alt={`Tile ${tileId}`}
            />
            <img
                className="magnified"
                src={`./tiles/tile${tileId}.jpg`}
                alt={`Tile ${tileId}`}
            />
        </>;
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
                left,
            };
        } else {
            throw new Error();
        }
    }

    private isPlayPhase() {
        const { ctx: { phase } } = this.props;
        return phase === 'play';
    }
}

function Pawn(props: {
    index: number,
    width: number,
    height: number,
    top: number,
    left: number,
    selected: boolean,
    onClick: () => void,
}) {
    const { index, width, height, top, left, selected, onClick } = props;
    const { top: animatedTop, left: animatedLeft } = useSpring({ top, left });
    const color = COLORS[index as Color];
    const drag = useDrag(() => ({
        type: 'pawn',
        item: () => {
            onClick();
            return { index };
        },
        collect: _ => ({}),
    }))[1];
    return <animated.img
        ref={drag}
        className={`object pawn ${selected ? 'selected' : ''}`}
        style={{
            width,
            height,
            top: animatedTop,
            left: animatedLeft,
        }}
        src={`./weapons/${color}.png`}
        alt={`${color} pawn`}
        onClick={onClick}
    />;
}

function Destination(props: {
    index: number,
    width: number,
    height: number,
    top: number,
    left: number,
    onClick?: () => void,
}) {
    const { index, width, height, top, left, onClick } = props;
    const drop = useDrop(() => ({
        accept: 'pawn',
        drop: onClick,
    }), [index, onClick])[1];
    return <div
        ref={drop}
        className="object destination"
        style={{ width, height, top, left }}
        onClick={onClick}
    />;
}
