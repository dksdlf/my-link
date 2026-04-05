export interface Link {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export const dummyLinks: Link[] = [
  {
    id: '1',
    title: '인스타그램',
    url: 'https://instagram.com/example',
    createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-01T10:00:00Z').toISOString(),
  },
  {
    id: '2',
    title: '유튜브',
    url: 'https://youtube.com/@example',
    createdAt: new Date('2024-01-02T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-02T10:00:00Z').toISOString(),
  },
  {
    id: '3',
    title: '블로그',
    url: 'https://blog.example.com',
    createdAt: new Date('2024-01-03T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-03T10:00:00Z').toISOString(),
  },
  {
    id: '4',
    title: 'GitHub',
    url: 'https://github.com/example',
    createdAt: new Date('2024-01-04T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-04T10:00:00Z').toISOString(),
  },
  {
    id: '5',
    title: '포트폴리오',
    url: 'https://example.com/portfolio',
    createdAt: new Date('2024-01-05T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-05T10:00:00Z').toISOString(),
  },
];
