import express from "express";
import path from "node:path"
import bodyParser from "body-parser";
import { readFileSync, appendFileSync, writeFileSync } from "fs";
import multer from "multer";



import * as base64 from "base64-js"; // Add this line



const app = express();
const port = 3000;


app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("assests"));

app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



let dirname = process.cwd();


app.get("/",(req,res)=>{

  const filePath = path.resolve(dirname, "info.txt");
  const fileContents = readFileSync(filePath, 'utf8');
  const dataInfo = JSON.parse(fileContents);
  
  res.render("index.ejs",{dataInfo});
})



app.post("/submit", upload.single("image"), (req, res) => {
  const { Category, title, link } = req.body;

  let newData = {
    Category,
    title,
    link,
    image: `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`,
  };



  const filePath = path.resolve(dirname, "info.txt");
  const existingData = readFileSync(filePath, { encoding: "utf-8" });


  let dataArray = JSON.parse(existingData.trim() || '[]');


  dataArray.push(newData);

  const updatedContent = JSON.stringify(dataArray, null, 2);


  writeFileSync(filePath, updatedContent, { encoding: "utf-8" });



  res.redirect("/");
  
});

app.get("/newPost", (req, res) => {
  res.render("newPost.ejs");
});

app.get("/editPost",(req,res)=>{


const filePath = path.resolve(dirname, "info.txt");
  const fileContents = readFileSync(filePath, 'utf8');
  const dataInfo = JSON.parse(fileContents);
  res.render("editPost.ejs",{dataInfo});

});

var receivedIndex;
app.post("/edit",(req,res)=>{
  
  receivedIndex = req.body.index;
  console.log('Received index from client:', receivedIndex);
  res.json({ redirectTo: "/changePost" }); 

});



app.get("/changePost",(req,res)=>{
   res.render("changePost.ejs");
});

app.post("/change", upload.single("image"), (req, res) => {
  const { Category, title, link } = req.body;

  let newData = {
    Category,
    title,
    link,
    image: `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`,
  };
  const filePath = path.resolve(dirname, "info.txt");
  const fileContents = readFileSync(filePath, { encoding: "utf-8" });


let data = JSON.parse(`${fileContents}`);


const indexToReplace = receivedIndex;

console.log(indexToReplace +" "+ data.length);

if (indexToReplace >= 0 && indexToReplace < data.length) {

  data[indexToReplace] = newData;


  const updatedJsonString = JSON.stringify(data, null, 2);


  
  writeFileSync(filePath, updatedJsonString, { encoding: "utf-8" });

  console.log('Object at index', indexToReplace, 'has been replaced.');

  res.redirect("/");
}
 else {
  console.log('Invalid index.');
}

});

app.get("/deletePost",(req,res)=>{
  const filePath = path.resolve(dirname, "info.txt");
  const fileContents = readFileSync(filePath, 'utf8');
  const dataInfo = JSON.parse(fileContents);
  res.render("deletePost.ejs",{dataInfo});
});



app.post("/delete",(req,res)=>{

  const indexToDelete = req.body.index;
  console.log('Received index from client:', indexToDelete);



  const filePath = path.resolve(dirname, "info.txt");
  const fileContents = readFileSync(filePath, 'utf8');
  

  let data = JSON.parse(fileContents);
  

  console.log(indexToDelete);

  if (indexToDelete >= 0 && indexToDelete < data.length)
   {

    data.splice(indexToDelete, 1);
  
    const updatedJsonString = JSON.stringify(data, null, 2);


    
  writeFileSync(filePath, updatedJsonString, { encoding: "utf-8" });

  console.log('Object at index', indexToDelete, 'has been deleted.');
  

  res.json({ redirectTo: "/" });


  
  } 
  else {
    console.log('Invalid index.');
  }
  
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});









