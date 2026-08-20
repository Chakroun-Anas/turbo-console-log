const STORAGE_KEY = "flow_capture_v1";
const IDB_NAME = "flow_capture_storage";
const IDB_STORE = "kv";
const IDB_DB_KEY = "database";

const entryTypes = [
  { id: "problem", label: "Problém", short: "Problém" },
  { id: "solution", label: "Řešení", short: "Řešení" },
  { id: "photo_note", label: "Fotka", short: "Fotka" },
  { id: "machine_setting", label: "Nastavení", short: "Nastavení" },
  { id: "experience", label: "Zkušenost", short: "Zkušenost" },
  { id: "changeover_parameter", label: "Parametr přehozu", short: "Parametr" },
  { id: "product_note", label: "Poznámka k TL", short: "TL poznámka" },
  { id: "check_point", label: "Kontrolní bod", short: "Kontrola" },
];

const priorities = [
  { id: "critical", label: "Kritické" },
  { id: "important", label: "Důležité" },
  { id: "normal", label: "Běžné" },
];

const sectionsSeed = [
  "Nakladač",
  "Řezání",
  "Vylamování",
  "Broušení",
  "Vrtání",
  "Myčka",
  "Robot",
  "Kontrola",
].map((name, index) => ({
  section_id: `sec-${index + 1}`,
  name,
  active: true,
  sort_order: index + 1,
  description: "",
}));

const machinesSeed = [
  ["machine-loader", "Nakladač", "sec-1", "L01"],
  ["machine-cut", "Řezací linka", "sec-2", "R01"],
  ["machine-break", "Vylamování", "sec-3", "V01"],
  ["machine-grind", "Broušení", "sec-4", "B01"],
  ["machine-drill", "Vrtání", "sec-5", "D01"],
  ["machine-wash", "Myčka", "sec-6", "M01"],
  ["machine-robot", "Robot", "sec-7", "RO1"],
].map(([machine_id, machine_name, section_id, machine_code]) => ({
  machine_id,
  machine_name,
  section_id,
  machine_code,
  active: true,
  note: "",
}));

const legacyProductsSeed = [
  ["prod-626", "Škoda 370", "279530sk"],
  ["prod-732", "Škoda/Seat 326/0", "323820sk"],
  ["prod-745", "Tesla E41", "326424te"],
  ["prod-586", "Mercedes C257", "276740me"],
  ["prod-620", "Toyota 160B", "262587to"],
  ["prod-707", "Seat 316", "309880se"],
].map(([product_id, product_name, program_code]) => ({
  product_id,
  product_name,
  program_code,
  active: true,
  customer: product_name.split(" ")[0],
  internal_code: "",
  note: "",
}));

const legacyTechnicalListsSeed = [
  ["tl-626", "626", "prod-626", "Škoda 370", "279530sk"],
  ["tl-732", "732", "prod-732", "Škoda/Seat 326/0", "323820sk"],
  ["tl-745", "745", "prod-745", "Tesla E41", "326424te"],
  ["tl-586", "586", "prod-586", "Mercedes C257", "276740me"],
  ["tl-620", "620", "prod-620", "Toyota 160B", "262587to"],
  ["tl-707", "707", "prod-707", "Seat 316", "309880se"],
].map(([technical_list_id, tl_number, product_id, product_name_snapshot, program_code]) => ({
  technical_list_id,
  tl_number,
  product_id,
  product_name_snapshot,
  program_code,
  revision: "",
  active: true,
  is_favorite: ["tl-626", "tl-732", "tl-745"].includes(technical_list_id),
  note: "",
}));

const legacyTechnicalParametersSeed = [
  ["tl-626", "RD", 136, 58, 2080, "Profil C", "12.7", 5000, 50, 1, 95, 110, 60, 10],
  ["tl-732", "FD", 192.5, 64, 2680, "Profil C", "14.6", 4800, 60, 2, 125, 120, 60, 10],
  ["tl-745", "FD", 198.5, 69, 2810, "Průměr 150mm Profil C", "22.2", 4500, 50, 2, 125, 115, 60, 10],
  ["tl-586", "RD", 126.5, 111, 1950, "Průměr 150mm", "19.2", 4500, 60, 2, 135, 130, 60, 10],
  ["tl-620", "RD", 126.5, 52, 1890, "Profil C", "bez vrtání", 0, 0, 0, 110, 100, 60, 9],
  ["tl-707", "FD", 190, 59.5, 2604, "Profil C", "14.6", 4800, 60, 2, 125, 110, 60, 10],
].map(
  ([
    technical_list_id,
    side_type,
    width_mm,
    height_mm,
    perimeter_mm,
    wheel,
    drill,
    drill_rpm,
    drill_feed,
    drill_arm_count,
    cutting_pressure,
    breaking_pressure,
    cutting_speed,
    grinding_value,
  ]) => ({
    technical_parameters_id: `params-${technical_list_id}`,
    technical_list_id,
    side_type,
    width_mm,
    height_mm,
    perimeter_mm,
    glass_thickness_mm: "",
    wheel,
    drill,
    drill_rpm,
    drill_feed,
    drill_arm_count,
    cutting_pressure,
    breaking_pressure,
    cutting_speed,
    grinding_value,
    updated_at: "",
  }),
);

// Jedinečné řádky z původního Google Sheets exportu SORTIMENTY_FINAL.xlsx.
// Zdroj neobsahuje číslo TL, proto se u nespárovaných položek zobrazuje název sortimentu a program.
const sortimentSourceRows = [
  ["Mercedes C257 RD", "RD", 126.5, 111, 1950, "276740me", 135, 130, 60, 10, "19.2", 4500, 60, 2, "cín"],
  ["Renault S25 FD", "FD", 190, 59.5, 2500, "236065re", 115, 115, 60, 11, "24.1", 4500, 60, 2, "C"],
  ["Seat 380 RD", "RD", 152.5, 104, 2190, "309987se", 110, 110, 60, 10, "12.6", 5000, 60, 2, ""],
  ["Mercedes C257 FD", "FD", 178.5, 64, 2490, "265868me", 120, 130, 70, 10, "19.2", 4500, 60, 1, ""],
  ["Mercedes V297 RD", "RD", 135, 61, 2180, "297674me", 110, 130, 60, 10, "20.2", 4500, 60, 2, ""],
  ["Mercedes V295 RD", "RD", 136, 61, 2090, "298861me", 135, 130, 60, 10, "20.2", 4500, 60, 2, ""],
  ["Peugeot P84 FD", "FD", 188.5, 63, 2600, "254226pe", 125, 115, 60, 11, "11/21", 4800, 50, 2, ""],
  ["Toyota 160B RD", "RD", 126.5, 52, 1890, "262587to", 110, 100, 60, 9, "bez vrtání", 0, 0, 0, "bez vrtání"],
  ["Volvo V316 FD", "FD", 183, 64, 2570, "257860vo", 125, 120, 60, 11, "14.6", 4800, 60, 2, ""],
  ["Škoda 370 RD", "RD", 136, 58, 2080, "279530sk", 95, 110, 60, 10, "12.7", 5000, 50, 2, ""],
  ["Škoda 326 RD", "RD", 151, 55.5, 2220, "325146sk", 95, 110, 60, 10, "12.7", 5000, 50, 2, ""],
  ["BMW F55 FD", "FD", 167.5, 111, 2380, "226778bm", 120, 130, 60, 11, "15.2", 4800, 60, 2, ""],
  ["Renault R45 FD", "FD", 123, 80, 2470, "230972re", 95, 115, 60, 11, "11.2", 5500, 60, 2, ""],
  ["Renault HJD RD", "RD", 132, 60, 2170, "267700re", 110, 90, 60, 11, "12", 5500, 60, 2, ""],
  ["Audi 736 RD", "RD", 177.5, 61, 2510, "301129au", 120, 115, 60, 14, "bez vrtání", 0, 0, 0, "bez vrtání"],
];

const sortimentProgramLinks = {
  "276740me": { product_id: "prod-586", technical_list_id: "tl-586", tl_number: "586" },
  "262587to": { product_id: "prod-620", technical_list_id: "tl-620", tl_number: "620" },
  "279530sk": { product_id: "prod-626", technical_list_id: "tl-626", tl_number: "626" },
};

const sortimentProductsSeed = sortimentSourceRows.map(([product_name, , , , , program_code]) => ({
  product_id: sortimentProgramLinks[program_code]?.product_id || `prod-${program_code}`,
  product_name,
  program_code,
  active: true,
  customer: product_name.split(" ")[0],
  internal_code: "",
  note: "",
  source_system: "SORTIMENTY_FINAL.xlsx",
}));

const sortimentTechnicalListsSeed = sortimentSourceRows.map(([product_name_snapshot, , , , , program_code]) => ({
  technical_list_id: sortimentProgramLinks[program_code]?.technical_list_id || `tl-${program_code}`,
  tl_number: sortimentProgramLinks[program_code]?.tl_number || "",
  product_id: sortimentProgramLinks[program_code]?.product_id || `prod-${program_code}`,
  product_name_snapshot,
  program_code,
  revision: "",
  active: true,
  is_favorite: false,
  note: "",
  source_system: "SORTIMENTY_FINAL.xlsx",
}));

const sortimentTechnicalParametersSeed = sortimentSourceRows.map(
  ([product_name, side_type, width_mm, height_mm, perimeter_mm, program_code, cutting_pressure, breaking_pressure, cutting_speed, grinding_value, drill, drill_rpm, drill_feed, drill_arm_count, source_note]) => {
    const technical_list_id = sortimentProgramLinks[program_code]?.technical_list_id || `tl-${program_code}`;
    return {
      technical_parameters_id: `params-${technical_list_id}`,
      technical_list_id,
      side_type,
      width_mm,
      height_mm,
      perimeter_mm,
      glass_thickness_mm: "",
      wheel: "",
      drill,
      drill_rpm,
      drill_feed,
      drill_arm_count,
      cutting_pressure,
      breaking_pressure,
      cutting_speed,
      grinding_value,
      source_note,
      source_product_name: product_name,
      source_system: "SORTIMENTY_FINAL.xlsx",
      updated_at: "",
    };
  },
);

function uniqueSeedById(rows, key) {
  return [...new Map(rows.map((row) => [row[key], row])).values()];
}

const productsSeed = uniqueSeedById([...sortimentProductsSeed, ...legacyProductsSeed], "product_id");
const technicalListsSeed = uniqueSeedById([...sortimentTechnicalListsSeed, ...legacyTechnicalListsSeed], "technical_list_id");
const technicalParametersSeed = uniqueSeedById(
  [...sortimentTechnicalParametersSeed, ...legacyTechnicalParametersSeed],
  "technical_parameters_id",
);

const changeoversSeed = [
  ["chg-1", "tl-626", "tl-732", "machine-cut", "completed", 34, "Test kus OK, tlak ponechán dle TL."],
  ["chg-2", "tl-732", "tl-745", "machine-drill", "completed", 42, "Kontrola vrtáků před sérií."],
  ["chg-3", "tl-586", "tl-626", "machine-grind", "problem", 55, "Zdržení kvůli kontrole kotouče."],
].map(([changeover_id, from_technical_list_id, to_technical_list_id, machine_id, status, duration_minutes, note], index) => ({
  changeover_id,
  from_technical_list_id,
  to_technical_list_id,
  machine_id,
  section_id: machinesSeed.find((machine) => machine.machine_id === machine_id)?.section_id || "",
  started_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * (index + 1)).toISOString(),
  completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * (index + 1) + duration_minutes * 60 * 1000).toISOString(),
  status,
  duration_minutes,
  note,
}));

const parameterHistorySeed = [
  ["param-hist-1", "tl-732", "cutting_pressure", "Řez tlak", "120", "", 8, "Původní nastavení při přehozu."],
  ["param-hist-2", "tl-732", "cutting_pressure", "Řez tlak", "125", "", 5, "Po praskání zvýšen tlak pro test kus."],
  ["param-hist-3", "tl-732", "cutting_pressure", "Řez tlak", "115", "", 2, "Stabilnější výjezd z broušení."],
  ["param-hist-4", "tl-626", "cutting_pressure", "Řez tlak", "110", "", 1, "Ověřené řešení z poslední směny."],
].map(([parameter_history_id, technical_list_id, parameter_code, parameter_name, parameter_value, unit, daysAgo, note]) => ({
  parameter_history_id,
  technical_list_id,
  parameter_code,
  parameter_name,
  parameter_value,
  unit,
  changed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo).toISOString(),
  changed_by_name: "",
  source_entry_id: "",
  note,
}));

const tagsSeed = [
  ["tag-praska", "praská sklo", "problém"],
  ["tag-vrtak", "vrták", "nástroj"],
  ["tag-kotouc", "kotouč", "nástroj"],
  ["tag-tlak", "tlak", "parametr"],
  ["tag-prehoz", "přehoz", "proces"],
  ["tag-test", "test kus", "kontrola"],
  ["tag-bez-vrtani", "bez vrtání", "TL"],
  ["tag-cin", "cín", "materiál"],
  ["tag-emulze", "emulze", "údržba"],
  ["tag-vakuum", "vakuum", "stroj"],
].map(([tag_id, tag_name, tag_group]) => ({ tag_id, tag_name, tag_group, active: true }));

const defaultData = {
  schema_version: 3,
  app_preferences: {
    last_technical_list_id: "tl-732",
  },
  knowledge_entries: [
    {
      entry_id: "entry-1",
      entry_type: "problem",
      title: "",
      text_content: "Praská sklo při výjezdu z broušení. Zkontrolovat kotouč a tlak.",
      technical_list_id: "tl-732",
      product_id: "prod-732",
      section_id: "sec-4",
      machine_id: "machine-grind",
      program_code: "323820sk",
      priority: "important",
      parameter_name: "",
      parameter_value: "",
      unit: "",
      created_by_name: "",
      created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      updated_at: "",
      solution_verified: false,
      solution_verified_at: "",
      resolved_status: "open",
      visibility_status: "visible",
      archived_at: "",
      source_screen: "seed",
      flow_conversion_status: "candidate",
      note: "",
    },
    {
      entry_id: "entry-2",
      entry_type: "solution",
      title: "",
      text_content: "U TL 626 pomohlo snížit řezný tlak na 110 a udělat test kus.",
      technical_list_id: "tl-626",
      product_id: "prod-626",
      section_id: "sec-2",
      machine_id: "machine-cut",
      program_code: "279530sk",
      priority: "normal",
      parameter_name: "řezný tlak",
      parameter_value: "110",
      unit: "",
      created_by_name: "",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      updated_at: "",
      solution_verified: true,
      solution_verified_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      resolved_status: "not_applicable",
      visibility_status: "visible",
      archived_at: "",
      source_screen: "seed",
      flow_conversion_status: "not_used",
      note: "",
    },
    {
      entry_id: "entry-3",
      entry_type: "check_point",
      title: "",
      text_content: "Před sérií vždy ověřit díry bez otřepů a hladkou hranu.",
      technical_list_id: "",
      product_id: "",
      section_id: "sec-8",
      machine_id: "",
      program_code: "",
      priority: "normal",
      parameter_name: "",
      parameter_value: "",
      unit: "",
      created_by_name: "",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updated_at: "",
      solution_verified: false,
      solution_verified_at: "",
      resolved_status: "not_applicable",
      visibility_status: "visible",
      archived_at: "",
      source_screen: "seed",
      flow_conversion_status: "candidate",
      note: "",
    },
  ],
  technical_lists: technicalListsSeed,
  products: productsSeed,
  technical_parameters: technicalParametersSeed,
  parameter_history: parameterHistorySeed,
  production_sections: sectionsSeed,
  machines: machinesSeed,
  changeovers: changeoversSeed,
  photos: [],
  knowledge_entry_photos: [],
  tags: tagsSeed,
  knowledge_entry_tags: [
    { entry_id: "entry-1", tag_id: "tag-praska" },
    { entry_id: "entry-1", tag_id: "tag-kotouc" },
    { entry_id: "entry-1", tag_id: "tag-tlak" },
    { entry_id: "entry-2", tag_id: "tag-tlak" },
    { entry_id: "entry-2", tag_id: "tag-prehoz" },
    { entry_id: "entry-3", tag_id: "tag-test" },
  ],
  entry_feedback: [],
};

let db = structuredClone(defaultData);
let route = "home";
let routeParams = {};
let captureDraft = createEmptyDraft();
let searchState = createEmptySearchState();
const CLOUD_SNAPSHOT_ENDPOINT = "/api/snapshot";
const MAX_BACKUP_BYTES = 25 * 1024 * 1024;
const MAX_IMAGE_FILE_BYTES = 8 * 1024 * 1024;
const MAX_PHOTOS_PER_SELECTION = 8;
const cloudSyncState = { status: "checking", revision: 0, ready: false, isSyncing: false, timer: null, lastError: "" };

const app = document.querySelector("#app");
const titleEl = document.querySelector("#screenTitle");
const toastEl = document.querySelector("#toast");
const quickAddButton = document.querySelector("#quickAddButton");
const connectionStatusEl = document.querySelector("#connectionStatus");
const installButton = document.querySelector("#installButton");
let deferredInstallPrompt = null;

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.route === "capture") {
      openCapture();
      return;
    }
    navigate(button.dataset.route);
  });
});

quickAddButton.addEventListener("click", () => openCapture());
document.querySelector("#syncButton").addEventListener("click", () => navigate("data"));

function updateConnectionStatus() {
  const online = navigator.onLine;
  connectionStatusEl.textContent = online ? "Online" : "Offline";
  connectionStatusEl.classList.toggle("is-offline", !online);
}

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.classList.remove("hidden");
});
window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installButton.classList.add("hidden");
  showToast("FLOW je připravený jako aplikace.");
});
installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  if (choice.outcome === "accepted") showToast("Instalace FLOW zahájena.");
  deferredInstallPrompt = null;
  installButton.classList.add("hidden");
});
updateConnectionStatus();

window.addEventListener("popstate", () => {
  const hash = location.hash.replace(/^#/, "");
  if (!hash) {
    navigate("home", {}, true);
    return;
  }
  const [nextRoute, id] = hash.split("/");
  navigate(nextRoute, id ? { id } : {}, true);
});

boot();

async function boot() {
  db = await loadData();
  const cloudData = await loadCloudSnapshot();
  if (cloudData) {
    db = migrateData(sanitizeImportedData(cloudData));
    await saveData(db, { sync: false });
  }
  const [nextRoute, id] = location.hash ? location.hash.replace(/^#/, "").split("/") : ["home", ""];
  navigate(nextRoute || "home", id ? { id } : {}, true);
}

function createEmptyDraft() {
  return {
    entry_type: "problem",
    text_content: "",
    technical_list_id: "",
    product_id: "",
    section_id: "",
    machine_id: "",
    program_code: "",
    priority: "normal",
    parameter_name: "",
    parameter_value: "",
    unit: "",
    related_entry_id: "",
    tag_ids: [],
    photos: [],
  };
}

function createEmptySearchState() {
  return {
    query: "",
    type: "",
    sectionId: "",
    tlId: "",
    machineId: "",
    priority: "",
    tagId: "",
    withPhoto: false,
    dateFrom: "",
    dateTo: "",
    onlyCritical: false,
    onlyUnresolved: false,
    onlyVerifiedSolutions: false,
    sortBy: "newest",
  };
}

async function loadData() {
  try {
    const stored = await idbGet(IDB_DB_KEY);
    if (stored) return migrateData(stored);

    const legacy = localStorage.getItem(STORAGE_KEY);
    if (legacy) {
      const migrated = migrateData(JSON.parse(legacy));
      await saveData(migrated);
      return migrated;
    }

    await saveData(defaultData);
    return structuredClone(defaultData);
  } catch (error) {
    console.warn("FLOW Capture data reset", error);
    try {
      const fallback = localStorage.getItem(STORAGE_KEY);
      return fallback ? migrateData(JSON.parse(fallback)) : structuredClone(defaultData);
    } catch {
      return structuredClone(defaultData);
    }
  }
}

async function saveData(nextData = db, { sync = true } = {}) {
  db = migrateData(nextData);
  let savedToIndexedDb = true;
  try {
    await idbSet(IDB_DB_KEY, db);
  } catch (error) {
    savedToIndexedDb = false;
    console.warn("IndexedDB save failed, using localStorage fallback", error);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
  try {
    if (savedToIndexedDb) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ schema_version: db.schema_version, last_saved: new Date().toISOString() }));
    }
  } catch {
    // LocalStorage is only a migration marker. IndexedDB is the source of truth.
  }
  if (sync) scheduleCloudSync();
}

function isValidSnapshotData(value) {
  if (!value || typeof value !== "object") return false;
  const requiredCollections = ["knowledge_entries", "technical_lists", "photos", "knowledge_entry_photos"];
  return requiredCollections.every((key) => Array.isArray(value[key]) && value[key].length <= 50000);
}

function sanitizeImportedData(value) {
  if (typeof value === "string") {
    return value.replace(/[<>&"'`]/g, "").slice(0, 20000);
  }
  if (Array.isArray(value)) return value.slice(0, 50000).map(sanitizeImportedData);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 50000)
        .filter(([key]) => /^[a-zA-Z0-9_]+$/.test(key))
        .map(([key, item]) => [key, sanitizeImportedData(item)]),
    );
  }
  return value;
}

async function loadCloudSnapshot() {
  if (!navigator.onLine) {
    cloudSyncState.status = "offline";
    return null;
  }
  try {
    const response = await fetch(CLOUD_SNAPSHOT_ENDPOINT, { credentials: "same-origin", cache: "no-store" });
    if (response.status === 404) {
      cloudSyncState.status = "local-only";
      cloudSyncState.ready = true;
      return null;
    }
    if (response.status === 401) {
      cloudSyncState.status = "sign-in-required";
      return null;
    }
    if (!response.ok) throw new Error(`Cloud snapshot returned ${response.status}`);
    const payload = await response.json();
    if (!isValidSnapshotData(payload.data)) throw new Error("Cloud snapshot has an invalid format");
    cloudSyncState.status = "synced";
    cloudSyncState.revision = Number(payload.revision) || 0;
    cloudSyncState.ready = true;
    return payload.data;
  } catch (error) {
    console.warn("FLOW Capture cloud snapshot unavailable", error);
    cloudSyncState.status = "unavailable";
    cloudSyncState.lastError = "Cloud se nyní nepodařilo načíst.";
    return null;
  }
}

function scheduleCloudSync() {
  if (!cloudSyncState.ready || cloudSyncState.status === "sign-in-required" || cloudSyncState.status === "unavailable") return;
  window.clearTimeout(cloudSyncState.timer);
  cloudSyncState.timer = window.setTimeout(() => syncCloudSnapshot(), 900);
}

async function syncCloudSnapshot({ announce = false } = {}) {
  if (!cloudSyncState.ready || cloudSyncState.isSyncing || !navigator.onLine) return false;
  cloudSyncState.isSyncing = true;
  try {
    const response = await fetch(CLOUD_SNAPSHOT_ENDPOINT, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: db, baseRevision: cloudSyncState.revision }),
    });
    if (response.status === 401) {
      cloudSyncState.status = "sign-in-required";
      return false;
    }
    if (response.status === 409) {
      cloudSyncState.status = "conflict";
      cloudSyncState.ready = false;
      cloudSyncState.lastError = "Na jiném zařízení jsou novější data. Než pokračujete, otevřete je a vytvořte zálohu.";
      if (announce) showToast("Synchronizace zastavena: existují novější cloudová data.");
      return false;
    }
    if (!response.ok) throw new Error(`Cloud snapshot returned ${response.status}`);
    const payload = await response.json();
    cloudSyncState.revision = Number(payload.revision) || cloudSyncState.revision;
    cloudSyncState.status = "synced";
    cloudSyncState.lastError = "";
    if (announce) showToast("Data jsou bezpečně synchronizována.");
    return true;
  } catch (error) {
    console.warn("FLOW Capture cloud sync failed", error);
    cloudSyncState.status = "unavailable";
    cloudSyncState.lastError = "Synchronizace se nepodařila; lokální data zůstala zachována.";
    if (announce) showToast("Synchronizace se nepodařila. Lokální data zůstala zachována.");
    return false;
  } finally {
    cloudSyncState.isSyncing = false;
  }
}

async function startCloudMigration() {
  if (!navigator.onLine) {
    showToast("Pro první synchronizaci je potřeba připojení k internetu.");
    return;
  }
  backupData();
  cloudSyncState.ready = true;
  cloudSyncState.revision = 0;
  cloudSyncState.status = "local-only";
  await syncCloudSnapshot({ announce: true });
  render();
}

function cloudSyncDescription() {
  const labels = {
    checking: "Ověřuji zabezpečené cloudové úložiště…",
    "local-only": "Data jsou zatím jen v tomto zařízení. Před prvním přenosem se stáhne záloha.",
    synced: "Data jsou svázána s vaším přihlášením a budou dostupná i na dalších zařízeních.",
    offline: "Jste offline; data jsou bezpečně dostupná lokálně a odešlou se po připojení.",
    "sign-in-required": "Cloudová synchronizace je dostupná po přihlášení do zabezpečeného webu.",
    conflict: cloudSyncState.lastError,
    unavailable: cloudSyncState.lastError || "Cloudová synchronizace nyní není dostupná; lokální režim funguje dál.",
  };
  return labels[cloudSyncState.status] || labels.checking;
}

function migrateData(raw) {
  const next = { ...structuredClone(defaultData), ...(raw || {}) };
  next.schema_version = 3;
  next.app_preferences = {
    ...defaultData.app_preferences,
    ...(raw?.app_preferences || {}),
  };
  for (const key of Object.keys(defaultData)) {
    if (Array.isArray(defaultData[key]) && !Array.isArray(next[key])) next[key] = [];
  }
  mergeById(next.production_sections, sectionsSeed, "section_id");
  mergeById(next.products, productsSeed, "product_id");
  mergeById(next.technical_lists, technicalListsSeed, "technical_list_id");
  mergeById(next.technical_parameters, technicalParametersSeed, "technical_parameters_id");
  mergeById(next.parameter_history, parameterHistorySeed, "parameter_history_id");
  mergeById(next.machines, machinesSeed, "machine_id");
  mergeById(next.changeovers, changeoversSeed, "changeover_id");
  mergeById(next.tags, tagsSeed, "tag_id");

  next.technical_lists = next.technical_lists.map((tl) => {
    const seed = technicalListsSeed.find((item) => item.technical_list_id === tl.technical_list_id);
    return {
      ...tl,
      is_favorite: tl.is_favorite ?? seed?.is_favorite ?? false,
    };
  });

  next.knowledge_entries = next.knowledge_entries.map((entry) => {
    const priority = entry.priority || severityToPriority(entry.severity);
    const tl = next.technical_lists.find((item) => item.technical_list_id === entry.technical_list_id);
    return {
      ...entry,
      priority,
      machine_id: entry.machine_id || "",
      product_id: entry.product_id || tl?.product_id || "",
      program_code: entry.program_code || tl?.program_code || "",
      updated_at: entry.updated_at || "",
      solution_verified: Boolean(entry.solution_verified),
      solution_verified_at: entry.solution_verified_at || "",
      related_entry_id: entry.related_entry_id || "",
      resolved_status: entry.resolved_status || (entry.entry_type === "problem" ? "open" : "not_applicable"),
      visibility_status: entry.visibility_status || "visible",
      archived_at: entry.archived_at || "",
      flow_conversion_status: entry.flow_conversion_status || "not_used",
    };
  });
  return next;
}

function mergeById(target, seed, key) {
  seed.forEach((item) => {
    if (!target.some((existing) => existing[key] === item[key])) target.push(item);
  });
}

function severityToPriority(severity) {
  if (severity === "stop") return "critical";
  if (severity === "important") return "important";
  return "normal";
}

function idbOpen() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB není dostupné."));
      return;
    }
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(IDB_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet(key) {
  const database = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(IDB_STORE, "readonly");
    const request = tx.objectStore(IDB_STORE).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(key, value) {
  const database = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function navigate(nextRoute, params = {}, replace = false) {
  route = nextRoute;
  routeParams = params;
  const hash = params.id ? `#${nextRoute}/${params.id}` : `#${nextRoute}`;
  if (!replace && location.hash !== hash) {
    history.pushState({}, "", hash);
  } else if (replace && location.hash !== hash) {
    history.replaceState({}, "", hash);
  }
  render();
}

function openCapture(prefill = {}) {
  const lastTlId = db.app_preferences?.last_technical_list_id || "";
  const contextPrefill = prefill.technical_list_id ? prefill : { technical_list_id: lastTlId, ...prefill };
  captureDraft = { ...createEmptyDraft(), ...contextPrefill };
  hydrateDraftFromContext();
  navigate("capture");
}

function hydrateDraftFromContext() {
  const tl = getTl(captureDraft.technical_list_id);
  if (tl) {
    captureDraft.product_id = tl.product_id || "";
    captureDraft.program_code = tl.program_code || "";
  }
  const machine = getMachine(captureDraft.machine_id);
  if (machine && !captureDraft.section_id) captureDraft.section_id = machine.section_id || "";
}

function render() {
  setActiveNav();
  const views = {
    home: renderHome,
    capture: renderCapture,
    search: renderSearch,
    tl: renderTlList,
    tlDetail: renderTlDetail,
    sections: renderSections,
    sectionDetail: renderSectionDetail,
    detail: renderEntryDetail,
    stats: renderStats,
    data: renderData,
  };
  app.innerHTML = (views[route] || renderHome)();
  bindCurrentView();
}

function setActiveNav() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    const current = button.dataset.route;
    const active =
      route === current ||
      (route === "tlDetail" && current === "tl") ||
      (route === "sectionDetail" && current === "sections");
    button.classList.toggle("is-active", active);
  });
}

function setTitle(text) {
  titleEl.textContent = text;
}

function renderHome() {
  setTitle("Domů");
  const recentEntries = getVisibleEntries().slice(0, 4);
  const recentTlIds = [...new Set(getVisibleEntries().map((entry) => entry.technical_list_id).filter(Boolean))].slice(0, 4);
  const favoriteTl = getFavoriteTl().slice(0, 6);
  const lastTl = getTl(db.app_preferences?.last_technical_list_id);
  const openProblems = getOpenProblems().slice(0, 3);
  const todayEntries = getTodayEntryCount();
  const verifiedSolutions = getVerifiedSolutionCount();

  return `
    <section class="stack">
      <div class="home-hero">
        <h2>Rychlý záznam z výroby</h2>
        <p>Vyber typ, napiš pár slov nebo přidej fotku. Detaily můžeš doplnit později.</p>
        <div class="hero-metrics" aria-label="Dnešní přehled">
          <span><strong>${todayEntries}</strong> dnes</span>
          <span><strong>${countOpenProblems()}</strong> nevyřešené</span>
          <span><strong>${countCriticalEntries()}</strong> kritické</span>
          <span><strong>${verifiedSolutions}</strong> ověřené</span>
        </div>
        <button class="primary-button wide-button" type="button" data-route-target="capture">+ Zapsat teď</button>
        <button class="secondary-button wide-button hero-secondary" type="button" data-route-target="stats">Statistiky znalostí</button>
      </div>

      <div class="search-box">
        <span aria-hidden="true">?</span>
        <input id="homeSearch" type="search" inputmode="search" placeholder="Hledat TL, problém, tag, úsek..." />
      </div>

      <div class="smart-filter-row" aria-label="Rychlé přehledy">
        ${smartFilterButton("unresolved", "Nevyřešené", countOpenProblems())}
        ${smartFilterButton("critical", "Kritické", countCriticalEntries())}
        ${smartFilterButton("photo", "S fotkou", getVisibleEntries().filter((entry) => getEntryPhotos(entry.entry_id).length).length)}
        ${smartFilterButton("week", "Poslední týden")}
        ${smartFilterButton("verified", "Ověřená řešení", verifiedSolutions)}
      </div>

      ${
        openProblems.length
          ? `
            <section class="attention-panel">
              <div class="section-title">
                <div>
                  <p class="section-kicker">Pracovní fronta</p>
                  <h2>Vyžaduje pozornost</h2>
                </div>
                <button class="ghost-button" type="button" data-smart-filter="unresolved">Zobrazit vše</button>
              </div>
              <div class="stack">
                ${openProblems.map(renderEntryCard).join("")}
              </div>
            </section>
          `
          : `
            <section class="attention-panel attention-panel--clear">
              <p class="section-kicker">Pracovní fronta</p>
              <h2>Bez otevřených problémů</h2>
              <p class="muted">Dobrá práce — všechny zaznamenané problémy jsou vyřešené nebo čekají na ověření.</p>
            </section>
          `
      }

      <div class="quick-grid">
        ${quickAction("problem", "Problém", "závada / chyba")}
        ${quickAction("photo_note", "Fotka", "vyfotit stav")}
        ${quickAction("solution", "Řešení", "co pomohlo")}
        ${quickAction("machine_setting", "Nastavení", "hodnota stroje")}
      </div>

      <div class="section-title">
        <h2>Oblíbené TL</h2>
        ${lastTl ? `<span class="muted">Poslední: TL ${lastTl.tl_number}</span>` : ""}
      </div>
      <div class="favorite-list">
        ${
          favoriteTl.length
            ? favoriteTl.map((tl) => renderFavoriteTl(tl)).join("")
            : `<div class="empty">Označ TL hvězdičkou a bude tady jedním kliknutím.</div>`
        }
      </div>

      <div class="section-title">
        <h2>Poslední TL</h2>
        <button class="ghost-button" type="button" data-route-target="tl">Všechny</button>
      </div>
      <div class="compact-list">
        ${
          recentTlIds.length
            ? recentTlIds.map((id) => renderTlCard(getTl(id))).join("")
            : `<div class="empty">Zatím není použitý žádný TL.</div>`
        }
      </div>

      <div class="section-title">
        <h2>Poslední záznamy</h2>
        <button class="ghost-button" type="button" data-route-target="search">Hledat</button>
      </div>
      <div class="stack">
        ${recentEntries.map(renderEntryCard).join("") || `<div class="empty">Zatím nejsou uložené záznamy.</div>`}
      </div>
    </section>
  `;
}

function quickAction(type, label, hint) {
  return `
    <button class="quick-card" type="button" data-quick-type="${type}">
      <strong>${label}</strong>
      <small>${hint}</small>
    </button>
  `;
}

function smartFilterButton(kind, label, count = "") {
  const active =
    (kind === "unresolved" && searchState.onlyUnresolved) ||
    (kind === "critical" && searchState.onlyCritical) ||
    (kind === "photo" && searchState.withPhoto) ||
    (kind === "week" && searchState.dateFrom === dateInputDaysAgo(7)) ||
    (kind === "verified" && searchState.onlyVerifiedSolutions);
  return `<button class="smart-filter ${active ? "is-selected" : ""}" type="button" data-smart-filter="${kind}">${label}${count === "" ? "" : ` <strong>${count}</strong>`}</button>`;
}

function renderFavoriteTl(tl) {
  return `
    <button class="favorite-tl" type="button" data-tl-id="${escapeAttr(tl.technical_list_id)}">
      <strong>⭐ TL ${escapeHtml(tl.tl_number)}</strong>
      <span>${escapeHtml(tl.product_name_snapshot)}</span>
    </button>
  `;
}

function renderCapture() {
  setTitle("Rychlý záznam");
  if (!captureDraft.technical_list_id && db.app_preferences?.last_technical_list_id) {
    captureDraft.technical_list_id = db.app_preferences.last_technical_list_id;
    hydrateDraftFromContext();
  }
  const selectedTl = getTl(captureDraft.technical_list_id);
  const selectedSection = getSection(captureDraft.section_id);
  const selectedMachine = getMachine(captureDraft.machine_id);

  return `
    <form class="capture-form" id="captureForm">
      <section class="quick-capture-panel">
        <div class="type-strip" aria-label="Typ záznamu">
          ${entryTypes
            .slice(0, 4)
            .map(
              (type) => `
                <button class="type-pill ${captureDraft.entry_type === type.id ? "is-selected" : ""}" type="button" data-entry-type="${type.id}">
                  ${type.short}
                </button>
              `,
            )
            .join("")}
        </div>

        <div class="field note-field">
          <label for="entryText">Krátká poznámka</label>
          <textarea id="entryText" rows="3" placeholder="Např. praská sklo při výjezdu...">${escapeHtml(captureDraft.text_content)}</textarea>
        </div>

        <div class="capture-actions">
          <label class="camera-button" for="photoInput">Přidat fotku</label>
          <input id="photoInput" type="file" accept="image/*" capture="environment" multiple />
          <button class="primary-button save-now-button" id="saveEntryButton" type="submit">Uložit</button>
        </div>
        <button class="voice-button" id="voiceButton" type="button">Diktovat poznámku</button>

        <div class="photo-preview-grid compact-photos">
          ${captureDraft.photos.map(renderDraftPhoto).join("")}
        </div>

        <div class="context-summary">
          ${selectedTl ? `<span class="badge">Předvyplněno TL ${escapeHtml(selectedTl.tl_number)}</span>` : ""}
          ${selectedSection ? `<span class="badge">${escapeHtml(selectedSection.name)}</span>` : ""}
          ${selectedMachine ? `<span class="badge">${escapeHtml(selectedMachine.machine_code)}</span>` : ""}
        </div>

        <details class="details-panel capture-context">
          <summary>Upřesnit záznam</summary>
          <div class="details-content">
            <div class="field">
              <label for="captureEntryType">Typ záznamu</label>
              <select id="captureEntryType" data-capture-select="entry_type">
                ${entryTypes.map((type) => `<option value="${type.id}" ${captureDraft.entry_type === type.id ? "selected" : ""}>${type.label}</option>`).join("")}
              </select>
            </div>
            <div class="field-row">
              <div class="field">
                <label for="captureTl">Technologický list</label>
                <select id="captureTl" data-capture-select="technical_list_id">
                  <option value="">Bez TL</option>
                  ${db.technical_lists.filter((item) => item.active !== false).map((item) => `<option value="${escapeAttr(item.technical_list_id)}" ${captureDraft.technical_list_id === item.technical_list_id ? "selected" : ""}>TL ${escapeHtml(item.tl_number)} · ${escapeHtml(item.product_name_snapshot)}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label for="capturePriority">Priorita</label>
                <select id="capturePriority" data-capture-select="priority">
                  ${priorities.map((item) => `<option value="${item.id}" ${captureDraft.priority === item.id ? "selected" : ""}>${item.label}</option>`).join("")}
                </select>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label for="captureSection">Úsek</label>
                <select id="captureSection" data-capture-select="section_id">
                  <option value="">Bez úseku</option>
                  ${db.production_sections.filter((item) => item.active !== false).map((item) => `<option value="${item.section_id}" ${captureDraft.section_id === item.section_id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label for="captureMachine">Stroj</label>
                <select id="captureMachine" data-capture-select="machine_id">
                  <option value="">Bez stroje</option>
                  ${getMachinesForSection(captureDraft.section_id).map((item) => `<option value="${escapeAttr(item.machine_id)}" ${captureDraft.machine_id === item.machine_id ? "selected" : ""}>${escapeHtml(item.machine_code)} · ${escapeHtml(item.machine_name)}</option>`).join("")}
                </select>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label for="parameterName">Parametr</label>
                <input id="parameterName" type="text" value="${escapeAttr(captureDraft.parameter_name)}" placeholder="např. řezný tlak" />
              </div>
              <div class="field">
                <label for="parameterValue">Hodnota</label>
                <input id="parameterValue" type="text" value="${escapeAttr(captureDraft.parameter_value)}" placeholder="např. 115" />
              </div>
            </div>
            <div class="field">
              <label for="unitInput">Jednotka</label>
              <input id="unitInput" type="text" value="${escapeAttr(captureDraft.unit)}" placeholder="např. bar, mm/min" />
            </div>
            <div class="field">
              <label>Štítky</label>
              <div class="button-row">
                ${db.tags.map((tag) => `<button class="chip-button ${captureDraft.tag_ids.includes(tag.tag_id) ? "is-selected" : ""}" type="button" data-draft-tag="${escapeAttr(tag.tag_id)}">${escapeHtml(tag.tag_name)}</button>`).join("")}
              </div>
            </div>
          </div>
        </details>
      </section>
    </form>
  `;
}

function renderDraftPhoto(photo, index) {
  return `
    <div class="photo-preview">
      <img src="${safeImageUrl(photo.dataUrl)}" alt="Vybraná fotka ${index + 1}" />
      <button type="button" data-remove-photo="${index}" aria-label="Odebrat fotku">x</button>
    </div>
  `;
}

function renderSearch() {
  setTitle("Hledat");
  const entries = filterEntries();
  const suggestions = getSearchSuggestions(searchState.query).slice(0, 8);
  const activeFilterCount = getActiveFilterCount();

  return `
    <section class="stack">
      <div class="search-box">
        <span aria-hidden="true">?</span>
        <input id="searchInput" type="search" inputmode="search" value="${escapeAttr(searchState.query)}" placeholder="Fulltext, TL, program, tag..." />
      </div>
      <div class="suggestion-row ${suggestions.length ? "" : "is-empty"}" id="searchSuggestions">
        ${suggestions.map((item) => `<button class="suggestion-chip" type="button" data-suggestion="${escapeAttr(item)}">${escapeHtml(item)}</button>`).join("")}
      </div>

      <div class="smart-filter-row" aria-label="Rychlé filtry">
        ${smartFilterButton("unresolved", "Nevyřešené", countOpenProblems())}
        ${smartFilterButton("critical", "Kritické", countCriticalEntries())}
        ${smartFilterButton("photo", "S fotkou")}
        ${smartFilterButton("week", "Poslední týden")}
        ${smartFilterButton("verified", "Ověřená řešení", getVerifiedSolutionCount())}
      </div>

      <details class="details-panel filter-details" ${activeFilterCount ? "open" : ""}>
        <summary>Filtry${activeFilterCount ? ` · ${activeFilterCount}` : ""}</summary>
        <div class="details-content">
          <div class="tabs">
            ${filterChip("type", "", "Vše")}
            ${entryTypes.map((type) => filterChip("type", type.id, type.short)).join("")}
          </div>
          <div class="field-row">
            ${selectFilter("searchTl", "TL", "tlId", db.technical_lists, "technical_list_id", (tl) => `TL ${tl.tl_number}`)}
            ${selectFilter("searchSection", "Úsek", "sectionId", db.production_sections, "section_id", (section) => section.name)}
          </div>
          <div class="field-row">
            ${selectFilter("searchMachine", "Stroj", "machineId", db.machines, "machine_id", (machine) => `${machine.machine_code} · ${machine.machine_name}`)}
            ${selectFilter("searchPriority", "Priorita", "priority", priorities, "id", (priority) => priority.label)}
          </div>
          <div class="field-row">
            ${selectFilter("searchTag", "Tag", "tagId", db.tags, "tag_id", (tag) => tag.tag_name)}
            <div class="field inline-filter">
              <label>Fotky</label>
              <button class="chip-button ${searchState.withPhoto ? "is-selected" : ""}" type="button" id="withPhotoToggle">Jen s fotkou</button>
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="dateFrom">Datum od</label>
              <input id="dateFrom" type="date" value="${escapeAttr(searchState.dateFrom)}" />
            </div>
            <div class="field">
              <label for="dateTo">Datum do</label>
              <input id="dateTo" type="date" value="${escapeAttr(searchState.dateTo)}" />
            </div>
          </div>
          <div class="button-row">
            <button class="chip-button ${searchState.onlyCritical ? "is-selected" : ""}" type="button" id="onlyCriticalToggle">Pouze kritické</button>
            <button class="chip-button ${searchState.onlyUnresolved ? "is-selected" : ""}" type="button" id="onlyUnresolvedToggle">Pouze nevyřešené</button>
            <button class="chip-button ${searchState.onlyVerifiedSolutions ? "is-selected" : ""}" type="button" id="onlyVerifiedToggle">Pouze ověřená řešení</button>
          </div>
          <div class="field">
            <label for="searchSort">Řazení výsledků</label>
            <select id="searchSort">
              <option value="newest" ${searchState.sortBy === "newest" ? "selected" : ""}>Nejnovější</option>
              <option value="oldest" ${searchState.sortBy === "oldest" ? "selected" : ""}>Nejstarší</option>
              <option value="priority" ${searchState.sortBy === "priority" ? "selected" : ""}>Podle priority</option>
              <option value="tl" ${searchState.sortBy === "tl" ? "selected" : ""}>Podle TL</option>
            </select>
          </div>
          <div class="button-row">
            <button class="secondary-button" type="button" id="exportCsvButton">CSV</button>
            <button class="secondary-button" type="button" id="exportXlsxButton">XLSX</button>
            <button class="ghost-button" type="button" id="clearSearch">Vyčistit</button>
          </div>
        </div>
      </details>

      <div class="section-title">
        <h2>Výsledky</h2>
        <span class="muted" id="searchResultCount">${entries.length}</span>
      </div>
      <div class="stack" id="searchResults">
        ${entries.map(renderEntryCard).join("") || `<div class="empty">Nic nenalezeno.</div>`}
      </div>
    </section>
  `;
}

function selectFilter(id, label, stateKey, items, valueKey, labelFn) {
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <select id="${id}" data-search-select="${stateKey}">
        <option value="">Vše</option>
        ${items
          .filter((item) => item.active !== false)
          .map(
            (item) => `
              <option value="${escapeAttr(item[valueKey])}" ${searchState[stateKey] === item[valueKey] ? "selected" : ""}>
                ${escapeHtml(labelFn(item))}
              </option>
            `,
          )
          .join("")}
      </select>
    </div>
  `;
}

function filterChip(kind, value, label) {
  const active = searchState[kind] === value;
  return `<button class="chip-button ${active ? "is-selected" : ""}" type="button" data-filter-kind="${kind}" data-filter-value="${value}">${label}</button>`;
}

function renderTlList() {
  setTitle("TL");
  return `
    <section class="stack">
      <div class="search-box">
        <span aria-hidden="true">?</span>
        <input id="tlSearch" type="search" inputmode="search" placeholder="Hledat TL, program nebo výrobek..." />
      </div>
      <div class="stack" id="tlList">
        ${db.technical_lists.map(renderTlCard).join("")}
      </div>
    </section>
  `;
}

function renderTlDetail() {
  const tl = getTl(routeParams.id);
  if (!tl) {
    setTitle("TL");
    return `<div class="empty">TL nebyl nalezen.</div>`;
  }
  setTitle(`TL ${tl.tl_number}`);
  const entries = getVisibleEntries().filter((entry) => entry.technical_list_id === tl.technical_list_id);
  const byType = groupBy(entries, "entry_type");
  const photos = getPhotosForEntries(entries);
  const params = getTechnicalParameters(tl.technical_list_id);
  const parameterHistory = getTlParameterHistory(tl.technical_list_id);
  const changeovers = getTlChangeovers(tl.technical_list_id);
  const relatedEntries = getRelatedEntriesForTl(tl, entries).slice(0, 5);
  const tlStats = getTlStats(tl, entries);

  return `
    <section class="stack">
      <div class="panel">
        <div class="card-head">
          <div>
            <h2>${tl.is_favorite ? "⭐ " : ""}TL ${escapeHtml(tl.tl_number)}</h2>
            <p class="muted">${escapeHtml(tl.product_name_snapshot)}</p>
          </div>
          <button class="secondary-button favorite-toggle" type="button" data-favorite-tl="${escapeAttr(tl.technical_list_id)}">
            ${tl.is_favorite ? "Odebrat ⭐" : "Přidat ⭐"}
          </button>
        </div>
        <div class="meta-row">
          <span class="badge">${escapeHtml(tl.program_code || "Bez programu")}</span>
          <span class="badge">${escapeHtml(tl.revision || "Bez revize")}</span>
        </div>
        <div class="button-row action-grid">
          <button class="primary-button" type="button" data-add-for-tl="${tl.technical_list_id}" data-type="product_note">Poznámka</button>
          <button class="secondary-button" type="button" data-add-for-tl="${tl.technical_list_id}" data-type="problem">Problém</button>
          <button class="secondary-button" type="button" data-add-for-tl="${tl.technical_list_id}" data-type="machine_setting">Nastavení</button>
          <label class="secondary-button tl-camera-button" for="tlPhotoInput">Vyfotit k TL</label>
          <input class="hidden-file-input" id="tlPhotoInput" data-tl-photo-input="${escapeAttr(tl.technical_list_id)}" type="file" accept="image/*" capture="environment" multiple />
          <button class="secondary-button" type="button" data-export-tl-csv="${tl.technical_list_id}">CSV TL</button>
          <button class="secondary-button" type="button" data-export-tl-xlsx="${tl.technical_list_id}">XLSX TL</button>
        </div>
      </div>

      <div class="knowledge-summary">
        <div class="data-box"><small>Problémy</small><strong>${(byType.problem || []).length}</strong></div>
        <div class="data-box"><small>Řešení</small><strong>${(byType.solution || []).length}</strong></div>
        <div class="data-box"><small>Přehozy</small><strong>${changeovers.length}</strong></div>
        <div class="data-box"><small>Fotky</small><strong>${photos.length}</strong></div>
      </div>

      ${renderTlStats(tlStats)}
      ${renderTechnicalParameters(params)}
      ${renderParameterHistory(parameterHistory)}
      ${renderTypeBlock("Historie problémů", byType.problem)}
      ${renderTypeBlock("Historie řešení", byType.solution, { showVerified: true })}
      ${renderChangeoverHistory(changeovers)}
      ${renderTypeBlock("Nastavení", [...(byType.machine_setting || []), ...(byType.changeover_parameter || [])])}
      ${renderTypeBlock("Kontrolní body", byType.check_point)}
      ${renderTypeBlock("Související záznamy", relatedEntries)}
      ${renderTypeBlock("Poznámky", [...(byType.product_note || []), ...(byType.experience || []), ...(byType.photo_note || [])])}

      <div class="section-title">
        <h2>Fotky</h2>
        <span class="muted">${photos.length}</span>
      </div>
      <div class="photo-preview-grid">
        ${photos.map((photo) => `<img class="detail-photo" src="${safeImageUrl(photo.file_url)}" alt="${escapeAttr(photo.caption || "Fotka záznamu")}" />`).join("") || `<div class="empty">Bez fotek.</div>`}
      </div>
    </section>
  `;
}

function renderSections() {
  setTitle("Úseky");
  return `
    <section class="stack">
      ${db.production_sections
        .filter((section) => section.active)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(renderSectionCard)
        .join("")}
    </section>
  `;
}

function renderSectionDetail() {
  const section = getSection(routeParams.id);
  if (!section) {
    setTitle("Úsek");
    return `<div class="empty">Úsek nebyl nalezen.</div>`;
  }
  setTitle(section.name);
  const entries = getVisibleEntries().filter((entry) => entry.section_id === section.section_id);
  const popularTags = getPopularTags(entries).slice(0, 8);
  const byType = groupBy(entries, "entry_type");

  return `
    <section class="stack">
      <div class="panel">
        <div class="card-head">
          <div>
            <h2>${escapeHtml(section.name)}</h2>
            <p class="muted">${entries.length} záznamů</p>
          </div>
          <button class="primary-button" type="button" data-add-for-section="${escapeAttr(section.section_id)}">Přidat</button>
        </div>
        <div class="tag-row">${popularTags.map((tag) => `<span class="tag">${escapeHtml(tag.tag_name)}</span>`).join("")}</div>
      </div>

      ${renderTypeBlock("Problémy", byType.problem)}
      ${renderTypeBlock("Řešení", byType.solution)}
      ${renderTypeBlock("Nastavení", [...(byType.machine_setting || []), ...(byType.changeover_parameter || [])])}
      ${renderTypeBlock("Kontrolní body", byType.check_point)}
      ${renderTypeBlock("Poslední záznamy", entries)}
    </section>
  `;
}

function renderStats() {
  setTitle("Statistiky");
  const entries = getVisibleEntries();
  const problemEntries = entries.filter((entry) => entry.entry_type === "problem");
  const solutionEntries = entries.filter((entry) => entry.entry_type === "solution");
  const frequentFailures = countProblemTags(problemEntries).slice(0, 6);
  const frequentTags = countTags(entries).slice(0, 6);
  const problematicTl = countProblematicTl(problemEntries).slice(0, 6);
  const problematicMachines = countMachines(problemEntries).slice(0, 6);
  const sectionCounts = countSections(entries).slice(0, 8);
  const frequentSolutions = countSolutions(solutionEntries).slice(0, 6);

  return `
    <section class="stack">
      <div class="stats-grid">
        <div class="data-box"><small>Záznamy</small><strong>${entries.length}</strong></div>
        <div class="data-box"><small>Problémy</small><strong>${problemEntries.length}</strong></div>
        <div class="data-box"><small>Řešení</small><strong>${solutionEntries.length}</strong></div>
        <div class="data-box"><small>Ověřené</small><strong>${solutionEntries.filter((entry) => entry.solution_verified).length}</strong></div>
      </div>
      ${renderStatsList("Nejčastější poruchy", frequentFailures)}
      ${renderStatsList("Nejčastější tagy", frequentTags)}
      ${renderStatsList("Nejproblematičtější TL", problematicTl)}
      ${renderStatsList("Nejproblematičtější stroje", problematicMachines)}
      ${renderStatsList("Nejčastější řešení", frequentSolutions)}
      ${renderStatsList("Počet záznamů podle úseků", sectionCounts)}
    </section>
  `;
}

function renderStatsList(title, items) {
  return `
    <div class="panel">
      <h2>${title}</h2>
      <div class="stats-list">
        ${
          items.length
            ? items
                .map(
                  (item) => `
                    <div class="stats-row">
                      <span>${escapeHtml(item.label)}</span>
                      <strong>${item.count}</strong>
                    </div>
                  `,
                )
                .join("")
            : `<div class="empty">Zatím bez dat.</div>`
        }
      </div>
    </div>
  `;
}

function renderData() {
  setTitle("Data a záloha");
  const entryCount = db.knowledge_entries.length;
  const photoCount = db.photos.length;
  const tlCount = db.technical_lists.filter((item) => item.active !== false).length;
  return `
    <section class="stack">
      <div class="home-hero">
        <h2>Vaše data zůstávají u vás</h2>
        <p>FLOW Capture ukládá záznamy přímo do tohoto zařízení. Záloha umožní bezpečný přesun do jiného telefonu nebo prohlížeče.</p>
      </div>

      <div class="knowledge-summary">
        <div class="data-box"><small>Záznamy</small><strong>${entryCount}</strong></div>
        <div class="data-box"><small>Fotky</small><strong>${photoCount}</strong></div>
        <div class="data-box"><small>Aktivní TL</small><strong>${tlCount}</strong></div>
      </div>

      <div class="panel">
        <h2>Export pro přehledy</h2>
        <p class="muted">Stáhne aktuálně viditelné záznamy v tabulkovém formátu.</p>
        <div class="button-row">
          <button class="primary-button" type="button" id="dataExportXlsx">Exportovat XLSX</button>
          <button class="secondary-button" type="button" id="dataExportCsv">Exportovat CSV</button>
        </div>
      </div>

      <div class="panel">
        <h2>Úplná záloha</h2>
        <p class="muted">Zahrnuje záznamy, fotky, TL, štítky a nastavení. Soubor JSON uschovejte na bezpečném místě.</p>
        <button class="primary-button wide-button" type="button" id="backupDataButton">Stáhnout zálohu</button>
      </div>

      <div class="panel">
        <h2>Obnovit zálohu</h2>
        <p class="muted">Obnovení nahradí současná data v tomto zařízení obsahem vybraného souboru.</p>
        <label class="camera-button wide-button" for="restoreDataInput">Vybrat soubor zálohy</label>
        <input class="hidden-file-input" id="restoreDataInput" type="file" accept="application/json,.json" />
      </div>
      <div class="panel">
        <h2>Synchronizace mezi zařízeními</h2>
        <p class="muted">${escapeHtml(cloudSyncDescription())}</p>
        ${
          cloudSyncState.status === "local-only"
            ? `<button class="primary-button wide-button" type="button" id="cloudSyncButton">Zazálohovat a zapnout synchronizaci</button>`
            : `<button class="secondary-button wide-button" type="button" id="cloudSyncButton" ${cloudSyncState.status === "checking" || cloudSyncState.status === "sign-in-required" || cloudSyncState.status === "conflict" ? "disabled" : ""}>Synchronizovat nyní</button>`
        }
      </div>
    </section>
  `;
}

function renderEntryDetail() {
  const entry = getEntry(routeParams.id);
  if (!entry) {
    setTitle("Záznam");
    return `<div class="empty">Záznam nebyl nalezen.</div>`;
  }
  setTitle(getEntryType(entry.entry_type).label);
  const photos = getEntryPhotos(entry.entry_id);
  const feedback = db.entry_feedback.filter((item) => item.entry_id === entry.entry_id);
  const helpful = feedback.filter((item) => item.feedback_type === "helpful").length;
  const notHelpful = feedback.filter((item) => item.feedback_type === "not_helpful").length;
  const tl = getTl(entry.technical_list_id);
  const section = getSection(entry.section_id);
  const machine = getMachine(entry.machine_id);
  const tags = getEntryTags(entry.entry_id);

  return `
    <section class="detail-hero">
      ${photos.map((photo) => `<img class="detail-photo" src="${safeImageUrl(photo.file_url)}" alt="${escapeAttr(photo.caption || "Fotka záznamu")}" />`).join("")}
      <div class="panel">
        <div class="entry-head">
          <span class="${entryBadgeClass(entry)}">${getEntryType(entry.entry_type).label}</span>
          <small class="muted">${formatDate(entry.created_at)}</small>
        </div>
        <p class="entry-text">${escapeHtml(entry.text_content || "Záznam bez textu.")}</p>
        ${renderEntryTags(tags)}
      </div>

      <div class="data-grid">
        <div class="data-box"><small>TL</small><strong>${tl ? `TL ${escapeHtml(tl.tl_number)}` : "Bez TL"}</strong></div>
        <div class="data-box"><small>Úsek</small><strong>${escapeHtml(section?.name || "Bez úseku")}</strong></div>
        <div class="data-box"><small>Stroj</small><strong>${machine ? `${escapeHtml(machine.machine_code)} · ${escapeHtml(machine.machine_name)}` : "Bez stroje"}</strong></div>
        <div class="data-box"><small>Priorita</small><strong>${priorityLabel(entry.priority)}</strong></div>
        <div class="data-box"><small>Program</small><strong>${escapeHtml(entry.program_code || tl?.program_code || "Bez programu")}</strong></div>
        <div class="data-box"><small>FLOW</small><strong>${flowStatusLabel(entry.flow_conversion_status)}</strong></div>
        <div class="data-box"><small>Stav</small><strong>${entryStatusLabel(entry)}</strong></div>
      </div>

      ${
        entry.parameter_name || entry.parameter_value
          ? `
            <div class="panel">
              <h2>Parametr</h2>
              <div class="data-grid">
                <div class="data-box"><small>Název</small><strong>${escapeHtml(entry.parameter_name || "-")}</strong></div>
                <div class="data-box"><small>Hodnota</small><strong>${escapeHtml([entry.parameter_value, entry.unit].filter(Boolean).join(" ") || "-")}</strong></div>
              </div>
            </div>
          `
          : ""
      }

      <div class="panel">
        <h2>Zpětná vazba</h2>
        <div class="button-row">
          <button class="secondary-button" type="button" data-feedback="helpful">Pomohlo (${helpful})</button>
          <button class="secondary-button" type="button" data-feedback="not_helpful">Nepomohlo (${notHelpful})</button>
          <button class="secondary-button" type="button" data-feedback="duplicate">Duplicitní</button>
          <button class="secondary-button" type="button" data-feedback="wrong">Chybné</button>
        </div>
      </div>

      ${
        entry.entry_type === "solution"
          ? `
            <div class="panel verified-panel">
              <h2>Ověření řešení</h2>
              <p class="muted">${entry.solution_verified ? `Ověřeno ${formatDate(entry.solution_verified_at || entry.updated_at || entry.created_at)}` : "Řešení zatím není ověřené."}</p>
              <button class="${entry.solution_verified ? "secondary-button" : "primary-button"} wide-button" type="button" data-verify-solution="${entry.entry_id}">
                ${entry.solution_verified ? "Označit jako neověřené" : "Označit řešení jako ověřené"}
              </button>
            </div>
          `
          : ""
      }

      <div class="panel">
        <h2>Doplnit</h2>
        ${
          entry.entry_type === "problem"
            ? `
              <button class="${entry.resolved_status === "resolved" ? "secondary-button" : "primary-button"} wide-button status-action" type="button" data-toggle-resolved="${entry.entry_id}">
                ${entry.resolved_status === "resolved" ? "Označit jako nevyřešené" : "Označit problém jako vyřešený"}
              </button>
              <button class="secondary-button wide-button status-action" type="button" data-add-solution-for-entry="${entry.entry_id}">Přidat řešení k problému</button>
            `
            : ""
        }
        <div class="field-row">
          <div class="field">
            <label for="detailTl">TL</label>
            <select id="detailTl">
              <option value="">Bez TL</option>
              ${db.technical_lists.map((item) => `<option value="${item.technical_list_id}" ${entry.technical_list_id === item.technical_list_id ? "selected" : ""}>TL ${item.tl_number}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="detailSection">Úsek</label>
            <select id="detailSection">
              <option value="">Bez úseku</option>
              ${db.production_sections.map((item) => `<option value="${item.section_id}" ${entry.section_id === item.section_id ? "selected" : ""}>${item.name}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="detailMachine">Stroj</label>
            <select id="detailMachine">
              <option value="">Bez stroje</option>
              ${getMachinesForSection(entry.section_id)
                .map((item) => `<option value="${item.machine_id}" ${entry.machine_id === item.machine_id ? "selected" : ""}>${item.machine_code} · ${item.machine_name}</option>`)
                .join("")}
            </select>
          </div>
          <div class="field">
            <label for="detailPriority">Priorita</label>
            <select id="detailPriority">
              ${priorities.map((item) => `<option value="${item.id}" ${entry.priority === item.id ? "selected" : ""}>${item.label}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label for="detailParameterName">Parametr</label>
            <input id="detailParameterName" type="text" value="${escapeAttr(entry.parameter_name || "")}" placeholder="např. řezný tlak" />
          </div>
          <div class="field">
            <label for="detailParameterValue">Hodnota</label>
            <input id="detailParameterValue" type="text" value="${escapeAttr(entry.parameter_value || "")}" placeholder="např. 115" />
          </div>
        </div>
        <div class="field">
          <label for="detailUnit">Jednotka</label>
          <input id="detailUnit" type="text" value="${escapeAttr(entry.unit || "")}" placeholder="např. bar, mm/min" />
        </div>
        <div class="button-row">
          ${db.tags
            .map(
              (tag) => `
                <button class="chip-button ${tags.some((item) => item.tag_id === tag.tag_id) ? "is-selected" : ""}" type="button" data-detail-tag="${tag.tag_id}">
                  ${tag.tag_name}
                </button>
              `,
            )
            .join("")}
        </div>
        <div class="photo-picker detail-photo-picker">
          <label class="camera-button" for="detailPhotoInput">Doplnit fotku</label>
          <input id="detailPhotoInput" type="file" accept="image/*" capture="environment" multiple />
        </div>
        <button class="secondary-button wide-button archive-action" type="button" data-archive-entry="${entry.entry_id}">
          ${entry.visibility_status === "archived" ? "Obnovit z archivu" : "Archivovat záznam"}
        </button>
      </div>
    </section>
  `;
}

function renderTechnicalParameters(params) {
  return `
    <div class="section-title">
      <h2>Technické parametry</h2>
      <span class="muted">${params ? "TL data" : "chybí"}</span>
    </div>
    ${
      params
        ? `
          <div class="parameter-grid">
            ${parameterBox("Typ", params.side_type)}
            ${parameterBox("Šířka", formatNumber(params.width_mm, "mm"))}
            ${parameterBox("Výška", formatNumber(params.height_mm, "mm"))}
            ${parameterBox("Obvod", formatNumber(params.perimeter_mm, "mm"))}
            ${parameterBox("Kotouč", params.wheel)}
            ${parameterBox("Vrták", params.drill)}
            ${parameterBox("Otáčky", params.drill_rpm || "bez vrtání")}
            ${parameterBox("Posuv", params.drill_feed || "bez vrtání")}
            ${parameterBox("Rameno", params.drill_arm_count || "bez vrtání")}
            ${parameterBox("Řez tlak", params.cutting_pressure)}
            ${parameterBox("Vylam tlak", params.breaking_pressure)}
            ${parameterBox("Řez rychlost", params.cutting_speed)}
          </div>
        `
        : `<div class="empty">Pro tento TL zatím nejsou technické parametry.</div>`
    }
  `;
}

function renderTlStats(stats) {
  return `
    <div class="section-title">
      <h2>Statistiky TL</h2>
      <span class="muted">rychlý přehled</span>
    </div>
    <div class="knowledge-summary">
      <div class="data-box"><small>Nevyřešené</small><strong>${stats.openProblems}</strong></div>
      <div class="data-box"><small>Ověřená řešení</small><strong>${stats.verifiedSolutions}</strong></div>
      <div class="data-box"><small>Nejčastější tag</small><strong>${escapeHtml(stats.topTag || "-")}</strong></div>
      <div class="data-box"><small>Nejčastější stroj</small><strong>${escapeHtml(stats.topMachine || "-")}</strong></div>
    </div>
  `;
}

function renderParameterHistory(history) {
  return `
    <div class="section-title">
      <h2>Historie parametrů</h2>
      <span class="muted">${history.length}</span>
    </div>
    <div class="stack">
      ${
        history.length
          ? history
              .slice(0, 8)
              .map(
                (item) => `
                  <div class="timeline-card parameter-history-card">
                    <div class="entry-head">
                      <strong>${escapeHtml(item.parameter_name || "Parametr")}</strong>
                      <span class="badge">${formatDate(item.changed_at)}</span>
                    </div>
                    <p class="entry-text">${escapeHtml([item.parameter_value, item.unit].filter(Boolean).join(" ") || "-")}</p>
                    ${item.note ? `<p class="muted">${escapeHtml(item.note)}</p>` : ""}
                  </div>
                `,
              )
              .join("")
          : `<div class="empty">Zatím bez historie parametrů.</div>`
      }
    </div>
  `;
}

function parameterBox(label, value) {
  return `<div class="data-box"><small>${label}</small><strong>${escapeHtml(value || "-")}</strong></div>`;
}

function renderChangeoverHistory(changeovers) {
  return `
    <div class="section-title">
      <h2>Historie přehozů</h2>
      <span class="muted">${changeovers.length}</span>
    </div>
    <div class="stack">
      ${
        changeovers.length
          ? changeovers.map(renderChangeoverCard).join("")
          : `<div class="empty">Zatím bez záznamu přehozu.</div>`
      }
    </div>
  `;
}

function renderChangeoverCard(changeover) {
  const fromTl = getTl(changeover.from_technical_list_id);
  const toTl = getTl(changeover.to_technical_list_id);
  const machine = getMachine(changeover.machine_id);
  return `
    <div class="timeline-card">
      <div class="entry-head">
        <strong>${fromTl ? `TL ${fromTl.tl_number}` : "?"} → ${toTl ? `TL ${toTl.tl_number}` : "?"}</strong>
        <span class="badge">${changeover.duration_minutes} min</span>
      </div>
      <p class="entry-text">${escapeHtml(changeover.note || "Bez poznámky.")}</p>
      <div class="meta-row">
        ${machine ? `<span class="badge">${machine.machine_code}</span>` : ""}
        <span class="badge">${changeover.status === "problem" ? "problém" : "hotovo"}</span>
        <span class="tag">${formatDate(changeover.started_at)}</span>
      </div>
    </div>
  `;
}

function renderTypeBlock(title, entries = [], options = {}) {
  return `
    <div class="section-title">
      <h2>${title}</h2>
      <span class="muted">${entries.length}</span>
    </div>
    <div class="stack">
      ${entries.slice(0, 5).map((entry) => renderEntryCard(entry, options)).join("") || `<div class="empty">Bez záznamů.</div>`}
    </div>
  `;
}

function renderEntryCard(entry, options = {}) {
  const tl = getTl(entry.technical_list_id);
  const section = getSection(entry.section_id);
  const machine = getMachine(entry.machine_id);
  const tags = getEntryTags(entry.entry_id);
  const photo = getEntryPhotos(entry.entry_id)[0];
  const feedbackCounts = getFeedbackCounts(entry.entry_id);
  return `
    <button class="entry-card" type="button" data-entry-id="${escapeAttr(entry.entry_id)}">
      <div class="entry-head">
        <div>
          <p class="entry-title">${getEntryType(entry.entry_type).label}</p>
          <small class="muted">${formatDate(entry.created_at)}</small>
        </div>
        <div class="entry-side">
          <span class="${entryBadgeClass(entry)}">${priorityLabel(entry.priority)}</span>
          ${photo ? `<img class="thumb" src="${safeImageUrl(photo.file_url)}" alt="" />` : ""}
        </div>
      </div>
      <p class="entry-text">${escapeHtml(entry.text_content || "Záznam bez textu.")}</p>
      <div class="meta-row">
        ${options.showVerified && entry.solution_verified ? `<span class="badge verified">Ověřené</span>` : ""}
        ${tl ? `<span class="badge">TL ${escapeHtml(tl.tl_number)}</span>` : ""}
        ${section ? `<span class="badge">${escapeHtml(section.name)}</span>` : ""}
        ${machine ? `<span class="badge">${escapeHtml(machine.machine_code)}</span>` : ""}
        ${entry.program_code ? `<span class="badge">${escapeHtml(entry.program_code)}</span>` : ""}
        ${entry.entry_type === "solution" ? `<span class="badge verified">Pomohlo ${feedbackCounts.helpful}× / Nepomohlo ${feedbackCounts.notHelpful}×</span>` : ""}
        ${entry.entry_type === "problem" && entry.resolved_status === "resolved" ? `<span class="badge verified">Vyřešeno</span>` : ""}
      </div>
      ${renderEntryTags(tags)}
    </button>
  `;
}

function renderEntryTags(tags) {
  return tags.length ? `<div class="tag-row">${tags.map((tag) => `<span class="tag">${escapeHtml(tag.tag_name)}</span>`).join("")}</div>` : "";
}

function renderTlCard(tl) {
  if (!tl) return "";
  const count = getVisibleEntries().filter((entry) => entry.technical_list_id === tl.technical_list_id).length;
  return `
    <button class="tl-card" type="button" data-tl-id="${escapeAttr(tl.technical_list_id)}">
      <div class="card-head">
        <div>
          <h3>${tl.is_favorite ? "⭐ " : ""}TL ${escapeHtml(tl.tl_number)}</h3>
          <p class="muted">${escapeHtml(tl.product_name_snapshot)}</p>
        </div>
        <span class="badge">${escapeHtml(tl.program_code || "Bez programu")}</span>
      </div>
      <div class="meta-row">
        <span class="tag">${count} záznamů</span>
      </div>
    </button>
  `;
}

function renderSectionCard(section) {
  const count = getVisibleEntries().filter((entry) => entry.section_id === section.section_id).length;
  return `
    <button class="section-card" type="button" data-section-id="${escapeAttr(section.section_id)}">
      <div class="card-head">
        <div>
          <h3>${escapeHtml(section.name)}</h3>
          <p class="muted">${count} záznamů</p>
        </div>
        <span class="badge">${section.sort_order}</span>
      </div>
    </button>
  `;
}

function bindCurrentView() {
  app.querySelectorAll("[data-route-target]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.routeTarget === "capture") {
        openCapture();
        return;
      }
      navigate(button.dataset.routeTarget);
    });
  });

  app.querySelectorAll("[data-quick-type]").forEach((button) => {
    button.addEventListener("click", () => openCapture({ entry_type: button.dataset.quickType }));
  });

  app.querySelectorAll("[data-smart-filter]").forEach((button) => {
    button.addEventListener("click", () => applySmartFilter(button.dataset.smartFilter));
  });

  bindEntryCardLinks(app);

  app.querySelectorAll("[data-tl-id]").forEach((button) => {
    button.addEventListener("click", () => navigate("tlDetail", { id: button.dataset.tlId }));
  });

  app.querySelectorAll("[data-section-id]").forEach((button) => {
    button.addEventListener("click", () => navigate("sectionDetail", { id: button.dataset.sectionId }));
  });

  app.querySelectorAll("[data-add-for-tl]").forEach((button) => {
    button.addEventListener("click", () =>
      openCapture({
        entry_type: button.dataset.type || "product_note",
        technical_list_id: button.dataset.addForTl,
      }),
    );
  });

  app.querySelectorAll("[data-add-for-section]").forEach((button) => {
    button.addEventListener("click", () =>
      openCapture({
        entry_type: "problem",
        section_id: button.dataset.addForSection,
      }),
    );
  });

  app.querySelectorAll("[data-favorite-tl]").forEach((button) => {
    button.addEventListener("click", async () => {
      const tl = getTl(button.dataset.favoriteTl);
      if (!tl) return;
      tl.is_favorite = !tl.is_favorite;
      await saveData();
      showToast(tl.is_favorite ? "TL přidán do oblíbených." : "TL odebrán z oblíbených.");
      render();
    });
  });

  app.querySelectorAll("[data-export-tl-csv]").forEach((button) => {
    button.addEventListener("click", () => exportTlCsv(button.dataset.exportTlCsv));
  });

  app.querySelectorAll("[data-export-tl-xlsx]").forEach((button) => {
    button.addEventListener("click", () => exportTlXlsx(button.dataset.exportTlXlsx));
  });

  app.querySelectorAll("[data-tl-photo-input]").forEach((input) => {
    input.addEventListener("change", async () => {
      const files = Array.from(input.files || []);
      const loaded = await readSelectedImages(files);
      await savePhotoNoteForTl(input.dataset.tlPhotoInput, loaded.map((dataUrl) => ({ dataUrl })));
    });
  });

  const homeSearch = app.querySelector("#homeSearch");
  if (homeSearch) {
    homeSearch.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        searchState.query = homeSearch.value.trim();
        navigate("search");
      }
    });
  }

  if (route === "capture") bindCapture();
  if (route === "search") bindSearch();
  if (route === "tl") bindTlSearch();
  if (route === "detail") bindDetail();
  if (route === "data") bindData();
}

function bindData() {
  app.querySelector("#dataExportXlsx").addEventListener("click", () => exportXlsx());
  app.querySelector("#dataExportCsv").addEventListener("click", () => exportCsv());
  app.querySelector("#backupDataButton").addEventListener("click", backupData);
  app.querySelector("#restoreDataInput").addEventListener("change", restoreData);
  const cloudSyncButton = app.querySelector("#cloudSyncButton");
  if (cloudSyncButton) {
    cloudSyncButton.addEventListener("click", async () => {
      if (cloudSyncState.status === "local-only") await startCloudMigration();
      else {
        await syncCloudSnapshot({ announce: true });
        render();
      }
    });
  }
}

function bindCapture() {
  app.querySelectorAll("[data-entry-type]").forEach((button) => {
    button.addEventListener("click", () => {
      updateDraftFromForm();
      captureDraft.entry_type = button.dataset.entryType;
      render();
    });
  });

  app.querySelectorAll("[data-remove-photo]").forEach((button) => {
    button.addEventListener("click", () => {
      updateDraftFromForm();
      captureDraft.photos.splice(Number(button.dataset.removePhoto), 1);
      render();
    });
  });

  app.querySelectorAll("[data-capture-select]").forEach((select) => {
    select.addEventListener("change", () => {
      updateDraftFromForm();
      if (select.dataset.captureSelect === "section_id") {
        const machine = getMachine(captureDraft.machine_id);
        if (machine && machine.section_id !== captureDraft.section_id) captureDraft.machine_id = "";
      }
      hydrateDraftFromContext();
      render();
    });
  });

  app.querySelectorAll("[data-draft-tag]").forEach((button) => {
    button.addEventListener("click", () => {
      updateDraftFromForm();
      const tagId = button.dataset.draftTag;
      captureDraft.tag_ids = captureDraft.tag_ids.includes(tagId)
        ? captureDraft.tag_ids.filter((id) => id !== tagId)
        : [...captureDraft.tag_ids, tagId];
      render();
    });
  });

  const photoInput = app.querySelector("#photoInput");
  photoInput.addEventListener("change", async () => {
    updateDraftFromForm();
    const files = Array.from(photoInput.files || []);
    const loaded = await readSelectedImages(files);
    captureDraft.photos.push(...loaded.map((dataUrl) => ({ dataUrl })));
    render();
  });

  const voiceButton = app.querySelector("#voiceButton");
  if (voiceButton) {
    voiceButton.addEventListener("click", startVoiceInput);
  }

  app.querySelector("#captureForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    updateDraftFromForm();
    await saveEntry();
  });
}

function updateDraftFromForm() {
  const text = app.querySelector("#entryText");
  const parameterName = app.querySelector("#parameterName");
  const parameterValue = app.querySelector("#parameterValue");
  const unit = app.querySelector("#unitInput");

  if (text) captureDraft.text_content = text.value;
  if (parameterName) captureDraft.parameter_name = parameterName.value;
  if (parameterValue) captureDraft.parameter_value = parameterValue.value;
  if (unit) captureDraft.unit = unit.value;
  const entryType = app.querySelector("#captureEntryType");
  const tl = app.querySelector("#captureTl");
  const section = app.querySelector("#captureSection");
  const machine = app.querySelector("#captureMachine");
  const priority = app.querySelector("#capturePriority");
  if (entryType) captureDraft.entry_type = entryType.value;
  if (tl) captureDraft.technical_list_id = tl.value;
  if (section) captureDraft.section_id = section.value;
  if (machine) captureDraft.machine_id = machine.value;
  if (priority) captureDraft.priority = priority.value;
}

async function saveEntry() {
  const hasText = captureDraft.text_content.trim().length > 0;
  const hasPhoto = captureDraft.photos.length > 0;
  if (!hasText && !hasPhoto) {
    showToast("Zadej text nebo přidej fotku.");
    return;
  }

  const now = new Date().toISOString();
  const entryId = makeId("entry");
  const entry = {
    entry_id: entryId,
    entry_type: captureDraft.entry_type,
    title: "",
    text_content: captureDraft.text_content.trim(),
    technical_list_id: captureDraft.technical_list_id,
    product_id: captureDraft.product_id,
    section_id: captureDraft.section_id,
    machine_id: captureDraft.machine_id,
    program_code: captureDraft.program_code,
    priority: captureDraft.priority || "normal",
    parameter_name: captureDraft.parameter_name.trim(),
    parameter_value: captureDraft.parameter_value.trim(),
    unit: captureDraft.unit.trim(),
    related_entry_id: captureDraft.related_entry_id || "",
    created_by_name: "",
    created_at: now,
    updated_at: "",
    solution_verified: false,
    solution_verified_at: "",
    resolved_status: captureDraft.entry_type === "problem" ? "open" : "not_applicable",
    visibility_status: "visible",
    archived_at: "",
    source_screen: "capture_quick",
    flow_conversion_status: "not_used",
    note: "",
  };

  db.knowledge_entries.unshift(entry);
  captureDraft.tag_ids.forEach((tagId) => {
    db.knowledge_entry_tags.push({ entry_id: entryId, tag_id: tagId });
  });

  captureDraft.photos.forEach((photo, index) => {
    addPhotoToEntry(entry, photo, index + 1, now);
  });

  if (entry.technical_list_id) {
    db.app_preferences.last_technical_list_id = entry.technical_list_id;
  }

  await saveData();
  showToast("Záznam uložen.");
  captureDraft = createEmptyDraft();
  navigate("detail", { id: entryId });
}

async function savePhotoNoteForTl(technicalListId, photos) {
  if (!photos.length) return;
  const tl = getTl(technicalListId);
  if (!tl) return;
  const now = new Date().toISOString();
  const entry = {
    entry_id: makeId("entry"),
    entry_type: "photo_note",
    title: "",
    text_content: "",
    technical_list_id: tl.technical_list_id,
    product_id: tl.product_id || "",
    section_id: "",
    machine_id: "",
    program_code: tl.program_code || "",
    priority: "normal",
    parameter_name: "",
    parameter_value: "",
    unit: "",
    related_entry_id: "",
    created_by_name: "",
    created_at: now,
    updated_at: "",
    solution_verified: false,
    solution_verified_at: "",
    resolved_status: "not_applicable",
    visibility_status: "visible",
    archived_at: "",
    source_screen: "tl_photo",
    flow_conversion_status: "not_used",
    note: "",
  };
  db.knowledge_entries.unshift(entry);
  photos.forEach((photo, index) => addPhotoToEntry(entry, photo, index + 1, now));
  db.app_preferences.last_technical_list_id = tl.technical_list_id;
  await saveData();
  showToast("Fotka uložena k TL.");
  render();
}

function addPhotosToEntry(entry, photos) {
  const now = new Date().toISOString();
  const startOrder = getEntryPhotos(entry.entry_id).length;
  photos.forEach((photo, index) => addPhotoToEntry(entry, photo, startOrder + index + 1, now));
}

function addPhotoToEntry(entry, photo, sortOrder, uploadedAt = new Date().toISOString()) {
  const photoId = makeId("photo");
  db.photos.unshift({
    photo_id: photoId,
    file_url: photo.dataUrl,
    uploaded_at: uploadedAt,
    caption: "",
    photo_type: photoTypeForEntry(entry.entry_type),
    file_size_bytes: estimateDataUrlSize(photo.dataUrl),
    mime_type: photo.dataUrl.split(";")[0].replace("data:", ""),
    technical_list_id: entry.technical_list_id,
    section_id: entry.section_id,
  });
  db.knowledge_entry_photos.push({
    entry_photo_id: makeId("entry-photo"),
    entry_id: entry.entry_id,
    photo_id: photoId,
    sort_order: sortOrder,
    note: "",
  });
}

function appendParameterHistory(entry) {
  if (!entry.technical_list_id || (!entry.parameter_name && !entry.parameter_value)) return;
  db.parameter_history.unshift({
    parameter_history_id: makeId("param-hist"),
    technical_list_id: entry.technical_list_id,
    parameter_code: normalize(entry.parameter_name || "parametr").replace(/\s+/g, "_"),
    parameter_name: entry.parameter_name,
    parameter_value: entry.parameter_value,
    unit: entry.unit,
    changed_at: new Date().toISOString(),
    changed_by_name: "",
    source_entry_id: entry.entry_id,
    note: entry.text_content || "",
  });
}

function bindSearch() {
  const input = app.querySelector("#searchInput");
  input.addEventListener("input", () => {
    searchState.query = input.value;
    updateSearchResults();
  });
  app.querySelectorAll("[data-filter-kind]").forEach((button) => {
    button.addEventListener("click", () => {
      searchState[button.dataset.filterKind] = button.dataset.filterValue;
      render();
    });
  });
  app.querySelectorAll("[data-search-select]").forEach((select) => {
    select.addEventListener("change", () => {
      searchState[select.dataset.searchSelect] = select.value;
      render();
    });
  });
  app.querySelector("#withPhotoToggle").addEventListener("click", () => {
    searchState.withPhoto = !searchState.withPhoto;
    render();
  });
  app.querySelector("#onlyCriticalToggle").addEventListener("click", () => {
    searchState.onlyCritical = !searchState.onlyCritical;
    render();
  });
  app.querySelector("#onlyUnresolvedToggle").addEventListener("click", () => {
    searchState.onlyUnresolved = !searchState.onlyUnresolved;
    render();
  });
  app.querySelector("#onlyVerifiedToggle").addEventListener("click", () => {
    searchState.onlyVerifiedSolutions = !searchState.onlyVerifiedSolutions;
    render();
  });
  app.querySelector("#dateFrom").addEventListener("change", (event) => {
    searchState.dateFrom = event.target.value;
    render();
  });
  app.querySelector("#dateTo").addEventListener("change", (event) => {
    searchState.dateTo = event.target.value;
    render();
  });
  app.querySelector("#searchSort").addEventListener("change", (event) => {
    searchState.sortBy = event.target.value;
    render();
  });
  bindSearchSuggestions();
  app.querySelector("#clearSearch").addEventListener("click", () => {
    searchState = createEmptySearchState();
    render();
  });
  app.querySelector("#exportCsvButton").addEventListener("click", () => exportCsv(filterEntries()));
  app.querySelector("#exportXlsxButton").addEventListener("click", () => exportXlsx(filterEntries()));
}

function updateSearchResults() {
  const entries = filterEntries();
  const count = app.querySelector("#searchResultCount");
  const results = app.querySelector("#searchResults");
  if (!count || !results) return;
  count.textContent = entries.length;
  results.innerHTML = entries.map(renderEntryCard).join("") || `<div class="empty">Nic nenalezeno.</div>`;
  bindEntryCardLinks(results);
  updateSearchSuggestions();
}

function bindSearchSuggestions() {
  app.querySelectorAll("[data-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      searchState.query = button.dataset.suggestion;
      render();
    });
  });
}

function updateSearchSuggestions() {
  const row = app.querySelector("#searchSuggestions");
  if (!row) return;
  const suggestions = getSearchSuggestions(searchState.query).slice(0, 8);
  row.classList.toggle("is-empty", suggestions.length === 0);
  row.innerHTML = suggestions
    .map((item) => `<button class="suggestion-chip" type="button" data-suggestion="${escapeAttr(item)}">${escapeHtml(item)}</button>`)
    .join("");
  bindSearchSuggestions();
}

function bindEntryCardLinks(root) {
  root.querySelectorAll("[data-entry-id]").forEach((button) => {
    button.addEventListener("click", () => navigate("detail", { id: button.dataset.entryId }));
  });
}

function bindTlSearch() {
  const input = app.querySelector("#tlSearch");
  const list = app.querySelector("#tlList");
  input.addEventListener("input", () => {
    const needle = normalize(input.value);
    const items = db.technical_lists.filter((tl) => {
      const haystack = normalize(`${tl.tl_number} ${tl.product_name_snapshot} ${tl.program_code}`);
      return haystack.includes(needle);
    });
    list.innerHTML = items.map(renderTlCard).join("") || `<div class="empty">TL nebyl nalezen.</div>`;
    list.querySelectorAll("[data-tl-id]").forEach((button) => {
      button.addEventListener("click", () => navigate("tlDetail", { id: button.dataset.tlId }));
    });
  });
}

function bindDetail() {
  const entry = getEntry(routeParams.id);
  if (!entry) return;

  app.querySelectorAll("[data-feedback]").forEach((button) => {
    button.addEventListener("click", async () => {
      db.entry_feedback.push({
        feedback_id: makeId("feedback"),
        entry_id: entry.entry_id,
        feedback_type: button.dataset.feedback,
        created_at: new Date().toISOString(),
        comment: "",
        created_by_name: "",
      });
      await saveData();
      showToast("Zpětná vazba uložena.");
      render();
    });
  });

  const verifyButton = app.querySelector("[data-verify-solution]");
  if (verifyButton) {
    verifyButton.addEventListener("click", async () => {
      entry.solution_verified = !entry.solution_verified;
      entry.solution_verified_at = entry.solution_verified ? new Date().toISOString() : "";
      entry.flow_conversion_status = entry.solution_verified ? "candidate" : entry.flow_conversion_status;
      entry.updated_at = new Date().toISOString();
      await saveData();
      showToast(entry.solution_verified ? "Řešení označeno jako ověřené." : "Řešení je znovu neověřené.");
      render();
    });
  }

  app.querySelector("#detailTl").addEventListener("change", async (event) => {
    entry.technical_list_id = event.target.value;
    const tl = getTl(event.target.value);
    entry.product_id = tl?.product_id || "";
    entry.program_code = tl?.program_code || entry.program_code;
    if (entry.technical_list_id) db.app_preferences.last_technical_list_id = entry.technical_list_id;
    entry.updated_at = new Date().toISOString();
    await saveData();
    showToast("TL doplněn.");
    render();
  });

  app.querySelector("#detailSection").addEventListener("change", async (event) => {
    entry.section_id = event.target.value;
    if (!getMachinesForSection(entry.section_id).some((machine) => machine.machine_id === entry.machine_id)) {
      entry.machine_id = "";
    }
    entry.updated_at = new Date().toISOString();
    await saveData();
    showToast("Úsek doplněn.");
    render();
  });

  app.querySelector("#detailMachine").addEventListener("change", async (event) => {
    entry.machine_id = event.target.value;
    const machine = getMachine(entry.machine_id);
    if (machine && !entry.section_id) entry.section_id = machine.section_id;
    entry.updated_at = new Date().toISOString();
    await saveData();
    showToast("Stroj doplněn.");
    render();
  });

  app.querySelector("#detailPriority").addEventListener("change", async (event) => {
    entry.priority = event.target.value;
    entry.updated_at = new Date().toISOString();
    await saveData();
    showToast("Priorita doplněna.");
    render();
  });

  ["detailParameterName", "detailParameterValue", "detailUnit"].forEach((id) => {
    const input = app.querySelector(`#${id}`);
    if (!input) return;
    input.addEventListener("change", async () => {
      const before = `${entry.parameter_name || ""}|${entry.parameter_value || ""}|${entry.unit || ""}`;
      entry.parameter_name = app.querySelector("#detailParameterName").value.trim();
      entry.parameter_value = app.querySelector("#detailParameterValue").value.trim();
      entry.unit = app.querySelector("#detailUnit").value.trim();
      entry.updated_at = new Date().toISOString();
      const after = `${entry.parameter_name || ""}|${entry.parameter_value || ""}|${entry.unit || ""}`;
      if (before !== after) appendParameterHistory(entry);
      await saveData();
      showToast("Parametr uložen do historie.");
      render();
    });
  });

  const detailPhotoInput = app.querySelector("#detailPhotoInput");
  if (detailPhotoInput) {
    detailPhotoInput.addEventListener("change", async () => {
      const files = Array.from(detailPhotoInput.files || []);
      const loaded = await readSelectedImages(files);
      addPhotosToEntry(entry, loaded.map((dataUrl) => ({ dataUrl })));
      entry.updated_at = new Date().toISOString();
      await saveData();
      showToast("Fotka doplněna.");
      render();
    });
  }

  const archiveButton = app.querySelector("[data-archive-entry]");
  if (archiveButton) {
    archiveButton.addEventListener("click", async () => {
      const archived = entry.visibility_status === "archived";
      entry.visibility_status = archived ? "visible" : "archived";
      entry.archived_at = archived ? "" : new Date().toISOString();
      entry.updated_at = new Date().toISOString();
      await saveData();
      showToast(archived ? "Záznam obnoven." : "Záznam archivován.");
      render();
    });
  }

  const resolvedButton = app.querySelector("[data-toggle-resolved]");
  if (resolvedButton) {
    resolvedButton.addEventListener("click", async () => {
      entry.resolved_status = entry.resolved_status === "resolved" ? "open" : "resolved";
      entry.updated_at = new Date().toISOString();
      await saveData();
      showToast(entry.resolved_status === "resolved" ? "Problém označen jako vyřešený." : "Problém je znovu nevyřešený.");
      render();
    });
  }

  const addSolutionButton = app.querySelector("[data-add-solution-for-entry]");
  if (addSolutionButton) {
    addSolutionButton.addEventListener("click", () => {
      openCapture({
        entry_type: "solution",
        technical_list_id: entry.technical_list_id,
        product_id: entry.product_id,
        section_id: entry.section_id,
        machine_id: entry.machine_id,
        program_code: entry.program_code,
        related_entry_id: entry.entry_id,
      });
    });
  }

  app.querySelectorAll("[data-detail-tag]").forEach((button) => {
    button.addEventListener("click", async () => {
      const tagId = button.dataset.detailTag;
      const existing = db.knowledge_entry_tags.find((item) => item.entry_id === entry.entry_id && item.tag_id === tagId);
      if (existing) {
        db.knowledge_entry_tags = db.knowledge_entry_tags.filter(
          (item) => !(item.entry_id === entry.entry_id && item.tag_id === tagId),
        );
      } else {
        db.knowledge_entry_tags.push({ entry_id: entry.entry_id, tag_id: tagId });
      }
      await saveData();
      render();
    });
  });
}

function filterEntries() {
  const needle = normalize(searchState.query);
  const matching = getVisibleEntries().filter((entry) => {
    if (searchState.type && entry.entry_type !== searchState.type) return false;
    if (searchState.sectionId && entry.section_id !== searchState.sectionId) return false;
    if (searchState.tlId && entry.technical_list_id !== searchState.tlId) return false;
    if (searchState.machineId && entry.machine_id !== searchState.machineId) return false;
    if (searchState.priority && entry.priority !== searchState.priority) return false;
    if (searchState.tagId && !getEntryTags(entry.entry_id).some((tag) => tag.tag_id === searchState.tagId)) return false;
    if (searchState.withPhoto && !getEntryPhotos(entry.entry_id).length) return false;
    if (searchState.onlyCritical && entry.priority !== "critical") return false;
    if (searchState.onlyUnresolved && !(entry.entry_type === "problem" && entry.resolved_status !== "resolved")) return false;
    if (searchState.onlyVerifiedSolutions && !(entry.entry_type === "solution" && entry.solution_verified)) return false;
    if (searchState.dateFrom && new Date(entry.created_at) < startOfDay(searchState.dateFrom)) return false;
    if (searchState.dateTo && new Date(entry.created_at) > endOfDay(searchState.dateTo)) return false;
    if (!needle) return true;

    const tl = getTl(entry.technical_list_id);
    const section = getSection(entry.section_id);
    const machine = getMachine(entry.machine_id);
    const tags = getEntryTags(entry.entry_id);
    const haystack = normalize(
      [
        entry.text_content,
        entry.program_code,
        entry.parameter_name,
        entry.parameter_value,
        priorityLabel(entry.priority),
        tl?.tl_number,
        tl?.product_name_snapshot,
        tl?.program_code,
        section?.name,
        machine?.machine_code,
        machine?.machine_name,
        ...tags.map((tag) => tag.tag_name),
      ].join(" "),
    );
    return haystack.includes(needle);
  });
  return sortSearchEntries(matching);
}

function sortSearchEntries(entries) {
  const priorityRank = { critical: 0, important: 1, normal: 2 };
  return [...entries].sort((a, b) => {
    if (searchState.sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    if (searchState.sortBy === "priority") {
      const rankDelta = (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9);
      return rankDelta || new Date(b.created_at) - new Date(a.created_at);
    }
    if (searchState.sortBy === "tl") {
      const tlA = getTl(a.technical_list_id)?.tl_number || "";
      const tlB = getTl(b.technical_list_id)?.tl_number || "";
      return tlA.localeCompare(tlB, "cs") || new Date(b.created_at) - new Date(a.created_at);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

function getActiveFilterCount() {
  return [
    searchState.type,
    searchState.sectionId,
    searchState.tlId,
    searchState.machineId,
    searchState.priority,
    searchState.tagId,
    searchState.withPhoto,
    searchState.dateFrom,
    searchState.dateTo,
    searchState.onlyCritical,
    searchState.onlyUnresolved,
    searchState.onlyVerifiedSolutions,
  ].filter(Boolean).length;
}

function countOpenProblems() {
  return getOpenProblems().length;
}

function getOpenProblems() {
  const priorityRank = { critical: 0, important: 1, normal: 2 };
  return getVisibleEntries()
    .filter((entry) => entry.entry_type === "problem" && entry.resolved_status !== "resolved")
    .sort(
      (a, b) =>
        (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9) ||
        new Date(b.created_at) - new Date(a.created_at),
    );
}

function countCriticalEntries() {
  return getVisibleEntries().filter((entry) => entry.priority === "critical").length;
}

function getVerifiedSolutionCount() {
  return getVisibleEntries().filter((entry) => entry.entry_type === "solution" && entry.solution_verified).length;
}

function dateInputDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function getTodayEntryCount() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return getVisibleEntries().filter((entry) => new Date(entry.created_at) >= start).length;
}

function applySmartFilter(kind) {
  searchState = createEmptySearchState();
  if (kind === "unresolved") searchState.onlyUnresolved = true;
  if (kind === "critical") searchState.onlyCritical = true;
  if (kind === "photo") searchState.withPhoto = true;
  if (kind === "week") searchState.dateFrom = dateInputDaysAgo(7);
  if (kind === "verified") searchState.onlyVerifiedSolutions = true;
  navigate("search");
}

function getSearchSuggestions(query) {
  const needle = normalize(query);
  if (!needle || needle.length < 2) return [];
  const values = [
    ...db.technical_lists.flatMap((tl) => [`TL ${tl.tl_number}`, tl.product_name_snapshot, tl.program_code || ""]),
    ...db.tags.map((tag) => tag.tag_name),
    ...db.production_sections.map((section) => section.name),
    ...db.machines.flatMap((machine) => [machine.machine_code, machine.machine_name]),
  ]
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index);
  return values.filter((value) => normalize(value).includes(needle));
}

function startOfDay(dateValue) {
  return new Date(`${dateValue}T00:00:00`);
}

function endOfDay(dateValue) {
  return new Date(`${dateValue}T23:59:59.999`);
}

function getVisibleEntries() {
  return db.knowledge_entries
    .filter((entry) => entry.visibility_status === "visible")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getEntry(id) {
  return db.knowledge_entries.find((entry) => entry.entry_id === id);
}

function getTl(id) {
  return db.technical_lists.find((tl) => tl.technical_list_id === id);
}

function getFavoriteTl() {
  return db.technical_lists.filter((tl) => tl.active && tl.is_favorite);
}

function getSection(id) {
  return db.production_sections.find((section) => section.section_id === id);
}

function getMachine(id) {
  return db.machines.find((machine) => machine.machine_id === id);
}

function getMachinesForSection(sectionId) {
  return db.machines.filter((machine) => machine.active && (!sectionId || machine.section_id === sectionId));
}

function getEntryType(id) {
  return entryTypes.find((type) => type.id === id) || entryTypes[0];
}

function getEntryTags(entryId) {
  const tagIds = db.knowledge_entry_tags.filter((item) => item.entry_id === entryId).map((item) => item.tag_id);
  return db.tags.filter((tag) => tagIds.includes(tag.tag_id));
}

function getEntryPhotos(entryId) {
  const photoIds = db.knowledge_entry_photos.filter((item) => item.entry_id === entryId).map((item) => item.photo_id);
  return db.photos.filter((photo) => photoIds.includes(photo.photo_id));
}

function getFeedbackCounts(entryId) {
  const feedback = db.entry_feedback.filter((item) => item.entry_id === entryId);
  return {
    helpful: feedback.filter((item) => item.feedback_type === "helpful").length,
    notHelpful: feedback.filter((item) => item.feedback_type === "not_helpful").length,
  };
}

function getPhotosForEntries(entries) {
  const entryIds = new Set(entries.map((entry) => entry.entry_id));
  const photoIds = db.knowledge_entry_photos.filter((item) => entryIds.has(item.entry_id)).map((item) => item.photo_id);
  return db.photos.filter((photo) => photoIds.includes(photo.photo_id));
}

function getPopularTags(entries) {
  const entryIds = new Set(entries.map((entry) => entry.entry_id));
  const counts = new Map();
  db.knowledge_entry_tags
    .filter((item) => entryIds.has(item.entry_id))
    .forEach((item) => counts.set(item.tag_id, (counts.get(item.tag_id) || 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tagId]) => db.tags.find((tag) => tag.tag_id === tagId))
    .filter(Boolean);
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key];
    acc[value] = acc[value] || [];
    acc[value].push(item);
    return acc;
  }, {});
}

function entryBadgeClass(entry) {
  if (entry.priority === "critical") return "badge critical";
  if (entry.priority === "important") return "badge important";
  if (entry.entry_type === "solution") return "badge solution";
  if (entry.entry_type === "machine_setting" || entry.entry_type === "changeover_parameter") return "badge setting";
  return "badge";
}

function priorityLabel(value) {
  const item = priorities.find((priority) => priority.id === value);
  return item?.label || "Běžné";
}

function entryStatusLabel(entry) {
  if (entry.visibility_status === "archived") return "Archiv";
  if (entry.entry_type === "problem" && entry.resolved_status === "resolved") return "Vyřešeno";
  if (entry.entry_type === "problem") return "Nevyřešeno";
  return "Aktivní";
}

function flowStatusLabel(value) {
  const labels = {
    not_used: "Nepoužito",
    candidate: "Kandidát",
    converted_to_flow: "Ve FLOW",
  };
  return labels[value] || "Nepoužito";
}

function photoTypeForEntry(type) {
  const map = {
    problem: "problem",
    solution: "solution",
    machine_setting: "setting",
    changeover_parameter: "setting",
    product_note: "product",
  };
  return map[type] || "general";
}

async function readSelectedImages(files) {
  const selected = files.slice(0, MAX_PHOTOS_PER_SELECTION);
  if (files.length > MAX_PHOTOS_PER_SELECTION) showToast(`Bylo vybráno prvních ${MAX_PHOTOS_PER_SELECTION} fotek.`);
  const result = [];
  for (const file of selected) {
    try {
      result.push(await readImageAsCompressedDataUrl(file));
    } catch (error) {
      console.warn("FLOW Capture image skipped", error);
      showToast(`Fotka ${file.name || "bez názvu"} nebyla přidána.`);
    }
  }
  return result;
}

function readImageAsCompressedDataUrl(file) {
  if (!file.type.startsWith("image/")) return Promise.reject(new Error("Unsupported image type"));
  if (file.size > MAX_IMAGE_FILE_BYTES) return Promise.reject(new Error("Image exceeds size limit"));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 1200;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("Hlasové zadávání není v tomto prohlížeči dostupné.");
    return;
  }
  updateDraftFromForm();
  const recognition = new SpeechRecognition();
  recognition.lang = "cs-CZ";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => showToast("Poslouchám...");
  recognition.onerror = () => showToast("Hlasové zadávání se nepodařilo spustit.");
  recognition.onresult = (event) => {
    const text = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join(" ")
      .trim();
    if (text) {
      captureDraft.text_content = [captureDraft.text_content.trim(), text].filter(Boolean).join(" ");
      render();
      showToast("Text doplněn z hlasu.");
    }
  };
  recognition.start();
}

function getTechnicalParameters(technicalListId) {
  return db.technical_parameters.find((params) => params.technical_list_id === technicalListId);
}

function getTlParameterHistory(technicalListId) {
  return db.parameter_history
    .filter((item) => item.technical_list_id === technicalListId)
    .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at));
}

function getTlChangeovers(technicalListId) {
  return db.changeovers
    .filter(
      (changeover) =>
        changeover.from_technical_list_id === technicalListId || changeover.to_technical_list_id === technicalListId,
    )
    .sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
}

function getTlStats(tl, entries) {
  const problemEntries = entries.filter((entry) => entry.entry_type === "problem");
  const solutionEntries = entries.filter((entry) => entry.entry_type === "solution");
  const topTag = countTags(entries)[0]?.label || "";
  const topMachine = countMachines(entries)[0]?.label || "";
  return {
    openProblems: problemEntries.filter((entry) => entry.resolved_status !== "resolved").length,
    verifiedSolutions: solutionEntries.filter((entry) => entry.solution_verified).length,
    topTag,
    topMachine,
  };
}

function getRelatedEntriesForTl(tl, directEntries) {
  const directIds = new Set(directEntries.map((entry) => entry.entry_id));
  const words = normalize(`${tl.tl_number} ${tl.product_name_snapshot} ${tl.program_code}`).split(/\s+/).filter((word) => word.length > 2);
  return getVisibleEntries().filter((entry) => {
    if (directIds.has(entry.entry_id)) return false;
    const haystack = normalize(`${entry.text_content} ${entry.program_code} ${getEntryTags(entry.entry_id).map((tag) => tag.tag_name).join(" ")}`);
    return words.some((word) => haystack.includes(word));
  });
}

function formatNumber(value, unit = "") {
  if (value === "" || value === null || value === undefined) return "";
  return `${value}${unit ? ` ${unit}` : ""}`;
}

function countTags(entries) {
  const counts = new Map();
  entries.forEach((entry) => {
    getEntryTags(entry.entry_id).forEach((tag) => {
      counts.set(tag.tag_name, (counts.get(tag.tag_name) || 0) + 1);
    });
  });
  return toCountList(counts);
}

function countProblemTags(entries) {
  const counts = new Map();
  entries.forEach((entry) => {
    const tags = getEntryTags(entry.entry_id);
    if (tags.length) {
      tags.forEach((tag) => counts.set(tag.tag_name, (counts.get(tag.tag_name) || 0) + 1));
    } else {
      const label = entry.text_content.split(/\s+/).slice(0, 5).join(" ") || "Bez popisu";
      counts.set(label, (counts.get(label) || 0) + 1);
    }
  });
  return toCountList(counts);
}

function countProblematicTl(entries) {
  const counts = new Map();
  entries.forEach((entry) => {
    const tl = getTl(entry.technical_list_id);
    const label = tl ? `TL ${tl.tl_number} · ${tl.product_name_snapshot}` : "Bez TL";
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return toCountList(counts);
}

function countMachines(entries) {
  const counts = new Map();
  entries.forEach((entry) => {
    const machine = getMachine(entry.machine_id);
    const label = machine ? `${machine.machine_code} · ${machine.machine_name}` : "Bez stroje";
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return toCountList(counts);
}

function countSections(entries) {
  const counts = new Map();
  entries.forEach((entry) => {
    const section = getSection(entry.section_id);
    const label = section?.name || "Bez úseku";
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return toCountList(counts);
}

function countSolutions(entries) {
  const counts = new Map();
  entries.forEach((entry) => {
    const label = entry.parameter_name
      ? `${entry.parameter_name}: ${entry.parameter_value || ""}`.trim()
      : entry.text_content.slice(0, 70) || "Bez popisu";
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return toCountList(counts);
}

function toCountList(counts) {
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "cs"));
}

function estimateDataUrlSize(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.round((base64.length * 3) / 4);
}

function exportRows(entries = getVisibleEntries()) {
  return entries.map((entry) => {
    const tl = getTl(entry.technical_list_id);
    const section = getSection(entry.section_id);
    const machine = getMachine(entry.machine_id);
    const tags = getEntryTags(entry.entry_id).map((tag) => tag.tag_name).join(", ");
    const photoCount = getEntryPhotos(entry.entry_id).length;
    return {
      ID: entry.entry_id,
      Datum: entry.created_at,
      Typ: getEntryType(entry.entry_type).label,
      Priorita: priorityLabel(entry.priority),
      Text: entry.text_content,
      TL: tl?.tl_number || "",
      Výrobek: tl?.product_name_snapshot || "",
      Program: entry.program_code || tl?.program_code || "",
      Úsek: section?.name || "",
      Stroj: machine ? `${machine.machine_code} ${machine.machine_name}` : "",
      Parametr: entry.parameter_name || "",
      Hodnota: [entry.parameter_value, entry.unit].filter(Boolean).join(" "),
      Tagy: tags,
      Fotky: photoCount,
      Ověřené_řešení: entry.solution_verified ? "ano" : "ne",
      Stav: entryStatusLabel(entry),
      Archivováno: entry.archived_at || "",
      FLOW: flowStatusLabel(entry.flow_conversion_status),
    };
  });
}

function exportCsv(entries = getVisibleEntries()) {
  const rows = exportRows(entries);
  downloadCsvRows(rows, `flow-capture-${dateStamp()}.csv`);
  showToast("CSV export připraven.");
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^\s*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function exportXlsx(entries = getVisibleEntries()) {
  const rows = exportRows(entries);
  downloadXlsxRows(rows, `flow-capture-${dateStamp()}.xlsx`);
  showToast("XLSX export připraven.");
}

function backupData() {
  const backup = {
    app: "FLOW Capture",
    schema_version: db.schema_version,
    exported_at: new Date().toISOString(),
    data: db,
  };
  downloadBlob(`flow-capture-zaloha-${dateStamp()}.json`, new Blob([JSON.stringify(backup)], { type: "application/json" }));
  showToast("Záloha připravena ke stažení.");
}

async function restoreData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > MAX_BACKUP_BYTES) throw new Error("Backup exceeds size limit");
    const raw = JSON.parse(await file.text());
    const incoming = raw?.data || raw;
    if (!isValidSnapshotData(incoming)) {
      throw new Error("Neplatný soubor zálohy.");
    }
    if (!window.confirm("Obnovit zálohu? Současná data v tomto zařízení budou nahrazena.")) {
      event.target.value = "";
      return;
    }
    db = migrateData(sanitizeImportedData(incoming));
    await saveData(db);
    captureDraft = createEmptyDraft();
    searchState = createEmptySearchState();
    showToast("Záloha byla obnovena.");
    navigate("home");
  } catch (error) {
    console.warn("FLOW Capture restore failed", error);
    showToast("Soubor se nepodařilo obnovit. Vyber zálohu FLOW Capture.");
  } finally {
    event.target.value = "";
  }
}

function exportTlCsv(tlId) {
  const tl = getTl(tlId);
  if (!tl) return;
  downloadCsvRows(exportTlRows(tlId), `flow-capture-TL-${tl.tl_number}-${dateStamp()}.csv`);
  showToast("CSV export TL připraven.");
}

function exportTlXlsx(tlId) {
  const tl = getTl(tlId);
  if (!tl) return;
  downloadXlsxRows(exportTlRows(tlId), `flow-capture-TL-${tl.tl_number}-${dateStamp()}.xlsx`);
  showToast("XLSX export TL připraven.");
}

function downloadCsvRows(rows, filename) {
  const headers = getExportHeaders(rows);
  const csv = [headers.join(";"), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(";"))].join("\r\n");
  downloadBlob(filename, new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
}

function downloadXlsxRows(rows, filename) {
  const headers = getExportHeaders(rows);
  const matrix = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))];
  const files = buildXlsxFiles(matrix);
  const blob = new Blob([zipFiles(files)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(filename, blob);
}

function getExportHeaders(rows) {
  const source = rows.length ? rows : exportRows(defaultData.knowledge_entries);
  return [...new Set(source.flatMap((row) => Object.keys(row)))];
}

function exportTlRows(tlId) {
  const tl = getTl(tlId);
  const params = getTechnicalParameters(tlId);
  const entries = db.knowledge_entries
    .filter((entry) => entry.technical_list_id === tlId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const changeovers = getTlChangeovers(tlId);
  const parameterHistory = getTlParameterHistory(tlId);
  const photos = getPhotosForEntries(entries);
  const stats = getTlStats(tl, entries.filter((entry) => entry.visibility_status === "visible"));
  const rows = [];

  if (params) {
    technicalParameterExportItems(params).forEach((item) => {
      rows.push(baseTlExportRow(tl, "Technické parametry", "", "Parametr", item.label, item.value, item.unit));
    });
  }

  parameterHistory.forEach((item) => {
    rows.push(baseTlExportRow(tl, "Historie parametrů", item.changed_at, "Parametr", item.parameter_name, item.parameter_value, item.unit, item.note));
  });

  entries.forEach((entry) => {
    const row = exportRows([entry])[0];
    rows.push({
      Sekce: entry.entry_type === "problem" ? "Historie problémů" : entry.entry_type === "solution" ? "Historie řešení" : "Související záznamy",
      ...row,
      Pomohlo: getFeedbackCounts(entry.entry_id).helpful,
      Nepomohlo: getFeedbackCounts(entry.entry_id).notHelpful,
      Foto: getEntryPhotos(entry.entry_id)
        .map((photo) => photo.file_url)
        .join(" | "),
    });
  });

  changeovers.forEach((changeover) => {
    const fromTl = getTl(changeover.from_technical_list_id);
    const toTl = getTl(changeover.to_technical_list_id);
    const machine = getMachine(changeover.machine_id);
    rows.push({
      Sekce: "Historie přehozů",
      Datum: changeover.started_at,
      Typ: "Přehoz",
      TL: tl?.tl_number || "",
      Výrobek: tl?.product_name_snapshot || "",
      Program: tl?.program_code || "",
      Stroj: machine ? `${machine.machine_code} ${machine.machine_name}` : "",
      Text: `${fromTl ? `TL ${fromTl.tl_number}` : "?"} -> ${toTl ? `TL ${toTl.tl_number}` : "?"}. ${changeover.note || ""}`,
      Hodnota: `${changeover.duration_minutes} min`,
      Stav: changeover.status,
    });
  });

  photos.forEach((photo) => {
    rows.push({
      Sekce: "Fotografie",
      Datum: photo.uploaded_at,
      Typ: photo.photo_type || "foto",
      TL: tl?.tl_number || "",
      Výrobek: tl?.product_name_snapshot || "",
      Program: tl?.program_code || "",
      Text: photo.caption || "",
      Foto: photo.file_url,
    });
  });

  rows.push(baseTlExportRow(tl, "Statistiky", "", "Nevyřešené problémy", "Nevyřešené problémy", stats.openProblems, ""));
  rows.push(baseTlExportRow(tl, "Statistiky", "", "Ověřená řešení", "Ověřená řešení", stats.verifiedSolutions, ""));
  rows.push(baseTlExportRow(tl, "Statistiky", "", "Nejčastější tag", "Nejčastější tag", stats.topTag, ""));
  rows.push(baseTlExportRow(tl, "Statistiky", "", "Nejčastější stroj", "Nejčastější stroj", stats.topMachine, ""));

  return rows;
}

function baseTlExportRow(tl, section, date, type, name, value, unit = "", text = "") {
  return {
    Sekce: section,
    Datum: date,
    Typ: type,
    TL: tl?.tl_number || "",
    Výrobek: tl?.product_name_snapshot || "",
    Program: tl?.program_code || "",
    Parametr: name,
    Hodnota: [value, unit].filter(Boolean).join(" "),
    Text: text,
  };
}

function technicalParameterExportItems(params) {
  return [
    { label: "Typ", value: params.side_type, unit: "" },
    { label: "Šířka", value: params.width_mm, unit: "mm" },
    { label: "Výška", value: params.height_mm, unit: "mm" },
    { label: "Obvod", value: params.perimeter_mm, unit: "mm" },
    { label: "Kotouč", value: params.wheel, unit: "" },
    { label: "Vrták", value: params.drill, unit: "" },
    { label: "Otáčky", value: params.drill_rpm || "", unit: "" },
    { label: "Posuv", value: params.drill_feed || "", unit: "" },
    { label: "Rameno", value: params.drill_arm_count || "", unit: "" },
    { label: "Řez tlak", value: params.cutting_pressure, unit: "" },
    { label: "Vylam tlak", value: params.breaking_pressure, unit: "" },
    { label: "Řez rychlost", value: params.cutting_speed, unit: "" },
  ];
}

function buildXlsxFiles(matrix) {
  const sheetRows = matrix
    .map((row, rowIndex) => {
      const cells = row
        .map((value, colIndex) => {
          const ref = `${columnName(colIndex + 1)}${rowIndex + 1}`;
          return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(String(value ?? ""))}</t></is></c>`;
        })
        .join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");
  const lastCol = columnName(matrix[0].length);
  const lastRow = Math.max(1, matrix.length);
  return [
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Zaznamy" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    {
      name: "xl/styles.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`,
    },
    {
      name: "xl/worksheets/sheet1.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${lastCol}${lastRow}"/><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetData>${sheetRows}</sheetData><autoFilter ref="A1:${lastCol}${lastRow}"/></worksheet>`,
    },
  ];
}

function zipFiles(files) {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const content = encoder.encode(file.content);
    const crc = crc32(content);
    const local = new Uint8Array(30 + name.length + content.length);
    const view = new DataView(local.buffer);
    writeZipHeader(view, 0x04034b50, 20, 0, 0, crc, content.length, content.length, name.length, 0);
    local.set(name, 30);
    local.set(content, 30 + name.length);
    chunks.push(local);

    const directory = new Uint8Array(46 + name.length);
    const dirView = new DataView(directory.buffer);
    writeCentralHeader(dirView, crc, content.length, content.length, name.length, offset);
    directory.set(name, 46);
    central.push(directory);
    offset += local.length;
  });
  const centralOffset = offset;
  central.forEach((part) => {
    chunks.push(part);
    offset += part.length;
  });
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, offset - centralOffset, true);
  endView.setUint32(16, centralOffset, true);
  chunks.push(end);
  return concatUint8(chunks);
}

function writeZipHeader(view, signature, version, flags, method, crc, compressed, uncompressed, nameLength, extraLength) {
  view.setUint32(0, signature, true);
  view.setUint16(4, version, true);
  view.setUint16(6, flags, true);
  view.setUint16(8, method, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, compressed, true);
  view.setUint32(22, uncompressed, true);
  view.setUint16(26, nameLength, true);
  view.setUint16(28, extraLength, true);
}

function writeCentralHeader(view, crc, compressed, uncompressed, nameLength, localOffset) {
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, compressed, true);
  view.setUint32(24, uncompressed, true);
  view.setUint16(28, nameLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, localOffset, true);
}

function crc32(bytes) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function concatUint8(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function columnName(index) {
  let name = "";
  while (index > 0) {
    const mod = (index - 1) % 26;
    name = String.fromCharCode(65 + mod) + name;
    index = Math.floor((index - mod) / 26);
  }
  return name;
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalize(value) {
  return String(value || "")
    .toLocaleLowerCase("cs-CZ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/\n/g, " ");
}

function safeImageUrl(value) {
  const url = String(value || "");
  return /^data:image\/(?:jpeg|jpg|png|webp);base64,[a-z0-9+/=]+$/i.test(url) ? escapeAttr(url) : "";
}

function xmlEscape(value) {
  return escapeHtml(value).replace(/\r?\n/g, "&#10;");
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toastEl.classList.remove("is-visible"), 2200);
}
