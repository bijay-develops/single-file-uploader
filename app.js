const express = require("express");
const multer = require("multer");  // Middleware for handling file uploads
const path = require("path");
const fs = require("fs");

const app = express();
const port = 4000;

app.set("view engine", "ejs");  // telling express to use ejs as templating engine

app.set("views", path.join(__dirname, "views"));  // setting the folder where .ejs fils are located

// ------------------------------
// Configure Multer storage engine
// ------------------------------
const storage = multer.diskStorage({
    // define where uploaded files will be stored
  destination: (req, file, cb) => {
    cb(null, "filestorage/");  // 'null' indicates no error, and 'filestorage/' is the upload directory
  },
  filename: (req, file, cb) => {
    // define the file naming convention
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);  // 'null' indicates no error, and 'filename' is the new file name
  },
});

//Initializing multer with the defined storage engine
const upload = multer({ storage });

// ------------------------------
// Serve static files from 'filestorage' directory
// ------------------------------
app.use("/uploads", express.static(path.join(__dirname, "filestorage")));   // This allows users to access uploaded files via a URL like /uploads/<filename>


// ------------------------------
// Route: GET /
// ------------------------------
// Renders the home page (index.ejs)
app.get("/", (req, res) => {
    res.render("index");
});

// ------------------------------
// Route: POST /upload
// ------------------------------
// Handles file uploads from a form input with name="file"
// Multer's 'upload.single()' middleware processes one file at a time
app.post('/upload', upload.single('file'), (req, res)=> {
    res.redirect('/')
});

// ------------------------------
// Route: DELETE /delete/:filename
// ------------------------------
// Deletes a file from the filestorage directory by name
app.delete('/delete/:filename', (req, res)=> {
    const filename = req.params.filename;  // Extract filename from URL 
    const filepath = path.join(__dirname, 'filestorage', filename);  // Construct full file path

    //Check if the file exists before trying to delete
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);   // Delete the file synchronously
        res.send(`File ${filename} deleted successfully.`);
    } else {
        res.status(404).send('File not found.');
    }
});

// ------------------------------
// Route: Get /view
// ------------------------------
// Lists all uploaded files in the 'filestorage' directory
app.get('/view', (req, res) => {
    const uploadDirectory = path.join(__dirname, 'filestorage');

    // Read directory contents asynchronously
    fs.readdir(uploadDirectory, (err, files) => {
        if(err){
            console.error(err);
            res.status(500).send('Error reading the upload directory');
        } else {
            // Snding back the JSON object with the list of file names
            res.json({ files});
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});