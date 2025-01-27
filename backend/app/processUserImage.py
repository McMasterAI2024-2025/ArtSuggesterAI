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
    "green_normal": (0, 128, 0),
    "blue_normal": (0, 0, 255),
    "yellow_normal": (255, 255, 0),
    "orange_normal": (255, 165, 0),
    "purple_normal": (128, 0, 128),
    "pink_normal": (255, 192, 203),
    "brown_normal": (165, 42, 42),
    "gray_normal": (128, 128, 128),
    "cyan_normal": (0, 255, 255),
    "magenta_normal": (255, 0, 255),
    "lime_normal": (0, 255, 0),
    "teal_normal": (0, 128, 128),
    "navy_normal": (0, 0, 128),
    "white": (255,255,255)
}

def rank_colours_clustering(image_name):
    colour_ids = {name: idx for idx, name in enumerate(colour_codes)}
    colour_codes_array = np.array(list(colour_codes.values()))
    colour_tree = cKDTree(colour_codes_array)
    colour_counter = Counter()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    uploads_dir = os.path.join(script_dir, "uploads")
    file_path = os.path.join(uploads_dir, image_name)

    img = Image.open(file_path).convert('RGB')
    img = img.resize((128, 128))
    img_array = np.array(img).reshape(-1, 3)  # Flatten to (16384, 3)

    # Dynamic clustering using KMeans
    n_clusters = 8  # Number of clusters for dominant colors
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    kmeans.fit(img_array)
    cluster_centers = kmeans.cluster_centers_
    cluster_labels = kmeans.labels_

    # Map cluster centers to the nearest predefined colors
    distances, indices = colour_tree.query(cluster_centers)

    # Determine dominant background colors from edges
    edge_pixels = np.vstack([
        img_array[:128],                   # Top edge
        img_array[-128:],                  # Bottom edge
        img_array[::128],                  # Left edge
        img_array[127::128]                # Right edge
    ])
    edge_distances, edge_labels = colour_tree.query(edge_pixels)
    edge_counter = Counter(edge_labels)

    # Identify background colors
    background_threshold = 0.1 * len(img_array)  # Threshold for background exclusion, 10% of total pixels
    background_colors = [
        idx for idx, count in edge_counter.items() if count > background_threshold
    ]

    # Count occurrences of each color cluster, excluding background
    for label in cluster_labels:
        if indices[label] not in background_colors:
            closest_colour = list(colour_codes.keys())[indices[label]]
            colour_counter[closest_colour] += 1

    # Sort colors by frequency
    ranked_colour_ids = [colour_ids[colour] for colour, _ in colour_counter.most_common()]

    if len(ranked_colour_ids) < 5:
        ranked_colour_ids += [ranked_colour_ids[0]] * (5 - len(ranked_colour_ids))

    # Reverse the colour_ids mapping
    reverse_colour_ids = {v: k for k, v in colour_ids.items()}
    ranked_colours = [reverse_colour_ids.get(colour_index) for colour_index in ranked_colour_ids]

    return ranked_colours[:5]


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
    img_array = img_array.reshape(-1, 3)  # Flatten to (16384, 3)

    edge_pixels = np.vstack([
        img_array[:128],                   # Top edge
        img_array[-128:],                  # Bottom edge
        img_array[::128],                  # Left edge
        img_array[127::128]                # Right edge
    ])

    edge_distances, edge_indices = colour_tree.query(edge_pixels)
    edge_counter = Counter(edge_indices)

    # Determine dominant background colors
    background_threshold = 0.1 * len(img_array)  # Threshold for background exclusion
    background_colors = [
        idx for idx, count in edge_counter.items() if count > background_threshold
    ]

    # Querey all pixels for colour mapping
    distances, indices = colour_tree.query(img_array)

    # Count occurrences, excluding background colors
    for idx in indices:
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


# processUserImage("ob1.jpg")

def rank_colours_original(image_name):

    colour_ids = {name: idx for idx, name in enumerate(colour_codes)}

    # Convert the colour_codes dict to a numpy array for faster computation
    colour_codes_array = np.array(list(colour_codes.values()))

    # Build a k-d tree for fast nearest neighbor search
    colour_tree = cKDTree(colour_codes_array)
    colour_counter = Counter()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    uploads_dir = os.path.join(script_dir, "uploads")
    file_path = os.path.join(uploads_dir, image_name)

    img = Image.open(file_path).convert('RGB')
    img = img.resize((128, 128))
    img_array = np.array(img)  # Convert to NumPy array

    # Reshape the 3D array (128x128x3) into 2D array (128*128)x3
    img_array = img_array.reshape(-1, 3)  # Flatten to (16384, 3)

    # Calculate the squared distance for each pixel to every color in the colour_codes
    distances, indices = colour_tree.query(img_array)  # Query all pixels at once

    # For each pixel, increment the count for the closest color
    for idx in indices:
        closest_colour = list(colour_codes.keys())[idx]
        colour_counter[closest_colour] += 1

    # Sort the colours by frequency (most common first)
    ranked_colour_ids = [colour_ids[colour] for colour, _ in colour_counter.most_common()]

    if len(ranked_colour_ids) < 5:
        # If fewer than 5 colours, repeat the most common colours to fill up the list
        ranked_colour_ids += [ranked_colour_ids[0]] * (5 - len(ranked_colour_ids))

    for i in range(len(ranked_colour_ids)):
        # Reverse the colour_ids mapping
        reverse_colour_ids = {v: k for k, v in colour_ids.items()}

        # Example: if 23 is the most common colour
        colour_index = ranked_colour_ids[i]
        ranked_colour_ids[i] = reverse_colour_ids.get(colour_index)

    return ranked_colour_ids[:5]


# print(rank_colours("IMG_0058.jpg"))

test_image = "IMG_0058.jpg"

print(rank_colours(test_image))
print(rank_colours_clustering(test_image))
print(rank_colours_original(test_image))
