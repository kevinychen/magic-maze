import React from 'react';
import { Client } from 'boardgame.io/react';
import { Game } from '../lib/game';
import { Board } from './board';
import logger from 'redux-logger';
import { applyMiddleware } from 'redux';

const WrappedClient = Client({
    game: Game,
    board: Board,
    numPlayers: 4,
    enhancer: applyMiddleware(logger),
});

export default class Room extends React.Component {

    render() {
        return <div>
            <WrappedClient playerID={"0"} />
        </div>
    }
}