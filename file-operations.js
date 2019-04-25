var fs = require('fs-extra'); // Load the File System to execute our common tasks (CRUD)
const os = require('os');
const path = require('path');
const { Error } = require('./renderer');


function readFiles(dir, processFile) {
    // read directory
    fs.readdir(dir, (error, fileNames) => {
      if (error) throw error;
  
      fileNames.forEach(filename => {
        // get current file name
        const name = path.parse(filename).name;
        // get current file extension
        const ext = path.parse(filename).ext;
        // get current file path
        const filepath = path.resolve(dir, filename);
  
        // get information about the file
        fs.stat(filepath, function(error, stat) {
          if (error) throw error;
  
          // check if the current path is a file or a folder
          const isFile = stat.isFile();
  
            // callback, do something with the file
            processFile(filepath, name, ext, stat);
        });
      });
    });
  }

async function deleteFolder(folder) {
  try {
      await fs.remove(folder)
      //done
  } catch (err) {
      console.error(err)
  }
}

//takes in absolute path and creates empty file
function createFile(dirpath) {
  let i = 1;
  let flag = 0;
  let fPath;
  while (flag === 0){
    let fName = "newFile"+i+".txt";
    fPath = path.join(dirpath, fName);
    if (!fs.existsSync(fPath)) {
      //file exists
      flag = 1;
    }
    i++;
  }
  try{
    fs.writeFileSync(fPath, "");
  }catch (e){
      console.log("Cannot write file ", e);
  }
}

function createFolder(dirpath) {
  let i = 1;
  let flag = 0;
  let fPath;
  while (flag === 0){
    let fName = "newFolder"+i;
    fPath = path.join(dirpath, fName);
    if (!fs.existsSync(fPath)) {
      //file exists
      flag = 1;
    }
    i++;
  }
  try{
    fs.mkdirSync(fPath);
  }catch (e){
      console.log("Cannot write file ", e);
  }
}

function getParentDir(n){
  return path.join(n, '../');
}

function deleteFile(fName) {
  fs.stat(fName, function (err, stats) {
    console.log(stats);//here we got all information of file in stats variable
 
    if (err) {
        return console.error(err);
    }
 
    fs.unlink(fName,function(err){
         if(err) return console.log(err);
         console.log('file deleted successfully');
    });  
 });
}

/*   readFiles(chosenPath, (filepath, name, ext, stat) => {
    console.log('file path:', filepath);
    console.log('file name:', name);
    console.log('file extension:', ext);
    console.log('file information:', stat);
  }); */
/* 
//remove folders

async function removeFolder(folder) {
    try {
        await fs.remove(folder)
        //done
    } catch (err) {
        console.error(err)
    }
}


//copy files or folders

fs.copy('/tmp/myfile', '/tmp/mynewfile', err => {
    if (err) return console.error(err)
  
    console.log('success!')
}) // copies file

fs.copy('/tmp/mydir', '/tmp/mynewdir', err => {
    if (err) return console.error(err)
  
    console.log('success!')


})  */// copies directory, even if it has subdirectories or files

  
  /* 
  const folder = '/Users/flavio'
  removeFolder(folder) 
  */


/*
create new folder
const fs = require('fs')

const folderName = '/Users/flavio/test'

try {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir)
  }
} catch (err) {
  console.error(err)
} */

exports.readFiles = readFiles;
exports.getParentDir = getParentDir;
exports.createFile = createFile;
exports.createFolder = createFolder;
exports.deleteFile = deleteFile;
exports.deleteFolder = deleteFolder;