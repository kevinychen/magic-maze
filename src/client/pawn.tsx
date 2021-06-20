import { animated, useSpring } from 'react-spring';

interface Props {

    color: string;
    width: number;
    height: number;
    top: number;
    left: number;
    selected: boolean;
    onClick?: () => void;
}

export function Pawn({ color, width, height, top, left, selected, onClick }: Props) {
    const { top: animatedTop, left: animatedLeft } = useSpring({ top, left });
    return <animated.img
        key={color}
        className={`object pawn ${selected ? 'selected' : ''}`}
        style={{
            width,
            height,
            top: animatedTop,
            left: animatedLeft,
        }}
        src={`./weapons/${color}.png`}
        alt={`${color} pawn`}
        onClick={onClick}
    />;
}
