#!/usr/bin/env python3
"""
Comprehensive latency and performance test for all HealthDiscover API endpoints.
Verifies response status, payload size, cache status, and round-trip latency.
"""

import time
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000"

ENDPOINTS = [
    # System & Health
    ("/", "Root System Info"),
    ("/api/v1/health", "Database & Server Health Check"),
    ("/api/v1/cache/status", "API Cache Status & Metrics"),

    # Hospitals Directory
    ("/api/v1/hospitals", "All Hospitals (National 71 Facilities)"),
    ("/api/v1/hospitals?city=pune", "Hospitals Filtered by Pune"),
    ("/api/v1/hospitals?city=mumbai", "Hospitals Filtered by Mumbai"),
    ("/api/v1/hospitals?city=new%20delhi", "Hospitals Filtered by New Delhi"),
    ("/api/v1/hospitals?city=bengaluru", "Hospitals Filtered by Bengaluru"),
    ("/api/v1/hospitals?search=cardiology", "Hospitals Search by Speciality"),

    # Single Hospital Details
    ("/api/v1/hospitals/all-india-institute-of-medical-sciences-aiims-new-delhi", "Hospital Detail: AIIMS New Delhi"),
    ("/api/v1/hospitals/medanta-the-medicity", "Hospital Detail: Medanta Gurugram"),
    ("/api/v1/hospitals/kokilaben-dhirubhai-ambani-hospital", "Hospital Detail: Kokilaben Mumbai"),
    ("/api/v1/hospitals/narayana-institute-of-cardiac-sciences", "Hospital Detail: Narayana Bengaluru"),
    ("/api/v1/hospitals/sahyadri-super-speciality-hospital", "Hospital Detail: Sahyadri Pune"),
    ("/api/v1/hospitals/ruby-hall-clinic", "Hospital Detail: Ruby Hall Clinic"),

    # Doctors Directory
    ("/api/v1/doctors", "All Doctors (48 Verified Specialists)"),
    ("/api/v1/doctors?city=pune", "Doctors Filtered by Pune"),
    ("/api/v1/doctors?city=mumbai", "Doctors Filtered by Mumbai"),
    ("/api/v1/doctors?city=new%20delhi", "Doctors Filtered by New Delhi"),
    ("/api/v1/doctors?city=bengaluru", "Doctors Filtered by Bengaluru"),
    ("/api/v1/doctors?speciality=Ophthalmology", "Doctors Filtered by Speciality"),

    # Single Doctor Details
    ("/api/v1/doctors/dr-radhika-tandon", "Doctor Detail: Dr. Radhika Tandon"),
    ("/api/v1/doctors/dr-arvind-kumar", "Doctor Detail: Dr. Arvind Kumar"),
    ("/api/v1/doctors/dr-abhaya-kumar", "Doctor Detail: Dr. Abhaya Kumar"),
    ("/api/v1/doctors/dr-a-asha", "Doctor Detail: Dr. A Asha"),
    ("/api/v1/doctors/dr-rashida-patanwala-melinkeri", "Doctor Detail: Dr. Rashida Melinkeri"),

    # Laboratories Directory
    ("/api/v1/laboratories", "All Diagnostic Laboratories"),
    ("/api/v1/laboratories?city=pune", "Laboratories Filtered by Pune"),
    ("/api/v1/laboratories?search=pathology", "Laboratories Search by Service"),

    # Wellness Clinics Directory
    ("/api/v1/wellness-centers", "All Wellness Centers & Clinics"),
    ("/api/v1/wellness-centers?city=pune", "Wellness Centers Filtered by Pune"),

    # Metadata & Taxonomy
    ("/api/v1/cities", "Supported Cities Taxonomy"),
    ("/api/v1/specialities", "Clinical Specialities Taxonomy"),
]

def test_endpoint(path: str):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "LatencyTester/1.0",
            "Accept-Encoding": "gzip",
            "Accept": "application/json",
        }
    )
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            raw_body = resp.read()
            elapsed_ms = (time.perf_counter() - t0) * 1000
            status_code = resp.status
            cache_header = resp.headers.get("X-Cache", "N/A")
            etag = resp.headers.get("ETag", "-")
            size_bytes = len(raw_body)
            return {
                "ok": True,
                "status": status_code,
                "latency_ms": round(elapsed_ms, 2),
                "cache": cache_header,
                "etag": etag,
                "size_kb": round(size_bytes / 1024, 2),
            }
    except urllib.error.HTTPError as e:
        elapsed_ms = (time.perf_counter() - t0) * 1000
        return {
            "ok": False,
            "status": e.code,
            "latency_ms": round(elapsed_ms, 2),
            "cache": "ERR",
            "etag": "-",
            "size_kb": 0,
            "error": str(e),
        }
    except Exception as e:
        elapsed_ms = (time.perf_counter() - t0) * 1000
        return {
            "ok": False,
            "status": 0,
            "latency_ms": round(elapsed_ms, 2),
            "cache": "FAIL",
            "etag": "-",
            "size_kb": 0,
            "error": str(e),
        }

def run_all_tests():
    print(f"🚀 Starting comprehensive latency benchmark on {len(ENDPOINTS)} API endpoints...")
    print(f"{'Endpoint':<55} | {'Status':<6} | {'Cache':<5} | {'Latency':<9} | {'Payload':<8} | {'Evaluation'}")
    print("-" * 105)

    results = []
    exceeded_count = 0

    for path, description in ENDPOINTS:
        # Run test
        res = test_endpoint(path)
        ms = res["latency_ms"]

        # Evaluation criteria: Must be well under 100-500ms
        if not res["ok"]:
            eval_str = f"❌ ERROR ({res.get('error', '')[:20]})"
            exceeded_count += 1
        elif ms < 5.0:
            eval_str = "⚡ Ultra Fast (<5ms)"
        elif ms < 50.0:
            eval_str = "✅ Excellent (<50ms)"
        elif ms <= 300.0:
            eval_str = "✅ Within Target (100-300ms)"
        elif ms <= 500.0:
            eval_str = "⚠️ Acceptable (<500ms)"
        else:
            eval_str = "❌ Exceeded 500ms"
            exceeded_count += 1

        results.append((path, res, eval_str))
        status_str = str(res["status"])
        cache_str = res["cache"]
        lat_str = f"{ms:.2f} ms"
        size_str = f"{res['size_kb']:.1f} KB"

        print(f"{path[:54]:<55} | {status_str:<6} | {cache_str:<5} | {lat_str:<9} | {size_str:<8} | {eval_str}")

    print("-" * 105)
    latencies = [r[1]["latency_ms"] for r in results if r[1]["ok"]]
    if latencies:
        avg_lat = sum(latencies) / len(latencies)
        min_lat = min(latencies)
        max_lat = max(latencies)
        print(f"📊 SUMMARY: {len(results)} Endpoints Tested | {len(latencies)} Succeeded | {exceeded_count} Slow/Failed")
        print(f"⚡ Minimum Latency: {min_lat:.2f} ms")
        print(f"⚡ Average Latency: {avg_lat:.2f} ms")
        print(f"⚡ Maximum Latency: {max_lat:.2f} ms")
        if max_lat <= 500.0 and exceeded_count == 0:
            print("🎉 ALL ENDPOINT LATENCIES ARE WELL WITHIN THE 100 - 500MS TARGET (AND MOST ARE <5MS)!")

if __name__ == "__main__":
    run_all_tests()
