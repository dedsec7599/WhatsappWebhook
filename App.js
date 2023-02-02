const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { request } = require("express");
require("dotenv").config();

const app = express().use(bodyParser.json());

const token = process.env.TOKEN; // for sending the request
const mytoken = process.env.MYTOKEN; // for verifying the webhook

app.listen(process.env.PORT, () => {
  console.log(`Webhook listening on ${process.env.PORT}`);
});

//verify callback url from dshboard side - client api side
app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.MYTOKEN) {
      res.status(200).send(challange);
    } else {
      res.status(403);
    }
  }
});

app.post("/webhook", (req, res) => {
  let body_param = req.body;

  console.log(JSON.stringify(body_param, null, 2));

  if (body_param.object) {
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0].value.messages &&
      body_param.entry[0].changes[0].value.messages[0]
    ) {
      let phone_no_id =
        body_param.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body_param.entry[0].changes[0].value.messages[0].from;
      let msg_body = body_param.entry[0].changes[0].value.messages[0];

      axios.AxiosHeaders({
        method: "post",
        url:
          "https://graph.facebook.com/v15.0/" +
          phone_no_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: "Hi __ harsh",
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

app.get("/", (req, res) => {
  res.status(200).send("working fine");
});

function extractLatLng(url) {
  request(
    `https://www.googleapis.com/urlshortener/v1/url?key=${YOUR_API_KEY}&shortUrl=${url}`,
    { json: true },
    (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      // Extract the long URL from the response
      const longUrl = body.longUrl;
      // Extract the location from the long URL
      const location = longUrl.split("/@")[1];
      // Split the location into latitude and longitude
      const [latitude, longitude] = location.split(",");
      console.log(`Latitude: ${latitude}`);
      console.log(`Longitude: ${longitude}`);

      request(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${YOUR_API_KEY}`,
        { json: true },
        (err, res, body) => {
          if (err) {
            return console.log(err);
          }
          console.log(body);
        }
      );
    }
  );
}
