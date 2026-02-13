import express from 'express'
import verifier from 'alexa-verifier-middleware';

const app = express()
app.use(verifier);

async function smartFetch(url, method = "GET", body = null) {
  const token = process.env.SMARTTOKEN;
  const res = await fetch(process.env.SMARTENDPOINT + url, {
    method: method,
    body: body != null ? JSON.stringify(body) : null,
    headers: {
      'Authorization': token
    }
  });
  return await res.json();
}

app.post('/api/:token/handle/', async (_req, res) => {
  const envToken = process.env.TOKEN;
  if (_req.params.token != envToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const bodyJson = _req.body;
  if (bodyJson.request != null) {
    if (bodyJson.request.type === "IntentRequest") {
      const intentName = bodyJson.request.intent.name;
      if (intentName.startsWith("PowerOn") && intentName.endsWith("Intent")) {
        const computerName = intentName.replace("PowerOn", "").replace("Intent", "").trim();
        if (computerName.length > 0) {
          const smartResponse = await smartFetch("/api/discover?deadline=1000");
          if (smartResponse.status != 200 || smartResponse.payload == null) {
            res.status(500).json({ error: "Failed to fetch smart devices" });
            return;
          }
          const smartDevices = smartResponse.payload;
          const wakeableDevices = smartDevices.filter(d => d.name.toLowerCase() === "wol");
          let wakeableMacNameCombinations = [];
          let requestedDevice = null;
          let hasIncompatible = false;
          for (const device of wakeableDevices) {
            if (device.version > 1) {
              hasIncompatible = true;
              continue;
            }
            for (const entry of device.configuration) {
              wakeableMacNameCombinations.push({
                name: entry.name,
                mac: entry.mac
              });
              if (entry.name.toLowerCase().replace("-", "").replace(" ", "").replace("_", "").replace(".", "") === computerName.toLowerCase().replace("-", "").replace(" ", "").replace("_", "").replace(".", "")) {
                requestedDevice = {
                  name: entry.name,
                  mac: entry.mac
                }
              }
            }
          }
          if (hasIncompatible) {
            console.warn("Some devices or handlers in your Smart Network are incompatible with this plugin. Consider updating them and this plugin to their latest versions.");
          }
          if (requestedDevice == null) {
            const data = {"response":{"outputSpeech":{"type":"PlainText","text": `${process.env.NOTFOUNDTEXT || "Could not find a device named"} ${computerName}, ${process.env.AVAILABLETEXT || "available devices:"} ${wakeableMacNameCombinations.map(d => d.name).join(", ")}` }}};
            res.json(data);
            return;
          }
          const data = {"response":{"outputSpeech":{"type":"PlainText","text": `${process.env.POWERTEXT || "Powering on"} ${requestedDevice.name}` }}};
          await smartFetch("/api/dev/wol/send", "POST", { mac: requestedDevice.mac });
          res.json(data);
          return;
        }
      }
    }
  }

  const data = {"response":{"outputSpeech":{"type":"PlainText","text": process.env.HELPTEXT || "Specify a computer to power-on" }}};
  res.json(data);
})

export default app
