import { BlockData, BlockType, Connection, MarkerType } from "@/components/organisms/UMLEditor/types";

export const mockBlocks: BlockData[] = [
  { id: '1', rows: [{ id: 'row-1', data: {} }], position: { top: 100, left: 100 }, data: {}, type: BlockType.Table },
  { id: '2', rows: [{ id: 'row-2', data: {} }], position: { top: 300, left: 500 }, data: {}, type: BlockType.Table },
  { id: '3', rows: [{ id: 'row-3', data: {} }], position: { top: 500, left: 900 }, data: {}, type: BlockType.Table },
  { id: '4', rows: [{ id: 'row-4', data: {} }, { id: 'row-5', data: {} }, { id: 'row-6', data: {} }], position: { top: 100, left: 300 }, data: {}, type: BlockType.Table }
  // Add more blocks as needed
];

export const mockConnections: Connection[] = [
  {
    block1Id: '1',
    fromRow: 0,
    block2Id: '2',
    toRow: 0,
    marker: MarkerType.Circle,
    label: "User (tenant_id) -> Tenant  ",
  },
  // Add more connections as needed
]

