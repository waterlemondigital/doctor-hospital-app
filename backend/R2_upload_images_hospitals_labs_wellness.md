Ran command: `node -e "
import('dotenv').then(d => d.config());
import('pg').then(async ({ default: pg }) => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  
  function normalize(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function parseFolder(folderName) {
    const parts = folderName.split(/\s*[-–—]\s*/);
    if (parts.length >= 2) {
      return {
        namePart: parts.slice(0, -1).join(' - ').trim(),
        cityPart: parts[parts.length - 1].trim()
      };
    }
    const commaParts = folderName.split(/\s*,\s*/);
    if (commaParts.length >= 2) {
      return {
        namePart: commaParts.slice(0, -1).join(', ').trim(),
        cityPart: commaParts[commaParts.length - 1].trim()
      };
    }
    return { namePart: folderName.trim(), cityPart: '' };
  }

  const testHospitals = [
    'Apollo Hospitals - Ahmedabad',
    'Apollo Hospitals - Bengaluru',
    'Apollo Hospitals - Bhubaneswar',
    'Ruby Hall Clinic - Pune',
    'Deenanath Mangeshkar Hospital - Pune'
  ];

  const { rows } = await pool.query('SELECT id, name, slug, city FROM hospitals');

  testHospitals.forEach(folder => {
    const { namePart, cityPart } = parseFolder(folder);
    const normName = normalize(namePart);
    const normCity = normalize(cityPart);

    const match = rows.find(r => {
      const rNormName = normalize(r.name);
      const rNormCity = normalize(r.city);
      const cityMatches = !normCity || rNormCity.includes(normCity) || normCity.includes(rNormCity);
      const nameMatches = rNormName.includes(normName) || normName.includes(rNormName);
      return cityMatches && nameMatches;
    });

    console.log(folder, '==>', match ? match.name + ' (' + match.id + ')' : 'NO MATCH');
  });

  await pool.end();
});
"`
Created sync_media_folders.js
Viewed package.json:10-25
Edited package.json
Ran command: `node scripts/sync_media_folders.js --type=hospitals`
Ran command: `ls -la /Users/tousif/githubs/doctor-hospital-app/data`
Ran command: `node scripts/sync_media_folders.js --type=labs`

Testing the universal automated sync script on `data/labs`...

Edited MEDIA_OPTIMIZATION_GUIDE.md
Ran command: `git status -s`

You no longer need to prompt the AI to do this. A **universal automated pipeline** ([backend/scripts/sync_media_folders.js](file:///Users/tousif/githubs/doctor-hospital-app/backend/scripts/sync_media_folders.js)) has been built and tested.

---

### How to use it anytime (Zero Prompts Needed):

#### Step 1: Put your folders in `data/`
Place your folders inside the appropriate directory:
- Hospitals: `data/hospitals/`
- Wellness Centers: `data/wellness/`
- Diagnostic Labs: `data/labs/`

#### Step 2: Follow your naming rule
- **Folder name**: `name_as_per_our_website - cityname`
  *(Examples: `Apollo Hospitals - Ahmedabad`, `Ruby Hall Clinic - Pune`, or `Atmantan Wellness Centre`)*
- **Cover Image**: Keep the primary image named **`image_1`** (`image_1.jpg`, `image_1.png`, etc.). The script strictly places this at index `0`.

---

#### Step 3: Run the command in your terminal
From the `backend/` directory, simply run:

```bash
# Sync everything across all categories at once:
npm run media:sync
```

Or run for a specific category if you only added folders for one:
```bash
npm run media:sync:hospitals   # Only hospitals
npm run media:sync:wellness    # Only wellness centers
npm run media:sync:labs        # Only diagnostic laboratories
```

---

### What it does completely automatically:
1. **Intelligent Matcher**: Matches `name_as_per_our_website` and `cityname` directly against the database records (no hardcoded overrides needed).
2. **Strict `image_1` Priority**: Guarantees `image_1` is placed at index `0` so it displays as the primary card preview and first carousel slide.
3. **Dual WebP Generation**: Sharp converts images to 1200px full view and 600px card thumbnails.
4. **Cloudflare R2 Direct Upload**: Uploads to `hospitals/<id>/`, `wellness/<id>/`, or `labs/<id>/` with immutable cache headers.
5. **Database Sync & Cache Busting**: Updates the Neon PostgreSQL `images` JSON with a version tag (`?v=...`) so returning visitors see the new images immediately.
6. **Reloads Server Cache**: Flushes the backend in-memory cache via `POST /api/v1/cache/clear`.