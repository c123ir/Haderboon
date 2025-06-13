import { Project } from '../types';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'فروشگاه آنلاین ماهان',
    description: 'پروژه فروشگاه آنلاین با React و Node.js',
    path: '/projects/mahan-shop',
    userId: 'user1',
    filesCount: 47,
    lastAnalyzed: '2024-06-13T10:30:00Z',
    status: 'ready',
    createdAt: '2024-06-10T09:00:00Z',
    updatedAt: '2024-06-13T10:30:00Z',
  },
  {
    id: '2',
    name: 'اپلیکیشن مدیریت وظایف',
    description: 'برنامه مدیریت وظایف تیمی با Vue.js',
    path: '/projects/task-manager',
    userId: 'user1',
    filesCount: 23,
    lastAnalyzed: '2024-06-12T14:20:00Z',
    status: 'analyzing',
    createdAt: '2024-06-08T11:15:00Z',
    updatedAt: '2024-06-12T14:20:00Z',
  },
];

export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find(project => project.id === id);
};