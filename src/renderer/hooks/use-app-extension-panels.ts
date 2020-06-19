import React, { useReducer, useMemo } from 'react';
import { Extension } from '../extension';

export interface AppPanel {
    icon: string;
    title: string;
    keepAlive: boolean;
    component: Function | null;
}

enum ReducerActionTypeEnum {
    SetActiveIndex,
}

interface ReducerState {
    panels: AppPanel[];
    rightStatusItems: Function[];
    activeIndex: number;
}

type ReducerAction = {
    type: ReducerActionTypeEnum.SetActiveIndex;
    payload: number;
};

function init(extensions: Extension[]) {
    const rightStatusItems = extensions.reduce((items: Function[], ext) => {
        const item = ext.statusbarRightComponent();
        if (item !== null) {
            items.push(item);
        }
        return items;
    }, []);
    const panels = extensions.reduce((ret: AppPanel[], ext) => {
        const component = ext.panelComponent();
        if (component) {
            const icon = ext.panelIcon();
            const title = ext.panelTitle();
            const keepAlive = ext.keepAlive();
            ret.push({
                icon,
                title,
                keepAlive,
                component,
            });
        }
        return ret;
    }, []);
    return {
        panels,
        rightStatusItems,
        activeIndex: 0,
    };
}

function reducer(state: ReducerState, action: ReducerAction) {
    switch (action.type) {
        case ReducerActionTypeEnum.SetActiveIndex:
            return {
                ...state,
                activeIndex: action.payload,
            };
        default:
            return state;
    }
}

function useAppExtensionPanels(extensions: Extension[]) {
    const [state, dispatch] = useReducer<typeof reducer, Extension[]>(reducer, extensions, init);
    const { panels, rightStatusItems, activeIndex } = state;
    const activePanel = useMemo(() => panels[activeIndex], [panels, activeIndex]);

    const handleClickPanel = (index: number) => {
        dispatch({ type: ReducerActionTypeEnum.SetActiveIndex, payload: index });
    };

    return {
        panels,
        rightStatusItems,
        activeIndex,
        activePanel,
        handleClickPanel,
    };
}

export default useAppExtensionPanels;
