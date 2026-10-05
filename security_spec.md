# Security Specification & Threat Model (FanCor VIP & Store)

This document outlines the Security Invariants, the "Dirty Dozen" attack vectors, and the test assertions to ensure absolute zero-trust integrity of our Firestore collections.

## 1. Data Invariants

### Collection: `subscribers`
- **Read**: No public reads. Only the admin (`jermaineamezquita1973@gmail.com`) can read or list subscribers.
- **Create**: Anyone (even unauthenticated users) can subscribe. Email field must be a valid format and size.
- **Update/Delete**: Strictly forbidden for everyone.

### Collection: `products`
- **Read**: Anyone (authenticated or unauthenticated) can read and list products.
- **Create/Update/Delete**: Strictly restricted to the authorized admin (`jermaineamezquita1973@gmail.com`).
- **Validation**: Strict schema validation on fields (type, price bounds, timestamps, etc.).

### Collection: `hidden_printify_products`
- **Read**: Anyone can read and list hidden product IDs (to filter them out from the frontend view).
- **Create/Update/Delete**: Strictly restricted to the authorized admin (`jermaineamezquita1973@gmail.com`).
- **Validation**: Must contain a valid string `productId` and timestamp.

---

## 2. The "Dirty Dozen" Malicious Payloads

Here are 12 specific exploit payloads designed to break our security invariants. All of these must be rejected with `PERMISSION_DENIED`:

### Class A: Identity Spoofing & Privilege Escalation
1. **P1: Non-Admin creating a Product**
   - **User**: Any regular user (UID: `attacker_123`, email: `attacker@gmail.com`).
   - **Action**: Create a document in `/products/new_product` with standard product fields.
   - **Expectation**: `PERMISSION_DENIED`.

2. **P2: Non-Admin updating a Product field**
   - **User**: Any regular user (UID: `attacker_123`).
   - **Action**: Update price or active status on `/products/some_existing_product`.
   - **Expectation**: `PERMISSION_DENIED`.

3. **P3: Non-Admin hiding a product**
   - **User**: Any regular user (UID: `attacker_123`).
   - **Action**: Create a document in `/hidden_printify_products/mock_prod_1`.
   - **Expectation**: `PERMISSION_DENIED`.

4. **P4: Spoofed Admin identity via custom auth claim**
   - **User**: User signed in with an email `fake_admin@gmail.com` trying to write a product.
   - **Action**: Attempt write on `/products/some_product`.
   - **Expectation**: `PERMISSION_DENIED`.

---

### Class B: Resource Poisoning & Denial-of-Wallet
5. **P5: Massive product ID Injection**
   - **User**: Admin, but with an excessively long string ID (e.g., 200KB) to bloated storage or indexing costs.
   - **Action**: Create a product with `isValidId(id)` failing.
   - **Expectation**: `PERMISSION_DENIED`.

6. **P6: Gigantic String Payload Injection**
   - **User**: Anonymous user subscribing to newsletter.
   - **Action**: Create a subscriber document with an email string of 100,000 characters.
   - **Expectation**: `PERMISSION_DENIED` (due to size limit constraint: `email.size() <= 254`).

7. **P7: Malformed Fields on Product Creation**
   - **User**: Admin (UID: matching admin email).
   - **Action**: Create a product where `price` is a string `"free"` or negative number.
   - **Expectation**: `PERMISSION_DENIED`.

8. **P8: Bypassing Immutable Timestamps**
   - **User**: Admin.
   - **Action**: Update a product but change its `createdAt` date to a hardcoded future date instead of keeping it equal to `existing().createdAt`.
   - **Expectation**: `PERMISSION_DENIED`.

---

### Class C: State Shortcutting & Unauthorized Scraping
9. **P9: Public subscriber list harvesting**
   - **User**: Unauthenticated or regular user.
   - **Action**: List or query the `/subscribers` collection.
   - **Expectation**: `PERMISSION_DENIED`.

10. **P10: Subscriber single-record snooping**
    - **User**: Regular authenticated user.
    - **Action**: Read document `/subscribers/someone_elses_sub_id`.
    - **Expectation**: `PERMISSION_DENIED`.

11. **P11: Unauthorized Subscriber Deletion**
    - **User**: Anyone.
    - **Action**: Attempt to delete a subscriber document.
    - **Expectation**: `PERMISSION_DENIED`.

12. **P12: Product state hacking (updating system fields)**
    - **User**: Regular user attempting to set `profit` directly on a product or change active state.
    - **Action**: Update fields on product.
    - **Expectation**: `PERMISSION_DENIED`.

---

## 3. Test Suite Framework (`firestore.rules.test.ts`)

A complete automated unit testing framework utilizing the `@firebase/rules-unit-testing` package is configured to run these assertions against a local emulator, ensuring no regressional holes are introduced.
