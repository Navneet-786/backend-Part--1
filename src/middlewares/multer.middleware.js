const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

//create a multer diskstorage storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniquePrefix = uuidv4() + "-" + Date.now();
    cb(null, uniquePrefix + "-" + file.originalname);
  },
});

export const upload = multer({
  storage,
});
