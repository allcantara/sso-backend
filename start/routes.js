// @ts-nocheck
'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post('/user', 'UserController.create');
Route.post('/login', 'UserController.login');
Route.post('/approved', 'UserController.approvedUser').middleware(["auth"]);
Route.post('/approved-admin', 'UserController.approvedAdmin').middleware(["auth"]);
Route.put('/update/:id', 'UserController.updateUser').middleware(["auth"]);
Route.delete('/destroy/:id', 'UserController.destroy').middleware(["auth"]);

Route.get('/list', 'UserController.index').middleware(["auth"]);
Route.get('/list-admin', 'UserController.indexAdmin').middleware(["auth"]);
Route.get('/list-no-admin', 'UserController.indexNoAdmin').middleware(["auth"]);
Route.get('/show/:id', 'UserController.showUser').middleware(["auth"]);
