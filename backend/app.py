from flask import Flask, Response, request, jsonify
from flask_cors import CORS,cross_origin
import cv2
from base64 import b64decode
import numpy as np
import keras
import tensorflow as tf

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

model = keras.saving.load_model(r'D:\Math NotePad\backend\recognition.keras')

def parseImage(raw):
    encoded_data = raw.split(',')[1]
    arr = np.fromstring(b64decode(encoded_data), np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

@app.route('/recognise', methods=["GET", "POST"])
@cross_origin(origins="*")
def getImage():
    rawImage = request.json['content']
    image = parseImage(rawImage)

    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    normalized_image = cv2.normalize(gray_image, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)
    img_20x20 = np.array(cv2.resize(normalized_image, dsize = (20,20), interpolation= cv2.INTER_LANCZOS4))
    img_28x28 = cv2.copyMakeBorder(img_20x20, 4, 4, 4, 4, cv2.BORDER_CONSTANT, None, 0)

    # cv2.imshow('image', img_28x28)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    img_28x28 = img_28x28.flatten()
    img_array  = img_28x28.reshape(1,-1)
    Digits = ['0','1','2','3','4','5','6','7','8','9']

    prediction = Digits[np.argmax(model.predict([img_array]))]
    return jsonify(prediction)