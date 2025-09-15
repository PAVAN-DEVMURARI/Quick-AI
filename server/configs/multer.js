import multer from 'multer';

// Using memory storage because files are likely forwarded to an AI / Cloudinary service.
// If you prefer writing to disk, swap to diskStorage with destination & filename.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
	// Accept images & pdf (extend as needed)
	if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
		cb(null, true);
	} else {
		cb(new Error('Unsupported file type'), false);
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export default upload;
