/**
 * hooks for proxy helper install
 */

import { useSelector, useDispatch } from 'react-redux';
import { State } from '../common/redux/state';
import { useMemo, useState, useEffect, useCallback } from 'react';
import update from 'immutability-helper';
import { Rule } from '../components/rule-list';

export function useRules() {
  const remoteRules = useSelector((state: State) => {
    return state.rules;
  });

  const [rules, setRules] = useState<Rule[]>(remoteRules);

  useEffect(() => {
    setRules(remoteRules);
  }, [remoteRules]);

  const reorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const from = rules[fromIndex];
      const newList = update(rules, {
        $splice: [
          [fromIndex, 1],
          [toIndex, 0, from],
        ],
      });
      setRules(newList);
    },
    [rules],
  );

  const updateRule = (index: number, content: string) => {
    setRules(
      update(rules, {
        [index]: {
          content: {
            $set: content,
          },
        },
      }),
    );
  };

  const [selected, setSelected] = useState(0);

  return {
    ruleList: rules,
    reorder,
    updateRule,

    selected,
    onSelected: setSelected,
  };
}
