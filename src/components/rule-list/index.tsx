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

export const RuleList = () => {
  const rules = useRules();

  const [selected, setSelected] = useState(0);
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    rules.reorder(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            className="lightproxy-rule-list no-drag"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {rules.ruleList.map((item, index) => {
              const className = classnames({
                'lightproxy-rule-list-item': true,
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
