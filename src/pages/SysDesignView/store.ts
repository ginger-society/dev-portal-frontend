import create from 'zustand';

interface NodeState {
  nodes: any[]; // Replace with appropriate type if available
  setNodes: (nodes: any[]) => void; // Replace with appropriate type if available
}

const useStore = create<NodeState>((set) => ({
  nodes: [],
  setNodes: (nodes) => set({ nodes }),
}));

export default useStore;
