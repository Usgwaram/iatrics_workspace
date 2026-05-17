const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const { agoraAppId, agoraCertificate } = require("../config/secrets");

function generateToken(channelName, uid) {
  const role = RtcRole.PUBLISHER;

  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    agoraAppId(),
    agoraCertificate(),
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  return token;
}

module.exports = { generateToken };
