// @ts-nocheck
'use strict'

const { validateAll } = use('Validator');
const User = use('App/Models/User')
const Modulo = use('App/Models/Modulo')
const Database = use('Database');
const Encryption = use('Encryption')

const erroMessages = {
  'name.required': 'O nome do módulo é obrigatório!',
  'url.required': 'A url do módulo é obrigatória!',
  'user_id.required': 'O usuário é obrigatório!',
  'url.unique': 'Este módulo já existe!'
}

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with modulos
 */
class ModuloController {
  /**
   * Listar todos os módulos
   * GET modulos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, auth }) {
    try {
      const userAdmin = await auth.getUser()
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
   * Criar um novo módulo
   * POST modulos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, auth }) {
    try {
      const userAdmin = await auth.getUser()
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

            const [min, max] = [1, 100];
            let numeros = Array(8).fill(0);
          
            for(let i = 0; i < numeros.length; i++) {
              let novo = 0;
              while(numeros.includes(novo)) {
                novo = Math.floor(Math.random() * (max - min + 1)) + min;
              }
              numeros[i] = novo;
            }
          
            numeros.sort((a, b) => a - b);
            let module_secret = Encryption.encrypt(numeros.join(''));

            data.module_secret = module_secret;
            data.user_id = user.id;
            
            const res = await Modulo.create(data);

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
   * Buscar um módulo
   * GET modulos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, auth }) {
    try {
      const userAdmin = await auth.getUser();
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
   * Atualizar/alterar um módulo
   * PUT or PATCH modulos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, auth }) {
    try {
      const userAdmin = await auth.getUser();
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
   * Deletar um módulo
   * DELETE modulos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response, auth }) {
    try {
      const userAdmin = await auth.getUser();
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


}

module.exports = ModuloController
