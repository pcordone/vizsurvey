#!/usr/bin/env node
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import Configstore from "configstore";
import { Command, InvalidArgumentError } from "commander";
import fs from "fs";
import { DateTime } from "luxon";
import readline from "readline";
import isValid from "is-valid-path";
import { parseCSV, parseJSON, convertToCSV } from "./src/parserUtil.js";
import { convertKeysToUnderscore } from "./src/ObjectUtil.js";
import { CSVDataFilenameFromKey } from "./src/QuestionSliceUtil.js";
import {
  writeFile,
  loadFile,
  fullPath,
  appendSepToPath,
  isCSVExt,
  isJSONExt,
  directoryOrFileExists,
  getDirectory,
} from "./src/files.js";
import { askS3BucketInfo } from "./src/inquier.js";
import { init, listFiles, downloadFile } from "./src/S3.js";
import { MergedData } from "./src/MergedData.js";
import { drawStatus, updateStats, createStat } from "./src/monitorUtil.js";

export const AMAZON_S3_BUCKET_KEY = "amazonS3Bucket";
export const AMAZON_REGION__KEY = "amazonRegion";
export const AMAZON_ACCESS_KEY_ID = "amazonAccessKeyId";
export const AMAZON_SECRET_ACCESS_KEY = "amazonSecretAccessKey";

clear();

console.log(
  chalk.yellow(figlet.textSync("Discounters", { horizontalLayout: "full" }))
);

const mergeCSVData = (CSVData, mergedData) => {
  if (CSVData) {
    console.log(`...merging data ${CSVData.length} rows`);
    mergedData.push(CSVData[0]);
    console.log(`...data merged`);
  } else {
    console.log(`...no data to merge`);
  }
};

const validateInt = (value, dummyPrevious) => {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError("Not a number.");
  }
  return parsedValue;
};

const validateDate = (value, dummyPrevious) => {
  const result = DateTime.fromFormat(value, "MM/dd/yyyy");
  if (result.invalidReason) {
    throw new InvalidArgumentError("Not a valid date.");
  }
  return result;
};

const validatePath = (value, dummyPrevious) => {
  if (!isValid(value)) {
    throw new InvalidArgumentError("Not a valid path.");
  }
  if (!directoryOrFileExists(value)) {
    throw new InvalidArgumentError("Path or file does not exist.");
  }
  return value;
};

const run = async () => {
  const createMergeFile = (filename, mergedData) => {
    if (mergedData && mergedData.length > 0) {
      console.log(`...creating merged file ${filename}`);
      const CSVData = convertToCSV(mergedData);
      writeFile(filename, CSVData);
    } else {
      console.log(`...no data for merged file ${filename}...`);
    }
  };

  const conf = new Configstore("discounters");
  if (!conf.has(AMAZON_S3_BUCKET_KEY)) {
    const settings = await askS3BucketInfo();
    conf.set(settings);
  }

  init(conf);

  const program = new Command();
  program
    .name("discounters")
    .description(
      "CLI for processing files created from vizsurvey capturing participants survey answers."
    )
    .version("1.0.0");

  program
    .command("download")
    .description("Downloads files from the S3 bucket.")
    .argument("<directory>", "directory to store the files in.")
    .option(
      "-l, --laterthan <date>",
      "the date to filter out files that are are equal to or later than",
      validateDate
    )
    .action((source, options) => {
      try {
        console.log(`Downloading files from S3 bucket...`);
        listFiles().then((response) => {
          const files = response.Contents.filter((file) => {
            if (
              options.laterthan &&
              DateTime.fromJSDate(file.LastModified) < options.laterthan
            ) {
              console.log(
                `...skipping ${file.Key} since the date is before ${options.laterthan}`
              );
              return false;
            } else {
              return true;
            }
          });
          files.forEach((file) => {
            console.log(
              `...downloading file ${file.Key} created on date ${file.LastModified}`
            );
            const data = downloadFile(file, (error) => {
              console.log(chalk.red(error));
            }).then((data) => {
              const fullPath = `${appendSepToPath(source)}${file.Key}`;
              console.log(`...writing file ${file.Key}`);
              fs.writeFile(fullPath, data, (err) => {
                if (err) {
                  console.log(
                    chalk.red(`error writing file ${param.file.Key}`, err)
                  );
                  throw err;
                }
              });
            });
          });
        });
      } catch (err) {
        console.log(chalk.red(err));
      }
    });

  program
    .command("split")
    .description(
      "Splits out the CSV files that are in the JSON file if a single file is passed or all JSON files in the directory if a directory is passed.  The CSV files will be writen to the same folder as the JSON file."
    )
    .argument(
      "<filename or directory>",
      "filename or directory to split",
      validatePath
    )
    .action((dirOrFilename, options) => {
      const surveyData = new MergedData();
      try {
        console.log(`splitting "${dirOrFilename}`);
        const files = fs.lstatSync(dirOrFilename).isDirectory()
          ? fs.readdirSync(dirOrFilename).filter((file) => {
              return isJSONExt(file);
            })
          : dirOrFilename;
        for (const file of files) {
          const absolutePath = fullPath(dirOrFilename, file);
          const JSONStr = loadFile(absolutePath);
          console.log(`parsing file ${absolutePath}`);
          const JSONData = parseJSON(JSONStr);
          for (const property in JSONData) {
            // store the data as a merged object by participantId-studyId-sessionId
            const CSVData = parseCSV(JSONData[property].data);
            console.log(`...merging data for property ${property}`);
            surveyData.addEntry(CSVData);
          }
        }
        surveyData.callbackOnEntries((value, key) => {
          const filename = CSVDataFilenameFromKey(key);
          console.log(`...writing csv file ${filename}`);
          const underscoreObj = convertKeysToUnderscore(value);
          writeFile(
            fullPath(getDirectory(dirOrFilename), filename),
            convertToCSV([underscoreObj])
          );
        });
      } catch (err) {
        console.log(chalk.red(err));
        return;
      }
    });

  program
    .command("merge")
    .description(
      "Creates a merge file from CSV files in the directory passed as an argument.  The CSV files will be writen to the same folder as the CSV files."
    )
    .argument("<directory>", "directory containg csv files to merge")
    .action((source, options) => {
      // TODO implement -c option
      console.log(`Scanning directory ${source} for merging...`);
      try {
        const mergedData = new Array();
        console.log(`merging ${source}`);
        const files = options.filename
          ? options.filename
          : fs.readdirSync(source).filter((file) => {
              return isCSVExt(file);
            });
        for (const file of files) {
          console.log(`considering merging file ${file}`);
          if (file === "data-merged.csv") {
            console.log(chalk.yellow(`...skipping file ${file}`));
          } else {
            mergeCSVData(
              parseCSV(loadFile(fullPath(source, file))),
              mergedData
            );
          }
        }
        createMergeFile(fullPath(source, "data-merged.csv"), mergedData);
      } catch (err) {
        console.log(chalk.red(err));
        return;
      }
    });

  program
    .command("monitor")
    .description(
      "Monitors the status of an experiment running by downloading the S3 files and reporting summary statistics in real time to the screen."
    )
    .argument(
      "<number participants>",
      "the total number of participants the experiment was ran for.  Used to update the percent progress bars",
      validateInt
    )
    .option(
      "-l, --laterthan <date>",
      "the date to filter out files that are are equal to or later than",
      validateDate
    )
    .action((totalParticipants, options) => {
      try {
        console.log(
          `Monitoring experiment with ${totalParticipants} total participants that started  ${
            options.laterthan ? options.laterthan : "all"
          }" ...`
        );
        var startMonitoring = false;
        console.log(chalk.red("Press Enter to start monitoring."));
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        process.stdin.on("keypress", (str, key) => {
          if (key.ctrl && key.name === "c") {
            console.log("monitor ending.");
            process.exit(); // eslint-disable-line no-process-exit
          } else if (key.name === "return") {
            startMonitoring = true;
          }
        });
        let stats;
        let inRefresh = false;
        let nIntervId = setInterval(() => {
          if (startMonitoring) {
            try {
              if (inRefresh) return;
              inRefresh = true;
              listFiles().then((response) => {
                const files = response.Contents.filter((file) => {
                  if (
                    isCSVExt(file.Key) &&
                    (!options.laterthan ||
                      (options.laterthan &&
                        DateTime.fromJSDate(file.LastModified) >=
                          options.laterthan))
                  ) {
                    return true;
                  } else {
                    return false;
                  }
                });
                stats = createStat();
                let filesDownloaded = 0;
                files.forEach((file, index) => {
                  downloadFile(
                    file /*, (error) => {
                    //console.log(chalk.red(error));
                  }*/
                  ).then((data) => {
                    filesDownloaded++;
                    updateStats(stats, parseCSV(data)[0]);
                    if (filesDownloaded === files.length) {
                      clear();
                      drawStatus(
                        totalParticipants,
                        stats,
                        startMonitoring
                      ).output();
                    }
                  });
                });
              });
              inRefresh = false;
            } catch (err) {
              console.log(chalk.red(err));
            }
          }
        }, 1000);
      } catch (err) {
        console.log(chalk.red(err));
        return;
      }
    });

  program.parse();
};

run();
