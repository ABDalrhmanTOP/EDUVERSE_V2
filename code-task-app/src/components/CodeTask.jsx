// src/components/CodeTask.jsx
import React from "react";
import CodeTaskTrueFalse from "./CodeTaskTrueFalse";
import CodeTaskCode from "./CodeTaskCode";
import CodeTaskMCQ from "./CodeTaskMCQ";

const CodeTask = ({ task, onTaskComplete, onReturn }) => {
  // Switch on the "type" field:
  if (task.type === "truefalse") {
    return (
      <CodeTaskTrueFalse
        task={task}
        onTaskComplete={onTaskComplete}
        onReturn={onReturn}
      />
    );
  } else if (task.type === "mcq") {
    return (
      <CodeTaskMCQ
        task={task}
        onTaskComplete={onTaskComplete}
        onReturn={onReturn}
      />
    );
  } else {
    // Default to code task (or if task.type === 'code')
    return (
      <CodeTaskCode
        task={task}
        onTaskComplete={onTaskComplete}
        onReturn={onReturn}
      />
    );
  }
};

export default CodeTask;
