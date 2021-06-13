import { BoardProps } from 'boardgame.io/react';
import { range } from 'lodash';
import React from 'react';
import './sidebar.css';

interface State {
    height: number;
}

export class Sidebar extends React.Component<BoardProps, State> {

    private el?: HTMLDivElement | null;

    constructor(props: BoardProps) {
        super(props);
        this.state = { height: 0 };
    }

    componentDidMount() {
        this.updateHeight();
        window.addEventListener('resize', this.updateHeight);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateHeight);
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
        const { G: { actionTiles, vortexSystemEnabled }, ctx: { numPlayers }, moves, playerID: myPlayerID } = this.props;
        const { height } = this.state;
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
                {playerID === myPlayerID
                    ? <>
                        {"ME"}
                    </>
                    : <>
                        {`Player ${playerID}`}
                        <br />
                        <img
                            className="alert"
                            src="./alert.png"
                            alt="alert"
                            onClick={() => moves.moveDoSomethingPawn(playerID)}
                        />
                    </>}
            </div>
        </div>;
    }
}
