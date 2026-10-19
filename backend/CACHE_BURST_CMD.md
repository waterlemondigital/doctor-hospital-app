Created cache_bust_media_urls.js
Viewed package.json:10-20
Edited package.json
Viewed MEDIA_OPTIMIZATION_GUIDE.md:120-161
Edited MEDIA_OPTIMIZATION_GUIDE.md
Ran command: `git status -s`

The script has been added and configured so it's ready whenever you decide to run it.

---

### Script Location & Configuration

1. **Script Path**: [backend/scripts/cache_bust_media_urls.js](file:///Users/tousif/githubs/doctor-hospital-app/backend/scripts/cache_bust_media_urls.js)
2. **NPM Command Shortcut**: Added to [backend/package.json](file:///Users/tousif/githubs/doctor-hospital-app/backend/package.json)
3. **Documented in Guide**: Added to [backend/MEDIA_OPTIMIZATION_GUIDE.md](file:///Users/tousif/githubs/doctor-hospital-app/backend/MEDIA_OPTIMIZATION_GUIDE.md)

---

### How to Run It (Whenever You're Ready)

Whenever you want all returning users to immediately fetch the new images without needing a hard refresh, just say the word or run:

```bash
# In backend/ directory:
npm run media:cache-bust
```

Or run it for specific categories or with a custom version:
```bash
node scripts/cache_bust_media_urls.js --type=hospitals --v=2
node scripts/cache_bust_media_urls.js --type=wellness
node scripts/cache_bust_media_urls.js --type=labs
```

It will stay safely standby until you tell me to run it!