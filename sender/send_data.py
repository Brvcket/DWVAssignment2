import csv
import json
import time
import requests
import os
from datetime import datetime

URL = "http://server:5000/receive"
SENT_TIMESTAMPS_FILE = "sent_timestamps.txt"

def load_and_send(filename):
    sent_timestamps = load_sent_timestamps()

    with open(filename, newline='') as f:
        reader = csv.DictReader(f)
        data = sorted(reader, key=lambda row: int(row['Timestamp']))

    start_timestamp = int(data[0]['Timestamp'])
    real_start = time.time()

    for row in data:
        current_timestamp = int(row['Timestamp'])
        
        if current_timestamp in sent_timestamps:
            continue

        delay = current_timestamp - start_timestamp
        now = time.time()
        wait_time = delay - (now - real_start)
        if wait_time > 0:
            time.sleep(wait_time)

        payload = {
            'ip': row['ip address'],
            'latitude': float(row['Latitude']),
            'longitude': float(row['Longitude']),
            'timestamp': current_timestamp,
            'suspicious': int(float(row['suspicious']))
        }

        try:
            response = requests.post(URL, json=payload)
            if response.status_code == 200:
                sent_timestamps.add(current_timestamp)
                save_sent_timestamps(sent_timestamps)
        except Exception as e:
            print(f"Failed to send data: {e}")

def load_sent_timestamps():
    if os.path.exists(SENT_TIMESTAMPS_FILE):
        with open(SENT_TIMESTAMPS_FILE, "r") as f:
            return set(map(int, f.read().splitlines()))
    return set()

def save_sent_timestamps(timestamps):
    with open(SENT_TIMESTAMPS_FILE, "w") as f:
        f.write("\n".join(map(str, timestamps)))

if __name__ == "__main__":
    load_and_send("/data/ip_addresses.csv")
