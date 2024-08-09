const express = require('express');
const router = express.Router();
const Ingredient = require('../models/ingredient.js');

// Index: Show all ingredients
router.get('/', async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.render('ingredients/index.ejs', { ingredients });
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

// New: Show form to create a new ingredient
router.get('/new', (req, res) => {
  res.render('ingredients/new.ejs');
});

// Create: Add a new ingredient to the database
router.post('/', async (req, res) => {
  try {
    await Ingredient.create(req.body);
    res.redirect('/ingredients');
  } catch (err) {
    console.log(err);
    res.redirect('/ingredients/new');
  }
});

// Show: Show details of one ingredient
router.get('/:ingredientId', async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.ingredientId);
    res.render('ingredients/show.ejs', { ingredient });
  } catch (err) {
    console.log(err);
    res.redirect('/ingredients');
  }
});

// Edit: Show form to edit an ingredient
router.get('/:ingredientId/edit', async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.ingredientId);
    res.render('ingredients/edit.ejs', { ingredient });
  } catch (err) {
    console.log(err);
    res.redirect('/ingredients');
  }
});

// Update: Update the ingredient in the database
router.put('/:ingredientId', async (req, res) => {
  try {
    await Ingredient.findByIdAndUpdate(req.params.ingredientId, req.body);
    res.redirect(`/ingredients/${req.params.ingredientId}`);
  } catch (err) {
    console.log(err);
    res.redirect('/ingredients');
  }
});

// Delete: Delete an ingredient from the database
router.delete('/:ingredientId', async (req, res) => {
  try {
    await Ingredient.findByIdAndDelete(req.params.ingredientId);
    res.redirect('/ingredients');
  } catch (err) {
    console.log(err);
    res.redirect('/ingredients');
  }
});

module.exports = router;
