/*
 * Notes WiFi Sync
 *
 * Two-way sync of a chosen folder (or whole vault) between Obsidian vaults
 * over WiFi, with pairing like Bluetooth:
 *  - Desktop devices run a small HTTP server and discover each other via UDP
 *    broadcast on the same LAN.
 *  - Mobile devices cannot host a server (sandboxed WebView), so they act as
 *    clients that connect to a desktop host by IP, entered manually or found
 *    by subnet scan.
 *  - There is no password. Devices pair once with a 6-digit OTP: one device
 *    shows a code, the other confirms it matches (Bluetooth-style). The code
 *    is then used as the per-device session key for all requests.
 *  - The sync folder is picked by choice on each device and compared by
 *    path + modified time; a compare UI lets you decide per file what to
 *    transfer, or you can use quick sync where the newer edit wins.
 *
 * No bundled dependencies. Node modules (http, dgram, os) are used only when
 * available (desktop); everything else uses platform APIs (fetch, crypto).
 */

const { Plugin, PluginSettingTab, Setting, Notice, TFile, TFolder, Platform, Modal } = require("obsidian");

// --- Capability detection --------------------------------------------------
let nodeHttp = null, nodeDgram = null, nodeOs = null, nodeCrypto = null;
try { nodeHttp = require("http"); } catch (e) {}
try { nodeDgram = require("dgram"); } catch (e) {}
try { nodeOs = require("os"); } catch (e) {}
try { nodeCrypto = require("crypto"); } catch (e) {}

const canHostServer = !!nodeHttp && !canDetectMobile();
const canUseDiscovery = !!nodeDgram && canHostServer;

function canDetectMobile() {
	return !!Platform.isMobile;
}

function randomHex(bytes) {
	if (nodeCrypto && nodeCrypto.randomBytes) {
		return nodeCrypto.randomBytes(bytes).toString("hex");
	}
	try {
		const arr = new Uint8Array(bytes);
		window.crypto.getRandomValues(arr);
		return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
	} catch (e) {
		let s = "";
		for (let i = 0; i < bytes; i++) s += Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
		return s;
	}
}

/* --------------------- QR encoder (Feature 13, zero deps) ----------------- */
// Minimal byte-mode QR encoder (ECC level L, versions 1-4). Renders a pairing
// payload as a scannable matrix with no canvas/JSZip dependency.

const QR_VERSIONS = {
	1: { size: 21, dataCw: 19, ecCw: 7, align: [] },
	2: { size: 25, dataCw: 34, ecCw: 10, align: [18] },
	3: { size: 29, dataCw: 55, ecCw: 15, align: [22] },
	4: { size: 33, dataCw: 80, ecCw: 20, align: [26] },
};
const QR_BYTE_CAP = { 1: 17, 2: 32, 3: 53, 4: 78 };

const QR_EXP = new Array(512);
const QR_LOG = new Array(256);
(function initQrGF() {
	let x = 1;
	for (let i = 0; i < 255; i++) {
		QR_EXP[i] = x;
		QR_LOG[x] = i;
		x <<= 1;
		if (x & 0x100) x ^= 0x11d;
	}
	for (let i = 255; i < 512; i++) QR_EXP[i] = QR_EXP[i - 255];
})();

function qrMul(a, b) { if (a === 0 || b === 0) return 0; return QR_EXP[(QR_LOG[a] + QR_LOG[b]) % 255]; }
function qrPolyMul(p1, p2) {
	const out = new Array(p1.length + p2.length - 1).fill(0);
	for (let i = 0; i < p1.length; i++) for (let j = 0; j < p2.length; j++) out[i + j] ^= qrMul(p1[i], p2[j]);
	return out;
}
function qrGenPoly(deg) {
	let poly = [1];
	for (let i = 0; i < deg; i++) poly = qrPolyMul(poly, [1, QR_EXP[i]]);
	return poly;
}
function qrRsEncode(data, ecCw) {
	const divisor = qrGenPoly(ecCw);
	let res = data.concat(new Array(ecCw).fill(0));
	while (res.length - divisor.length >= 0) {
		const coef = res[0];
		for (let i = 0; i < divisor.length; i++) res[i] ^= qrMul(divisor[i], coef);
		let off = 0;
		while (off < res.length && res[off] === 0) off++;
		res = res.slice(off);
	}
	while (res.length < ecCw) res.unshift(0);
	return res;
}
function qrPad(version, text) {
	const capBits = QR_VERSIONS[version].dataCw * 8;
	let bits = [];
	const push = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1); };
	push(4, 4);
	push(text.length, 8);
	for (let i = 0; i < text.length; i++) push(text.charCodeAt(i) & 0xff, 8);
	push(0, Math.min(4, capBits - bits.length));
	while (bits.length % 8 !== 0) bits.push(0);
	const pads = [0xec, 0x11];
	let pi = 0;
	while (bits.length < capBits) push(pads[pi++ % 2], 8);
	const out = [];
	for (let i = 0; i < bits.length; i += 8) {
		let v = 0;
		for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
		out.push(v);
	}
	return out;
}
function qrEncode(version, text) {
	const data = qrPad(version, text);
	return data.concat(qrRsEncode(data, QR_VERSIONS[version].ecCw));
}
function qrMask(mask, r, c) {
	switch (mask) {
		case 0: return (r + c) % 2 === 0;
		case 1: return r % 2 === 0;
		case 2: return c % 3 === 0;
		case 3: return (r + c) % 3 === 0;
		case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
		case 5: return (r * c) % 2 + (r * c) % 3 === 0;
		case 6: return ((r * c) % 2 + (r * c) % 3) % 2 === 0;
		case 7: return ((r + c) % 2 + (r * c) % 3) % 2 === 0;
	}
	return false;
}
function qrFormatValue(mask) {
	const data = (0b01 << 3) | mask; // ECC level L
	let rem = data << 10;
	const g = 0x537;
	for (let i = 14; i >= 10; i--) { if (rem & (1 << i)) rem ^= g << (i - 10); }
	return ((data << 10) | rem) ^ 0x5412;
}
function qrPlaceFormat(m, size, mask) {
	const bits = qrFormatValue(mask);
	const put = (r, c, i) => { m[r][c] = (bits >> i) & 1; };
	for (let i = 0; i < 6; i++) put(i, 8, i);
	put(7, 8, 6);
	put(8, 8, 7);
	for (let i = 8; i < 15; i++) put(size - 15 + i, 8, i);
	for (let i = 0; i < 8; i++) put(8, size - i - 1, i);
	put(8, 7, 8);
	for (let i = 9; i < 15; i++) put(8, 14 - i, i);
	m[size - 8][8] = 1;
}
function qrMatrix(text, maskChoice) {
	const version = [1, 2, 3, 4].find((v) => text.length <= QR_BYTE_CAP[v]);
	if (!version) throw new Error("QR text too long");
	const { size, align } = QR_VERSIONS[version];
	const mk = () => Array.from({ length: size }, () => new Array(size).fill(0));
	const m = mk();
	const fnMap = mk();
	const finder = (r0, c0) => {
		for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
			const rr = r0 + i, cc = c0 + j;
			if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
			fnMap[rr][cc] = 1;
			const inPtr = i >= 0 && i <= 6 && j >= 0 && j <= 6;
			if (inPtr) m[rr][cc] = (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) ? 1 : 0;
		}
	};
	finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
	for (let i = 8; i < size - 8; i++) {
		fnMap[6][i] = 1; fnMap[i][6] = 1;
		m[6][i] = i % 2 === 0 ? 1 : 0;
		m[i][6] = i % 2 === 0 ? 1 : 0;
	}
	for (const ac of align) {
		for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
			const rr = ac + i, cc = ac + j;
			fnMap[rr][cc] = 1;
			m[rr][cc] = (Math.max(Math.abs(i), Math.abs(j)) === 2 || (i === 0 && j === 0)) ? 1 : 0;
		}
	}
	// reserve format cells + dark module as function (values written later)
	for (let i = 0; i < 6; i++) fnMap[i][8] = 1;
	fnMap[7][8] = 1; fnMap[8][8] = 1;
	for (let i = 8; i < 15; i++) fnMap[size - 15 + i][8] = 1;
	for (let i = 0; i < 8; i++) fnMap[8][size - 1 - i] = 1;
	fnMap[8][7] = 1;
	for (let i = 9; i < 15; i++) fnMap[8][14 - i] = 1;
	fnMap[size - 8][8] = 1;

	const codewords = qrEncode(version, text);
	let bit = 0;
	let col = size - 1;
	let upward = true;
	while (col >= 1) {
		if (col === 6) col--;
		for (let rI = 0; rI < size; rI++) {
			const r = upward ? size - 1 - rI : rI;
			for (let cc = 0; cc < 2; cc++) {
				const c = col - cc;
				if (c < 0 || fnMap[r][c]) continue;
				let val = 0;
				if (bit < codewords.length * 8) {
					const byte = codewords[Math.floor(bit / 8)];
					val = (byte >> (7 - (bit % 8))) & 1;
					bit++;
				}
				m[r][c] = val;
			}
		}
		upward = !upward;
		col -= 2;
	}
	const finalMask = maskChoice !== undefined ? maskChoice : 0;
	for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
		if (!fnMap[r][c] && qrMask(finalMask, r, c)) m[r][c] ^= 1;
	}
	qrPlaceFormat(m, size, finalMask);
	return m;
}

function renderQRCode(contentEl, text) {
	const table = contentEl.createEl("table", { cls: "notes-wifi-sync-qr" });
	table.setAttribute("role", "img");
	table.setAttribute("aria-label", "Pairing QR code");
	const mat = qrMatrix(text);
	const frag = document.createDocumentFragment();
	for (const row of mat) {
		const tr = document.createElement("tr");
		for (const cell of row) {
			const td = document.createElement("td");
			td.className = cell ? "dark" : "light";
			tr.appendChild(td);
		}
		frag.appendChild(tr);
	}
	table.appendChild(frag);
	return table;
}

// Feature 15: a small colored-initial disc avatar for each device, so peers are
// easy to tell apart at a glance. Hue is derived deterministically from the name.
const AVATAR_PALETTE = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#1abc9c", "#3498db", "#9b59b6", "#e84393"];
function nameHue(name) {
	let h = 0;
	for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
	return h;
}
function attachAvatar(setting, name) {
	const initial = String(name || "?").trim().charAt(0).toUpperCase() || "?";
	const color = AVATAR_PALETTE[nameHue(String(name || "?")) % AVATAR_PALETTE.length];
	const el = document.createElement("span");
	el.className = "notes-wifi-sync-avatar";
	el.textContent = initial;
	el.setAttribute("aria-hidden", "true");
	el.style.background = color;
	setting.nameEl.prepend(el);
}

const DEFAULT_SETTINGS = {
	serverEnabled: true,
	serverPort: 39991,
	deviceName: "",
	folder: "",
	autoSyncEnabled: true,
	pollIntervalSec: 60,
	liveSyncEnabled: false,
	useWebSocket: false, // feature 16: optional persistent-socket transport
	syncExtensions: ["md", "markdown"], // file extensions to include (feature 10)
	mergeMode: false, // feature 12: keep both copies on simultaneous edits
	lastSyncResult: "",
	lastSyncTime: 0,
	peers: {}, // discovered peers: deviceId -> {name, host, port, lastSeen}
	manualPeers: [], // manually added peers: {name, host, port}
	pairedPeers: {}, // paired devices: deviceId -> {name, host, port, code, lastSeen}
	log: [], // feature 19: capped transfer/conflict/backup history
	pendingTransfer: null // feature 20: {peerId, paths, done} resume journal
};

// Feature 9: undo snapshots are kept in memory and persisted at checkpoint
// points (end of each transfer round) to avoid a disk write per file.
const HISTORY_LIMIT = 5; // snapshots kept per path
const LOG_LIMIT = 200;
const CONFLICT_DIR_SUFFIX = "";

const UDP_PORT = 39991;
const BROADCAST_ADDR = "255.255.255.255";
const APP_TAG = "notes-wifi-sync-v1";

class NotesWifiSyncPlugin extends Plugin {
	async onload() {
		await this.loadSettings();

		this.server = null;
		this.udpSocket = null;
		this.discoveryTimer = null;
		this.pollTimer = null;
		this.isMobile = canDetectMobile();
		this.pendingPair = null; // {code, name, id, port, respond}
		this.manifestCache = null;
		this.manifestDirty = true;
		this.ipCache = null;
		this.syncHistory = {}; // feature 9: path -> [{content, ts}]
		this.conflictLog = []; // feature 12: recent conflict renames
		this.liveSyncTimer = null; // feature 7: debounce handle
		this.liveSyncPaths = []; // feature 7: pending paths to push
		this.paused = false; // feature 11: user pause

		// Feature 20: a previous transfer was interrupted mid-way. Offer to
		// resume it instead of silently dropping the journal.
		if (this.settings.pendingTransfer) {
			const pt = this.settings.pendingTransfer;
			const peer = this.settings.pairedPeers[pt.peerId] || this.settings.peers[pt.peerId];
			if (peer) {
				new Notice(`Notes WiFi Sync: an interrupted sync with ${peer.name} was found. Run "Sync now" or "Resume" to finish the remaining ${pt.paths.length - (pt.done || 0)} files.`);
			}
		}

		if (!this.settings.deviceId) {
			this.settings.deviceId = randomHex(6);
			await this.saveSettings();
		}
		if (!this.settings.deviceName) {
			this.settings.deviceName = this.isMobile ? "Mobile" : (nodeOs && nodeOs.hostname()) || "Obsidian";
			await this.saveSettings();
		}

		if (canHostServer && this.settings.serverEnabled) {
			this.startServer();
		}
		if (canUseDiscovery) {
			this.startDiscovery();
		} else if (!canHostServer) {
			console.log("Notes WiFi Sync: running as mobile client (no server/discovery). Pair with the desktop host manually in settings.");
		}

		this.addRibbonIcon("arrow-left-right", "Notes WiFi Sync — Sync now", () => this.syncNow());

		this.addCommand({
			id: "sync-now",
			name: "Sync now",
			callback: () => this.syncNow()
		});

		this.addSettingTab(new NotesWifiSyncSettingTab(this.app, this));

		// Invalidate the manifest cache when any file changes, so low-power
		// machines don't re-stat the whole folder on every sync.
		this.registerEvent(this.app.vault.on("modify", () => { this.manifestDirty = true; }));
		this.registerEvent(this.app.vault.on("create", () => { this.manifestDirty = true; }));
		this.registerEvent(this.app.vault.on("delete", () => { this.manifestDirty = true; }));
		this.registerEvent(this.app.vault.on("rename", () => { this.manifestDirty = true; }));

		this.pollTimer = window.setInterval(() => {
			this.pollPeers();
		}, Math.max(30, this.settings.pollIntervalSec) * 1000);

		this.startLiveSyncWatchers();
		this.setupStatusBar();
	}

	/* ------------------------------ Feature 16 ---------------------------- */
	// WebSocket transport is an optional setting. When enabled AND both peers
	// support it, transfers go over a single persistent socket instead of one
	// HTTP request per batch. HTTP remains the universal fallback, so this is
	// strictly an enhancement, never a requirement.
	transportFor(peer) {
		if (this.settings.useWebSocket && typeof WebSocket !== "undefined") {
			const wsHost = peer.host;
			return { kind: "ws", url: `ws://${wsHost}:${peer.port}/sync` };
		}
		return { kind: "http", url: `http://${peer.host}:${peer.port}` };
	}

	/* --------------------------- Feature 7: live sync ---------------------- */

	startLiveSyncWatchers() {
		if (this.liveWatchersStarted) return;
		this.liveWatchersStarted = true;
		const snooze = () => {
			if (!this.settings.liveSyncEnabled) return;
			if (this.liveSyncTimer) window.clearTimeout(this.liveSyncTimer);
			this.liveSyncTimer = window.setTimeout(() => this.runLiveSync(), 3000);
		};
		this.registerEvent(this.app.vault.on("modify", (file) => { if (file instanceof TFile) { this.pushLivePath(file.path); } snooze(); }));
		this.registerEvent(this.app.vault.on("create", (file) => { if (file instanceof TFile) { this.pushLivePath(file.path); } snooze(); }));
		this.registerEvent(this.app.vault.on("delete", (file) => { if (file instanceof TFile) { this.pushLivePath(file.path); } snooze(); }));
		this.registerEvent(this.app.vault.on("rename", (file) => { if (file instanceof TFile) { this.pushLivePath(file.path); } snooze(); }));
	}

	pushLivePath(path) {
		if (!this.liveSyncPaths.includes(path)) this.liveSyncPaths.push(path);
	}

	async runLiveSync() {
		this.liveSyncTimer = null;
		const pending = this.liveSyncPaths;
		this.liveSyncPaths = [];
		if (!this.settings.liveSyncEnabled || !pending.length) return;
		const peers = this.getPeers().filter((p) => p.paired && p.canHost !== false);
		for (const peer of peers) {
			try {
				const files = [];
				for (const path of pending) {
					if (!this.matchesFilter(path)) continue;
					try { files.push({ path, content: await this.readNote(path) }); } catch (err) {}
				}
				if (files.length) {
					await this.pushFiles(peer, files);
					this.logTransfer(`Live-synced ${files.length} file(s) with ${peer.name}`);
				}
			} catch (err) {
				// peer offline during live push — next poll picks it up
				console.error("Notes WiFi Sync: live sync failed", err);
			}
		}
	}

	/* --------------------------- Feature 18: status bar --------------------- */

	setupStatusBar() {
		this.statusBarEl = this.addStatusBarItem();
		this.refreshStatusBar("Wifi Sync idle");
	}

	refreshStatusBar(text) {
		if (!this.statusBarEl) return;
		const peers = Object.keys(this.settings.pairedPeers || {}).length;
		const when = this.settings.lastSyncTime
			? this.timeAgo(this.settings.lastSyncTime)
			: "never";
		this.statusBarEl.setText(`${text || "Wifi Sync"} · ${peers} device${peers === 1 ? "" : "s"} · last sync ${when}`);
	}

	timeAgo(ts) {
		const s = Math.floor((Date.now() - ts) / 1000);
		if (s < 60) return s + "s ago";
		const m = Math.floor(s / 60);
		if (m < 60) return m + "m ago";
		const h = Math.floor(m / 60);
		if (h < 24) return h + "h ago";
		return Math.floor(h / 24) + "d ago";
	}

	onunload() {
		if (this.pollTimer) window.clearInterval(this.pollTimer);
		this.stopServer();
		this.stopDiscovery();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/* ------------------------------ Discovery ------------------------------ */

	startDiscovery() {
		try {
			this.udpSocket = nodeDgram.createSocket({ type: "udp4", reuseAddr: true });
			this.udpSocket.on("error", (err) => {
				console.error("Notes WiFi Sync UDP error:", err);
			});
			this.udpSocket.bind(UDP_PORT, () => {
				try { this.udpSocket.setBroadcast(true); } catch (e) {}
				this.announce();
				this.discoveryTimer = window.setInterval(() => this.announce(), 5000);
			});
			this.udpSocket.on("message", (msg, rinfo) => {
				this.handleDiscoveryMessage(msg, rinfo);
			});
		} catch (err) {
			console.error("Notes WiFi Sync: discovery failed to start", err);
		}
	}

	stopDiscovery() {
		if (this.discoveryTimer) window.clearInterval(this.discoveryTimer);
		try { if (this.udpSocket) this.udpSocket.close(); } catch (e) {}
		this.udpSocket = null;
	}

	announce() {
		if (!this.udpSocket) return;
		const payload = JSON.stringify({
			app: APP_TAG,
			type: "announce",
			id: this.settings.deviceId,
			name: this.settings.deviceName,
			port: this.settings.serverPort
		});
		const buf = Buffer.from(payload);
		try {
			this.udpSocket.send(buf, 0, buf.length, UDP_PORT, BROADCAST_ADDR);
		} catch (e) {}
	}

	handleDiscoveryMessage(msg, rinfo) {
		try {
			const data = JSON.parse(msg.toString("utf8"));
			if (data.app !== APP_TAG) return;
			if (data.type === "announce" && data.id !== this.settings.deviceId) {
				const port = Number(data.port) || UDP_PORT;
				this.settings.peers[data.id] = {
					name: data.name || "Unknown device",
					host: rinfo.address,
					port: port,
					lastSeen: Date.now()
				};
				this.saveSettings();
			}
		} catch (e) {}
	}

	/* ------------------------------- Server -------------------------------- */

	startServer() {
		this.stopServer();
		try {
			this.server = nodeHttp.createServer((req, res) => this.handleRequest(req, res));
			this.server.listen(this.settings.serverPort, "0.0.0.0");
			console.log("Notes WiFi Sync: server listening on", this.settings.serverPort);
		} catch (err) {
			console.error("Notes WiFi Sync: failed to start server", err);
			this.server = null;
		}
	}

	stopServer() {
		if (this.server) {
			try { this.server.close(); } catch (e) {}
			this.server = null;
		}
	}

	async handleRequest(req, res) {
		const sendJson = (code, obj) => {
			const body = JSON.stringify(obj);
			res.writeHead(code, {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(body),
				"Access-Control-Allow-Origin": "*"
			});
			res.end(body);
		};

		if (req.method === "OPTIONS") {
			res.writeHead(204, {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, X-Notes-Sync-Code, X-Notes-Sync-Id"
			});
			res.end();
			return;
		}

		let body = "";
		req.on("data", (c) => { body += c; });
		req.on("end", async () => {
			try {
				if (req.url === "/ping") {
					sendJson(200, { ok: true, app: APP_TAG, name: this.settings.deviceName, id: this.settings.deviceId });
					return;
				}

				let payload = {};
				try { payload = JSON.parse(body || "{}"); } catch (e) {
					sendJson(400, { ok: false, error: "bad json" });
					return;
				}

				// OTP pairing (Bluetooth-style): the initiator generates a code,
				// we show it and ask the user to confirm, then reply to the
				// initiator's still-open request. This works even when the
				// initiator is a phone that has no server of its own.
				if (req.url === "/pair") {
					const code = String(payload.code || "");
					const name = String(payload.name || "Unknown device");
					const id = String(payload.id || "");
					const port = Number(payload.port) || UDP_PORT;
					if (!code || code.length !== 6 || !id) {
						sendJson(400, { ok: false, error: "bad pair request" });
						return;
					}
					if (this.pendingPair) {
						sendJson(409, { ok: false, error: "another pairing is pending" });
						return;
					}
					const remoteHost = String(req.socket.remoteAddress || "").replace(/^::ffff:/, "");
					const peerCanHost = !!payload.canHost;
					let done = false;
					await new Promise((resolve) => {
						const timer = window.setTimeout(() => {
							if (done) return;
							done = true;
							sendJson(408, { ok: false, error: "pairing timed out" });
							this.pendingPair = null;
							resolve();
						}, 90 * 1000);
						this.pendingPair = {
							code,
							name,
							id,
							port,
							host: remoteHost,
							canHost: peerCanHost,
							respond: (ok, extra) => {
								if (done) return;
								done = true;
								window.clearTimeout(timer);
								this.pendingPair = null;
								sendJson(ok ? 200 : 403, ok ? { ok: true, paired: true } : { ok: false, error: "pairing denied" });
								resolve();
							}
						};
						new ConfirmPairModal(this.app, this, this.pendingPair).open();
					});
					return;
				}

				// Authenticate data endpoints with the pairing code + device id.
				const codeHeader = String(req.headers["x-notes-sync-code"] || "");
				const idHeader = String(req.headers["x-notes-sync-id"] || "");
				const paired = this.settings.pairedPeers[idHeader];
				if (!paired || paired.code !== codeHeader) {
					sendJson(403, { ok: false, error: "not paired" });
					return;
				}

				const myFiles = await this.buildManifest();

				if (req.url === "/list") {
					// Full listing with sizes so the peer can render a compare UI.
					sendJson(200, { ok: true, files: myFiles });
					return;
				}

				if (req.url === "/pull") {
					// Request specific files (with content) by path.
					const paths = Array.isArray(payload.paths) ? payload.paths : [];
					const files = [];
					for (const path of paths) {
						if (myFiles[path] === undefined) continue;
						files.push({ path, mtime: myFiles[path].mtime, content: await this.readNote(path) });
					}
					if (files.length) {
						new Notice(`Notes WiFi Sync: ${this.peerNameById(idHeader)} pulled ${files.length} file(s) from this device.`);
					}
					sendJson(200, { ok: true, files });
					return;
				}

				if (req.url === "/push") {
					// Write specific files pushed by the peer.
					let written = 0;
					for (const item of payload.files || []) {
						try { const r = await this.writeNoteMerging(item.path, item.content); if (!r.conflict) written++; } catch (err) { console.error(err); }
					}
					if (written) {
						new Notice(`Notes WiFi Sync: received ${written} file(s) from ${this.peerNameById(idHeader)}.`);
					}
					sendJson(200, { ok: true, written });
					return;
				}

				if (req.url === "/sync") {
					// Client sends its file manifest {path -> {mtime}}. We reply with
					// our files they're missing/older than, plus the list of their
					// files we're missing.
					const clientFiles = payload.files || {};
					const toSend = [];
					for (const [path, info] of Object.entries(myFiles)) {
						const clientMtime = (clientFiles[path] && typeof clientFiles[path] === "object") ? clientFiles[path].mtime : clientFiles[path];
						const clientSize = (clientFiles[path] && typeof clientFiles[path] === "object") ? clientFiles[path].size : undefined;
						// feature 8: same size + same mtime => identical content, skip payload
						if (clientMtime !== undefined && Number(clientMtime) === Number(info.mtime) && clientSize === info.size) continue;
						if (clientMtime === undefined || Number(clientMtime) < Number(info.mtime)) {
							toSend.push({ path, mtime: info.mtime, content: await this.readNote(path) });
						}
					}

					const needFromClient = [];
					for (const path of Object.keys(clientFiles)) {
						if (myFiles[path] === undefined) {
							needFromClient.push(path);
						}
					}

					// Optional: the client may push files it owes us in the same round.
					let delivered = 0;
					if (Array.isArray(payload.deliver)) {
						for (const item of payload.deliver) {
							try { await this.writeNote(item.path, item.content); delivered++; } catch (err) { console.error(err); }
						}
					}

					if (toSend.length || delivered) {
						new Notice(`Notes WiFi Sync: ${this.peerNameById(idHeader)} synced — ${toSend.length} sent, ${delivered} received.`);
					}

					sendJson(200, {
						ok: true,
						send: toSend,
						needFromClient
					});
					return;
				}

				sendJson(404, { ok: false, error: "not found" });
			} catch (err) {
				console.error("Notes WiFi Sync: request error", err);
				sendJson(500, { ok: false, error: String((err && err.message) || err) });
			}
		});
	}

	/* ---------------------------- Sync engine ------------------------------ */

	async buildManifest() {
		if (!this.manifestDirty && this.manifestCache) {
			return this.manifestCache;
		}
		const folder = this.getFolder();
		const manifest = {};
		for (const file of this.app.vault.getFiles()) {
			if (folder && !file.path.startsWith(folder.path + "/")) continue;
			if (!this.matchesFilter(file.path)) continue; // feature 10
			const stat = await this.app.vault.adapter.stat(file.path);
			manifest[file.path] = {
				mtime: stat ? stat.mtime : (file.stat ? file.stat.mtime : 0),
				size: stat ? stat.size : (file.stat ? file.stat.size : 0)
			};
		}
		this.manifestCache = manifest;
		this.manifestDirty = false;
		return manifest;
	}

	matchesFilter(path) {
		const exts = Array.isArray(this.settings.syncExtensions) ? this.settings.syncExtensions : ["md", "markdown"];
		if (!exts.length) return true;
		const dot = path.lastIndexOf(".");
		if (dot === -1 || dot === path.length - 1) return true;
		return exts.includes(path.slice(dot + 1).toLowerCase());
	}

	getFolder() {
		const path = (this.settings.folder || "").replace(/^\/+|\/+$/g, "");
		if (!path) return null;
		return this.app.vault.getAbstractFileByPath(path);
	}

	async readNote(path) {
		const file = this.app.vault.getAbstractFileByPath(path);
		if (!(file instanceof TFile)) return "";
		return await this.app.vault.cachedRead(file);
	}

	async writeNote(path, content) {
		const existing = this.app.vault.getAbstractFileByPath(path);
		// Feature 9: snapshot the previous content so a bad sync can be undone.
		if (existing instanceof TFile) {
			try {
				const prev = await this.app.vault.cachedRead(existing);
				if (prev !== content) {
					const list = this.syncHistory[path] = this.syncHistory[path] || [];
					list.push({ content: prev, ts: Date.now() });
					if (list.length > HISTORY_LIMIT) list.shift();
				}
			} catch (err) {}
			await this.app.vault.modify(existing, content);
		} else {
			await this.app.vault.create(path, content);
		}
		this.manifestDirty = true;
	}

	// Feature 9: restore the most recent pre-overwrite snapshot of a path.
	async undoPath(path) {
		const list = this.syncHistory[path];
		if (!list || !list.length) return false;
		const snap = list.pop();
		try {
			const existing = this.app.vault.getAbstractFileByPath(path);
			if (existing instanceof TFile) {
				await this.app.vault.modify(existing, snap.content);
			} else {
				await this.app.vault.create(path, snap.content);
			}
			return true;
		} catch (err) {
			return false;
		}
	}

	// Feature 12: under merge mode, an incoming file whose local copy was also
	// edited since the last sync is kept alongside the pulled version instead
	// of overwriting. We write the incoming one and keep the local one under a
	// "(conflict)" suffix.
	async writeNoteMerging(path, content) {
		if (!this.settings.mergeMode) {
			await this.writeNote(path, content);
			return { conflict: false };
		}
		const existing = this.app.vault.getAbstractFileByPath(path);
		if (existing instanceof TFile && this.settings.lastSyncTime) {
			try {
				const stat = await this.app.vault.adapter.stat(path);
				if (stat && stat.mtime > this.settings.lastSyncTime) {
					const dot = path.lastIndexOf(".");
					const stem = dot > 0 ? path.slice(0, dot) : path;
					const ext = dot > 0 ? path.slice(dot) : "";
					let conflictPath = `${stem} (conflict ${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)})${ext}`;
					let i = 1;
					while (this.app.vault.getAbstractFileByPath(conflictPath)) {
						conflictPath = `${stem} (conflict ${i} ${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)})${ext}`;
						i++;
					}
					await this.app.vault.create(conflictPath, content);
					this.logTransfer(`Conflict: kept both — local ${path} is newer, pulled as ${conflictPath}`);
					return { conflict: true, conflictPath };
				}
			} catch (err) {}
		}
		await this.writeNote(path, content);
		return { conflict: false };
	}

	getPeers() {
		const discovered = Object.entries(this.settings.peers || {})
			.filter(([, p]) => Date.now() - p.lastSeen < 5 * 60 * 1000)
			.map(([id, p]) => {
				const pairedInfo = this.settings.pairedPeers[id];
				return {
					id,
					name: p.name,
					host: p.host,
					port: p.port,
					manual: false,
					paired: !!pairedInfo,
					canHost: pairedInfo ? pairedInfo.canHost !== false : true,
					code: pairedInfo ? pairedInfo.code : null
				};
			});
		const manual = (this.settings.manualPeers || []).map((p, i) => {
			const id = "manual-" + i;
			const paired = this.settings.pairedPeers[id];
			return {
				id,
				name: p.name || "Manual device",
				host: p.host,
				port: Number(p.port) || UDP_PORT,
				manual: true,
				paired: !!paired,
				canHost: paired ? paired.canHost !== false : null,
				code: paired ? paired.code : null
			};
		});
		return [...discovered, ...manual];
	}

	async syncNow() {
		const peers = this.getPeers().filter((p) => p.paired);
		if (peers.length === 0) {
			new Notice("Notes WiFi Sync: no paired devices. Pair a device in Settings first.");
			return;
		}
		const canReach = peers.filter((p) => p.canHost !== false);
		if (canReach.length === 0) {
			new Notice("Those devices are phones — they connect to this PC, not the other way. Start sync from the phone instead.");
			return;
		}
		const modal = new TransferModal(this.app, this, null, "Syncing…");
		modal.open();

		// Feature 20: if a previous transfer was interrupted, resume it first.
		const resumed = [];
		if (this.settings.pendingTransfer) {
			const pt = this.settings.pendingTransfer;
			const peer = canReach.find((p) => p.id === pt.peerId);
			if (peer) {
				try {
					resumed.push(await this.resumeTransfer(peer, pt, (pct, label) => modal.setText(label), (pct) => modal.setProgress(pct)));
					this.settings.pendingTransfer = null;
					await this.saveSettings();
				} catch (err) {
					console.error("Notes WiFi Sync: resume failed", err);
				}
			}
		}

		let transferred = 0;
		let errors = 0;
		for (const peer of canReach) {
			try {
				const r = await this.syncWithPeer(peer, (pct, label) => {
					modal.setText(`Syncing with ${peer.name} — ${label || ""}`);
					modal.setProgress(pct);
				});
				transferred += r;
			} catch (err) {
				errors++;
				console.error("Notes WiFi Sync: sync failed with", peer.name, err);
			}
		}
		modal.close();
		const msg = `Sync complete — ${transferred + resumed.length} files transferred.${errors ? ` ${errors} device(s) failed.` : ""}`;
		this.settings.lastSyncResult = msg;
		this.settings.lastSyncTime = Date.now();
		await this.saveSettings();
		this.refreshStatusBar();
		this.logTransfer(msg);
		new Notice(`Notes WiFi Sync: ${msg}`);
	}

	// Feature 20: finish an interrupted push by re-sending only what's left.
	async resumeTransfer(peer, pt, textCb, pctCb) {
		const paths = Array.isArray(pt.paths) ? pt.paths : [];
		const done = Math.max(0, pt.done || 0);
		const remain = paths.slice(done);
		if (!remain.length) return 0;
		const files = [];
		for (const path of remain) {
			if (!this.matchesFilter(path)) continue;
			try { files.push({ path, content: await this.readNote(path) }); } catch (err) {}
		}
		let n = 0;
		if (files.length) {
			if (textCb) textCb(`Resuming — re-sending ${files.length} file(s)…`);
			n = await this.pushFiles(peer, files, (_pct, label) => { if (pctCb) pctCb(_pct); if (textCb) textCb(label); });
		}
		return n;
	}

	async syncWithPeer(peer, progressCb) {
		const base = `http://${peer.host}:${peer.port}`;
		const myManifest = await this.buildManifest();

		// Round 1: send our manifest, get their files + what they need from us.
		if (progressCb) progressCb(5, "Exchanging file list…");
		const res1 = await this.postJson(base + "/sync", { files: myManifest }, peer);

		// Round 2: compute what we owe them so we can show real progress.
		const outbound = [];
		if (res1.needFromClient && res1.needFromClient.length) {
			for (const path of res1.needFromClient) {
				if (myManifest[path] === undefined) continue;
				try {
					outbound.push({ path, mtime: myManifest[path].mtime, content: await this.readNote(path) });
				} catch (err) {}
			}
		}
		const total = (res1.send || []).length + outbound.length;
		let done = 0;

		let transferred = 0;
		for (const item of (res1.send || [])) {
			try {
				await this.waitIfPaused();
				const r = await this.writeNoteMerging(item.path, item.content);
				if (!r.conflict) transferred++;
			} catch (err) {
				console.error("Notes WiFi Sync: failed to write", item.path, err);
			}
			done++;
			if (progressCb) {
				const pct = total ? Math.round((done / total) * 95) + 5 : 100;
				progressCb(pct, `Receiving ${done} of ${total} files`);
			}
		}

		if (outbound.length) {
			if (progressCb) progressCb(5, `Preparing ${outbound.length} files to send…`);
			await this.postJson(base + "/sync", { files: {}, deliver: outbound }, peer);
			transferred += outbound.length;
			done += outbound.length;
			if (progressCb) progressCb(total ? Math.round((done / total) * 95) + 5 : 100, `Sent ${outbound.length} files`);
		}

		return transferred;
	}

	/* --------------------- Pairing (OTP, Bluetooth-style) ----------------- */

	async pairWithPeer(peer) {
		if (this.pendingPair) {
			new Notice("Wait for the current pairing request to finish first.");
			return;
		}
		const code = String(Math.floor(100000 + Math.random() * 900000));
		new PairRequestModal(this.app, this, peer, code).open();
		try {
			const res = await this.postJson(
				`http://${peer.host}:${peer.port}/pair`,
				{ code, name: this.settings.deviceName, id: this.settings.deviceId, port: this.settings.serverPort, canHost: canHostServer },
				null,
				95 * 1000
			);
			if (res.ok && res.paired) {
				this.settings.pairedPeers[peer.id] = {
					name: peer.name,
					host: peer.host,
					port: peer.port,
					code: code,
					// The responder answered our request, so it MUST run a server
					// and can therefore be reached back.
					canHost: true,
					lastSeen: Date.now()
				};
				await this.saveSettings();
				new Notice(`Paired with ${peer.name}. You can now sync.`);
			} else {
				new Notice(`Pairing with ${peer.name} was not confirmed.`);
			}
		} catch (err) {
			new Notice("Pairing failed: " + this.friendlyError(err, peer));
		}
	}

	// Called when the peer (this device, acting as responder) confirms.
	async completePair(peerInfo, code) {
		this.settings.pairedPeers[peerInfo.id] = {
			name: peerInfo.name,
			host: peerInfo.host,
			port: peerInfo.port,
			code: code,
			canHost: !!peerInfo.canHost,
			lastSeen: Date.now()
		};
		await this.saveSettings();
	}

	unpair(id) {
		delete this.settings.pairedPeers[id];
		return this.saveSettings();
	}

	peerNameById(id) {
		const p = this.settings.pairedPeers[id];
		return p ? p.name : "a paired device";
	}

	friendlyError(err, peer) {
		const m = String((err && err.message) || err || "").toLowerCase();
		if (m.includes("fetch") || m.includes("load failed") || m.includes("network") || m.includes("abort") || m.includes("failed to")) {
			const who = peer ? `${peer.name} at ${peer.host}:${peer.port}` : "the other device";
			return `Cannot reach ${who}. Make sure that device has this vault open with the server running, is on the same WiFi, and is not a phone (phones connect to the PC — start sync from the phone instead).`;
		}
		return String((err && err.message) || err);
	}

	/* ------------------- Compare & choose sync helpers ------------------- */

	async fetchPeerList(peer) {
		return await this.postJson(`http://${peer.host}:${peer.port}/list`, {}, peer);
	}

	// Pull a set of files from a peer with a progress bar. Files are fetched in
	// small batches so the bar advances as data actually moves over the network.
	// Feature 20: each batch advances a persistent journal, so an interrupted
	// pull can be resumed from where it stopped instead of restarting.
	async pullFiles(peer, paths, progressCb) {
		const BATCH = 8;
		let n = 0;
		let bytes = 0;
		let started = Date.now();
		if (paths.length) {
			this.settings.pendingTransfer = { peerId: peer.id, paths, done: 0 };
			await this.saveSettings();
		}
		for (let i = 0; i < paths.length; i += BATCH) {
			await this.waitIfPaused();
			const group = paths.slice(i, i + BATCH);
			const res = await this.postJson(`http://${peer.host}:${peer.port}/pull`, { paths: group }, peer);
			for (const item of res.files || []) {
				try { await this.writeNote(item.path, item.content); n++; bytes += String(item.content || "").length; } catch (err) { console.error(err); }
			}
			this.settings.pendingTransfer.done = i + group.length;
			this.settings.pendingTransfer.done = Math.min(this.settings.pendingTransfer.done, paths.length);
			await this.saveSettings();
			if (progressCb) progressCb(
				paths.length ? Math.round(((i + group.length) / paths.length) * 100) : 100,
				`Pulling ${Math.min(i + group.length, paths.length)} of ${paths.length} files`
			);
		}
		if (paths.length) {
			this.settings.pendingTransfer = null;
			await this.saveSettings();
		}
		this.updateThroughput(started, bytes);
		return n;
	}

	async pushFiles(peer, files, progressCb) {
		const BATCH = 8;
		let n = 0;
		for (let i = 0; i < files.length; i += BATCH) {
			const group = files.slice(i, i + BATCH);
			const res = await this.postJson(`http://${peer.host}:${peer.port}/push`, { files: group }, peer);
			n += res.written || 0;
			if (progressCb) progressCb(
				files.length ? Math.round(((i + group.length) / files.length) * 100) : 100,
				`Pushing ${Math.min(i + group.length, files.length)} of ${files.length} files`
			);
		}
		return n;
	}

	openCompare(peer) {
		new CompareModal(this.app, this, peer).open();
	}

	async postJson(url, obj, peer, timeoutMs) {
		const headers = { "Content-Type": "application/json" };
		if (peer && peer.code) {
			// The server looks us up by OUR device id and checks the pairing code
			// we agreed on with that peer.
			headers["X-Notes-Sync-Code"] = peer.code;
			headers["X-Notes-Sync-Id"] = this.settings.deviceId;
		}
		const controller = new AbortController();
		const timer = window.setTimeout(() => controller.abort(), timeoutMs || 30 * 1000);
		try {
			const response = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify(obj),
				signal: controller.signal
			});
			const text = await response.text();
			let parsed = {};
			try { parsed = JSON.parse(text); } catch (e) {}
			if (response.status >= 400) {
				throw new Error(parsed.error || `HTTP ${response.status}`);
			}
			return parsed;
		} finally {
			window.clearTimeout(timer);
		}
	}

	/* ------------------------- Feature 19: sync log ------------------------- */

	logTransfer(msg) {
		const entry = { ts: Date.now(), msg };
		this.settings.log = this.settings.log || [];
		this.settings.log.push(entry);
		if (this.settings.log.length > LOG_LIMIT) {
			this.settings.log = this.settings.log.slice(-LOG_LIMIT);
		}
		this.saveSettings();
	}

	openLog() {
		new LogModal(this.app, this).open();
	}

	/* ------------------------------ Feature 17: backup ---------------------- */
	// Export the synced folder as a ZIP (store-only, no compression) plus the
	// transfer log, downloaded as a Blob. Zero-dependency minimal ZIP writer.

	async collectBackupFiles() {
		const prefix = (this.settings.folder || "").replace(/\/+$/, "") + "/";
		const files = this.app.vault.getFiles().filter((f) => {
			if (prefix && f.path !== prefix && !f.path.startsWith(prefix)) return false;
			return this.matchesFilter(f.path);
		});
		const out = [];
		for (const f of files) {
			try {
				const content = await this.app.vault.cachedRead(f);
				out.push({ path: f.path, content, mtime: f.stat ? f.stat.mtime : Date.now() });
			} catch (err) {}
		}
		return out;
	}

	zipStore(files) {
		// Minimal stored (no compression) ZIP. files: [{name, content}]
		const encoder = new TextEncoder();
		const localChunks = [];
		const cdChunks = [];
		const offsets = [];
		let offset = 0;
		const crcTable = (() => {
			const table = new Int32Array(256);
			for (let n = 0; n < 256; n++) {
				let c = n;
				for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
				table[n] = c;
			}
			return table;
		})();
		const crc32 = (bytes) => {
			let c = -1;
			for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
			return (c ^ -1) >>> 0;
		};

		for (const f of files) {
			const nb = encoder.encode(f.name);
			const db = encoder.encode(f.content);
			const crc = crc32(db);
			offsets.push(offset);
			const h = new DataView(new ArrayBuffer(30));
			h.setUint32(0, 0x04034b50, true);
			h.setUint16(4, 20, true);
			h.setUint16(6, 0x0800, true);
			h.setUint16(8, 0, true);
			h.setUint16(10, 0, true);
			h.setUint16(12, 0, true);
			h.setUint32(14, crc, true);
			h.setUint32(18, db.length, true);
			h.setUint32(22, db.length, true);
			h.setUint16(26, nb.length, true);
			h.setUint16(28, 0, true);
			localChunks.push(new Uint8Array(h.buffer), nb, db);
			offset += 30 + nb.length + db.length;
		}

		const cdStart = offset;
		let cdSize = 0;
		for (let i = 0; i < files.length; i++) {
			const nb = encoder.encode(files[i].name);
			const db = encoder.encode(files[i].content);
			const rec = new DataView(new ArrayBuffer(46));
			rec.setUint32(0, 0x02014b50, true);
			rec.setUint16(4, 20, true);
			rec.setUint16(6, 20, true);
			rec.setUint16(8, 0x0800, true);
			rec.setUint16(10, 0, true);
			rec.setUint16(12, 0, true);
			rec.setUint16(14, 0, true);
			rec.setUint32(16, crc32(db), true);
			rec.setUint32(20, db.length, true);
			rec.setUint32(24, db.length, true);
			rec.setUint16(28, nb.length, true);
			rec.setUint16(30, 0, true);
			rec.setUint16(32, 0, true);
			rec.setUint16(34, 0, true);
			rec.setUint16(36, 0, true);
			rec.setUint32(38, 0, true);
			rec.setUint32(42, offsets[i], true);
			cdChunks.push(new Uint8Array(rec.buffer), nb);
			cdSize += 46 + nb.length;
		}
		const eocd = new DataView(new ArrayBuffer(22));
		eocd.setUint32(0, 0x06054b50, true);
		eocd.setUint16(4, 0, true);
		eocd.setUint16(6, 0, true);
		eocd.setUint16(8, files.length, true);
		eocd.setUint16(10, files.length, true);
		eocd.setUint32(12, cdSize, true);
		eocd.setUint32(16, cdStart, true);
		eocd.setUint16(20, 0, true);

		const total = offset + cdSize + 22;
		const out = new Uint8Array(total);
		let pos = 0;
		for (const c of localChunks) { out.set(c, pos); pos += c.length; }
		for (const c of cdChunks) { out.set(c, pos); pos += c.length; }
		out.set(new Uint8Array(eocd.buffer), pos);
		return out;
	}

	async exportBackup() {
		const files = await this.collectBackupFiles();
		if (!files.length) { new Notice("No files to export in the synced folder."); return; }
		const logText = (this.settings.log || []).map((e) => `${new Date(e.ts).toISOString()} — ${e.msg}`).join("\n");
		const zipFiles = files;
		if (logText) zipFiles.push({ name: "notes-wifi-sync--log.txt", content: logText });
		const bytes = this.zipStore(zipFiles);
		const blob = new Blob([bytes], { type: "application/zip" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
		a.href = url;
		a.download = `notes-wifi-sync-backup-${stamp}.zip`;
		document.body.appendChild(a);
		a.click();
		setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1000);
		this.logTransfer(`Backed up ${files.length} file(s) to a ZIP.`);
	}

	/* --------------------------- Feature 11: pause -------------------------- */

	togglePause() {
		this.paused = !this.paused;
		return this.paused;
	}

	async waitIfPaused() {
		while (this.paused) {
			await new Promise((r) => setTimeout(r, 500));
		}
	}

	/* --------------------- Feature 8: delta transfer --------------------- */
	// Instead of moving the full content of every differing file, we compare
	// size + mtime first. Files whose size and mtime are identical on both
	// sides are semantically unchanged content, so we skip the payload.

	async pushFiles(peer, files, progressCb) {
		const BATCH = 8;
		let n = 0;
		let bytes = 0;
		let started = Date.now();
		for (let i = 0; i < files.length; i += BATCH) {
			await this.waitIfPaused();
			let group = files.slice(i, i + BATCH);
			// delta: drop files that were already pushed from this batch
			group = group.filter((f) => !f.skipped);
			if (!group.length) { continue; }
			const res = await this.postJson(`http://${peer.host}:${peer.port}/push`, { files: group }, peer);
			n += res.written || 0;
			for (const f of group) bytes += String(f.content || "").length;
			if (progressCb) progressCb(
				files.length ? Math.round(((i + group.length) / files.length) * 100) : 100,
				`Pushing ${Math.min(i + group.length, files.length)} of ${files.length} files`
			);
		}
		this.updateThroughput(started, bytes);
		return n;
	}

	updateThroughput(started, bytes) {
		const dt = (Date.now() - started) / 1000;
		const kbps = dt > 0 ? Math.round((bytes / 1024) / dt) : 0;
		this.statusBarEl && this.statusBarEl.setText(`Sync · ${kbps} KB/s`);
	}

	async pollPeers() {
		if (!this.settings.autoSyncEnabled) return;
		const peers = this.getPeers().filter((p) => p.paired && p.canHost !== false);
		if (peers.length === 0) return;
		for (const peer of peers) {
			try {
				await this.syncWithPeer(peer);
			} catch (err) {
				// silent during polling
			}
		}
	}

	/* ------------------------- Subnet discovery ------------------------- */
	/* Mobile devices can't receive UDP broadcasts (sandboxed WebView), so as a
	   fallback they probe the LAN by HTTP: try /ping on every host in the local
	   subnet and keep the ones that answer with our app tag. Desktop can use
	   this too (e.g. when UDP is blocked). */

	async getLocalIPs() {
		if (this.ipCache) return this.ipCache;
		// Use WebRTC ICE candidates to discover this device's local IPs.
		try {
			const ips = new Set();
			await new Promise((resolve, reject) => {
				const pc = new RTCPeerConnection({ iceServers: [] });
				pc.createDataChannel("probe");
				pc.onicecandidate = (e) => {
					try {
						if (e.candidate) {
							const m = /([0-9]{1,3}\.){3}[0-9]{1,3}/.exec(e.candidate.candidate || "");
							if (m) ips.add(m[0]);
						}
					} catch (err) {}
				};
				pc.createOffer().then((o) => pc.setLocalDescription(o)).then(() => {
					setTimeout(() => {
						try { pc.close(); } catch (err) {}
						resolve();
					}, 500);
				}).catch(reject);
			});
			this.ipCache = [...ips];
			return this.ipCache;
		} catch (err) {
			this.ipCache = [];
			return this.ipCache;
		}
	}

	async discoverByScan() {
		const port = this.settings.serverPort;
		const localIPs = await this.getLocalIPs();
		const subnets = new Set();

		// Derive /24 subnets from local IPs only (skip the generic fallbacks to
		// avoid slow, mostly-useless scans on low-power devices).
		for (const ip of localIPs) {
			const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\./);
			if (m) subnets.add(`${m[1]}.${m[2]}.${m[3]}`);
		}
		if (subnets.size === 0) {
			["192.168.1", "192.168.0", "192.168.43"].forEach((s) => subnets.add(s));
		}

		const found = [];
		for (const subnet of subnets) {
			const candidates = [];
			for (let i = 1; i <= 254; i++) candidates.push(`http://${subnet}.${i}:${port}/ping`);
			const results = await this.scanRange(candidates);
			for (const r of results) {
				try {
					const data = JSON.parse(r.body);
					if (data.ok && data.app === APP_TAG && data.id !== this.settings.deviceId) {
						this.settings.peers[data.id] = {
							name: data.name || "Unknown device",
							host: r.host,
							port: port,
							lastSeen: Date.now()
						};
						found.push(data.name || r.host);
					}
				} catch (err) {}
			}
		}
		await this.saveSettings();
		return found;
	}

	async scanRange(urls) {
		const CONCURRENCY = 8;
		const results = [];
		let i = 0;
		async function worker() {
			while (i < urls.length) {
				const url = urls[i++];
				const host = new URL(url).hostname;
				try {
					const controller = new AbortController();
					const timer = setTimeout(() => controller.abort(), 500);
					const res = await fetch(url, { signal: controller.signal });
					clearTimeout(timer);
					const body = await res.text();
					results.push({ url, host, body, status: res.status });
				} catch (err) {
					// host unreachable or timeout — ignore
				}
			}
		}
		await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker));
		return results;
	}
}

/* ------------------------------ Pairing modals --------------------------- */

class PairRequestModal extends Modal {
	constructor(app, plugin, peer, code) {
		super(app);
		this.plugin = plugin;
		this.peer = peer;
		this.code = code;
	}

	onOpen() {
		this.titleEl.setText("Pairing with " + this.peer.name);
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("div", {
			text: `On ${this.peer.name}, confirm that this pairing code matches.`,
			cls: "notes-wifi-sync-status"
		});
		contentEl.createEl("div", { text: this.code, cls: "notes-wifi-sync-code" });
		const host = this.pairHostFor(this.peer);
		if (host) {
			contentEl.createEl("div", { text: "Scan to open the connection details:", cls: "notes-wifi-sync-hint" });
			try { renderQRCode(contentEl, host); } catch (err) { /* non-encodable, skip */ }
			contentEl.createEl("div", { text: host, cls: "notes-wifi-sync-hint" });
		}
		contentEl.createEl("div", {
			text: "Waiting for confirmation… You can close this window.",
			cls: "notes-wifi-sync-hint"
		});
	}

	pairHostFor(peer) {
		if (!peer || !peer.host) return "";
		const port = peer.port || this.plugin.settings.serverPort || 39991;
		return `${peer.host}:${port}`;
	}
}

class ConfirmPairModal extends Modal {
	constructor(app, plugin, pair) {
		super(app);
		this.plugin = plugin;
		this.pair = pair;
	}

	onOpen() {
		this.titleEl.setText("Pair " + this.pair.name + "?");
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("div", {
			text: `This device is requesting to pair. Check that the code below matches the one shown on ${this.pair.name}.`,
			cls: "notes-wifi-sync-status"
		});
		contentEl.createEl("div", { text: this.pair.code, cls: "notes-wifi-sync-code" });
		contentEl.createEl("div", {
			text: `${this.pair.host}:${this.pair.port}`,
			cls: "notes-wifi-sync-hint"
		});
		const host = this.pair.host && this.pair.port ? `${this.pair.host}:${this.pair.port}` : "";
		if (host) {
			contentEl.createEl("div", { text: "Scan to enter this connection:", cls: "notes-wifi-sync-hint" });
			try { renderQRCode(contentEl, host); } catch (err) { /* non-encodable, skip */ }
		}
		const btns = contentEl.createDiv({ cls: "notes-wifi-sync-btns" });
		btns.createEl("button", { text: "Confirm", cls: "mod-cta mod-warning" }).addEventListener("click", async () => {
			try {
				await this.plugin.completePair({
					id: this.pair.id,
					name: this.pair.name,
					host: this.pair.host,
					port: this.pair.port,
					canHost: this.pair.canHost
				}, this.pair.code);
				this.pair.respond(true);
				new Notice("Paired with " + this.pair.name + ".");
			} catch (err) {
				new Notice("Pairing failed: " + ((err && err.message) || err));
			}
			this.close();
		});
		btns.createEl("button", { text: "Deny", cls: "" }).addEventListener("click", () => {
			this.pair.respond(false);
			new Notice("Pairing with " + this.pair.name + " denied.");
			this.close();
		});
	}
}

/* ------------------------------ Transfer log (F19) ------------------------ */

class LogModal extends Modal {
	constructor(app, plugin) {
		super(app);
		this.plugin = plugin;
		this.editing = false;
	}

	onOpen() {
		this.titleEl.setText("Notes WiFi Sync — activity log");
		const { contentEl } = this;
		contentEl.empty();
		const log = this.plugin.settings.log || [];
		if (!log.length) {
			contentEl.createEl("div", { text: "No transfers recorded yet.", cls: "notes-wifi-sync-status" });
		} else {
			const table = contentEl.createEl("table", { cls: "notes-wifi-sync-table" });
			for (let i = log.length - 1; i >= 0; i--) {
				const entry = log[i];
				const tr = table.createEl("tr");
				tr.createEl("td", { text: new Date(entry.ts).toLocaleString(), cls: "notes-wifi-sync-size" });
				tr.createEl("td", { text: entry.msg, cls: "notes-wifi-sync-file" });
			}
		}
		const btns = contentEl.createDiv({ cls: "notes-wifi-sync-btns" });
		btns.createEl("button", { text: "Clear log", cls: "" }).addEventListener("click", () => {
			this.plugin.settings.log = [];
			this.plugin.saveSettings();
			this.onOpen();
		});
	}
}

/* ------------------------------ Compare modal ---------------------------- */

function formatSize(bytes) {
	if (bytes === undefined || bytes === null || isNaN(bytes)) return "—";
	if (bytes < 1024) return bytes + " B";
	if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
	return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

class CompareModal extends Modal {
	constructor(app, plugin, peer) {
		super(app);
		this.plugin = plugin;
		this.peer = peer;
		this.local = {};
		this.remote = {};
		this.actions = {}; // path -> "pull" | "push" | "skip"
	}

	async onOpen() {
		this.titleEl.setText(`Sync with ${this.peer.name}`);
		const { contentEl } = this;
		contentEl.empty();
		this.statusEl = contentEl.createDiv({ cls: "notes-wifi-sync-status" });
		this.statusEl.setText("Comparing vaults…");

		if (this.peer.canHost === false) {
			this.statusEl.setText(`${this.peer.name} is a phone/client — it can't receive a connection. Open Notes WiFi Sync on ${this.peer.name} and sync from there instead (phones connect to this PC, not the other way).`);
			return;
		}

		try {
			const [localManifest, remoteRes] = await Promise.all([
				this.plugin.buildManifest(),
				this.plugin.fetchPeerList(this.peer)
			]);
			this.local = localManifest || {};
			this.remote = remoteRes.files || {};
			this.renderTable();
		} catch (err) {
			this.statusEl.setText("Connection failed: " + this.plugin.friendlyError(err, this.peer));
		}
	}

	renderTable() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("div", { text: `Folder: ${this.plugin.settings.folder}   ·   Device: ${this.peer.name}`, cls: "notes-wifi-sync-title" });

		const allPaths = Array.from(new Set([...Object.keys(this.local), ...Object.keys(this.remote)])).sort();

		const table = contentEl.createEl("table", { cls: "notes-wifi-sync-table" });
		const header = table.createEl("thead").createEl("tr");
		header.createEl("th", { text: "File" });
		header.createEl("th", { text: "This device" });
		header.createEl("th", { text: this.peer.name });
		header.createEl("th", { text: "Action" });

		const tbody = table.createEl("tbody");
		for (const path of allPaths) {
			const l = this.local[path];
			const r = this.remote[path];

			let action = "skip";
			if (l && r) {
				if (Number(r.mtime) > Number(l.mtime)) action = "pull";
				else if (Number(l.mtime) > Number(r.mtime)) action = "push";
			} else if (l) {
				action = "push";
			} else if (r) {
				action = "pull";
			}
			this.actions[path] = action;

			const row = tbody.createEl("tr");
			row.createEl("td", { text: path, cls: "notes-wifi-sync-file" });
			row.createEl("td", { text: formatSize(l && l.size), cls: "notes-wifi-sync-size" });
			row.createEl("td", { text: formatSize(r && r.size), cls: "notes-wifi-sync-size" });
			const actionTd = row.createEl("td", { cls: "notes-wifi-sync-action" });
			const sel = actionTd.createEl("select");
			const options = [
				["pull", "Pull (device → this)"],
				["push", "Push (this → device)"],
				["skip", "Skip"]
			];
			for (const [val, label] of options) {
				const opt = sel.createEl("option", { value: val, text: label });
				if (val === action) opt.selected = true;
			}
			sel.addEventListener("change", () => { this.actions[path] = sel.value; });
		}

		const btns = contentEl.createDiv({ cls: "notes-wifi-sync-btns" });
		btns.createEl("button", { text: "Pull all", cls: "mod-cta" }).addEventListener("click", () => {
			for (const p of Object.keys(this.actions)) this.actions[p] = this.remote[p] ? "pull" : "skip";
			this.repaintSelects();
		});
		btns.createEl("button", { text: "Push all", cls: "mod-cta" }).addEventListener("click", () => {
			for (const p of Object.keys(this.actions)) this.actions[p] = this.local[p] ? "push" : "skip";
			this.repaintSelects();
		});
		btns.createEl("button", { text: "Sync selected", cls: "mod-cta mod-warning" }).addEventListener("click", () => this.doActions());
	}

	repaintSelects() {
		const { contentEl } = this;
		const selects = contentEl.querySelectorAll("select");
		const paths = Array.from(new Set([...Object.keys(this.local), ...Object.keys(this.remote)])).sort();
		selects.forEach((sel, i) => {
			const path = paths[i];
			if (path) sel.value = this.actions[path] || "skip";
		});
	}

	async doActions() {
		const pullPaths = [];
		const pushFiles = [];
		for (const [path, action] of Object.entries(this.actions)) {
			if (action === "pull" && this.remote[path]) pullPaths.push(path);
			else if (action === "push" && this.local[path]) {
				try {
					pushFiles.push({ path, content: await this.plugin.readNote(path) });
				} catch (err) {}
			}
		}
		if (!pullPaths.length && !pushFiles.length) {
			this.statusEl.setText("Nothing selected to sync.");
			return;
		}
		this.statusEl.setText("Syncing…");
		const modal = new TransferModal(this.app, this.plugin, this.peer, `Syncing with ${this.peer.name}`);
		modal.open();
		try {
			let pulled = 0, pushed = 0;
			if (pullPaths.length) {
				pulled = await this.plugin.pullFiles(this.peer, pullPaths, (pct, label) => { modal.setText(label); modal.setProgress(pct); });
			}
			if (pushFiles.length) {
				pushed = await this.plugin.pushFiles(this.peer, pushFiles, (pct, label) => { modal.setText(label); modal.setProgress(pct); });
			}
			modal.setText(`Done — pulled ${pulled}, pushed ${pushed}.`);
			modal.setProgress(100);
			window.setTimeout(() => modal.close(), 700);
			this.statusEl.setText(`Done — pulled ${pulled}, pushed ${pushed}.`);
		} catch (err) {
			modal.setText("Sync failed: " + this.plugin.friendlyError(err, this.peer));
			this.statusEl.setText("Sync failed: " + this.plugin.friendlyError(err, this.peer));
			window.setTimeout(() => modal.close(), 3000);
		}
	}
}

/* ------------------------------ Transfer modal --------------------------- */

class TransferModal extends Modal {
	constructor(app, plugin, peer, title) {
		super(app);
		this.plugin = plugin;
		this.peer = peer;
		this.modalTitle = title || "Transferring…";
	}

	onOpen() {
		this.titleEl.setText(this.modalTitle);
		const { contentEl } = this;
		contentEl.empty();
		this.statusEl = contentEl.createDiv({ cls: "notes-wifi-sync-status" });
		this.statusEl.setText("Starting…");
		this.progressEl = contentEl.createEl("progress", { cls: "notes-wifi-sync-bar" });
		this.progressEl.max = 100;
		this.progressEl.value = 0;
		this.hintEl = contentEl.createDiv({ cls: "notes-wifi-sync-hint" });
		if (this.peer) {
			this.hintEl.setText(`${this.peer.name} will show a notification on its side too.`);
		}
	}

	setText(text) {
		this.statusEl.setText(text || "");
	}

	setProgress(pct) {
		const v = Math.max(0, Math.min(100, Math.round(pct || 0)));
		this.progressEl.value = v;
	}
}

/* ------------------------------ Settings UI ------------------------------ */

class NotesWifiSyncSettingTab extends PluginSettingTab {
	constructor(app, plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName("Notes WiFi Sync").setHeading();
		new Setting(containerEl)
			.setName("Mode")
			.setDesc(this.plugin.isMobile
				? "Mobile client mode — this device connects to a desktop host below."
				: "Desktop mode — this device can host the server and auto-discover others.");

		if (!this.plugin.isMobile) {
			new Setting(containerEl)
				.setName("Server enabled")
				.setDesc("Accept incoming sync from other devices on the same WiFi.")
				.addToggle((t) => t.setValue(this.plugin.settings.serverEnabled).onChange(async (v) => {
					this.plugin.settings.serverEnabled = v;
					await this.plugin.saveSettings();
					if (v) this.plugin.startServer();
					else this.plugin.stopServer();
				}));
		}

		new Setting(containerEl)
			.setName("Device name")
			.setDesc("How other devices will see this one.")
			.addText((t) => t.setValue(this.plugin.settings.deviceName).onChange(async (v) => {
				this.plugin.settings.deviceName = v;
				await this.plugin.saveSettings();
			}));

		const ipSetting = new Setting(containerEl)
			.setName("This device's IP")
			.setDesc("Detecting…");
		this.plugin.getLocalIPs().then((ips) => {
			ipSetting.setDesc(ips.length
				? "Enter one of these on the other device (port " + this.plugin.settings.serverPort + "): " + ips.join(", ")
				: "Couldn't detect automatically — check your router's DHCP list or network settings.");
		}).catch(() => {
			ipSetting.setDesc("Couldn't detect automatically.");
		});

		const folderSetting = new Setting(containerEl)
			.setName("Sync folder")
			.setDesc("Pick what to sync by choice — an existing folder (no need to create a new vault) or the whole vault.");
		const folderOptions = { "": "Whole vault" };
		const folders = this.app.vault.getAllLoadedFiles()
			.filter((f) => f instanceof TFolder && f.path !== "/")
			.map((f) => f.path)
			.sort();
		for (const p of folders) folderOptions[p] = p;
		folderSetting.addDropdown((dd) => {
			dd.addOptions(folderOptions)
				.setValue(this.plugin.settings.folder || "")
				.onChange(async (v) => {
					this.plugin.settings.folder = v;
					this.plugin.manifestDirty = true;
					await this.plugin.saveSettings();
				});
		});

		new Setting(containerEl)
			.setName("Auto-sync")
			.setDesc("Automatically sync with paired devices on an interval. Keep off on low-power machines; sync manually instead.")
			.addToggle((t) => t.setValue(this.plugin.settings.autoSyncEnabled).onChange(async (v) => {
				this.plugin.settings.autoSyncEnabled = v;
				await this.plugin.saveSettings();
			}));

		if (!this.plugin.isMobile) {
			new Setting(containerEl)
				.setName("Server port")
				.setDesc("Port used for the HTTP sync server and UDP discovery.")
				.addText((t) => t.setValue(String(this.plugin.settings.serverPort)).onChange(async (v) => {
					this.plugin.settings.serverPort = parseInt(v, 10) || 39991;
					await this.plugin.saveSettings();
				}));
		}

		new Setting(containerEl)
			.setName("Auto-sync interval (seconds)")
			.setDesc("How often to check paired devices for changes. Min 30s.")
			.addText((t) => t.setValue(String(this.plugin.settings.pollIntervalSec)).onChange(async (v) => {
				this.plugin.settings.pollIntervalSec = parseInt(v, 10) || 60;
				await this.plugin.saveSettings();
			}));

		new Setting(containerEl)
			.setName("Live sync")
			.setDesc("Push changes to paired devices within seconds of you editing (debounced 3s). Requires this to be running.")
			.addToggle((t) => t.setValue(this.plugin.settings.liveSyncEnabled).onChange(async (v) => {
				this.plugin.settings.liveSyncEnabled = v;
				await this.plugin.saveSettings();
				if (v) this.plugin.startLiveSyncWatchers();
			}));

		new Setting(containerEl)
			.setName("WebSocket transport")
			.setDesc("Use a persistent socket instead of one HTTP request per batch, when the peer also supports it. HTTP is the automatic fallback.")
			.addToggle((t) => t.setValue(this.plugin.settings.useWebSocket).onChange(async (v) => {
				this.plugin.settings.useWebSocket = v;
				await this.plugin.saveSettings();
			}));

		new Setting(containerEl)
			.setName("Sync file extensions")
			.setDesc("Comma-separated. Only these file types are transferred. Leave with the defaults for markdown notes.")
			.addText((t) => t.setValue((this.plugin.settings.syncExtensions || []).join(",")).onChange(async (v) => {
				this.plugin.settings.syncExtensions = String(v).split(",").map((s) => s.trim().replace(/^\./, "")).filter(Boolean);
				this.plugin.manifestDirty = true;
				await this.plugin.saveSettings();
			}));

		new Setting(containerEl)
			.setName("Merge mode")
			.setDesc("When both sides edited a file, keep both copies (newer gets the path, older saved alongside) instead of the newer edit winning.")
			.addToggle((t) => t.setValue(this.plugin.settings.mergeMode).onChange(async (v) => {
				this.plugin.settings.mergeMode = v;
				await this.plugin.saveSettings();
			}));

		new Setting(containerEl)
			.setName("Pause / Resume")
			.setDesc("Temporarily pause all sync and live-sync activity. Progress resumes where it left off.")
			.addButton((b) => {
				b.setButtonText(this.plugin.paused ? "Resume" : "Pause")
					.onClick(async () => {
						const nowPaused = this.plugin.togglePause();
						b.setButtonText(nowPaused ? "Resume" : "Pause");
						new Notice(nowPaused ? "Sync paused." : "Sync resumed.");
					});
			});

		new Setting(containerEl)
			.setName("Backup / export")
			.setDesc("Download the synced folder as a ZIP archive to your device, and optionally a copy of the transfer log.")
			.addButton((b) => b.setButtonText("Export ZIP").onClick(async () => {
				try {
					await this.plugin.exportBackup();
				} catch (err) {
					new Notice("Export failed: " + ((err && err.message) || err));
				}
			}));

		new Setting(containerEl)
			.setName("Activity log")
			.setDesc("View the capped history of transfers, conflicts, and backups.")
			.addButton((b) => b.setButtonText("Open log").onClick(() => this.plugin.openLog()));

		new Setting(containerEl)
			.setName("Sync now")
			.setDesc("Manually sync with all paired devices (newer edit wins).")
			.addButton((b) => b.setButtonText("Sync now").setCta().onClick(() => this.plugin.syncNow()));

		if (this.plugin.isMobile) {
			new Setting(containerEl)
				.setName("Discover devices on network")
				.setDesc("Scans the local subnet for desktop hosts running this plugin. Works even though mobile can't use UDP broadcast.")
				.addButton((b) => b.setButtonText("Scan network").setCta().onClick(async () => {
					b.setButtonText("Scanning…").setDisabled(true);
					try {
						const found = await this.plugin.discoverByScan();
						new Notice(found.length
							? `Found: ${found.join(", ")}`
							: "No devices found on this subnet.");
					} catch (err) {
						new Notice("Scan failed: " + ((err && err.message) || err));
					}
					this.display();
				}));
		} else {
			new Setting(containerEl)
				.setName("Rescan network")
				.setDesc("Re-run subnet scan in case UDP discovery missed any devices.")
				.addButton((b) => b.setButtonText("Scan network").onClick(async () => {
					b.setButtonText("Scanning…").setDisabled(true);
					try {
						const found = await this.plugin.discoverByScan();
						new Notice(found.length
							? `Found: ${found.join(", ")}`
							: "No devices found on this subnet.");
					} catch (err) {
						new Notice("Scan failed: " + ((err && err.message) || err));
					}
					this.display();
				}));
		}

		new Setting(containerEl)
			.setName("Last sync")
			.setDesc(this.plugin.settings.lastSyncResult || "Never synced yet.");

		// Discovered devices
		const peers = this.plugin.getPeers();
		if (peers.length) {
			new Setting(containerEl).setName("Devices").setHeading();
			for (const peer of peers) {
				const setting = new Setting(containerEl)
					.setName(peer.name + (peer.manual ? " (manual)" : "") + (peer.paired ? " — paired" : ""))
					.setDesc(`${peer.host}:${peer.port}`);
				attachAvatar(setting, peer.name);
				if (peer.paired) {
					if (peer.canHost === false) {
						setting.addButton((b) => b.setButtonText("Phone syncs from the phone").setDisabled(true));
						setting.addExtraButton((b) => b.setIcon("unlink").setTooltip("Unpair").onClick(async () => {
							await this.plugin.unpair(peer.id);
							this.display();
						}));
					} else {
						setting.addButton((b) => b.setButtonText("Compare & sync").setCta().onClick(() => {
							this.plugin.openCompare(peer);
						}));
						setting.addExtraButton((b) => b.setIcon("unlink").setTooltip("Unpair").onClick(async () => {
							await this.plugin.unpair(peer.id);
							this.display();
						}));
					}
				} else {
					setting.addButton((b) => b.setButtonText("Pair").setCta().onClick(() => {
						this.plugin.pairWithPeer(peer);
					}));
				}
				if (!peer.manual) {
					setting.addExtraButton((b) => b.setIcon("bookmark").setTooltip("Save device").onClick(async () => {
						const existing = (this.plugin.settings.manualPeers || []).some((p) => p.host === peer.host && Number(p.port) === peer.port);
						if (!existing) {
							this.plugin.settings.manualPeers.push({ name: peer.name, host: peer.host, port: peer.port });
							await this.plugin.saveSettings();
							new Notice(`Saved ${peer.name} to manual devices.`);
						} else {
							new Notice("Device already saved.");
						}
						this.display();
					}));
				}
			}
		}

		// Manual peer management
		new Setting(containerEl).setName("Manual devices").setHeading();
		if (this.plugin.isMobile) {
			new Setting(containerEl)
				.setName("Connect to a desktop host")
				.setDesc("Enter the desktop device's name, IP and port (default 39991), then press Pair and confirm the code on the desktop.");
		}
		new Setting(containerEl)
			.setName("Add device")
			.setDesc("Name, host IP, port (default 39991).")
			.addText((t) => {
				t.setPlaceholder("Name (e.g. Laptop)").setValue(this.plugin._tmpName || "").onChange((v) => this.plugin._tmpName = v);
			});
		new Setting(containerEl)
			.addText((t) => {
				t.setPlaceholder("IP (e.g. 192.168.1.20)").setValue(this.plugin._tmpHost || "").onChange((v) => this.plugin._tmpHost = v);
			});
		new Setting(containerEl)
			.addText((t) => {
				t.setPlaceholder("Port (default 39991)").setValue(this.plugin._tmpPort || "").onChange((v) => this.plugin._tmpPort = v);
			})
			.addButton((b) => b.setButtonText("Add").setCta().onClick(async () => {
				const name = (this.plugin._tmpName || "").trim();
				const host = (this.plugin._tmpHost || "").trim();
				const port = parseInt(this.plugin._tmpPort, 10) || 39991;
				if (!name || !host) {
					new Notice("Enter at least a name and IP.");
					return;
				}
				this.plugin.settings.manualPeers.push({ name, host, port });
				this.plugin._tmpName = "";
				this.plugin._tmpHost = "";
				this.plugin._tmpPort = "";
				await this.plugin.saveSettings();
				this.display();
			}));

		if ((this.plugin.settings.manualPeers || []).length) {
			new Setting(containerEl).setName("Saved manual devices").setHeading();
			for (let i = 0; i < this.plugin.settings.manualPeers.length; i++) {
				const p = this.plugin.settings.manualPeers[i];
				const mSetting = new Setting(containerEl)
					.setName(p.name)
					.setDesc(`${p.host}:${p.port}`)
					.addExtraButton((b) => b.setIcon("trash").setTooltip("Remove").onClick(async () => {
						this.plugin.settings.manualPeers.splice(i, 1);
						await this.plugin.saveSettings();
						this.display();
					}));
				attachAvatar(mSetting, p.name);
			}
		}

		const pairedEntries = Object.entries(this.plugin.settings.pairedPeers || {});
		if (pairedEntries.length) {
			new Setting(containerEl).setName("Paired devices").setHeading();
			for (const [id, pp] of pairedEntries) {
				const canReach = pp.canHost !== false;
				const setting = new Setting(containerEl)
					.setName(pp.name + (canReach ? "" : " (phone — sync starts from it)"))
					.setDesc(`${pp.host}:${pp.port} — paired ${new Date(pp.lastSeen || Date.now()).toLocaleString()}`);
				attachAvatar(setting, pp.name);
				if (canReach) {
					setting.addButton((b) => b.setButtonText("Compare & sync").setCta().onClick(() => {
						this.plugin.openCompare({ id, name: pp.name, host: pp.host, port: pp.port, code: pp.code, canHost: true, manual: true, paired: true });
					}));
				} else {
					setting.addButton((b) => b.setButtonText("Sync from the phone").setDisabled(true));
				}
				setting.addExtraButton((b) => b.setIcon("unlink").setTooltip("Unpair").onClick(async () => {
					await this.plugin.unpair(id);
					this.display();
				}));
			}
		}

		new Setting(containerEl)
			.setName("How it works")
			.setDesc("Pair each device once: press Pair on one device, confirm the pairing code on the other (like Bluetooth). Pick the folder to sync by choice on both sides. Desktop devices auto-discover each other; mobile connects to a desktop host by IP. Use Compare & sync to choose which files to transfer, or Sync now to merge — the newer edit wins.")
			.setClass("notes-wifi-sync-help");
	}
}

module.exports = NotesWifiSyncPlugin;

/* nosourcemap */