const express = require('express');
const router = express.Router();
const Recipe = require('../models/recipe.js'); 

// Index: Show all recipes associated with the logged-in user
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find({ owner: req.session.user._id }); 
    res.render('recipes/index.ejs', { recipes });
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

// New: Show form to create a new recipe
router.get('/new', (req, res) => {
  res.render('recipes/new.ejs');
});

// Create: Add a new recipe to the database
router.post('/', async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    newRecipe.owner = req.session.user._id; 
    await newRecipe.save();
    res.redirect('/recipes');
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

// Show: Show details of one recipe
router.get('/:recipeId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId).populate('ingredients');
    res.render('recipes/show.ejs', { recipe });
  } catch (err) {
    console.log(err);
    res.redirect('/recipes');
  }
});

// Edit: Show form to edit a recipe (with access control)
router.get('/:recipeId/edit', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (recipe.owner.equals(req.session.user._id)) {
      res.render('recipes/edit.ejs', { recipe });
    } else {
      res.redirect('/recipes'); 
    }
  } catch (err) {
    console.log(err);
    res.redirect('/recipes');
  }
});

// Update: Update the recipe in the database (with access control)
router.put('/:recipeId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (recipe.owner.equals(req.session.user._id)) {
      await Recipe.findByIdAndUpdate(req.params.recipeId, req.body);
      res.redirect(`/recipes/${req.params.recipeId}`);
    } else {
      res.redirect('/recipes'); 
    }
  } catch (err) {
    console.log(err);
    res.redirect('/recipes');
  }
});

// Delete: Delete a recipe from the database (with access control)
router.delete('/:recipeId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (recipe.owner.equals(req.session.user._id)) {
      await Recipe.findByIdAndDelete(req.params.recipeId);
      res.redirect('/recipes');
    } else {
      res.redirect('/recipes');
    }
  } catch (err) {
    console.log(err);
    res.redirect('/recipes');
  }
});

module.exports = router;
