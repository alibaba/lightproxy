import proxy from './proxy';
import app from './app';

export default {
  reducers: {
    ...proxy.reducers,
    ...app.reducers,
  },
  effects: {
    ...proxy.effects,
    ...app.effects,
  },
};
