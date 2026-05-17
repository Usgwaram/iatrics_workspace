import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const baseUrl = __ENV.BASE_URL || "http://localhost:5002";
const password = __ENV.TEST_PASSWORD || "Password123!";
const scenario = __ENV.K6_SCENARIO || "load";

const consultationErrors = new Counter("consultation_errors");
const consultationSuccessRate = new Rate("consultation_success_rate");
const consultationDuration = new Trend("consultation_create_duration");
let loggedConsultationFailure = false;

export const options = {
  scenarios:
    scenario === "stress"
      ? {
          stress_consultations: {
            executor: "ramping-vus",
            stages: [
              { duration: "1m", target: 25 },
              { duration: "2m", target: 75 },
              { duration: "2m", target: 150 },
              { duration: "1m", target: 0 },
            ],
          },
        }
      : {
          load_consultations: {
            executor: "ramping-vus",
            stages: [
              { duration: "30s", target: 10 },
              { duration: "2m", target: 25 },
              { duration: "30s", target: 0 },
            ],
          },
        },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1000"],
    consultation_success_rate: ["rate>0.95"],
    consultation_create_duration: ["p(95)<1000"],
  },
};

function jsonHeaders(token) {
  return {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

function uniqueEmail(prefix) {
  return `${prefix}_${__VU}_${__ITER}_${Date.now()}@load.test`;
}

function parseJson(response) {
  try {
    return response.json();
  } catch (_) {
    return {};
  }
}

function registerUser(prefix) {
  const email = uniqueEmail(prefix);
  const response = http.post(
    `${baseUrl}/api/auth/register`,
    JSON.stringify({
      fullName: `${prefix} Load User`,
      email,
      password,
      phone: `080${String(Date.now()).slice(-8)}`,
    }),
    jsonHeaders()
  );

  check(response, {
    "register returns 201": (res) => res.status === 201,
    "register returns user data": (res) => Boolean(parseJson(res).data?.id),
  });

  return {
    email,
    id: parseJson(response).data?.id,
  };
}

function login(email) {
  const response = http.post(
    `${baseUrl}/api/auth/login`,
    JSON.stringify({ email, password }),
    jsonHeaders()
  );

  const body = parseJson(response);

  check(response, {
    "login returns 200": (res) => res.status === 200,
    "login returns token": () => Boolean(body.token || body.data?.token),
  });

  return body.token || body.data?.token;
}

function createProvider(token) {
  const response = http.post(
    `${baseUrl}/api/providers`,
    JSON.stringify({
      specialty: "General Medicine",
      licenseNumber: `LOAD-LIC-${__VU}-${__ITER}-${Date.now()}`,
    }),
    jsonHeaders(token)
  );

  const body = parseJson(response);

  check(response, {
    "provider returns 201": (res) => res.status === 201,
    "provider returns id": () => Boolean(body.provider?.id),
  });

  return body.provider?.id;
}

export default function () {
  const user = registerUser("patient");
  const token = login(user.email);
  const providerId = createProvider(token);

  const response = http.post(
    `${baseUrl}/api/consultations`,
    JSON.stringify({
      userId: user.id,
      providerId,
      type: "video",
      channelName: `load_${__VU}_${__ITER}_${Date.now()}`,
      symptoms: "Load test consultation",
    }),
    jsonHeaders(token)
  );

  consultationDuration.add(response.timings.duration);

  const created = check(response, {
    "consultation returns 201": (res) => res.status === 201,
    "consultation returns body": (res) => Boolean(parseJson(res).consultation),
  });

  consultationSuccessRate.add(created);

  if (!created) {
    consultationErrors.add(1);

    if (__ENV.DEBUG_FAILURES === "true" && !loggedConsultationFailure) {
      loggedConsultationFailure = true;
      console.error(
        `consultation failure status=${response.status} body=${response.body}`
      );
    }
  }

  sleep(Number(__ENV.SLEEP_SECONDS || 1));
}
