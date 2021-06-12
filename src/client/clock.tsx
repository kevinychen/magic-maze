import React from 'react';

interface Props {

    numMillisLeft: number;
    atTime: number;
    timesUp: () => void;
}

interface State {

    actualNumMillisLeft: number;
}

export class Clock extends React.Component<Props, State> {

    private atLocalTime: number;
    private timeout?: NodeJS.Timeout;

    constructor(props: Props) {
        super(props);
        this.state = { actualNumMillisLeft: 0 };
        this.atLocalTime = Date.now();
    }

    componentDidMount() {
        this.updateTime();
    }

    componentWillUnmount() {
        if (this.timeout !== undefined) {
            clearTimeout(this.timeout);
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.atTime !== prevProps.atTime) {
            this.atLocalTime = Date.now();
            this.updateTime();
        }
    }

    render() {
        const { actualNumMillisLeft } = this.state;
        const numSeconds = Math.ceil(actualNumMillisLeft / 1000);
        if (numSeconds < 0) {
            return "TIME'S UP";
        }
        return `${Math.floor(numSeconds / 60)}:${numSeconds % 60 < 10 ? '0' : ''}${numSeconds % 60}`;
    }

    updateTime = () => {
        const { numMillisLeft, timesUp } = this.props;
        const actualNumMillisLeft = numMillisLeft - (Date.now() - this.atLocalTime);
        if (actualNumMillisLeft < 0) {
            timesUp();
        }
        this.setState({ actualNumMillisLeft });
        if (this.timeout !== undefined) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.updateTime, 1000);
    }
}
