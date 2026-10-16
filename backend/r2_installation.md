Viewed config.py:1-52

To connect **Cloudflare R2** to your project, you'll use Python's standard S3 SDK (**`boto3`**), because Cloudflare R2 is 100% S3-compatible (with **zero egress bandwidth fees**).

Here is the complete step-by-step setup:

---

### Step 1: Create your Bucket & API Token in Cloudflare

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and click on **R2 Object Storage** in the sidebar.
2. **Create a Bucket**:
   - Click **Create bucket**.
   - Give it a name (e.g., `doctor-hospital-assets`).
   - Leave default location as *Automatic* and click **Create bucket**.
3. **Enable Public Access (for website images)**:
   - Inside your newly created bucket, go to the **Settings** tab.
   - Under **Public Development Domain**, click **Allow Access** (this gives you a public URL like `https://pub-xxxxxxxx.r2.dev`), **OR** click **Connect Domain** if you have a custom subdomain (e.g., `images.yourdomain.com`).
4. **Generate API Credentials**:
   - Go back to the **R2 Overview** page.
   - On the right sidebar, click **Manage R2 API Tokens**.
   - Click **Create API Token**.
   - Set **Permissions** to **Object Read & Write**.
   - Under *Specify bucket(s)*, you can select your bucket or apply to all.
   - Click **Create API Token**.
   - Copy these 3 values immediately:
     - **Access Key ID**
     - **Secret Access Key**
     - **Account ID** (visible on the R2 overview page or in the endpoint URL: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`)

---

### Step 2: Add Credentials to `backend/.env`

Open your [backend/.env](file:///Users/tousif/githubs/doctor-hospital-app/backend/.env) file and add these 5 variables:

```env
# Cloudflare R2 Storage
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=doctor-hospital-assets
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxxxxx.r2.dev
```

---

### Step 3: Install `boto3` in the Backend

In your terminal inside `backend/`:

```bash
source .venv/bin/activate
pip install boto3
pip freeze > requirements.txt
```

---

### Step 4: How the Integration Works in Code

Cloudflare R2 uses the AWS S3 protocol, so connecting is just 5 lines of Python:

```python
import boto3
from botocore.config import Config

s3_client = boto3.client(
    service_name="s3",
    endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name="auto",
)
```

---

### How the Image Folder Upload Workflow will work

When you are ready with your images folder:
1. You can organize your image folder like this:
   ```text
   images/
   ├── hospitals/
   │   ├── sahyadri-super-speciality-hospital.jpg
   │   └── sassoon-general-hospital.jpg
   ├── doctors/
   │   ├── dr-charulata-bapaye.jpg
   │   └── dr-sudhir-kothari.jpg
   └── laboratories/
       └── apollo-diagnostics.jpg
   ```
2. We will run a script (e.g. `python -m app.db.upload_r2_images`) that will:
   - Upload each file to your Cloudflare R2 bucket.
   - Generate its fast public CDN URL (`https://pub-xxx.r2.dev/hospitals/sahyadri.jpg`).
   - Automatically match the image filename with the hospital/doctor/lab in your **Neon PostgreSQL database** and update the `images` or `photo` column!

Whenever you get your Cloudflare R2 token and bucket created, drop the values into `backend/.env` or let me know and I will help you set up the upload script!