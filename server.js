const express = require("express");
const webPush = require("web-push");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Configure web push with VAPID keys
const vapidKeys = {
  publicKey:
    "BPed5i9CEwE0nb1RnWkfdgXxfwvFqzn5lbHpnyJR4Wk3JiSWcb48-p5aX2fcuiqkoHsRgM3UlFABBRUTOMg8_ig",
  privateKey: "O27VzlCOtNr1lm0APK05dYvpWuX2ETQngzO_jB5MpSg",
};

webPush.setVapidDetails(
  "mailto:your-email@example.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Store subscriptions in memory (you should use a database in production)
let subscriptions = [];

// Route to subscribe to push notifications
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

// Route to send push notifications
app.post("/send-notification", (req, res) => {
  const notificationPayload = {
    notification: {
      title: "New Notification",
      body: "This is a push notification from your server!",
      icon: "your-icon-url",
    },
  };

  Promise.all(
    subscriptions.map((subscription) =>
      webPush.sendNotification(
        subscription,
        JSON.stringify(notificationPayload)
      )
    )
  )
    .then(() =>
      res.status(200).json({ message: "Notification sent successfully." })
    )
    .catch((err) => {
      console.error("Error sending notification:", err);
      res.status(500).json({ error: "Error sending notification" });
    });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
