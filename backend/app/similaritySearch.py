#Iain and Ryan 
#NOTES: there are lots of duplicate images
# 

import numpy as np
from scipy.spatial.distance import cdist
from PIL import Image
import os
import uuid

import pymongo
from dotenv import load_dotenv 
from pymongo import MongoClient
import certifi

MONGODB_URI = "mongodb+srv://j:j@cluster0.jry9m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

load_dotenv()
#database_url = os.getenv("MONGODB_URI")
database_url = MONGODB_URI
cluster = MongoClient(database_url)
db = cluster["artSuggester"]
collection = db["users"]

def SimilaritySearch(input_array,email):
    def getFavStyle(email: str):
        user = collection.find_one({"email": email})
        if user:
            return user.get("favStyle", "FavStyle not found")
        return "User not found"
    userfavstyle = getFavStyle(email)
    print('this is fav style from user db ',userfavstyle)

    # get the current script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # unique identifier for set of images
    identifier = str(uuid.uuid4())
    
    # load preprocessed image data from file
    data_base = os.path.join(script_dir, "data_np_3.npz")
    loaded = np.load(data_base)
    data_np = loaded['arr_0']
    
    array_of_arrays = data_np
    input_array = np.array(input_array)

    # filter arrays where the first three elements match
    last_index_value = input_array[0:3]
    print(last_index_value)
    filtered_arrays = array_of_arrays[np.all(array_of_arrays[:, 49152:49155] == last_index_value, axis=1)]

    if len(filtered_arrays) == 0:
        print("No arrays match the condition on the last index.")
    else:
        # extract the portion of the input array after the first three elements
        input_subarray = input_array[3:]
        print("this is input subarray ", input_subarray)

        # extract the portion of filtered arrays starting after the first three elements
        filtered_subarrays = filtered_arrays[:, 49155:]
        print("Filtered sub", filtered_subarrays[0])

        def find_similar_images(input_colors, image_color_lists, top_n=5):
            # Calculate similarity scores for each image
            similarity_scores = [(index, image, 0) for index, image in enumerate(image_color_lists)]
            
            for color in input_colors:
                for i, (index, image, score) in enumerate(similarity_scores):
                    # Update similarity scores based on color positions
                    if color == image[0]:
                        score += 5
                        similarity_scores[i] = (index, image, score)
                    elif color == image[1]:
                        score += 4
                        similarity_scores[i] = (index, image, score)
                    elif color == image[2]:
                        score+=3
                        similarity_scores[i] = (index, image, score)
                    elif color == image[3]:
                        score += 2
                        similarity_scores[i] = (index, image, score)
                    elif color == image[4]:
                        score += 1
                        similarity_scores[i] = (index, image, score)
                    # future implementation where it suggests more of your favorite style
                    # if np.array_equal(image[-7:], np.array(userfavstyle)):
                    #     score += 0.5
                    #     similarity_scores[i] = (index, image, score)

            
            # Sort by scores in descending order
            similarity_scores.sort(key=lambda x: x[2], reverse=True)
            
            # Filter to ensure unique images
            unique_images = set()
            filtered_scores = []
            
            for index, image, score in similarity_scores:
                image_tuple = tuple(image)  # Convert to tuple for uniqueness check
                if image_tuple not in unique_images:
                    unique_images.add(image_tuple)
                    filtered_scores.append((index, image, score))
                
                # Ensure we get exactly `top_n` unique images
                if len(filtered_scores) == top_n:
                    break
            
            return filtered_scores

        # further filter for the first 5 colors
        more_filtered_subarrays = filtered_subarrays#[:, :5]
        more_input_subarray = input_subarray[:5]
        print("More filtered subarray", more_filtered_subarrays)

        # find the top 5 most similar arrays
        top_arrays = find_similar_images(more_input_subarray, more_filtered_subarrays, top_n=12)
        print('')
        print("filtered input subarray", more_input_subarray)
        print('')
        print(f"Filtered Arrays: \n{filtered_arrays}")
        print(f"Most Similar Arrays!:\n {top_arrays}")

        # resolve the top matches to their original arrays
        favsstyles = []
        for ind in range(len(top_arrays)):
            favsstyles.append(filtered_arrays[top_arrays[ind][0]][-7:])
            top_arrays[ind] = filtered_arrays[top_arrays[ind][0]]
        i = 1
    for PixelImage in top_arrays:
        # use only the first 49152 values for RGB data
        PixelImage = PixelImage[:49152]
        image_size = (128, 128, 3)  # define shape for RGB images
        image_data = PixelImage.reshape(image_size)

        # unnormalize the image data
        if image_data.max() > 255 or image_data.min() < 0:
            image_data = ((image_data - image_data.min()) / (image_data.max() - image_data.min()) * 255).astype(np.uint8)

        # convert array to image
        image = Image.fromarray(image_data, 'RGB')

        # save the image
        output_folder = "returnImages"
        os.makedirs(output_folder, exist_ok=True)  # create the folder if it doesn't exist
        styleofimage = ''.join(map(str, favsstyles[i-1]))
        output_path = os.path.join(output_folder, f"{styleofimage}{identifier}_{i}.png")
        image.save(output_path)

        print(f"name is {identifier}_{i}.png")
        print(f"Image saved to {output_path}")
        i += 1

# SimilaritySearch([0,0,1,4,4,4,5,5,0,0,0,0,0,0,0])
