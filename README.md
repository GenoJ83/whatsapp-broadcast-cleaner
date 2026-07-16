# whatsapp-broadcast-cleaner

## Problem
WhatsApp Web API limitations prevent the automatic removal of participants from broadcast lists. 

## Solution
This tool acts as a **Reporter**. It connects to your WhatsApp account, scans your existing broadcast lists, checks if the participants are still active on WhatsApp, and generates a report of "dead" numbers. You can then use this report to manually remove those numbers from your lists on your phone.

## Installation
```bash
# Clone the repository
git clone https://github.com/GenoJ83/whatsapp-broadcast-cleaner.git
cd whatsapp-broadcast-cleaner

# Install dependencies and build
npm install
npm run build

# Link globally (optional)
npm link
```

## Usage
Start the tool using npm:
```bash
npm start
```
Alternatively, if you linked the package globally:
```bash
whatsapp-broadcast-cleaner
```

1. **Scan the QR Code**: The terminal will display a QR code. Open WhatsApp on your phone and link a device by scanning it.
2. **Syncing**: The tool will pause for a brief moment to allow your chats to sync.
3. **Analysis**: It will output a list of your broadcast lists along with any numbers that are no longer registered on WhatsApp.

> **Note:** The WhatsApp Web API may not sync all of your broadcast lists automatically. If a list is missing, simply send a message to that broadcast list from your phone, and then run this tool again.

## Demo
*(Demo GIF placeholder)*

## Tags
#opensource #utility #weekendproject
