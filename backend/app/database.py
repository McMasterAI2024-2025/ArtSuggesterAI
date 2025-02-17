import pymongo
import os
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

#collection.insert_one({"email": "Iain", "password": "123127"})
#print(collection.find_one({"email": "francis@gmail.com"}))

##Printitn db because I can't login...
stuff = collection.find({})
for s in stuff:
    print (s)


##Add a user
def addUser(email: str, password: str):
    userExists = collection.find_one({"email": email})
    print(userExists)
    if userExists == None:
        collection.insert_one({
            "email": email, 
            "password": password, 
            "favourites": [], 
            "favStyle": [0,0,0,0,0]
        }) 
        return ("Added")
    return None

##Try to login
def login(email: str, password: str):
    user = collection.find_one({"email": email})
    if not user or user["password"] != password:
        return None
    return "Success"

def updateFavStyle(email: str, password: str, style: int):
    if login(email,password) == "Success":
        collection.update_one({"email": email}, {"$set": {"favStyle": style}})
        return ("FavStyle updated")
    return None


def removeFavStyle(email: str, password: str):
    if login(email,password) == "Success":
        collection.update_one({"email": email}, {"$set": {"favStyle": [0,0,0,0,0]}})
        return ("FavStyle cleared")
    return None

#updateFavStyle("francis@gmail.com","ChrisPChicken" , [0,1,1,0,0])
#removeFavStyle("francis@gmail.com","ChrisPChicken")

def getFavImages(email: str, password: str):
    print("getFavImages: ", email, "@", password, ": ", login(email, password))

    if login(email, password) == "Success":
        user = collection.find_one({"email": email}, {"favourites": 1, "_id": 0})
        if user:
            return user.get("favourites", [])
    return None
    
def addFavImage(email: str, password: str, img: str):
    if login(email, password) == "Success":
        collection.update_one({"email": email}, {"$addToSet": {"favourites": img}})
        return ("Favourite image added")
    return None

def removeFavImage(email: str, password: str, img: str):
    if login(email, password) == "Success":
        collection.update_one({"email": email}, {"$pull": {"favourites": img}})
        return ("Image removed from favourites")
    return None

#addFavImage("francis@gmail.com","ChrisPChicken" , [0,1,1,0,0])
#removeFavImage("francis@gmail.com","ChrisPChicken" , [0,1,1,0,0])
