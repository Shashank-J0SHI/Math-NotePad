from flask import Flask, Response

app = Flask(__name__)

@app.route('/authenticate')
def auth():
    return Response('hello', mimetype='text/plain')