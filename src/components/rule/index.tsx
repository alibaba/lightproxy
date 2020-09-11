import React from 'react';
import { RuleList } from '../rule-list';

export const Rule = () => {
  return (
    <div className="flex mb-4">
      <div className="w-1/5 bg-gray-500 h-12">
        <RuleList ruleList={[]} />
      </div>
      <div className="w-4/5 bg-gray-400 h-12"></div>
    </div>
  );
};
