import makeWASocket, { useMultiFileAuthState, DisconnectReason, WASocket } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';

export async function connectToWhatsApp(): Promise<{sock: WASocket, store: any}> {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');

    const store = { chats: { dict: {} as any }, messages: {} as any };

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }) as any,
    });

    sock.ev.on('messaging-history.set', (event) => {
        for (const chat of event.chats) {
            if (chat.id) store.chats.dict[chat.id] = chat;
        }
        for (const msg of event.messages) {
            const jid = msg.key.remoteJid;
            if (jid) {
                if (!store.messages[jid]) store.messages[jid] = { array: [] };
                store.messages[jid].array.push(msg);
            }
        }
    });

    sock.ev.on('chats.upsert', (newChats) => {
        for (const chat of newChats) {
            if (chat.id) store.chats.dict[chat.id] = chat;
        }
    });

    // remove chats.set as it's no longer a valid event

    sock.ev.on('creds.update', saveCreds);

    return new Promise((resolve, reject) => {
        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('\n--- NEW QR CODE GENERATED ---');
                qrcode.generate(qr, { small: true });
                console.log('Scan the QR code above with your WhatsApp app (Linked Devices).');
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('Connection closed due to', lastDisconnect?.error, ', reconnecting', shouldReconnect);
                if (shouldReconnect) {
                    connectToWhatsApp().then(resolve).catch(reject);
                } else {
                    reject(new Error('Logged out of WhatsApp. Please delete "baileys_auth_info" directory and run again to scan new QR code.'));
                }
            } else if (connection === 'open') {
                console.log('Opened connection to WhatsApp');
                resolve({sock, store});
            }
        });
    });
}
