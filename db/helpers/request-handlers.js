const db = require('../models');

const client = require("twilio")(
    process.env.ACCOUNT_SID,
    process.env.AUTH_TOKEN
);
require('dotenv').config();

const errorHandler = (req, res, err) => {
    console.error(err);
    if (err.message === 'Validation error') {
        return res.send(401, 'already exists');
    } if (err.message === 'Cannot read property \'_modelAttribute\' of undefined') {
        return res.send(201, 'No events found');
    }
    return res.send(500, 'Something went wrong on our part'); 
}; 

const requestHandler = {

    /**
     * createUser: a test function to test if we can successfully query/create a user in
     * our database via postman
     * @param {object} req: the incoming request message 
     * @param {object} res: the outcoming response message
     */

    createUser(req, res){
        const newUser = req.body;
        db.User.create(newUser)
            .then((returnedUser) => { 
                res.send('created!')
                console.log('created');
            })
            .catch(err => errorHandler(req, res, err));
    },

    /*
  signup
  on POST /signup
  expects:
    req.body: JSON => { "username", "password" }
  if username in db: 401
  else on creation: login, send 200, {username, id}
  */
    signup(req, res, next) {
        const newUser = {};
        Object.assign(newUser, req.body.props);
        Object.assign(newUser, req.body.user);
        newUser.radius = 30;
        newUser.update_interval = 24;
        db.User.create(newUser) 
            .then((returnedUser) => {
                req.login({ username: returnedUser.username, id: returnedUser.id }, (err) => {
                    if (err) return next(err);
                    console.log('loggedin') 
                    return res.json(201, {
                        username: returnedUser.username,
                        id: returnedUser.id,
                    });
                });
                console.log('created');
            })
            .catch(err => errorHandler(req, res, err));
    },

    /**
     * login: logs a user in that has an existing account 
     * @param {object} req: the incoming request message
     * @param {object} res: the outcoming response message
     */

    login(req, res, next) {
    db.User.findOne({ where: { email: req.body.username } }) 
      .then((foundUser) => {
        // console.log(foundUser); 
        res.send(foundUser);
      }).catch((err) => console.log(err))
  }, 
/**
    * createGroup: creates a new group for an exisitng user
    * @param {object} req: the incoming request message
    * @param {object} res: the outcoming response message
    */
    createGroup(req, res, next){
        let newGroup = {};
        Object.assign(newGroup, req.body.userData);
        Object.assign(newGroup, req.body.group);

        newGroup.id_user_creator = newGroup.id;
        delete newGroup.id;
        db.Group.create(newGroup) 
            .then((group)=>{
                // console.log(group);
                let groupMember = {
                    'id_user': group.id_user_creator,
                    'id_group': group.id,
                    "UserId": group.id_user_creator,
                    "GroupId": group.id
                }
                return db.UserGroup.create(groupMember);
            }).catch(err => errorHandler(req, res, err));  
   }, 
/**
 * joinGroup: allows an exisitng user to join a group
 * @param {object} req: the incoming request message
 * @param {object} res: the outcoming response message
 */
    joinGroup(req, res, next){
        let group = req.body.group;
        let user = req.body.user;
        db.Group.findOne({ where: { name: group.groupName, passcode: group.passcode } })
            .then((group)=>{
                res.send(group) 
                console.log(group)
                let groupMember = {
                    'id_user': user.id,
                    'id_group': group.id,
                    "UserId": user.id,
                    "GroupId": group.id
                }
                return db.UserGroup.create(groupMember);
            }).then(() => console.log('added to group')).catch(err => errorHandler(req, res, err));  
   }, 
   /**
    * @function upload
    * @param {object} req 
    * @param {object} res 
    * @param {function} next
    * this function takes the body of the req param, that should
    * be an object with id_user and url_video as properties and saves
    * them to the database, and sends back the status code and the url 
    */
    upload(req, res, next) {
        console.log(req.body);
        if (req.body.id_user && req.body.url_video) {
            res.header("Content-Type", "application/json");
            client.messages
              .create({
                from: process.env.TWILIO_NUMBER,
                to: 15043390763,
                body: `Guardian App Alert ${req.body.url_video}`
              })
              .then(() => {
                res.send(JSON.stringify({ success: true }));
              })
              .catch(err => {
                console.log(err);
                res.send(JSON.stringify({ success: false }));
              });

            const newPanic = {};
            Object.assign(newPanic, req.body.id_user);
            Object.assign(newPanic, req.body.url_video);
            db.Panic.create(req.body).then((createdPanic) => {
                res.status(201).send(createdPanic.url_video);
            }).catch((e) => {
                res.status(401).send(e.message);
            })
        } else {
            res.status(400).send('bad request');
        }
    },

    async getMyGroups(req, res){
        let myId = req.params.id;
        db.UserGroup.findAll({ where: { id_user: myId} })
            .then( async (groups)=>{
                // console.log(groups);
                let myGroups = groups.map((group)=>{
                return group.id_group;
                })
                let allGroups = await db.Group.findAll({ where: { id: myGroups } });
                res.json(allGroups);
                return allGroups;
            }).then(() => console.log('groups sent')) 
            .catch(err => errorHandler(req, res, err));  
        
    }

}

module.exports = requestHandler;
