/**
 * hooks for proxy helper install
 */

import { useSelector, useDispatch } from 'react-redux';
import { State } from '../common/redux/state';
import { useMemo } from 'react';
import { rulesReorder } from '../common/redux/actions';

export function useRules() {
  const rules = useSelector((state: State) => {
    return state.rules;
  });

  const dispatch = useDispatch();

  const reorder = (fromIndex: number, toIndex: number) => {
    dispatch(
      rulesReorder({
        fromIndex,
        toIndex,
      }),
    );
  };

  return {
    ruleList: rules,
    reorder,
  };
}
