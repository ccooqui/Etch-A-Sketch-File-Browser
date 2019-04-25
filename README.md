# Project Title
Etch-A-Sketch File Browser

## Main Components
The main components include functionality to view files and directories, navigate through directories, create empty files, delete files, create empty folders, delete folders, displaying information about selected files, and an additional feature to allow the user to draw on the canvas.


## Installing and Use

`npm install`
`npm start`

The user will be presented with 3 directories to begin in, Home, Desktop, and Documents. From there the user can view files and traverse through directories.

When a user clicks on a file or directory icon, the infomation will be displayed under the "File Information" label. The name, size, creation time, and modification time will be listed. The options to delete the file or folder will appear, and an additional option for folders to "open" which will make that folder the current directory to display the contents of.

To create a new file or folder select either the file icon with "+" or the folder with "+" and it will generate a new file or folder with the default name "newFile" or "newFolder"

To go parent directy select the folder icon with an upwards arrow.

To access the drawing canvas click on the pencil icon.

## Built With

* [Pixi.js](http://www.pixijs.com) - 
A rendering library that allows you to create interactive graphics and cross platform applications.
* [os](https://nodejs.org/api/os.html) - Provides operating system-related utility methods.
* [fs](https://nodejs.org/api/fs.html) - Reads and writes to files.
* [path](https://nodejs.org/api/path.html) - Provides utilities for working with file and directory paths.


