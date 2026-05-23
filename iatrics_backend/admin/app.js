const state = {
  token: localStorage.getItem("iatrics_admin_token") || "",
  summary: null,
  providers: [],
};

const loginView = document.querySelector("#loginView");
const dashboardView = document.querySelector("#dashboardView");
const loginForm = document.querySelector("#loginForm");
const loginButton = document.querySelector("#loginButton");
const loginMessage = document.querySelector("#loginMessage");
const dashboardMessage = document.querySelector("#dashboardMessage");
const summaryGrid = document.querySelector("#summaryGrid");
const providersList = document.querySelector("#providersList");
const providerCount = document.querySelector("#providerCount");
const refreshButton = document.querySelector("#refreshButton");
const logoutButton = document.querySelector("#logoutButton");

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function setMessage(element, text, type = "error") {
  element.textContent = text || "";
  element.dataset.type = type;
}

function setLoading(button, isLoading, label, loadingLabel) {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingLabel : label;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function authHeaders() {
  return {
    Authorization: `Bearer ${state.token}`,
    "Content-Type": "application/json",
  };
}

async function request(path, options = {}) {
  const response = await fetch(path, options);
  let body = {};

  try {
    body = await response.json();
  } catch (_error) {
    body = {};
  }

  if (!response.ok) {
    throw new Error(body.message || body.error || "Request failed");
  }

  return body;
}

function showDashboard() {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
}

function showLogin() {
  dashboardView.classList.add("hidden");
  loginView.classList.remove("hidden");
}

function renderSummary() {
  const summary = state.summary || {};
  const items = [
    ["Total users", summary.totalUsers ?? 0],
    ["Providers", summary.totalProviders ?? 0],
    ["Approved", summary.approvedProviders ?? 0],
    ["Pending", summary.pendingProviders ?? 0],
    ["Revenue", money.format(summary.totalRevenue ?? 0)],
    ["Payouts", money.format(summary.totalPayouts ?? 0)],
    ["Pending withdrawals", money.format(summary.pendingWithdrawals ?? 0)],
    ["Failed withdrawals", money.format(summary.failedWithdrawals ?? 0)],
  ];

  summaryGrid.innerHTML = items
    .map(
      ([label, value]) => `
        <article class="metric">
          <span class="muted">${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </article>
      `
    )
    .join("");
}

function providerName(provider) {
  return (
    provider.User?.fullName ||
    provider.User?.email ||
    `Provider #${provider.id}`
  );
}

function renderProviders() {
  providerCount.textContent = `${state.providers.length} provider records`;

  if (!state.providers.length) {
    providersList.innerHTML =
      '<div class="provider-card"><p class="muted">No providers found.</p></div>';
    return;
  }

  providersList.innerHTML = state.providers
    .map((provider) => {
      const approved = Boolean(provider.isApproved);
      const status = approved ? "Approved" : "Pending";
      const statusClass = approved ? "approved" : "pending";
      const specialty = escapeHtml(provider.specialty || "Specialty not set");
      const license = escapeHtml(provider.licenseNumber || "License not set");
      const step = escapeHtml(provider.onboardingStep || "REGISTERED");
      const name = escapeHtml(providerName(provider));
      const bankStatus =
        provider.bankCode && provider.accountNumber && provider.accountName
          ? "Bank ready"
          : "Bank pending";

      return `
        <article class="provider-card">
          <div>
            <h4>${name}</h4>
            <div class="provider-meta">
              <span class="pill ${statusClass}">${status}</span>
              <span class="pill">${step}</span>
              <span class="pill">${specialty}</span>
              <span class="pill">${license}</span>
              <span class="pill">${bankStatus}</span>
            </div>
          </div>
          <button
            type="button"
            data-provider-id="${provider.id}"
            ${approved ? "disabled" : ""}
          >
            ${approved ? "Approved" : "Approve"}
          </button>
        </article>
      `;
    })
    .join("");
}

async function loadDashboard() {
  if (!state.token) {
    showLogin();
    return;
  }

  setMessage(dashboardMessage, "");
  setLoading(refreshButton, true, "Refresh", "Refreshing...");

  try {
    const [summary, providers] = await Promise.all([
      request("/api/admin/summary", { headers: authHeaders() }),
      request("/api/admin/providers", { headers: authHeaders() }),
    ]);

    state.summary = summary;
    state.providers = providers;
    renderSummary();
    renderProviders();
    showDashboard();
  } catch (error) {
    localStorage.removeItem("iatrics_admin_token");
    state.token = "";
    showLogin();
    setMessage(loginMessage, error.message || "Admin session expired");
  } finally {
    setLoading(refreshButton, false, "Refresh", "Refreshing...");
  }
}

async function login(event) {
  event.preventDefault();
  setMessage(loginMessage, "");
  setLoading(loginButton, true, "Enter Admin", "Signing in...");

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;

  try {
    const body = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (body.user?.role !== "admin") {
      throw new Error("This account is not an admin account");
    }

    state.token = body.token;
    localStorage.setItem("iatrics_admin_token", body.token);
    await loadDashboard();
  } catch (error) {
    setMessage(loginMessage, error.message || "Login failed");
  } finally {
    setLoading(loginButton, false, "Enter Admin", "Signing in...");
  }
}

async function approveProvider(providerId, button) {
  setMessage(dashboardMessage, "");
  setLoading(button, true, "Approve", "Approving...");

  try {
    await request(`/api/admin/providers/${providerId}/approve`, {
      method: "POST",
      headers: authHeaders(),
    });
    await loadDashboard();
    setMessage(dashboardMessage, "Provider approved successfully", "success");
  } catch (error) {
    setMessage(dashboardMessage, error.message || "Approval failed");
    setLoading(button, false, "Approve", "Approving...");
  }
}

loginForm.addEventListener("submit", login);
refreshButton.addEventListener("click", loadDashboard);
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("iatrics_admin_token");
  state.token = "";
  showLogin();
});

providersList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-provider-id]");
  if (!button) return;
  approveProvider(button.dataset.providerId, button);
});

loadDashboard();
