const User = require('../models/user');
const Group = require('../models/group');
const Token = require('../models/token');
const crypto = require('crypto');
 
exports.adminSignUp = async (req, res) => {
  try {
    const { username, password, groupName, groupDescription } = req.body;

    // Check if the group already exists
    let group = await Group.findOne({ name: groupName });

    // If the group doesn't exist, create a new one
    if (!group) {
      group = new Group({
        name: groupName,
        description: groupDescription,
      });
      await group.save();
    }

    // Check if an Admin already exists with the same username
    const existingAdmin = await User.findOne({ username, role: 'Admin' });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin with this username already exists' });
    }

    // Create a new Admin user associated with the group
    const newUser = new User({
      username,
      password,
      role: 'Admin',
      group: group._id,  // Associate the user with the group
    });

    await newUser.save();
    req.flash('success', 'Admin created successfully!');
    return res.status(200).redirect('/login');
  } catch (error) {
    console.log(error)
    req.flash('error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
/*
When making a request to sign up an admin, the request body might look like this:

json
Copy code
{
  "username": "admin1",
  "password": "adminpass",
  "groupName": "Engineering Team",
  "groupDescription": "Handles all engineering tasks"
}
 */ 

exports.generateToken = async (req, res) => {
  try {
      const { groupId } = req.body;
      let token;
      let tokenExists = true;

      // Loop to ensure the token is unique
      while (tokenExists) {
          // Generate a new token
          token = crypto.randomBytes(32).toString('hex');

          // Check if the token already exists in the database
          tokenExists = await Token.findOne({ token });
      }

      // Save the unique token in the database with the associated group
      const newToken = new Token({ token, group: groupId });
      await newToken.save();

      req.flash('success', 'Token generated successfully!');
      return res.status(201).json({ token });
  } catch (error) {
      console.log(error)
      req.flash('error', 'Internal server error');
      return res.status(500).json({ error: 'Internal server error' });
  }
};


exports.registerDeveloper = async (req, res) => {
    try {
      const { username, password, token } = req.body;
  
      // Find the token in the database
      const validToken = await Token.findOne({ token });
  
      if (!validToken) {
        req.flash('error', 'Invalid or expired token');
        return res.status(400).json({ error: 'Invalid or expired token' });
      }
  
      // Create the developer user and associate with the group from the token
      const newUser = new User({
        username,
        password,
        role: 'Developer',
        group: validToken.group,
      });
  
      await newUser.save();
  
      // Delete the token after it's used
      await Token.deleteOne({ _id: validToken._id });
  
      req.flash('success', 'Developer created successfully!');
      return res.status(200).redirect('/login');
    } catch (error) {
      console.log(error)
      req.flash('error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

