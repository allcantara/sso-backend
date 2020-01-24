// @ts-nocheck
'use strict'

const User = use('App/Models/User');
const Database = use('Database');

class UserAdminController {

  /**
   * 
   * Aprovar usuário administrador
   */
  async approvedAdmin({ request, response, auth }) {
    try{
      const userAdmin = await auth.getUser()
      const { email, admin } = request.all();
      if(!email) return response.status(203).send({ message: 'O e-mail do usuário é obrigatório!' });
      if(userAdmin && userAdmin.admin) {
        const data = await User.query().where('email', email).first();
        if(data) {
          if(data.approved) {
            data.admin = admin;
            await data.save()
            return data;
          } else {
            return response.status(203).send({ message: 'Este usuário ainda não foi aprovado!' })
          }
        } else {
          return response.status(203).send({ message: 'Este usuário não existe!' })
        }
      } else {
        return response.status(203).send({ message: 'Você não pode aprovar este usuário!' });
      }
    } catch (e) {
      console.log(e)
      return response.status(500).send({ message: 'Falha ao aprovar usuário!', error: e });
    }
  }



  /**
   * 
   * Buscar usuários administradores
   */
  async indexAdmin({ request, response, auth }) {
    try {
      const userAdmin = await auth.getUser()
      if(userAdmin && userAdmin.admin) {
        const data = await Database.select('id', 'username', 'email', 'path_image', 'approved', 'admin').from('users').where('admin', true);
        return data;
      } else {
        return response.status(203).send({ message: 'Acesso negado!' });
      }
    } catch(err) {
      console.log(err)
      return response.status(500).send({
        message: 'Falha ao listar os usuários!',
        error: err
      });
    }
  }



  /**
   * 
   * Buscar usuários não administradores 
   */
  async indexNoAdmin({ request, response, auth }) {
    try {
      const userAdmin = await auth.getUser();
      if(userAdmin && userAdmin.admin) {
        const data = await Database.select('id', 'username', 'email', 'path_image', 'approved', 'admin').from('users').where('admin', false);
        return data;
      } else {
        return response.status(203).send({ message: 'Acesso negado!' });
      }
    } catch(err) {
      console.log(err)
      return response.status(500).send({
        message: 'Falha ao listar os usuários!',
        error: err
      });
    }
  }




}

module.exports = UserAdminController
