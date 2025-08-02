import React, { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Handle,
  BezierEdge,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  LayoutGrid,
  Search,
  Webhook,
  Mail,
  GitBranch,
  Bookmark,
  MousePointerClick,
  Sparkles,
  Settings,
  Input,
  Textarea,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

const initialNodes = [
  { id: '1', type: 'customNode', position: { x: 50, y: 50 }, data: { title: 'Webhook Trigger', summary: 'Listens for incoming webhooks', status: 'success' } },
  { id: '2', type: 'customNode', position: { x: 350, y: 50 }, data: { title: 'Send Email', summary: 'Sends an email notification', status: 'error' } },
  { id: '3', type: 'customNode', position: { x: 350, y: 250 }, data: { title: 'Create Git Branch', summary: 'Creates a new branch in a Git repository', status: 'running' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'customEdge' },
  { id: 'e1-3', source: '1', target: '3', type: 'customEdge' },
];

const nodeTypes = { customNode: CustomNode };
const edgeTypes = { customEdge: CustomEdge };

const availableNodes = [
  { id: 'webhook', name: 'Webhook Trigger', icon: <Webhook size={20} /> },
  { id: 'email', name: 'Send Email', icon: <Mail size={20} /> },
  { id: 'git', name: 'Create Git Branch', icon: <GitBranch size={20} /> },
];

const availableBlueprints = [
  { id: 'blueprint1', name: 'Marketing Automation', icon: <Bookmark size={20} /> },
  { id: 'blueprint2', name: 'Sales Pipeline', icon: <Bookmark size={20} /> },
];

function CustomNode({ data, selected }) {
  const statusColor = data.status === 'success' ? 'bg-green-500' : data.status === 'error' ? 'bg-red-500' : data.status === 'running' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500';

  return (
    <div className={`bg-node-bg border-2 rounded-xl shadow-lg w-64 ${selected ? 'border-accent-primary' : 'border-node-border'}`}>
      <div className="p-3 border-b border-node-border flex items-center gap-3">
        {data.title === 'Webhook Trigger' && <Webhook size={20} />}
        {data.title === 'Send Email' && <Mail size={20} />}
        {data.title === 'Create Git Branch' && <GitBranch size={20} />}
        <span className="font-bold">{data.title}</span>
        <div className={`w-2 h-2 rounded-full ${statusColor} ml-auto`} />
      </div>
      <div className="p-3 text-sm text-text-secondary">{data.summary}</div>
      <Handle type="target" position="left" style={{ borderRadius: 0, width: 12, height: 12, backgroundColor: '#9CA3AF' }} />
      <Handle type="source" position="right" style={{ borderRadius: 0, width: 12, height: 12, backgroundColor: '#9CA3AF' }} />
    </div>
  );
}

function CustomEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const edgeColor = data?.error ? 'var(--accent-error)' : 'var(--text-muted)';
  const animatedClass = data?.running ? 'animated-edge' : '';

  return (
    <BezierEdge
      id={id}
      sourceX={sourceX}
      sourceY={sourceY}
      targetX={targetX}
      targetY={targetY}
      sourcePosition={sourcePosition}
      targetPosition={targetPosition}
      style={{ stroke: edgeColor, strokeWidth: 2 }}
      pathOptions={{ className: animatedClass }}
    />
  );
}

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [activeTab, setActiveTab] = useState('nodes');
  const [selectedNode, setSelectedNode] = useState(null);
  const { setViewport } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'customEdge' }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const handleDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    const position = {
      x: event.clientX - 325, // Adjust for panel width
      y: event.clientY - 50, // Adjust for header height
    };

    const newNode = {
      id: String(Date.now()),
      type,
      position,
      data: { title: type === 'webhook' ? 'Webhook Trigger' : type === 'email' ? 'Send Email' : 'Create Git Branch', summary: 'Some description', status: 'gray' },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const NodeItem = ({ node }) => {
    const onDragStart = (event, nodeType) => {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    };

    return (
      <div
        className="p-3 bg-node-bg rounded-lg flex items-center gap-3 cursor-grab hover:bg-gray-700 transition-colors"
        draggable
        onDragStart={(event) => onDragStart(event, node.id)}
      >
        {node.icon}
        {node.name}
      </div>
    );
  };

  const BlueprintItem = ({ blueprint }) => (
    <div className="p-3 bg-node-bg rounded-lg flex items-center gap-3 cursor-grab hover:bg-gray-700 transition-colors">
      {blueprint.icon}
      {blueprint.name}
    </div>
  );

  const DefaultInspectorView = () => (
    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
      <MousePointerClick size={48} className="mb-4" />
      Select a node to configure
    </div>
  );

  const NodeInspectorView = ({ node }) => {
    const [nodeName, setNodeName] = useState(node.data.title);

    const handleNameChange = (e) => {
      setNodeName(e.target.value);
      setNodes(nds =>
        nds.map(n => {
          if (n.id === node.id) {
            return { ...n, data: { ...n.data, title: e.target.value } };
          }
          return n;
        })
      );
    };

    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          {node.data.title === 'Webhook Trigger' && <Webhook size={24} />}
          {node.data.title === 'Send Email' && <Mail size={24} />}
          {node.data.title === 'Create Git Branch' && <GitBranch size={24} />}
          <Input
            className="bg-transparent border border-node-border rounded-lg p-2 w-full"
            value={nodeName}
            onChange={handleNameChange}
          />
        </div>

        <Accordion title="Setup">
          <div className="mb-2">
            <Label>API Endpoint</Label>
            <div className="relative">
              <Input className="bg-transparent border border-node-border rounded-lg p-2 w-full" placeholder="Enter API endpoint" />
              <button className="absolute right-2 top-2 text-text-secondary hover:text-accent-primary">
                <Sparkles size={20} />
              </button>
            </div>
          </div>
          <div className="mb-2">
            <Label>Method</Label>
            <Input className="bg-transparent border border-node-border rounded-lg p-2 w-full" placeholder="Select Method" />
          </div>
        </Accordion>

        <Accordion title="Input Data">
          <div className="mb-2">
            <Label>Data Mapping</Label>
            <Textarea className="bg-transparent border border-node-border rounded-lg p-2 w-full" placeholder="Enter data mapping configuration" />
          </div>
        </Accordion>

        <Accordion title="Advanced Settings">
          <div className="flex items-center justify-between mb-2">
            <Label>Enable Logging</Label>
            <ToggleSwitch />
          </div>
          <div>
            <Label>Timeout (seconds)</Label>
            <Input className="bg-transparent border border-node-border rounded-lg p-2 w-full" placeholder="Enter timeout value" />
          </div>
        </Accordion>
      </div>
    );
  };

  const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="mb-4">
        <div
          className="bg-node-bg border border-node-border rounded-lg p-3 flex items-center justify-between cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-medium">{title}</span>
          <Settings size={20} />
        </div>
        {isOpen && <div className="mt-2">{children}</div>}
      </div>
    );
  };

  const Label = ({ children }) => <label className="block text-sm font-medium text-text-secondary mb-1">{children}</label>;

  const ToggleSwitch = () => {
    const [enabled, setEnabled] = useState(false);

    return (
      <button
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 ${
          enabled ? 'bg-accent-primary' : 'bg-gray-400'
        }`}
        role="switch"
        aria-checked={enabled}
        onClick={() => setEnabled(!enabled)}
      >
        <span className="sr-only">Enable notifications</span>
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    );
  };

  return (
    <div className="h-screen bg-background text-text-primary grid grid-cols-[300px_1fr_350px]">

      {/* Left Panel: Palette */}
      <div className="backdrop-blur-md bg-panel-bg border-r border-panel-border p-4 flex flex-col gap-4">
        <h2 className="font-bold text-lg">Palette</h2>
        <div className="flex items-center bg-transparent border border-node-border rounded-lg p-2">
          <Search size={16} className="text-text-secondary mr-2" />
          <input
            type="text"
            placeholder="Ask AI to find a node..."
            className="bg-transparent border-none outline-none w-full text-text-primary"
          />
        </div>

        {/* Tabs Component */}
        <div className="flex">
          <button
            className={`p-2 rounded-lg w-1/2 transition-colors ${activeTab === 'nodes' ? 'bg-accent-primary text-white' : 'hover:bg-gray-700'}`}
            onClick={() => handleTabClick('nodes')}
          >
            Nodes
          </button>
          <button
            className={`p-2 rounded-lg w-1/2 transition-colors ${activeTab === 'blueprints' ? 'bg-accent-primary text-white' : 'hover:bg-gray-700'}`}
            onClick={() => handleTabClick('blueprints')}
          >
            Blueprints
          </button>
        </div>

        {/* Node/Blueprint List */}
        <div className="overflow-y-auto">
          {activeTab === 'nodes' &&
            availableNodes.map((node) => (
              <NodeItem key={node.id} node={node} />
            ))}
          {activeTab === 'blueprints' &&
            availableBlueprints.map((blueprint) => (
              <BlueprintItem key={blueprint.id} blueprint={blueprint} />
            ))}
        </div>
      </div>

      {/* Center Panel: Canvas */}
      <div className="relative" onDrop={handleDrop} onDragOver={onDragOver}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-left"
            className="bg-[url('/dot-pattern.svg')] bg-center bg-repeat"
          >
            <Controls />
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.style?.background) return n.style.background;
                return '#fff';
              }}
              nodeClassName="bg-node-bg rounded-lg"
              nodeBorderRadius={8}
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Right Panel: Inspector */}
      <div className="backdrop-blur-md bg-panel-bg border-l border-panel-border p-4 overflow-y-auto">
        {selectedNode ? (
          <NodeInspectorView node={selectedNode} />
        ) : (
          <DefaultInspectorView />
        )}
      </div>
    </div>
  );
}

export default App;
