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
Route.post('/user/approved', 'UserController.approvedUser').middleware(["auth"]);
Route.post('/user/approved/admin', 'UserController.approvedAdmin').middleware(["auth"]);
Route.post('/user/logged', 'UserAuthController.loggedUser').middleware(['auth']);
Route.put('/user/update/:id', 'UserController.updateUser').middleware(["auth"]);
Route.delete('/user/delete/:id', 'UserController.destroy').middleware(["auth"]);

Route.resource('/module', 'ModuloController').apiOnly().middleware(["auth"])
Route.post('/module/url', 'ModuloController.showModuleUrl')
Route.post('/module/secret/new', 'ModuloController.updateModuleSecret').middleware(["auth"]);

Route.get('/user/list', 'UserController.index').middleware(["auth"]);
Route.get('/user/list/admin', 'UserController.indexAdmin').middleware(["auth"]);
Route.get('/user/list/common', 'UserController.indexNoAdmin').middleware(["auth"]);
Route.get('/user/show/:id', 'UserController.showUser').middleware(["auth"]);
