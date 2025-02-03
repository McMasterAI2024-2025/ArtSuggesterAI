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
from skimage.color import rgb2lab, deltaE_cie76
from sklearn.cluster import KMeans
from similaritySearch import SimilaritySearch
import cv2
from similaritySearch import SimilaritySearch

# Color palette with RGB values
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


def saturation_filter(img): 
    img_hsv = np.array(img.convert('HSV')) # convert image to HSV then to a NumPy array

    saturation = img_hsv.reshape(-1,3)[:,1] # flatten and retrieve saturation only

    # boolean mask for top 50% highly saturated pixels 
    threshold = np.percentile(saturation, 60) 
    high_saturation_pixels = saturation >= threshold 

    return high_saturation_pixels # return boolean mask ("True" for high saturation pixels)

def rank_colours(image_name):

    colour_ids = {name: idx for idx, name in enumerate(colour_codes)}
    colour_codes_array = np.array(list(colour_codes.values()))
    colour_tree = cKDTree(colour_codes_array)
    colour_counter = Counter()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    uploads_dir = os.path.join(script_dir, "uploads")
    file_path = os.path.join(uploads_dir, image_name)

    img = Image.open(file_path).convert('RGB')
    img = img.resize((128, 128))
    img_array = np.array(img)

    # Reshape the 3D array (128x128x3) into 2D array (128*128)x3
    flattened_img_array = img_array.reshape(-1, 3)  # Flatten to (16384, 3)

    ### edge detection handling
    edge_pixels = np.vstack([
        img_array[0, :, :],                   # Top edge
        img_array[-1, :, :],                  # Bottom edge
        img_array[:, 0, :],                   # Left edge
        img_array[:, -1, :]                   # Right edge
    ])
    edge_distances, edge_indices = colour_tree.query(edge_pixels)
    edge_counter = Counter(edge_indices)
    # Determine dominant background colors
    background_threshold = 0.08 * len(edge_pixels)  # Threshold for background exclusion
    background_colors = [
        idx for idx, count in edge_counter.items() if count > background_threshold
    ]
    # Map background color indices to actual color names
    background_color_names = [list(colour_ids.keys())[idx] for idx in background_colors]
    print("Background colors:", background_color_names)
    ###

    # Querey all pixels for colour mapping
    distances, indices = colour_tree.query(flattened_img_array)


    # retrieve boolean mask for highly saturated pixels (true if high saturation)
    high_saturation_pixels = saturation_filter(img)
    # filter pixels by saturation using boolean mask
    high_saturation_indices = indices[high_saturation_pixels]

    # Count occurrences, excluding background colors
    for idx in high_saturation_indices:
        if idx not in background_colors:
            closest_colour = list(colour_codes.keys())[idx]
            colour_counter[closest_colour] += 1

    # Sort colors by frequency
    ranked_colour_ids = [colour_ids[colour] for colour, _ in colour_counter.most_common()]

    if len(ranked_colour_ids) < 5:
        ranked_colour_ids += [ranked_colour_ids[0]] * (5 - len(ranked_colour_ids))

    # Reverse the colour_ids mapping
    reverse_colour_ids = {v: k for k, v in colour_ids.items()}
    ranked_colours = [reverse_colour_ids.get(colour_index) for colour_index in ranked_colour_ids]

    return ranked_colours[:5]


test_image = "m1.jpeg"
print(test_image, ": ", rank_colours(test_image), "\n")

test_image = "p1.jpg"
print(test_image, ": ", rank_colours(test_image), "\n")

test_image = "p3.jpg"
print(test_image, ": ", rank_colours(test_image), "\n")

test_image = "p5.jpg"
print(test_image, ": ", rank_colours(test_image), "\n")

test_image = "p7.jpeg"
print(test_image, ": ", rank_colours(test_image), "\n")

test_image = "p8.jpeg"
print(test_image, ": ", rank_colours(test_image), "\n")

test_image = "p9.jpeg"
print(test_image, ": ", rank_colours(test_image), "\n")



def processUserImage(image_name,fixed_color_list):
    # Get the current script's directory
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

    for e in he_medium:
        processed_image.append(e)

    print(processed_image)

    # Find 5 most prominent colours
    colour_ranks = rank_colours(image_name)


    top_colours = np.array(colour_ranks).flatten()

    for col in top_colours:
        processed_image.append(col)

    for i in range(7):
        processed_image.append(0)

    SimilaritySearch(processed_image)

