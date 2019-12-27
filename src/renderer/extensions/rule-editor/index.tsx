import { Extension } from '../../extension';
import React from 'react';
import { RuleList, Rule } from './components/rule-list';

const RULE_STORE_KEY = 'lightproxy-rule';

export class RuleEditor extends Extension {
    constructor() {
        super('rule-editor');
    }

    panelComponent() {
        const saveRules = (rules: Rule[]) => {
            this.coreAPI.store.set(RULE_STORE_KEY, rules);
            this.coreAPI.eventEmmitter.emit('whistle-save-rule', rules);
        };

        const readRules = () => {
            return this.coreAPI.store.get(RULE_STORE_KEY);
        };

        return function RuleEditorPanelComponent() {
            return <RuleList saveRules={saveRules} readRules={readRules} />;
        };
    }

    panelIcon() {
        return 'unordered-list';
    }

    panelTitle() {
        return 'Rule';
    }
}
