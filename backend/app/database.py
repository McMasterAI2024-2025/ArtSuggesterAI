import pymongo
import os
from dotenv import load_dotenv 
from pymongo import MongoClient
import certifi

load_dotenv()
database_url = os.getenv("MONGODB_URI")

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

login("francis@gmail.com", 123)