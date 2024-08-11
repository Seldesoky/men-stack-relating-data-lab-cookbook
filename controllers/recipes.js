const express = require('express');
const router = express.Router();
const Recipe = require('../models/recipe.js');
const Ingredient = require('../models/ingredient.js');

// Index: Show all recipes associated with the logged-in user
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find({ owner: req.session.user._id }).populate('ingredients');
    res.render('recipes/index.ejs', { recipes, success: req.query.success || null });
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

// New: Show form to create a new recipe
router.get('/new', async (req, res) => {
  try {
    const ingredients = await Ingredient.find({ owner: req.session.user._id });
    res.render('recipes/new.ejs', { ingredients });
  } catch (err) {
    console.log(err);
    res.redirect('/recipes');
  }
});

// Create: Add a new recipe to the database
router.post('/', async (req, res) => {
  try {
    let ingredientIds = [];

    if (req.body.newIngredients && req.body.newIngredients.length > 0) {
      for (let ingredientName of req.body.newIngredients) {
        if (ingredientName.trim()) {
          const newIngredient = new Ingredient({
            name: ingredientName.trim(),
            owner: req.session.user._id
          });
          const savedIngredient = await newIngredient.save();
          ingredientIds.push(savedIngredient._id);
        }
      }
    }

    if (req.body.ingredients) {
      ingredientIds = ingredientIds.concat(req.body.ingredients);
    }

    const newRecipe = new Recipe({
      name: req.body.name,
      instructions: req.body.instructions,
      ingredients: ingredientIds,
      owner: req.session.user._id,
    });

    await newRecipe.save();
    res.redirect('/recipes?success=true');
  } catch (err) {
    console.log(err);
    res.redirect('/recipes/new');
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

// Edit: Show form to edit a recipe
router.get('/:recipeId/edit', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId).populate('ingredients');
    if (recipe && recipe.owner.equals(req.session.user._id)) {
      const ingredients = await Ingredient.find({ owner: req.session.user._id });
      res.render('recipes/edit.ejs', { recipe, ingredients });
    } else {
      res.redirect('/recipes'); 
    }
  } catch (err) {
    console.log(err);
    res.redirect('/recipes');
  }
});

// Update: Update the recipe in the database
router.put('/:recipeId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);

    if (recipe && recipe.owner.equals(req.session.user._id)) {
      recipe.name = req.body.name;
      recipe.instructions = req.body.instructions;

      let ingredientIds = [];

      if (req.body.newIngredients && req.body.newIngredients.length > 0) {
        for (let ingredientName of req.body.newIngredients) {
          if (ingredientName.trim()) {
            let newIngredient = await Ingredient.findOne({
              name: ingredientName.trim(),
              owner: req.session.user._id
            });
            if (!newIngredient) {
              newIngredient = new Ingredient({
                name: ingredientName.trim(),
                owner: req.session.user._id
              });
              await newIngredient.save();
            }
            ingredientIds.push(newIngredient._id);
          }
        }
      }

      if (req.body.ingredients) {
        ingredientIds = ingredientIds.concat(req.body.ingredients);
      }

      recipe.ingredients = ingredientIds;

      await recipe.save();
      res.redirect(`/recipes/${recipe._id}?success=true`);
    } else {
      res.redirect('/recipes');
    }
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

// Delete: Delete a recipe from the database
router.delete('/:recipeId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (recipe && recipe.owner.equals(req.session.user._id)) {
      await Recipe.deleteOne({ _id: req.params.recipeId });
      res.redirect('/recipes');
    } else {
      res.redirect('/recipes');
    }
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

module.exports = router;
