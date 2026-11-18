# Orbit Pass

A fictional membership-wallet app, installable on phones, that shows a member's card and a few static services and listings. It exists as a practice project for building installable offline apps; every piece of content is invented and fixed.

## Language

**Orbit Pass**:
The app's own name and brand: teal and charcoal, with its own logo.
_Avoid_: Резерв+, Reserve+, the original app, the

**Member**:
The fictional person the app is shown for. All of their details are invented.
_Avoid_: User, holder, conscript

**Label**:
The short text from the Member's record shown above their name on the Member card (e.g. "Призовник").
_Avoid_: Tier, status

**Member card**:
The home-screen card showing the Member's avatar, name, birth date, label and the ribbon.
_Avoid_: ID, document, pass

**QR view**:
The reverse side of the Member card, with a QR code, its validity caption, and a usage notice. The QR code only encodes a fixed demo message.
_Avoid_: Back side, barcode

**Actions sheet**:
The bottom sheet opened by the "+" button on the Member card, offering view details, download PDF, and refresh.
_Avoid_: Popup, modal, menu

**Avatar**:
The image in the Member's record, shown on the Member card. The administrator supplies an image file; it is stored inline in Firestore.
_Avoid_: Photo, portrait

**Ribbon**:
The scrolling strip across the Member card. Its text is the Member's `updatedAt`, until a refresh replaces it with the Content file's `ribbon.refreshedAt`.
_Avoid_: Ticker, banner

**Service**:
A tile on the Services tab that opens a static detail page.
_Avoid_: Feature, action

**Listing**:
An entry on the Listings tab that opens a static detail view.
_Avoid_: Vacancy, job, offer

**Notification**:
A static message shown in the notifications sheet.
_Avoid_: Alert, push

**Content file**:
The single hand-edited file that holds every piece of shared content the app shows, including all interface text in Ukrainian. It does not hold the Member's personal data, which lives behind the PIN gate.
_Avoid_: Database, API, config

## Access

**PIN**:
The four-digit secret that identifies a Member and unlocks the app. Each Member has a unique PIN, and Members are created by hand by an administrator; there is no sign-up.
_Avoid_: Passcode, password, access code, account

**PIN gate**:
The start screen where a Member enters their PIN before anything else is shown. It returns after every cold start and after the app has been in the background for about five minutes.
_Avoid_: Login, lock screen, splash

**Lockout page**:
The page shown instead of the PIN gate after three wrong PIN attempts in a row, until the lockout ends.
_Avoid_: Error page, ban

**Forgot-PIN page**:
A separate static page, opened from the PIN gate, telling a Member to ask the administrator. It resets nothing.
_Avoid_: Recovery, reset flow

**Offline page**:
The page shown instead of the PIN gate when the app is started with no network, because a PIN can only be checked online.
_Avoid_: Error page
