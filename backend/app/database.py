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
        collection.insert_one({"email": email, "password": password, "favourites": [], "favStyle": [0,0,0,0,0]}) 
        return ("Added")
    return None

##Try to login
def login(email: str, password: str):
    userExists = collection.find_one({"email": email})
    if userExists == None:
        return None
    realPassword = userExists["password"]
    if realPassword != password:
        return None
    return ("Success")

#login("francis@gmail.com", 123)

##Get favourites
def getFavs(email: str):
    userExists = collection.find_one({"email": email})
    if userExists == None:
        return None
    favourites = userExists["favourites"]
    return(favourites)

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

def addFavImage(email: str, password: str, img: int):
    if login(email,password) == "Success":
        collection.update_one({"email": email}, {"$push": {"favourites": img}})
        return ("Favourite image added")
    return None

def removeFavImage(email: str, password: str, img: int):
    if login(email,password) == "Success":
        imgExists = collection.find_one({"email": email, "favourites": {"$in": [img]}})
        if imgExists == None: 
            return None
        collection.update_one({"email": email}, {"$pull": {"favourites": img}})
        return ("Image removed from favourites")
    return None

#addFavImage("francis@gmail.com","ChrisPChicken" , [0,1,1,0,0])
#removeFavImage("francis@gmail.com","ChrisPChicken" , [0,1,1,0,0])
