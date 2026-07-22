const fs = require("fs");
const path = require("path");

const text = fs.readFileSync(path.join(__dirname, "../../client/src/data/menuCatalog.js"), "utf8");
const start = text.indexOf("export const MENU_FOODS");
const end = text.indexOf("export function categoryLabel");
const block = text.slice(start, end);

const foods = [];
const re =
  /\{\s*_id:\s*"([^"]+)",\s*categoryId:\s*"([^"]+)",\s*fname:\s*"([^"]+)",\s*image:\s*"([^"]+)",\s*description:\s*"([^"]*)",/g;
let match;
while ((match = re.exec(block))) {
  foods.push({
    categorySlug: match[2],
    fname: match[3],
    image: match[4],
    description: match[5],
  });
}

const outPath = path.join(__dirname, "../src/menuFoodsSeed.json");
fs.writeFileSync(outPath, JSON.stringify(foods, null, 2));
console.log(`Wrote ${foods.length} foods to ${outPath}`);
