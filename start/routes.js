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

/**
 * 
 * ROTAS PARA CRUD DE USUÁRIO
 */
Route.post('/user', 'UserController.create');
Route.put('/user/update/:id', 'UserController.update').middleware(["auth"]);
Route.get('/user/list', 'UserController.index').middleware(["auth"]);
Route.get('/user/show/:id', 'UserController.show').middleware(["auth"]);
Route.delete('/user/delete/:id', 'UserController.destroy').middleware(["auth"]);

/**
 * 
 * ROTA PARA APROVAÇÃO DE UM USUÁRIO NO SISTEMA
 */
Route.post('/user/approved', 'UserController.approvedUser').middleware(["auth"]);

/**
 * 
 * ROTAS PARA AUTENTICAÇÃO DE USUÁRIO
 */
Route.post('/login', 'UserAuthController.login');
Route.post('/logout', 'UserAuthController.logout').middleware(["auth"]);
Route.get('/user/logged', 'UserAuthController.loggedUser').middleware(["auth"]);

/**
 * 
 * ROTA PARA CRUD DE MÓDULO
 */
Route.resource('/module', 'ModuloController').apiOnly().middleware(["auth"]);

/**
 * 
 * ROTAS PARA RENOVAR MODULE_SECRET E BUSCAR MÓDULO
 */
Route.post('/module/url', 'ModuleUtilController.showModuleUrl');
Route.post('/module/secret/new', 'ModuleUtilController.updateModuleSecret').middleware(["auth"]);

/**
 * 
 * ROTAS PARA APROVAR USUÁRIO ADMIN E BUSCAS DE ADMIN E NOT-ADMIN
 */
Route.post('/user/approved/admin', 'UserAdminController.approvedAdmin').middleware(["auth"]);
Route.get('/user/list/admin', 'UserAdminController.indexAdmin').middleware(["auth"]);
Route.get('/user/list/common', 'UserAdminController.indexNoAdmin').middleware(["auth"]);

/**
 * 
 * ROTA PARA VINCULAR USUÁRIO EM UM MÓDULO
 */
// Route.post('/user/module', 'UserModuleController.vinculeModuleUser').middleware(["auth"]);
