import React from 'react';
import CodeTaskTrueFalse from './CodeTaskTrueFalse';
import CodeTaskCode from './CodeTaskCode';

const CodeTask = ({ task, onTaskComplete }) => {
  if (task.type === 'truefalse') {
    return <CodeTaskTrueFalse task={task} onTaskComplete={onTaskComplete} />;
  }
  return <CodeTaskCode task={task} onTaskComplete={onTaskComplete} />;
};

export default CodeTask;
