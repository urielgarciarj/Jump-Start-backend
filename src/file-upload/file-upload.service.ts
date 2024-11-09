import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class FileUploadService {
  
  // Método para manejar la subida de imágenes
  static imageFileFilter(req, file, callback) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(new Error('Invalid file type'), false);
    }
    callback(null, true);
  }

  static storageDestination(fieldName: string) {
    return diskStorage({
      destination: (req, file, callback) => {
        // Aquí puedes definir directorios diferentes según la entidad
        let path = './uploads';
        if (fieldName === 'profile') {
          path += '/profile-pics';
        } else if (fieldName === 'university-logo') {
          path += '/university-logos';
        } else if (fieldName === 'company-logo') {
          path += '/company-logos';
        }
        callback(null, path);
      },
      filename: (req, file, callback) => {
        const name = file.originalname.split('.')[0];
        const extension = extname(file.originalname);
        const newFilename = `${name}-${Date.now()}${extension}`;
        callback(null, newFilename);
      }
    });
  }
}
