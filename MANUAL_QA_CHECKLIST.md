# Iatrics Manual QA Checklist

Use this checklist on real Android and iPhone devices after automated API, unit, widget, and integration tests are passing.

## Test Setup

- Install latest user app build on at least one Android device and one iPhone.
- Install latest provider app build on at least one Android device and one iPhone.
- Use a backend environment with valid Agora and payment provider credentials.
- Confirm both devices have stable internet and can reach the backend API.
- Keep one provider account and one user account ready for repeated testing.
- Confirm camera, microphone, notification, and network permissions are allowed.

## User App

### Authentication

- Open app on a fresh install.
- Log in with a valid user account.
- Close and reopen the app.
- Confirm session restores correctly.
- Log out.
- Confirm protected screens are no longer accessible.

### Wallet And Payment

- Open wallet screen.
- Confirm current balance renders correctly.
- Start fund-wallet flow.
- Confirm payment page opens in the expected browser or in-app flow.
- Complete a successful test payment.
- Return to app and confirm balance/payment state updates.
- Cancel a payment.
- Confirm app handles cancellation without crashing.
- Try a failed payment/test decline.
- Confirm a clear failure state appears.

### Consultation Flow

- Start a consultation or call request from the user app.
- Confirm provider device receives incoming call event.
- Confirm user sees waiting/connecting state.
- Confirm consultation history updates after completed call.
- Open consultation detail from history.
- Confirm diagnosis, cost, date, and related details are readable.

### Incoming/Active Call

- Accept provider call if user app receives one.
- Confirm video call screen opens.
- Toggle mute.
- Toggle speaker.
- Toggle camera.
- End the call.
- Confirm app returns to a stable screen.

## Provider App

### Authentication

- Open app on a fresh install.
- Log in with a valid provider account.
- Confirm provider dashboard loads.
- Close and reopen app.
- Confirm session behavior is correct for the current product expectation.
- Log out if the UI supports it.

### Availability And Dashboard

- Confirm provider dashboard shows correct provider identity.
- Navigate to schedule or availability screens if available in the build.
- Create or update availability if available.
- Confirm changes persist after refresh/reopen.

### Incoming User Call

- From user device, start a call to provider.
- Confirm provider receives incoming call screen.
- Accept the call.
- Confirm provider video call screen opens.
- End the call from provider side.
- Repeat and decline the call.
- Confirm user sees rejected/ended state.

### Earnings And Withdrawal

- Open earnings or wallet screen if available.
- Confirm values render without placeholders or crashes.
- Start withdrawal request if available.
- Submit valid withdrawal details.
- Confirm success state.
- Submit invalid or empty details.
- Confirm validation/failure state.

## Agora Video QA

Run these on Android-to-Android, iPhone-to-iPhone, Android-to-iPhone, and iPhone-to-Android when possible.

- First call after fresh install prompts camera/microphone permissions.
- Permission denial is handled gracefully.
- Permission grant allows call to continue.
- Caller and receiver join the same channel.
- Local preview appears.
- Remote video appears.
- Audio works both directions.
- Mute stops local audio.
- Camera toggle stops/starts local video.
- Switch camera works.
- Speaker toggle works.
- Ending call from either side ends both sessions.
- Backgrounding app during call behaves acceptably.
- Locking phone during call behaves acceptably.
- Network interruption shows recover/end behavior without app crash.

## Payment QA

- Successful payment returns to app or expected completion state.
- Cancelled payment returns to app or expected cancellation state.
- Failed payment shows a readable error state.
- Duplicate taps on payment button do not create duplicate payment sessions.
- Slow network does not leave the user stuck on an indefinite loading state.
- Backend records match app-visible payment status.
- Wallet balance reconciles with backend after payment completion.

## Device Matrix

Record results for each device:

| Device | OS Version | App | Flow | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| Android |  | User | Login |  |  |
| Android |  | User | Payment |  |  |
| Android |  | User | Video Call |  |  |
| Android |  | Provider | Login |  |  |
| Android |  | Provider | Incoming Call |  |  |
| iPhone |  | User | Login |  |  |
| iPhone |  | User | Payment |  |  |
| iPhone |  | User | Video Call |  |  |
| iPhone |  | Provider | Login |  |  |
| iPhone |  | Provider | Incoming Call |  |  |

## Release Gate

- No crash during login, payment, or video call flows.
- Camera and microphone permissions work on both Android and iPhone.
- User and provider can complete at least one real video call.
- Payment success, cancellation, and failure are handled clearly.
- App state remains stable after closing and reopening.
- Backend records match visible app state for consultations and payments.
