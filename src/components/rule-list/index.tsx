import React, { useState } from 'react';
import {
  Draggable,
  DragDropContext,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import classnames from 'classnames';
import { useRules } from '../../hooks/use-rules';

export interface Rule {
  name: string;
  uuid: string;
  content: string;
  enabled: boolean;
  rename?: boolean;
}

interface RuleListProps {
  rules: Rule[];
  reorder: (fromIndex: number, toIndex: number) => void;
  selected: number;
  onSelected: (index: number) => void;
}

export const RuleList = (props: RuleListProps) => {
  const { rules, reorder, selected, onSelected } = props;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    reorder(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {rules.map((item, index) => {
              const className = classnames({
                selected: index === selected,
                enabled: !item.rename && item.enabled,
              });

              return (
                <Draggable
                  key={item.uuid}
                  draggableId={item.uuid}
                  index={index}
                >
                  {(provided) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={className}
                        onClick={() => onSelected(index)}
                      >
                        {item.name}
                      </div>
                    );
                  }}
                </Draggable>
              );
            })}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
