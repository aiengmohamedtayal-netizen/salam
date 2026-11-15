"""
AMAL Performance & Load Benchmark
Measures API latency, concurrency, throughput, and database query times
according to the Performance Optimization Skill criteria:
- P50 < 200ms
- P95 < 1000ms
- P99 < 2000ms
- Error rate < 1%
"""

import asyncio
import time
import statistics
import httpx


async def benchmark_endpoint(client: httpx.AsyncClient, url: str, name: str, n_requests: int = 100, concurrency: int = 10):
    semaphore = asyncio.Semaphore(concurrency)
    latencies = []
    errors = 0

    async def single_request():
        nonlocal errors
        async with semaphore:
            start = time.perf_counter()
            try:
                res = await client.get(url, timeout=10.0)
                if res.status_code >= 400:
                    errors += 1
            except Exception:
                errors += 1
            finally:
                elapsed = (time.perf_counter() - start) * 1000  # ms
                latencies.append(elapsed)

    start_total = time.perf_counter()
    tasks = [single_request() for _ in range(n_requests)]
    await asyncio.gather(*tasks)
    total_time = time.perf_counter() - start_total

    latencies.sort()
    p50 = statistics.median(latencies)
    p90 = latencies[int(len(latencies) * 0.90)]
    p95 = latencies[int(len(latencies) * 0.95)]
    p99 = latencies[int(len(latencies) * 0.99)]
    avg = statistics.mean(latencies)
    rps = n_requests / total_time
    error_rate = (errors / n_requests) * 100

    print(f"\n==================================================")
    print(f"📊 Benchmark Results for: {name} ({url})")
    print(f"==================================================")
    print(f"  Total Requests:  {n_requests} (Concurrency: {concurrency})")
    print(f"  Total Time:      {total_time:.2f} s")
    print(f"  Throughput:      {rps:.1f} req/s")
    print(f"  Error Rate:      {error_rate:.1f}% ({errors}/{n_requests})")
    print(f"  --------------------------------------------------")
    print(f"  Average Latency: {avg:.2f} ms")
    print(f"  P50 (Median):    {p50:.2f} ms   (Target < 200 ms: {'✅ PASS' if p50 < 200 else '❌ FAIL'})")
    print(f"  P90:             {p90:.2f} ms")
    print(f"  P95:             {p95:.2f} ms   (Target < 1000 ms: {'✅ PASS' if p95 < 1000 else '❌ FAIL'})")
    print(f"  P99:             {p99:.2f} ms   (Target < 2000 ms: {'✅ PASS' if p99 < 2000 else '❌ FAIL'})")
    print(f"==================================================")
    return {
        "name": name,
        "p50": p50,
        "p95": p95,
        "p99": p99,
        "rps": rps,
        "error_rate": error_rate,
    }


async def main():
    print("🚀 Starting AMAL Performance Benchmark...")
    async with httpx.AsyncClient(headers={"Accept-Encoding": "gzip"}) as client:
        # Test 1: Fast path health check
        await benchmark_endpoint(
            client,
            "http://127.0.0.1:8000/health",
            name="FastAPI /health Endpoint",
            n_requests=100,
            concurrency=10,
        )

        # Test 2: Large JSON payload with Gzip
        await benchmark_endpoint(
            client,
            "http://127.0.0.1:8000/openapi.json",
            name="OpenAPI Schema (with Gzip)",
            n_requests=50,
            concurrency=5,
        )


if __name__ == "__main__":
    asyncio.run(main())
