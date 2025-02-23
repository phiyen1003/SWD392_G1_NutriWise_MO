const admin = require("firebase-admin");
const serviceAccount = require("D:\SWD392\SWD392_G1_NutriWise_MO\Nutriwise\backend\firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
