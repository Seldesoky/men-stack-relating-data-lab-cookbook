const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const Recipe = require('../models/recipe.js');

// Index: Show all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'username');
    res.render('users/index.ejs', { users });
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

// Show: Display a specific user's profile and their recipes
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.redirect('/users');
    }

    const recipes = await Recipe.find({ owner: user._id }).populate('ingredients');
    res.render('users/show.ejs', { user, recipes });
  } catch (err) {
    console.log(err);
    res.redirect('/users');
  }
});

module.exports = router;
