import { BoardProps } from 'boardgame.io/react';
import { isEqual, range } from 'lodash';
import React from 'react';
import './sidebar.css';

interface State {

    height: number;
    alertedPlayerIDs: { [playerID: string]: boolean };
}

export class Sidebar extends React.Component<BoardProps, State> {

    private el?: HTMLDivElement | null;
    private alertTimeouts: { [playerID: string]: NodeJS.Timeout };

    constructor(props: BoardProps) {
        super(props);
        this.state = { height: 0, alertedPlayerIDs: {} };
        this.alertTimeouts = {};
    }

    componentDidMount() {
        this.updateHeight();
        window.addEventListener('resize', this.updateHeight);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateHeight);
        Object.values(this.alertTimeouts).forEach(clearTimeout);
    }

    componentDidUpdate(prevProps: BoardProps) {
        const { G: { doSomethingPawn } } = this.props;
        if (!isEqual(doSomethingPawn, prevProps.G.doSomethingPawn)) {
            if (doSomethingPawn !== undefined) {
                const { playerID } = doSomethingPawn;
                this.setState({ alertedPlayerIDs: { ...this.state.alertedPlayerIDs, [playerID]: true } });
                if (playerID in this.alertTimeouts) {
                    clearTimeout(this.alertTimeouts[playerID]);
                }
                this.alertTimeouts[playerID] = setTimeout(
                    () => this.setState({ alertedPlayerIDs: { ...this.state.alertedPlayerIDs, [playerID]: false } }),
                    1000,
                );
            }
        }
    }

    render() {
        const { ctx: { numPlayers, playOrder }, playerID } = this.props;
        return <div className="sidebar" ref={el => this.el = el}>
            <div className="title">MAGIC MAZE</div>
            {range(numPlayers).map(i => this.renderPlayer(playOrder[(playOrder.indexOf(playerID!) + i) % numPlayers]))}
        </div>;
    }

    private updateHeight = () => {
        if (this.el) {
            this.setState({ height: this.el.clientHeight });
        }
    }

    private renderPlayer(playerID: string) {
        const {
            G: { actionTiles, doSomethingPawn, vortexSystemEnabled },
            ctx: { numPlayers, phase, playOrder },
            matchData,
            moves,
            playerID: myPlayerID,
        } = this.props;
        const { height, alertedPlayerIDs } = this.state;
        const playerName = matchData === undefined ? `Player ${playerID}` : matchData[playOrder.indexOf(playerID)]?.name;
        const isShaking = alertedPlayerIDs[playerID];
        return <div
            key={playerID}
            className="player"
            style={{
                height: `${Math.min((height - 72) / numPlayers - 10, 120)}px`,
            }}
        >
            <img
                className="action"
                src={`./actions/${vortexSystemEnabled ? 'normal' : 'flip'}${actionTiles[playerID].id}.jpg`}
                alt=''
            />
            <div className="player-info">
                {playerID === myPlayerID ? "ME" : playerName}
                <br />
                <img
                    className={`alert ${isShaking ? 'shake' : ''}`}
                    src={playerID === doSomethingPawn?.playerID || alertedPlayerIDs[playerID] ? "./alerting.png" : "./alert.png"}
                    alt="alert"
                    onClick={isShaking || phase !== 'play' ? undefined : () => moves.moveDoSomethingPawn(playerID)}
                />
            </div>
        </div>;
    }
}
