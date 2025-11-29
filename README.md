# SubiScrapeBot

SubiScrapeBot is a Telegram bot that allows you to create automatic alerts based on Subito.it searches. You can configure one or more search queries, and the bot will periodically check for new listings, notifying you when new results matching your criteria appear.

## Features

- 🔍 **Search Monitoring**: Automatically monitor Subito.it for new listings matching your search queries
- ⚙️ **Flexible Configuration**: Configure alerts with various filters:
  - Search query (required)
  - Category selection
  - Minimum and maximum price filters
  - Urgent listings only
  - Title-only search mode
- 📱 **Telegram Integration**: Receive instant notifications directly in Telegram when new listings are found
- 💾 **Persistent Storage**: All alerts and found listings are stored in MongoDB
- 🔐 **User Authorization**: Only authorized users can use the bot

## Prerequisites

- [Bun](https://bun.sh/) runtime (v1.3.3 or higher)
- MongoDB database (can be run via Docker Compose)
- A Telegram Bot Token (obtain from [@BotFather](https://t.me/botfather))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd subiscrapebot
```

2. Install dependencies:
```bash
bun install
```

3. Set up MongoDB using Docker Compose:
```bash
docker compose up -d
```

4. Copy the example environment file and configure it:
```bash
cp .env.example .env
```

5. Configure authorized users in `src/config.json`:
```json
{
  "authorizedUsers": [your_telegram_user_id],
  "fetchInterval": 30000
}
```

   - `authorizedUsers`: Array of Telegram user IDs allowed to use the bot
   - `fetchInterval`: Interval in milliseconds between each check (default: 30000 = 30 seconds)

## Usage

1. Start the bot:
```bash
bun start
```

2. Open Telegram and start a conversation with your bot.

3. Use the following commands:

### Commands

- `/start` - Display welcome message and bot information
- `/add <query>` - Add a new alert with the specified search query
- `/edit <query>` - Edit an existing alert's configuration
- `/remove <query>` - Remove an alert
- `/list` - List all configured alerts
- `/help` - Display help message with available commands

### Adding and Configuring Alerts

1. Add an alert using `/add <your search query>`
2. The bot will enter configuration mode where you can:
   - Select a category from the available Subito.it categories
   - Set minimum price filter
   - Set maximum price filter
   - Toggle "urgent listings only" mode
   - Toggle "title-only search" mode
3. Save the alert configuration

## How It Works

- The bot continuously monitors all configured alerts
- Every `fetchInterval` milliseconds, it checks Subito.it for new listings
- When a new listing matching an alert's criteria is found:
  - The listing is stored in the database
  - A notification is sent to all authorized users via Telegram
  - The notification includes the listing title, price, publication date, and a direct link

## Support

For issues, questions, or contributions, please open an issue on the repository.
