# BloodLink Connect

Implement the Blood Donor & Emergency Request Network based on the CSC-206 Software Engineering semester project brief.

### User Request
"make this project with html css js and reactjs with the attractive interface add all the functionalities which are included in the file and slve the problem statement"

### Core Requirements & Problem Statement
The app solves the life-critical coordination gap in emergency blood donation (specifically tailored for Sukkur and regional healthcare networks like Sukkur Civil Hospital, SIUT Sukkur, Ghulam Muhammad Mahar Medical College, etc.).

1. **Authentication & User Profiles**
   - User registration and login for both donors and requesters.
   - Profile management with contact details, city/area, and role badges.

2. **Donor Registration & Availability**
   - Full donor profile: Name, phone/WhatsApp, blood group (A+, A-, B+, B-, AB+, AB-, O+, O-), city/area (e.g., Sukkur, Rohri, Khairpur, Shikarpur, etc.), and location/landmarks.
   - Live availability toggle: "Available to Donate" vs. "Temporarily Unavailable".
   - Eligibility calculator: Self-declaration of last donation date with automatic 90-day (3-month) cooldown countdown and eligibility status chip (Eligible / In Cooldown).

3. **Emergency Blood Request Posting**
   - Create urgent blood request: Blood type needed, number of units, urgency tier (Critical - within hours, Urgent - within 24h, Standard), hospital name, patient condition summary, requester contact phone and WhatsApp.
   - Interactive request feed with prominent urgency badges and quick-action SOS card design.

4. **Medically Accurate Compatibility Matching Engine**
   - Implement strict, scientifically verified blood compatibility logic:
     - Recipient O- can receive from: O- only
     - Recipient O+ can receive from: O-, O+
     - Recipient A- can receive from: O-, A-
     - Recipient A+ can receive from: O-, O+, A-, A+
     - Recipient B- can receive from: O-, B-
     - Recipient B+ can receive from: O-, O+, B-, B+
     - Recipient AB- can receive from: O-, A-, B-, AB-
     - Recipient AB+ can receive from: All blood types (Universal recipient)
   - When viewing an emergency request, automatically filter and rank matching eligible donors who can donate to that blood group.
   - Search & filter donors by blood group, availability, and district/area.

5. **Request Status Tracking**
   - Visible state machine: Pending, In Progress, Fulfilled, Expired.
   - Requesters can update status and mark requests as "Fulfilled" once donors are found.

6. **Direct Emergency Connection**
   - 1-click WhatsApp button with pre-filled urgent message template containing hospital name, patient blood type, and contact details.
   - 1-click direct phone dialer.

7. **Excellence Features**
   - Multi-language switcher: English, Urdu (اردو), and Sindhi (سنڌي) for regional accessibility.
   - Live Emergency Shortage & Analytics dashboard: Visual chart/breakdown of critical blood type demands vs. available registered donors by area.
   - Verification and flag/report feature for transparency and fake-request prevention.
   - Modern, responsive, clean life-saving medical emergency UI with dark/light mode and high-contrast alert design.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6274542c-db67-4430-905d-a50cbc7590cf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
