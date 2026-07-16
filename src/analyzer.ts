import { WASocket } from '@whiskeysockets/baileys';

export async function analyzeBroadcastLists(sock: WASocket, store: any) {
    console.log('\nFetching broadcast lists...');
    console.log('Waiting 10 seconds for initial sync to populate chats...');
    
    await new Promise(resolve => setTimeout(resolve, 10000));

    const chats = store.chats.all ? store.chats.all() : Object.values(store.chats.dict || {});
    
    const broadcastJids = chats
        .map((c: any) => c.id)
        .filter((id: string) => id.endsWith('@broadcast') && id !== 'status@broadcast');
    
    if (broadcastJids.length === 0) {
        console.log('\nNo broadcast lists found.');
        console.log('Note: WhatsApp Web API (used by this tool) may not sync broadcast lists automatically.');
        console.log('Try sending a message to your broadcast list from your phone, then run this tool again.');
        return;
    }

    console.log(`\nFound ${broadcastJids.length} broadcast list(s). Analyzing participants...`);

    for (const jid of broadcastJids) {
        try {
            console.log(`\n--- Broadcast List: ${jid} ---`);
            let recipients: string[] = [];

            // Try to get metadata as if it were a group, or try getBroadcastListInfo if it exists in this baileys fork
            if (typeof (sock as any).getBroadcastListInfo === 'function') {
                const listInfo = await (sock as any).getBroadcastListInfo(jid);
                recipients = listInfo.recipients || [];
            } else {
                // Fallback: try groupMetadata
                try {
                    const metadata = await sock.groupMetadata(jid);
                    recipients = metadata.participants.map(p => p.id);
                } catch (e: any) {
                    console.log('Could not fetch list participants using groupMetadata. Trying to extract from recent messages...');
                    // Try to find a recent message sent to this broadcast list to extract recipients
                    const messages = store.messages[jid]?.array || [];
                    for (let i = messages.length - 1; i >= 0; i--) {
                        const msg = messages[i];
                        if (msg.message?.extendedTextMessage?.contextInfo?.participant || msg.participant || msg.broadcast) {
                            // Extract recipients from broadcast message if possible.
                            // In baileys, the broadcast recipients are usually not in the message itself, 
                            // but individual messages are sent.
                        }
                    }
                    if (recipients.length === 0) {
                        console.error('Failed to retrieve participants for this broadcast list due to WhatsApp Web API limitations.');
                        continue;
                    }
                }
            }

            console.log(`Total recipients: ${recipients.length}`);
            
            let deadNumbers = 0;
            const deadList: string[] = [];
            
            for (const recipientJid of recipients) {
                const response = await sock.onWhatsApp(recipientJid);
                const result = response?.[0];
                if (!result || !result.exists) {
                    deadNumbers++;
                    deadList.push(recipientJid.split('@')[0]);
                }
                // Rate limit
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            if (deadNumbers > 0) {
                console.log(`⚠️ Found ${deadNumbers} dead number(s):`);
                deadList.forEach(num => console.log(`  - ${num}`));
            } else {
                console.log(`✅ All ${recipients.length} numbers are active on WhatsApp.`);
            }
        } catch (error: any) {
            console.error(`Failed to analyze broadcast list ${jid}:`, error.message);
        }
    }
}
