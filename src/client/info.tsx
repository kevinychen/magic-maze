import { BoardProps } from 'boardgame.io/react';
import { range } from 'lodash';
import React from 'react';
import { atExit, atWeapon } from '../lib/game';
import { Color, GameState, TalkingMode } from '../lib/types';
import { Clock } from './clock';
import './info.css';

/**
 * The info at the top of the game area.
 */
export class Info extends React.Component<BoardProps<GameState>> {

    render() {
        const { G, moves } = this.props;
        const {
            canTalk,
            clock: { numMillisLeft, atTime, frozen },
            config: { talkingMode },
            equipmentStolen,
            unplacedMallTileIds,
        } = G;
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
            <span className={"section"}>
                <img
                    src={talkingMode === TalkingMode.ALWAYS_ALLOW || (canTalk && talkingMode !== TalkingMode.NEVER)
                        ? './talk.png'
                        : './notalk.png'}
                    alt="talk"
                />
            </span>
            {weapons.length === 0
                ? undefined
                : <span className="section">
                    {weapons.map(color => <img
                        key={color}
                        className="weapon"
                        src={`./weapons/${color}.png`}
                        alt="weapon"
                    />)}
                </span>}
        </div>;
    }

    private renderTopUnplacedTile() {
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
}
