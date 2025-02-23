from flask import Flask, request, jsonify, send_file
import os
from flask_cors import CORS
from processUserImage import processUserImage, get_info
from database import addUser, login, updateFavStyle
from flask_pymongo import PyMongo
import gridfs
from werkzeug.utils import secure_filename
from bson import ObjectId
from io import BytesIO
import shutil
import base64

app = Flask(__name__)
CORS(app, expose_headers=["X-Filename"])  # Enable CORS for all routes

MONGODB_URI = "mongodb+srv://j:j@cluster0.jry9m.mongodb.net/artSuggester?retryWrites=true&w=majority"

app.config["MONGO_URI"] = MONGODB_URI
mongo = PyMongo(app)

# Use the correct database
db = mongo.db  # This automatically connects to the default database in the URI
fs = gridfs.GridFS(db)  # GridFS instance for handling images
collection = db["users"]  # Reference to the users collection




# Find/create upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Directory for suggested images
SUGGESTED_IMAGES_DIR = 'returnImages'
if not os.path.exists(SUGGESTED_IMAGES_DIR):
    os.makedirs(SUGGESTED_IMAGES_DIR)

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
    
    # Clear the SUGGESTED_IMAGES_DIR directory
    if os.path.exists(SUGGESTED_IMAGES_DIR):
        shutil.rmtree(SUGGESTED_IMAGES_DIR)  # Remove the directory and its contents
    os.makedirs(SUGGESTED_IMAGES_DIR)  # Recreate the directory

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

##Route to send favourite images to frontend
@app.route('/suggestedImages/<int:id>', methods=['GET'])
def get_images(id):
    try:
        image_array = sorted(os.listdir(SUGGESTED_IMAGES_DIR))

        if id < 0 or id >= len(image_array):
            return jsonify({"error": "index out of range"}), 404
        
        image_to_send = image_array[id]
        file_path = os.path.join(SUGGESTED_IMAGES_DIR, image_to_send)

        response = send_file(file_path)
        response.headers['X-Filename'] = image_to_send
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/getSuggestedImagesLength', methods=['GET'])
def get_images_length():
    try:
        image_array = sorted(os.listdir(SUGGESTED_IMAGES_DIR))
        return jsonify({"length": len(image_array)}), 200
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



@app.route('/addFavImage', methods=['POST'])
def add_fav_image():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        filename = data.get("filename")

        if login(email, password) != "Success":
            return jsonify({"error": "Unauthorized"}), 403
        
        image_path = os.path.join(SUGGESTED_IMAGES_DIR, filename)
        
        if not os.path.exists(image_path):
            return jsonify({"error": "Image not found"}), 404
        
        with open(image_path, "rb") as f:
            file_id = fs.put(f, filename=filename, user_email=email)

        return jsonify({"message": "Favourite added", "file_id": str(file_id)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/removeFavImage', methods=['POST'])
def remove_fav_image():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        filename = data.get("filename")

        # Authenticate user
        if login(email, password) != "Success":
            return jsonify({"error": "Unauthorized"}), 403

        # Find and delete the file from GridFS
        fav_file = fs.find_one({"filename": filename, "user_email": email})

        if fav_file:
            fs.delete(fav_file._id)
            return jsonify({"message": "Favourite removed"}), 200
        else:
            return jsonify({"error": "Image not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.get('/getFavImages')
def get_fav_images():
    try:
        # Get email & password from query parameters
        email = request.args.get("email")
        password = request.args.get("password")
        # Authenticate user
        if login(email, password) != "Success":
            return jsonify({"error": "Invalid login"}), 403

        # Find all favourite images stored in GridFS for this user
        print("retrieving favs! ",email)
        fav_images = fs.find({"user_email": email})
        print("this is fav ",fav_images)
        images = []
        for file in fav_images:
            print("file = ",file)
            # Read the file from GridFS
            image_data = file.read()
            
            # Convert image data to Base64
            encoded_image = base64.b64encode(image_data).decode("utf-8")
            
            images.append({
                "filename": file.filename,
                "file_id": str(file._id),
                "image_data": f"data:image/jpeg;base64,{encoded_image}"  # Frontend-ready Base64 string
            })

        return jsonify({"favourites": images}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.get('/serveImage/<file_id>')
def serve_image(file_id):
    try:
        file_data = fs.get(ObjectId(file_id))
        return send_file(BytesIO(file_data.read()), mimetype="image/jpeg")
    except gridfs.errors.NoFile:
        return jsonify({"error": "Image not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)
