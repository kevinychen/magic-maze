import { BoardProps } from 'boardgame.io/react';
import { isEqual } from 'lodash';
import React from 'react';
import './alert.css';

interface State {

    enabled: boolean;
    alertedByPlayerID: string;
}

export class Alert extends React.Component<BoardProps, State> {

    private timeout?: NodeJS.Timeout;

    constructor(props: BoardProps) {
        super(props);
        this.state = { enabled: false, alertedByPlayerID: '' };
    }

    componentDidUpdate(prevProps: BoardProps) {
        const { G: { doSomethingPawn }, playerID: myPlayerID } = this.props;
        if (!isEqual(doSomethingPawn, prevProps.G.doSomethingPawn)) {
            if (doSomethingPawn !== undefined) {
                const { playerID, byPlayerID } = doSomethingPawn;
                if (playerID === myPlayerID) {
                    this.setState({ alertedByPlayerID: byPlayerID, enabled: true });
                    if (this.timeout !== undefined) {
                        clearTimeout(this.timeout);
                    }
                    this.timeout = setTimeout(() => this.setState({ enabled: false }), 1000);
                }
            }
        }
    }

    componentWillUnmount() {
        if (this.timeout !== undefined) {
            clearTimeout(this.timeout);
        }
    }

    render() {
        const { ctx: { playOrder }, matchData } = this.props;
        const { enabled, alertedByPlayerID } = this.state;
        const playerName = matchData === undefined ? `Player ${alertedByPlayerID}` : matchData[playOrder.indexOf(alertedByPlayerID)]?.name;
        return <>
            <div className={`alert-border ${enabled ? 'enabled' : 'disabled'}`}>
                <div className="alert-msg">{`${playerName} says: DO SOMETHING!`}</div>
            </div>
        </>;
    }
}
