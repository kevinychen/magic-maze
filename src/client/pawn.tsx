import { animated, useSpring } from 'react-spring';

interface Props {

    color: string;
    top: number;
    left: number;
    size: number;
    selected: boolean;
    onClick?: () => void;
}

export function Pawn({ color, top, left, size, selected, onClick }: Props) {
    const { top: animatedTop, left: animatedLeft } = useSpring({ top, left });
    return <animated.img
        key={color}
        className={`object pawn ${selected ? 'selected' : ''}`}
        style={{
            width: size,
            height: size,
            top: animatedTop,
            left: animatedLeft,
        }}
        src={`./weapons/${color}.png`}
        alt={`${color} pawn`}
        onClick={onClick}
    />;
}
