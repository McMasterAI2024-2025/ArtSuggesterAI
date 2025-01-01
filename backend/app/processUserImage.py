import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np
import os
from collections import Counter
from scipy.spatial import cKDTree
from PIL import Image
from skimage.color import rgb2lab
from sklearn.cluster import KMeans
from skimage.color import rgb2lab, deltaE_cie76
from sklearn.cluster import KMeans
from collections import Counter
import cv2
from similaritySearch import SimilaritySearch



def rank_colours(image_name):
    # dictionary of colour codes
    colour_codes = {
        "red_normal": (255, 0, 0),
        "red_dark": (139, 0, 0),
        "red_light": (255, 102, 102),
        "green_normal": (0, 128, 0),
        "green_dark": (0, 100, 0),
        "green_light": (144, 238, 144),
        "blue_normal": (0, 0, 255),
        "blue_dark": (0, 0, 139),
        "blue_light": (173, 216, 230),
        "yellow_normal": (255, 255, 0),
        "yellow_dark": (204, 204, 0),
        "yellow_light": (255, 255, 153),
        "orange_normal": (255, 165, 0),
        "orange_dark": (255, 140, 0),
        "orange_light": (255, 200, 102),
        "purple_normal": (128, 0, 128),
        "purple_dark": (75, 0, 130),
        "purple_light": (216, 191, 216),
        "pink_normal": (255, 192, 203),
        "pink_dark": (255, 105, 180),
        "pink_light": (255, 182, 193),
        "brown_normal": (165, 42, 42),
        "brown_dark": (101, 67, 33),
        "brown_light": (222, 184, 135),
        "gray_normal": (128, 128, 128),
        "gray_dark": (105, 105, 105),
        "gray_light": (211, 211, 211),
        "cyan_normal": (0, 255, 255),
        "cyan_dark": (0, 139, 139),
        "cyan_light": (224, 255, 255),
        "magenta_normal": (255, 0, 255),
        "magenta_dark": (139, 0, 139),
        "magenta_light": (255, 153, 255),
        "lime_normal": (0, 255, 0),
        "lime_dark": (50, 205, 50),
        "lime_light": (204, 255, 204),
        "teal_normal": (0, 128, 128),
        "teal_dark": (0, 102, 102),
        "teal_light": (128, 191, 191),
        "navy_normal": (0, 0, 128),
        "navy_dark": (0, 0, 102),
        "navy_light": (173, 216, 230),
        "white": (255,255,255)
    }

    # colour_ids dictionary maps each color name (key) from the colour_codes dictionary to an index
    colour_ids = {name: idx for idx, name in enumerate(colour_codes)}

    # convert to a numpy array for faster computation
    colour_codes_array = np.array(list(colour_codes.values()))

    # Build a k-d tree for fast nearest neighbor search
    # if a search isnt a direct hit it will go to the closest
    colour_tree = cKDTree(colour_codes_array)

    # Counter to store color frequency
    # processes the image pixel by pixel.
    # for each pixel it determines the closest color using the k-d tree.
    # the counter holds each colour and how many pixels are that certain colour
    colour_counter = Counter()


    # Create the full path to the uploaded image file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    uploads_dir = os.path.join(script_dir, "uploads")
    file_path = os.path.join(uploads_dir, image_name)


    # open the image and convert it to RGB
    img = Image.open(file_path).convert('RGB')

    # resize the image to 128x128
    img = img.resize((128, 128))

    # turn to numpy
    img_array = np.array(img)

    # reshape the 3D array (128x128x3) into 2D array (128*128)x3
    img_array = img_array.reshape(-1, 3)  # flatten to (16384, 3)
    # this is for the rgb 16384 rows and 3 columns

    # calculate distance for each pixel to every color in the colour_codes
    distances, indices = colour_tree.query(img_array)  # do all pixels at once

    # for each pixel increment the count for the closest color
    for idx in indices:
        closest_colour = list(colour_codes.keys())[idx]  # get the closest color name
        colour_counter[closest_colour] += 1  # increment the count for that color

    # sort the colours by frequency (most common first)
    ranked_colour_ids = [colour_ids[colour] for colour, _ in colour_counter.most_common()]

    # list of colors to exclude from the ranking
    # these colours are the most common background colours
    # we only want the paint bottles/pencil crayon colours
    # brown, light brown, white are some common "background" colours we do not want
    exclude_colours = [42, 24, 25, 26, 22, 23, 17]

    # filter out excluded colors
    new_ranked_colour_ids = []
    for c in ranked_colour_ids:
        if c not in exclude_colours:
            new_ranked_colour_ids.append(c)
    ranked_colour_ids = new_ranked_colour_ids

    # if fewer than 5 colours repeat the most common colours to fill up the list
    if len(ranked_colour_ids) < 5:
        ranked_colour_ids += [ranked_colour_ids[0]] * (5 - len(ranked_colour_ids))

    # for i in range(len(ranked_colour_ids)):
        # reverse the colour_ids mapping to get the color names
        # reverse_colour_ids = {v: k for k, v in colour_ids.items()}

        # get the index of the current color
        # colour_index = ranked_colour_ids[i]

        # Uncomment this line to convert indices back to color names
        # ranked_colour_ids[i] = reverse_colour_ids.get(colour_index)

    # return the top 5 ranked colour IDs (meaning indexes/integers)
    return ranked_colour_ids[:5]















def processUserImage(image_name):
    # files location
    script_dir = os.path.dirname(os.path.abspath(__file__))

    uploads_dir = os.path.join(script_dir, "uploads")
    file_path = os.path.join(uploads_dir, image_name)


    # Check for the model file
    model_path = 'models/model_80_Acc.keras'


    # Load the trained model
    model = load_model(model_path)
    print("Loaded model")


    print("\nModel input shape:", model.input_shape)

    # Define categories (same as in preprocessing)
    categories = {'markers': 0, 'pencilcrayons': 1, 'paints': 2}

    # Preprocess the image
    img = load_img(file_path, target_size=(128, 128))
    img_array = img_to_array(img)
    img_array = img_array / 255.0  # Normalize pixel values to [0, 1]
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    print("Image preprocessed successfully")

    # Confirm the batch size
    print("Batch size:", len(img_array))  # Should be 1


    # Make a prediction
    predictions = model.predict(img_array)  # Use img_array, not input_image

    # Get the predicted class index and confidence
    predicted_class = np.argmax(predictions[0])  # Index of the highest probability
    confidence = predictions[0][predicted_class]  # Probability of the prediction

    # Map the predicted class index to the class name
    predicted_label = list(categories.keys())[list(categories.values()).index(predicted_class)]

    # Output the prediction
    print(f"Predicted Label: {predicted_label}")
    print(f"Confidence: {confidence:.2f}")

    processed_image = []

    if predicted_label == "paints":
        he_medium = [0,0,1]
    elif predicted_label == "pencilcrayons":
        he_medium = [0,0,1] #0,1,0
    else:
        he_medium = [0,0,1] #1,0,0

    # adding the medium to the main array
    for e in he_medium:
        processed_image.append(e)


    # preprocess again this time for the extracting of most common colours
    img = Image.open(file_path).convert('RGB')
    img = img.resize((128, 128))
    img_array = np.array(img) 

    # Reshape the 3D array (128x128x3) into 2D array (128*128)x3
    img_array = img_array.reshape(-1, 3)  # Flatten to (16384, 3)

    # Find 5 most prominent colours
    colour_ranks = rank_colours(image_name)
    top_colours = np.array(colour_ranks[:5]).flatten() #np array


    # add colours to main array
    for col in top_colours:
        processed_image.append(col)

    # for now we just have all 0s for the style
    for i in range(7):
        processed_image.append(0)

    SimilaritySearch(processed_image)
    #finally send our array to similarity search


# processUserImage("IMG_0058.jpg")
