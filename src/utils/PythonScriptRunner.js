import  { exec } from 'child_process'
import  fs from 'fs'

// Function to run the Python script
export function runPythonScript(scriptPath, callback) {
    // exec("pwd")
    exec(`python ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Python script error: ${stderr}`);
            return;
        }
        console.log(`Python script output: ${stdout}`);
        callback();  // Once the script is done, execute the callback function
    });
}

// Function to load and manipulate the generated JSON file
export function handleGeneratedFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err.message}`);
            return;
        }
        
        // Parse the JSON data
        try {
            const jsonData = JSON.parse(data);
            console.log("Parsed JSON data:", jsonData[0]);

            // Perform some operations on the parsed JSON data
            // For example, let's log a specific property from the JSON data:
            // if (jsonData.someKey) {
            //     console.log(`Value of someKey: ${jsonData.someKey}`);
            // }

        } catch (jsonErr) {
            console.error(`Error parsing JSON: ${jsonErr.message}`);
        }
    });
}

// Main function to run the Python script and then process the generated JSON file
// function main() {
//     const pythonScript = 'script/Scraper_ventureBeat.py';  // Path to your Python script
//     const generatedFile = 'script/final_articles_ventureBeat.json';  // Path to the generated JSON file by the Python script

//     runPythonScript(pythonScript, () => {
//         console.log("Python script finished. Now processing the JSON file...");
//         handleGeneratedFile(generatedFile);
//     });
// }

// // // Start the process
// main();
