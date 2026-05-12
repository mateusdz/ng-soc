import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";

type WorkflowPreviewProps = {
  nodes: Node[];
  edges: Edge[];
};

export function WorkflowPreview({ nodes, edges }: WorkflowPreviewProps) {
  if (nodes.length === 0) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
        No workflow steps were found in this playbook.
      </div>
    );
  }

  return (
    <div className="h-[520px] overflow-hidden rounded-lg border border-slate-200 bg-white">
      <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}>
        <Background />
        <MiniMap pannable zoomable />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
