import React, { useState, useEffect } from 'react';
import { RuleList } from '../rule-list';
import { useRules } from '../../hooks/use-rules';
import { Editor } from '../editor';

export const Rule = () => {
  const rules = useRules();

  return (
    <div className="flex mb-4">
      <div className="w-1/5 bg-gray-500 h-12">
        <RuleList
          rules={rules.ruleList}
          reorder={rules.reorder}
          selected={rules.selected}
          onSelected={rules.onSelected}
        />
      </div>
      <div className="w-4/5 bg-gray-400 h-12">
        <Editor
          content={rules.ruleList[rules.selected]?.content || ''}
          handleChange={(content) => rules.updateRule(rules.selected, content)}
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
