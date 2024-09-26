import { diskStorage } from 'multer';
import * as path from 'path';

export const multerOptions = (dir) => {
  const storage = diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, `../../${dir}/uploads`);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    },
  });

  return {
    storage,
  };
};
