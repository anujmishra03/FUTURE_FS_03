# FUTURE_FS_03: Local Business Website & Live Pitch Project

**Future Interns · Full Stack Web Development · Task 3**  
*Repository Name:* `FUTURE_FS_03`  
*Developer:* Anuj Mishra  
*Target Business:* **The Copper Kettle Café & Bistro** (Artisan Coffee Roastery & Sourdough Brunch)  

A production-ready, mobile-first web application built for a real local business (*The Copper Kettle Café & Bistro*), accompanied by a comprehensive **Client Pitch Document & Financial ROI Proposal (`PITCH.md`)**.

---

## Task Requirements & Implementation Mapping

| Internship Requirement | How It Is Implemented | Location in Codebase |
|---|---|---|
| **Professional website for a local business** | High-end responsive web app with artisan café aesthetic, story section, customer reviews, hours timetable, and Google Maps location. | `public/index.html`, `public/css/cafe.css`, `public/js/cafe.js` |
| **Interactive features & menu** | Digital menu with instant dietary filtering (Signature Coffees, Artisan Teas, Brunch, Bakery & Pastries) with allergen/dietary tags. | `src/menuData.js`, `GET /api/menu` |
| **Direct table booking engine** | Online reservation system with instant confirmation code generator (`CK-XXXX`), seating area selection, and local persistence. | `POST /api/reservations`, `src/app.js` |
| **Real-time store status** | Dynamic open/closed calculation badge based on current local day/time (`Open Now · Closes at 9:00 PM`). | `src/hours.js`, `GET /api/status` |
| **CRM Integration (with Task 2)** | Every table reservation and catering inquiry automatically creates a new lead in the **Task 2 LeadDesk Mini CRM**. | `src/app.js` (`POST /api/public/leads` dispatch) |
| **Live Pitch Deliverable** | Complete 10-slide pitch presentation script, market pain point audit, and $28,080/yr ROI model. | `PITCH.md` |
| **Automated Testing** | 7 automated unit and integration tests using `node:test`. | `test/cafe.test.js` |

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
```bash
# Copies default configuration
cp .env.example .env
```
Default port is `3002` so it runs concurrently alongside Task 1 (`3000`) and Task 2 (`3001`).

### 3. Start the Server
```bash
npm start
```
Open in browser: **`http://localhost:3002`**

### 4. Run Automated Tests
```bash
npm test
```
Runs 7 test cases covering home page rendering, store status computation, menu filtering, reservation validation, and CRM integration dispatch.

---

## How It Integrates with Task 2 (LeadDesk Mini CRM)

When both applications are running:
1. Start the CRM on port 3001:
   ```bash
   cd d:\FUTURE_FS_02
   npm start
   ```
2. Start The Copper Kettle website on port 3002:
   ```bash
   cd d:\FUTURE_FS_03
   npm start
   ```
3. Whenever a guest books a table or submits a catering inquiry on `http://localhost:3002`, a new lead with source `"Café website"` immediately appears in your LeadDesk CRM dashboard on `http://localhost:3001`!

---

## Client Pitch Deliverable: PITCH.md

Per the internship requirements, a comprehensive pitch document is included in [`PITCH.md`](./PITCH.md):
* **Executive Summary:** Overcoming aggregator fee dependence.
* **Problem & Opportunity Audit:** Eliminating 20–30% delivery app commissions.
* **Financial Model & ROI:** Projected **$28,080/year** value ($11,880 in avoided booking fees + $16,200 in incremental corporate catering).
* **10-Slide Pitch Presentation Script:** Word-for-word narrative used when pitching directly to the café owner.
* **Technical & SEO Architecture:** Schema.org `Restaurant` structured data, mobile performance, and CRM integration.

---

## Project Structure

```
FUTURE_FS_03/
├── data/                  # Local storage for reservations and inquiries (JSONL)
├── public/                # Frontend static assets
│   ├── css/cafe.css       # Warm copper & espresso responsive design system
│   ├── js/cafe.js         # Client controller (status, menu filter, booking modal)
│   └── index.html         # Semantic HTML5 page with Schema.org Restaurant JSON-LD
├── src/
│   ├── app.js             # Express API application & CRM forwarding engine
│   ├── hours.js           # Live store status and weekly operating hours calculator
│   └── menuData.js        # Digital menu catalogue with dietary markers
├── test/
│   └── cafe.test.js       # 7 automated tests using node:test
├── PITCH.md               # Complete Client Pitch & Business Proposal
├── .env.example           # Environment template
├── .gitignore
├── package.json
└── README.md
```
