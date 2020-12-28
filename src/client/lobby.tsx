import React from 'react';
import { Lobby } from 'boardgame.io/react';
import { Game, Title } from '../lib/game';
import { Board } from './board';

const SERVER = process.env.REACT_APP_PROXY || document.location.toString().replace(/\/$/, '');
const GAMES = [{ game: Game, board: Board }];

export default class WrappedLobby extends React.Component {

    render() {
        return <div className='lobby'>
            <h1>{Title}</h1>
            <Lobby gameServer={SERVER} lobbyServer={SERVER} gameComponents={GAMES} />
        </div>;
    }
}
