import path from 'path';

// In Docker this is a mounted volume (/app/data); locally it falls back to
// a folder next to the project root so `npm run dev` works without setup.
export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
