from flask import Flask
from flask import render_template
import json
import os

app = Flask(__name__)
          
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def get_data():
        data = json.load(open('combined.json', 'r'))
        return json.dumps(data)

if __name__ == "__main__":
        # app.run(debug=True)mongodb 
        app.run(host=os.getenv('IP', '0.0.0.0'),port=int(os.getenv('PORT', 8080)))
