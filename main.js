import lineReader from "line-reader";
import figlet from "figlet";
import erd from "erd";

const schemaJson = {};
let currentModel = null;

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

  lineReader.eachLine("schema.graphql", function (line, last) {
    try {
      const regexTypeModel = /(type)(\s{1})(\w*)/g;
      const modelTypeResult = regexTypeModel.exec(line);

      const regexSimpleField = /(\w*)(\:\s{1})(\S*)/g;
      const simpleFieldResult = regexSimpleField.exec(line);

      const regexMandatory = /(\S*!)/g;
      const regexNCardinality = /(\[\S*\])/g;

      if (modelTypeResult) {
        currentModel = modelTypeResult[3];
        schemaJson[currentModel] = { keys: [] };
      } else if (simpleFieldResult) {
        const fieldName = simpleFieldResult[1];
        let type = simpleFieldResult[3];
        const cardinality = type.match(regexNCardinality) ? "N" : "1";
        const mandatory = type.match(regexMandatory) ? true : false;

        type = type.replace("!", "").replace("[", "").replace("]", "");

        const item = {
          fieldName: fieldName,
          type: type,
          cardinality: cardinality,
          mandatory: mandatory,
        };
        schemaJson[currentModel]?.keys?.push(item);
      }

      if (last) doWork();
    } catch (e) {
      console.error("error", e);
    }
  });

  console.log("📄 File Reading Completed!");
};

const doWork = () => {
  const keys = Object.keys(schemaJson);

  let entity = "";
  let relations = "";

  keys.forEach((key) => {
    const value = schemaJson[key]?.keys;

    entity = `${entity}\n[${key}]`;

    value.forEach((i) => {
      entity = `${entity}\n${i.fieldName} [${i.type}]`;

      const relation = keys.find((k) => k === i.type);

      if (relation) relations = `${relations}\n${key} *--* ${relation}`;
    });

    entity = `${entity}\n`;
  });

  const modelsText = `# Entities${entity}\n# Relationships${relations}`;
  generateErd(modelsText);
};

const generateErd = (modelsText) => {
  const outputType = "pdf";

  erd({ modelsText, outputType });
};

const main = () => {
  initMessage().then(() => {
    readOriginalSchema();
  });
};

main();
