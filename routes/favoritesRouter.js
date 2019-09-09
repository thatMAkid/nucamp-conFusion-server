const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoritesRouter = express.Router();

favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Favorites.findOne({ 'user': req.user._id })
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    for (var i = 0; i < req.body.length; i++) {
                        if (favorite.dishes.indexOf(req.body[i]._id) === -1) {
                            favorite.push(req.body[i]._id);
                        }
                    }
                    favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                }

                else {
                    Favorites.create({ 'dishes': req.body, 'user': req.user._id })
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOneAndRemove({ 'user': req.user._id })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

favoritesRouter.route('/:favoritesId')
    .options(cors.cors, authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /favorites/ ' + req.params.favoritesId);
    })
    .put(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /favorites/ ' + req.params.favoriteId);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    if (favorite.dishes.indexOf(req.params.dishId) === -1) {
                        favorite.dishes.push(req.params.dishId)
                        favorite.save()
                            .then((favorite) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            }, (err) => next(err))
                    }
                    else {
                        var err = new Error('Dish is already favorited');
                        err.status = 403;
                        return next();
                    }
                }
                else {
                    Favorites.create({ dishes: req.body, user: req.user._id })
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                if (favorites) {
                    var index = favorites.dishes.indexOf(req.params.dishId);
                    if (index >= 0) {
                        favorites.dishes.splice(index, 1);
                    }
                    favorites.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('dishes')
                                .then((favorite) => {
                                    console.log('Favorite Dish Deleted!', favorite);
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        }).catch(err => next(err));
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                }
            }).catch(err => next(err))
    });

module.exports = favoriteRouter; 