import { BoardProps } from 'boardgame.io/react';
import { isEqual, range, some } from 'lodash';
import React from 'react';
import { nextScenarioIndex, prevScenarioIndex, SCENARIOS } from '../lib/data';
import { isValidConfig } from '../lib/game';
import { GameState, TalkingMode } from '../lib/types';
import './configPanel.css';

interface Choice {

    value: any;
    humanReadableValue: string;
}

export class ConfigPanel extends React.Component<BoardProps<GameState>> {

    render() {
        const { G: { config }, ctx, events, moves } = this.props;
        const { scenario } = config;
        return <div className="config-panel">
            <div
                className="toggleable title left-arrow"
                onClick={() => moves.setGameConfig(SCENARIOS[prevScenarioIndex(scenario)])}
            >
                {'▲'}
            </div>
            <div
                className="toggleable title right-arrow"
                onClick={() => moves.setGameConfig(SCENARIOS[nextScenarioIndex(scenario)])}
            >
                {'▲'}
            </div>
            <div className="field scenario">
                {`Scenario ${scenario} ${some(SCENARIOS, config) ? '' : '(custom)'}`}
            </div>
            <hr />
            <div className="field">
                {'Start tile: '}
                {this.renderChoices('startTileId', [{ value: '1a', humanReadableValue: '1a' }, { value: '1b', humanReadableValue: '1b' }])}
            </div>
            <div className="field">
                {'Tile set: '}
                {this.renderArrowChoices('remainingMallTileIds', [
                    { value: range(2, 9 + 1).map(String), humanReadableValue: 'single exit (2-9)' },
                    { value: range(2, 12 + 1).map(String), humanReadableValue: 'basic (2-12)' },
                    { value: range(2, 14 + 1).map(String), humanReadableValue: 'orange walls (2-14)' },
                    { value: range(2, 17 + 1).map(String), humanReadableValue: 'cameras (2-17)' },
                    { value: range(2, 19 + 1).map(String), humanReadableValue: 'full (2-19)' },
                    { value: range(2, 20 + 1).map(String), humanReadableValue: 'full (2-20)' },
                    { value: range(2, 21 + 1).map(String), humanReadableValue: 'full (2-21)' },
                    { value: range(2, 22 + 1).map(String), humanReadableValue: 'full (2-22)' },
                    { value: range(2, 23 + 1).map(String), humanReadableValue: 'full (2-23)' },
                    { value: range(2, 24 + 1).map(String), humanReadableValue: 'full (2-24)' },
                ])}
            </div>
            <div className="field">
                {'Talking: '}
                {this.renderArrowChoices('talkingMode', [
                    { value: TalkingMode.ALWAYS_ALLOW, humanReadableValue: 'always (novices only)' },
                    { value: undefined, humanReadableValue: 'normal rules' },
                    { value: TalkingMode.NEVER, humanReadableValue: 'never allowed' },
                ])}
            </div>
            <div className="field">{'Pass actions after timer flip: '}{this.renderBinaryChoices('skipPassingActions', true)}</div>
            <div className="field">{'Divination (show upcoming tile): '}{this.renderBinaryChoices('divination', false)}</div>
            <div className="field">{'Follow the leader: '}{this.renderBinaryChoices('followTheLeader', false)}</div>
            <div className="field">{'Trick the guards: '}{this.renderBinaryChoices('trickTheGuards', false)}</div>
            <div className="field">{'Rearrangement mode: '}{this.renderBinaryChoices('rearrangementMode', false)}</div>
            <div className="field">{'Multidimensional mall: '}{this.renderBinaryChoices('multidimensionalMall', false)}</div>
            <div className="field">{'Allow "Do Something!" pawn: '}{this.renderBinaryChoices('noDoSomethingPawn', true)}</div>
            <div className="field">{'Enable vortex system: '}{this.renderBinaryChoices('vortexOutOfService', true)}</div>
            <div className="field">{'Groups forbidden: '}{this.renderBinaryChoices('groupsForbidden', false)}</div>
            <button
                className="start"
                disabled={!isValidConfig(ctx, config)}
                onClick={() => events.endPhase!()}
            >
                {"Start"}
            </button>
        </div>;
    }

    private renderArrowChoices(key: 'remainingMallTileIds' | 'talkingMode', choices: Choice[]) {
        const { G: { config }, moves } = this.props;
        const index = choices.findIndex(choice => isEqual(choice.value, config[key]));
        return <>
            <div
                className="toggleable tiny-arrow left-arrow"
                onClick={() => moves.updateGameConfig({
                    [key]: choices[(index + choices.length - 1) % choices.length].value,
                })}
            >
                {'▲'}
            </div>
            <div className="constant-length">{choices[index].humanReadableValue}</div>
            <div
                className="toggleable tiny-arrow right-arrow"
                onClick={() => moves.updateGameConfig({
                    [key]: choices[(index + 1) % choices.length].value,
                })}
            >
                {'▲'}
            </div>
        </>;
    }

    private renderBinaryChoices(key: string, invert: boolean) {
        return this.renderChoices(key, [
            { value: invert, humanReadableValue: 'no' },
            { value: !invert, humanReadableValue: 'yes' },
        ]);
    }

    private renderChoices(key: string, choices: Choice[]) {
        const { G: { config }, moves } = this.props;
        const index = choices.findIndex(choice => isEqual(choice.value, (config as any)[key] || false));
        return <span
            className="toggleable"
            onClick={() => moves.updateGameConfig({ [key]: choices[(index + 1) % choices.length].value })}
        >
            {choices[index].humanReadableValue}
        </span>;
    }
}
