# FarmGuard Portal

Initial frontend scaffold for a digital farm management portal focused on:

- antimicrobial usage (AMU) monitoring
- Maximum Residue Limit (MRL) compliance
- veterinary prescription oversight
- stakeholder-specific AMU and MRL dashboards

## Included in this first build

- Sign in and create account flows
- Demo authentication stored in browser localStorage
- Dashboard shell aligned to the project problem statement
- Suggested phase-1 modules and starter data model
- Role-specific workspaces with edit permissions
- Shared realtime notifications using browser localStorage and `BroadcastChannel`

## Demo logins

- Regulatory Authority: `govt@farmguard.in` / `FarmGuard123`
- Farm Owner: `owner@farmguard.in` / `FarmOwner123`
- Veterinarian: `vet@farmguard.in` / `VetCare123`
- Public Health Analyst: `analyst@farmguard.in` / `Analyst123`
- Processing Plant Operator: `plant@farmguard.in` / `Plant123`
- System Administrator: `sysadmin@farmguard.in` / `Admin123`

## Run locally

Open `index.html` in a browser.

## Role behavior in this prototype

- Farm Owners manage animal registry, assignments, and farm activity visibility.
- Veterinarians create prescriptions, treatment guidance, and mobile-friendly clinical updates.
- Regulatory Authorities manage standards, violations, thresholds, and compliance reporting.
- Public Health Analysts review AMU trends and generate insight notes.
- Processing Plant Operators verify withdrawal clearance and intake compliance.
- System Administrators manage users, permissions, system health, and integrations.

Open the app in multiple browser tabs with different demo accounts to see live cross-role notifications.

## Recommended next steps

1. Convert this into a React or Next.js app for scalable routing and state handling.
2. Add a real backend with secure authentication and password hashing.
3. Replace browser storage with a database and websocket layer for true multi-user realtime sync.
4. Add persistent modules for farm registry, treatment logs, prescriptions, MRL alerts, and approval history.
