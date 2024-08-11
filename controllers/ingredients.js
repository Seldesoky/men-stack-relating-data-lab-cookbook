const express = require('express');
const router = express.Router();
const Ingredient = require('../models/ingredient.js');
const Recipe = require('../models/recipe.js');

// Index: Show all ingredients owned by the logged-in user and identify unused ingredients
router.get('/', async (req, res) => {
  try {
    const ingredients = await Ingredient.find({ owner: req.session.user._id });
    const recipes = await Recipe.find({ owner: req.session.user._id }).populate('ingredients');
    const usedIngredientIds = new Set();
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        usedIngredientIds.add(ingredient._id.toString());
      });
    });

    const unusedIngredients = ingredients.filter(
      ingredient => !usedIngredientIds.has(ingredient._id.toString())
    );

    res.render('ingredients/index.ejs', { ingredients, recipes, unusedIngredients });
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

// Create: Add a new ingredient
router.post('/', async (req, res) => {
  try {
    const existingIngredient = await Ingredient.findOne({
      name: req.body.name.trim(),
      owner: req.session.user._id
    });

    if (existingIngredient) {
      return res.send('Ingredient already exists.');
    }

    const newIngredient = new Ingredient({
      name: req.body.name.trim(),
      owner: req.session.user._id
    });

    await newIngredient.save();
    res.redirect('/ingredients');
  } catch (err) {
    console.log(err);
    res.redirect('/ingredients/new');
  }
});

// Edit: Show form to edit an ingredient
router.get('/:ingredientId/edit', async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({ _id: req.params.ingredientId, owner: req.session.user._id });
    if (ingredient) {
      res.render('ingredients/edit.ejs', { ingredient });
    } else {
      res.redirect('/ingredients'); 
    }
  } catch (err) {
    console.log(err);
    res.redirect('/ingredients');
  }
});

// Update: Update the ingredient in the database
router.put('/:ingredientId', async (req, res) => {
  try {
    const ingredient = await Ingredient.findOneAndUpdate(
      { _id: req.params.ingredientId, owner: req.session.user._id },
      req.body,
      { new: true }
    );
    if (ingredient) {
      res.redirect(`/ingredients/${req.params.ingredientId}`);
    } else {
      res.redirect('/ingredients');
    }
  } catch (err) {
    console.log(err);
    res.redirect('/ingredients');
  }
});

// Delete: Delete an ingredient from the database
router.delete('/:ingredientId', async (req, res) => {
  try {
    const ingredient = await Ingredient.findOneAndDelete({ _id: req.params.ingredientId, owner: req.session.user._id });
    if (ingredient) {
      await Recipe.updateMany(
        { ingredients: req.params.ingredientId, owner: req.session.user._id },
        { $pull: { ingredients: req.params.ingredientId } }
      );
      res.redirect('/ingredients');
    } else {
      res.redirect('/ingredients');
    }
  } catch (err) {
    console.log(err);
    res.redirect('/ingredients');
  }
});

module.exports = router;
