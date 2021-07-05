import React from 'react';
import { LobbyClient } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/react';
import { Game, MaxPlayers, MinPlayers, Name } from '../lib/game';
import { Board } from './board';
import './lobby.css';
import { LobbyAPI } from 'boardgame.io';

const SERVER = process.env.REACT_APP_PROXY || document.location.toString().replace(/\/$/, '');
const NAME_KEY = 'name';
const MATCH_INFO_KEY = 'matchInfo';
const INPUT_NAME_ID = 'name-input';

interface State {

    name: string | null;
    matchInfo?: { matchID: string, playerID: string, credentials: string };
    matches: LobbyAPI.Match[];
    inGame: boolean;
}

const WrappedClient = Client({
    game: Game,
    board: Board,
    multiplayer: SocketIO({ server: SERVER }),
    debug: false,
});

export default class WrappedLobby extends React.Component<{}, State> {

    private lobbyClient: LobbyClient;
    private timeout?: NodeJS.Timeout;

    constructor(props: {}) {
        super(props);
        this.lobbyClient = new LobbyClient({ server: SERVER });
        const matchInfo = window.localStorage.getItem(MATCH_INFO_KEY);
        this.state = {
            name: window.localStorage.getItem(NAME_KEY),
            matchInfo: matchInfo ? JSON.parse(matchInfo) : undefined,
            matches: [],
            inGame: false,
        };
    }

    componentDidMount() {
        this.refreshLobbyState();
    }

    refreshLobbyState = async () => {
        const { matchInfo } = this.state;
        const { matches } = await this.lobbyClient.listMatches(Name);

        if (matchInfo !== undefined) {
            const { matchID, playerID } = matchInfo;

            const match = matches.find(match => match.matchID === matchID);
            if (match === undefined) {
                this.setState({ matchInfo: undefined });
                await this.leaveMatch();
                this.refreshLobbyState();
                return;
            }

            if (match.setupData.parentMatchID !== undefined) {
                this.setState({ inGame: true });
                return;
            }

            const childMatch = matches.find(match => match.setupData.parentMatchID === matchID);
            if (childMatch !== undefined) {
                await this.leaveMatch();
                await this.joinMatch(childMatch.matchID, playerID);
                this.refreshLobbyState();
                return;
            }
        }

        this.setState({ matches });
        if (this.timeout !== undefined) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.refreshLobbyState, 1000);
        return;
    }

    render() {
        const { name, matchInfo, matches, inGame } = this.state;
        if (inGame) {
            const { matchID, playerID, credentials } = matchInfo!;
            return <div>
                <WrappedClient
                    matchID={matchID}
                    playerID={playerID}
                    credentials={credentials}
                />
                <button
                    className="leave-button"
                    onClick={() => this.leaveMatch().then(this.refreshLobbyState)}
                >
                    {'Leave'}
                </button>
            </div>;
        }
        const lobby = name === null
            ? <div>
                <p>{'Choose a player name:'}</p>
                <input
                    id={INPUT_NAME_ID}
                    type="text"
                    defaultValue="Visitor"
                    onKeyPress={e => {
                        if (e.nativeEvent.key === 'Enter') {
                            this.setName();
                        }
                    }}
                />
                <button onClick={this.setName}>{'Enter'}</button>
            </div>
            : <div>
                <p>{`Welcome, ${name}`}</p>
                {this.maybeRenderCreateButton()}
                <div className="matches">
                    <table>
                        <tbody>
                            <tr>
                                <th>{'Creation time'}</th>
                                <th>{'Players'}</th>
                                <th>{'Status'}</th>
                                <th></th>
                            </tr>
                            {matches.map(this.renderMatch)}
                        </tbody>
                    </table>
                </div>
            </div>;
        return <div className='lobby'>
            <div className='title'>
                <img src='./title.png' alt='Magic Maze' />
            </div>
            {lobby}
        </div>;
    }

    maybeRenderCreateButton() {
        const { matchInfo } = this.state;
        if (matchInfo !== undefined) {
            return;
        }
        return <button
            onClick={() => this.createMatch(MaxPlayers, undefined)
                .then(matchID => this.joinMatch(matchID, '0'))
                .then(this.refreshLobbyState)}
        >
            {'Create new room'}
        </button>;
    }

    renderMatch = (match: LobbyAPI.Match) => {
        const { name, matchInfo } = this.state;
        const { createdAt, gameover, matchID, players, setupData } = match;
        const playerNames = players.map(player => player.name).filter(name => name !== undefined);
        let status;
        if (gameover) {
            status = 'Completed';
        } else if (setupData.parentMatchID !== undefined) {
            status = 'In progress';
        } else if (playerNames.length < MinPlayers) {
            status = 'Waiting for more players';
        } else {
            status = 'Waiting for host to start';
        }
        const buttons = [];
        if (matchInfo === undefined || matchInfo.matchID !== matchID) {
            const emptySlot = players.find(player => player.name === undefined);
            if (!gameover && emptySlot !== undefined) {
                buttons.push(
                    <button
                        key="join"
                        onClick={() => this.leaveMatch()
                            .then(() => this.joinMatch(matchID, emptySlot.id.toString()))
                            .then(this.refreshLobbyState)}
                    >
                        {'Join'}
                    </button>
                );
            } else {
                buttons.push(
                    <button
                        key="watch"
                        onClick={() => this.leaveMatch()
                            .then(() => this.setState({ matchInfo: { matchID: matchID, playerID: '-1', credentials: '' }, inGame: true }))}
                    >
                        {'Watch'}
                    </button>
                );
            }
        } else {
            if (playerNames[0] === name && playerNames.length >= MinPlayers) {
                buttons.push(
                    <button
                        key="start"
                        onClick={() => this.createMatch(playerNames.length, matchID).then(this.refreshLobbyState)}
                    >
                        {'Start'}
                    </button>
                );
            }
            buttons.push(
                <button key="leave"
                    onClick={() => this.leaveMatch().then(this.refreshLobbyState)}
                >
                    {'Leave'}
                </button>
            );
        }
        return <tr key={matchID}>
            <td>{new Date(createdAt).toLocaleString()}</td>
            <td>{playerNames.join(', ')}</td>
            <td>{status}</td>
            <td>{buttons}</td>
        </tr>;
    }

    setName = () => {
        const name = (document.getElementById(INPUT_NAME_ID) as HTMLInputElement).value;
        this.setState({ name });
        window.localStorage.setItem(NAME_KEY, name);
    }

    createMatch = async (numPlayers: number, parentMatchID: string | undefined) => {
        const { matchID } = await this.lobbyClient.createMatch(
            Name,
            {
                numPlayers,
                setupData: { parentMatchID },
            },
        );
        return matchID;
    }

    joinMatch = async (matchID: string, playerID: string) => {
        const { name } = this.state;
        const { playerCredentials } = await this.lobbyClient.joinMatch(
            Name,
            matchID,
            {
                playerID,
                playerName: name!,
            },
        );
        const matchInfo = {
            matchID,
            playerID,
            credentials: playerCredentials,
        };
        this.setState({ matchInfo });
        window.localStorage.setItem(MATCH_INFO_KEY, JSON.stringify(matchInfo));
    }

    leaveMatch = async () => {
        const { matchInfo } = this.state;
        this.setState({ matchInfo: undefined, inGame: false });
        window.localStorage.removeItem(MATCH_INFO_KEY);
        if (matchInfo === undefined || matchInfo.credentials === undefined) {
            return;
        }
        const { matchID, playerID, credentials } = matchInfo;
        await this.lobbyClient.leaveMatch(
            Name,
            matchID,
            {
                playerID,
                credentials,
            },
        );
    }
}
