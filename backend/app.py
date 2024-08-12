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

model = keras.saving.load_model(r'D:\Math NotePad\backend\withunknown.keras')

def parseImage(raw):
    encoded_data = raw.split(',')[1]
    arr = np.fromstring(b64decode(encoded_data), np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

def image_preprocessing(image):
    arrim = np.array(image)
    arrim = np.expand_dims(arrim, axis=-1)
    arrim = arrim/255.
    arrim = np.array([np.array(arrim)])
    return arrim

@app.route('/recognise', methods=["GET", "POST"])
@cross_origin(origins="*")
def getImage():
    rawImage = request.json['content']
    image = parseImage(rawImage)

    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    normalized_image = cv2.normalize(gray_image, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)

    height, width = normalized_image.shape[:2]

    if (height > width):
        temp = 0
        border = height - width

        if (border % 2 != 0):
            temp = 1

        normalized_image = cv2.copyMakeBorder(normalized_image, temp, temp, int((border + temp) / 2), int((border + temp) / 2), cv2.BORDER_CONSTANT, None, 0)
    elif (width > height):
        temp = 0
        border = width - height

        if (border % 2 != 0):
            temp = 1

        normalized_image = cv2.copyMakeBorder(normalized_image, int((border + temp) / 2), int((border + temp) / 2), temp, temp, cv2.BORDER_CONSTANT, None, 0)

    img_32x32 = cv2.resize(normalized_image, dsize = (32, 32), interpolation= cv2.INTER_LANCZOS4)
    img_32x32 = cv2.bitwise_not(img_32x32)
    final = image_preprocessing(img_32x32)

    # cv2.imshow('image', img_32x32)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    Digits = ['!', '(', ')', '+', ',', '-', '0', '1', '2', '3', '4', '5', 
              '6','7', '8', '9', '=', 'Delta', '[', ']', 'alpha', 'beta', 'cos','div', 'exists',
              'forall', 'forward_slash', 'gamma', 'geq', 'gt', 'i', 'in', 'infty', 'int', 
              'leq', 'lim', 'log', 'mu', 'neq', '', 'phi', 'pi', 'sigma', 'sin', 'sqrt', 
              'sum', 'tan', 'theta', '*', '{', '}']

    prediction = ''
    mo = model.predict(final)
    if (np.max(mo) > 0.55):
        prediction = Digits[np.argmax(mo)]
    return jsonify(prediction)