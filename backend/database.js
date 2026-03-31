const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'inventory.db'));

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('switch', 'access_point', 'router')),
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    serial_number TEXT UNIQUE NOT NULL,
    quantity INTEGER DEFAULT 1,
    location TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed with 20 network devices if table is empty
const count = db.prepare('SELECT COUNT(*) as count FROM devices').get();
if (count.count === 0) {
  const insert = db.prepare(
    `INSERT INTO devices (name, type, brand, model, serial_number, quantity, location, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const seed = db.transaction(() => {
    insert.run('Core Switch Floor 1',    'switch',        'Cisco',          'Catalyst 9300',    'CSC-9300-001A', 2, 'Server Room A',    'active');
    insert.run('Core Switch Floor 2',    'switch',        'Cisco',          'Catalyst 9300',    'CSC-9300-002B', 2, 'Server Room B',    'active');
    insert.run('Distribution Switch',    'switch',        'Cisco',          'Catalyst 3850',    'CSC-3850-003C', 1, 'Network Closet 1', 'active');
    insert.run('Access Switch Office A', 'switch',        'HP',             'Aruba 2530',       'HP-2530-004D',  4, 'Office A',         'active');
    insert.run('Access Switch Office B', 'switch',        'HP',             'Aruba 2530',       'HP-2530-005E',  4, 'Office B',         'active');
    insert.run('Edge Switch Warehouse',  'switch',        'Juniper',        'EX2300',           'JNP-EX2300-006F', 2,'Warehouse',       'active');
    insert.run('PoE Switch Conference',  'switch',        'Netgear',        'GS308PP',          'NGR-GS308-007G',  1,'Conference Room', 'active');
    insert.run('AP Lobby',               'access_point',  'Cisco',          'Aironet 2800',     'AP-AIR2800-008H', 1,'Lobby',           'active');
    insert.run('AP Office Floor 1',      'access_point',  'Ubiquiti',       'UniFi U6 Pro',     'UBI-U6PRO-009I',  3,'Floor 1',         'active');
    insert.run('AP Office Floor 2',      'access_point',  'Ubiquiti',       'UniFi U6 Pro',     'UBI-U6PRO-010J',  3,'Floor 2',         'active');
    insert.run('AP Warehouse',           'access_point',  'Ubiquiti',       'UniFi U6 LR',      'UBI-U6LR-011K',   2,'Warehouse',       'active');
    insert.run('AP Conference Room',     'access_point',  'Aruba',          'AP-515',           'ARU-AP515-012L',  1,'Conference Room', 'active');
    insert.run('AP Cafeteria',           'access_point',  'Aruba',          'AP-305',           'ARU-AP305-013M',  1,'Cafeteria',       'maintenance');
    insert.run('AP Parking Lot',         'access_point',  'Cisco',          'Catalyst 9115AXE', 'AP-CAT9115-014N', 2,'Parking Lot',     'active');
    insert.run('Core Router',            'router',        'Cisco',          'ASR 1001-X',       'RT-ASR1001-015O', 1,'Server Room A',   'active');
    insert.run('Edge Router WAN',        'router',        'Juniper',        'MX204',            'RT-MX204-016P',   1,'Server Room A',   'active');
    insert.run('Branch Router Office A', 'router',        'Cisco',          'ISR 4331',         'RT-ISR4331-017Q', 1,'Network Closet 1','active');
    insert.run('Branch Router Office B', 'router',        'Cisco',          'ISR 4331',         'RT-ISR4331-018R', 1,'Network Closet 2','active');
    insert.run('VPN Router',             'router',        'Fortinet',       'FortiGate 60F',    'FTN-FG60F-019S',  1,'Server Room B',   'active');
    insert.run('Backup Router',          'router',        'MikroTik',       'CCR2004-16G',      'MKT-CCR2004-020T',1,'Server Room A',   'inactive');
  });

  seed();
  console.log('Database seeded with 20 network devices');
}

module.exports = db;
