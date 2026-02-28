
import { StatusGroup } from './types';

export const inventoryData: StatusGroup[] = [
  {
    id: 'grp-instock',
    status: 'In Stock',
    children: [
      {
        id: 'p1',
        product: 'Sony Alpha A7 IV',
        sku: 'SON-A7IV',
        status: 'In Stock',
        stock: 15,
        price: 2400,
        cost: 1800,
        rating: 4.7,
        sales: 13,
        services: [
          { id: 'p1-s1', type: 'Lens Clean', date: '2024-10-12', notes: 'Full kit QA' },
          { id: 'p1-s2', type: 'Firmware Update', date: '2025-02-03' },
        ],
      },
      {
        id: 'p2',
        product: 'Samsung Odyssey G9',
        sku: 'SAM-ODG9',
        status: 'In Stock',
        stock: 7,
        price: 1299,
        cost: 950,
        rating: 4.5,
        sales: 9,
        services: [{ id: 'p2-s1', type: 'Panel QA', date: '2025-01-18' }],
      },
    ],
  },
  {
    id: 'grp-restocking',
    status: 'Restocking',
    children: [
      {
        id: 'p3',
        product: 'Dell XPS 15',
        sku: 'DEL-XPS15',
        status: 'Restocking',
        stock: 8,
        price: 1599,
        cost: 1200,
        rating: 4.6,
        sales: 48,
        services: [
          { id: 'p3-s1', type: 'Battery Check', date: '2024-12-01' },
          { id: 'p3-s2', type: 'Thermal Paste Replace', date: '2025-02-22' },
        ],
      },
    ],
  },
  {
    id: 'grp-out',
    status: 'Out of Stock',
    children: [
      {
        id: 'p4',
        product: 'Toyota Corolla Dashcam Pro',
        sku: 'TOY-CAMPRO',
        status: 'Out of Stock',
        stock: 0,
        price: 296,
        cost: 210,
        rating: 4.1,
        sales: 52,
        services: [{ id: 'p4-s1', type: 'RMA Assessment', date: '2025-01-10' }],
      },
    ],
  },
];
