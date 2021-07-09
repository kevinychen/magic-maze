import { BoardProps } from 'boardgame.io/react';
import { isEqual, some } from 'lodash';
import React from 'react';
import { SCENARIOS } from '../lib/data';
import { GameState } from '../lib/types';
import './configPanel.css';

interface Choice {

    value: any;
    humanReadableValue: string;
}

export class ConfigPanel extends React.Component<BoardProps<GameState>> {

    render() {
        const { G: { config }, events, moves } = this.props;
        const { scenario, startTileId, remainingMallTileIds, skipPassingActions } = config;

        return <div className="config-panel">
            <div
                className="toggleable left-arrow"
                onClick={() => moves.setGameConfig(scenario > 1 ? SCENARIOS[scenario - 1] : SCENARIOS[SCENARIOS.length - 1])}
            >
                {'▲'}
            </div>
            <div
                className="toggleable right-arrow"
                onClick={() => moves.setGameConfig(scenario + 1 < SCENARIOS.length ? SCENARIOS[scenario + 1] : SCENARIOS[1])}
            >
                {'▲'}
            </div>
            <div className="field scenario">
                {`Scenario ${scenario} ${some(SCENARIOS, config) ? '' : '(custom)'}`}
            </div>
            <hr />
            <div className="field">
                {'Start tile: '}
                {this.renderChoices('startTileId', [{value: '1a', humanReadableValue: '1a'}, {value: '1b', humanReadableValue: '1b'}], startTileId)}
            </div>
            <div className="field">
                {'Tile set: '}
                {this.renderChoices('remainingMallTileIds', [
                    { value: ['2', '3', '4', '5', '6', '7', '8', '9'], humanReadableValue: 'single exit (2-9)' },
                    { value: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], humanReadableValue: 'basic (2-12)' },
                    { value: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'], humanReadableValue: 'orange walls (2-14)' },
                    { value: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'], humanReadableValue: 'cameras (2-17)' },
                    { value: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'], humanReadableValue: 'full (2-19)' },
                ], remainingMallTileIds)}
            </div>
            <div className="field">
                {'Pass actions after timer flip: '}
                {this.renderChoices('skipPassingActions', [
                    { value: false, humanReadableValue: 'no' },
                    { value: true, humanReadableValue: 'yes' },
                ], skipPassingActions || false)}
            </div>
            <button className="start" onClick={() => events.endPhase!()}>
                {"Start"}
            </button>
        </div>;
    }

    private renderChoices(key: string, choices: Choice[], currValue: any) {
        const { moves } = this.props;
        const index = choices.findIndex(choice => isEqual(choice.value, currValue));
        return <span
            className="toggleable"
            onClick={() => moves.updateGameConfig({ [key]: choices[(index + 1) % choices.length].value })}
        >
            {choices[index].humanReadableValue}
        </span>;
    }
}