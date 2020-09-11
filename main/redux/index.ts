import proxy from './proxy';
import app from './app';
import rules from './rules';

export default {
  reducers: {
    ...proxy.reducers,
    ...app.reducers,
    ...rules.reducers,
  },
  effects: {
    ...proxy.effects,
    ...app.effects,
    ...rules.effects,
  },
};
