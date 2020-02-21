import React, { useState } from 'react';

interface Props {
    rightItems: Function[];
}

export const StatusBar = (props: Props) => {
    const { rightItems } = props;
    const [color, setColor] = useState('normal');
    return (
        <div className={`lightproxy-status-bar color-${color}`}>
            {rightItems.map((item, index) => {
                const Comp = item;
                return <Comp setStatusBarMode={setColor} key={index} />;
            })}
        </div>
    );
};
