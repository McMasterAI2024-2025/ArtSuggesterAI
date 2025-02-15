from flask import Flask, request, jsonify, send_file, abort
import os
from flask_cors import CORS
from processUserImage import processUserImage, get_info
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np
from collections import Counter
from scipy.spatial import cKDTree
from PIL import Image
from sklearn.cluster import KMeans
from skimage.color import rgb2lab, deltaE_cie76
from similaritySearch import SimilaritySearch
from scipy.spatial.distance import cdist
from database import addUser, login, updateFavStyle, removeFavStyle, addFavImage, removeFavImage


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Find/create upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Set the folder where files (images) will be uploaded to
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Root route for backend page
@app.route("/")
def main():
    return {"message": "Welcome to the file upload server!"}

# Initial file upload
@app.route('/uploadFile', methods=['POST'])
def upload_file():
    # Ensure the request has a file attached
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    # Get the file name
    file = request.files['file']

    # No empty name files
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save the file to the directory
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, file_path)

    initial_dic = get_info(file_path)
    
    return jsonify(initial_dic), 200

@app.route('/confirmInfo', methods=['POST'])
def confirm_info():
    fixed_dict = request.json  # Get the data from the request
    processUserImage(fixed_dict)
    
    return jsonify("Images Added!"), 200




# Directory for suggested images
SUGGESTED_IMAGES_DIR = 'returnImages'
if not os.path.exists(SUGGESTED_IMAGES_DIR):
    os.makedirs(SUGGESTED_IMAGES_DIR)

##Route to send favourite images to frontend
@app.route('/suggestedImages/<int:id>', methods=['GET'])
def get_images(id):
    try:
        # Get the list of images in the directory
        image_array = sorted(os.listdir(SUGGESTED_IMAGES_DIR))

        # Check if the requested index exists
        if id < 0 or id >= len(image_array):
            return jsonify({"error": "Image ID out of range"}), 404

        # Construct the file path
        image_to_send = image_array[id]
        file_path = os.path.join(SUGGESTED_IMAGES_DIR, image_to_send)

        file_path = os.path.join(SUGGESTED_IMAGES_DIR, image_to_send)
        print("Trying to serve file:", file_path)


        # Serve the image file
        return send_file(file_path)

    except Exception as e:
        return jsonify({"error": str(e)}), 500



##Route to login
@app.post('/registerUser/<email>/<password>')
def register(email, password):
    call = addUser(email, password)
    #print(call)
    if call == None:
        return jsonify("Error: email already taken"), 500
    print("register works")
    return jsonify ("User added successfully"), 200

@app.post('/login/<email>/<password>')
def userLogin(email, password):
    call = login(email, password)
    if call == None:
        return jsonify("Error: login unsuccessful"), 500
    return jsonify ("Logged in successfully"), 200

@app.post('/updateFavStyle/<email>/<password>/<style>')
def updateFavouriteStyle(email,password,style):
    call = updateFavStyle(email,password,style)
    if call == None:
        return("Error: favourite style failed to update"), 500
    return jsonify ("Style favourited succesfully"), 200

@app.post('/removeFavStyle/<email>/<password>')
def removeFavouriteStyle(email,password):
    call = removeFavStyle(email,password)
    if call == None:
        return("Error: Style failed to unfavourite"), 500
    return jsonify ("Style Unfavourited succesfully"), 200

@app.post('/addFavImage/<email>/<password>/<img>')
def addFavouriteImage(email,password,img):
    call = addFavImage(email,password,img)
    if call == None:
        return("Error: Failed to add image to favourites"), 500
    return jsonify ("Image added to favourites"), 200

@app.post('/removeFavImage/<email>/<password>/<img>')
def removeFavouriteImage(email,password,img):
    call = removeFavImage(email,password,img)
    if call == None:
        return("Error: Failed to remove image from favourites"), 500
    return jsonify ("Image removed from favourites"), 200

# Run program
if __name__ == "__main__":
    app.run(debug=True)
