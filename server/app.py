from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

received_packages = []

@app.route("/receive", methods=["POST"])
def receive_data():
    data = request.get_json()
    received_packages.append(data)
    return jsonify({"status": "ok"}), 200

@app.route("/data", methods=["GET"])
def get_data():
    return jsonify(received_packages)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
