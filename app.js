const fs = require("fs/promises");

// open the file
// read the file

(async () => {
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_FILE = "add to the file";

  const createFile = async (path) => {
    try {
      const existingFileHandler = await fs.open(path, "r");
      existingFileHandler.close();
      return console.log(`The file already exists at: ${path}`);
    } catch (error) {
      const newFileHandler = await fs.open(path, "w");
      console.log(`The file created at: ${path}`);
      newFileHandler.close();
    }
  };

  const deleteFile = async (path) => {
    try {
      const existingFileHandler = await fs.open(path, "r");
      await fs.unlink(path);
      existingFileHandler.close();
      return console.log(`The file deleted at: ${path}`);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`The file does not exist at: ${path}`);
      } else {
        console.log("An error occurred: " + error);
      }
    }
  };

  const renameFile = async (oldPath, newPath) => {
    try {
      const existingFileHandler = await fs.open(oldPath, "r");
      await fs.rename(oldPath, newPath);
      existingFileHandler.close();
      return console.log(`The file renamed from: ${oldPath} to: ${newPath}`);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log(`file does not exist at ${oldPath}`);
      } else {
        console.log("An error occurred: " + error);
      }
    }
  };

  const addToFile = async (path, content) => {
    try {
      const fileHandler = await fs.open(path, "a");
      fileHandler.write(content);
      fileHandler.close();
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("No such file");
      } else {
        console.log("An error occurred: " + error);
      }
    }
  };
  const watcher = fs.watch("./command.txt");
  const commandFileHandler = await fs.open("./command.txt", "r"); // open the file

  commandFileHandler.on("change", async () => {
    const size = (await commandFileHandler.stat()).size;
    const buff = Buffer.alloc(size);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;

    await commandFileHandler.read(buff, offset, length, position);
    const command = buff.toString("utf-8");

    // create a file
    // create a file <path>
    if (command.includes(CREATE_FILE)) {
      const path = command.substring(CREATE_FILE.length + 1);
      createFile(path);
    }

    // delete the file
    // delete the file <path>
    if (command.includes(DELETE_FILE)) {
      const path = command.substring(DELETE_FILE.length + 1);
      deleteFile(path);
    }

    // rename the file
    // rename the file <oldPath> <newPath>
    if (command.includes(RENAME_FILE)) {
      const idx = command.indexOf(" to ");
      const oldPath = command.substring(RENAME_FILE.length + 1, idx);
      const newPath = command.substring(idx + 4);
      renameFile(oldPath, newPath);
    }

    // add to the file
    // add to the file <path> This content: <content>
    if (command.includes(ADD_FILE)) {
      const idx = command.indexOf(" This content: ");
      const path = command.substring(ADD_FILE.length + 1, idx);
      const content = command.substring(idx + 15);
      addToFile(path, content);
    }
  });

  // watcher
  for await (event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
