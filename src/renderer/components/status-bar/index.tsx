import React from 'react';

interface Props {
    rightItems: Function[];
}

export const StatusBar = (props: Props) => {
    const { rightItems } = props;
    return (
        <div className="lightproxy-status-bar">
            {rightItems.map((item, index) => {
                const Comp = item;
                return <Comp key={index} />;
            })}
        </div>
    );
};
