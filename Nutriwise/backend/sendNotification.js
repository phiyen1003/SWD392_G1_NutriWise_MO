const admin = require("./firebaseAdmin");

async function sendPushNotification(deviceToken, title, body) {
  const message = {
    token: deviceToken,
    notification: {
      title: title,
      body: body,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// Test gửi thông báo
const testDeviceToken = "TOKEN_CUA_BAN"; // Thay bằng token thật từ Expo Go
sendPushNotification(testDeviceToken, "Xin chào!", "Đây là thông báo thử nghiệm.");
