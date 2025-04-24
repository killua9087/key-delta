const { default: makeWASocket } = require("@whiskeysockets/baileys");
const puppeteer = require("puppeteer");

async function fetchKrnlKey(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    let key = await page.evaluate(() => {
        return document.querySelector(".key-container")?.innerText || "❌ لم يتم العثور على المفتاح";
    });

    await browser.close();
    return key;
}

async function startBot() {
    const sock = makeWASocket({ printQRInTerminal: true });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const message = messages[0];
        const text = message.message?.conversation;

        if (text?.startsWith("/مفتاح")) {
            const url = text.split(" ")[1];
            const key = await fetchKrnlKey(url);
            sock.sendMessage(message.key.remoteJid, { text: `🔑 المفتاح الخاص بك: ${key}` });
        }
    });
}

startBot();