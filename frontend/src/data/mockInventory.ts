import { InventoryItem, InventoryCategory } from '../types/erp';

export const INVENTORY_CATEGORIES: {
  category: InventoryCategory;
  items: string[];
}[] = [
  {
    category: 'IT Equipment',
    items: [
      'Laptop',
      'Desktop Computer',
      'Monitor',
      'Keyboard',
      'Mouse',
      'Printer',
      'Scanner',
      'Server',
      'Router',
      'Network Switch',
      'Projector',
      'UPS',
      'Webcam',
      'Headset',
    ],
  },
  {
    category: 'Office Equipment & Furniture',
    items: [
      'Office Table',
      'Office Chair',
      'Meeting Table',
      'Conference Chair',
      'Filing Cabinet',
      'Bookshelf',
      'Reception Desk',
      'Whiteboard',
      'Air Conditioner',
      'Fan',
      'Water Dispenser',
    ],
  },
  {
    category: 'Other Office Items',
    items: [
      'Telephone',
      'CCTV Camera',
      'Access Control Device',
      'Power Strip',
      'Extension Board',
    ],
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [];
