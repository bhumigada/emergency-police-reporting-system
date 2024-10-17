const Media = require('../models/Media');
const multer = require("multer")
const path = require("path")

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
  
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now()+".jpg")
    }
  })

    
var upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb){
    
        
        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);
  
        var extname = filetypes.test(path.extname(
                    file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
      
        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes);
      } 
  
}).single("image");  

const UploadController = { 
    uploadImage: async (req, res) => {
        
            upload(req,res,async function (err) {
                
                console.log(res.req.file.filename);
                if(err) {
                    res.send(err)
                }
                else {
                    const media = new Media({
                        "original_file":res.req.file.filename
                    
                    });
                    try {
                        await media.save();
                        res.status(200).send({ "message": "Image added." });
                    } catch (e) {
                        res.status(400).send(e);
                    }
                    
                }
            })
        
    },
    getOriginalImage: async (req, res) => {
        try{
                const media = await Media.findById(req.params.id);
        
                if(!media)
                {
                    res.status(404).send({"error" : "Media not found"})
                }
                    res.status(200).send({ "file": "localhost:5500/uploads/"+media.original_file });
            
        }catch (e){
            console.log(e)
            res.status(400).send(e);

        }

        
    
    }
}
module.exports = UploadController;
