// @ts-nocheck
'use strict'

const { validateAll } = use('Validator');
const User = use('App/Models/User')
const Modulo = use('App/Models/Modulo')
const Database = use('Database');

const erroMessages = {
  'name.required': 'O nome do módulo é obrigatório!',
  'url.required': 'A url do módulo é obrigatória!',
  'url.unique': 'Esta url já está vinculada a um módulo!',
  'user_id.required': 'O usuário é obrigatório!',
}

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with modulos
 */
class ModuloController {
  /**
   * Show a list of all modulos.
   * GET modulos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, auth }) {
    try {
      const { id } = auth.user
      const userAdmin = await Database.select('admin').from('users').where('id', id).first();
      if(userAdmin && userAdmin.admin) {
        const data = await Database.select('*').from('modulos');
        return data;
      } else {
        return response.status(203).send({ message: 'Você não tem permissão para visualizar os módulos!' })
      }
    } catch(err) {
      console.log(err)
      return response.status(500).send({
        message: 'Falha ao listar os módulos!',
        error: err
      })
    }
  }

  /**
   * Create/save a new modulo.
   * POST modulos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, auth }) {
    try {
      const { id } = auth.user;
      const userAdmin = await User.query().where('id', id).first();
      if(userAdmin && userAdmin.admin) {
        const validation = await validateAll(request.all(), {
          user_id: 'required',
          name: 'required',
          url: 'required|unique:modulos'
        }, erroMessages);

        if(!validation.fails()) {
          const data = request.all();
          const user = await User.query().where('id', data.user_id).first();
          if(user) {
            const res = await user.modulos().create(data);
            return res;
          } else {
            return response.status(203).send({ message: 'Este usuário não existe!' })
          }
        } else {
          console.log(validation.messages())
          return response.status(203).send({ message:  validation.messages() })
        }
      } else {
        return response.status(203).send({ message: 'Você não tem permissão para criar um módulo!' })
      }

    } catch(err) {
      console.log(err)
      return response.status(500).send({
        message: 'Falha ao criar o módulo.',
        error: err
      })
    }
  }

  /**
   * Display a single modulo.
   * GET modulos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, auth }) {
    try {
      const { id } = auth.user;
      const userAdmin = await Database.select('id', 'admin').from('users').where('id', id).first()
      if(userAdmin && userAdmin.admin) {
        const modulo = await Modulo.query().where('id', params.id).first();
        if(modulo) {
          const usuario = await Database.select('id', 'username', 'email', 'approved')
          .from('users').where('id', modulo.user_id).first()
          return { modulo, user: usuario};
        } else {
          return response.status(203).send({ message: 'Este módulo não existe!' })
        }
      } else {
        return response.status(203).send({ message: 'Você não tem permissão para buscar este módulo!' })
      }

    } catch(err) {
      console.log(err)
      return response.status(500).send({
        message: 'Falha ao buscar o módulo!',
        error: err
      })
    }
  }

  /**
   * Update modulo details.
   * PUT or PATCH modulos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, auth }) {
    try {
      const { id } = auth.user;
      const userAdmin = await Database.select('id', 'admin').from('users').where('id', id).first()
      if(userAdmin && userAdmin.admin) {
        const { user_id, name, url } = request.all()
        if( user_id ) return response.status(203).send({ message: 'O usuário não pode ser alterado!' });
        const modulo = await Modulo.query().where('id', params.id).first();
        console.log(modulo)
        if(modulo) {
          if(name !== modulo.name) modulo.name = name;
          if(url !== modulo.url) modulo.url = url;
          await modulo.save();
          return modulo;
        } else {
          return response.status(203).send({ message: 'Este módulo não existe!' })      
        }
      } else {
        return response.status(203).send({ message: 'Você não tem permissão alterar este módulo!' })
      }
    } catch(err) {
      return response.status(500).send({ 
        message: 'Falha ao alterar o módulo!',
        error: err
      })
    }
  }

  /**
   * Delete a modulo with id.
   * DELETE modulos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response, auth }) {
    try {
      const { id } = auth.user;
      const userAdmin = await Database.select('id', 'admin').from('users').where('id', id).first()
      if(userAdmin && userAdmin.admin) {
        const modulo = await Modulo.query().where('id', params.id).first();
        if(modulo) {
          await modulo.delete();
          return response.status(200).send({ message:'Registro excluído com sucesso!' })
        } else {
          return response.status(203).send({ message: 'Este módulo não existe!' })      
        }
      } else {
        return response.status(203).send({ message: 'Você não tem permissão para buscar este módulo!' })
      }
    } catch(err) {
      return response.status(500).send({ 
        message: 'Falha ao deletar o módulo!',
        error: err
      })
    }
  }

  async showModuleUrl({ request, response }) {
    try {
      const { url } = request.all();
      if(!url) return response.status(203).send({ message: 'A url é obrigatória!' });
      const data = await Database.select('id', 'user_id', 'name', 'url').from('modulos').where('url', url).first();
      if(data) {
        return data;
      } else {
        return response.status(203).send({ message: 'O módulo da sua aplicação não está cadastrado!' });
      }
    } catch(err) {
      return response.status(500).send({ message: 'Falha ao buscar módulo pela url!', error: err });
    }
  }
}

module.exports = ModuloController
