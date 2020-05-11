# Blog-Project

This is a Simple Blog Project By using node.js,express.js,ejs. The main features are user authentication and you can update the post.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

To get you started you can simply clone the repository:

```
https://github.com/vedvkandge2000/Blog-Project.git
```
and install the dependencies
```
npm install
```
A number of node.js tools is necessary to initialize and test the project. You must have node.js and its package manager (npm) installed. You can get them from http://nodejs.org/. The tools/modules used in this project are listed in package.json and include express, mongodb and mongoose.


### Installing

The project uses MongoDB as a database.
mongoDB Atlas is used for data base instead of mongo shell.



To change it to mango shell just change the mongoose.connect to

```
mongoose.connet("mongodb://localhost:27017/blogDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
```
To Start mongo server type
```
mongod
```
To see database just install Robo 3T

### Run application

The project is preconfigured with a simple development web server. The simplest way to start this server is:
```
npm start
```

Another way is install nodemon and run 
```
nodemon app.js
```


### Coming features are

* Adding comment section to the post
* Deploying the website on heruko
* Like and Dislike option to blog post.


## Built With

* [Bootstrap](https://getbootstrap.com/) - The web framework used
* [npm](https://www.npmjs.com/) - Dependency Management
* [mongoose](https://mongoosejs.com/docs/api/model.html) - Used to generate database
* [ejs](https://ejs.co/#install) - Used for webpage rendering. JS framework.


## Authors

* **Vedant V. Kandge** - *Initial work* - [Vedant Kandge](https://github.com/vedvkandge2000)


