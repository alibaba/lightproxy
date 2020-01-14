import monaco, { languages } from 'monaco-editor';
import { PROTOCOLS } from './protocols';

const conf: languages.LanguageConfiguration = {
    comments: {
        lineComment: '#',
    },
    brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
    ],
    autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
    ],
    surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
    ],
};

const language = {
    defaultToken: '',
    tokenPostfix: '.rule',

    // we include these common regular expressions
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // The main tokenizer for our languages
    tokenizer: {
        root: [
            // whitespace
            { include: '@whitespace' },

            // numbers
            [/\d+/, 'number'],

            // strings: recover on non-terminated strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
            [/'([^'\\]|\\.)*$/, 'string.invalid'], // non-teminated string
            [/"/, 'string', '@string."'],
            [/'/, 'string', "@string.'"],
        ],

        whitespace: [
            [/[ \t\r\n]+/, ''],
            [/^\s*[#;].*$/, 'comment'],
        ],

        string: [
            [/[^\\"']+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [
                /["']/,
                {
                    cases: {
                        '$#==$S2': { token: 'string', next: '@pop' },
                        '@default': 'string',
                    },
                },
            ],
        ],

        rule: [[/[a-zA-Z]+:\/\/[a-zA-Z]+/, 'string']],
    },
};

export function initRuleLanguage(mo: typeof monaco) {
    mo.languages.register({
        id: 'rule',
        extensions: ['.rule', '.properties', '.gitconfig'],
        filenames: ['config', '.gitattributes', '.gitconfig', '.editorconfig'],
        aliases: ['Rule', 'rule'],
    });

    mo.languages.registerCompletionItemProvider('rule', {
        triggerCharacters: [' '],
        // @ts-ignore
        provideCompletionItems: function() {
            const result = PROTOCOLS.map(item => {
                return {
                    label: item,
                    kind: 'function',
                    detail: item,
                    insertText: item,
                };
            });
            return Promise.resolve(result);
        },
    });

    // @ts-ignore
    mo.languages.setMonarchTokensProvider('rule', language);
    mo.languages.onLanguage('rule', () => {
        mo.languages.setLanguageConfiguration('rule', conf);
    });
}
