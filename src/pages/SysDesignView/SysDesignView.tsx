import { PageLayout } from "@/shared/PageLayout";
import { useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
} from "react-flow-renderer";
import {
  FaDatabase,
  FaCogs,
  FaLink,
  FaServer,
  FaCode,
  FaTools,
} from "react-icons/fa";
import dagre from "dagre";
import useStore from "./store";

const initialNodes: Node<any>[] = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: {
      label: (
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "red",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FaDatabase size={24} />
          <span>IAM Database</span>
          <div>
            <button onClick={() => alert("Edit")} style={{ margin: "2px" }}>
              Edit
            </button>
            <button onClick={() => alert("Delete")} style={{ margin: "2px" }}>
              Delete
            </button>
          </div>
        </div>
      ),
    },
    draggable: true,
  },
  {
    id: "2",
    position: { x: 300, y: 0 },
    data: {
      label: (
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "red",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FaDatabase size={24} />
          <span>Metadata Database</span>
          <div>
            <button onClick={() => alert("Edit")} style={{ margin: "2px" }}>
              Edit
            </button>
            <button onClick={() => alert("Delete")} style={{ margin: "2px" }}>
              Delete
            </button>
          </div>
        </div>
      ),
    },
    draggable: true,
  },
  {
    id: "3",
    position: { x: 150, y: 200 },
    data: {
      label: (
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "lightblue",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FaCogs size={24} />
          <span>IAM Service</span>
          <div>
            <button onClick={() => alert("Edit")} style={{ margin: "2px" }}>
              Edit
            </button>
            <button onClick={() => alert("Delete")} style={{ margin: "2px" }}>
              Delete
            </button>
          </div>
        </div>
      ),
    },
    draggable: true,
  },
  {
    id: "4",
    position: { x: 450, y: 300 },
    data: {
      label: (
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "lightblue",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FaCogs size={24} />
          <span>Metadata Service</span>
          <div>
            <button onClick={() => alert("Edit")} style={{ margin: "2px" }}>
              Edit
            </button>
            <button onClick={() => alert("Delete")} style={{ margin: "2px" }}>
              Delete
            </button>
          </div>
        </div>
      ),
    },
    draggable: true,
  },
  {
    id: "5",
    position: { x: 0, y: 400 },
    data: {
      label: (
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "lightgreen",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FaLink size={24} />
          <span>IAM Customer Portal</span>
          <div>
            <button onClick={() => alert("Edit")} style={{ margin: "2px" }}>
              Edit
            </button>
            <button onClick={() => alert("Delete")} style={{ margin: "2px" }}>
              Delete
            </button>
          </div>
        </div>
      ),
    },
    draggable: true,
  },
  {
    id: "6",
    position: { x: 300, y: 600 },
    data: {
      label: (
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "lightgreen",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FaLink size={24} />
          <span>Dev Portal</span>
          <div>
            <button onClick={() => alert("Edit")} style={{ margin: "2px" }}>
              Edit
            </button>
            <button onClick={() => alert("Delete")} style={{ margin: "2px" }}>
              Delete
            </button>
          </div>
        </div>
      ),
    },
    draggable: true,
  },
  {
    id: "7",
    position: { x: 600, y: 0 },
    data: {
      label: (
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "orange",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FaServer size={24} />
          <span>San Diego Cache</span>
          <div>
            <button onClick={() => alert("Edit")} style={{ margin: "2px" }}>
              Edit
            </button>
            <button onClick={() => alert("Delete")} style={{ margin: "2px" }}>
              Delete
            </button>
          </div>
        </div>
      ),
    },
    draggable: true,
  },
  {
    id: "8",
    position: { x: 150, y: 800 },
    data: {
      label: (
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "lightcoral",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FaCode size={24} />
          <span>Ginger-releaser</span>
          <div>
            <button onClick={() => alert("Edit")} style={{ margin: "2px" }}>
              Edit
            </button>
            <button onClick={() => alert("Delete")} style={{ margin: "2px" }}>
              Delete
            </button>
          </div>
        </div>
      ),
    },
    draggable: true,
  },
  {
    id: "9",
    position: { x: 450, y: 900 },
    data: {
      label: (
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "lightcoral",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FaTools size={24} />
          <span>Ginger-scaffolder</span>
          <div>
            <button onClick={() => alert("Edit")} style={{ margin: "2px" }}>
              Edit
            </button>
            <button onClick={() => alert("Delete")} style={{ margin: "2px" }}>
              Delete
            </button>
          </div>
        </div>
      ),
    },
    draggable: true,
  },
  {
    id: "10",
    position: { x: 600, y: 600 },
    data: {
      label: (
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "lightcoral",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FaServer size={24} />
          <span>db-compose</span>
          <div>
            <button onClick={() => alert("Edit")} style={{ margin: "2px" }}>
              Edit
            </button>
            <button onClick={() => alert("Delete")} style={{ margin: "2px" }}>
              Delete
            </button>
          </div>
        </div>
      ),
    },
    draggable: true,
  },
  {
    id: "11",
    position: { x: 800, y: 900 },
    data: {
      label: (
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "lightcoral",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FaServer size={24} />
          <span>Ginger connector</span>
          <div>
            <button onClick={() => alert("Edit")} style={{ margin: "2px" }}>
              Edit
            </button>
            <button onClick={() => alert("Delete")} style={{ margin: "2px" }}>
              Delete
            </button>
          </div>
        </div>
      ),
    },
    draggable: true,
  },
  {
    id: "12",
    position: { x: 1000, y: 1000 },
    data: {
      label: (
        <div
          style={{
            padding: 10,
            borderRadius: 5,
            backgroundColor: "lightcoral",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FaServer size={24} />
          <span>Ginger-UI</span>
          <div>
            <button onClick={() => alert("Edit")} style={{ margin: "2px" }}>
              Edit
            </button>
            <button onClick={() => alert("Delete")} style={{ margin: "2px" }}>
              Delete
            </button>
          </div>
        </div>
      ),
    },
    draggable: true,
  },
];

const initialEdges: Edge[] = [
  { id: "e1-3", source: "1", target: "3", animated: true, label: "used in" },
  { id: "e2-4", source: "2", target: "4", animated: true, label: "used in" },
  { id: "e3-5", source: "3", target: "5", animated: true, label: "used in" },
  { id: "e4-6", source: "4", target: "6", animated: true, label: "used in" },
  { id: "e3-6", source: "3", target: "6", animated: true, label: "used in" },
  {
    id: "e7-3",
    source: "7",
    target: "3",
    animated: true,
    label: "common cache",
  },
  {
    id: "e7-4",
    source: "7",
    target: "4",
    animated: true,
    label: "common cache",
  },
  { id: "e3-8", source: "3", target: "8", animated: true, label: "depends on" },
  { id: "e4-9", source: "4", target: "9", animated: true, label: "depends on" },
  {
    id: "e4-10",
    source: "4",
    target: "10",
    animated: true,
    label: "depends on",
  },
  {
    id: "e4-11",
    source: "4",
    target: "11",
    animated: true,
    label: "depends on",
  },
  {
    id: "e3-12",
    source: "3",
    target: "12",
    animated: true,
    label: "used in portals",
  },
  {
    id: "e4-12",
    source: "4",
    target: "12",
    animated: true,
    label: "used in portals",
  },
];

const SystemDesignView = () => {
  const { setNodes } = useStore((state: { setNodes: any }) => ({
    setNodes: state.setNodes,
  }));

  useEffect(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({});
    g.setDefaultEdgeLabel(() => ({}));

    initialNodes.forEach((node) => {
      g.setNode(node.id, { width: 172, height: 150 });
    });

    initialEdges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    const newNodes = initialNodes.map((node) => {
      const { x, y } = g.node(node.id);
      return { ...node, position: { x, y } };
    });

    setNodes(newNodes);
  }, [setNodes]);

  return (
    <PageLayout>
      <div style={{ height: "calc(100vh - 51px)" }}>
        <ReactFlow nodes={initialNodes} edges={initialEdges}>
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </PageLayout>
  );
};

export default SystemDesignView;
