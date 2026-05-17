const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const { agoraAppId, agoraCertificate } = require("../config/secrets");

const generateToken = (req, res) => {
  const { channelName, uid } = req.query;

  if (!channelName || !uid) {
    return res.status(400).json({ message: "channelName and uid required" });
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    agoraAppId(),
    agoraCertificate(),
    channelName,
    parseInt(uid),
    role,
    privilegeExpireTime
  );

  return res.json({ token });
};

module.exports = { generateToken };
