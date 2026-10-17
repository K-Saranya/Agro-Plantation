const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const Model = require("../models");

const SAFE_COLUMNS = {
  auths: {
    name: "VARCHAR(255)",
    token: "VARCHAR(512)",
    role: "VARCHAR(255) DEFAULT 'customer'",
  },
  products: {
    salePrice: "INTEGER",
  },
};

async function columnExists(queryInterface, table, column) {
  const description = await queryInterface.describeTable(table).catch(() => null);
  return Boolean(description && description[column]);
}

async function ensureColumns() {
  const queryInterface = Model.sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();
  const names = tables.map((table) => (typeof table === "string" ? table : table.tableName || table.name));

  for (const [table, columns] of Object.entries(SAFE_COLUMNS)) {
    if (!names.includes(table)) continue;
    for (const [column, type] of Object.entries(columns)) {
      if (await columnExists(queryInterface, table, column)) continue;
      await Model.sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    }
  }
}

const products = [
  ["Spider Plant", "/media/pro-47.jpg", 249, 199, "A trailing air-purifier that shrugs off missed waterings.", 24, "Air Purifying", "/media/pro-16-600x744.jpg", "/media/pro-47.jpg", "/media/pro-9.jpg", "/media/pro-11.jpg"],
  ["Peace Lily", "/media/pro-15-600x744.jpg", 349, null, "Glossy leaves and white spathes for brighter rooms.", 16, "Air Purifying", "/media/pro-15-600x744.jpg", "/media/pro-19-1-600x744.jpg", "/media/p8.jpg", "/media/pro-33.jpg"],
  ["Snake Plant", "/media/pro-32-600x744.jpg", 299, 259, "Upright swords of green that thrive in low light.", 30, "Air Purifying", "/media/pro-32-600x744.jpg", "/media/pro-30-600x744.jpg", "/media/pro-35-600x744.jpg", "/media/p6.jpg"],
  ["Areca Palm", "/media/p6.jpg", 599, null, "Feathery fronds that soften a living room corner.", 10, "Air Purifying", "/media/p6.jpg", "/media/pro-38-600x744.jpg", "/media/pro-40-600x744.jpg", "/media/banner-6.jpg"],
  ["Cafe Fiddle", "/media/pro-12-600x744.jpg", 799, 699, "A statement fig sized for cafe counters and lobbies.", 8, "Cafe Plant", "/media/pro-12-600x744.jpg", "/media/pro-6-600x744.jpg", "/media/pro-5.jpg", "/media/pro-3.jpg"],
  ["Parlour Palm", "/media/pro-2-600x744.jpg", 279, null, "Compact palm that stays polite on a cafe table.", 18, "Cafe Plant", "/media/pro-2-600x744.jpg", "/media/p6.jpg", "/media/pro-23.jpg", "/media/pro-24.jpg"],
  ["Italian Stone Pine", "/media/p1.jpg", 450, null, "A young pine with a sculptural trunk for patios.", 12, "Out Door Plant", "/media/p1.jpg", "/media/pro-37.jpg", "/media/green-field-with-sun.jpg", "/media/leaf1.jpg"],
  ["European Cypress", "/media/pro-10-600x744.jpg", 520, 460, "Narrow evergreen for entrances and terrace pots.", 9, "Out Door Plant", "/media/pro-10-600x744.jpg", "/media/pro-37.jpg", "/media/p1.jpg", "/media/banner-8.jpg"],
  ["Speckled Clay Pot", "/media/pro-22-1.jpg", 180, null, "Hand-finished ceramic pot, 16 cm, with a drainage hole.", 40, "Ceramic Pots", "/media/pro-22-1.jpg", "/media/pro-23.jpg", "/media/pro-24.jpg", "/media/pro-33.jpg"],
  ["Sandstone Bowl", "/media/pro-23.jpg", 220, 180, "Low ceramic bowl for succulents and table groupings.", 28, "Ceramic Pots", "/media/pro-23.jpg", "/media/pro-24.jpg", "/media/pro-22-1.jpg", "/media/pro-33.jpg"],
  ["Ivory Cylinder", "/media/pro-24.jpg", 260, null, "Tall matte cylinder that lifts a floor plant.", 15, "Ceramic Pots", "/media/pro-24.jpg", "/media/pro-22-1.jpg", "/media/pro-23.jpg", "/media/categories-4.jpg"],
  ["Jade Succulent", "/media/p2.jpg", 160, null, "Thick leaves that store water for weeks.", 36, "Indoor Plants", "/media/p2.jpg", "/media/pro-8-600x744.jpg", "/media/pro-600x744.jpg", "/media/pro-54-600x744.jpg"],
  ["Pink Dragon Tree", "/media/p5.jpg", 420, 360, "Slender cane with pink-edged ribbons of foliage.", 14, "Indoor Plants", "/media/p5.jpg", "/media/pro-25-600x744.jpg", "/media/pro-19-1-600x744.jpg", "/media/p4.jpg"],
  ["Aurora", "/media/p4.jpg", 310, null, "A compact houseplant with warm new growth.", 20, "Indoor Plants", "/media/p4.jpg", "/media/p5.jpg", "/media/pro-44-600x744.jpg", "/media/pro-50-600x744.jpg"],
  ["ZZ Plant", "/media/pro-30-600x744.jpg", 340, null, "Nearly indestructible glossy leaves for busy desks.", 22, "Low Maintanence", "/media/pro-30-600x744.jpg", "/media/pro-32-600x744.jpg", "/media/p7.jpg", "/media/pro-35-600x744.jpg"],
  ["Pothos Marble", "/media/pro-7-600x744.jpg", 190, 150, "Trailing vine that forgives irregular watering.", 32, "Low Maintanence", "/media/pro-7-600x744.jpg", "/media/pro-9.jpg", "/media/pro-11.jpg", "/media/pro-47.jpg"],
  ["Office Rubber", "/media/pro-46-600x744.jpg", 480, null, "Broad burgundy leaves that anchor an open office.", 11, "Office Plant", "/media/pro-46-600x744.jpg", "/media/pro-44-600x744.jpg", "/media/pro-6-600x744.jpg", "/media/pro-12-600x744.jpg"],
  ["Desk Calathea", "/media/pro-16-600x744.jpg", 270, 230, "Painted leaves that stay compact on a shelf.", 17, "Office Plant", "/media/pro-16-600x744.jpg", "/media/pro-7-600x744.jpg", "/media/pro-19-1-600x744.jpg", "/media/p8.jpg"],
  ["Roses Plant", "/media/p3.jpg", 380, null, "A potted rose for a sunny window or balcony.", 13, "House Plants", "/media/p3.jpg", "/media/pro-53-600x744.jpg", "/media/pro-57-600x744.jpg", "/media/categories-2.jpg"],
  ["Sago Palm", "/media/p7.jpg", 560, null, "Architectural cycad with stiff, glossy fronds.", 7, "House Plants", "/media/p7.jpg", "/media/p6.jpg", "/media/pro-2-600x744.jpg", "/media/pro-38-600x744.jpg"],
  ["Peace House Lily", "/media/p8.jpg", 290, 240, "A smaller peace lily bred for side tables.", 19, "House Plants", "/media/p8.jpg", "/media/pro-15-600x744.jpg", "/media/pro-33.jpg", "/media/categories-3.jpg"],
  ["The Beginner Set", "/media/pro-52-600x744.jpg", 899, 749, "Three easy plants, pots, and a care card.", 10, "Plant Bundle", "/media/pro-52-600x744.jpg", "/media/p2.jpg", "/media/pro-600x744.jpg", "/media/pro-47.jpg"],
  ["Window Trio", "/media/pro-50-600x744.jpg", 760, null, "A matched set of trailing, upright, and compact plants.", 8, "Plant Bundle", "/media/pro-50-600x744.jpg", "/media/pro-52-600x744.jpg", "/media/pro-54-600x744.jpg", "/media/p4.jpg"],
  ["Echeveria", "/media/pro-8-600x744.jpg", 140, null, "A tight rosette in powdery blue-green.", 42, "Succulents", "/media/pro-8-600x744.jpg", "/media/pro-54-600x744.jpg", "/media/p2.jpg", "/media/pro-600x744.jpg"],
  ["Aloe", "/media/pro-600x744.jpg", 180, 140, "Medicinal aloe in a nursery grow pot.", 26, "Succulents", "/media/pro-600x744.jpg", "/media/pro-8-600x744.jpg", "/media/p2.jpg", "/media/pro-23.jpg"],
  ["Haworthia Cluster", "/media/pro-54-600x744.jpg", 210, null, "Striped windows that stay small for years.", 21, "Succulents", "/media/pro-54-600x744.jpg", "/media/pro-8-600x744.jpg", "/media/pro-600x744.jpg", "/media/pro-22-1.jpg"],
  ["Botanic Monstera", "/media/pro-6-600x744.jpg", 890, null, "Fenestrated leaves from the Botanic collection.", 6, "Botanic", "/media/pro-6-600x744.jpg", "/media/pro-5.jpg", "/media/pro-12-600x744.jpg", "/media/banner-5.jpg"],
  ["Flora Fern", "/media/pro-35-600x744.jpg", 240, null, "A soft fern from the Flora range.", 18, "Flora", "/media/pro-35-600x744.jpg", "/media/pro-33.jpg", "/media/leaf1.jpg", "/media/categories-5.jpg"],
  ["Flora Anthurium", "/media/pro-53-600x744.jpg", 410, 350, "Lacquered red blooms that last for weeks.", 12, "Flora", "/media/pro-53-600x744.jpg", "/media/p3.jpg", "/media/pro-57-600x744.jpg", "/media/categories-2.jpg"],
  ["Freshy Herb Pot", "/media/pro-40-600x744.jpg", 160, null, "A kitchen herb started in the Freshy nursery.", 25, "Freshy", "/media/pro-40-600x744.jpg", "/media/pro-38-600x744.jpg", "/media/leaf1.jpg", "/media/green-field-with-sun.jpg"],
  ["Freshy Citrus", "/media/pro-38-600x744.jpg", 670, 590, "A young citrus tree ready for a bright balcony.", 5, "Freshy", "/media/pro-38-600x744.jpg", "/media/pro-40-600x744.jpg", "/media/p1.jpg", "/media/banner-8.jpg"],
  ["Frienly Pothos", "/media/pro-9.jpg", 175, null, "A full hanging pothos from Frienly growers.", 27, "Frienly", "/media/pro-9.jpg", "/media/pro-11.jpg", "/media/pro-7-600x744.jpg", "/media/pro-47.jpg"],
  ["Frienly Philodendron", "/media/pro-11.jpg", 320, null, "Heart-shaped leaves on a moss pole.", 14, "Frienly", "/media/pro-11.jpg", "/media/pro-9.jpg", "/media/pro-6-600x744.jpg", "/media/pro-5.jpg"],
  ["Natural Croton", "/media/pro-25-600x744.jpg", 360, 300, "Painted foliage grown without synthetic dyes.", 11, "Natural", "/media/pro-25-600x744.jpg", "/media/p5.jpg", "/media/pro-44-600x744.jpg", "/media/categories-3.jpg"],
];

const testimonials = [
  ["Meera Krishnan", "/media/test.jpg", "The peace lily arrived wrapped, hydrated, and already pushing a new leaf. It looks exactly like the photograph."],
  ["Arjun Patel", "/media/test-2.jpg", "I furnished a small office with the low-maintenance set. Six months later everything is still alive, which is a first."],
  ["Divya Nair", "/media/test-4.jpg", "Checkout was clear, the pot was packed properly, and the care note was actually useful. I have already ordered a second plant."],
];

async function seedIfEmpty() {
  const productCount = await Model.product.count();
  if (productCount === 0) {
    await Model.product.bulkCreate(
      products.map(([name, img, price, salePrice, dec, quantety, category, cover1, cover2, cover3, cover4]) => ({
        name,
        img,
        price,
        salePrice,
        dec,
        quantety,
        category,
        cover1,
        cover2,
        cover3,
        cover4,
      }))
    );
  }

  const storyCount = await Model.testimonial.count();
  if (storyCount === 0) {
    await Model.testimonial.bulkCreate(
      testimonials.map(([name, img, content]) => ({ name, img, content }))
    );
  }

  const userCount = await Model.auth.count();
  if (userCount === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    await Model.auth.create({
      name: "Agro Admin",
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      password: hash,
      role: "admin",
    });
  }
}

async function ready() {
  const uploadDir = path.join(__dirname, "..", "public", "media", "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });
  await Model.sequelize.authenticate();
  await Model.sequelize.sync();
  await ensureColumns();
  await seedIfEmpty();
}

module.exports = { ready };
