const express = require("express");
const router = express.Router();
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const { agoraAppId, agoraCertificate } = require("../config/secrets");

router.get("/token", (req, res) => {
  const { channel, uid } = req.query;

  const appId = agoraAppId();
  const appCertificate = agoraCertificate();

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channel,
    parseInt(uid),
    role,
    privilegeExpireTime
  );

  res.json({ token });
});

module.exports = router;
