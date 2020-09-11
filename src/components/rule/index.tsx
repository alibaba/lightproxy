import React, { useState, useEffect } from 'react';
import { RuleList } from '../rule-list';
import { useRules } from '../../hooks/use-rules';
import { Editor } from '../editor';

const useSelected = () => {
  const [selected, setSelected] = useState(0);
  return {
    selected,
    onSelected: setSelected,
  };
};

export const Rule = () => {
  const rules = useRules();
  const selected = useSelected();

  return (
    <div className="flex mb-4">
      <div className="w-1/5 bg-gray-500 h-12">
        <RuleList
          rules={rules.ruleList}
          reorder={rules.reorder}
          selected={selected.selected}
          onSelected={selected.onSelected}
        />
      </div>
      <div className="w-4/5 bg-gray-400 h-12">
        <Editor
          content={rules.ruleList[selected.selected]?.content || ''}
          handleChange={(content) =>
            rules.updateRule(selected.selected, content)
          }
          onSave={() => {
            console.log('toast save');
          }}
          onMount={() => {
            console.log('mount');
          }}
        ></Editor>
      </div>
    </div>
  );
};
