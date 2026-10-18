Now that the system is fully configured and the workspace rule [`.agents/rules/r2_image_operations.md`](file:///Users/tousif/githubs/doctor-hospital-app/.agents/rules/r2_image_operations.md) is active in this project, **you don't need to specify any technical parameters or remind me about optimization rules.**

Whenever you want to add or sync images, you can simply tell me:

### 1. For a Specific Folder (Most Common)
> *"Add images from `@data/images_hospitals/Ruby Hall Clinic` to Ruby Hall hospital"*  
> or  
> *"Upload doctor photos from `@data/images_doctors`"*

### 2. For Batch/Multiple Entities
> *"Sync all hospital image folders in `@data/images_hospitals/`"*  
> or  
> *"Sync wellness clinic images in `@data/images_wellness/`"*

---

### What I Will Automatically Do Under the Hood Every Single Time:
1. **0 Unnecessary Operations**: Run local SHA-256 hash checks against PostgreSQL first—any previously uploaded image costs **0 R2 operations**.
2. **Local WebP Optimization**: Convert raw PNG/JPEGs to high-efficiency WebP.
3. **Generate Responsive Sizes**: Create `thumb` (400w), `card` (800w), and `full` (1600w).
4. **Enforce Caching**: Upload with `Cache-Control: public, max-age=31536000, immutable`.
5. **No Blind Bucket Queries**: Never run billable `list_objects` or `head_object` queries on R2.
6. **Instant Database Linking**: Update both the `images` table and the entity's records (`hospitals.images`, `doctors.photo`, etc.) so they render immediately on the frontend.