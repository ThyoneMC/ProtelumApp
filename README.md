# Setup

## dotenv

https://discord.com/developers/applications

```dosini
CLIENT_ID="98765432123456789"
GUILD_ID="12345678987654321"
TOKEN="Discord.Token"
```

port for `express` server

```dosini
SERVER_PORT=3000
```

## settings

https://discord.com/developers/applications/:applicationID/bot

**Privileged Gateway Intents**

- Turn on `PRESENCE INTENT`
- Turn on `SERVER MEMBERS INTENT`

# How to use

Make verification
```
localhost:port/:userId:/:verifyCode
```

verifying on discord (example, verifyCode: 123456)
```
/protelum discord code:123456
```

Check verification
```
localhost:port/:verifyCode
```