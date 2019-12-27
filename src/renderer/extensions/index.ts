import { WhistleExntension } from './whistle';

/* eslint-disable-next-line */
import { Extension } from '../extension'
import { RuleEditor } from './rule-editor';
import { Setting } from './setting';
import { Network } from './network';
import { PhoneProxy } from './phone-proxy';

export function getAllExtensions() {
    const extensions = ([
        new RuleEditor(),
        new Network(),
        new PhoneProxy(),
        new Setting(),
        new WhistleExntension(),
    ] as unknown) as Extension[];

    return extensions;
}
