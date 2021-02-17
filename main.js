import figlet from "figlet";
import erd from "erd";
import fs from "fs";
import { parse } from "graphql";

const schemaJson = {};

// Functions
const initMessage = () => {
  return new Promise((resolve, reject) => {
    figlet("Graphql-ERD!!!", function (err, data) {
      if (err) {
        console.log("Something went wrong...");
        console.dir(err);
        reject();
        return;
      }
      console.log(data);
      resolve();
    });
  });
};

const readOriginalSchema = () => {
  console.log("📄 Reading File...");
  try {
    var schema = fs.readFileSync("./schema.graphql").toString("utf-8");
    const parsedDocument = parse(schema);

    const definitions = parsedDocument.definitions;

    definitions.forEach((definition) => {
      const modelName = definition?.name?.value;
      const fields = definition.fields;
      schemaJson[modelName] = [];

      fields.forEach((field) => {
        const fieldName = field?.name?.value;

        const standardFielType = field?.type?.name?.value;
        const complexFieldType = field?.type?.type?.name?.value;

        const fieldType = standardFielType || complexFieldType;

        const item = {
          fieldName: fieldName,
          type: fieldType,
        };
        schemaJson[modelName]?.push(item);
      });
    });
    console.log("📄 File Reading Completed!");

    doWork();
  } catch (e) {
    console.log(`❌ Error Occurred - ${e.message}`);
  }
};

const doWork = () => {
  try {
    console.log("🛠 Generating Structure Started!");

    const keys = Object.keys(schemaJson);

    let entity = "";
    let relations = "";

    keys.forEach((key) => {
      const value = schemaJson[key];

      entity = `${entity}\n[${key}]`;

      value.forEach((i) => {
        entity = `${entity}\n${i.fieldName} [${i.type}]`;

        const relation = keys.find((k) => k === i.type);

        if (relation) relations = `${relations}\n${key} *--* ${relation}`;
      });

      entity = `${entity}\n`;
    });

    const modelsText = `# Entities${entity}\n# Relationships${relations}`;
    console.log("🛠 Generating Structure Completed!");

    generateErd(modelsText);
  } catch (e) {
    console.log(`❌ Error Occurred - ${e.message}`);
  }
};

const generateErd = (modelsText) => {
  try {
    console.log("🖨 Generating Output Starting!");

    const outputType = "pdf";

    erd({ modelsText, outputType });

    console.log("🖨 Generating Output Completed!");
  } catch (e) {
    console.log(`❌ Error Occurred - ${e.message}`);
  }
};

const main = () => {
  initMessage().then(() => {
    readOriginalSchema();
  });
};

main();
