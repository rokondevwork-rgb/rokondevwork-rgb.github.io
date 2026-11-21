---
title: "From Kafka to Flink to MinIO: An Event Pipeline That Runs on Your Laptop"
description: "Build a small streaming pipeline with Docker Compose: FastAPI publishes supplier updates to Kafka, Flink SQL cleans them as they arrive, and the results land as files in MinIO."
pubDate: 2026-11-21T11:00:00+06:00
tags: ["Kafka", "Apache Flink", "MinIO", "Docker"]
draft: false
---

## Why stream at all?

Most of my work with supplier data started as **batch jobs**: download a file every night, clean it, load it. That works until the business wants changes faster than once a day. Hotel names change, ratings change, new hotels appear, and a nightly job means the platform is always up to a day behind.

A **streaming** pipeline handles each change as it arrives. In this post we build a small one that runs entirely on a laptop:

```text
FastAPI ──► Kafka ──► Flink SQL ──► MinIO
(publish)   (topic)   (clean)       (files)
```

* **FastAPI** receives supplier updates and publishes each one as an event.
* **Kafka** keeps the events, in order, until someone reads them.
* **Apache Flink** reads the events as they arrive, cleans them with SQL, and writes the result.
* **MinIO** is an S3-compatible object store, so the output looks exactly like files in an S3 bucket.

---

## Why each piece is there

**Kafka** is a durable log. Producers append events to a *topic*, and consumers read at their own speed. If Flink is down for an hour, nothing is lost: it picks up where it stopped. Events with the same *key* go to the same partition, so all updates for one hotel stay in order.

**Flink** is a stream processor. It keeps running, handles each event as it arrives, and can do in SQL what a batch job does: filter, clean, join, aggregate. Its checkpoints let it recover after a crash and carry on from the last saved position.

**MinIO** gives you an S3 API locally. The same Flink job can later write to real S3 by changing only the endpoint.

> **A note on MinIO images:** in October 2025 MinIO stopped publishing free Docker images for the community edition, and `minio/minio` no longer pulls from Docker Hub. This post uses Chainguard's free MinIO image, `cgr.dev/chainguard/minio`. Any S3-compatible store works the same way with Flink.

---

## Step 1: Docker Compose

Create a folder with a `jars` directory, and download the Flink Kafka SQL connector into it (Flink does not ship connectors in its image):

```bash
mkdir -p pipeline/jars && cd pipeline
curl -L -o jars/flink-sql-connector-kafka-3.3.0-1.20.jar \
  https://repo1.maven.org/maven2/org/apache/flink/flink-sql-connector-kafka/3.3.0-1.20/flink-sql-connector-kafka-3.3.0-1.20.jar
```

`docker-compose.yml`:

```yaml
x-flink: &flink
  image: flink:1.20
  volumes:
    - ./jars/flink-sql-connector-kafka-3.3.0-1.20.jar:/opt/flink/lib/flink-sql-connector-kafka-3.3.0-1.20.jar
  environment:
    FLINK_PROPERTIES: |
      jobmanager.rpc.address: jobmanager
      taskmanager.numberOfTaskSlots: 2
      s3.endpoint: http://minio:9000
      s3.path.style.access: true
      s3.access-key: minioadmin
      s3.secret-key: minioadmin123

services:
  kafka:
    image: apache/kafka:3.9.0
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:19092,CONTROLLER://:29093,PLAINTEXT_HOST://:9092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:19092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:29093
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1

  minio:
    image: cgr.dev/chainguard/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123

  jobmanager:
    <<: *flink
    command: >
      bash -c "mkdir -p /opt/flink/plugins/s3-fs-hadoop &&
      cp /opt/flink/opt/flink-s3-fs-hadoop-*.jar /opt/flink/plugins/s3-fs-hadoop/ &&
      /docker-entrypoint.sh jobmanager"
    ports:
      - "8081:8081"

  taskmanager:
    <<: *flink
    command: >
      bash -c "mkdir -p /opt/flink/plugins/s3-fs-hadoop &&
      cp /opt/flink/opt/flink-s3-fs-hadoop-*.jar /opt/flink/plugins/s3-fs-hadoop/ &&
      /docker-entrypoint.sh taskmanager"
    depends_on:
      - jobmanager
```

The parts that usually go wrong:

* **Kafka has two listeners.** Containers talk to `kafka:19092`; your laptop talks to `localhost:9092`. With only one, either Flink or your FastAPI app cannot connect.
* **The S3 plugin has to be enabled.** Flink's image ships `flink-s3-fs-hadoop` in `/opt/flink/opt`, but it only loads from `/opt/flink/plugins`. The `command` copies it there before starting.
* **`s3.path.style.access: true`** is needed for MinIO, which serves buckets as `http://minio:9000/bucket`, not as `bucket.minio`.

Start everything:

```bash
docker compose up -d
```

The Flink dashboard is at http://localhost:8081.

---

## Step 2: Create the topic and the bucket

```bash
docker compose exec kafka /opt/kafka/bin/kafka-topics.sh \
  --create --topic hotel-updates --partitions 3 \
  --bootstrap-server localhost:9092
```

For the bucket, a few lines of Python with `boto3`:

```python
import boto3

s3 = boto3.client(
    "s3",
    endpoint_url="http://localhost:9000",
    aws_access_key_id="minioadmin",
    aws_secret_access_key="minioadmin123",
)
s3.create_bucket(Bucket="hotels")
```

---

## Step 3: FastAPI publishes the updates

```bash
pip install fastapi uvicorn aiokafka boto3
```

`producer.py`:

```python
import json
from contextlib import asynccontextmanager
from datetime import datetime

from aiokafka import AIOKafkaProducer
from fastapi import FastAPI
from pydantic import BaseModel

producer: AIOKafkaProducer | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global producer
    producer = AIOKafkaProducer(
        bootstrap_servers="localhost:9092",
        key_serializer=str.encode,
        value_serializer=lambda v: json.dumps(v).encode(),
        acks="all",
        enable_idempotence=True,
    )
    await producer.start()
    yield
    await producer.stop()


app = FastAPI(lifespan=lifespan)


class SupplierUpdate(BaseModel):
    supplier: str
    hotel_id: str
    name: str
    stars: str | None = None
    updated_at: datetime


@app.post("/supplier-updates", status_code=202)
async def publish(update: SupplierUpdate):
    await producer.send_and_wait(
        "hotel-updates",
        key=f"{update.supplier}:{update.hotel_id}",
        value=update.model_dump(mode="json"),
    )
    return {"published": True}
```

* **The key is `supplier:hotel_id`**, so every update for one hotel lands in the same partition and is read in order.
* **`acks="all"` and `enable_idempotence=True`** make the producer wait until Kafka has stored the event, without writing duplicates when it retries.
* The API returns `202` as soon as the event is safe in Kafka. The cleaning happens later, in Flink.

Run it and send a few messy updates:

```bash
uvicorn producer:app --reload

curl -X POST localhost:8000/supplier-updates -H "Content-Type: application/json" \
  -d '{"supplier":"alpha","hotel_id":"A-1","name":"  EXAMPLE GRAND DHAKA ","stars":"4*","updated_at":"2026-11-21T10:15:00Z"}'
curl -X POST localhost:8000/supplier-updates -H "Content-Type: application/json" \
  -d '{"supplier":"beta","hotel_id":"B-77","name":"example grand dhaka","stars":"4.0","updated_at":"2026-11-21T10:16:00Z"}'
curl -X POST localhost:8000/supplier-updates -H "Content-Type: application/json" \
  -d '{"supplier":"gamma","hotel_id":"G-9","name":"   ","stars":null,"updated_at":"2026-11-21T10:17:00Z"}'
```

---

## Step 4: Flink SQL cleans the stream

Open the Flink SQL client:

```bash
docker compose exec jobmanager ./bin/sql-client.sh
```

First, a table that **reads** the Kafka topic:

```sql
CREATE TABLE hotel_updates (
  supplier   STRING,
  hotel_id   STRING,
  name       STRING,
  stars      STRING,
  updated_at STRING
) WITH (
  'connector' = 'kafka',
  'topic' = 'hotel-updates',
  'properties.bootstrap.servers' = 'kafka:19092',
  'properties.group.id' = 'flink-clean',
  'scan.startup.mode' = 'earliest-offset',
  'format' = 'json',
  'json.ignore-parse-errors' = 'true'
);
```

Then a table that **writes** JSON files to MinIO, one folder per day:

```sql
CREATE TABLE clean_hotels (
  supplier STRING,
  hotel_id STRING,
  name     STRING,
  stars    INT,
  dt       STRING
) PARTITIONED BY (dt) WITH (
  'connector' = 'filesystem',
  'path' = 's3a://hotels/clean',
  'format' = 'json'
);
```

The streaming file sink only finishes a file at a **checkpoint**, so turn checkpoints on:

```sql
SET 'execution.checkpointing.interval' = '10s';
```

Now the job itself, a normal `INSERT ... SELECT` that never ends:

```sql
INSERT INTO clean_hotels
SELECT
  supplier,
  hotel_id,
  INITCAP(TRIM(name)),
  CAST(REGEXP_EXTRACT(stars, '([0-5])', 1) AS INT),
  SUBSTRING(updated_at FROM 1 FOR 10)
FROM hotel_updates
WHERE name IS NOT NULL AND TRIM(name) <> '';
```

What each line does:

* `INITCAP(TRIM(name))` turns `"  EXAMPLE GRAND DHAKA "` and `"example grand dhaka"` into the same `"Example Grand Dhaka"`.
* `REGEXP_EXTRACT(stars, '([0-5])', 1)` reads the first digit from `"4*"` or `"4.0"`. No digit gives `NULL`.
* `SUBSTRING(updated_at FROM 1 FOR 10)` takes the date part for the folder name.
* The `WHERE` drops records with an empty name, like the one from `gamma`.

The SQL client submits the job and returns. It is now running in the cluster, and you can see it on the Flink dashboard at http://localhost:8081.

---

## Step 5: See the result in MinIO

After the next checkpoint (about 10 seconds), the files appear:

```python
for obj in s3.list_objects_v2(Bucket="hotels", Prefix="clean/")["Contents"]:
    print(obj["Key"])
```

```text
clean/dt=2026-11-21/part-...-0-0
```

Each line in the file is one clean record:

```json
{"supplier":"alpha","hotel_id":"A-1","name":"Example Grand Dhaka","stars":4}
{"supplier":"beta","hotel_id":"B-77","name":"Example Grand Dhaka","stars":4}
```

The partition column `dt` is not repeated inside the file, because it is already in the folder name. Send more updates through FastAPI, and new lines appear after each checkpoint, without restarting anything.

---

## Things to know before production

* **Checkpoints need durable storage.** Here they stay inside the containers. In production, point the checkpoint directory (`execution.checkpointing.dir` in Flink 1.20) at S3, so a restarted cluster can recover.
* **Small files add up.** A checkpoint every 10 seconds writes many small files. Use a longer interval or a compaction step for real data.
* **Bad records deserve a home.** `json.ignore-parse-errors` silently drops broken JSON. For supplier data you usually want a second sink for rejected records, so you can report them.
* **Schema changes happen.** When a supplier adds a field, a schema registry (Avro or JSON Schema) stops one producer from breaking every consumer.

---

## Summary

* **Kafka** is the buffer: durable, ordered per key, and patient when consumers are slow.
* **Flink SQL** turns cleaning rules into a query that never stops running.
* **MinIO** gives you S3 on a laptop, so the same job can move to the cloud unchanged.
* **Docker Compose** puts the whole pipeline in one file you can start with one command.

The same shape scales from three curl commands to millions of supplier updates a day. Only the sizes change: more partitions, more task slots, and real S3 at the end.
