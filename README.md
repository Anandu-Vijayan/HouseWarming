# Housewarming invite (Next.js)

## Run
```
npm install
cp .env.example .env.local   # set ADMIN_KEY
npm run dev                  # http://localhost:3000
```

## Edit the event
Everything (hosts, date, time, days guests can pick, map link) is in `lib/event.js`.
Replace `public/house.png` to change the photo.

## See who is coming
Open `/guests?key=YOUR_ADMIN_KEY`. Shows head count per day and every reply.

## Where replies are saved
- Default: `data/rsvps.json` (fine for local or a VPS with `npm run build && npm start`).
- Vercel: the file system is read-only, so create a free Upstash Redis database
  and set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. No code change needed.
