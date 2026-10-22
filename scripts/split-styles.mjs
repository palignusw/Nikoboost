
import fs from "node:fs";
import path from "node:path";

const dir = path.join(
  process.cwd(),
  "src",
  "components",
  "MythicPlus"
);

const mainFile = path.join(
  dir,
  "MythicPlus.module.scss"
);

const backupFile = path.join(
  dir,
  "MythicPlus.module.scss.backup"
);

const groups = [
  {
    file: "_Base.scss",
    sections: [
      "SECTION & HEADING",
      "MAIN LAYOUT",
      "COMMON OPTIONS",
    ],
  },
  {
    file: "_RunSetup.scss",
    sections: [
      "RUN SETUP",
      "PARTICIPATION CARDS",
    ],
  },
  {
    file: "_CharacterSetup.scss",
    sections: ["CHARACTER SETUP"],
  },
  {
    file: "_DungeonSetup.scss",
    sections: ["DUNGEON ALLOCATION"],
  },
  {
    file: "_LootSetup.scss",
    sections: ["LOOT TRADERS & REGION"],
  },
  {
    file: "_OrderSummary.scss",
    sections: ["ORDER SUMMARY"],
  },
  {
    file: "_Stepper.scss",
    sections: ["STEPPER"],
  },
  {
    file: "_ReviewStep.scss",
    sections: ["REVIEW STEP"],
  },
  {
    file: "_Responsive.scss",
    sections: ["RESPONSIVE"],
  },
];

if (!fs.existsSync(mainFile)) {
  throw new Error(`File not found: ${mainFile}`);
}

const original = fs
  .readFileSync(mainFile, "utf8")
  .replace(/\r\n/g, "\n");

if (original.includes('@use "./Base"')) {
  throw new Error(
    "Styles appear to be split already."
  );
}

const markerRegex =
  /^\/\/ ========================================\n\/\/ ([^\n]+)\n\/\/ ========================================/gm;

const markers = [
  ...original.matchAll(markerRegex),
];

const expected = groups.flatMap(
  (group) => group.sections
);

const found = markers.map(
  (marker) => marker[1].trim()
);

if (
  expected.length !== found.length ||
  expected.some((name, index) => name !== found[index])
) {
  console.error("Expected:", expected);
  console.error("Found:", found);

  throw new Error(
    "Section headings do not match. No files changed."
  );
}

if (fs.existsSync(backupFile)) {
  throw new Error(
    "Backup already exists. No files changed."
  );
}

const sections = {};

markers.forEach((marker, index) => {
  const start = marker.index;
  const end =
    markers[index + 1]?.index ??
    original.length;

  sections[marker[1].trim()] =
    original.slice(start, end).trim();
});

const variables =
  '@use "../../styles/variables" as *;\n\n';

// Create backup first.
fs.writeFileSync(
  backupFile,
  original,
  "utf8"
);

// Create separate SCSS partials.
for (const group of groups) {
  const content = group.sections
    .map((name) => sections[name])
    .join("\n\n");

  fs.writeFileSync(
    path.join(dir, group.file),
    variables + content + "\n",
    "utf8"
  );

  console.log("Created:", group.file);
}

// Preserve the original CSS output order.
const imports = groups
  .map((group) => {
    const name = group.file
      .replace(/^_/, "")
      .replace(/\.scss$/, "");

    return `@use "./${name}";`;
  })
  .join("\n");

fs.writeFileSync(
  mainFile,
  imports + "\n",
  "utf8"
);

console.log("\nStyles split successfully!");
console.log("Backup:", backupFile);
