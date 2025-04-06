# SF-Hacks2025

## Introduction
This is the project created for SFHacks 2025 - Tech For Good. This project was aimed at helping underserved communities in finding and accessing resources that they never knew were available with ease. 

## Tech Stack Used
- HTML/CSS/Vanilla Javascript
- NodeJs, ExpressJs
- MongoDB Atlas
- Gemini API

## Installation

### Cloning the repository
First, change into a folder you'd want to store this project and then,
```
git clone https://github.com/loofsan/SF-Hacks2025.git
```

Second,
We want to install all the node modules
```
npm install
```

Third,
We would want to create an environment file to put our API keys and our port and our MongoDB Atlas Cluster. 
- First, go to MongoDB Atlas and create a free cluster.
- Then, in the Clusters tab, you'll see the button __Connect__. Click on that.
- In there, select __NodeJs__ as the driver and copy the string provided there
  __Make sure to replace the <db_password> with your actual password for mongoDB Atlas__
- Then, in your root folder, create a file and name it __.env__
- In that file, place
  ```
  MONGODB_URI=<your_string>
  GEMINI_API_KEY=<your_gemini_API_key>
  PORT=<your_port [This could be anything from 3000, 8080, etc...]>
  ```

Fourth,
We would like to seed out database so that it is populated with the data. To do that, run:
```
npm run seed
```

Fifth, 
We would like to run the embedding so that we can recommend similar resources to the user. To do that, run:
```
npm run generate-embeddings
```

Finally,
```
npm run dev
```
