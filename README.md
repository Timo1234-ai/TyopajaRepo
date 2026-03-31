# NetInventory – Network Equipment Manager

A modern web app for managing the inventory of network equipment: **switches**, **access points**, and **routers**, with serial number tracking.

## Features

- 📋 **Browse** all network devices in a clean, searchable table
- ➕ **Add** new devices (switches, access points, routers) with serial numbers
- ✏️ **Edit** device details
- 🗑️ **Delete** devices with confirmation
- 🔢 **Update quantity** with inline +/− controls
- 🔍 **Search** by name, serial number, brand, model, or location
- 🏷️ **Filter** by device type and status
- 📊 **Stats bar** showing counts by device type
- 🗄️ **SQLite database** pre-seeded with 20 real-world network devices

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 19 + Vite         |
| Backend  | Node.js + Express       |
| Database | SQLite (better-sqlite3) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 8+

### Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Run the app

```bash
# Start backend (port 3001)
cd backend && npm start

# Start frontend (port 5173) in a separate terminal
cd frontend && npm run dev
```

Or run both at once from the root:

```bash
npm install   # install concurrently at root
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Pre-populated Devices

The database is seeded with 20 network devices including:

| # | Name | Type | Brand | Model | Serial |
|---|------|------|-------|-------|--------|
| 1 | Core Switch Floor 1 | Switch | Cisco | Catalyst 9300 | CSC-9300-001A |
| 2 | Core Switch Floor 2 | Switch | Cisco | Catalyst 9300 | CSC-9300-002B |
| 3 | Distribution Switch | Switch | Cisco | Catalyst 3850 | CSC-3850-003C |
| 4 | Access Switch Office A | Switch | HP | Aruba 2530 | HP-2530-004D |
| 5 | Access Switch Office B | Switch | HP | Aruba 2530 | HP-2530-005E |
| 6 | Edge Switch Warehouse | Switch | Juniper | EX2300 | JNP-EX2300-006F |
| 7 | PoE Switch Conference | Switch | Netgear | GS308PP | NGR-GS308-007G |
| 8 | AP Lobby | Access Point | Cisco | Aironet 2800 | AP-AIR2800-008H |
| 9 | AP Office Floor 1 | Access Point | Ubiquiti | UniFi U6 Pro | UBI-U6PRO-009I |
| 10 | AP Office Floor 2 | Access Point | Ubiquiti | UniFi U6 Pro | UBI-U6PRO-010J |
| 11 | AP Warehouse | Access Point | Ubiquiti | UniFi U6 LR | UBI-U6LR-011K |
| 12 | AP Conference Room | Access Point | Aruba | AP-515 | ARU-AP515-012L |
| 13 | AP Cafeteria | Access Point | Aruba | AP-305 | ARU-AP305-013M |
| 14 | AP Parking Lot | Access Point | Cisco | Catalyst 9115AXE | AP-CAT9115-014N |
| 15 | Core Router | Router | Cisco | ASR 1001-X | RT-ASR1001-015O |
| 16 | Edge Router WAN | Router | Juniper | MX204 | RT-MX204-016P |
| 17 | Branch Router Office A | Router | Cisco | ISR 4331 | RT-ISR4331-017Q |
| 18 | Branch Router Office B | Router | Cisco | ISR 4331 | RT-ISR4331-018R |
| 19 | VPN Router | Router | Fortinet | FortiGate 60F | FTN-FG60F-019S |
| 20 | Backup Router | Router | MikroTik | CCR2004-16G | MKT-CCR2004-020T |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/devices` | List all devices |
| GET | `/api/devices/:id` | Get single device |
| POST | `/api/devices` | Create a device |
| PUT | `/api/devices/:id` | Update a device |
| PATCH | `/api/devices/:id/quantity` | Update quantity only |
| DELETE | `/api/devices/:id` | Delete a device |
