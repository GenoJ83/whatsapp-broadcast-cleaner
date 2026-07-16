#!/usr/bin/env node
import { connectToWhatsApp } from './whatsapp';
import { analyzeBroadcastLists } from './analyzer';
import * as fs from 'fs';

async function main() {
    console.log('WhatsApp Broadcast Cleaner');
    console.log('==========================');
    
    try {
        const { sock, store } = await connectToWhatsApp();
        
        await analyzeBroadcastLists(sock, store);
        
        console.log('\nFinished analysis.');
        console.log('Exiting gracefully...');
        process.exit(0);
    } catch (error: any) {
        console.error('Error starting cleaner:', error.message);
        process.exit(1);
    }
}

main();
