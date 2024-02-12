const express = require("express");
const webPush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import the cors middleware

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());

const CONFIG = {
  PUBLIC_KEY:
    "BPed5i9CEwE0nb1RnWkfdgXxfwvFqzn5lbHpnyJR4Wk3JiSWcb48-p5aX2fcuiqkoHsRgM3UlFABBRUTOMg8_ig",
  PRIVATE_KEY: "O27VzlCOtNr1lm0APK05dYvpWuX2ETQngzO_jB5MpSg",
};

// Configure web push with VAPID keys
webPush.setVapidDetails(
  "mailto:test@example.com",
  CONFIG.PUBLIC_KEY,
  CONFIG.PRIVATE_KEY
);

// Middleware
app.use(bodyParser.json());

const dummyDb = { subscriptions: [] };

// fake Promise to simulate async call
const saveSubscriptionToDb = async (subscription) => {
  dummyDb.subscriptions.push(subscription);
  return Promise.resolve(dummyDb);
};

const getSubscriptionsFromDb = () => {
  return Promise.resolve(dummyDb.subscriptions);
};

// Route to save subscription to the database
app.post("/subscribe", async (req, res) => {
  try {
    const subscription = req.body;

    if (!subscription) {
      console.error("No subscription was provided!");
      return res
        .status(400)
        .json({ message: "error", error: "No subscription provided" });
    }

    await saveSubscriptionToDb(subscription);

    res.status(200).json({ message: "success" });
  } catch (error) {
    console.error("Error processing subscription:", error);
    res.status(500).json({ message: "error", error: "Internal server error" });
  }
});

// Route to send push notifications
app.get("/send-notification", async (req, res) => {
  try {
    const subscriptions = await getSubscriptionsFromDb();

    subscriptions.forEach((subscription) => {
      const payload = JSON.stringify({
        title: "WebPush Notification!",
        body: "Hello World",
      });
      webPush
        .sendNotification(subscription, payload)
        .catch((err) => console.error("Error sending notification:", err));
    });

    res.status(200).json({ message: `${subscriptions.length} messages sent!` });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ message: "error", error: "Internal server error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
